import nodemailer from "nodemailer";
import { EmailProviderInterface, EmailOptions, EmailResult } from "../types";

export class NodemailerProvider implements EmailProviderInterface {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor(config: {
    user: string;
    pass: string;
    host?: string;
    port?: number;
    secure?: boolean;
    defaultFrom: string;
  }) {
    this.defaultFrom = config.defaultFrom;

    this.transporter = nodemailer.createTransport({
      host: config.host || "smtp.gmail.com",
      port: config.port || 587,
      secure: config.secure || false,
      service: !config.host ? "gmail" : undefined, // Default to gmail if no host provided (legacy support)
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: options.from?.email
          ? `"${options.from.name || ""}" <${options.from.email}>`
          : this.defaultFrom,
        to: Array.isArray(options.to)
          ? options.to.map((t) => t.email)
          : options.to.email,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.htmlBody,
        text: options.textBody,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          path: att.path,
        })),
      });

      return { success: true, messageId: info.messageId };
    } catch (error: unknown) {
      console.error("Nodemailer Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
