import { z } from "zod";
import { tool } from "ai";
import { getCurrentUser } from "@/lib/auth";
import { getUserStats } from "@/lib/stats";
import connectToDatabase from "@/lib/mongodb";
import Installation from "@/models/Installation";
import WebhookEvent from "@/models/WebhookEvent";
import User from "@/models/User";
import Channel from "@/models/Channel";
import { Types, FilterQuery } from "mongoose";
import { decryptJSON } from "@/lib/encryption";
import Agent from "@/models/Agent";
import TaskAssignment from "@/models/TaskAssignment";
import { randomUUID } from "crypto";

// --- Stats & Activity Tools ---

const noParamsSchema = z.object({}).optional().nullable();

async function getAuthorizedUserId(contextUserId?: string) {
  if (contextUserId) return contextUserId;
  const user = await getCurrentUser();
  return user?.userId;
}

export const createDashboardTools = (
  context: {
    userId?: string;
    source?: {
      channel: "telegram" | "slack" | "dashboard" | "cli";
      chatId?: string;
      messageId?: string;
    };
  } = {},
) => {
  return {
    getDashboardStats: tool({
      description:
        "Get aggregated statistics for the user's dashboard (total events, success rate, etc.)",
      inputSchema: noParamsSchema,
      execute: async () => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        return await getUserStats(userId);
      },
    }),

    getRecentActivity: tool({
      description: "Get a list of recent webhook events/activity logs.",
      inputSchema: z.object({
        limit: z.number().optional().default(20),
        status: z
          .enum(["pending", "processed", "failed", "ignored"])
          .optional(),
      }),
      execute: async ({ limit, status }) => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();

        const installations = await Installation.find({
          userId: new Types.ObjectId(userId),
        });
        const installationIds = installations.map((i) => i.installationId);

        if (installationIds.length === 0) return { events: [] };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: FilterQuery<any> = {
          "payload.installation.id": { $in: installationIds },
        };
        if (status) query.status = status;

        const events = await WebhookEvent.find(query)
          .sort({ createdAt: -1 })
          .limit(limit || 20);

        return {
          events: events.map((e) => ({
            id: e._id.toString(),
            event: e.event,
            source: e.source,
            status: e.status,
            createdAt: e.createdAt,
            // Decrypt payload for the agent
            repo: decryptJSON(e.payload)?.repository?.full_name,
            // We might want to expose more payload data to the agent if needed
            // payload: decryptJSON(e.payload)
          })),
        };
      },
    }),

    getInstallations: tool({
      description: "Get a list of connected GitHub installations/accounts.",
      inputSchema: noParamsSchema,
      execute: async () => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();
        const installations = await Installation.find({
          userId: new Types.ObjectId(userId),
        });

        return {
          installations: installations.map((i) => ({
            installationId: i.installationId,
            accountLogin: i.accountLogin,
            accountType: i.accountType,
            repositorySelection: i.repositorySelection,
          })),
        };
      },
    }),

    // --- Settings Tools ---

    getNotificationChannels: tool({
      description: "Get the user's configured notification channels.",
      inputSchema: noParamsSchema,
      execute: async () => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();
        const channels = await Channel.find({
          userId: new Types.ObjectId(userId),
        }).lean();

        return { channels: JSON.parse(JSON.stringify(channels)) };
      },
    }),

    addNotificationChannel: tool({
      description: "Add a new notification channel.",
      inputSchema: z.object({
        type: z.enum(["telegram", "discord", "slack", "email", "webhook"]),
        name: z.string().describe("Friendly name for the channel"),
        config: z
          .record(z.string(), z.any())
          .describe("Configuration object (e.g. webhookUrl, chatId)"),
      }),
      execute: async ({ type, name, config }) => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();
        const channel = new Channel({
          userId: new Types.ObjectId(userId),
          type,
          name,
          config,
          enabled: true,
        });
        await channel.save();

        return {
          success: true,
          channel: JSON.parse(JSON.stringify(channel.toObject())),
        };
      },
    }),

    updateNotificationChannel: tool({
      description:
        "Update an existing notification channel configuration or filters.",
      inputSchema: z.object({
        channelId: z.string(),
        updates: z.object({
          name: z.string().optional(),
          enabled: z.boolean().optional(),
          config: z.record(z.string(), z.any()).optional(),
          webhookRules: z
            .object({
              sources: z.array(
                z.object({
                  type: z.string(),
                  enabled: z.boolean(),
                  filters: z
                    .object({
                      repositories: z.array(z.string()).optional(),
                      eventTypes: z.array(z.string()).optional(),
                      services: z.array(z.string()).optional(),
                    })
                    .optional(),
                }),
              ),
            })
            .optional(),
        }),
      }),
      execute: async ({ channelId, updates }) => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();
        const channel = await Channel.findOneAndUpdate(
          { _id: channelId, userId: new Types.ObjectId(userId) },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { $set: updates } as any,
          { new: true },
        ).lean();

        if (!channel) return { error: "Channel not found" };
        return {
          success: true,
          channel: JSON.parse(JSON.stringify(channel)),
        };
      },
    }),

    deleteNotificationChannel: tool({
      description: "Delete a notification channel.",
      inputSchema: z.object({
        channelId: z.string(),
      }),
      execute: async ({ channelId }) => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();
        await Channel.deleteOne({
          _id: channelId,
          userId: new Types.ObjectId(userId),
        });
        return { success: true };
      },
    }),

    getUserPreferences: tool({
      description: "Get user preferences (e.g. AI summary settings).",
      inputSchema: noParamsSchema,
      execute: async () => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();
        const userDoc = await User.findById(userId).lean();
        return { preferences: userDoc?.preferences || {} };
      },
    }),

    updateUserPreferences: tool({
      description: "Update user preferences.",
      inputSchema: z.object({
        aiSummary: z.boolean().optional(),
        allowedSources: z.array(z.string()).optional(),
      }),
      execute: async (updates) => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateQuery: Record<string, any> = {};
        if (updates.aiSummary !== undefined)
          updateQuery["preferences.aiSummary"] = updates.aiSummary;
        if (updates.allowedSources !== undefined)
          updateQuery["preferences.allowedSources"] = updates.allowedSources;

        if (Object.keys(updateQuery).length > 0) {
          await User.findByIdAndUpdate(userId, { $set: updateQuery });
        }

        return { success: true };
      },
    }),

    // --- DevFlow Agent Tools ---

    getAgents: tool({
      description:
        "Get a list of connected DevFlow agents (CLI agents running on user machines).",
      inputSchema: noParamsSchema,
      execute: async () => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();
        const agents = await Agent.find({ userId });

        const now = new Date();
        const heartbeatThreshold = 2 * 60 * 1000; // 2 minutes

        const agentStatuses = await Promise.all(
          agents.map(async (a) => {
            const lastHeartbeat = new Date(a.lastHeartbeat || 0);
            const isStale =
              now.getTime() - lastHeartbeat.getTime() > heartbeatThreshold;

            if (isStale && a.status === "online") {
              a.status = "offline";
              await a.save();
            } else if (!isStale && a.status === "offline") {
              // Should theoretically be handled by heartbeat endpoint, but self-correct just in case
              a.status = "online";
              await a.save();
            }

            return {
              id: a.agentId,
              name: a.name,
              status: a.status,
              version: a.version,
              platform: a.platform,
              workingDirectory: a.workingDirectory,
              lastHeartbeat: a.lastHeartbeat,
              capabilities: [...a.capabilities], // Convert MongooseArray to plain array
            };
          }),
        );

        return {
          agents: agentStatuses,
        };
      },
    }),

    createAgentTask: tool({
      description: "Dispatch a task/command to a specific connected agent.",
      inputSchema: z.object({
        agentId: z.string().describe("The ID of the agent to send the task to"),
        intent: z.string().describe("Short intent/summary of the task"),
        description: z
          .string()
          .describe("Full natural language description of what to do"),
        repo: z
          .string()
          .optional()
          .describe("Target repository (optional for local tasks)"),
        branch: z.string().optional().describe("Target branch (optional)"),
      }),
      execute: async ({ agentId, intent, description, repo, branch }) => {
        const userId = await getAuthorizedUserId(context.userId);
        if (!userId) return { error: "Unauthorized" };

        await connectToDatabase();

        const agent = await Agent.findOne({ agentId, userId });
        if (!agent) return { error: "Agent not found or unauthorized" };

        // Use provided repo or fall back to agent's workingDirectory
        const targetPath = repo || agent.workingDirectory || "local";

        const taskId = `task-${randomUUID()}`;
        const task = new TaskAssignment({
          taskId,
          agentId,
          userId,
          intent,
          description,
          repo: targetPath,
          branch,
          status: "pending",
          progress: 0,
          currentStep: "queued",
          startedAt: new Date(),
          source: context.source || { channel: "dashboard" },
        });

        await task.save();

        return {
          success: true,
          taskId,
          message:
            "Task dispatched to agent. The agent will pick it up shortly.",
          status: "pending",
        };
      },
    }),
  };
};

export const dashboardTools = createDashboardTools();
