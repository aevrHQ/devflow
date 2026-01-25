import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import TaskAssignment from "@/models/TaskAssignment";
import Agent from "@/models/Agent";
import { Types } from "mongoose";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  GitBranch,
  Terminal,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await connectToDatabase();

  const tasks = await TaskAssignment.find({
    userId: new Types.ObjectId(user.userId),
  })
    .sort({ createdAt: -1 })
    .limit(50);

  // Fetch agents to map agentId to name
  const agentIds = Array.from(new Set(tasks.map((t) => t.agentId)));
  const agents = await Agent.find({ agentId: { $in: agentIds } });
  const agentMap = new Map(agents.map((a) => [a.agentId, a.name]));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Tasks</h1>
          <p className="text-gray-500">
            History of tasks executed by your connected agents
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Ask your agent to do something via Telegram or Slack (e.g., "Ask
              my agent to fix the bug...").
            </p>
            <Link
              href="/help/agents"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Learn how to run tasks
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <Link
                key={task.taskId}
                href={`/dashboard/tasks/${task.taskId}`}
                className="block p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1">
                      {task.status === "completed" && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {task.status === "failed" && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      {task.status === "in_progress" && (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                      {task.status === "pending" && (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 truncate">
                          {task.intent || "Unknown Task"}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : task.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : task.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.status}
                        </span>
                        {task.repo && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 border border-gray-200 px-1.5 py-0.5 rounded-sm">
                            <GitBranch className="w-3 h-3" />
                            {task.repo}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>
                          Agent:{" "}
                          {agentMap.get(task.agentId) ||
                            task.agentId.substring(0, 8)}
                        </span>
                        <span>•</span>
                        <span>{new Date(task.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-2" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
