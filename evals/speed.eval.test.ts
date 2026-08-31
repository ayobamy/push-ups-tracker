import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Check-in p95: Today must not serial-wait a join RPC, and the
 * four data screens fan out independent queries. Pass: every case.
 */
describe("eval: app fetch speed", () => {
  it("keeps join off the Today GET path", () => {
    expect(readFileSync("app/app/page.tsx", "utf8")).not.toContain(
      "join_active_challenge",
    );
    expect(readFileSync("app/app/actions.ts", "utf8")).toContain(
      "join_active_challenge",
    );
  });
});
