import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { projectRefFromUrl } from "../lib/mail/auth-config.ts";

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
    throw new Error(`Missing ${key}. Add it to .env.local.`);
  }
  return value;
}

async function postSql(
  url: string,
  token: string,
  body: unknown,
): Promise<{ status: number; text: string }> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, text: await response.text() };
}

function alreadyApplied(status: number, text: string): boolean {
  return (
    status === 409 ||
    /already exists|duplicate|been applied/i.test(text)
  );
}

async function main() {
  const env: Record<string, string> = {
    ...loadEnv(resolve(".env")),
    ...loadEnv(resolve(".env.local")),
  };
  const supabaseUrl = required(env, "NEXT_PUBLIC_SUPABASE_URL");
  const ref = projectRefFromUrl(supabaseUrl);
  if (!ref) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL has no project ref.");
  }
  const token = required(env, "SUPABASE_ACCESS_TOKEN");
  const dir = resolve("supabase/migrations");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const migrationUrl = `https://api.supabase.com/v1/projects/${ref}/database/migrations`;
  const queryUrl = `https://api.supabase.com/v1/projects/${ref}/database/query`;

  for (const file of files) {
    const query = readFileSync(resolve(dir, file), "utf8");
    const name = file.replace(/\.sql$/, "");
    const applied = await postSql(migrationUrl, token, { name, query });
    if (applied.status >= 200 && applied.status < 300) {
      console.log(`Applied ${file} (migrations API).`);
      continue;
    }
    if (alreadyApplied(applied.status, applied.text)) {
      console.log(`Skip ${file} (already applied).`);
      continue;
    }
    const fallback = await postSql(queryUrl, token, { query });
    if (fallback.status >= 200 && fallback.status < 300) {
      console.log(`Applied ${file} (query API).`);
      continue;
    }
    if (alreadyApplied(fallback.status, fallback.text)) {
      console.log(`Skip ${file} (already applied).`);
      continue;
    }
    console.error(
      `${file} failed.\nmigrations ${applied.status}: ${applied.text.slice(0, 400)}\nquery ${fallback.status}: ${fallback.text.slice(0, 400)}`,
    );
    process.exit(1);
  }
}

await main();
