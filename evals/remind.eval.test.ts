import { shouldSendEveningReminder } from "@/lib/mail/remind";
import { pickReminderTargets } from "@/lib/mail/remind-run";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Late local send must still skip hits. Pass threshold: every case.
 */
describe("eval: evening reminder late send", () => {
  it("ignoreHour mails the short list after 20:00 and never a hit", () => {
    expect(
      shouldSendEveningReminder({
        optIn: true,
        alreadySent: false,
        localHour: 22,
        todayReps: 40,
        goal: 100,
        localDate: "2026-09-01",
        startsOn: "2026-08-31",
        durationDays: 365,
        ignoreHour: true,
      }),
    ).toBe(true);
    expect(
      shouldSendEveningReminder({
        optIn: true,
        alreadySent: false,
        localHour: 22,
        todayReps: 100,
        goal: 100,
        localDate: "2026-09-01",
        startsOn: "2026-08-31",
        durationDays: 365,
        ignoreHour: true,
      }),
    ).toBe(false);
    expect(pickReminderTargets([], { ignoreHour: true })).toEqual([]);
  });

  it("local script exposes --ignore-hour without changing the Vercel cron hour", () => {
    const script = readFileSync("scripts/send-reminders.mts", "utf8");
    const cron = readFileSync("app/api/cron/remind/route.ts", "utf8");
    const send = readFileSync("lib/mail/send-evening.ts", "utf8");
    expect(script).toContain("--ignore-hour");
    expect(cron).not.toContain("ignoreHour");
    expect(send).not.toContain('"@/lib');
  });
});
