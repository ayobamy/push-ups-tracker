import { describe, expect, it } from "vitest";
import { addCalendarDays, localDateFromInstant } from "@/lib/challenge/day";

describe("localDateFromInstant", () => {
  it("uses the IANA zone, not UTC", () => {
    // 2026-09-01 00:30 UTC is still 31 Aug in New York (EDT, UTC-4)
    const instant = new Date("2026-09-01T00:30:00.000Z");
    expect(localDateFromInstant(instant, "America/New_York")).toBe(
      "2026-08-31",
    );
    expect(localDateFromInstant(instant, "UTC")).toBe("2026-09-01");
  });

  it("keeps London on the spring-forward morning", () => {
    // 2026-03-29 00:30 UTC is 00:30 GMT (before 01:00 BST jump)
    const before = new Date("2026-03-29T00:30:00.000Z");
    expect(localDateFromInstant(before, "Europe/London")).toBe("2026-03-29");
  });

  it("stays 29 March after London springs forward", () => {
    const after = new Date("2026-03-29T01:30:00.000Z");
    expect(localDateFromInstant(after, "Europe/London")).toBe("2026-03-29");
  });
});

describe("addCalendarDays", () => {
  it("crosses month ends", () => {
    expect(addCalendarDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addCalendarDays("2026-09-01", -1)).toBe("2026-08-31");
  });
});
