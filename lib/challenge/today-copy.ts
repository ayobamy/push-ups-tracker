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
