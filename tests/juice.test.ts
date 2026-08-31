import { addCalendarDays } from "@/lib/challenge/day";
import { pendingCeremony } from "@/lib/challenge/ceremony";
import { recapLine } from "@/lib/challenge/recap";
import { longestStreak } from "@/lib/challenge/streak";
import {
  elapsedWeekDates,
  hitEveryElapsedDay,
  mondayOfWeek,
  weekPerfectNames,
  weekScoreLine,
} from "@/lib/challenge/week";
import { describe, expect, it } from "vitest";

describe("longestStreak", () => {
  it("is 0 with no hits", () => {
    expect(longestStreak([])).toBe(0);
  });

  it("counts the longest consecutive run, not the current one", () => {
    expect(
      longestStreak(["2026-08-31", "2026-09-01", "2026-09-02", "2026-09-05"]),
    ).toBe(3);
  });
});

describe("week window", () => {
  it("starts Monday and scores elapsed days only", () => {
    expect(mondayOfWeek("2026-09-02")).toBe("2026-08-31");
    expect(elapsedWeekDates("2026-08-31", "2026-09-02")).toEqual([
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
    ]);
    expect(weekScoreLine("2026-08-31", "2026-09-02")).toBe("3/3 this week");
  });

  it("lists only people who hit every elapsed day", () => {
    const monday = "2026-08-31";
    const today = "2026-09-02";
    const names = weekPerfectNames(
      [
        { name: "Ann", hits: ["2026-08-31", "2026-09-01", "2026-09-02"] },
        { name: "Bea", hits: ["2026-08-31", "2026-09-02"] },
      ],
      monday,
      today,
    );
    expect(names).toEqual(["Ann"]);
    expect(
      hitEveryElapsedDay(
        ["2026-08-31", "2026-09-01", "2026-09-02"],
        monday,
        today,
      ),
    ).toBe(true);
  });

  it("is a full 7/7 on Sunday", () => {
    const monday = mondayOfWeek("2026-09-06");
    expect(monday).toBe("2026-08-31");
    expect(elapsedWeekDates(monday, "2026-09-06")).toHaveLength(7);
    expect(addCalendarDays(monday, 6)).toBe("2026-09-06");
  });
});

describe("pendingCeremony", () => {
  it("fires 100 then 365, each once", () => {
    expect(pendingCeremony(99, [])).toBe(null);
    expect(pendingCeremony(100, [])).toBe(100);
    expect(pendingCeremony(120, [100])).toBe(null);
    expect(pendingCeremony(365, [100])).toBe(365);
    expect(pendingCeremony(365, [100, 365])).toBe(null);
  });
});

describe("recapLine", () => {
  it("names days hit and longest streak", () => {
    expect(recapLine(47, 12)).toBe("47 days hit. Longest streak 12.");
  });
});
