import { UserDocument } from "@/models/User";
import { NotificationPayload } from "@/lib/notification/types";

export type ChannelType = "telegram" | "slack" | "web";

export interface ChannelUser {
  id: string; // The channel-specific ID (e.g., chat_id for Telegram)
  user?: UserDocument; // The resolved system user
}

export interface StandardEvent {
  id: string;
  type: "text" | "voice" | "interaction";
  source: ChannelType;
  channelId: string; // chat_id, channel_id, etc.
  userId: string; // The ID of the user on the platform
  content?: string;
  voiceUrl?: string; // For voice messages
  metadata?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any; // Original payload
}

export interface StandardMessage {
  text: string;
  files?: { url: string; type: "image" | "audio" | "document" }[];
  options?: {
    replyToId?: string;
    parseMode?: "markdown" | "html";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyboard?: any; // Platform specific keyboard
  };
}

export interface IChannelHandler {
  name: string;
  type: ChannelType;

  /**
   * Parse an incoming request into a StandardEvent
   */
  parseRequest(request: Request): Promise<StandardEvent | null>;

  /**
   * Validate the request (signature verification, etc.)
   */
  validateRequest(request: Request): Promise<boolean>;

  /**
   * Resolve the system User from the event
   */
  resolveUser(event: StandardEvent): Promise<UserDocument | null>;

  /**
   * Send a message to the channel
   */
  send(channelId: string, message: StandardMessage): Promise<void>;

  /**
   * Send a structured notification (Outbound)
   */
  sendNotification(
    channelId: string,
    notification: NotificationPayload,
  ): Promise<void>;
}
