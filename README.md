# 100 a Day

Web tracker for the challenge: 100 push-ups a day for 365 days.

Live: [100-days-push-ups.fit](https://100-days-push-ups.fit/)

Anyone with the site link can create an account (email and
password) and start logging sets.

## Docs

- [Product](docs/product.md)
- [Technical](docs/technical.md)
- [Implementation](docs/implementation.md)
- [Runbook](docs/runbook.md)
- [Index](docs/INDEX.md)

## Run locally

```bash
cp .env.example .env.local
# paste Supabase URL + publishable key
pnpm install
pnpm test
pnpm dev
```

Open `http://localhost:3000`. Sign-up emails need a live
Supabase project.

## Agent contract

[AGENTS.md](AGENTS.md) (`CLAUDE.md` is a symlink to it)
