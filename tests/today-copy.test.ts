import {
  sortBoard,
  sortTodayBoard,
  dailySurplus,
  type BoardRow,
} from "@/lib/challenge/board";
import {
  heatmapGridStart,
  heatmapSwatch,
  heatmapTone,
  initialHeatmapDate,
} from "@/lib/challenge/heatmap";
import {
  appReturnPath,
  isAppNavCurrent,
  isRecapPath,
} from "@/lib/challenge/paths";
import { earnedMilestones } from "@/lib/challenge/milestones";
import { displayNameFromJoin } from "@/lib/challenge/profile";
import { challengeDayLine, todayStatus } from "@/lib/challenge/today-copy";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sample: BoardRow[] = [
  {
    id: "a",
    name: "Ann",
    daysHit: 2,
    streak: 1,
    total: 250,
    surplus: 50,
    hitPaceMs: null,
    me: false,
  },
  {
    id: "b",
    name: "Bea",
    daysHit: 3,
    streak: 3,
    total: 300,
    surplus: 0,
    hitPaceMs: null,
    me: true,
  },
  {
    id: "c",
    name: "Cal",
    daysHit: 3,
    streak: 1,
    total: 400,
    surplus: 100,
    hitPaceMs: null,
    me: false,
  },
];

describe("todayStatus", () => {
  it("matches product screen 4 copy", () => {
    expect(todayStatus(0, 100, 0, false)).toBe("Nothing logged. Floor is 100.");
    expect(todayStatus(40, 60, 0, false)).toBe("60 left");
    expect(todayStatus(100, 0, 0, true)).toBe("Hit. Surplus 0");
    expect(todayStatus(140, 0, 40, true)).toBe("Hit. Surplus 40");
  });
});

describe("challengeDayLine", () => {
  it("says starts before day 1", () => {
    expect(challengeDayLine(0, 365, "2026-09-01")).toBe(
      "Starts 2026-09-01. Floor is 100.",
    );
  });

  it("counts the shared window", () => {
    expect(challengeDayLine(47, 365, "2026-09-01")).toBe("Day 47 of 365");
  });

  it("closes after the last day", () => {
    expect(challengeDayLine(366, 365, "2026-09-01")).toBe(
      "Challenge window is over.",
    );
  });
});

describe("sortBoard", () => {
  it("defaults to days hit, then streak, then total", () => {
    const ranked = sortBoard(sample, "days");
    expect(ranked.map((row) => row.id)).toEqual(["b", "c", "a"]);
  });

  it("can sort by streak or total", () => {
    expect(sortBoard(sample, "streak")[0].id).toBe("b");
    expect(sortBoard(sample, "total")[0].id).toBe("c");
  });

  it("breaks a full stats tie on earlier hit pace, then name", () => {
    const tied: BoardRow[] = [
      {
        id: "2",
        name: "Bea",
        daysHit: 3,
        streak: 3,
        total: 300,
        surplus: 0,
        hitPaceMs: 8 * 3600 * 1000,
        me: false,
      },
      {
        id: "1",
        name: "Ann",
        daysHit: 3,
        streak: 3,
        total: 300,
        surplus: 0,
        hitPaceMs: 7 * 3600 * 1000,
        me: false,
      },
    ];
    expect(sortBoard(tied, "days").map((row) => row.id)).toEqual(["1", "2"]);
    const samePace = tied.map((row) => ({
      ...row,
      hitPaceMs: 7 * 3600 * 1000,
    }));
    expect(sortBoard(samePace, "days").map((row) => row.name)).toEqual([
      "Ann",
      "Bea",
    ]);
  });
});

describe("sortTodayBoard", () => {
  it("ranks hit first, then today's total, then who crossed 100 earlier", () => {
    const ranked = sortTodayBoard([
      {
        id: "c",
        name: "Cal",
        total: 100,
        hit: true,
        hitAt: "2026-08-31T09:00:00.000Z",
      },
      {
        id: "a",
        name: "Ann",
        total: 100,
        hit: true,
        hitAt: "2026-08-31T07:00:00.000Z",
      },
      { id: "b", name: "Bea", total: 40, hit: false, hitAt: null },
    ]);
    expect(ranked.map((row) => row.id)).toEqual(["a", "c", "b"]);
  });
});

