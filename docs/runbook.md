# Runbook

Ops notes for 100 a Day. Ahmed is on-call.

## URLs

- App: `https://100-days-push-ups.fit`
- Vercel alias: `https://push-ups-tracker-liard.vercel.app`
- Supabase dashboard: `https://supabase.com/dashboard/project/<ref>`

## Custom domain

Apex `https://100-days-push-ups.fit` is the public origin. Nameservers
are already `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.

If the browser still fails, flush local DNS, try without `www`,
and wait up to 48h if you just changed nameservers.

Then lock Auth to that origin (Vercel env is baked at **build**):

1. Vercel → Project → Settings → Environment Variables.
   Set `NEXT_PUBLIC_SITE_URL` to `https://100-days-push-ups.fit`
   (no trailing slash). Production (and Preview if you want).
2. Redeploy Production. Env changes do not apply to the last
   build until you redeploy.
3. Supabase → Authentication → URL configuration.
   Site URL = `https://100-days-push-ups.fit`.
   Redirect allow list must include
   `https://100-days-push-ups.fit/auth/confirm`
   (keep the `vercel.app` confirm URL too until you stop using
   that host).
4. Vercel → Settings → Domains. Apex = production. Add `www`
   and **Redirect to** the apex. Do not leave `www` as a second
   primary if it 500s.

Until step 2, `/robots.txt` still points the sitemap at
`push-ups-tracker-liard.vercel.app`, and signup mail still
redirects there.

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

## Challenge start date

`challenges.starts_on` for slug `hundred-2026` is **2026-08-31**.
Today before that date shows "Starts … Floor is 100." After the
window, "Challenge window is over." Change it with a new
migration, not a dashboard edit.

## Evening reminder cron

Hobby only allows one run per day. `vercel.json` fires
`/api/cron/remind` at **19:00 UTC** (20:00 in Africa/Lagos).
Vercel may invoke any time in that hour. Needs `CRON_SECRET`.

## Sitemap and robots

Live at `/sitemap.xml` and `/robots.txt`. They use
`NEXT_PUBLIC_SITE_URL`. After deploy, hard-refresh once so the
tab icon is the 100 mark, not a cached Vercel/Next favicon.

## Backups

Free: none. Pro: daily, 7 days. Do not wait until day 200 to
discover this.

## Rollback

Vercel → Deployments → Promote previous. Schema migrations are
forward-only. Do not drop `sets` or `daily_totals`.
