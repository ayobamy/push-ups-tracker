import { existsSync, readFileSync } from "node:fs";
import { DELETE_ACCOUNT_CONFIRM } from "@/lib/challenge/account";
import { describe, expect, it } from "vitest";

/**
 * Self-serve delete. Type DELETE. Auth user cascades.
 * Pass threshold: every case.
 */
describe("eval: delete account", () => {
  it("ships a confirm gate and the RPC, not a service role key", () => {
    expect(DELETE_ACCOUNT_CONFIRM).toBe("DELETE");
    expect(readFileSync("app/app/actions.ts", "utf8")).toContain(
      "delete_own_account",
    );
    expect(readFileSync("app/app/actions.ts", "utf8")).not.toContain(
      "SERVICE_ROLE",
    );
    expect(readFileSync("app/app/settings/page.tsx", "utf8")).toContain(
      "DeleteAccountControl",
    );
    expect(existsSync("components/delete-account-control.tsx")).toBe(true);
    expect(readFileSync("app/privacy/page.tsx", "utf8")).not.toContain(
      "not shipped yet",
    );
  });
});
