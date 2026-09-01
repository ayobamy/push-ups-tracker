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

  it("caps Today names at five and expands on Today, not Board", () => {
    const today = readFileSync("app/app/page.tsx", "utf8");
    const board = readFileSync("app/app/board/page.tsx", "utf8");
    expect(today).toContain("previewTodayBoard");
    expect(today).toContain("todayHitLine(hitCount, board.length)");
    expect(today).toContain("{hitCount}");
    expect(today).toContain("/ {board.length}");
    expect(today.indexOf("{hitCount}")).toBeLessThan(
      today.indexOf("<TodayRoster"),
    );
    expect(today.indexOf("<TodayRoster")).toBeLessThan(
      today.indexOf('href={showEveryone ? "/app" : "/app?roster=all"}'),
    );
    expect(today).toContain("todayBoardListLabel");
    expect(today).toContain("See everyone");
    expect(board).not.toContain('id="today"');
    expect(board).not.toContain("TodayRoster");
    expect(board).toContain(">Year</h2>");
  });
});
