import { AUTH_EMAILS } from "./auth-templates.ts";

export const RESEND_SMTP_HOST = "smtp.resend.com";
export const RESEND_SMTP_PORT = "465";
export const RESEND_SMTP_USER = "resend";

export type AuthMailInput = {
  from: string;
  fromName: string;
  apiKey: string;
};

export function authMailPayload(input: AuthMailInput) {
  return {
    external_email_enabled: true,
    smtp_admin_email: input.from,
    smtp_host: RESEND_SMTP_HOST,
    smtp_port: RESEND_SMTP_PORT,
    smtp_user: RESEND_SMTP_USER,
    smtp_pass: input.apiKey,
    smtp_sender_name: input.fromName,
    smtp_max_frequency: 60,
    rate_limit_email_sent: 60,
    mailer_subjects_confirmation: AUTH_EMAILS.confirmation.subject,
    mailer_templates_confirmation_content: AUTH_EMAILS.confirmation.html,
    mailer_subjects_recovery: AUTH_EMAILS.recovery.subject,
    mailer_templates_recovery_content: AUTH_EMAILS.recovery.html,
    mailer_subjects_magic_link: AUTH_EMAILS.magicLink.subject,
    mailer_templates_magic_link_content: AUTH_EMAILS.magicLink.html,
    mailer_subjects_email_change: AUTH_EMAILS.emailChange.subject,
    mailer_templates_email_change_content: AUTH_EMAILS.emailChange.html,
  };
}

export function projectRefFromUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0];
    return ref || undefined;
  } catch {
    return undefined;
  }
}
