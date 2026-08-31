import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Juice: recap, PWA, hit flip, ceremony, weekly 7/7.
 * Purse is live. Pass threshold: every case.
 */
describe("eval: juice features", () => {
  it("ships a web app manifest starting at Today", () => {
    const manifest = readFileSync("app/manifest.ts", "utf8");
    expect(manifest).toContain('start_url: "/app"');
    expect(manifest).toContain('display: "standalone"');
  });

  it("flips the Today total once on a hit", () => {
    expect(readFileSync("components/today-hit.tsx", "utf8")).toContain(
      "today-hit-flip",
    );
    expect(readFileSync("app/globals.css", "utf8")).toContain(
      "prefers-reduced-motion",
    );
  });

  it("gates day 100 and 365 once, and lists a perfect week", () => {
    expect(readFileSync("components/ceremony-gate.tsx", "utf8")).toContain(
      "pendingCeremony",
    );
    expect(readFileSync("app/app/board/page.tsx", "utf8")).toContain(
      "weekPerfectNames",
    );
    expect(readFileSync("app/app/you/recap/page.tsx", "utf8")).toContain(
      "RecapCard",
    );
    expect(readFileSync("app/app/you/recap/page.tsx", "utf8")).toContain(
      "RecapExport",
    );
  });

  it("ships Purse as live standings", () => {
    const purse = readFileSync("app/app/purse/page.tsx", "utf8");
    expect(purse).toContain("purseFromHits");
    expect(purse).toContain("PurseStandings");
    expect(purse).not.toContain("ComingSoonGate");
  });
});
