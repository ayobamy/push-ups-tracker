import { deleteSetPrompt, SAVE_SET_LABEL } from "@/lib/challenge/set-edit";
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
