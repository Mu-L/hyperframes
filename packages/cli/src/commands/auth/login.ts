/**
 * `hyperframes auth login` — sign in to HeyGen.
 *
 * Default: OAuth 2.0 + PKCE via a loopback callback. The CLI opens
 * the user's browser, captures the authorization code on an
 * ephemeral 127.0.0.1 port, exchanges it for tokens, and persists
 * them to `~/.heygen/credentials`.
 *
 * `--api-key`: opts into the legacy long-lived API-key path.
 *
 * Write semantics:
 *   - Snapshot existing credentials first; merge so a new
 *     OAuth session preserves an existing API key (and vice versa).
 *   - Validate the new API key looks like `hg_…` before writing.
 *   - Verify via `GET /v3/users/me`. On 401, roll back. Network/5xx
 *     errors keep the new credential in place per the transient-blip
 *     rationale.
 */

import { defineCommand } from "citty";
import { stdin as input } from "node:process";
import {
  AuthClient,
  assertOAuthConfiguredOrExit,
  deleteStore,
  isAuthError,
  isHeaderSafe,
  readStore,
  refreshTokens,
  startAuthorizationCodeFlow,
  tryResolveCredential,
  writeStore,
  type Credentials,
} from "../../auth/index.js";
import { c } from "../../ui/colors.js";

const API_KEY_SHAPE = /^hg_[A-Za-z0-9_-]{5,}$/;
const STDIN_TIMEOUT_MS = 30_000;

export default defineCommand({
  meta: {
    name: "login",
    description: "Sign in to HeyGen (OAuth by default; --api-key for long-lived keys)",
  },
  args: {
    "api-key": {
      type: "string",
      description: "API key value, or pass `--api-key` with no value to read from stdin / prompt.",
    },
  },
  // fallow-ignore-next-line complexity
  async run({ args }) {
    const inlineKey = args["api-key"];
    if (inlineKey !== undefined) {
      await runApiKeyLogin(inlineKey);
      return;
    }
    await runOAuthLogin();
  },
});

// fallow-ignore-next-line complexity
async function runOAuthLogin(): Promise<void> {
  assertOAuthConfiguredOrExit();

  try {
    await startAuthorizationCodeFlow();
  } catch (err) {
    console.error(c.error(`Sign-in failed: ${(err as Error).message}`));
    process.exit(1);
  }

  await reportIdentity();
}

// fallow-ignore-next-line complexity
async function reportIdentity(): Promise<void> {
  const credential = await tryResolveCredential();
  if (!credential) {
    console.error(c.warn("Sign-in completed but no credential was persisted."));
    process.exit(1);
  }
  // Wire the refresh hook here too — a freshly-minted token shouldn't
  // need it, but a fast IdP-side rotation (or a misconfigured short
  // TTL) shouldn't punish the user with a hard failure when the
  // refresh_token would have transparently fixed it.
  const client = new AuthClient({
    onUnauthenticatedRefresh: async (rt) => (await refreshTokens(rt)).access_token,
  });
  try {
    const user = await client.getCurrentUser(credential);
    const identity = user.email ?? user.username ?? "(unknown user)";
    console.log(c.success(`✓ Signed in as ${identity}.`));
  } catch (err) {
    // Don't roll back — the OAuth tokens are valid on disk; this is a
    // transient verify-side issue. Surface as a warning so the user
    // can re-check with `auth status` rather than re-running login.
    console.error(
      c.warn(`Signed in. Identity check failed (transient): ${(err as Error).message}`),
    );
  }
}

// fallow-ignore-next-line complexity
async function runApiKeyLogin(inlineKey: string): Promise<void> {
  const key = await collectApiKey(inlineKey);
  if (!key) {
    console.error(c.error("No API key provided."));
    process.exit(1);
  }
  if (!API_KEY_SHAPE.test(key) || !isHeaderSafe(key)) {
    console.error(
      c.error("That doesn't look like a HeyGen API key — expected `hg_…` (URL-safe chars only)."),
    );
    process.exit(1);
  }

  const previous = await snapshotStore();
  const next: Credentials = { ...previous, api_key: key };
  await writeStore(next);

  const verifyOk = await verifyAndReport(key);
  if (!verifyOk) {
    await rollback(previous);
    process.exit(1);
  }
}

async function snapshotStore(): Promise<Credentials> {
  try {
    const { credentials } = await readStore();
    return { ...credentials };
  } catch {
    return {};
  }
}

async function rollback(previous: Credentials): Promise<void> {
  try {
    if (previous.api_key || previous.oauth) {
      await writeStore(previous);
      console.error(c.dim("Rolled back to the previous credential."));
    } else {
      // No prior credential — restore true absence. Leaving the
      // rejected key on disk would make the next `auth status` /
      // command silently resolve a known-bad key.
      await deleteStore();
      console.error(c.dim("Removed the rejected credential."));
    }
  } catch (err) {
    console.error(c.error(`Failed to roll back: ${(err as Error).message}`));
  }
}

// fallow-ignore-next-line complexity
async function verifyAndReport(key: string): Promise<boolean> {
  const client = new AuthClient();
  try {
    const user = await client.getCurrentUser({ type: "api_key", key, source: "file_json" });
    const identity = user.email ?? user.username ?? "(unknown user)";
    console.log(c.success(`✓ API key saved. Authenticated as ${identity}.`));
    return true;
  } catch (err) {
    if (isAuthError(err) && err.code === "UNAUTHENTICATED") {
      console.error(
        `${c.warn("HeyGen rejected the API key.")}\n` +
          `  ${c.dim(err.message)}\n` +
          `Run ${c.accent("hyperframes auth login --api-key")} again with a valid key.`,
      );
      return false;
    }
    throw err;
  }
}

async function collectApiKey(inline: string): Promise<string> {
  if (inline.length > 0) return inline.trim();
  if (!input.isTTY) {
    return (await readAllWithTimeout(input, STDIN_TIMEOUT_MS)).trim();
  }
  return await promptForKey();
}

async function readAllWithTimeout(
  stream: NodeJS.ReadableStream,
  timeoutMs: number,
): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for stdin (${timeoutMs}ms). Pipe the key explicitly.`));
    }, timeoutMs);
    stream.on("data", (chunk: Buffer | string) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    });
    stream.on("end", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    stream.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function promptForKey(): Promise<string> {
  const clack = await import("@clack/prompts");
  const value = await clack.password({
    message: "Enter HeyGen API key",
    validate: (v) =>
      v && API_KEY_SHAPE.test(v) ? undefined : "Expected `hg_…` (URL-safe chars only)",
  });
  if (clack.isCancel(value)) {
    console.error("Aborted.");
    process.exit(1);
  }
  return value.trim();
}
