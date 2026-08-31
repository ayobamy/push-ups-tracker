import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * When days, streak, and total all match, rank by who crossed 100
 * earlier in their local day, then name. Pass threshold: every case.
 */
describe("eval: hit-pace last rank key", () => {
  it("freezes the last key in the product spec", () => {
    const spec = readFileSync("docs/product.md", "utf8");
    expect(spec).toContain("hit pace");
    expect(spec).toContain("of the set that first made the day sum");
  });

  it("sorts Board, Purse, and Today through that key", () => {
    expect(readFileSync("lib/challenge/board.ts", "utf8")).toContain(
      "compareStandingTies",
    );
    expect(readFileSync("lib/challenge/board.ts", "utf8")).toContain(
      "sortTodayBoard",
    );
    expect(readFileSync("lib/challenge/purse.ts", "utf8")).toContain(
      "compareStandingTies",
    );
    expect(readFileSync("app/app/board/page.tsx", "utf8")).toContain(
      "hitPaceMs",
    );
    expect(readFileSync("app/app/purse/page.tsx", "utf8")).toContain(
      "hitPaceMs",
    );
    expect(readFileSync("app/app/page.tsx", "utf8")).toContain(
      "sortTodayBoard",
    );
    expect(readFileSync("app/app/page.tsx", "utf8")).toContain("hit_at");
  });
});
