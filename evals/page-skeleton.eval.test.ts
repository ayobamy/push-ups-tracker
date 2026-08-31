import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Nav clicks must show a loading.tsx skeleton instead of a blank
 * wait on the server page. Pass threshold: every case.
 */
describe("eval: app route skeletons", () => {
  it("each app page has a loading.tsx that uses PageSkeleton", () => {
    const files = [
      ["app/app/loading.tsx", "today"],
      ["app/app/board/loading.tsx", "board"],
      ["app/app/you/loading.tsx", "you"],
      ["app/app/settings/loading.tsx", "settings"],
    ] as const;
    for (const [path, variant] of files) {
      const src = readFileSync(path, "utf8");
      expect(src).toContain("PageSkeleton");
      expect(src).toContain(`variant="${variant}"`);
    }
  });
});
