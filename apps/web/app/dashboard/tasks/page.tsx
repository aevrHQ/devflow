import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import TaskAssignment from "@/models/TaskAssignment";
import Agent from "@/models/Agent";
import { Types } from "mongoose";
import TaskList from "@/components/TaskList";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await connectToDatabase();

  const tasks = await TaskAssignment.find({
    userId: new Types.ObjectId(user.userId),
  })
    .sort({ createdAt: -1 })
    .limit(100); // Increased limit for better UX

  // Fetch agents to map agentId to name
  const agentIds = Array.from(new Set(tasks.map((t) => t.agentId)));
  const agents = await Agent.find({ agentId: { $in: agentIds } });
  const agentMap = new Map(agents.map((a) => [a.agentId, a.name]));

  // Convert mongoose documents to plain objects
  const plainTasks = tasks.map((task) => ({
    _id: task._id.toString(),
    taskId: task.taskId,
    intent: task.intent,
    description: task.description,
    status: task.status,
    repo: task.repo,
    agentId: task.agentId,
    createdAt: task.createdAt.toISOString(),
  }));

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

      <TaskList initialTasks={plainTasks} agentMap={agentMap} />
    </div>
  );
}
