# Implementation

Atomic build plan for 100 a Day. Read [product.md](product.md)
and [technical.md](technical.md) first.

## Triage

```text
Size: large — new product, schema, auth, UX, deploy
Tests: vitest (lib/challenge) + supabase test db + Playwright
       journeys; full suite once the app exists
Agents: solo for this docs pass; implementation phases can fan
        out after the Next app exists (schema vs UI vs e2e)
```

## Council (abbreviated)

Divisions 1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 16 spoke from the
intake research. 2 and 5 wait for code. 13–15 N/A (no hiring
doc, no model, no new always-on region choice beyond Vercel
defaults).

- **Architecture:** one Next.js app, `@supabase/ssr`, `proxy.ts`,
  RLS as the authz layer. Casting vote against microservices.
- **Security:** RLS on every table, `getClaims`/`getUser` not
  `getSession` for identity, no service-role key in the web app.
- **Compliance:** GDPR personal data (email, name, timezone,
  activity). Not HIPAA. No users under 16.
- **UX / a11y:** home screen is the product; WCAG 2.2 AA;
  check-in under five seconds.
- **Data:** `local_date` stamped at write; `daily_totals` by
  trigger; leaderboard reads totals not raw sets.
- **Ops:** Free tier pauses after 7 idle days — go Pro when the
  group starts. No PITR on Free.
- **Finance:** $0 until live, then ~$25/month Pro.
- **Risk:** timezone bugs, honor-system lying, spam signups.
- **Strategy:** open magic-link join from a shared URL. Not a
  camera-counter competitor.
- **Comms:** docs in `docs/`; root `README.md` after flatten.

No vetoes. Open overrides are the defaults table in product.md.

## Task intake

