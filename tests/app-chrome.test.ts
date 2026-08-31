import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("app chrome", () => {
  it("puts Purse in the tab bar and Recap in a fixed top button", () => {
    const nav = readFileSync("app/app/nav.tsx", "utf8");
    expect(nav).toContain('href: "/app/purse"');
    expect(nav).toContain("grid-cols-5");

    const top = readFileSync("app/app/top-bar.tsx", "utf8");
    expect(top).toContain('href="/app/you/recap"');
    expect(top).toContain("fixed top-3 left-3");
    expect(top).toContain("Year recap");
  });

  it("does not put Recap between Today's number and Log", () => {
    const today = readFileSync("app/app/page.tsx", "utf8");
    expect(today).not.toContain("/app/you/recap");
    expect(today).not.toContain("/app/purse");
    expect(today.indexOf("<CheckIn")).toBeLessThan(
      today.indexOf("{todayHitLine"),
    );
  });
});
