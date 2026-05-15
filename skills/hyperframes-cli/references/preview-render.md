# preview, play, render, publish

Serve, render, and share commands.

## preview

```bash
npx hyperframes preview                   # serve current directory
npx hyperframes preview --port 4567       # custom port (default 3002)
```

Hot-reloads on file changes. Opens the studio in your browser automatically.

When handing a project back to the user, use the Studio project URL, not the source `index.html` path:

```text
http://localhost:<port>/#project/<project-name>
```

Use the actual port from the preview output and the project directory name. For example, after `npx hyperframes preview --port 3017` in `codex-openai-video`, report `http://localhost:3017/#project/codex-openai-video`.

Treat `index.html` as source-code context only. It is fine to link as an implementation file, but do not label it as the project or preview surface.

## play (lightweight player)

```bash
npx hyperframes play                  # current project, port 3003
npx hyperframes play ./my-video       # specific project
npx hyperframes play --port 8080      # custom port
```

`play` serves the composition through the embeddable `<hyperframes-player>` web component instead of the full Studio UI. Use it when sharing a preview link or when Studio is heavier than needed (no editor, no panels). Requires `bun run build` to have produced the runtime + player bundles.

## render

```bash
npx hyperframes render                                # standard MP4
npx hyperframes render --output final.mp4             # named output
npx hyperframes render --quality draft                # fast iteration
npx hyperframes render --fps 60 --quality high        # final delivery
npx hyperframes render --format webm                  # transparent WebM
npx hyperframes render --docker                       # byte-identical
```

| Flag                 | Options               | Default                      | Notes                                                              |
| -------------------- | --------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `--output`           | path                  | `renders/name_timestamp.mp4` | Output path                                                        |
| `--fps`              | 24, 30, 60            | 30                           | 60fps doubles render time                                          |
| `--quality`          | draft, standard, high | standard                     | draft for iterating                                                |
| `--format`           | mp4, webm             | mp4                          | WebM supports transparency                                         |
| `--workers`          | 1-8 or auto           | auto                         | Each spawns Chrome                                                 |
| `--docker`           | flag                  | off                          | Reproducible output                                                |
| `--gpu`              | flag                  | off                          | GPU-accelerated encoding                                           |
| `--strict`           | flag                  | off                          | Fail on lint errors                                                |
| `--strict-all`       | flag                  | off                          | Fail on errors AND warnings                                        |
| `--variables`        | JSON object           | —                            | Override variable values declared in `data-composition-variables`  |
| `--variables-file`   | path                  | —                            | JSON file with variable values (alternative to `--variables`)      |
| `--strict-variables` | flag                  | off                          | Fail render on undeclared keys or type mismatches in `--variables` |

**Quality guidance:** `draft` while iterating, `standard` for review, `high` for final delivery.

**Parametrized renders:** the composition declares its variables on the `<html>` root with **`data-composition-variables`** — a JSON **array of declarations** (`{id, type, label, default}` per entry) that defines the schema. Scripts inside read the resolved values via `window.__hyperframes.getVariables()`. The CLI `--variables '{"title":"Q4 Report"}'` is a JSON **object keyed by id** that overrides those declared defaults for one render; missing keys fall through, so the same composition runs unchanged in dev preview and in production. Sub-comp hosts can also override per-instance with `data-variable-values`. See the `hyperframes-core` skill for the full pattern.

## publish

```bash
npx hyperframes publish              # upload current project, return public URL
npx hyperframes publish ./my-video   # specific project
npx hyperframes publish --yes        # skip the confirmation prompt (scripts/CI)
```

Uploads the project's source (HTML + assets) and returns a stable public URL that renders in the browser. Use this for sharing a draft for review before rendering MP4, or for embedding the composition elsewhere. Lint findings are surfaced before upload but do not block.
