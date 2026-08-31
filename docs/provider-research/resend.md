# Resend — research notes

Auth confirmation, recovery, magic-link, and email-change
mail goes through **Resend SMTP** into Supabase Auth. The Next
app does not call the Resend HTTP API. Signup still uses
`supabase.auth.signUp` / `auth.resend`.

## Why Resend (not the built-in sender)

Supabase's default mailer is demo-grade:

- 2 messages per hour
- From `supabase.io`, often spam
- Only delivers to people on the project team until custom
  SMTP is on ("Email address not authorized")

Primary sources:

- https://supabase.com/docs/guides/auth/auth-smtp
  (read 2026-08-31)
- https://resend.com/docs/send-with-supabase-smtp
  (read 2026-08-31)
- https://supabase.com/docs/guides/auth/auth-email-templates
  (read 2026-08-31)

Rejected: sending Auth mail from Next with `resend` npm. That
bypasses GoTrue's confirm tokens. Custom SMTP keeps one
confirm flow.

Rejected: Resend's one-click Supabase integration as the
source of templates. It sends mail, but we want the templates
in this repo.

## SMTP values

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` (SMTPS) |
| Username | `resend` |
| Password | Resend API key |
| Sender email | `MAIL_FROM` (verified domain) |
| Sender name | `100 a Day` |

`beth.t@example.com` only delivers to the Resend account
owner. Friends need a verified domain.

Turn **click tracking** off on the Resend domain. Tracking
rewrites `{{ .ConfirmationURL }}` and breaks confirm.

## Apply from this repo

1. Verify a domain in Resend.
2. Create an API key.
3. Create a Supabase access token:
   https://supabase.com/dashboard/account/tokens
4. Add to `.env.local` (gitignored):

```
RESEND_API_KEY=re_...
MAIL_FROM=noreply@your-domain.com
MAIL_FROM_NAME=100 a Day
SUPABASE_ACCESS_TOKEN=sbp_...
```

5. `pnpm mail:apply`

That PATCHes Auth config: SMTP + the HTML in
`lib/mail/auth-templates.ts`. Templates use
`{{ .ConfirmationURL }}` only (one CTA, no images, no
marketing copy), per the Auth SMTP deliverability notes.

Dashboard fallback: Authentication → Emails → SMTP Settings,
then Email Templates, paste the same HTML.

After apply, hit **Resend email** on `/login/sent` and check
the Resend dashboard for delivery.
