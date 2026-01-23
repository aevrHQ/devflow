import PingaClient from "../../pinga/client.js";
import { ToolError } from "./utils.js";

export interface ProgressUpdateInput {
  taskId: string;
  status: "in_progress" | "completed" | "failed";
  step: string;
  progress: number; // 0-1
  details?: string;
  error?: string;
}

export interface ProgressUpdateResult {
  success: boolean;
  error?: string;
}

export class ProgressTracker {
  private pingaClient: PingaClient;

  constructor(pingaApiUrl: string, pingaApiSecret: string) {
    this.pingaClient = new PingaClient(pingaApiUrl, pingaApiSecret);
  }

  async sendUpdate(input: ProgressUpdateInput): Promise<ProgressUpdateResult> {
    try {
      await this.pingaClient.sendProgressUpdate({
        taskId: input.taskId,
        status: input.status,
        step: input.step,
        progress: Math.max(0, Math.min(1, input.progress)), // Clamp 0-1
        details: input.details,
        error: input.error,
        timestamp: Date.now(),
      });

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to send progress update: ${errorMsg}`);

      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}

// Factory function for Copilot SDK tool definition
export function createProgressUpdateTool(): any {
  const pingaUrl = process.env.PINGA_API_URL;
  const pingaSecret = process.env.PINGA_API_SECRET;

  if (!pingaUrl || !pingaSecret) {
    console.warn(
      "PINGA_API_URL or PINGA_API_SECRET not configured. Progress updates will fail."
    );
  }

  const progressTracker = new ProgressTracker(
    pingaUrl || "http://localhost:3000",
    pingaSecret || ""
  );

  return {
    name: "send_progress_update",
    description: "Send progress update back to Pinga for user notification",
    parameters: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "Task identifier from the original command",
        },
        status: {
          type: "string",
          enum: ["in_progress", "completed", "failed"],
          description: "Current task status",
        },
        step: {
          type: "string",
          description: "Description of the current step",
        },
        progress: {
          type: "number",
          description: "Progress percentage as decimal (0-1)",
          minimum: 0,
          maximum: 1,
        },
        details: {
          type: "string",
          description: "Additional details about the current step",
        },
        error: {
          type: "string",
          description: "Error message if status is 'failed'",
        },
      },
      required: ["taskId", "status", "step", "progress"],
    },
    handler: async (
      input: ProgressUpdateInput
    ): Promise<ProgressUpdateResult> => {
      try {
        return await progressTracker.sendUpdate(input);
      } catch (error) {
        console.error(`Progress update handler error: ${error}`);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
