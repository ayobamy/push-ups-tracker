# Runbook

Ops notes for 100 a Day. Ahmed is on-call.

## URLs

- App: set after Vercel deploy
- Supabase dashboard: `https://supabase.com/dashboard/project/<ref>`

## Auth is broken (loop back to log in)

The mail link uses PKCE. `/auth/confirm` must receive `?code=`
and call `exchangeCodeForSession`. A missing `code` used to
redirect to `send-failed` ("Could not send the link").

1. Auth → URL configuration. Site URL = `NEXT_PUBLIC_SITE_URL`
   (origin only, e.g. `https://your-app.vercel.app`). Redirect
   allow list must include that origin plus `/auth/confirm`.
   The app builds `{NEXT_PUBLIC_SITE_URL}/auth/confirm` in code.
2. Use the same host you typed in the browser (`localhost` and
   `127.0.0.1` are different to Auth).
3. After signup, if email confirm is on, open the mail, then
   **log in** with the password. The link only confirms the
   address.

## Did not get the confirmation mail

Auth mail should go through **Resend SMTP**. Setup:
[Resend research](provider-research/resend.md). `pnpm mail:apply`.

Until custom SMTP is on, built-in mail only reaches project
team inboxes and is capped at two messages an hour.

`auth.resend({ type: "signup" })` returns 200 even when it
sends nothing (already confirmed, or unknown email). Trust
Resend's email list, not the in-app "Sent again" copy.

If login is `invalid_credentials` and not `email_not_confirmed`,
the address is already confirmed. Use **Forgot password**.

1. Check spam / promotions.
2. Wait a minute, then **Resend email** on `/login/sent`.
3. Resend dashboard: was the message accepted?
4. Immediate unblock (SQL editor), then they log in with the
   password they just set:

```sql
update auth.users
set email_confirmed_at = now()
where email = '<their-email>'
  and email_confirmed_at is null;
```

5. Auth logs: Dashboard → Logs → Auth, look for `mailer` /
   rate-limit errors.

## App says paused / 5xx from Supabase

Free projects pause after one week idle. Unpause in the
dashboard. For a live 365-day challenge, switch to Pro so this
cannot happen.

## Unwanted account on the leaderboard

Signup is open. Delete the Auth user (cascades profile,
membership, sets):

```sql
delete from auth.users where id = '<uuid>';
```

Or they use Settings → Delete my account.

## Someone logged the wrong number today

They can edit or delete sets for **today only**. Past days are
frozen. No admin rewrite in v1. If it is truly wrong and the
group agrees, fix in the SQL editor as a last resort and write
down why.

## Timezone dispute

`local_date` is stamped at insert. Changing timezone in settings
does not move old days. If they onboarded on the wrong zone,
today's future sets will use the new zone.

## Delete a member

```sql
-- cascades profile if you delete the Auth user in the dashboard
delete from auth.users where id = '<uuid>';
```

Prefer the in-app "Delete my account" so they initiate it.

## Backups

Free: none. Pro: daily, 7 days. Do not wait until day 200 to
discover this.

## Rollback

Vercel → Deployments → Promote previous. Schema migrations are
forward-only. Do not drop `sets` or `daily_totals`.
