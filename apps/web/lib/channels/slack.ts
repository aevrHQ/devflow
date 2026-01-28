import {
  StandardEvent,
  StandardMessage,
  ChannelType,
  NotificationPayload,
} from "./types";
import { BaseChannelHandler } from "./base";
import {
  verifySlackRequest,
  sendSlackMessage,
  escapeSlack,
  sendSlackWebhook,
} from "@/lib/webhook/slack";
import { config } from "@/lib/webhook/config";
import connectToDatabase from "@/lib/mongodb";
import User, { UserDocument } from "@/models/User";

export class SlackChannelHandler extends BaseChannelHandler {
  name = "Slack";
  type: ChannelType = "slack";

  async validateRequest(request: Request): Promise<boolean> {
    const reqClone = request.clone();
    const { isValid } = await verifySlackRequest(
      reqClone,
      config.slack.signingSecret,
    );
    return isValid;
  }

  async parseRequest(request: Request): Promise<StandardEvent | null> {
    try {
      // Use clone if we haven't already validation-cloned, but here we assume request is fresh or clonable.
      // Ideally we shouldn't read body twice if not cloned, but route.ts logic handles challenge separately.
      // BaseChannelHandler flow might fail if strict, but our route delegates manually.
      const bodyText = await request.text();
      const eventData = JSON.parse(bodyText);

      if (eventData.type === "url_verification") {
        return {
          id: "challenge",
          type: "text",
          source: "slack",
          userId: "system",
          channelId: "system",
          content: "", // Content required by StandardEvent
          raw: eventData, // metadata logic handled in route if needed, or we rely on raw
          metadata: { isChallenge: true, challenge: eventData.challenge },
        };
      }

      if (eventData.type === "event_callback" && eventData.event) {
        const event = eventData.event;

        if (event.bot_id || event.subtype === "bot_message") {
          return null;
        }

        if (event.type === "message" || event.type === "app_mention") {
          return {
            id: event.ts || event.event_ts,
            type: "text",
            source: "slack",
            userId: event.user,
            channelId: event.channel,
            content: event.text || "",
            raw: eventData,
          };
        }
      }

      return null;
    } catch (e) {
      console.error("Slack parse error", e);
      return null;
    }
  }

  async send(channelId: string, message: StandardMessage): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const threadTs = (message.options as any)?.threadId;

    await sendSlackMessage(
      config.slack.botToken,
      channelId,
      message.text,
      threadTs,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async resolveUser(event: StandardEvent): Promise<any> {
    await connectToDatabase();
    const { default: Channel } = await import("@/models/Channel");

    const channelDoc = await Channel.findOne({
      "config.channelId": event.channelId,
    });

    if (channelDoc) {
      const user = await User.findById(channelDoc.userId);
      return user;
    }
    return null;
  }

  protected async handleChat(
    event: StandardEvent,
    user: UserDocument | null,
    text: string,
  ): Promise<void> {
    // 1. Custom Link Logic
    if (text.toLowerCase().includes("link channel_")) {
      const match = text.match(/channel_([a-zA-Z0-9]+)_(\d+)/);
      if (match) {
        const [, userIdParam, channelIndexSafe] = match;
        const channelIndex = parseInt(channelIndexSafe, 10);

        await connectToDatabase();
        const { default: Channel } = await import("@/models/Channel");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channels: any[] = await Channel.find({
          userId: userIdParam,
        }).sort({
          createdAt: 1,
        });

        if (channels[channelIndex]) {
          const targetChannel = channels[channelIndex];
          const currentConfig = targetChannel.config || {};

          targetChannel.config = {
            ...currentConfig,
            channelId: event.channelId,
            slackUserId: event.userId,
          };

          await targetChannel.save();

          await sendSlackMessage(
            config.slack.botToken,
            event.channelId,
            `✅ *Channel Connected Successfully!*\n\n"${targetChannel.name || "Channel"}" is now linked to this Slack channel.\n\n🔔 You'll receive notifications here. You can also chat with me!`,
          );
          return;
        } else {
          await sendSlackMessage(
            config.slack.botToken,
            event.channelId,
            `❌ Could not find the channel to link.\n\nPlease check your dashboard and try again.`,
          );
          return;
        }
      }
    }

    // 2. Unlinked Mentions
    if (
      !user &&
      event.raw?.event?.type === "app_mention" &&
      !text.includes("link channel_")
    ) {
      await sendSlackMessage(
        config.slack.botToken,
        event.channelId,
        `👋 I'm here! But I'm not linked to a DevFlow channel yet.\n\nTo link me, use the "Connect with Slack" button in your dashboard.`,
      );
      return;
    }

    // 3. Standard Chat
    if (user) {
      await super.handleChat(event, user, text);
    }
  }

  async sendNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any,
    notification: NotificationPayload,
  ): Promise<void> {
    if (!config.enabled) return;

    const webhookUrl = config.webhookUrl as string;

    if (!webhookUrl) {
      return;
    }

    const blocks: unknown[] = [];

    // Header
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: `${notification.emoji || "🔔"} ${notification.title}`,
        emoji: true,
      },
    });

    // Summary
    if (notification.summary) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: escapeSlack(notification.summary),
        },
      });
    }

    // Fields
    if (
      notification.fields &&
      notification.fields.length > 0 &&
      !notification.summary
    ) {
      const fields = notification.fields.map(
        (field: { label: string; value: string }) => ({
          type: "mrkdwn",
          text: `*${escapeSlack(field.label)}*\n${escapeSlack(field.value)}`,
        }),
      );

      blocks.push({
        type: "section",
        fields: fields.slice(0, 10),
      });
    }

    // Links
    if (notification.links && notification.links.length > 0) {
      const linkTexts = notification.links
        .map(
          (link: { url: string; label: string }) =>
            `<${link.url}|${escapeSlack(link.label)}>`,
        )
        .join("  |  ");

      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🔗 ${linkTexts}`,
          },
        ],
      });
    }

    // Payload Link
    if (notification.payloadUrl) {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Full Payload",
              emoji: true,
            },
            url: notification.payloadUrl,
          },
        ],
      });
    }

    await sendSlackWebhook(webhookUrl, { blocks });
  }
}
