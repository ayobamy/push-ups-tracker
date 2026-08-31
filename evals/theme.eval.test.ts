import { THEME_BOOT_SCRIPT, THEME_KEY } from "@/lib/theme/theme";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Frozen contract for appearance: native date glyph contrast,
 * a hit cell that stays green under color-scheme: dark, and an
 * icon theme toggle. Pass threshold: every case.
 */
describe("eval: theme, date glyph, heatmap hit", () => {
  it("layout boots theme before paint and exposes a toggle", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toContain("THEME_BOOT_SCRIPT");
    expect(layout).toContain("suppressHydrationWarning");
    expect(layout).toContain("ThemeToggle");
    expect(THEME_BOOT_SCRIPT).toContain(`"${THEME_KEY}"`);
  });

  it("corner toggle is a single sun/moon icon, not Light/Dark boxes", () => {
    const toggle = readFileSync("components/theme-toggle.tsx", "utf8");
    expect(toggle).toContain("SunIcon");
    expect(toggle).toContain("MoonIcon");
    expect(toggle).toContain("fixed top-3 right-3");
    expect(toggle).toContain("w-11");
    expect(toggle).toContain("<SunIcon");
    const iconReturn = toggle.slice(toggle.lastIndexOf("return ("));
    expect(iconReturn).toContain("SunIcon");
    expect(iconReturn).not.toContain('"Light"');
    expect(iconReturn).not.toContain('"Dark"');
  });

  it("settings keeps an explicit Light / Dark control", () => {
    const settings = readFileSync("app/app/settings/page.tsx", "utf8");
    expect(settings).toContain('variant="row"');
  });

  it("You date field draws a calendar icon over a hidden native glyph", () => {
    const heatmap = readFileSync("app/app/heatmap.tsx", "utf8");
    expect(heatmap).toContain('type="date"');
    expect(heatmap).toContain("CalendarIcon");
    expect(heatmap).toContain("dark:text-zinc-100");
  });

  it("hit cells use the heatmap-hit token, not a Tailwind bg class color-scheme can eat", () => {
    const heatmap = readFileSync("app/app/heatmap.tsx", "utf8");
    expect(heatmap).toContain("heatmapSwatch");
    expect(heatmap).toContain("appearance-none");
    expect(heatmap).not.toContain("bg-emerald-500");
  });
});
