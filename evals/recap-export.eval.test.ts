import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Recap card downloads as PNG, SVG, and JPG from the same SVG source.
 * Pass threshold: every case.
 */
describe("eval: recap download", () => {
  it("offers png, svg, and jpg on the recap screen", () => {
    const page = readFileSync("app/app/you/recap/page.tsx", "utf8");
    expect(page).toContain("RecapExport");
    const exportSrc = readFileSync("components/recap-export.tsx", "utf8");
    expect(exportSrc).toContain('"png"');
    expect(exportSrc).toContain('"svg"');
    expect(exportSrc).toContain('"jpg"');
    expect(exportSrc).toContain("recapCardSvg");
  });
});