describe("dailySurplus", () => {
  it("ignores days under the floor", () => {
    expect(dailySurplus(100, 40)).toBe(0);
    expect(dailySurplus(100, 140)).toBe(40);
  });
});

describe("heatmapTone", () => {
  it("splits zero, short, and hit", () => {
    expect(heatmapTone(0)).toBe("zero");
    expect(heatmapTone(99)).toBe("progress");
    expect(heatmapTone(100)).toBe("hit");
  });

  it("paints hit with a CSS variable so color-scheme cannot grey out the cell", () => {
    expect(heatmapSwatch(100)).toBe("var(--heatmap-hit)");
    expect(heatmapSwatch(40)).toBe("var(--heatmap-progress)");
    expect(heatmapSwatch(0)).toBe("var(--heatmap-zero)");
  });
});

describe("heatmapGridStart", () => {
  it("includes today when the challenge has not started", () => {
    expect(heatmapGridStart("2026-08-31", "2026-09-01")).toBe("2026-08-31");
    expect(heatmapGridStart("2026-09-15", "2026-09-01")).toBe("2026-09-01");
  });
});

describe("initialHeatmapDate", () => {
  it("selects today, including days before starts_on", () => {
    expect(initialHeatmapDate("2026-08-31", "2026-08-31", "2027-08-31")).toBe(
      "2026-08-31",
    );
    expect(initialHeatmapDate("2026-09-15", "2026-09-01", "2027-08-31")).toBe(
      "2026-09-15",
    );
    expect(initialHeatmapDate("2027-09-01", "2026-09-01", "2027-08-31")).toBe(
      "2027-08-31",
    );
  });
});

describe("appReturnPath", () => {
  it("allowlists settings, else home", () => {
    expect(appReturnPath("/app/settings")).toBe("/app/settings");
    expect(appReturnPath("/login")).toBe("/app");
    expect(appReturnPath(null)).toBe("/app");
  });
});

describe("app chrome paths", () => {
  it("does not treat Purse as Today", () => {
    expect(isAppNavCurrent("/app", "/app")).toBe(true);
    expect(isAppNavCurrent("/app/purse", "/app")).toBe(false);
    expect(isAppNavCurrent("/app/purse", "/app/purse")).toBe(true);
  });

  it("marks recap from the year recap route", () => {
    expect(isRecapPath("/app/you/recap")).toBe(true);
    expect(isRecapPath("/app/you")).toBe(false);
  });
});

describe("earnedMilestones", () => {
  it("unlocks 7 / 30 / 100 / 365 at those day counts", () => {
    expect(earnedMilestones(0)).toEqual([]);
    expect(earnedMilestones(7)).toEqual([7]);
    expect(earnedMilestones(30)).toEqual([7, 30]);
    expect(earnedMilestones(100)).toEqual([7, 30, 100]);
    expect(earnedMilestones(365)).toEqual([7, 30, 100, 365]);
  });
});

describe("displayNameFromJoin", () => {
  it("unwraps supabase nested objects or arrays", () => {
    expect(displayNameFromJoin({ display_name: "Jo" })).toBe("Jo");
    expect(displayNameFromJoin([{ display_name: "Jo" }])).toBe("Jo");
    expect(displayNameFromJoin({ display_name: null })).toBe("Unnamed");
    expect(displayNameFromJoin(null)).toBe("Unnamed");
  });
});

describe("home page is not the stub", () => {
  it("does not render the supabase placeholder", () => {
    const src = readFileSync("app/app/page.tsx", "utf8");
    expect(src).not.toMatch(/Check-in lands here/);
    expect(src).toMatch(/todayStatus/);
  });
});
