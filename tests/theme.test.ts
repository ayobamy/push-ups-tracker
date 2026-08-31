import {
  parseTheme,
  resolveTheme,
  THEME_BOOT_SCRIPT,
  THEME_KEY,
} from "@/lib/theme/theme";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("theme", () => {
  it("parses only light or dark", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("system")).toBeNull();
    expect(parseTheme("")).toBeNull();
    expect(parseTheme(null)).toBeNull();
  });

  it("stored choice wins over system preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows system when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("boot script paints color-scheme from the same storage key", () => {
    expect(THEME_BOOT_SCRIPT).toContain(THEME_KEY);
    expect(THEME_BOOT_SCRIPT).toContain("colorScheme");
    expect(THEME_BOOT_SCRIPT).toContain("prefers-color-scheme: dark");
  });
});

describe("date picker contrast", () => {
  const css = readFileSync("app/globals.css", "utf8");

  it("hides the native calendar glyph so a drawn icon can sit on top", () => {
    expect(css).toContain("::-webkit-calendar-picker-indicator");
    expect(css).toMatch(/calendar-picker-indicator[^}]*opacity:\s*0/);
  });
});

describe("heatmap swatches", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const heatmap = readFileSync("app/app/heatmap.tsx", "utf8");

  it("defines hit green that is not the empty-cell grey", () => {
    expect(css).toContain("--heatmap-hit: #4ade80");
    expect(css).toContain("--heatmap-zero: #3f3f46");
    expect(heatmap).toContain("heatmapSwatch");
    expect(heatmap).toContain("appearance-none");
  });
});
