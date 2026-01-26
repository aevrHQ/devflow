import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Agent from "@/models/Agent";
import TaskAssignment from "@/models/TaskAssignment";
import { verifyAgentToken, extractToken } from "@/lib/agentAuth";
import { decrypt } from "@/lib/encryption";

/**
 * GET /api/agents/[agent_id]/commands
 * Fetch pending commands for this agent
 * Requires: Authorization: Bearer <token>
 */
export async function GET(
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

    // Verify agent exists and belongs to user
    const agent = await Agent.findOne({ agentId, userId: payload.userId });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get pending tasks
    const commands = await TaskAssignment.find({
      agentId,
      status: "pending",
    }).sort({ createdAt: 1 });

    return NextResponse.json(
      {
        success: true,
        commands: commands.map((cmd) => {
          const credentials = cmd.credentials ? { ...cmd.credentials } : {};

          // Decrypt GitHub token if present
          if (credentials.github) {
            try {
              credentials.github = decrypt(credentials.github);
            } catch (e) {
              console.error(
                "Failed to decrypt credentials for command",
                cmd.taskId,
                e,
              );
              // Do not send encrypted string
              credentials.github = "";
            }
          }

          return {
            task_id: cmd.taskId,
            intent: cmd.intent,
            description: cmd.description || cmd.intent,
            repo: cmd.repo || "",
            branch: cmd.branch || "",
            credentials,
            created_at: cmd.createdAt,
          };
        }),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[agents/[agent_id]/commands]", error);
    return NextResponse.json(
      { error: "Failed to fetch commands" },
      { status: 500 },
    );
  }
}
