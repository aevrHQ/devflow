import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { z } from "zod";

const channelSchema = z.object({
  _id: z.string().optional(),
  type: z.string(),
  config: z.any(),
  enabled: z.boolean(),
  name: z.string().optional(),
  webhookRules: z.any().optional(),
});

const preferencesSchema = z.object({
  aiSummary: z.boolean(),
  allowedSources: z.array(z.string()),
});

const settingsSchema = z.object({
  telegramChatId: z.string().optional(),
  telegramBotToken: z.string().optional(),
  channels: z.array(channelSchema).optional(),
  preferences: preferencesSchema.optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectToDatabase();

    const updateData: Record<string, unknown> = {};
    if (result.data.telegramChatId !== undefined)
      updateData.telegramChatId = result.data.telegramChatId;
    if (result.data.telegramBotToken !== undefined)
      updateData.telegramBotToken = result.data.telegramBotToken;

    if (result.data.preferences !== undefined)
      updateData.preferences = result.data.preferences;

    await User.findByIdAndUpdate(user.userId, updateData);

    // Handle Channel updates
    if (result.data.channels) {
      const { default: Channel } = await import("@/models/Channel");

      for (const ch of result.data.channels) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channelData: any = { ...ch };

        // If it has an _id, update it
        if (channelData._id) {
          await Channel.findOneAndUpdate(
            { _id: channelData._id, userId: user.userId },
            {
              $set: {
                type: channelData.type,
                name: channelData.name,
                enabled: channelData.enabled,
                config: channelData.config,
                webhookRules: channelData.webhookRules,
              },
            },
          );
        } else {
          // Create new channel
          await Channel.create({
            userId: user.userId,
            ...channelData,
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
