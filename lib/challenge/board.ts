import { compareStandingTies } from "@/lib/challenge/hit-at";

export type BoardRow = {
  id: string;
  name: string;
  daysHit: number;
  streak: number;
  total: number;
  surplus: number;
  hitPaceMs: number | null;
  me: boolean;
};

export type BoardSort = "days" | "streak" | "total";

export type TodayBoardRow = {
  id: string;
  name: string;
  total: number;
  hit: boolean;
  hitAt: string | null;
};

export { compareStandingTies };

export function sortBoard(rows: BoardRow[], sort: BoardSort): BoardRow[] {
  return [...rows].sort((a, b) => {
    if (sort === "streak") {
      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }
      if (b.daysHit !== a.daysHit) {
        return b.daysHit - a.daysHit;
      }
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      return compareStandingTies(a, b);
    }
    if (sort === "total") {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      if (b.daysHit !== a.daysHit) {
        return b.daysHit - a.daysHit;
      }
      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }
      return compareStandingTies(a, b);
    }
    if (b.daysHit !== a.daysHit) {
      return b.daysHit - a.daysHit;
    }
    if (b.streak !== a.streak) {
      return b.streak - a.streak;
    }
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    return compareStandingTies(a, b);
  });
}

export function sortTodayBoard(rows: TodayBoardRow[]): TodayBoardRow[] {
  return [...rows].sort((a, b) => {
    if (a.hit !== b.hit) {
      return a.hit ? -1 : 1;
    }
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    if (a.hit && b.hit) {
      if (a.hitAt && b.hitAt && a.hitAt !== b.hitAt) {
        return a.hitAt.localeCompare(b.hitAt);
      }
      if (a.hitAt && !b.hitAt) {
        return -1;
      }
      if (!a.hitAt && b.hitAt) {
        return 1;
      }
    }
    return compareStandingTies(
      { id: a.id, name: a.name, hitPaceMs: null },
      { id: b.id, name: b.name, hitPaceMs: null },
    );
  });
}

export function dailySurplus(goal: number, totalReps: number): number {
  return Math.max(0, totalReps - goal);
}
