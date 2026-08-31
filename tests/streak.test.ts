import { describe, expect, it } from "vitest";
import { currentStreak } from "@/lib/challenge/streak";

describe("currentStreak", () => {
  it("is 0 with no hits", () => {
    expect(currentStreak([], "2026-09-10")).toBe(0);
  });

  it("counts back from today when today is a hit", () => {
    const hits = ["2026-09-08", "2026-09-09", "2026-09-10"];
    expect(currentStreak(hits, "2026-09-10")).toBe(3);
  });

  it("uses yesterday when today is not a hit yet", () => {
    const hits = ["2026-09-08", "2026-09-09"];
    expect(currentStreak(hits, "2026-09-10")).toBe(2);
  });

  it("is 0 when yesterday was also a miss", () => {
    const hits = ["2026-09-07"];
    expect(currentStreak(hits, "2026-09-10")).toBe(0);
  });

  it("stops at a gap", () => {
    const hits = ["2026-09-07", "2026-09-09", "2026-09-10"];
    expect(currentStreak(hits, "2026-09-10")).toBe(2);
  });
});
