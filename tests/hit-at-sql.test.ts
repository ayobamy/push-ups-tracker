import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("daily_totals.hit_at migration", () => {
  const sql = readFileSync(
    "supabase/migrations/20260831150000_daily_totals_hit_at.sql",
    "utf8",
  );

  it("stores the set that first pushed the day over the floor", () => {
    expect(sql).toContain("add column if not exists hit_at timestamptz");
    expect(sql).toContain(
      "sum(s.reps) over (order by s.logged_at asc, s.id asc)",
    );
    expect(sql).toContain("hit_at = excluded.hit_at");
    expect(sql).toContain(
      "revoke all on function public.day_hit_at(uuid, uuid, date, int) from public",
    );
  });
});
