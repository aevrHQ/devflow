import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getCurrentUser } from "@/lib/auth";

/**
 * PATCH /api/sessions/[session_id]
 * Update a session (e.g. status, metadata)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session_id: sessionId } = await params;
    const body = await request.json();

    await connectDB();

    const session = await Session.findOne({ sessionId, userId: user.userId });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (body.status) session.status = body.status;
    if (body.metadata) {
      session.metadata = { ...session.metadata, ...body.metadata };
    }
    session.lastActiveAt = new Date();

    await session.save();

    return NextResponse.json({ session });
  } catch (error) {
    console.error("[api/sessions/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 },
    );
  }
}
