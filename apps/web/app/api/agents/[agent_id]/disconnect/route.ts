import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Agent from "@/models/Agent";
import TaskAssignment from "@/models/TaskAssignment";
import User from "@/models/User";
import { NotificationService } from "@/lib/notification/service";

/**
 * POST /api/agents/[agent_id]/disconnect
 * Disconnect an agent (destructive - requires manual restart)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agent_id: string }> },
) {
  try {
    await connectDB();

    const { agent_id: agentId } = await params;

    // Find the agent
    const agent = await Agent.findOne({ agentId });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // TODO: Add user authentication to verify ownership
    // For now, accepting any disconnect request

    // Update agent status to disconnected
    const previousStatus = agent.status;
    agent.status = "disconnected";
    agent.lastHeartbeat = new Date();

    await agent.save();

    // Cancel all pending/in_progress tasks for this agent
    const cancelledTasks = await TaskAssignment.updateMany(
      {
        agentId,
        status: { $in: ["pending", "in_progress"] },
      },
      {
        $set: {
          status: "cancelled",
          completedAt: new Date(),
          currentStep: "Agent disconnected by user",
        },
      },
    );

    // Send notification
    try {
      const user = await User.findById(agent.userId);
      if (user) {
        const notificationService = new NotificationService();
        await notificationService.send(user, {
          title: "Agent Disconnected",
          emoji: "🔌",
          summary: `Agent "${agent.name}" (${agent.agentId.substring(0, 8)}) was disconnected. ${cancelledTasks.modifiedCount} task(s) cancelled.`,
          fields: [
            { label: "Agent", value: agent.name },
            { label: "Agent ID", value: agent.agentId.substring(0, 8) },
            { label: "Previous Status", value: previousStatus },
            {
              label: "Tasks Cancelled",
              value: cancelledTasks.modifiedCount.toString(),
            },
          ],
          links: [],
          payloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
          source: undefined,
          eventType: "agent.disconnected",
        });
      }
    } catch (notifError) {
      console.error("[agent/disconnect] Notification error:", notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Agent disconnected successfully",
      agent: {
        agentId: agent.agentId,
        name: agent.name,
        status: agent.status,
        previousStatus,
      },
      tasksCancelled: cancelledTasks.modifiedCount,
    });
  } catch (error) {
    console.error("[agent/disconnect] Error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect agent" },
      { status: 500 },
    );
  }
}
