import { readFileSync } from "node:fs";
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
    expect(spec).toContain("Coming soon");
  });

  it("ships a Purse route that scores hits then blurs them", () => {
    const page = readFileSync("app/app/purse/page.tsx", "utf8");
    expect(page).toContain("purseFromHits");
    expect(page).toContain("ComingSoonGate");
    expect(readFileSync("app/app/nav.tsx", "utf8")).toContain("/app/purse");
  });
});
