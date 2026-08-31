import { addCalendarDays, type IsoDate } from "@/lib/challenge/day";

export const HIT_POINTS = 10;
export const HALF_POINTS = 5;
export const RECOVERY_HITS = 5;
export const TOP_REDEEM = 10;

export type Purse = {
  total: number;
  earns: number[];
  half: boolean;
  recoveryHits: number;
};

export function purseFromHits(hits: readonly boolean[]): Purse {
  const earns: number[] = [];
  let half = false;
  let recoveryHits = 0;

  for (const hit of hits) {
    if (!hit) {
      earns.push(0);
      half = true;
      recoveryHits = 0;
      continue;
    }
    if (!half) {
      earns.push(HIT_POINTS);
      continue;
    }
    recoveryHits += 1;
    earns.push(HALF_POINTS);
    if (recoveryHits >= RECOVERY_HITS) {
      half = false;
      recoveryHits = 0;
    }
  }

  return {
    total: earns.reduce((sum, n) => sum + n, 0),
    earns,
    half,
    recoveryHits,
  };
}

export function hitSequence(
  startsOn: IsoDate,
  lastDay: IsoDate,
  hitDates: readonly IsoDate[],
): boolean[] {
  if (lastDay < startsOn) {
    return [];
  }
  const hits = new Set(hitDates);
  const days: boolean[] = [];
  let cursor = startsOn;
  while (cursor <= lastDay) {
    days.push(hits.has(cursor));
    cursor = addCalendarDays(cursor, 1);
  }
  return days;
}

export type PurseStanding = {
  id: string;
  name: string;
  points: number;
  half: boolean;
  recoveryHits: number;
  daysHit: number;
  streak: number;
  total: number;
  me: boolean;
};

export function sortPurse(rows: readonly PurseStanding[]): PurseStanding[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.daysHit !== a.daysHit) {
      return b.daysHit - a.daysHit;
    }
    if (b.streak !== a.streak) {
      return b.streak - a.streak;
    }
    return b.total - a.total;
  });
}
