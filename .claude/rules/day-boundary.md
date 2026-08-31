# Day boundary

> Extends `verify-before-claim.md`. Challenge days are the user's
> local calendar date, never UTC `CURRENT_DATE`.

## Rule

Every set insert writes `local_date` at write time using the
member's IANA timezone. Historical rows never get recomputed
when the user changes timezone. Day-math helpers live in
`lib/challenge/` and ship with unit tests before any UI that
reads them.

## Why this rule exists

UTC midnight splits a Lagos or London evening into two challenge
days. Recomputing "today" from `logged_at` after a DST change
rewrites history. Both failure modes kill a 365-day streak
product.
