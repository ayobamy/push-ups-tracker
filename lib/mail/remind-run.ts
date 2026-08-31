import { remainingToGoal } from "@/lib/challenge/remaining";
import { reminderCopy, shouldSendEveningReminder } from "@/lib/mail/remind";
import { renderReminderEmail } from "@/lib/mail/remind-render";

export type ReminderCandidate = {
  id: string;
  email: string;
  display_name: string | null;
  timezone: string;
  unsubscribe_token: string;
  reminders_opt_in: boolean;
  daily_goal: number;
  starts_on: string;
  duration_days: number;
  today_reps: number;
  local_date: string;
  local_hour: number;
  already_sent: boolean;
};

export const REMINDER_CANDIDATES_SQL = `
select
  p.id::text,
  u.email,
  p.display_name,
  p.timezone,
  p.unsubscribe_token::text,
  p.reminders_opt_in,
  c.daily_goal,
  c.starts_on::text,
  c.duration_days,
  coalesce(t.total_reps, 0) as today_reps,
  (timezone(p.timezone, now()))::date::text as local_date,
  extract(hour from timezone(p.timezone, now()))::int as local_hour,
  exists (
    select 1 from public.reminder_sends r
    where r.user_id = p.id
      and r.local_date = (timezone(p.timezone, now()))::date
      and r.kind = 'evening'
  ) as already_sent
from public.profiles p
join auth.users u on u.id = p.id
join public.challenge_members m on m.user_id = p.id
join public.challenges c
  on c.id = m.challenge_id and c.slug = 'hundred-2026'
left join public.daily_totals t
  on t.user_id = p.id
 and t.challenge_id = c.id
 and t.local_date = (timezone(p.timezone, now()))::date
where u.email is not null
  and coalesce(p.reminders_opt_in, true) = true;
`;

export function pickReminderTargets(
  rows: ReminderCandidate[],
): ReminderCandidate[] {
  return rows.filter((row) =>
    shouldSendEveningReminder({
      optIn: row.reminders_opt_in,
      alreadySent: row.already_sent,
      localHour: row.local_hour,
      todayReps: row.today_reps,
      goal: row.daily_goal,
      localDate: row.local_date,
      startsOn: row.starts_on,
      durationDays: row.duration_days,
    }),
  );
}

export function reminderPayload(input: {
  candidate: ReminderCandidate;
  origin: string;
}): {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
  recordSql: string;
} {
  const remaining = remainingToGoal(
    input.candidate.daily_goal,
    input.candidate.today_reps,
  );
  const copy = reminderCopy(remaining);
  const appUrl = `${input.origin}/app`;
  const unsubUrl = `${input.origin}/unsubscribe?token=${input.candidate.unsubscribe_token}`;
  const rendered = renderReminderEmail({
    title: copy.subject,
    body: copy.body,
    cta: copy.cta,
    appUrl,
    unsubUrl,
  });

  const id = input.candidate.id;
  const localDate = input.candidate.local_date;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    throw new Error("invalid reminder identity");
  }

  return {
    to: input.candidate.email,
    from: "",
    subject: copy.subject,
    html: rendered.html,
    text: rendered.text,
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    recordSql: `insert into public.reminder_sends (user_id, local_date, kind)
values ('${id}'::uuid, '${localDate}'::date, 'evening')
on conflict do nothing;`,
  };
}
