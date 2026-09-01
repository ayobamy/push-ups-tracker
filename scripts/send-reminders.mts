import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sendEveningReminders } from "../lib/mail/send-evening.ts";

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

const env: Record<string, string | undefined> = {
  ...loadEnv(resolve(".env")),
  ...loadEnv(resolve(".env.local")),
  ...process.env,
};

const dryRun = process.argv.includes("--dry-run");
const ignoreHour = process.argv.includes("--ignore-hour");
const originArg = process.argv.find((arg) => arg.startsWith("--origin="));
if (originArg) {
  env.NEXT_PUBLIC_SITE_URL = originArg.slice("--origin=".length);
}

const result = await sendEveningReminders({
  dryRun,
  ignoreHour,
  env,
  log: (line) => console.log(line),
});
console.log(`Reminders considered ${result.considered}, sent ${result.sent}.`);
