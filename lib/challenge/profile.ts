export type NameResult =
  { ok: true; displayName: string } | { ok: false; error: "invalid-name" };

export function parseDisplayName(raw: string): NameResult {
  const displayName = raw.trim();
  if (displayName.length < 2 || displayName.length > 32) {
    return { ok: false, error: "invalid-name" };
  }
  return { ok: true, displayName };
}

export function isIanaTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function displayNameFromJoin(
  nested:
    { display_name: string | null } | { display_name: string | null }[] | null,
): string {
  const row = Array.isArray(nested) ? nested[0] : nested;
  return row?.display_name ?? "Unnamed";
}
