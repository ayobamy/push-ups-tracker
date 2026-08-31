import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HALF_POINTS, HIT_POINTS, RECOVERY_HITS } from "@/lib/challenge/purse";

/**
 * Year-end purse: 10 on a hit, half after a miss until 5 in a row.
 * Pass threshold: every case.
 */
describe("eval: year-end purse", () => {
  it("freezes 10, half of 10, and a 5-hit recovery", () => {
    expect(HIT_POINTS).toBe(10);
    expect(HALF_POINTS).toBe(5);
    expect(RECOVERY_HITS).toBe(5);
  });

  it("documents top-10 offline redeem, not an in-app shop", () => {
    const spec = readFileSync("docs/product.md", "utf8");
    expect(spec).toContain("top 10");
    expect(spec).toContain("cash");
    expect(spec).toContain("airtime");
    expect(spec).toContain("Purse is live");
    expect(spec).toContain("metal fills");
    expect(spec).toContain("deep bronze");
    expect(spec).not.toContain("blurred");
  });

  it("ships a Purse route with live standings, not a blur gate", () => {
    const page = readFileSync("app/app/purse/page.tsx", "utf8");
    expect(page).toContain("purseFromHits");
    expect(page).toContain("PurseStandings");
    expect(page).not.toContain("ComingSoonGate");
    expect(readFileSync("app/app/nav.tsx", "utf8")).toContain("/app/purse");
    expect(existsSync("components/coming-soon-gate.tsx")).toBe(false);
    expect(readFileSync("components/purse-standings.tsx", "utf8")).toContain(
      'aria-label="Purse standings"',
    );
    expect(readFileSync("components/purse-standings.tsx", "utf8")).toContain(
      "purseLane",
    );
  });
});
