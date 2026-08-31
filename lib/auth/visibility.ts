export function visibilityLabel(visible: boolean, field = "password"): string {
  return visible ? `Hide ${field}` : `Show ${field}`;
}
