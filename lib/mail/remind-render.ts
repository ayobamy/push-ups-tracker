const FONT = "Arial, Helvetica, sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderReminderEmail(input: {
  title: string;
  body: string;
  cta: string;
  appUrl: string;
  unsubUrl: string;
}): { html: string; text: string } {
  const title = escapeHtml(input.title);
  const body = escapeHtml(input.body);
  const cta = escapeHtml(input.cta);
  const appUrl = escapeHtml(input.appUrl);
  const unsubUrl = escapeHtml(input.unsubUrl);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;">
        <tr>
          <td style="font-family:${FONT};font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#b45309;">
            100 a day
          </td>
        </tr>
        <tr>
          <td style="padding-top:18px;font-family:${FONT};font-size:28px;line-height:1.2;font-weight:700;color:#fafafa;">
            ${title}
          </td>
        </tr>
        <tr>
          <td style="padding-top:14px;font-family:${FONT};font-size:16px;line-height:1.5;color:#a1a1aa;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding-top:28px;">
            <a href="${appUrl}" style="display:inline-block;background:#f59e0b;color:#171717;font-family:${FONT};font-size:16px;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:8px;">
              ${cta}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding-top:28px;font-family:${FONT};font-size:13px;line-height:1.5;color:#71717a;">
            One mail, same day, only if you are still short. <a href="${unsubUrl}" style="color:#a1a1aa;">Stop evening reminders</a>.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    input.title,
    "",
    input.body,
    "",
    `${input.cta}: ${input.appUrl}`,
    "",
    `Stop evening reminders: ${input.unsubUrl}`,
  ].join("\n");

  return { html, text };
}
