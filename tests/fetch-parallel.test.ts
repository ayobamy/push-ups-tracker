import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("app fetch waterfalls", () => {
  it("loads Today without a join RPC and with parallel queries", () => {
    const src = readFileSync("app/app/page.tsx", "utf8");
    expect(src).toContain("Promise.all");
    expect(src).not.toContain("join_active_challenge");
  });

  it("loads Board, You, Purse, and Recap in parallel", () => {
    for (const path of [
      "app/app/board/page.tsx",
      "app/app/you/page.tsx",
      "app/app/purse/page.tsx",
      "app/app/you/recap/page.tsx",
    ]) {
      expect(readFileSync(path, "utf8")).toContain("Promise.all");
    }
  });
});
