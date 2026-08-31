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

export function longestStreak(hitDates: readonly IsoDate[]): number {
  if (hitDates.length === 0) {
    return 0;
  }
  const sorted = [...new Set(hitDates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === addCalendarDays(sorted[i - 1], 1)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}
