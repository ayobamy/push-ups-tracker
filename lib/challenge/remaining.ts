export function remainingToGoal(goal: number, today: number): number {
  return Math.max(0, goal - today);
}

export function surplusOverGoal(goal: number, today: number): number {
  return Math.max(0, today - goal);
}

export function hitGoal(goal: number, today: number): boolean {
  return today >= goal;
}

export function eveningNudge(
  localHour: number,
  goal: number,
  today: number,
): string | null {
  const left = remainingToGoal(goal, today);
  if (localHour < 20 || left === 0) {
    return null;
  }
  return `Still ${left} short before midnight.`;
}
