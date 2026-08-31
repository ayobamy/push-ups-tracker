export type PodiumPlace = 1 | 2 | 3;

export function podiumPlace(rankIndex: number): PodiumPlace | null {
  if (rankIndex === 0) {
    return 1;
  }
  if (rankIndex === 1) {
    return 2;
  }
  if (rankIndex === 2) {
    return 3;
  }
  return null;
}

export function podiumLabel(place: PodiumPlace): string {
  if (place === 1) {
    return "1st place";
  }
  if (place === 2) {
    return "2nd place";
  }
  return "3rd place";
}
