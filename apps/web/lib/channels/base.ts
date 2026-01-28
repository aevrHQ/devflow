import { StandardEvent, IChannelHandler, StandardMessage } from "./types";
import { UserDocument } from "@/models/User";
import User from "@/models/User";
import Channel from "@/models/Channel";
import Agent from "@/models/Agent";
import TaskAssignment from "@/models/TaskAssignment";
import connectToDatabase from "@/lib/mongodb";
import { generateChatResponse } from "@/lib/agents/chatAssistant";
import { parseDevflowCommand, getDevflowHelpText } from "@/lib/webhook/devflow";
import { randomUUID } from "crypto";

export abstract class BaseChannelHandler implements IChannelHandler {
  abstract name: string;
  abstract type: "telegram" | "slack" | "web";

  abstract parseRequest(request: Request): Promise<StandardEvent | null>;
  abstract validateRequest(request: Request): Promise<boolean>;
  abstract send(channelId: string, message: StandardMessage): Promise<void>;
  abstract sendNotification(
    channelId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notification: any,
  ): Promise<void>;

  async resolveUser(event: StandardEvent): Promise<UserDocument | null> {
    await connectToDatabase();

    // 1. Try finding by direct channel specific ID mapping (legacy)
    // Dynamic key access based on type would be ideal but schema fields are specific
    let user: UserDocument | null = null;

    if (this.type === "telegram") {
      user = await User.findOne({ telegramChatId: event.channelId });
    }

    if (!user) {
      // 2. Find via Channel model
      const channel = await Channel.findOne({
        "config.chatId": event.channelId,
        type: this.type,
        enabled: true,
      });

      if (channel) {
        user = await User.findById(channel.userId);
      }
    }

    return user;
  }

  protected async handleVoice(
    event: StandardEvent,
    user: UserDocument,
  ): Promise<void> {
    if (!event.voiceUrl || !user) return;

    try {
      // Download and Transcribe logic would go here
      // Abstracting this might require a fetch implementation in the concrete class
      // or a shared utility. For now, assuming voiceUrl is accessible.
      // This part heavily depends on how different platforms serve files.
      // Telegram needs bot token path.
      // We'll leave the specific download implementation to the concrete class if needed,
      // or assume voiceUrl is a public/accessible URL.
      // Base implementation assumes we have the text now.
      // If the concrete class handles transcription *before* calling this, event.content would be set.
      // If not, we need a method to transcribe.
    } catch (error) {
      console.error("Voice processing error", error);
      await this.send(event.channelId, {
        text: "❌ Failed to process voice message.",
      });
    }
  }

