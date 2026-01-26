import { logger } from "@untools/logger";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  logger.info("🔍 Setting Telegram commands", request?.body);
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not set" },
      { status: 500 },
    );
  }

  const commands = [
    { command: "start", description: "Start the bot and see welcome message" },
    {
      command: "help",
      description: "Show available commands and dashboard links",
    },
    { command: "agents", description: "List your connected DevFlow agents" },
    { command: "fix", description: "Fix a bug: /fix owner/repo description" },
    {
      command: "feature",
      description: "Add feature: /feature owner/repo description",
    },
    {
      command: "explain",
      description: "Explain code: /explain owner/repo description",
    },
    {
      command: "review",
      description: "Review PR: /review owner/repo description",
    },
  ];

  try {
    const url = `https://api.telegram.org/bot${token}/setMyCommands`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commands }),
    });

    const result = await response.json();

    if (!result.ok) {
      return NextResponse.json(
        { error: "Failed to set commands", details: result },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bot commands updated successfully",
      commands,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
