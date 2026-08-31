export type BoardRow = {
  id: string;
  name: string;
  daysHit: number;
  streak: number;
  total: number;
  surplus: number;
  me: boolean;
};

export type BoardSort = "days" | "streak" | "total";

export function sortBoard(rows: BoardRow[], sort: BoardSort): BoardRow[] {
  return [...rows].sort((a, b) => {
    if (sort === "streak") {
      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }
      if (b.daysHit !== a.daysHit) {
        return b.daysHit - a.daysHit;
      }
      return b.total - a.total;
    }
    if (sort === "total") {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      if (b.daysHit !== a.daysHit) {
        return b.daysHit - a.daysHit;
      }
      return b.streak - a.streak;
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

export function dailySurplus(goal: number, totalReps: number): number {
  return Math.max(0, totalReps - goal);
}
