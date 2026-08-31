import {
  DELETE_ACCOUNT_CONFIRM,
  deleteAccountConfirmMatches,
  deleteAccountPrompt,
} from "@/lib/challenge/account";
import { describe, expect, it } from "vitest";

describe("deleteAccountConfirmMatches", () => {
  it("accepts DELETE, ignoring case and edges", () => {
    expect(deleteAccountConfirmMatches("DELETE")).toBe(true);
    expect(deleteAccountConfirmMatches(" delete ")).toBe(true);
    expect(deleteAccountConfirmMatches("Delete")).toBe(true);
    expect(deleteAccountConfirmMatches("")).toBe(false);
    expect(deleteAccountConfirmMatches("yes")).toBe(false);
    expect(DELETE_ACCOUNT_CONFIRM).toBe("DELETE");
  });
});

describe("deleteAccountPrompt", () => {
  it("says sets go with the account", () => {
    expect(deleteAccountPrompt()).toBe("Delete your account and every set?");
  });
});
