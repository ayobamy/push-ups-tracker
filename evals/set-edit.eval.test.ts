import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Clickables show a pointer. Delete asks before it fires.
 * Save writes the edited count. Pass threshold: every case.
 */
describe("eval: set edit affordances", () => {
  it("sets pointer on buttons and links in global CSS", () => {
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toContain("cursor: pointer");
    expect(css).toContain("button:not(:disabled)");
    expect(css).toContain("a[href]");
  });

  it("delete opens a confirm dialog before the server action", () => {
    const control = readFileSync("components/delete-set-control.tsx", "utf8");
    expect(control).toContain("showModal");
    expect(control).toContain("<dialog");
    expect(control).toContain("deleteSet");
    expect(control).toContain('method="dialog"');
  });

  it("save is labeled as writing the edited count", () => {
    const checkIn = readFileSync("app/app/check-in.tsx", "utf8");
    expect(checkIn).toContain("SAVE_SET_LABEL");
    expect(checkIn).toContain("DeleteSetControl");
  });
});
