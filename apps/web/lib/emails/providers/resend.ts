import { Resend } from "resend";
import { EmailProviderInterface, EmailOptions, EmailResult } from "../types";

export class ResendProvider implements EmailProviderInterface {
  private resend: Resend;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    this.resend = new Resend(apiKey);
    this.defaultFrom = defaultFrom;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const to = Array.isArray(options.to)
        ? options.to.map((t) => t.email)
        : [options.to.email];

      const from = options.from?.email
        ? `${options.from.name || "Devflow"} <${options.from.email}>`
        : this.defaultFrom;

      const { data, error } = await this.resend.emails.send({
        from: from,
        to: to,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.htmlBody,
        text: options.textBody,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content as Buffer, // Resend expects Buffer or string
        })),
      });

      if (error) {
        console.error("Resend Error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error: unknown) {
      console.error("Resend Exception:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
