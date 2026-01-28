import axios from "axios";
import { ProgressUpdate } from "../types.js";

class DevflowClient {
  private apiUrl: string;
  private apiSecret: string;

  constructor(apiUrl: string, token: string) {
    this.apiUrl = apiUrl;
    this.apiSecret = token; // Resusing variable name for minimal diff, but it stores token
  }

  async sendProgressUpdate(update: ProgressUpdate): Promise<void> {
    try {
      console.log(
        `[DevflowClient] Sending update for task ${update.taskId}: ${update.status} - ${update.step}`,
      );
      const response = await axios.post(
        `${this.apiUrl}/api/copilot/task-update`,
        update,
        {
          headers: {
            Authorization: `Bearer ${this.apiSecret}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        },
      );
      console.log(
        `[DevflowClient] Update sent successfully (${response.status})`,
      );
    } catch (error) {
      const errorMsg = axios.isAxiosError(error)
        ? `Request failed: ${error.message} (Status: ${error.response?.status}, URL: ${this.apiUrl}/api/copilot/task-update)`
        : String(error);
      console.error(`[DevflowClient] Failed to update progress: ${errorMsg}`);

      // Log response data if available for debugging
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error(
          `[DevflowClient] Response data: ${JSON.stringify(error.response.data)}`,
        );
      }
      // throw error; // Optional: rethrow if caller needs to know, but suppressing spam is goal
    }
  }

  async notifyCompletion(
    taskId: string,
    result: {
      prUrl?: string;
      output?: string;
      summary?: string;
    },
  ): Promise<void> {
    console.log(`[DevflowClient] Notifying completion for task: ${taskId}`);
    await this.sendProgressUpdate({
      taskId,
      status: "completed",
      step: "Task completed",
      progress: 1.0,
      details: JSON.stringify(result),
    });
  }

  async notifyError(taskId: string, error: string): Promise<void> {
    await this.sendProgressUpdate({
      taskId,
      status: "failed",
      step: "Task failed",
      progress: 0,
      error,
    });
  }
  async sendLog(
    taskId: string,
    level: "info" | "warn" | "error",
    message: string,
  ): Promise<void> {
    await this.sendProgressUpdate({
      taskId,
      status: "in_progress",
      step: "logging",
      progress: 0, // No progress change
      logs: [{ level, message, timestamp: Date.now() }],
    }).catch((err) => console.error("Failed to send log:", err));
  }
}

export default DevflowClient;
