export const MIN_REPS = 1;
export const MAX_REPS = 1000;

export type RepsResult =
  { ok: true; reps: number } | { ok: false; error: "invalid-reps" };

export function parseReps(raw: string): RepsResult {
  const trimmed = raw.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) {
    return { ok: false, error: "invalid-reps" };
  }
  const reps = Number(trimmed);
  if (reps < MIN_REPS || reps > MAX_REPS) {
    return { ok: false, error: "invalid-reps" };
  }
  return { ok: true, reps };
}
