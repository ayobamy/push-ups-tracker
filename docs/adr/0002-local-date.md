# ADR 0002 — Store local_date at write time

## Status

Accepted. 2026-08-31.

## Context

The challenge is "100 each day". UTC `CURRENT_DATE` splits
evenings for anyone west of Greenwich. Recomputing the calendar
day from `timestamptz` later breaks on DST and timezone changes.

Habit apps that work (Lockin, StreakUp) use the user's local
midnight as the deadline.

## Decision

Keep the database in UTC. Persist IANA timezone on `profiles`.
A trigger stamps `sets.local_date` from
`(logged_at AT TIME ZONE timezone)::date`. That value never
changes. "Today" is derived the same way at read time.

## Consequences

- Day math is testable in `lib/challenge/day.ts` and in SQL.
- A timezone change only affects future logs.
- We cannot "fix" a set that was logged on the wrong local day
  without an explicit admin path (none in v1).
