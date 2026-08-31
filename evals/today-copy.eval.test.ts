import { eveningNudge } from "@/lib/challenge/remaining";
import {
  challengeDayLine,
  todayHitLine,
  todayStatus,
} from "@/lib/challenge/today-copy";
import { describe, expect, it } from "vitest";

/**
 * Frozen product.md screen 4 copy. This is the eval suite for Today
 * until Playwright journeys exist. Pass threshold: every case.
 */
describe("eval: Today copy contract", () => {
  it("zero morning, remaining, hit, evening nudge, day index", () => {
    expect(todayStatus(0, 100, 0, false)).toBe("Nothing logged. Floor is 100.");
    expect(todayStatus(25, 75, 0, false)).toBe("75 left");
    expect(todayStatus(120, 0, 20, true)).toBe("Hit. Surplus 20");
    expect(eveningNudge(20, 100, 70)).toBe("Still 30 short before midnight.");
    expect(challengeDayLine(1, 365, "2026-09-01")).toBe("Day 1 of 365");
    expect(todayHitLine(12, 21)).toBe("12 of 21 hit");
  });
});
