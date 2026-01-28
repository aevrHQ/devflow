import { BaseChannelHandler } from "./base";
import { StandardEvent, StandardMessage } from "./types";
import { UserDocument } from "@/models/User";
import User from "@/models/User";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { NotificationPayload } from "@/lib/notification/types";
import connectToDatabase from "@/lib/mongodb";

export class WebChannelHandler extends BaseChannelHandler {
  name = "Web";
  type = "web" as const;

  async parseRequest(request: Request): Promise<StandardEvent | null> {
    try {
      const body = await request.json();
      let userId = "";

      // 1. Try Authorization Header
      const token = request.headers
        .get("Authorization")
        ?.replace("Bearer ", "");
      if (token) {
        const payload = verifyToken(token);
        if (payload) userId = payload.userId;
      }

      // 2. Try Cookie Session (if no header or invalid)
      if (!userId) {
        const session = await getCurrentUser();
        if (session) userId = session.userId;
      }

      // If called from server-side context where we trust the input (e.g. internal API),
      // we might accept userId in body. But better to rely on token.

      if (!body.content && !body.message) return null;

      return {
        id: crypto.randomUUID(),
        type: "text",
        source: "web",
        channelId: userId, // For web, technical channelId is user's ID
        userId: userId,
        content: body.content || body.message,
        metadata: body.metadata,
        raw: body,
      };
    } catch (e) {
      console.error("WebChannel parse error", e);
      return null;
    }
  }

  async validateRequest(request: Request): Promise<boolean> {
    // 1. Check Header
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (token && verifyToken(token)) return true;

    // 2. Check Cookie
    const session = await getCurrentUser();
    return !!session;
  }

  async resolveUser(event: StandardEvent): Promise<UserDocument | null> {
    if (!event.userId) return null;
    await connectToDatabase();
    return User.findById(event.userId);
  }

  async send(channelId: string, message: StandardMessage): Promise<void> {
    await connectToDatabase();
    await User.findByIdAndUpdate(channelId, {
      $push: {
        chatHistory: {
          $each: [
            {
              role: "assistant", // System messages appear as assistant
              content: message.text,
              createdAt: new Date(),
            },
          ],
          $slice: -50, // Keep last 50 messages
        },
      },
    });
  }

  async sendNotification(
    channelId: string,
    notification: NotificationPayload,
  ): Promise<void> {
    // Check if user has enabled AI summary or prefers specific format?
    // For now, convert to Markdown similar to Telegram.

    const lines: string[] = [];
    lines.push(`${notification.emoji} **${notification.title}**`);
    lines.push("");

    if (notification.summary) {
      lines.push(notification.summary);
      lines.push("");
    }

    if (notification.fields) {
      for (const field of notification.fields) {
        lines.push(`**${field.label}**: ${field.value}`);
      }
    }

    if (notification.links?.length) {
      lines.push("");
      lines.push("**Links:**");
      for (const link of notification.links) {
        lines.push(`• [${link.label}](${link.url})`);
      }
    }

    const message = lines.join("\n");
    await this.send(channelId, { text: message });
  }
}

export const webChannel = new WebChannelHandler();
