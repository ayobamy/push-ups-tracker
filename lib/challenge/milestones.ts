export const MILESTONES = [7, 30, 100, 365] as const;

export function earnedMilestones(daysHit: number): number[] {
  return MILESTONES.filter((n) => daysHit >= n);
}
