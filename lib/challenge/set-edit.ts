export function deleteSetPrompt(reps: number): string {
  return `Delete ${reps} reps from today?`;
}

export const SAVE_SET_LABEL = "Save count";

export function editSetDirty(original: number, raw: string): boolean {
  return raw.trim() !== String(original);
}
