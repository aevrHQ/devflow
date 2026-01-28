"use client";

import { useAgentStatus } from "@/hooks/useAgentStatus";
import Link from "next/link";
import { Activity, Power, Terminal, Clock, Trash2 } from "lucide-react";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  status: string;
  lastHeartbeat: string | null;
  createdAt: string;
}

interface AgentListProps {
  initialAgents: Agent[];
}

export default function AgentList({ initialAgents }: AgentListProps) {
  const agents = useAgentStatus(initialAgents);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const handleDisconnect = async (agentId: string, agentName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to disconnect "${agentName}"? The agent will need to be manually restarted.`,
    );

    if (!confirmed) return;

    setDisconnecting(agentId);
    try {
      const response = await fetch(`/api/agents/${agentId}/disconnect`, {
        method: "POST",
      });

      if (response.ok) {
        window.location.reload(); // Refresh to show updated status
      } else {
        alert("Failed to disconnect agent. Please try again.");
      }
    } catch (error) {
      console.error("Failed to disconnect agent:", error);
      alert("An error occurred while disconnecting the agent.");
    } finally {
      setDisconnecting(null);
    }
  };

  const handleDelete = async (agentId: string, agentName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to PERMANENTLY delete "${agentName}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDisconnecting(agentId); // Reusing state for loading
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete agent. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
      alert("An error occurred while deleting the agent.");
    } finally {
      setDisconnecting(null);
    }
  };

  const getStatusIcon = (status: "online" | "offline" | "stale") => {
    switch (status) {
      case "online":
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        );
      case "stale":
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case "offline":
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusText = (status: "online" | "offline" | "stale") => {
    switch (status) {
      case "online":
        return { text: "Online", class: "text-green-700 bg-green-50" };
      case "stale":
        return { text: "Connecting...", class: "text-yellow-700 bg-yellow-50" };
      case "offline":
        return { text: "Offline", class: "text-gray-700 bg-gray-50" };
    }
  };

  const formatLastSeen = (lastHeartbeat: string | null) => {
    if (!lastHeartbeat) return "Never";

    const lastSeen = new Date(lastHeartbeat);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 30) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-white rounded-xl  border border-gray-100 overflow-hidden">
      {agents.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Terminal className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No agents connected
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Start an agent to connect it to your dashboard. Use the DevFlow CLI
            to register and run agents.
          </p>
          <Link
            href="/help/agents"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Learn how to start an agent
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {agents.map((agent) => {
            const statusInfo = getStatusText(agent.status);
            return (
              <div
                key={agent.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Agent Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(agent.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            {agent.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.class}`}
                          >
                            {statusInfo.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 font-mono">
                          {agent.id}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>
                          Last seen: {formatLastSeen(agent.lastHeartbeat)}
                        </span>
                      </div>
                      <span>•</span>
                      <span>
                        Registered:{" "}
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/tasks?agent=${agent.id}`}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Activity className="w-4 h-4" />
                      View Tasks
                    </Link>
                    {agent.status !== "offline" && (
                      <button
                        onClick={() => handleDisconnect(agent.id, agent.name)}
                        disabled={disconnecting === agent.id}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Power className="w-4 h-4" />
                        {disconnecting === agent.id
                          ? "Disconnecting..."
                          : "Disconnect"}
                      </button>
                    )}
                    {agent.status === "offline" && (
                      <button
                        onClick={() => handleDelete(agent.id, agent.name)}
                        disabled={disconnecting === agent.id}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
