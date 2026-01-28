import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/sessions
 * List sessions, optionally filtered by taskId
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get("taskId");

    const query: { userId: string; taskId?: string } = { userId: user.userId };
    if (taskId) {
      query.taskId = taskId;
    }

    const sessions = await Session.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[api/sessions] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/sessions
 * Create a new session
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, taskId, agentId, status, metadata } = body;

    if (!sessionId || !taskId || !agentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if session already exists
    const existingSession = await Session.findOne({ sessionId });
    if (existingSession) {
      // Update existing session
      existingSession.status = status || existingSession.status;
      existingSession.lastActiveAt = new Date();
      if (metadata) {
        existingSession.metadata = { ...existingSession.metadata, ...metadata };
      }
      await existingSession.save();
      return NextResponse.json({ session: existingSession });
    }

    // Create new session
    const session = await Session.create({
      sessionId,
      taskId,
      agentId,
      userId: user.userId,
      status: status || "active",
      metadata,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("[api/sessions] Error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
