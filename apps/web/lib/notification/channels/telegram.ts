import {
  NotificationChannel,
  ChannelConfig,
  NotificationPayload,
  ChannelResult,
} from "../types";
import { sendMessage } from "@/lib/webhook/telegram";

export class TelegramChannel implements NotificationChannel {
  name = "Telegram";
  type = "telegram";

  async send(
    config: ChannelConfig,
    notification: NotificationPayload,
  ): Promise<ChannelResult> {
    if (!config.enabled) return { success: false, error: "Channel disabled" };

    // Extract chat ID and bot token from config
    const chatId = config.chatId as string;
    const botToken =
      (config.botToken as string) || process.env.TELEGRAM_BOT_TOKEN;

    if (!chatId || !botToken) {
      console.warn("Telegram channel missing credentials");
      return { success: false, error: "Missing Telegram credentials" };
    }

    const lines: string[] = [];

    // Use plain text - no markdown escaping needed
    if (notification.summary) {
      lines.push(notification.summary);
      lines.push(""); // Spacer
    } else {
      // Title with emoji
      lines.push(`${notification.emoji} ${notification.title}`);
      lines.push("");
    }

    // Fields (only show if no summary exists)
    if (!notification.summary) {
      for (const field of notification.fields) {
        lines.push(`${field.label}: ${field.value}`);
      }
    }

    // Links section
    if (notification.links.length > 0) {
      lines.push("");
      lines.push("🔗 Links:");
      for (const link of notification.links) {
        lines.push(`  • ${link.label}: ${link.url}`);
      }
    }

    // Payload link
    lines.push("");
    lines.push(`📄 View Full Payload: ${notification.payloadUrl}`);

    const message = lines.join("\n");

    // Send as plain text (no markdown parsing)
    return sendMessage(message, { parseMode: undefined }, chatId, botToken);
  }
}

export const telegramChannel = new TelegramChannel();
