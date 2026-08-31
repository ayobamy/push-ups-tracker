import { podiumPlace } from "@/lib/challenge/podium";
import { reminderCopy, shouldSendEveningReminder } from "@/lib/mail/remind";
import { escapeHtml } from "@/lib/mail/remind-render";
import { pickReminderTargets } from "@/lib/mail/remind-run";
import { quoteForPath, STOIC_QUOTES } from "@/lib/quotes/stoic";
import { describe, expect, it } from "vitest";

describe("podiumPlace", () => {
  it("marks the first three ranks", () => {
    expect(podiumPlace(0)).toBe(1);
    expect(podiumPlace(1)).toBe(2);
    expect(podiumPlace(2)).toBe(3);
    expect(podiumPlace(3)).toBeNull();
  });
});

describe("stoic quotes", () => {
  it("cites the source on every line", () => {
    for (const quote of STOIC_QUOTES) {
      expect(quote.attribution.length).toBeGreaterThan(10);
      expect(quote.text.length).toBeGreaterThan(20);
    }
  });

  it("is stable per path", () => {
    expect(quoteForPath("/signup")).toEqual(quoteForPath("/signup"));
    expect(quoteForPath("/").attribution.length).toBeGreaterThan(10);
  });
});

describe("shouldSendEveningReminder", () => {
  const base = {
    optIn: true,
    alreadySent: false,
    localHour: 20,
    todayReps: 40,
    goal: 100,
    localDate: "2026-09-01",
    startsOn: "2026-09-01",
    durationDays: 365,
  };

  it("sends at 20:00 when short, in window, opted in, not yet mailed", () => {
    expect(shouldSendEveningReminder(base)).toBe(true);
  });

  it("does not nag after a hit, before start, or twice", () => {
    expect(shouldSendEveningReminder({ ...base, todayReps: 100 })).toBe(false);
    expect(shouldSendEveningReminder({ ...base, localHour: 19 })).toBe(false);
    expect(shouldSendEveningReminder({ ...base, alreadySent: true })).toBe(
      false,
    );
    expect(shouldSendEveningReminder({ ...base, optIn: false })).toBe(false);
    expect(
      shouldSendEveningReminder({ ...base, localDate: "2026-08-31" }),
    ).toBe(false);
  });
});

describe("reminderCopy", () => {
  it("matches the in-app evening line", () => {
    expect(reminderCopy(40).body).toBe(
      "Still 40 short before midnight. Floor is 100.",
    );
    expect(reminderCopy(40).subject).toBe("Still 40 short today");
  });
});

describe("escapeHtml", () => {
  it("neutralizes tags in names", () => {
    expect(escapeHtml(`<b>x</b>`)).toBe("&lt;b&gt;x&lt;/b&gt;");
  });
});

describe("pickReminderTargets", () => {
  it("keeps only the 20:00 short list", () => {
    const picked = pickReminderTargets([
      {
        id: "00000000-0000-4000-8000-000000000001",
        email: "a@example.com",
        display_name: "A",
        timezone: "Africa/Lagos",
        unsubscribe_token: "00000000-0000-4000-8000-000000000011",
        reminders_opt_in: true,
        daily_goal: 100,
        starts_on: "2026-09-01",
        duration_days: 365,
        today_reps: 10,
        local_date: "2026-09-01",
        local_hour: 20,
        already_sent: false,
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        email: "b@example.com",
        display_name: "B",
        timezone: "UTC",
        unsubscribe_token: "00000000-0000-4000-8000-000000000012",
        reminders_opt_in: true,
        daily_goal: 100,
        starts_on: "2026-09-01",
        duration_days: 365,
        today_reps: 10,
        local_date: "2026-09-01",
        local_hour: 10,
        already_sent: false,
      },
    ]);
    expect(picked.map((row) => row.email)).toEqual(["a@example.com"]);
  });
});
