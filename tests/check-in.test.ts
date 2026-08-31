import { addCalendarDays, type IsoDate } from "@/lib/challenge/day";
import { describe, expect, it } from "vitest";
import { parseReps } from "@/lib/challenge/reps";
import {
  isIanaTimeZone,
  parseDisplayName,
  isDisplayNameTakenError,
  displayNameKey,
} from "@/lib/challenge/profile";
import { challengeDayNumber, localHour } from "@/lib/challenge/schedule";

describe("parseReps", () => {
  it("accepts whole numbers from 1 to 1000", () => {
    expect(parseReps("1")).toEqual({ ok: true, reps: 1 });
    expect(parseReps(" 25 ")).toEqual({ ok: true, reps: 25 });
    expect(parseReps("1000")).toEqual({ ok: true, reps: 1000 });
  });

  it("rejects junk and out of range", () => {
    expect(parseReps("0").ok).toBe(false);
    expect(parseReps("1001").ok).toBe(false);
    expect(parseReps("25.5").ok).toBe(false);
    expect(parseReps("ten").ok).toBe(false);
  });
});

describe("parseDisplayName", () => {
  it("trims and accepts 2 to 32 characters", () => {
    expect(parseDisplayName("  Jo ")).toEqual({
      ok: true,
      displayName: "Jo",
    });
  });

  it("rejects short and long names", () => {
    expect(parseDisplayName("J").ok).toBe(false);
    expect(parseDisplayName("x".repeat(33)).ok).toBe(false);
  });
});

describe("isDisplayNameTakenError", () => {
  it("treats Postgres unique_violation as taken", () => {
    expect(isDisplayNameTakenError({ code: "23505" })).toBe(true);
    expect(
      isDisplayNameTakenError({
        message: "duplicate key value violates unique constraint",
      }),
    ).toBe(true);
    expect(isDisplayNameTakenError({ code: "PGRST205" })).toBe(false);
  });
});

describe("displayNameKey", () => {
  it("collapses case so Ahmed and ahmed are the same name", () => {
    expect(displayNameKey("Ahmed")).toBe(displayNameKey("ahmed"));
    expect(displayNameKey("  Jo ")).toBe("jo");
  });
});

describe("challengeDayNumber", () => {
  it("is 1 on the start date", () => {
    expect(challengeDayNumber("2026-09-01", "2026-09-01")).toBe(1);
  });

  it("is 0 before the start", () => {
    expect(challengeDayNumber("2026-09-01", "2026-08-31")).toBe(0);
  });

  it("counts consecutive local dates", () => {
    expect(
      challengeDayNumber(
        "2026-09-01",
        addCalendarDays("2026-09-01", 46) as IsoDate,
      ),
    ).toBe(47);
  });
});

describe("isIanaTimeZone", () => {
  it("accepts real zones and rejects junk", () => {
    expect(isIanaTimeZone("Europe/London")).toBe(true);
    expect(isIanaTimeZone("not-a-zone")).toBe(false);
  });
});

describe("localHour", () => {
  it("uses the 0-23 clock in the given zone", () => {
    expect(localHour(new Date("2026-09-01T00:30:00Z"), "UTC")).toBe(0);
    expect(localHour(new Date("2026-09-01T20:00:00Z"), "UTC")).toBe(20);
  });
});
