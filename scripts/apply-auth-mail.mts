import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { authMailPayload, projectRefFromUrl } from "../lib/mail/auth-config.ts";

function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  let raw = "";
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function required(env: Record<string, string>, key: string): string {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${key}. Add it to .env.local. See docs/provider-research/resend.md.`,
    );
  }
  return value;
}

async function main() {
  const env: Record<string, string> = {
    ...loadEnv(resolve(".env")),
    ...loadEnv(resolve(".env.local")),
  };
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && env[key] === undefined) {
      env[key] = value;
    }
  }

  const url = required(env, "NEXT_PUBLIC_SUPABASE_URL");
  const ref = projectRefFromUrl(url);
  if (!ref) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL has no project ref.");
  }

  const token = required(env, "SUPABASE_ACCESS_TOKEN");
  const payload = authMailPayload({
    from: required(env, "MAIL_FROM"),
    fromName: env.MAIL_FROM_NAME?.trim() || "100 a Day",
    apiKey: required(env, "RESEND_API_KEY"),
  });

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Auth config update failed (${response.status}): ${text}`,
    );
  }

  console.log(`Auth SMTP + templates applied for project ${ref}.`);
  console.log("From:", payload.smtp_admin_email);
  console.log("Sender name:", payload.smtp_sender_name);
  console.log("Host:", payload.smtp_host);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
