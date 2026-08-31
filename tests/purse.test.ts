import {
  HALF_POINTS,
  HIT_POINTS,
  RECOVERY_HITS,
  hitSequence,
  purseFromHits,
  sortPurse,
  type PurseStanding,
} from "@/lib/challenge/purse";
import { describe, expect, it } from "vitest";

describe("purseFromHits", () => {
  it("pays full points for an unbroken run", () => {
    const hits = [true, true, true];
    expect(purseFromHits(hits)).toEqual({
      total: 3 * HIT_POINTS,
      earns: [10, 10, 10],
      half: false,
      recoveryHits: 0,
    });
  });

  it("pays nothing on a miss and switches to half until 5 hits in a row", () => {
    const afterMiss = purseFromHits([true, false]);
    expect(afterMiss.total).toBe(HIT_POINTS);
    expect(afterMiss.earns).toEqual([10, 0]);
    expect(afterMiss.half).toBe(true);
    expect(afterMiss.recoveryHits).toBe(0);
  });

  it("keeps half through the five makeup days, then the next hit is full", () => {
    const hits = [false, true, true, true, true, true, true];
    const result = purseFromHits(hits);
    expect(result.earns).toEqual([0, 5, 5, 5, 5, 5, 10]);
    expect(result.total).toBe(5 * HALF_POINTS + HIT_POINTS);
    expect(result.half).toBe(false);
    expect(RECOVERY_HITS).toBe(5);
  });

  it("restarts the five if you miss during recovery", () => {
    const hits = [false, true, true, false, true];
    const result = purseFromHits(hits);
    expect(result.earns).toEqual([0, 5, 5, 0, 5]);
    expect(result.half).toBe(true);
    expect(result.recoveryHits).toBe(1);
  });
});

describe("hitSequence", () => {
  it("fills missed days as false so a gap costs purse points", () => {
    expect(
      hitSequence("2026-08-31", "2026-09-02", ["2026-08-31", "2026-09-02"]),
    ).toEqual([true, false, true]);
  });

  it("is empty when today is before the start", () => {
    expect(hitSequence("2026-08-31", "2026-08-30", [])).toEqual([]);
  });
});

describe("sortPurse", () => {
  it("ranks points first, then the board tie breaks", () => {
    const rows: PurseStanding[] = [
      {
        id: "b",
        name: "B",
        points: 10,
        half: false,
        recoveryHits: 0,
        daysHit: 9,
        streak: 9,
        total: 900,
        me: false,
      },
      {
        id: "a",
        name: "A",
        points: 20,
        half: false,
        recoveryHits: 0,
        daysHit: 2,
        streak: 1,
        total: 200,
        me: true,
      },
      {
        id: "c",
        name: "C",
        points: 10,
        half: true,
        recoveryHits: 1,
        daysHit: 9,
        streak: 2,
        total: 900,
        me: false,
      },
    ];
    expect(sortPurse(rows).map((row) => row.id)).toEqual(["a", "b", "c"]);
  });
});
