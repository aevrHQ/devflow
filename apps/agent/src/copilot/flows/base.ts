// Workflow executor base and orchestration logic
import { CopilotClient, Session, SessionEvent } from "../client.js";
import { CommandRequest, ProgressUpdate } from "../../types.js";
import PingaClient from "../../pinga/client.js";
import { getAllTools } from "../tools/index.js";

export interface WorkflowContext {
  taskId: string;
  intent: string;
  repo: string;
  localPath?: string;
  branch?: string;
  naturalLanguage: string;
  context?: Record<string, any>;
  source: {
    channel: "telegram" | "slack" | "cli";
    chatId: string;
    messageId: string;
  };
  // User credentials (encrypted, optional - for managed SaaS mode)
  credentials?: {
    github?: string; // Encrypted GitHub token
  };
  sessionId?: string; // Optional session ID for persistence
  localGitHubToken?: string; // Local GitHub PAT from config (preferred over platform credentials)
}

export interface WorkflowResult {
  success: boolean;
  output?: string;
  prUrl?: string;
  summary?: string;
  error?: string;
}

export class WorkflowExecutor {
  protected pingaClient: PingaClient;
  protected copilot: CopilotClient;
  protected pingaConfig: { url: string; secret: string };

  // Auto-incrementing progress tracking
  private progressUpdateCount = 0;
  private readonly ESTIMATED_MAX_UPDATES = 30; // Rough estimate of updates per workflow
  private readonly MAX_AUTO_PROGRESS = 0.95; // Cap at 95%, leave 5% for completion

  constructor(pingaUrl: string, pingaSecret: string) {
    this.pingaConfig = { url: pingaUrl, secret: pingaSecret };
    this.pingaClient = new PingaClient(pingaUrl, pingaSecret);
    this.copilot = new CopilotClient(); // Will be replaced with actual SDK when available
  }

  protected async sendProgress(
    taskId: string,
    step: string,
    progress: number,
    details?: string,
  ): Promise<void> {
    // Auto-increment progress instead of using Copilot's arbitrary values
    this.progressUpdateCount++;
    const autoProgress = Math.min(
      this.MAX_AUTO_PROGRESS,
      this.progressUpdateCount / this.ESTIMATED_MAX_UPDATES,
    );

    await this.pingaClient.sendProgressUpdate({
      taskId,
      status: "in_progress",
      step,
      progress: autoProgress, // Use calculated progress instead of Copilot's value
      details,
      timestamp: Date.now(),
    });
  }

  protected async sendCompletion(
    taskId: string,
    result: WorkflowResult,
  ): Promise<void> {
    console.log(
      `[WorkflowExecutor] Sending completion for ${taskId}, success: ${result.success}`,
    );
    try {
      if (result.success) {
        await this.pingaClient.notifyCompletion(taskId, {
          summary: result.summary || "Workflow completed successfully",
          prUrl: result.prUrl,
          output: result.output,
        });
        console.log(
          `[WorkflowExecutor] Completion notification sent for ${taskId}`,
        );
      } else {
        await this.pingaClient.notifyError(
          taskId,
          result.error || "Workflow failed",
        );
        console.log(`[WorkflowExecutor] Error notification sent for ${taskId}`);
      }
    } catch (error) {
      console.error(
        `[WorkflowExecutor] Failed to send completion notification: ${error}`,
      );
    }
  }

  protected buildSystemPrompt(
    intent: string,
    context: WorkflowContext,
  ): string {
    return `You are Devflow, an AI DevOps agent integrated with GitHub Copilot.

Your task: ${intent}
Repository: ${context.repo}
Branch: ${context.branch || "main"}
Request: ${context.naturalLanguage}
Task ID: ${context.taskId}

You have access to these tools:
- git_operations: Clone, branch, commit, push repositories
- run_tests: Run test suites and capture results
- read_file, write_file, list_files: File operations
- open_pull_request: Create and manage pull requests
- send_progress_update: Send progress updates to the user

IMPORTANT:
1. Always send progress updates at key milestones
2. Use read_file to examine code before making changes
3. Verify changes with run_tests before pushing
4. Create pull requests with clear descriptions
5. Report all errors clearly with context

Begin by understanding the repository structure.`;
  }

  protected async setupSession(context: WorkflowContext): Promise<Session> {
    try {
      // Check for existing session
      if (context.sessionId) {
        const { SessionRegistry } = await import("../session-registry.js");
        const existingSession = SessionRegistry.get(context.sessionId);
        if (existingSession) {
          return existingSession;
        }
      }

      // Determine GitHub token source (Priority: local > platform > env)
      let userGitHubToken: string | undefined;

      // 1. Check local config token (most secure, recommended)
      if (context.localGitHubToken) {
        userGitHubToken = context.localGitHubToken;
        console.log("[Workflow] Using local GitHub token from config");
      }
      // 2. Try platform-provided encrypted credentials (legacy/SaaS mode)
      else if (context.credentials?.github) {
        try {
          const { decryptCredentials } = await import("../../credentials.js");
          const decrypted = decryptCredentials(context.credentials);
          userGitHubToken = decrypted.github;
          console.log(
            "[Workflow] Using decrypted user credentials (managed SaaS)",
          );
        } catch (error) {
          console.warn(
            "[Workflow] Failed to decrypt credentials, falling back to env var:",
            error instanceof Error ? error.message : error,
          );
        }
      }
      // 3. Fall back to environment variable
      else {
        console.log(
          "[Workflow] No local token or platform credentials. Using GITHUB_TOKEN from environment (if set)",
        );
      }

      const session = await this.copilot.createSession({
        model: process.env.COPILOT_MODEL || "gpt-3.5-turbo",
        streaming: true,
        tools: getAllTools({
          githubToken: userGitHubToken,
          localPath: context.localPath,
          pingaUrl: this.pingaConfig.url,
          pingaSecret: this.pingaConfig.secret,
        }),
        githubToken: userGitHubToken,
        mcpServers:
          process.env.COPILOT_ENABLE_MCP === "true"
            ? {
                github: {
                  type: "http",
                  url: "https://api.github.com/mcp/",
                },
              }
            : undefined,
      });

      // Register new session if ID provided
      if (context.sessionId) {
        const { SessionRegistry } = await import("../session-registry.js");
        SessionRegistry.register(context.sessionId, session);
      }

      return session;
    } catch (error) {
      throw new Error(`Failed to create Copilot session: ${error}`);
    }
  }

