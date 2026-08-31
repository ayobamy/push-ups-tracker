import { describe, expect, it } from "vitest";
import { visibilityLabel } from "@/lib/auth/visibility";

describe("visibilityLabel", () => {
  it("names show when hidden", () => {
    expect(visibilityLabel(false)).toBe("Show password");
  });

  it("names hide when visible", () => {
    expect(visibilityLabel(true)).toBe("Hide password");
  });

  it("uses the field name for confirm", () => {
    expect(visibilityLabel(false, "confirm password")).toBe(
      "Show confirm password",
    );
    expect(visibilityLabel(true, "confirm password")).toBe(
      "Hide confirm password",
    );
  });
});
