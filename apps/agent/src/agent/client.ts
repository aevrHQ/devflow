import axios, { AxiosInstance } from "axios";

export interface CommandRequest {
  commandId: string;
  taskId: string;
  intent: string;
  description?: string;
  repo?: string;
  branch?: string;
  sessionId?: string;
  createdAt?: string;
  credentials?: {
    github?: string;
  };
}

export interface ProgressUpdate {
  taskId: string;
  status: "in_progress" | "completed" | "failed";
  step: string;
  progress: number;
  details?: string;
}

export interface TaskCompletion {
  success: boolean;
  output?: string;
  prUrl?: string;
  error?: string;
}

export class PlatformClient {
  private client: AxiosInstance;
  private agentId: string;

  constructor(platformUrl: string, agentId: string, apiKey: string) {
    this.agentId = agentId;
    this.client = axios.create({
      baseURL: platformUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
  }

  setToken(token: string): void {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  async register(): Promise<{
    success: boolean;
    agent: { id: string; name: string; status: string };
    token?: string;
    expiresAt?: string;
  }> {
    const response = await this.client.post("/api/agents", {
      agentId: this.agentId,
      userId: "", // Will be set by platform from token
      name: "agent", // Will be updated by platform
      version: "0.1.0",
      platform: process.platform,
      workingDirectory: process.cwd(),
      capabilities: ["fix-bug", "feature", "explain", "review-pr"],
    });
    return response.data;
  }

  async getCommands(): Promise<CommandRequest[]> {
    const response = await this.client.get(
      `/api/agents/${this.agentId}/commands`,
    );
    return response.data.commands || [];
  }

  async heartbeat(meta?: { cwd?: string; capabilities?: string[] }): Promise<{
    success: boolean;
    lastHeartbeat: string;
    status?: string;
  }> {
    const response = await this.client.post(
      `/api/agents/${this.agentId}/heartbeat`,
      meta,
    );
    return response.data;
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.post(`/api/agents/${this.agentId}/heartbeat`, {
        status: "disconnected",
      });
    } catch (e) {
      // Ignore errors during shutdown
    }
  }

  async reportProgress(
    taskId: string,
    update: ProgressUpdate,
  ): Promise<{ success: boolean }> {
    const response = await this.client.post(`/api/tasks/${taskId}/progress`, {
      ...update,
      reported_at: new Date().toISOString(),
    });
    return response.data;
  }

  async completeTask(
    taskId: string,
    completion: TaskCompletion,
  ): Promise<{ success: boolean }> {
    const response = await this.client.post(`/api/tasks/${taskId}/complete`, {
      ...completion,
      completed_at: new Date().toISOString(),
    });
    return response.data;
  }
}
