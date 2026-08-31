import type { IsoDate } from "@/lib/challenge/day";

export function challengeDayNumber(startsOn: IsoDate, today: IsoDate): number {
  const start = Date.parse(`${startsOn}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(current)) {
    return 0;
  }
  return Math.floor((current - start) / 86_400_000) + 1;
}

export function localHour(instant: Date, timeZone: string): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  }).format(instant);
  return Number(hour);
}
