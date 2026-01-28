import { emailService } from "./emails";

// Re-export types for compatibility if needed
export type { EmailOptions } from "./emails/types";

/**
 * Send an email
 * @deprecated Use emailService.sendEmail or emailService.sendStyledEmail directly
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const result = await emailService.sendEmail({
      to: { email: options.to },
      subject: options.subject,
      htmlBody: options.html,
    });

    if (result.success) {
      console.log(`Email sent to ${options.to}`);
    } else {
      console.error("Failed to send email:", result.error);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

import { generateMinimalistTemplate } from "./emails/templates";

/**
 * Generate minimalist HTML template
 * @deprecated Use emailService.sendStyledEmail or generateMinimalistTemplate from lib/emails/templates
 */
export function generateEmailHtml(
  title: string,
  content: string,
  actionUrl?: string,
  actionText?: string,
): string {
  return generateMinimalistTemplate({
    title,
    content,
    actionUrl,
    actionText,
  });
}

/**
 * Send Magic Link Email
 */
export async function sendMagicLink(email: string, link: string, otp?: string) {
  const content = `
    <p>Click the button below to sign in. This link expires in 15 minutes.</p>
    ${otp ? `<div style="text-align: center; margin: 24px 0; background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</div>` : ""}
    <p>Or use the code above if you are logging in on a different device.</p>
  `;

  await emailService.sendStyledEmail(
    email,
    otp ? `Your Login Code: ${otp}` : "Sign in to DevFlow",
    {
      title: otp ? `Your Login Code: ${otp}` : "Sign in to DevFlow",
      content,
      actionUrl: link,
      actionText: "Sign In",
      footerText: "DevFlow Security",
    },
  );
}
