// Devflow task update endpoint
// Receives progress updates from Agent Host and relays to user's chat

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { sendPlainMessage } from "@/lib/webhook/telegram";
import { sendSlackMessage } from "@/lib/webhook/slack";
import { config } from "@/lib/webhook/config";

interface ProgressUpdate {
  taskId: string;
  status: "in_progress" | "completed" | "failed";
  step: string;
  progress: number; // 0-1
  details?: string;
  error?: string;
  timestamp?: number;
}

// Store task mappings (taskId -> {channel, chatId, etc})
// In production, this should be in MongoDB
const taskMappings = new Map<
  string,
  {
    chatId: string;
    channel: "telegram" | "slack";
    token?: string;
  }
>();

export function storeTaskMapping(
  taskId: string,
  chatId: string,
  channel: "telegram" | "slack",
  token?: string,
): void {
  taskMappings.set(taskId, { chatId, channel, token });
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request has the correct secret
    // Verify the request has the correct secret OR a valid Bearer token
    const secretHeader = request.headers.get("X-API-Secret");
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = process.env.DEVFLOW_API_SECRET || "devflow-secret";

    let isAuthenticated = false;

    // 1. Check Secret (Legacy Agent Host)
    if (secretHeader && secretHeader === expectedSecret) {
      isAuthenticated = true;
    }
    // 2. Check Bearer Token (CLI Agent)
    else if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      // Use verifiedAgentToken to verify tokens issued by /api/agents/register
      const { verifyAgentToken } = await import("@/lib/agentAuth");
      const payload = verifyAgentToken(token);
      if (payload) {
        isAuthenticated = true;
      } else {
        console.warn("[Copilot] Bearer token verification failed");
      }
    } else {
      console.warn(
        "[Copilot] No valid auth header found (Bearer or X-API-Secret)",
      );
    }

    if (!isAuthenticated) {
      console.error("[Copilot] Unauthorized task update attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update: ProgressUpdate = await request.json();

    console.log(
      `[Copilot] Task Update: ${update.taskId} - ${update.status} - ${update.step}`,
    );

    // Connect to database and find task
    await connectToDatabase();
    const TaskAssignment = (await import("@/models/TaskAssignment")).default;
    const task = await TaskAssignment.findOne({ taskId: update.taskId });

    if (!task || !task.source?.chatId) {
      console.error(`[Copilot] No task or source found for: ${update.taskId}`);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Format message based on status
    let message = "";

    if (update.status === "in_progress") {
      const progressBar = generateProgressBar(update.progress);
      message =
        `⏳ *${update.step}*\n\n` +
        `${progressBar} ${Math.round(update.progress * 100)}%\n\n` +
        (update.details ? `📝 ${update.details}\n\n` : "") +
        `Task ID: \`${update.taskId}\``;
    } else if (update.status === "completed") {
      message =
        `✅ *Task Completed!*\n\n` +
        `${update.step}\n\n` +
        (update.details ? `📊 ${update.details}\n\n` : "") +
        `Task ID: \`${update.taskId}\``;
    } else if (update.status === "failed") {
      message =
        `❌ *Task Failed*\n\n` +
        `${update.step}\n\n` +
        `Error: ${update.error || "Unknown error"}\n\n` +
        `Task ID: \`${update.taskId}\``;
    }

    // Send to appropriate channel
    if (task.source.channel === "telegram") {
      await sendPlainMessage(message, task.source.chatId);
    } else if (task.source.channel === "slack") {
      await sendSlackMessage(
        config.slack.botToken,
        task.source.chatId,
        message,
      );
    }

    // Update task status in database
    task.status = update.status;
    task.progress = update.progress;
    task.currentStep = update.step;
    if (update.status === "completed" || update.status === "failed") {
      task.completedAt = new Date();
    }
    if (update.error) {
      task.result = { success: false, error: update.error };
    }
    await task.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Copilot] Task update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper: Generate a simple progress bar
function generateProgressBar(progress: number): string {
  const filled = Math.round(progress * 10);
  const empty = 10 - filled;
  return "[" + "█".repeat(filled) + "░".repeat(empty) + "]";
}
