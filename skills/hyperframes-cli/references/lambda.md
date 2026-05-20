# lambda — Cloud Rendering on AWS Lambda

Deploy HyperFrames distributed rendering to AWS Lambda and drive renders from your laptop or CI. Wraps `@hyperframes/aws-lambda` SDK plus AWS SAM. End-to-end is three commands:

```bash
npx hyperframes lambda deploy
npx hyperframes lambda render ./my-project --width 1920 --height 1080 --wait
npx hyperframes lambda destroy
```

## When to Use Lambda vs Local Render

- **Local `render`** — dev-loop iteration, single host, anything under a few minutes at 1080p.
- **`lambda render`** — long videos, 4K, large parallel batches, or anything where local Chrome would time out / exhaust RAM. Pay-per-invocation, no idle cost.

For one-off short renders Lambda is not worth the deploy overhead.

## Prerequisites

- AWS credentials configured (env vars, `~/.aws/credentials`, SSO, or IMDS).
- AWS SAM CLI on `PATH`.
- `bun` on `PATH` (builds the Lambda handler ZIP).

## Subcommands

### deploy

```bash
npx hyperframes lambda deploy \
  --stack-name=hyperframes-prod \
  --region=us-east-1 \
  --concurrency=8 \
  --memory=10240
```

Builds `packages/aws-lambda/dist/handler.zip` and SAM-deploys the stack (Lambda + Step Functions + S3 + IAM). Idempotent — re-running on the same `--stack-name` is a no-op when nothing changed. Writes `<cwd>/.hyperframes/lambda-stack-<name>.json` so later subcommands don't need to call `describe-stacks`.

| Flag            | Default                         | Description                   |
| --------------- | ------------------------------- | ----------------------------- |
| `--stack-name`  | `hyperframes-default`           | CloudFormation stack name     |
| `--region`      | `AWS_REGION` env or `us-east-1` | AWS region                    |
| `--profile`     | `AWS_PROFILE` env               | Named AWS credentials profile |
| `--concurrency` | `8`                             | Lambda reserved concurrency   |
| `--memory`      | `10240`                         | Lambda memory in MB           |
| `--skip-build`  | off                             | Reuse existing `handler.zip`  |

### sites create

```bash
npx hyperframes lambda sites create ./my-project
# → siteId: abc1234deadbeef0  (stable across re-runs of the same tree)

npx hyperframes lambda render ./my-project --site-id=abc1234deadbeef0 ...
```

Tars + uploads `<projectDir>` to S3 with a content-addressed key. Returns a stable `siteId` you can reuse — re-renders of the same tree skip the upload.

### render

```bash
npx hyperframes lambda render ./my-project \
  --width 1920 --height 1080 --fps 30 --format mp4 \
  --chunk-size 240 --max-parallel-chunks 16 \
  --wait
```

Starts a Step Functions execution. Returns immediately with a `renderId` unless `--wait` is set, in which case the CLI blocks until completion and streams per-chunk progress lines. Add `--json` for machine-parseable output.

For **personalised single renders**, pair the project's `data-composition-variables` declaration (see `/hyperframes-core` → variables-and-media) with `--variables` / `--variables-file`. To fan out N personalised renders in one call, use `render-batch` below.

| Flag                    | Description                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `--width` / `--height`  | Output dimensions in pixels                                                                                             |
| `--fps`                 | `24` / `30` / `60`                                                                                                      |
| `--format`              | `mp4` / `mov` / `webm` / `png-sequence` (default `mp4`; `webm` uses closed-GOP VP9 + concat-copy)                       |
| `--codec`               | `h264` / `h265` (mp4 only)                                                                                              |
| `--quality`             | `draft` / `standard` / `high`                                                                                           |
| `--chunk-size`          | Frames per chunk (default `240`)                                                                                        |
| `--max-parallel-chunks` | Max concurrent chunks (default `16`)                                                                                    |
| `--site-id`             | Reuse an existing site (skip upload)                                                                                    |
| `--variables`           | Inline JSON object of variable overrides, e.g. `'{"title":"Hi Alice","accentColor":"#ff0000"}'`                         |
| `--variables-file`      | Path to a JSON file of overrides (mutually exclusive with `--variables`)                                                |
| `--strict-variables`    | Fail the render on undeclared keys or type mismatches against `data-composition-variables` (default: warn and continue) |
| `--output-key`          | S3 key for the final artifact (default: `renders/<renderId>.<ext>`)                                                     |
| `--wait`                | Block until completion, stream progress                                                                                 |
| `--json`                | Machine-parseable progress snapshot                                                                                     |

Variables travel inside the Step Functions execution input, which AWS caps at **256 KiB for the entire payload** (Standard workflows). The SDK validates client-side and rejects oversize inputs with a clear error before any AWS call. Pass typed primitives only — for media (images, audio, video) put a URL into the variable and let the composition fetch it at render time, not a base64 blob.

