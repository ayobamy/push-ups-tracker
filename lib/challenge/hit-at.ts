export type PaceSet = {
  id: string;
  reps: number;
  loggedAt: string;
};

function takeClockPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number {
  const part = parts.find((item) => item.type === type);
  if (!part) {
    throw new Error(`missing clock part: ${type}`);
  }
  return Number(part.value);
}

export function firstHitSet(
  sets: readonly PaceSet[],
  goal: number,
): PaceSet | null {
  const ordered = [...sets].sort((a, b) => {
    const byTime = a.loggedAt.localeCompare(b.loggedAt);
    if (byTime !== 0) {
      return byTime;
    }
    return a.id.localeCompare(b.id);
  });
  let sum = 0;
  for (const set of ordered) {
    sum += set.reps;
    if (sum >= goal) {
      return set;
    }
  }
  return null;
}

export function firstHitAt(
  sets: readonly PaceSet[],
  goal: number,
): string | null {
  return firstHitSet(sets, goal)?.loggedAt ?? null;
}

export function millisIntoLocalDay(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const hour = takeClockPart(parts, "hour");
  const minute = takeClockPart(parts, "minute");
  const second = takeClockPart(parts, "second");
  return ((hour * 60 + minute) * 60 + second) * 1000;
}

export function hitPaceMs(
  hitAts: readonly string[],
  timeZone: string,
): number | null {
  if (hitAts.length === 0) {
    return null;
  }
  let sum = 0;
  for (const iso of hitAts) {
    sum += millisIntoLocalDay(new Date(iso), timeZone);
  }
  return sum / hitAts.length;
}

export function compareHitPace(a: number | null, b: number | null): number {
  if (a === null && b === null) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }
  return a - b;
}

export function compareName(a: string, b: string): number {
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

export type StandingTie = {
  id: string;
  name: string;
  hitPaceMs: number | null;
};

export function compareStandingTies(a: StandingTie, b: StandingTie): number {
  const pace = compareHitPace(a.hitPaceMs, b.hitPaceMs);
  if (pace !== 0) {
    return pace;
  }
  const name = compareName(a.name, b.name);
  if (name !== 0) {
    return name;
  }
  return a.id.localeCompare(b.id);
}
