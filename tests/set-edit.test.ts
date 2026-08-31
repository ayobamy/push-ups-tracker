import {
  deleteSetPrompt,
  editSetDirty,
  SAVE_SET_LABEL,
} from "@/lib/challenge/set-edit";
import { describe, expect, it } from "vitest";

describe("deleteSetPrompt", () => {
  it("names the reps that will go", () => {
    expect(deleteSetPrompt(25)).toBe("Delete 25 reps from today?");
  });
});

describe("SAVE_SET_LABEL", () => {
  it("says the box is a count, not a new set", () => {
    expect(SAVE_SET_LABEL).toBe("Save count");
  });
});

describe("editSetDirty", () => {
  it("is false while the box still matches the logged set", () => {
    expect(editSetDirty(25, "25")).toBe(false);
    expect(editSetDirty(25, " 25 ")).toBe(false);
  });

  it("is true once the box is a different count", () => {
    expect(editSetDirty(25, "20")).toBe(true);
    expect(editSetDirty(25, "")).toBe(true);
  });
});
