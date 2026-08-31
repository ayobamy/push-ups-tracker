import { describe, expect, it } from "vitest";
import { AUTH_EMAILS, renderAuthEmail } from "@/lib/mail/auth-templates";
import { authMailPayload, projectRefFromUrl } from "@/lib/mail/auth-config";

describe("renderAuthEmail", () => {
  it("uses a table layout, one confirm link, and no scripts", () => {
    const html = renderAuthEmail({
      title: "Confirm your email",
      body: "Tap the button to confirm this address.",
      cta: "Confirm email",
      footer: "If you did not sign up, ignore this mail.",
    });
    expect(html).toContain("<table");
    expect(html).toContain("{{ .ConfirmationURL }}");
    expect(html).toContain("#f59e0b");
    expect(html).toContain("100 a day");
    expect(html).not.toContain("<script");
    expect(html.match(/\{\{ \.ConfirmationURL \}\}/g)?.length).toBe(1);
  });
});

describe("AUTH_EMAILS", () => {
  it("covers the signup, recovery, magic-link, and email-change mails", () => {
    expect(AUTH_EMAILS.confirmation.subject).toBe("Confirm your email");
    expect(AUTH_EMAILS.recovery.subject).toBe("Reset your password");
    expect(AUTH_EMAILS.magicLink.subject).toBe("Your sign-in link");
    expect(AUTH_EMAILS.emailChange.subject).toBe(
      "Confirm your new email address",
    );
    expect(AUTH_EMAILS.emailChange.html).toContain("{{ .NewEmail }}");
  });
});

describe("authMailPayload", () => {
  it("points SMTP at Resend and ships the templates", () => {
    const payload = authMailPayload({
      from: "noreply@example.com",
      fromName: "100 a Day",
      apiKey: "re_test",
    });
    expect(payload.smtp_host).toBe("smtp.resend.com");
    expect(payload.smtp_port).toBe("465");
    expect(payload.smtp_user).toBe("resend");
    expect(payload.smtp_pass).toBe("re_test");
    expect(payload.smtp_admin_email).toBe("noreply@example.com");
    expect(payload.mailer_templates_confirmation_content).toContain(
      "{{ .ConfirmationURL }}",
    );
  });
});

describe("projectRefFromUrl", () => {
  it("reads the project ref from a hosted URL", () => {
    expect(projectRefFromUrl("https://abcdefgh.supabase.co")).toBe("abcdefgh");
  });
});
