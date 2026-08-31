export function pendingCeremony(
  daysHit: number,
  seen: readonly number[],
): 100 | 365 | null {
  if (daysHit >= 365 && !seen.includes(365)) {
    return 365;
  }
  if (daysHit >= 100 && !seen.includes(100)) {
    return 100;
  }
  return null;
}

export function ceremonyCopy(kind: 100 | 365): { title: string; body: string } {
  if (kind === 365) {
    return {
      title: "365 days hit",
      body: "The window is full. That is the whole challenge.",
    };
  }
  return {
    title: "100 days hit",
    body: "A hundred days on the board. Keep going.",
  };
}

export function ceremonyStorageKey(userId: string): string {
  return `ceremony-seen:${userId}`;
}
