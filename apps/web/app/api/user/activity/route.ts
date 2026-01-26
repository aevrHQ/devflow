import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import NotificationLog from "@/models/NotificationLog";
import { Types } from "mongoose";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate pagination
    const validLimit = Math.min(Math.max(limit, 1), 50); // Max 50
    const skip = (Math.max(page, 1) - 1) * validLimit;

    await connectToDatabase();

    const logs = await NotificationLog.find({
      userId: new Types.ObjectId(user.userId),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(validLimit)
      .lean();

    const totalCount = await NotificationLog.countDocuments({
      userId: new Types.ObjectId(user.userId),
    });

    const hasMore = skip + logs.length < totalCount;

    return NextResponse.json({
      logs,
      page,
      limit: validLimit,
      total: totalCount,
      hasMore,
    });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