### render-batch

```bash
npx hyperframes lambda render-batch ./my-template \
  --batch ./users.jsonl \
  --width 1920 --height 1080 \
  --max-concurrent 5
```

Dispatches N personalised renders from a JSONL batch file in one CLI call. Deploys the site once (or reuses `--site-id`), then issues `StartExecution` per row, capped at `--max-concurrent` simultaneous starts. Returns a manifest with one line per input row mapping it to its `executionArn` / `renderId`. **Does not block** for completion — poll each `executionArn` with `progress` to track finishes.

Each JSONL line is one render. `outputKey` is the S3 key for that render's final artifact; `variables` is the per-entry override object merged onto the composition's declared defaults:

```jsonl
{"outputKey": "renders/alice.mp4", "variables": {"title": "Hi Alice", "accentColor": "#ff0000"}}
{"outputKey": "renders/bob.mp4",   "variables": {"title": "Hi Bob",   "accentColor": "#00aa00"}}
```

| Flag                                                                                                               | Description                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--batch`                                                                                                          | Path to JSONL file with one `{outputKey, variables}` entry per render                                                                                     |
| `--max-concurrent`                                                                                                 | Max simultaneous `StartExecution` calls (default `50`)                                                                                                    |
| `--site-id`                                                                                                        | Reuse a pre-staged site (skip the up-front upload)                                                                                                        |
| `--strict-variables`                                                                                               | Apply per-entry strict validation; one failing row does not stop the batch — it's reported as `failed-to-start` in the manifest                           |
| `--dry-run`                                                                                                        | Validate the batch file (parse, variables shape, payload size against the 256 KiB cap) without invoking — each row becomes `would-invoke` in the manifest |
| `--json`                                                                                                           | Emit the manifest as JSON instead of the human-readable table (pipe to `jq` for downstream coordination)                                                  |
| `--width` / `--height` / `--fps` / `--format` / `--codec` / `--quality` / `--chunk-size` / `--max-parallel-chunks` | Same semantics as `render`; applied uniformly to every row                                                                                                |

`render-batch` does **not** accept `--variables` or `--variables-file` — per-entry variable payloads are the whole point of the verb, and live in the JSONL file. To render a single personalised video, use `render --variables` instead.

The batch verb's `--max-concurrent` is orchestrator-side (caps `StartExecution`s in flight) and is distinct from `lambda deploy --concurrency`, which caps how many chunk Lambdas the render function can run in parallel. Useful starting guideline for large batches: `--max-concurrent ≈ floor(reservedConcurrency / maxParallelChunks)` so each running render gets its full chunk fan-out budget.

### progress

```bash
npx hyperframes lambda progress hf-render-abcd1234
npx hyperframes lambda progress arn:aws:states:us-east-1:...:execution:...
```

Prints one snapshot — overall percent, frames rendered, Lambda invocations, accrued cost, and any errors. Accepts a bare `renderId` (resolved against the stack's state-machine ARN) or a full SFN execution ARN.

### destroy

```bash
npx hyperframes lambda destroy
```

Calls `sam delete --no-prompts` and drops the local state file. **The render S3 bucket is configured `Retain`** so it survives stack destruction — empty + delete it via the AWS console / CLI if you want the storage back.

### policies

Print or validate the minimum IAM permissions the CLI needs.

```bash
npx hyperframes lambda policies user                                  # inline policy for an IAM user
npx hyperframes lambda policies role --principal=cloudformation       # { TrustRelationship, InlinePolicy }
npx hyperframes lambda policies validate ./infra/iam/hf-deploy.json   # CI gate
```

`validate` reads a JSON policy doc and checks the union of its `Effect: Allow` actions (expanding `s3:*` / `s3:Get*` / `*` wildcards) against the CLI's required action set. Missing actions print to stderr; the command exits non-zero. Wire it into CI to catch policy drift before the next deploy fails.

The default action set is deliberately broad (`Resource: "*"`) because CloudFormation creates new ARNs on every adopter's first deploy. Tighten `Resource` after that first run if security posture requires it.

## State Files

`hyperframes lambda` stores per-stack metadata under `<cwd>/.hyperframes/lambda-stack-<name>.json` (bucket name, state-machine ARN, region). Not secret, but AWS-account-identifying. Commit it to a repo or `.gitignore` it per your workflow.

## Cost and Cleanup

- `lambda destroy` removes the SAM stack but **leaves the S3 bucket** (`Retain`). Delete it manually if you want the storage back.
- Lambda billing is per-invocation + duration. `progress` reports the accrued cost.
- `--concurrency` caps parallel Lambda invocations — keep it aligned with your account quota.
- `--chunk-size` and `--max-parallel-chunks` trade off per-chunk overhead against parallelism; larger chunks reduce coordinator overhead, smaller chunks parallelize more aggressively.
