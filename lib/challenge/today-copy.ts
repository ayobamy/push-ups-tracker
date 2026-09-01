export function todayStatus(
  todayReps: number,
  remaining: number,
  surplus: number,
  hit: boolean,
): string {
  if (todayReps === 0) {
    return "Nothing logged. Floor is 100.";
  }
  if (hit) {
    return `Hit. Surplus ${surplus}`;
  }
  return `${remaining} left`;
}

export function challengeDayLine(
  dayNumber: number,
  duration: number,
  startsOn: string,
): string {
  if (dayNumber < 1) {
    return `Starts ${startsOn}. Floor is 100.`;
  }
  if (dayNumber > duration) {
    return "Challenge window is over.";
  }
  return `Day ${dayNumber} of ${duration}`;
}

export function todayHitLine(hitCount: number, memberCount: number): string {
  return `${hitCount} of ${memberCount} hit`;
}

export const TODAY_BOARD_PREVIEW = 5;

export function previewTodayBoard<T>(
  rows: readonly T[],
  limit: number = TODAY_BOARD_PREVIEW,
): T[] {
  return rows.slice(0, limit);
}

export function todayBoardListLabel(shown: number, total: number): string {
  if (total > shown) {
    return `First ${shown} of ${total}`;
  }
  return "Today's board";
}

export function isFullTodayRoster(roster: string | undefined): boolean {
  return roster === "all";
}
