# RLS required

> Extends global security rules. Supabase exposes every table in
> `public` through the Data API.

## Rule

For every table in `public`:

1. `ENABLE ROW LEVEL SECURITY`
2. Separate policies per operation (`select` / `insert` /
   `update` / `delete`)
3. `TO authenticated` (never rely on `auth.uid()` alone to
   exclude `anon`)
4. Wrap `auth.uid()` as `(select auth.uid())` in policies
5. A file under `supabase/tests/` asserts allow and deny for
   `anon` and `authenticated`

No table ships without a green `supabase test db` for that
table.

## Why this rule exists

A table in an exposed schema without RLS is readable and
writable by any role with a grant. That is the default footgun
of the Supabase Data API.
