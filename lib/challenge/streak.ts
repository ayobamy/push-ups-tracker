import { addCalendarDays, type IsoDate } from "@/lib/challenge/day";

export function currentStreak(
  hitDates: readonly IsoDate[],
  today: IsoDate,
): number {
  const hits = new Set(hitDates);
  const start = hits.has(today) ? today : addCalendarDays(today, -1);
  let cursor = start;
  let streak = 0;
  while (hits.has(cursor)) {
    streak += 1;
    cursor = addCalendarDays(cursor, -1);
  }
  return streak;
}
