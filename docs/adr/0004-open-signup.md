# ADR 0004 — Open signup from the site URL

## Status

Accepted. 2026-08-31. Ahmed: anyone can sign up through a link
and then track.

## Context

v1 was invite-code gated. Ahmed wants the shareable app URL to
be enough.

## Decision

Email and password via Supabase Auth (`signUp` /
`signInWithPassword`). Confirm-email links use PKCE (`?code=`).
`/auth/confirm` calls `exchangeCodeForSession`. No invite code.
Leaderboard stays behind login.

## Consequences

- Spam accounts can appear. Delete via Auth dashboard or
  in-app delete.
- Share the Vercel URL. Rotating a secret is no longer a
  control.
- Auth OTP rate limits are the abuse control.
