// Copilot SDK client - Real SDK Integration
// Uses @github/copilot-sdk for agent control
// Reference: https://github.com/github/copilot-sdk

import {
  CopilotClient as RealCopilotClient,
  SessionEvent as RealSessionEvent,
} from "@github/copilot-sdk";

export interface CopilotClientOptions {
  model?: string;
  streaming?: boolean;
  tools?: any[];
  mcpServers?: Record<string, any>;
  githubToken?: string;
}

export interface SessionEvent {
  type:
    | "assistant.message_delta"
    | "assistant.turn_start"
    | "assistant.turn_end"
    | "session.usage_info"
    | "session.idle"
    | "tool.start" // Legacy/fallback
    | "tool.end" // Legacy/fallback
    | "tool.execution_start"
    | "tool.execution_complete"
    | "error";
  data?: {
    deltaContent?: string;
    messageId?: string;
    turnId?: string;
    toolName?: string;
    toolCallId?: string;
    arguments?: any;
    result?: any;
    success?: boolean;
    message?: string;
    // session.usage_info data
    tokenLimit?: number;
    currentTokens?: number;
    messagesLength?: number;
    [key: string]: any; // Allow flexibility for other data properties
  };
}

export interface Session {
  sendAndWait(request: { prompt: string }): Promise<any>;
  on(callback: (event: SessionEvent) => void): void;
}

/**
 * CopilotClient - Wrapper for GitHub Copilot SDK
 *
 * This uses the real @github/copilot-sdk package installed from npm.
 *
 * Requirements:
 * - GitHub Copilot CLI installed and authenticated (copilot --version)
 * - @github/copilot-sdk package installed (npm install @github/copilot-sdk)
 */
export class CopilotClient {
  private model: string = "gpt-4";
  private client: RealCopilotClient;
  private eventListeners: Array<(event: SessionEvent) => void> = [];

  constructor() {
    // Initialize the real SDK client
    // Ensure we have authentication
    const token = process.env.GITHUB_TOKEN || process.env.GITHUB_COPILOT_TOKEN;
    if (!token) {
      console.warn(
        "⚠️ [CopilotClient] No GITHUB_TOKEN or GITHUB_COPILOT_TOKEN found in environment!",
      );
      console.warn("   The Copilot SDK may fail to authenticate.");
    }

    this.client = new RealCopilotClient({
      // The SDK uses GITHUB_TOKEN or GH_TOKEN from env by default, but we can pass explicit auth or env.
      // Based on demo, passing env explicitly with multiple token vars helps robustness.
      env: {
        ...process.env,
        GITHUB_TOKEN: token, // Ensure it's set if we found it
        GH_TOKEN: token,
        COPILOT_GITHUB_TOKEN: token,
      },
    } as any);
  }

