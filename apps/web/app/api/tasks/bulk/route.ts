import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import TaskAssignment from "@/models/TaskAssignment";
import { Types } from "mongoose";

/**
 * DELETE /api/tasks/bulk
 * Bulk delete multiple tasks
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskIds } = body as { taskIds: string[] };

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: "taskIds must be a non-empty array" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Delete tasks that belong to the user
    const result = await TaskAssignment.deleteMany({
      taskId: { $in: taskIds },
      userId: new Types.ObjectId(user.userId),
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} task(s)`,
    });
  } catch (error) {
    console.error("[tasks/bulk/DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete tasks" },
      { status: 500 },
    );
  }
}
