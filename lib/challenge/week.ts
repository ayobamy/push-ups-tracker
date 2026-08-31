import { addCalendarDays, type IsoDate } from "@/lib/challenge/day";

export function mondayOfWeek(iso: IsoDate): IsoDate {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  const weekday = utc.getUTCDay();
  const delta = weekday === 0 ? -6 : 1 - weekday;
  return addCalendarDays(iso, delta);
}

export function elapsedWeekDates(monday: IsoDate, today: IsoDate): IsoDate[] {
  const end = addCalendarDays(monday, 6);
  const last = today < end ? today : end;
  const dates: IsoDate[] = [];
  let cursor = monday;
  while (cursor <= last) {
    dates.push(cursor);
    cursor = addCalendarDays(cursor, 1);
  }
  return dates;
}

export function hitEveryElapsedDay(
  hitDates: readonly IsoDate[],
  monday: IsoDate,
  today: IsoDate,
): boolean {
  const hits = new Set(hitDates);
  const elapsed = elapsedWeekDates(monday, today);
  if (elapsed.length === 0) {
    return false;
  }
  return elapsed.every((date) => hits.has(date));
}

export function weekPerfectNames(
  rows: readonly { name: string; hits: readonly IsoDate[] }[],
  monday: IsoDate,
  today: IsoDate,
): string[] {
  return rows
    .filter((row) => hitEveryElapsedDay(row.hits, monday, today))
    .map((row) => row.name);
}

export function weekScoreLine(monday: IsoDate, today: IsoDate): string {
  const n = elapsedWeekDates(monday, today).length;
  return `${n}/${n} this week`;
}