  async processEvent(request: Request): Promise<void> {
    if (!(await this.validateRequest(request))) {
      throw new Error("Invalid request signature");
    }

    const event = await this.parseRequest(request);
    if (!event) return; // Not a relevant event (e.g. typing indicator)

    const user = await this.resolveUser(event);

    // VOICE HANDLING
    if (event.type === "voice") {
      if (!user) {
        await this.send(event.channelId, {
          text: "⚠️ Please connect your account first.",
        });
        return;
      }
      // Concrete class should ideally transcribe and convert to text event or handle here.
      // For simplicity, let's assume concrete class converts voice to text in parseRequest
      // OR we handle it if we have a URL.
      // Re-using the logic from telegram route:
      // Implementation specific voice handling might be better in the concrete class
      // that then delegates to handleCommand with the transcribed text.
    }

    // TEXT HANDLING
    if (event.type === "text" && event.content) {
      let text = event.content.trim();

      // 1. Confirmation Logic
      if (
        ["yes", "y", "confirm", "ok", "sure", "do it"].includes(
          text.toLowerCase(),
        )
      ) {
        // Logic to check history and confirm previous command
        // This requires access to User history which is in DB.
        if (user && user.chatHistory?.length) {
          const lastMsg = user.chatHistory[user.chatHistory.length - 1];
          if (
            lastMsg.role === "assistant" &&
            lastMsg.content.includes("🎤 I heard:")
          ) {
            const match = lastMsg.content.match(/I heard: '([^']+)'/);
            if (match && match[1]) {
              text = match[1];
              await this.send(event.channelId, {
                text: `✅ Executing: "${text}"...`,
              });
            }
          }
        }
      }

      // 2. DevFlow Command (!devflow)
      const devflowCmd = parseDevflowCommand(text);
      if (devflowCmd.isDevflow) {
        await this.handleDevFlowCommand(event, devflowCmd);
        return;
      }

      // 3. User Commands (/cmd)
      if (text.startsWith("/")) {
        await this.handleSystemCommand(event, user, text);
        return;
      }

      // 4. Chat / AI
      await this.handleChat(event, user, text);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async handleDevFlowCommand(event: StandardEvent, cmd: any) {
    if (!cmd.intent) {
      await this.send(event.channelId, { text: getDevflowHelpText() });
      return;
    }
    // ... logic to forward to Agent Host ...
    // Reuse the fetch logic from telegram route
    const taskId = randomUUID();
    const devflowBaseUrl =
      process.env.NEXT_PUBLIC_DEVFLOW_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${devflowBaseUrl}/api/copilot/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Secret": process.env.DEVFLOW_API_SECRET || "devflow-secret",
        },
        body: JSON.stringify({
          taskId,
          source: {
            channel: this.type,
            chatId: event.channelId,
            messageId: event.id,
          },
          payload: {
            intent: cmd.intent,
            repo: cmd.repo,
            branch: cmd.branch,
            naturalLanguage: cmd.description,
            context: cmd.context,
          },
        }),
      });

      if (response.ok) {
        await this.send(event.channelId, {
          text: `🚀 *Devflow Task Started!*\n\nIntent: ${cmd.intent}\nRepo: ${cmd.repo}\nTask ID: \`${taskId}\``,
        });
      } else {
        await this.send(event.channelId, {
          text: "❌ Failed to start process.",
        });
      }
    } catch (e) {
      await this.send(event.channelId, { text: `❌ Error: ${e}` });
    }
  }

  protected async handleSystemCommand(
    event: StandardEvent,
    user: UserDocument | null,
    text: string,
  ) {
    const lower = text.toLowerCase();

    if (lower === "/help") {
      await this.send(event.channelId, { text: getDevflowHelpText() });
      return;
    }

    if (lower === "/agents") {
      if (!user) {
        await this.send(event.channelId, { text: "⚠️ Account not connected." });
        return;
      }
      const agents = await Agent.find({ userId: user._id });
      const online = agents.filter((a) => a.status === "online").length;
      await this.send(event.channelId, {
        text:
          `🤖 *Connected Agents (${online}/${agents.length})*\n` +
          agents
            .map((a) => `${a.status === "online" ? "🟢" : "🔴"} ${a.name}`)
            .join("\n"),
      });
      return;
    }

    if (lower === "/tasks") {
      if (!user) {
        await this.send(event.channelId, { text: "⚠️ Account not connected." });
        return;
      }
      const tasks = await TaskAssignment.find({
        userId: user._id,
        status: { $in: ["pending", "in_progress"] },
      }).limit(5);
      await this.send(event.channelId, {
        text:
          `📋 *Active Tasks*\n` +
          tasks.map((t, i) => `${i + 1}. ${t.status} - ${t.intent}`).join("\n"),
      });
      return;
    }

    // ... Handle /status, /cancel, /disconnect etc ...
    // For brevity/MVP I'm simplifying.
  }

  protected async handleChat(
    event: StandardEvent,
    user: UserDocument | null,
    text: string,
  ) {
    // 1. Check if we should reply (e.g. group chat mentions)
    // This logic might need to be passed in or handled by parseRequest flagging 'isMention'

    const response = await generateChatResponse({
      message: text,
      senderName: "User", // Can get from event metadata
      userId: user?._id.toString(),
      source: {
        channel: this.type as "telegram" | "slack" | "web",
        chatId: event.channelId,
      },
      history: [], // We can implement history loading here similar to telegram route
    });

    if (response) {
      await this.send(event.channelId, { text: response.text });

      // Save history if user exists
      if (user) {
        await User.updateOne(
          { _id: user._id },
          {
            $push: {
              chatHistory: {
                $each: [
                  { role: "user", content: text, createdAt: new Date() },
                  {
                    role: "assistant",
                    content: response.text,
                    createdAt: new Date(),
                  },
                ],
                $slice: -50,
              },
            },
          },
        );
      }
    }
  }
}
