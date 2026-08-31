export function isMissingTable(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!error) {
    return false;
  }
  return (
    error.code === "PGRST205" ||
    /Could not find the table/i.test(error.message ?? "") ||
    /does not exist/i.test(error.message ?? "")
  );
}