  protected async executeWorkflow(
    prompt: string,
    context: WorkflowContext,
  ): Promise<WorkflowResult> {
    try {
      // Reset progress counter for this workflow
      this.progressUpdateCount = 0;

      const session = await this.setupSession(context);

      this.pingaClient.sendLog(
        context.taskId,
        "info",
        `Starting workflow execution for task: ${context.intent}`,
      );
      this.pingaClient.sendLog(
        context.taskId,
        "info",
        `Context: Repo=${context.repo}, Branch=${context.branch || "default"}, LocalPath=${context.localPath || "N/A"}`,
      );

      let output = "";
      let hasError = false;
      let errorMessage = "";

      // Listen for session events
      let pendingDeltaBuffer = "";
      let lastProgressUpdate = 0;
      const PROGRESS_THROTTLE_MS = 2000; // Throttle text updates to every 2s

      session.on((event: SessionEvent) => {
        // console.log(`[${context.taskId}] Event:`, event.type); // Debug logging

        if (
          event.type === "tool.execution_start" ||
          event.type === "tool.start"
        ) {
          const toolName = event.data?.toolName || "unknown";
          console.log(`[${context.taskId}] Tool Start: ${toolName}`);

          // Flush any pending text before announcing tool start
          if (pendingDeltaBuffer.trim().length > 0) {
            this.sendProgress(
              context.taskId,
              pendingDeltaBuffer, // Send the accumulated text as the "step" description/output
              0.3,
            ).catch(console.error);
            pendingDeltaBuffer = "";
          }

          this.sendProgress(
            context.taskId,
            `Executing: ${toolName}`,
            0.3,
          ).catch(console.error);
        }

        if (
          event.type === "tool.execution_complete" ||
          event.type === "tool.end"
        ) {
          const result = event.data?.result;
          console.log(
            `[${context.taskId}] Tool Result:`,
            JSON.stringify(result).substring(0, 100) + "...",
          );
          // We don't send a separate update for tool end to avoid noise, unless it failed
        }

        if (event.type === "assistant.message_delta") {
          const chunk = event.data?.deltaContent || "";
          output += chunk;
          pendingDeltaBuffer += chunk;

          // Periodically flush buffer to keep user engaged if response is long
          const now = Date.now();
          if (
            now - lastProgressUpdate > PROGRESS_THROTTLE_MS &&
            pendingDeltaBuffer.length > 20
          ) {
            // Send what we have so far
            // Note: In a real streaming architecture, we'd append.
            // Here we are updating the "step" which might overwrite previous "step" text in UI
            // depending on how frontend handles it.
            // For "smart batching" in a chat context, we mainly want to avoid network spam.
            this.sendProgress(
              context.taskId,
              pendingDeltaBuffer, // Update current "step" with latest text chunk
              0.4,
            ).catch(console.error);
            lastProgressUpdate = now;
            // We keep buffer growing? Or reset?
            // If we reset, the UI might see "..." -> "Hello" -> "World".
            // If the UI replaces the text, we should probably send the *accumulated* buffer for this turn if possible,
            // or just send the delta if the UI appends.
            // Assuming the UI replaces "step" description:
            // Let's NOT reset buffer here if we want to show full message building up in the "step" field.
            // But pendingDeltaBuffer is meant to be "whats new".
            // Let's assume the UI shows a log or chat bubble.
            // To be safe, we just throttle.
            // Actually, flushing effectively clears the "pending" state for the *next* update.
            pendingDeltaBuffer = "";
          }
        }

        if (event.type === "session.usage_info") {
          console.log(
            `[${context.taskId}] Token Usage: ${event.data?.currentTokens}/${event.data?.tokenLimit}`,
          );
        }

        if (event.type === "error") {
          hasError = true;
          errorMessage = event.data?.message || "Unknown error";
          console.error(`[${context.taskId}] Error:`, errorMessage);
        }
      });

      // Send the workflow prompt
      await session.sendAndWait({ prompt });

      if (hasError) {
        return {
          success: false,
          error: errorMessage,
          output,
        };
      }

      return {
        success: true,
        output,
        summary: "Workflow completed successfully",
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  async execute(context: WorkflowContext): Promise<WorkflowResult> {
    throw new Error("execute() must be implemented by subclasses");
  }
}
