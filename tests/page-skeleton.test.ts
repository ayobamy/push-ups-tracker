import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("page skeleton", () => {
  const src = readFileSync("components/page-skeleton.tsx", "utf8");

  it("is a pulse shell with a live loading name", () => {
    expect(src).toContain("animate-pulse");
    expect(src).toContain('aria-busy="true"');
    expect(src).toContain("Loading");
    expect(src).toContain("motion-reduce:animate-none");
  });
});