| # | Question | Answer summary |
| --- | --- | --- |
| 1 | Prior art (codebase) | Flattened. `AGENTS.md` is the contract file. Docs in `docs/`. No app code yet. |
| 2 | Prior art (people) | Next.js: Vercel. Supabase SSR: Supabase. Habit UX: StreakUp, Lockin, Pushup Social (honor vs camera). |
| 3 | Canonical reference | [Next.js install](https://nextjs.org/docs/app/getting-started/installation), [Proxy](https://nextjs.org/docs/app/getting-started/proxy), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [UTC timezone](https://supabase.com/docs/guides/database/postgres/configuration), [Next.js tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) |
| 4 | OSS option | USE Next.js + `@supabase/ssr` + Tailwind. CUSTOM only for challenge math and UI. Reject cloning random GitHub habit apps. |
| 5 | SOTA scan | Local-midnight deadline + multi-set daily sum is current practice. Camera counting is SOTA for anti-cheat, rejected for v1 (ADR 0003). |
| 6 | Scalability | Open signup. 50–500 still fine. Inflection ~2k members (paginate board). Auth OTP rate limits are the spam gate. |
| 7 | Integration map | Next.js ↔ Supabase Auth + Postgres. Vercel deploy. Email = Supabase SMTP. No other systems. |
| 8 | FMEA | See table below |
| 9 | Security (STRIDE) | See technical.md |
| 10 | Data lifecycle | PII: email (Auth), display name, timezone, set logs. Retention: challenge + 30d. Export/delete in settings. |
| 11 | Compliance | GDPR yes. CCPA yes if a CA user joins. HIPAA N/A. PCI N/A. COPPA N/A (no under-16). EAA/ADA via WCAG 2.2 AA. |
| 12 | Accessibility | AA. Keyboard, 44px presets, live region on total, contrast, reduced motion. |
| 13 | i18n | English only v1. Dates via `Intl`. RTL deferred. |
| 14 | Test strategy | vitest + supabase test db + Playwright + axe. No k6 in v1. |
| 15 | Observability | Vercel + Supabase logs. SLO: 99% logSet / 7d. Sentry later. |
| 16 | Cost | $0 Hobby+Free, then ~$25/mo Pro when live. |
| 17 | Rollback / DR | Vercel rollback. Free has no PITR. Pro daily backups 7d. RPO: last backup. RTO: redeploy + unpause. |
| 18 | Deprecation | Greenfield. None. |
| 19 | UX writing | Direct, verbs, remaining-to-100 copy. See product.md. |
| 20 | Documentation | This folder + ADRs + runbook. Changelog when app exists. |
| 21 | Risk register | See below |
| 22 | Success criteria | 70% of members check in 20+ days in first 30. |
| 23 | Post-launch watch | First 7 days Ahmed is on-call. Rollback if login is broken. |
| 24 | AI / ML ethics | N/A — no model. |
| 25 | Vendor / IP | Next.js MIT. Supabase Apache-2.0 / BSL for some cloud features; client libs OSS. Product name "100 a Day" informal, not trademark-cleared. |
| 26 | Operational handoff | [runbook.md](runbook.md). Bus factor 1 (Ahmed) until a second admin. |
| 27 | Action plan | Phases 0–8 below |
| 28 | Other | Open signup (Ahmed 2026-08-31). Set `starts_on` before sharing the URL. |

### FMEA

| Failure | Effect | Sev | Detect | Mitigation |
| --- | --- | --- | --- | --- |
| Magic link expired / wrong redirect | Cannot log in | high | user | Confirm URL in Auth settings; clear error |
| UTC used as "today" | Missed day at local night | high | tests | ADR 0002 + vitest |
| RLS off | Anyone reads/writes | crit | `supabase test db` | rls-required rule |
| Free project paused | App dead mid-challenge | high | open app | Pro when live |
| Double-tap logs two sets | Inflated day | low | UI | disable button; user can delete same day |
| Spam / throwaway emails | Noise on the board | med | board | OTP rate limit; delete Auth user |
| Timezone wrong at onboard | Off-by-one days | med | heatmap | prefill + confirm copy |

### Risk register

| Risk | L | I | Mitigation | Escalate when |
| --- | --- | --- | --- | --- |
| Day-boundary bug | M | C | tests before UI | any wrong heatmap day |
| Auth misconfig on Vercel | M | H | confirm recipe in runbook | anyone cannot login |
| Free pause | H | H | Pro on go-live | 7 days quiet |
| Honor-system fake reps | H | L | accepted (ADR 0003) | cohort asks for proof |
| Nested clone vs Next app | L | L | Flattened 2026-08-31 | n/a |

### Online sources (Q29)

| Source | URL | Read | Finding |
| --- | --- | --- | --- |
| Next.js install | https://nextjs.org/docs/app/getting-started/installation | 2026-08-31 | Node 20.9+, `create-next-app@latest --yes`, TS/Tailwind/App Router |
| Next.js 16 proxy | https://nextjs.org/docs/app/getting-started/proxy | 2026-08-31 | `proxy.ts` replaces `middleware.ts` |
| Next.js 16 upgrade | https://nextjs.org/docs/app/guides/upgrading/version-16 | 2026-08-31 | middleware deprecated, Node 20.9 |
| Supabase SSR | https://supabase.com/docs/guides/auth/server-side/nextjs | 2026-08-31 | `@supabase/ssr`, `getAll`/`setAll` only |
| Creating a client | https://supabase.com/docs/guides/auth/server-side/creating-a-client | 2026-08-31 | browser + server clients, Proxy refresh |
| Next.js tutorial | https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs | 2026-08-31 | profiles trigger, token_hash confirm, getClaims |
| RLS | https://supabase.com/docs/guides/database/postgres/row-level-security | 2026-08-31 | grants + policies, per-op, tests |
| Timezone | https://supabase.com/docs/guides/database/postgres/configuration | 2026-08-31 | keep DB UTC |
| Pricing | https://supabase.com/pricing | 2026-08-31 | Free pause 1 week; Pro from $25 |
| with-supabase example | https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md | 2026-08-31 | publishable key env name |

## Phases

Each task names a path and a verify predicate. Do not start
Phase 1 until Phase 0 is done.

### Phase 0 — Repo hygiene (done 2026-08-31)

- **0.A.1–0.A.2** `AGENTS.md` is a file. `CLAUDE.md` is a
  symlink to it. Nested clone gone.
- **0.A.3** Skipped: `.claude/CLAUDE.md` collides with root
  `CLAUDE.md` basename. Overlay stays `.claude/WORKSPACE.md`.
- **0.A.4** Root `README.md` points at `docs/`.

### Phase 1 — Next.js app

- **1.A.1** Run `pnpm create next-app@latest . --yes` in the
  cleaned root (or a temp dir then move). Verify: `package.json`
  has `next`, `app/layout.tsx` exists.
- **1.A.2** Keep Ahmed's `AGENTS.md` as the human contract;
  merge any Next-generated agent pointers into it rather than
  replacing. Verify: `AGENTS.md` still contains "How to work".
- **1.A.3** Add `.vscode/settings.json` editor labels from the
  Next.js install docs. Verify: file contains
  `workbench.editor.customLabels.patterns`.
- **1.A.4** `pnpm add @supabase/supabase-js @supabase/ssr`.
  Verify: both in `package.json`.
- **1.A.5** Add `.env.example` with
  `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Verify: committed,
  not `.env.local`.
- **1.A.6** `pnpm dev` serves `/`. Verify: HTTP 200.

### Phase 2 — Challenge math (TDD, no UI)

- **2.A.1** Add vitest. Verify: `pnpm test` runs.
- **2.A.2** Write failing tests in `tests/day.test.ts` for
  UTC vs `Africa/Lagos` vs `Europe/London` DST. Verify: red.
- **2.A.3** Implement `lib/challenge/day.ts`. Verify: tests
  green.
- **2.A.4** Write failing streak tests (gap, today not yet hit,
  yesterday hit). Verify: red.
- **2.A.5** Implement `lib/challenge/streak.ts`. Verify: green.
- **2.A.6** Implement `lib/challenge/remaining.ts`
  (`max(0, goal - today)` and surplus). Verify: tests green.

### Phase 3 — Supabase schema

- **3.A.1** `pnpm dlx supabase init`. Verify: `supabase/config.toml`.
- **3.A.2** Migration: `challenges` + RLS. Verify: `supabase test db`
  deny anon select.
- **3.A.3** Migration: `profiles` + `handle_new_user` trigger.
  Verify: insert into `auth.users` (test helper) creates profile.
- **3.A.4** Migration: `challenge_members` +
  `join_active_challenge()`. Verify: authed insert; duplicate
  no-op; anon denied.
- **3.A.5** Migration: `sets` with local_date trigger, reps check,
  50-sets/day cap. Verify: client-supplied local_date overwritten.
- **3.A.6** Migration: `daily_totals` upsert trigger. Verify:
  insert 40+60 → hit_goal true; delete → row updates.
- **3.A.7** Same-day-only update/delete policies. Verify: tests
  deny update when local_date < today in that timezone.
- **3.A.8** Seed SQL: one challenge, `daily_goal=100`,
  `duration_days=365`, placeholder `starts_on`. Verify: seed
  applies.
- **3.A.9** Generate TS types (`supabase gen types`). Verify:
  `lib/supabase/database.ts` exists.

### Phase 4 — Auth

- **4.A.1** `lib/supabase/client.ts` via `createBrowserClient`.
  Verify: unit import compiles.
- **4.A.2** `lib/supabase/server.ts` via `createServerClient` +
  `getAll`/`setAll`. Verify: no `cookies.get` / `.set` singles.
- **4.A.3** `lib/supabase/proxy.ts` session refresh + root
  `proxy.ts` matcher. Verify: `grep` finds `export function proxy`
  and `getClaims` or `getUser`.
- **4.A.4** `/login` magic-link Server Action
  (`signInWithOtp`). Verify: Playwright can submit email.
- **4.A.5** `/auth/confirm` token_hash exchange per tutorial.
  Verify: route exists; Auth template documented in runbook.
- **4.A.6** Sign-out action. Verify: cookies cleared, redirect `/`.
- **4.A.7** Gate `/app/*` in proxy. Verify: logged-out request
  redirects to `/login`.

### Phase 5 — Onboarding + join

- **5.A.1** `/onboarding` form (name, timezone). Verify: Zod
  2–32 name; timezone is IANA.
- **5.A.2** Prefill timezone from
  `Intl.DateTimeFormat().resolvedOptions().timeZone`. Verify:
  e2e sees a non-empty select.
- **5.A.3** Incomplete profile redirect. Verify: authed user
  without name cannot hit `/app`.
- **5.A.4** `completeProfile` calls `join_active_challenge()`.
  Verify: member row exists.
- **5.A.5** Duplicate join is a no-op success. Verify: test.

### Phase 6 — Check-in

- **6.A.1** `logSet` action, reps 1–1000, ignores client date.
  Verify: integration test against local Supabase.
- **6.A.2** Home page reads today's total from `daily_totals`.
  Verify: after logSet, total matches.
- **6.A.3** Preset buttons 10/20/25/50 + custom. Verify:
  Playwright logs 25, total 25.
- **6.A.4** Remaining / hit / surplus copy. Verify: 100 → "Hit";
  140 → surplus 40.
- **6.A.5** Today's set list with edit + delete. Verify: delete
  drops total; past-day controls absent.
- **6.A.6** Disable submit while pending. Verify: no double
  fire in Playwright (one click → one row).
- **6.A.7** Live region announces new total. Verify: `aria-live`
  present.
- **6.A.8** Evening copy when hour ≥ 20 and total < 100.
  Verify: unit test on the copy helper, clock injected.

### Phase 7 — Board + history + juice

- **7.A.1** `/app/board` days-hit sort. Verify: two seeded
  users order correctly.
- **7.A.2** Sort chips: streak, total. Verify: URL or state
  changes order.
- **7.A.3** Highlight current user row. Verify: `aria-current`
  or equivalent.
- **7.A.4** Today board section. Verify: hit vs short vs zero.
- **7.A.5** `/app/you` 365 heatmap from `starts_on`. Verify:
  365 cells; tap shows that day's total.
- **7.A.6** Milestone chips 7/30/100/365. Verify: 7 days hit
  lights the first chip.
- **7.A.7** Day index "Day N of 365". Verify: before start →
  "Starts on {date}"; after end → "Challenge over".

### Phase 8 — Settings, privacy, deploy

- **8.A.1** Settings: name, timezone with warning copy. Verify:
  update persists.
- **8.A.2** Export JSON (profile, membership, sets, totals).
  Verify: Playwright download or JSON response.
- **8.A.3** Delete account (Auth user cascade). Verify: rows
  gone; cannot log in.
- **8.A.4** `/privacy` page. Verify: 200, names data classes.
- **8.A.5** axe on landing, login, home, board. Verify: zero
  serious/critical.
- **8.A.6** Link local project to hosted Supabase, push
  migrations. Verify: tables in dashboard.
- **8.A.7** Vercel project + env vars + Auth redirect URLs.
  Verify: production magic link lands on `/auth/confirm`.
- **8.A.8** Set real `starts_on` to **2026-08-31**. Verify: seed
  row updated; Today shows Day 1 of 365 on 31 Aug.
- **8.A.9** Upgrade Supabase to Pro if the challenge is live.
  Verify: pause is off in dashboard.
- **8.A.10** Runbook dry-run: Ahmed can reset a magic link and
  delete a member. Verify: steps in [runbook.md](runbook.md)
  match the dashboard.

## Done for v1

All Phase 0–8 tasks verified. Playwright journeys green:

1. New user: magic link → onboard (auto-join) → log 25 → total 25
2. Same user: log 75 more → hit
3. Second user: appears on board; first user ranked by days
4. Delete today's set → total drops
5. Logged-out `/app` → `/login`

## Next action after this doc

Phase 1.A.1: scaffold Next.js 16 in the repo root.
