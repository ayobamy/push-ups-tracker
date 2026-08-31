# push-ups-tracker workspace overlay

> Workspace overlay. Root `CLAUDE.md` is the agent contract
> (symlink to `AGENTS.md`), so this file is not named
> `CLAUDE.md` (basename collision).

## Tech stack

- **Language**: TypeScript
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Cloud**: Vercel (app) + Supabase (Postgres, Auth, RLS)
- **Database**: PostgreSQL on Supabase
- **CI**: GitHub Actions

## Vendor table

| Category | Choice | Reason |
| --- | --- | --- |
| Payments | none (v1) | Friend-group challenge, no money |
| Email | Supabase Auth SMTP | Magic-link login; no extra vendor |
| Auth | Supabase Auth | Canonical with chosen DB |
| Observability | Vercel logs + Supabase logs | Free-tier default; Sentry later |
| Secrets | Vercel env + `.env.local` | Never commit keys |

## Project-specific rules

| Rule | Purpose |
| --- | --- |
| `day-boundary.md` | Local-date math is deterministic and tested |
| `rls-required.md` | Every public table has RLS + `supabase test db` |
