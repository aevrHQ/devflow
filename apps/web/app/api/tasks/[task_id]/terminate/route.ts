import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TaskAssignment from "@/models/TaskAssignment";
import User from "@/models/User";
import { NotificationService } from "@/lib/notification/service";

/**
 * POST /api/tasks/[task_id]/terminate
 * Terminate/cancel a running or pending task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> },
) {
  try {
    await connectDB();

    const { task_id: taskId } = await params;

    // Find the task
    const task = await TaskAssignment.findOne({ taskId });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if task is already in a terminal state
    if (["completed", "failed", "cancelled"].includes(task.status)) {
      return NextResponse.json(
        {
          error: `Task is already ${task.status}`,
          currentStatus: task.status,
        },
        { status: 400 },
      );
    }

    // Update task status to cancelled
    task.status = "cancelled";
    task.completedAt = new Date();
    task.currentStep = "Task cancelled by user";

    await task.save();

    // Send notification
    try {
      const user = await User.findById(task.userId);
      if (user) {
        const notificationService = new NotificationService();
        await notificationService.send(user, {
          title: "Task Cancelled",
          emoji: "⛔",
          summary: `Task "${task.description || task.intent}" was cancelled`,
          fields: [
            { label: "Task ID", value: taskId },
            { label: "Intent", value: task.intent },
            { label: "Status", value: "cancelled" },
          ],
          links: [],
          payloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/tasks/${taskId}`,
          source: task.source?.channel,
          eventType: "task.cancelled",
        });
      }
    } catch (notifError) {
      console.error("[task/terminate] Notification error:", notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Task cancelled successfully",
      task: {
        taskId: task.taskId,
        status: task.status,
        completedAt: task.completedAt,
      },
    });
  } catch (error) {
    console.error("[task/terminate] Error:", error);
    return NextResponse.json(
      { error: "Failed to cancel task" },
      { status: 500 },
    );
  }
}
