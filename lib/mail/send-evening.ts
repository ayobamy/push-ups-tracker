import { parseSiteOrigin } from "@/lib/auth/site-url";
import { projectRefFromUrl } from "@/lib/mail/auth-config";
import {
  pickReminderTargets,
  reminderPayload,
  REMINDER_CANDIDATES_SQL,
  type ReminderCandidate,
} from "@/lib/mail/remind-run";

async function runSql(
  ref: string,
  token: string,
  query: string,
): Promise<unknown> {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`SQL ${response.status}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : [];
}

async function sendResend(input: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
}): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      headers: input.headers,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend ${response.status}: ${text.slice(0, 400)}`);
  }
}

function required(env: Record<string, string>, key: string): string {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(`Missing ${key}.`);
  }
  return value;
}

export async function sendEveningReminders(input: {
  dryRun?: boolean;
  env: Record<string, string | undefined>;
  log?: (line: string) => void;
}): Promise<{ considered: number; sent: number }> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.env)) {
    if (value !== undefined) {
      env[key] = value;
    }
  }
  const supabaseUrl = required(env, "NEXT_PUBLIC_SUPABASE_URL");
  const ref = projectRefFromUrl(supabaseUrl);
  if (!ref) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL has no project ref.");
  }
  const token = required(env, "SUPABASE_ACCESS_TOKEN");
  const apiKey = required(env, "RESEND_API_KEY");
  const fromAddress = required(env, "MAIL_FROM");
  const fromName = env.MAIL_FROM_NAME?.trim() || "100 a Day";
  const origin =
    parseSiteOrigin(env.NEXT_PUBLIC_SITE_URL) ??
    parseSiteOrigin(
      env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000",
    ) ??
    "http://localhost:3000";
  const dryRun = Boolean(input.dryRun);

  const rows = (await runSql(
    ref,
    token,
    REMINDER_CANDIDATES_SQL,
  )) as ReminderCandidate[];
  const list = Array.isArray(rows) ? rows : [];
  const targets = pickReminderTargets(list);
  let sent = 0;

  for (const candidate of targets) {
    const payload = reminderPayload({ candidate, origin });
    const from = `${fromName} <${fromAddress}>`;
    if (dryRun) {
      input.log?.(`dry-run ${payload.subject}`);
      sent += 1;
      continue;
    }
    await sendResend({
      apiKey,
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      headers: payload.headers,
    });
    await runSql(ref, token, payload.recordSql);
    sent += 1;
  }

  return { considered: list.length, sent };
}
