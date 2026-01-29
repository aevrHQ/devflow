import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Agent from "@/models/Agent";
import { verifyAgentToken, extractToken } from "@/lib/agentAuth";
import User from "@/models/User";
import { notificationService } from "@/lib/notification/service";

/**
 * POST /api/agents/[agent_id]/heartbeat
 * Update agent's last heartbeat and keep it online
 * Requires: Authorization: Bearer <token>
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agent_id: string }> },
) {
  try {
    await connectDB();

    const { agent_id: agentId } = await params;

    // Extract and verify token
    const token = extractToken(request.headers.get("Authorization") || "");
    if (!token) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const payload = verifyAgentToken(token);
    if (!payload || payload.agentId !== agentId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Parse optional metadata from body
    let meta: { cwd?: string; capabilities?: string[] } = {};
    try {
      const body = await request.json();
      if (body && typeof body === "object") {
        meta = body;
      }
    } catch {} // Body might be empty

    // Update agent's heartbeat (but preserve "disconnected" status)
    const agent = await Agent.findOne({ agentId, userId: payload.userId });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const wasOffline = agent.status !== "online" && agent.status !== "busy";

    // Only update to online if not disconnected
    if (agent.status !== "disconnected") {
      agent.status = "online";
    }

    // Update metadata if provided
    if (meta.cwd) agent.workingDirectory = meta.cwd;
    // Update capabilities if provided and array is not empty (preserve existing if empty sent by mistake?)
    // Client sends ["git", "copilot"]
    if (meta.capabilities && Array.isArray(meta.capabilities)) {
      agent.capabilities = meta.capabilities;
    }

    agent.lastHeartbeat = new Date();
    await agent.save();

    // Trigger notification if agent just came online
    if (wasOffline && agent.status === "online") {
      const user = await User.findById(payload.userId);
      if (user) {
        await notificationService.send(user, {
          title: `🔌 Agent Online: ${agent.name}`,
          emoji: "🔌",
          source: "agent",
          eventType: "agent.online",
          payloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/agents`,
          fields: [
            { label: "Platform", value: agent.platform || "Unknown" },
            { label: "CWD", value: agent.workingDirectory || "N/A" },
            {
              label: "Capabilities",
              value: agent.capabilities?.join(", ") || "None",
            },
          ],
          links: [
            {
              label: "View Agent",
              url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/agents`,
            },
          ],
          rawPayload: {
            agentId: agent.agentId,
            name: agent.name,
            platform: agent.platform,
            cwd: agent.workingDirectory,
            capabilities: agent.capabilities,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        lastHeartbeat: agent.lastHeartbeat,
        status: agent.status, // Return current status so agent can detect disconnection
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[agents/[agent_id]/heartbeat]", error);
    return NextResponse.json(
      { error: "Failed to update heartbeat" },
      { status: 500 },
    );
  }
}
