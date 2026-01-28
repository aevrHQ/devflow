export interface TemplateConfig {
  title: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
  footerText?: string;
}

/**
 * Generate minimalist HTML template
 */
export function generateMinimalistTemplate(config: TemplateConfig): string {
  const buttonHtml = config.actionUrl
    ? `
    <div style="margin: 32px 0;">
      <a href="${config.actionUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
        ${config.actionText || "Click here"}
      </a>
    </div>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 24px;">${config.title}</h1>
      <div style="font-size: 16px;">
        ${config.content}
      </div>
      ${buttonHtml}
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
      <p style="color: #666; font-size: 14px;">${config.footerText || "DevFlow Notifications"}</p>
    </body>
    </html>
  `;
}

// Re-export specific magic link generator if needed, or adapt common one
