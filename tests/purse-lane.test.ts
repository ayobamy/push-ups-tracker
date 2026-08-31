import { purseLane, PURSE_LANES } from "@/lib/challenge/purse-lane";
import { TOP_REDEEM } from "@/lib/challenge/purse";
import { describe, expect, it } from "vitest";

function relativeLuminance(hex: string): number {
  const raw = hex.replace("#", "");
  const rgb = [0, 1, 2].map((i) => {
    const channel = parseInt(raw.slice(i * 2, i * 2 + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(a: string, b: string): number {
  const left = relativeLuminance(a);
  const right = relativeLuminance(b);
  const [hi, lo] = left > right ? [left, right] : [right, left];
  return (hi + 0.05) / (lo + 0.05);
}

describe("purseLane", () => {
  it("paints exactly the redeem places, then none", () => {
    expect(PURSE_LANES).toHaveLength(TOP_REDEEM);
    expect(purseLane(0)?.background).toBe("#E8C547");
    expect(purseLane(TOP_REDEEM - 1)?.background).toBe("#542018");
    expect(purseLane(TOP_REDEEM)).toBeNull();
    expect(purseLane(-1)).toBeNull();
  });

  it("keeps ten related metals, each unique", () => {
    const fills = PURSE_LANES.map((lane) => lane.background);
    expect(new Set(fills).size).toBe(TOP_REDEEM);
  });

  it("keeps body ink at 4.5:1 on every solid fill", () => {
    for (const lane of PURSE_LANES) {
      expect(contrastRatio(lane.background, lane.ink)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });
});
