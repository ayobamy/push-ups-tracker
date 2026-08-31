# ADR 0001 — Next.js 16 + Supabase, one app

## Status

Accepted. 2026-08-31.

## Context

Ahmed asked for Next.js and Supabase. Alternatives exist
(Firebase, a custom Node API, Expo). The agent contract prefers
vanilla and reuse.

## Decision

Ship one Next.js 16 App Router app on Vercel. Use `@supabase/ssr`
with `proxy.ts` for cookie sessions. Use Postgres + RLS as the
authorization layer. No ORM. No microservice split.

## Consequences

- Auth and data follow official Supabase SSR docs, not blog
  copies of `middleware.ts`.
- A second client (native) would talk to the same Postgres via
  Supabase; it is out of v1.
- Free-tier pause is a product risk; move to Pro when the
  challenge is live.
