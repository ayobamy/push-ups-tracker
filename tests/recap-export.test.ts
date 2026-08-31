import { recapLine } from "@/lib/challenge/recap";
import {
  RECAP_HEAT,
  recapCardSvg,
  recapDownloadName,
  recapHeatHex,
  xmlEscape,
} from "@/lib/challenge/recap-svg";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("recap export", () => {
  it("escapes names so SVG stays well-formed", () => {
    expect(xmlEscape(`A & B <c>`)).toBe("A &amp; B &lt;c&gt;");
  });

  it("builds a download name with png, svg, and jpg", () => {
    expect(recapDownloadName("Ahmed O.", "png")).toBe(
      "100-a-day-recap-ahmed-o.png",
    );
    expect(recapDownloadName("Ahmed O.", "svg")).toBe(
      "100-a-day-recap-ahmed-o.svg",
    );
    expect(recapDownloadName("Ahmed O.", "jpg")).toBe(
      "100-a-day-recap-ahmed-o.jpg",
    );
  });

  it("paints the heatmap with dark-card hex, not CSS variables", () => {
    expect(recapHeatHex(100)).toBe(RECAP_HEAT.hit);
    expect(recapHeatHex(40)).toBe(RECAP_HEAT.progress);
    expect(recapHeatHex(0)).toBe(RECAP_HEAT.zero);
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toContain(`--heatmap-hit: ${RECAP_HEAT.hit}`);
    expect(css).toContain(`--heatmap-progress: ${RECAP_HEAT.progress}`);
    expect(css).toContain(`--heatmap-zero: ${RECAP_HEAT.zero}`);
  });

  it("embeds the name, recap line, and one rect per day", () => {
    const cells = [
      { date: "2026-08-31", reps: 100 },
      { date: "2026-09-01", reps: 40 },
      { date: "2026-09-02", reps: 0 },
    ];
    const svg = recapCardSvg({
      name: "Ada & Co",
      daysHit: 1,
      longest: 1,
      cells,
    });
    expect(svg).toContain("Ada &amp; Co");
    expect(svg).toContain(xmlEscape(recapLine(1, 1)));
    expect(svg).toContain(RECAP_HEAT.hit);
    expect(svg).toContain(RECAP_HEAT.progress);
    expect(svg).toContain(RECAP_HEAT.zero);
    expect(svg.split("<rect ").length - 1).toBe(1 + cells.length);
  });
});
