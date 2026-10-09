export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends e-mails. Replace the default console implementation with a real provider (SMTP, SES, Resend...).
 */
export abstract class Mailer {
  abstract send(message: MailMessage): Promise<void>;
}
