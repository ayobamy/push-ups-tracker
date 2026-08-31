import {
  compareHitPace,
  compareName,
  firstHitAt,
  firstHitSet,
  hitPaceMs,
  millisIntoLocalDay,
} from "@/lib/challenge/hit-at";
import { timezoneFromJoin } from "@/lib/challenge/profile";
import { describe, expect, it } from "vitest";

describe("firstHitAt", () => {
  it("is the logged_at of the set that first makes the running sum hit the floor", () => {
    expect(
      firstHitAt(
        [
          { id: "a", reps: 40, loggedAt: "2026-08-31T07:00:00.000Z" },
          { id: "b", reps: 60, loggedAt: "2026-08-31T08:15:00.000Z" },
        ],
        100,
      ),
    ).toBe("2026-08-31T08:15:00.000Z");
  });

  it("uses the first set when that set already clears the floor", () => {
    expect(
      firstHitAt(
        [{ id: "a", reps: 100, loggedAt: "2026-08-31T06:00:00.000Z" }],
        100,
      ),
    ).toBe("2026-08-31T06:00:00.000Z");
  });

  it("is null while the day is still short", () => {
    expect(
      firstHitAt(
        [
          { id: "a", reps: 50, loggedAt: "2026-08-31T07:00:00.000Z" },
          { id: "b", reps: 40, loggedAt: "2026-08-31T08:00:00.000Z" },
        ],
        100,
      ),
    ).toBeNull();
  });

  it("orders by logged_at then id when two sets share a timestamp", () => {
    const at = "2026-08-31T07:00:00.000Z";
    expect(
      firstHitSet(
        [
          { id: "z", reps: 100, loggedAt: at },
          { id: "a", reps: 100, loggedAt: at },
        ],
        100,
      )?.id,
    ).toBe("a");
  });
});

describe("millisIntoLocalDay", () => {
  it("uses the IANA zone, not UTC", () => {
    const instant = new Date("2026-08-31T07:30:00.000Z");
    expect(millisIntoLocalDay(instant, "UTC")).toBe((7 * 60 + 30) * 60 * 1000);
    expect(millisIntoLocalDay(instant, "Africa/Lagos")).toBe(
      (8 * 60 + 30) * 60 * 1000,
    );
  });
});

describe("hitPaceMs", () => {
  it("averages local time of day so which dates you hit cannot steal the last key", () => {
    const morning = "2026-08-31T06:00:00.000Z";
    const laterDay = "2026-09-30T06:00:00.000Z";
    expect(hitPaceMs([morning], "UTC")).toBe(hitPaceMs([laterDay], "UTC"));
  });

  it("is null with no hit instants", () => {
    expect(hitPaceMs([], "UTC")).toBeNull();
  });
});

describe("compareHitPace", () => {
  it("ranks earlier local pace first, and missing pace last", () => {
    expect(compareHitPace(1, 2)).toBeLessThan(0);
    expect(compareHitPace(null, 1)).toBeGreaterThan(0);
    expect(compareHitPace(1, null)).toBeLessThan(0);
    expect(compareHitPace(null, null)).toBe(0);
  });
});

describe("compareName", () => {
  it("is case-insensitive so Ann beats bea", () => {
    expect(compareName("Ann", "bea")).toBeLessThan(0);
    expect(compareName("Ann", "ann")).toBe(0);
  });
});

describe("timezoneFromJoin", () => {
  it("reads a nested profile row and falls back to UTC", () => {
    expect(timezoneFromJoin({ timezone: "Africa/Lagos" })).toBe("Africa/Lagos");
    expect(timezoneFromJoin([{ timezone: "Europe/London" }])).toBe(
      "Europe/London",
    );
    expect(timezoneFromJoin({ timezone: "not-a-zone" })).toBe("UTC");
    expect(timezoneFromJoin(null)).toBe("UTC");
  });
});
