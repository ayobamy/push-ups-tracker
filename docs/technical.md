# Technical design

How 100 a Day is built. Product behavior lives in
[product.md](product.md). Task list lives in
[implementation.md](implementation.md).

## Stack (locked)

| Layer | Choice | Canonical docs |
| --- | --- | --- |
| App | Next.js 16 App Router, TypeScript, Tailwind, Turbopack | [Installation](https://nextjs.org/docs/app/getting-started/installation) |
| Request boundary | `proxy.ts` (not deprecated `middleware.ts`) | [Proxy](https://nextjs.org/docs/app/getting-started/proxy) |
| Auth + DB | Supabase Postgres + Auth + RLS | [SSR Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) |
| Clients | `@supabase/ssr` + `@supabase/supabase-js` | same |
| Hosting | Vercel Hobby, later Pro if needed | Vercel |
| Package manager | pnpm | Next.js install docs |

Rejected:

- **Firebase** — NoSQL is a poor fit for daily aggregates and
  leaderboards. User asked for Supabase.
- **`@supabase/auth-helpers-nextjs`** — deprecated. Official
  path is `@supabase/ssr`.
- **Microservices** — a friend-group tracker is one Next.js app
  with `lib/` modules. Services-first from the agent contract
  does not apply until a second deployable exists.
- **Drizzle / Prisma** — extra ORM for a schema that RLS and
  SQL views already own. Use the generated Supabase types.
- **Camera / MediaPipe counters** — product is honor-system.

Bootstrap from `create-next-app@latest` with recommended
defaults, then add `@supabase/ssr`. Do not start from a random
GitHub habit-tracker clone. Steal ideas, not code.

## Architecture

One Next.js app. Browser talks to Server Actions. Server Actions
use the cookie-bound server client. Postgres enforces rules with
RLS, triggers, and views. No separate API server.

```text
Phone / desktop
    │
    ▼
Next.js (Vercel)
  proxy.ts          refresh session cookies, gate /app/*
  app/(auth)        magic link
  app/(app)         home, board, you, settings
  app/auth/confirm  token_hash → session
  lib/supabase      browser + server clients
  lib/challenge     local_date, streak, remaining (pure)
    │
    ▼
Supabase
  Auth (GoTrue)     magic link email
  Postgres          tables + RLS + triggers + views
```

Auth checks on the server use `getClaims()` to verify the JWT,
or `getUser()` when a fresh Auth-server record is required.
Never authorize from `getSession().user` alone. That rule is
from the [Supabase Next.js tutorial][sb-next].

Session cookies are first-party, `HttpOnly`, `SameSite=Lax`,
`Secure` in production, max-age 400 days (Chrome's cap). The
access JWT still expires in about an hour; `proxy.ts` refreshes
it from the refresh token. Do not put tokens in `localStorage`
(XSS can read it). Sign-out clears the cookies. If Auth
Dashboard time-boxes sessions (often 7 days), raise that so a
daily opener is not kicked out.

[sb-next]: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

## Day boundary

Postgres `timezone` stays UTC
([Supabase config](https://supabase.com/docs/guides/database/postgres/configuration)).

Each profile stores an IANA name (`Africa/Lagos`,
`Europe/London`). On insert of a set, a `BEFORE INSERT` trigger
sets:

```sql
local_date = (logged_at AT TIME ZONE profile.timezone)::date
```

That date is the challenge day forever. Changing timezone does
not rewrite history. "Today" in the UI is
`(now() AT TIME ZONE profile.timezone)::date`.

Pure helpers in `lib/challenge/day.ts` must match the SQL. Tests
cover DST spring-forward and fall-back for at least
`Europe/London` and `America/New_York`.

## Schema

All tables in `public`. RLS on. Grants: `anon` none except
what Auth needs; `authenticated` as policies allow.

### `challenges`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `slug` | text unique | `hundred-2026` |
| `title` | text | |
| `daily_goal` | int | default 100, check > 0 |
| `starts_on` | date | shared cohort start |
| `duration_days` | int | default 365 |
| `created_at` | timestamptz | |

v1 has one row, seeded.

### `profiles`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | `references auth.users on delete cascade` |
| `display_name` | text | 2–32 chars, unique ignoring case |
| `timezone` | text | IANA, check against a known list or
  `pg_timezone_names` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Created by `on_auth_user_created` trigger (same pattern as the
[user-management starter][sb-next]). Display name filled on
first-run, not at Auth insert (email-only magic link has no
name).

### `challenge_members`

| Column | Type | Notes |
| --- | --- | --- |
| `challenge_id` | uuid | fk |
| `user_id` | uuid | fk profiles |
| `joined_at` | timestamptz | |
| primary key | `(challenge_id, user_id)` | |

Join RPC: `join_active_challenge()` (no code). Authenticated
caller is inserted into the seeded challenge. `on conflict do
nothing`. Called from `completeProfile`. Anyone with the site
URL can sign up; the magic-link email is the only gate.

### `sets`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `user_id` | uuid | not null |
| `challenge_id` | uuid | not null |
| `reps` | int | 1–1000 inclusive |
| `logged_at` | timestamptz | default `now()` |
| `local_date` | date | set by trigger, not the client |
| `note` | text | optional, max 140, null ok |

Client must not send `local_date`. If it does, the trigger
overwrites it.

Same-day update/delete only: policy compares `local_date` to
the member's current local date.

### `daily_totals`

Materialized by trigger on `sets`, not by the client.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | uuid | |
| `challenge_id` | uuid | |
| `local_date` | date | |
| `total_reps` | int | |
| `hit_goal` | boolean | `total_reps >= daily_goal` |
| `hit_at` | timestamptz | `logged_at` of the set that first made the running sum reach `daily_goal`. Null if the day is short. |
| `updated_at` | timestamptz | |
| primary key | `(user_id, challenge_id, local_date)` | |

Trigger: after insert/update/delete on `sets`, re-sum that
`(user_id, challenge_id, local_date)` and upsert. `hit_at` is
the earliest `logged_at` whose running sum (ordered by
`logged_at`, then `id`) is at least the floor. One row per
member per day. Leaderboard reads this table, not a live `SUM`
over all sets. Last rank key is mean local time of day of
`hit_at`, not wall-clock date, so which days you hit cannot
steal a tie.

### Views (security_invoker)

- `leaderboard` — days_hit, current_streak, total_reps,
  surplus, today_reps, today_hit. Streak computed in SQL from
  `daily_totals` gaps, or maintained on write if the SQL is
  slow. v1 can compute streak in `lib/challenge/streak.ts`
  from the member's `hit_goal` dates; the board for ~50 people
  is tiny.
- `today_board` — members of the challenge with today's
  `total_reps` and `hit_goal`.

Prefer invoker views so RLS on the base tables still applies
([Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)).

## RLS sketch

Policies use `(select auth.uid())` and `TO authenticated`.

| Table | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| `challenges` | members of that row | none | none | none |
| `profiles` | members who share a challenge | own row (trigger) | own row | none |
| `challenge_members` | co-members | via `join_challenge` only | none | own row (leave) |
| `sets` | own rows | own + member | own + same local_date | own + same local_date |
| `daily_totals` | co-members | none (trigger) | none | none |

`daily_totals` is readable by co-members so the leaderboard
works without exposing set-level timestamps.

Anon: no table grants. Auth lives on `/login`.

## Server Actions

| Action | Input | Writes |
| --- | --- | --- |
| `signInWithOtp` | email | Auth |
| `signOut` | — | cookies |
| `completeProfile` | display_name, timezone | profiles + join RPC |
| `logSet` | reps, optional note | sets |
| `updateSet` | id, reps | sets (same day) |
| `deleteSet` | id | sets (same day) |
| `updateSettings` | name / timezone | profiles |
| `exportMyData` | — | read-only JSON |
| `deleteAccount` | confirm | Auth user delete |

`logSet` is idempotent enough: each tap is a new set. Double
submit of the same form is two sets. The UI disables the button
until the action returns. No client-side UUID needed.

Rate limit: Postgres check `reps` 1–1000 plus a count cap of
50 sets per local_date (stops a stuck button). Enforce in the
insert trigger.

## App routes

```text
/                       landing (public)
/login                  magic link form
/auth/confirm           token_hash exchange
/onboarding             name + timezone (authed, incomplete)
/app                    home / today
/app/board              leaderboard + today board
/app/you                heatmap
/app/you/recap          year recap card (fixed Recap button)
/app/purse              live year-end points
/app/settings           profile, export, delete
/privacy                public
```

`proxy.ts` refreshes cookies on every matched path. Unauthenticated
users hitting `/app/*` redirect to `/login`. Authenticated users
missing `display_name` redirect to `/onboarding`.

## SEO

Public pages (`/`, `/signup`, `/login`, `/privacy`) are in
`app/sitemap.ts` and allowed in `app/robots.ts`. Logged-in
`/app/*`, `/auth/*`, `/api/*`, and password-reset flows are
disallowed. `/app` also sets `robots: noindex`.

Absolute sitemap and Open Graph URLs come from
`NEXT_PUBLIC_SITE_URL` via `lib/seo/site.ts`. Tab icon is
`app/favicon.ico` plus `app/icon.svg` (the 100 mark), not the
Next/Vercel default. Open Graph image is
`app/opengraph-image.tsx`.

## Module layout (inside the Next app)

```text
app/                    routes only
components/             UI
lib/supabase/           client.ts, server.ts, proxy.ts
lib/challenge/          day.ts, streak.ts, remaining.ts, purse.ts, week.ts
lib/seo/                sitemap, robots, public metadata
lib/actions/            server actions
supabase/migrations/    SQL
supabase/tests/         RLS tests
tests/                  vitest for lib/challenge
e2e/                    Playwright journeys
```

No `services/` split until a second deployable exists.

## Testing

| Lane | Tool | What |
| --- | --- | --- |
| Gate, <2s | vitest | day, streak, remaining, Zod parsers |
| Gate | `supabase test db` | RLS allow/deny |
| Gate | eslint + tsc | |
| Journey | Playwright | login, log set, see board, settings |
| A11y | axe-core in Playwright | four primary screens |
| Load | skip v1 | 50 members is not a load problem |

Evals: the Playwright journeys are the eval suite. Pass
threshold is 100% of the listed journeys. No LLM evals. There
is no model in the product.

## Observability (v1)

- Vercel request logs
- Supabase Auth + Postgres logs (1-day retention on Free)
- Server Action errors throw with a request-correlated message
  in the UI: "Could not log set. Try again."

SLO for v1: 99% of `logSet` succeed over 7 days. Alert is Ahmed
opening the app. Upgrade to Sentry if that gets embarrassing.

## Cost (v1)

Assume ≤ 50 members, a few hundred requests/day.

| Item | Plan | Notes |
| --- | --- | --- |
| Vercel | Hobby $0 | Fine for this QPS |
| Supabase | Free $0 | 500 MB, 50k MAU, 5 GB egress |

Inflection: **Free pauses after 1 week of inactivity.** A
365-day challenge cannot sit paused. The moment the group is
live, move the project to **Pro ($25/month)** so it never
pauses and daily backups exist. That is the real cost of taking
the challenge seriously, not compute.

10× (500 members) still fits Pro. 1000× (50k members, public
app) is a different product: indexes, cached leaderboard, Pro
MAU still fine, egress and product scope are the issue.

## Security (STRIDE)

- **S**poofing: JWT via `getClaims` / `getUser`; magic-link
  email is the identity.
- **T**ampering: RLS on every table; `local_date` server-set;
  `user_id` from `auth.uid()`, not the body.
- **R**epudiation: `sets.logged_at` + Auth audit (1 hour on
  Free). Same-day edits are the known hole; they are a product
  choice.
- **I**nformation: co-members see aggregates and display names,
  not emails. No set notes on the public board.
- **D**oS: 50 sets/day, reps 1–1000, Auth rate limits from
  Supabase.
- **E**levation: no admin role in v1. Invite rotation is done
  in the SQL editor by Ahmed.

Secrets: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the browser (expected).
Service role key never in the Next app. If `deleteAccount` needs
it, it lives in a Supabase Edge Function, not a Server Action
env on Vercel until we must.

## Privacy

Lawful basis (GDPR): consent to join + legitimate interest in
running the shared board among members.

Not HIPAA: we are not a covered entity; push-up counts for a
friends challenge are not ePHI. Conservative GDPR Art 9: treat
activity as personal data, not special-category processing, and
do not infer health conditions.

Retention: challenge duration + 30 days, then delete on request
or when the challenge row is dropped.

Rights: export JSON, delete account (cascades profile, membership,
sets, totals).

## Deploy

1. Supabase project (Free, then Pro when the group starts).
2. `supabase db push` migrations.
3. Auth URL config: site URL = `NEXT_PUBLIC_SITE_URL` (origin
   only). Redirect allow list = `{that origin}/auth/confirm`.
   The app appends `/auth/confirm` in `lib/auth/site-url.ts`.
4. Auth mail: Resend SMTP + templates via `pnpm mail:apply`
   ([Resend research](provider-research/resend.md)).
5. Vercel project with `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
6. Seed one `challenges` row with `starts_on`. Share the site
   URL.

Rollback: Vercel previous deployment. Schema: forward-only
migrations; do not drop columns in the first month.

## ADRs

- [0001 — stack](adr/0001-stack.md)
- [0002 — local date](adr/0002-local-date.md)
- [0003 — honor system](adr/0003-honor-system.md)
- [0004 — open signup](adr/0004-open-signup.md)
