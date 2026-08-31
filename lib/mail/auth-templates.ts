export type AuthEmailCopy = {
  title: string;
  body: string;
  cta: string;
  footer: string;
};

const FONT = "Arial, Helvetica, sans-serif";

export function renderAuthEmail(copy: AuthEmailCopy): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${copy.title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;">
        <tr>
          <td style="font-family:${FONT};font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#d97706;">
            100 a day
          </td>
        </tr>
        <tr>
          <td style="padding-top:18px;font-family:${FONT};font-size:28px;line-height:1.2;font-weight:700;color:#fafafa;">
            ${copy.title}
          </td>
        </tr>
        <tr>
          <td style="padding-top:14px;font-family:${FONT};font-size:16px;line-height:1.5;color:#a1a1aa;">
            ${copy.body}
          </td>
        </tr>
        <tr>
          <td style="padding-top:28px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f59e0b;color:#171717;font-family:${FONT};font-size:16px;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:8px;">
              ${copy.cta}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding-top:28px;font-family:${FONT};font-size:13px;line-height:1.5;color:#71717a;">
            ${copy.footer}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export const AUTH_EMAILS = {
  confirmation: {
    subject: "Confirm your email",
    html: renderAuthEmail({
      title: "Confirm your email",
      body: "Tap the button to confirm this address. Then log in with the password you just set.",
      cta: "Confirm email",
      footer:
        "If you did not sign up, ignore this mail. The link expires soon.",
    }),
  },
  recovery: {
    subject: "Reset your password",
    html: renderAuthEmail({
      title: "Reset your password",
      body: "Tap the button to choose a new password.",
      cta: "Reset password",
      footer: "If you did not ask for this, ignore this mail.",
    }),
  },
  magicLink: {
    subject: "Your sign-in link",
    html: renderAuthEmail({
      title: "Sign in",
      body: "Tap the button to sign in. The link works once and expires soon.",
      cta: "Sign in",
      footer: "If you did not ask for this, ignore this mail.",
    }),
  },
  emailChange: {
    subject: "Confirm your new email address",
    html: renderAuthEmail({
      title: "Confirm your new email",
      body: "Tap the button to confirm {{ .NewEmail }} as your new address.",
      cta: "Confirm new email",
      footer: "If you did not ask for this, ignore this mail.",
    }),
  },
};
