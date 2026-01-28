import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Agent from "@/models/Agent";
import { Types } from "mongoose";
import AgentList from "@/components/AgentList";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await connectToDatabase();

  const agents = await Agent.find({
    userId: new Types.ObjectId(user.userId),
  }).sort({ createdAt: -1 });

  // Convert to plain objects
  const plainAgents = agents.map((agent) => ({
    id: agent.agentId,
    name: agent.name,
    status: agent.status,
    lastHeartbeat: agent.lastHeartbeat?.toISOString() || null,
    createdAt: agent.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage your connected DevFlow agents
          </p>
        </div>
      </div>

      <AgentList initialAgents={plainAgents} />
    </div>
  );
}
