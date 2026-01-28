# Email Service Implementation Guide

This guide provides a comprehensive overview of the Email Service implementation in the `aevr` project. The service is designed with a provider-based architecture, allowing for easy switching between different email delivery services (Nodemailer, Resend, ZeptoMail) while maintaining a consistent API for the rest of the application.

## 1. Architecture Overview

The Email Service is built around a central `EmailService` class located in `apps/api/src/utils/emails/index.ts`. It follows the Strategy pattern, where different email providers can be plugged in interchangeably.

### Core Components

- **EmailService**: The main entry point. It handles provider selection and exposes methods for sending emails.
- **EmailProviderInterface**: A uniform interface that all specific providers implementation must adhere to.
- **Providers**: Specific implementations for different services:
  - `NodemailerProvider` (SMTP - default, great for development/testing)
  - `ResendProvider` (Modern, developer-friendly email API)
  - `ZeptoMailProvider` (Zoho's transactional email service)

## 2. Configuration

The service is configured primarily through environment variables in your `apps/api/.env` file.

### Basic Configuration

```bash
# Application details used in email templates
APP_NAME="AI Workforce"
APP_URL="http://localhost:3000"
APP_SUPPORT_MAIL="support@example.com"
MAIL_LOGO="https://your-logo-url.png"

# Default Mail Configuration (Nodemailer)
MAIL_USER="your-smtp-user"
MAIL_PASS="your-smtp-password"
DEFAULT_MAIL_PROVIDER="nodemailer" # options: nodemailer, resend, zeptomail
```

### Provider Specific Configuration

#### Resend (Recommended)

```bash
RESEND_API_KEY="re_123456789"
DEFAULT_MAIL_PROVIDER="resend"
```

#### ZeptoMail

```bash
ZOHO_KEY="your-zepto-mail-key"
DEFAULT_MAIL_PROVIDER="zeptomail"
```

#### Custom SMTP (Nodemailer)

If you want to use a specific SMTP server (e.g. AWS SES via SMTP, SendGrid via SMTP):

```typescript
// You can pass specific config when instantiating EmailService if needed,
// but by default it uses MAIL_USER/MAIL_PASS with gmail service or custom host/port.
```

## 3. Usage Examples

### Initializing the Service

The simplest way to use the service is with the default configuration:

```typescript
import { EmailService } from "../utils/emails";

const emailService = new EmailService();
```

### Sending a Simple Email

```typescript
await emailService.sendEmail({
  to: { email: "user@example.com", name: "John Doe" },
  subject: "Hello World",
  htmlBody: "<p>This is a test email.</p>",
  textBody: "This is a test email.", // Optional fallback for plain text clients
});
```

### Using Templates

The service comes with built-in responsive templates.

#### Minimalist Template (Recommended)

This is the modern, clean style used for OTPs and notifications.

```typescript
const htmlContent = emailService.generateMinimalistTemplate({
  title: "Welcome to AI Workforce",
  content: `
    <p>We're excited to have you on board.</p>
    <p>Please click the button below to get started.</p>
  `,
  buttonText: "Go to Dashboard",
  buttonUrl: "https://app.ai-workforce.com/dashboard",
  // Optional customizations
  footerText: "Sent with ❤️ by the AI Workforce Team",
  socialLinks: [
    { name: "Twitter", url: "https://twitter.com" },
    { name: "GitHub", url: "https://github.com" },
  ],
});

await emailService.sendEmail({
  to: { email: "user@example.com" },
  subject: "Welcome!",
  htmlBody: htmlContent,
});
```

#### Simple Template

A more basic template structure.

```typescript
const htmlContent = emailService.generateSimpleTemplate(
  "Notification",
  "<p>Something happened!</p>",
);
```

### Sending Attachments

```typescript
import fs from "fs";

await emailService.sendEmail({
  to: { email: "user@example.com" },
  subject: "Statement",
  htmlBody: "<p>Please find attached.</p>",
  attachments: [
    {
      filename: "invoice.pdf",
      content: fs.readFileSync("./invoice.pdf"), // Buffer or string
      contentType: "application/pdf",
    },
  ],
});
```

## 4. Helper Methods

The `EmailService` class includes standard helper methods for common flows:

### Specific Email Types

- `generateWelcomeEmail({ userName, verificationUrl })`
- `generatePasswordResetEmail({ userName, resetUrl })`
- `validateEmailFormat(email)`

Example:

```typescript
const welcomeHtml = emailService.generateWelcomeEmail({
  userName: "Alice",
  verificationUrl: "https://app.com/verify?token=xyz",
});
```

## 5. Adding a New Provider

To add a new provider (e.g., Mailgun), you need to:

1.  **Define the Class**: Create a class that implements `EmailProviderInterface`.
2.  **Implement `sendEmail`**: Map the `EmailOptions` to the provider's API payload.
3.  **Implement `sendTemplateEmail`**: Handle template sending logic if the provider supports it, otherwise fallback to rendering HTML and using `sendEmail`.
4.  **Register**: Update the `EmailService` constructor switch case to include your new provider.

### Example Implementation Skeleton

```typescript
class MailgunProvider implements EmailProviderInterface {
  constructor(private config: any) {
    // Initialize SDK
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // transform options to Mailgun format
      const payload = {
        from: options.from?.email || this.config.defaultFromEmail,
        to: Array.isArray(options.to)
          ? options.to.map((t) => t.email)
          : options.to.email,
        subject: options.subject,
        html: options.htmlBody,
      };

      // await client.messages.create(...)

      return { success: true, messageId: "..." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async sendTemplateEmail(
    options: TemplateOptions,
    emailOptions: EmailOptions,
  ): Promise<EmailResult> {
    // If not using provider templates, just render content:
    if (options.templateContent) {
      return this.sendEmail({
        ...emailOptions,
        htmlBody: options.templateContent,
      });
    }
    throw new Error("Provider templates not implemented");
  }
}
```

Then in `EmailService`:

```typescript
// ...
case 'mailgun':
  this.provider = new MailgunProvider({ apiKey: process.env.MAILGUN_KEY });
  break;
// ...
```

## 6. Best Practices

1.  **Always use templates** for consistency. Avoid raw HTML strings in your service logic.
2.  **Environment Isolation**: Use `ethereal.email` or `mailtrap` for local development if you don't want to spam real addresses (Nodemailer supports Ethereal automatically if no credentials provided).
3.  **Error Handling**: The `sendEmail` method returns a `success` boolean. Always check this result in your calling code.
4.  **Rate Limiting**: Be aware of your provider's rate limits. The current implementation sends synchronously without a queue. For high volume, consider adding a job queue (like BullMQ).

## 7. Troubleshooting

- **Emails not arriving?** Check your spam folder. Check if `MAIL_USER` and `MAIL_PASS` are correct.
- **"Fetch failed"?** Check if your server has outbound access to the SMTP port (587/465) or the API endpoint.
- **Template styles missing?** Email clients strip many CSS styles. In `generateStandardTemplate`, styles are inline for maximum compatibility. Avoid external stylesheets.
