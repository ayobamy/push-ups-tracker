import { describe, expect, it } from "vitest";
import {
  eveningNudge,
  hitGoal,
  remainingToGoal,
  surplusOverGoal,
} from "@/lib/challenge/remaining";

describe("remaining helpers", () => {
  it("remaining is zero once the floor is hit", () => {
    expect(remainingToGoal(100, 40)).toBe(60);
    expect(remainingToGoal(100, 100)).toBe(0);
    expect(remainingToGoal(100, 140)).toBe(0);
  });

  it("surplus only counts past the floor", () => {
    expect(surplusOverGoal(100, 40)).toBe(0);
    expect(surplusOverGoal(100, 140)).toBe(40);
  });

  it("hit is inclusive of the floor", () => {
    expect(hitGoal(100, 99)).toBe(false);
    expect(hitGoal(100, 100)).toBe(true);
  });
});

describe("eveningNudge", () => {
  it("nags after 20:00 when short", () => {
    expect(eveningNudge(20, 100, 60)).toBe("Still 40 short before midnight.");
    expect(eveningNudge(19, 100, 60)).toBeNull();
    expect(eveningNudge(21, 100, 100)).toBeNull();
  });
});
