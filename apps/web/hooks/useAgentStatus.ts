"use client";

import { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  lastHeartbeat: string | null;
  createdAt: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  status: "online" | "offline" | "stale";
  lastHeartbeat: string;
  isOnline: boolean;
  createdAt: string;
}

export function useAgentStatus(initialAgents: Agent[]): AgentStatus[] {
  const [agents, setAgents] = useState<AgentStatus[]>(
    initialAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      lastHeartbeat: agent.lastHeartbeat || "",
      createdAt: agent.createdAt,
      ...calculateAgentStatus(agent),
    })),
  );

  // Poll for status updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((current) =>
        current.map((agent) => ({
          ...agent,
          ...calculateAgentStatus({
            id: agent.id,
            name: agent.name,
            lastHeartbeat: agent.lastHeartbeat,
            createdAt: agent.createdAt,
          }),
        })),
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return agents;
}

function calculateAgentStatus(
  agent: Agent,
): Pick<AgentStatus, "status" | "isOnline"> {
  if (!agent.lastHeartbeat) {
    return { status: "offline", isOnline: false };
  }

  const lastSeen = new Date(agent.lastHeartbeat);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffSec = diffMs / 1000;

  if (diffSec < 30) {
    return { status: "online", isOnline: true };
  } else if (diffSec < 300) {
    // 5 minutes
    return { status: "stale", isOnline: false };
  } else {
    return { status: "offline", isOnline: false };
  }
}
