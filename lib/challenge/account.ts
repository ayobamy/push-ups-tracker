export const DELETE_ACCOUNT_CONFIRM = "DELETE";

export function deleteAccountPrompt(): string {
  return "Delete your account and every set?";
}

export function deleteAccountConfirmMatches(raw: string): boolean {
  return raw.trim().toUpperCase() === DELETE_ACCOUNT_CONFIRM;
}
