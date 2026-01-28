import { EmailOptions, EmailProviderInterface, EmailResult } from "./types";
import { NodemailerProvider } from "./providers/nodemailer";
import { ResendProvider } from "./providers/resend";
import { generateMinimalistTemplate, TemplateConfig } from "./templates";

export class EmailService {
  private provider: EmailProviderInterface;
  private defaultFrom: string;

  constructor() {
    this.defaultFrom = process.env.MAIL_FROM || "notifications@devflow.local";

    const providerType =
      process.env.DEFAULT_MAIL_PROVIDER ||
      (process.env.RESEND_API_KEY ? "resend" : "nodemailer");

    if (providerType === "resend" && process.env.RESEND_API_KEY) {
      this.provider = new ResendProvider(
        process.env.RESEND_API_KEY,
        this.defaultFrom,
      );
    } else {
      // Fallback to Nodemailer
      this.provider = new NodemailerProvider({
        user: process.env.MAIL_USER || "",
        pass: process.env.MAIL_PASS || "",
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT
          ? parseInt(process.env.MAIL_PORT)
          : undefined,
        defaultFrom: this.defaultFrom,
      });
    }
  }

  /**
   * Send a raw email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    return this.provider.sendEmail(options);
  }

  /**
   * Send an email using the minimalist template
   */
  async sendStyledEmail(
    to: string | string[],
    subject: string,
    config: TemplateConfig,
  ): Promise<EmailResult> {
    const htmlBody = generateMinimalistTemplate(config);

    // Map string[] to EmailAddress structure if needed, or provider handles strings?
    // Our interface expects EmailAddress objects or strings?
    // Types.ts says: to: EmailAddress | EmailAddress[];
    // Let's normalize inputs to match types.

    const recipients = Array.isArray(to)
      ? to.map((email) => ({ email }))
      : { email: to };

    return this.sendEmail({
      from: {
        email: this.defaultFrom,
        name: "Devflow",
      },
      to: recipients,
      subject,
      htmlBody,
      textBody: config.content.replace(/<[^>]*>?/gm, ""), // Basic strip HTML
    });
  }
}

// Singleton instance for easy import
export const emailService = new EmailService();
