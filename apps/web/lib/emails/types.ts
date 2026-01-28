export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailAddress | EmailAddress[];
  from?: EmailAddress;
  subject: string;
  htmlBody: string;
  textBody?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  path?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TemplateOptions {
  templateName?: string;
  templateContent?: string;
  variables?: Record<string, unknown>;
}

export interface EmailProviderInterface {
  sendEmail(options: EmailOptions): Promise<EmailResult>;
  sendTemplateEmail?(
    options: TemplateOptions,
    emailOptions: EmailOptions,
  ): Promise<EmailResult>;
}
