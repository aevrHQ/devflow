import { sendPlainMessage } from "@/lib/webhook/telegram";
// import { sendSlackMessage } from "@/lib/webhook/slack"; // If implemented
import { ITaskAssignment } from "@/models/TaskAssignment";

export async function notifyTaskUpdate(
  task: ITaskAssignment,
  type: "progress" | "completion" | "failure",
  details?: string,
) {
  if (!task.source) return;

  const { channel, chatId, messageId } = task.source;

  // Dashboard notifications (real-time websocket) are handled by client polling for now.
  // We strictly handle external channels here.

  if (channel === "telegram" && chatId) {
    let message = "";

    if (type === "progress") {
      // Don't notify for every small step to avoid spam, unless it's a major milestone?
      // For now, let's notify.
      message = `🔄 *Update:* ${task.currentStep}\n${details ? `_${details}_` : ""}`;
    } else if (type === "completion") {
      message = `✅ *Task Completed!*\n\n${task.intent}\n\n`;
      if (task.result?.output)
        message += `Wrapper Output: ${task.result.output.substring(0, 100)}...\n\n`;
      if (task.result?.prUrl)
        message += `🔗 [View Pull Request](${task.result.prUrl})\n`;
      message += `📊 [View in Dashboard](${process.env.NEXT_PUBLIC_APP_URL || "https://devflow.aevr.space"}/dashboard/tasks/${task.taskId})`;
    } else if (type === "failure") {
      message = `❌ *Task Failed*\n\nError: ${details || task.result?.error || "Unknown error"}`;
    }

    if (message) {
      try {
        await sendPlainMessage(
          message,
          chatId,
          undefined,
          messageId ? parseInt(messageId) : undefined,
        );
      } catch (err) {
        console.error("Failed to send Telegram notification:", err);
      }
    }
  }
}
