import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("delete_own_account migration", () => {
  const sql = readFileSync(
    "supabase/migrations/20260831200000_delete_own_account.sql",
    "utf8",
  );

  it("deletes the Auth user so profile and sets cascade", () => {
    expect(sql).toContain("delete from auth.users where id = uid");
    expect(sql).toContain(
      "grant execute on function public.delete_own_account() to authenticated",
    );
    expect(sql).toContain(
      "revoke all on function public.delete_own_account() from public",
    );
  });
});
