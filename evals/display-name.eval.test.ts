import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Display names are unique on the board, including case.
 * Pass threshold: every case.
 */
describe("eval: unique display name", () => {
  it("enforces uniqueness case-insensitively in SQL", () => {
    const sql = readFileSync(
      "supabase/migrations/20260831140000_display_name_unique_ci.sql",
      "utf8",
    );
    expect(sql).toContain("lower(display_name)");
    expect(sql).toContain("unique index");
  });

  it("maps a unique violation to name-taken in completeProfile", () => {
    const actions = readFileSync("app/app/actions.ts", "utf8");
    expect(actions).toContain("isDisplayNameTakenError");
    expect(actions).toContain("name-taken");
  });
});
