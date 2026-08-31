import { isMissingTable } from "@/lib/supabase/errors";
import { describe, expect, it } from "vitest";

describe("isMissingTable", () => {
  it("detects PostgREST schema-cache misses", () => {
    expect(
      isMissingTable({
        code: "PGRST205",
        message:
          "Could not find the table 'public.profiles' in the schema cache",
      }),
    ).toBe(true);
    expect(isMissingTable({ code: "PGRST116", message: "0 rows" })).toBe(false);
    expect(
      isMissingTable({
        message: "function public.join_active_challenge() does not exist",
      }),
    ).toBe(true);
    expect(isMissingTable(null)).toBe(false);
  });
});