  async createSession(options: CopilotClientOptions): Promise<Session> {
    const self = this;

    const model = options.model || this.model;
    console.log(`[CopilotClient] 🚀 Creating session with model: ${model}`);
    console.log(`[CopilotClient] Streaming: ${options.streaming !== false}`);
    if (options.tools?.length) {
      console.log(
        `[CopilotClient] Tools: ${options.tools.map((t: any) => t.name || "unknown").join(", ")}`,
      );
    }

    // Re-initialize client if a specific token is provided (e.g. from user credentials)
    if (options.githubToken) {
      console.log(
        "[CopilotClient] 🔄 Re-initializing SDK with provided user token",
      );
      this.client = new RealCopilotClient({
        env: {
          ...process.env,
          GITHUB_TOKEN: options.githubToken,
          GH_TOKEN: options.githubToken,
          COPILOT_GITHUB_TOKEN: options.githubToken,
        },
      } as any);
    }

    try {
      // Ensure client is started
      // The SDK's start() is usually idempotent or we can check state if needed,
      // but simplistic approach: just call it.
      console.log("[CopilotClient] Starting SDK client...");
      await this.client.start();

      console.log("[CopilotClient] Verifying authentication...");
      const authStatus = await this.client.getAuthStatus();
      console.log(`[CopilotClient] Auth Status: ${JSON.stringify(authStatus)}`);

      const statusAny = authStatus as any;
      if (
        statusAny.status === "NotAuthenticated" ||
        statusAny.status === "error" ||
        statusAny.isAuthenticated === false
      ) {
        throw new Error(
          `Copilot Authentication Failed: ${authStatus.statusMessage || "Unknown reason"}`,
        );
      }

      // Create real SDK session
      const realSession = await this.client.createSession({
        model,
        streaming: options.streaming !== false,
        tools: options.tools, // Pass undefined if not provided, allowing SDK defaults
      });

      // Wrap the real session to normalize event types
      return {
        async sendAndWait(request: { prompt: string }) {
          let output = "";

          realSession.on((event: any) => {
            // console.log(
            //   `[CopilotClient] Raw Event: ${event.type}`,
            //   JSON.stringify(event.data || {}, null, 2),
            // );

            // Wrapper to map internal types to our exported types
            let mappedEvent: SessionEvent | null = null;

            switch (event.type) {
              case "assistant.message_delta":
                mappedEvent = {
                  type: "assistant.message_delta",
                  data: {
                    deltaContent: event.data?.deltaContent,
                    messageId: event.data?.messageId,
                  },
                };
                output += event.data?.deltaContent || "";
                break;

              case "assistant.turn_start":
                mappedEvent = {
                  type: "assistant.turn_start",
                  data: { turnId: event.data?.turnId },
                };
                break;

              case "assistant.turn_end":
                mappedEvent = {
                  type: "assistant.turn_end",
                  data: { turnId: event.data?.turnId },
                };
                break;

              case "session.usage_info":
                mappedEvent = {
                  type: "session.usage_info",
                  data: event.data,
                };
                break;

              case "session.idle":
                mappedEvent = { type: "session.idle" };
                break;

              case "tool.start":
              case "tool_start": // Fallback for older SDK versions
              case "tool.execution_start":
                mappedEvent = {
                  type: "tool.execution_start",
                  data: {
                    toolName: event.data?.toolName,
                    toolCallId: event.data?.toolCallId,
                    arguments: event.data?.arguments,
                  },
                };
                break;

              case "tool.end":
              case "tool_end":
              case "tool.execution_complete":
                mappedEvent = {
                  type: "tool.execution_complete",
                  data: {
                    toolCallId: event.data?.toolCallId,
                    result: event.data?.result,
                    success: event.data?.success,
                  },
                };
                break;

              case "error":
              case "session.error":
                mappedEvent = {
                  type: "error",
                  data: { message: event.data?.message || "Unknown error" },
                };
                break;
            }

            if (mappedEvent) {
              self.eventListeners.forEach((listener) => listener(mappedEvent!));
            }
          });

          console.log(
            `[CopilotClient] Sending Prompt: ${request.prompt.substring(0, 50)}...`,
          );
          try {
            const response = await realSession.sendAndWait(request);
            console.log(
              `[CopilotClient] Final Response:`,
              JSON.stringify(response, null, 2),
            );
            return response;
          } catch (err) {
            console.error(`[CopilotClient] sendAndWait failed:`, err);
            throw err;
          }
        },
        on(callback: (event: SessionEvent) => void) {
          self.eventListeners.push(callback);
        },
      };
    } catch (error) {
      console.error("[CopilotClient] Failed to create session:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    console.log("[CopilotClient] Stopping session...");
    // Real SDK cleanup if needed
  }
}

let copilotInstance: CopilotClient | null = null;

export function getCopilotClient(): CopilotClient {
  if (!copilotInstance) {
    copilotInstance = new CopilotClient();
  }
  return copilotInstance;
}

/**
 * Tool Definition Helper
 * Creates Copilot SDK-compatible tool definitions
 *
 * Example:
 * const gitTool = defineTool("git_ops", {
 *   description: "Execute git operations",
 *   parameters: {
 *     type: "object",
 *     properties: { ... },
 *     required: [...]
 *   },
 *   handler: async (args) => ({ ... })
 * });
 */
export function defineTool(
  name: string,
  definition: {
    description: string;
    parameters?: any;
    handler?: (args: any) => Promise<any>;
  },
) {
  return {
    name,
    ...definition,
  };
}
