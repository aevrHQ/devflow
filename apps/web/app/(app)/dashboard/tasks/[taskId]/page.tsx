import { getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import TaskAssignment from "@/models/TaskAssignment";
import Agent from "@/models/Agent";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitBranch, Terminal } from "lucide-react";

import DeleteTaskButton from "@/components/DeleteTaskButton";
import StopTaskButton from "@/components/StopTaskButton";

export const dynamic = "force-dynamic";

interface TaskDetailsPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function TaskDetailsPage({
  params,
}: TaskDetailsPageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { taskId } = await params;

  await connectToDatabase();

  const task = await TaskAssignment.findOne({
    taskId,
  });

  // Security check: ensure task belongs to a user-owned agent or directly to user
  if (!task || task.userId !== user.userId) {
    return notFound();
  }

  const agent = await Agent.findOne({ agentId: task.agentId });

  // Check for offline agent on in_progress tasks
  let isOffline = false;
  if (
    task.status === "in_progress" &&
    agent &&
    new Date().getTime() - new Date(agent.lastHeartbeat).getTime() >
      5 * 60 * 1000 // 5 minutes
  ) {
    isOffline = true;

    // Auto-fail task
    task.status = "failed";
    task.result = {
      success: false,
      output: task.result?.output,
      prUrl: task.result?.prUrl,
      error: "Agent went offline unexpectedly (heartbeat timeout)",
    };
    task.completedAt = new Date();
    await task.save();
  }

  // Fetch sessions
  const { default: Session } = await import("@/models/Session");
  const sessions = await Session.find({ taskId }).sort({ createdAt: -1 });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard/tasks"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Link>
          <div className="flex items-center gap-2">
            <StopTaskButton taskId={taskId} status={task.status} />
            <DeleteTaskButton taskId={taskId} />
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              {task.intent}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    task.status === "completed"
                      ? "bg-green-500"
                      : task.status === "failed"
                        ? "bg-red-500"
                        : task.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-gray-400 dark:bg-neutral-500"
                  }`}
                />
                <span className="capitalize">
                  {task.status.replace("_", " ")}
                </span>
              </div>
              <span>•</span>
              <span>ID: {task.taskId}</span>
              <span>•</span>
              <span>{new Date(task.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {task.result?.prUrl && (
            <a
              href={task.result.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <GitBranch className="w-4 h-4" />
              View Pull Request
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Request</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {task.description || task.intent}
            </div>

            {task.repo && (
              <div className="mt-4 items-center gap-2 text-sm bg-muted/50 p-2 rounded-md border border-border inline-flex">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-mono">{task.repo}</span>
                {task.branch && (
                  <span className="text-muted-foreground">/</span>
                )}
                {task.branch && (
                  <span className="text-muted-foreground font-mono">
                    {task.branch}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Sessions */}
          {sessions.length > 0 && (
            <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Sessions</h2>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground">
                          Session {session.sessionId.substring(0, 8)}...
                        </p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded uppercase font-medium ${
                            session.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Last active:{" "}
                        {new Date(session.lastActiveAt).toLocaleString()}
                      </p>
                    </div>
                    {/* Placeholder for Restart Session button - future implementation */}
                    {/* <button className="text-xs text-blue-600 hover:underline">Restart</button> */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output / Result */}
          {(task.result?.output || task.result?.error) && (
            <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden">
              <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between">
                <h3 className="text-gray-200 text-sm font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Execution Output
                </h3>
              </div>
              <div className="p-4 bg-black text-gray-300 font-mono text-xs md:text-sm overflow-x-auto whitespace-pre-wrap max-h-[500px]">
                {task.result.error ? (
                  <span className="text-red-400">
                    Error: {task.result.error}
                  </span>
                ) : (
                  task.result.output || "No output captured."
                )}
              </div>
            </div>
          )}

          {/* Execution Logs */}
          <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                Live Execution Logs
              </h3>
            </div>
            <div className="p-0 bg-neutral-950 font-mono text-xs max-h-[300px] overflow-y-auto">
              {task.logs && task.logs.length > 0 ? (
                <table className="w-full text-left">
                  <tbody>
                    {task.logs.map((log, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="px-4 py-1 text-gray-500 w-32 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td
                          className={`px-4 py-1 flex-1 break-all ${
                            log.level === "error"
                              ? "text-red-400"
                              : log.level === "warn"
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        >
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-gray-500 italic text-center">
                  No logs available yet...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Agent Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Assigned Agent
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {(agent?.name || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {agent?.name || "Unknown Agent"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {task.agentId.substring(0, 8)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Platform
                </label>
                <div className="text-sm text-foreground font-mono border border-border bg-muted/50 px-2 py-1 rounded inline-block">
                  {agent?.platform || "unknown"}
                </div>
              </div>

              {isOffline && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs border border-red-200 dark:border-red-900/30 mt-2">
                  <strong>Agent Offline</strong>
                  <p>Agent hasn&apos;t reported in for &gt; 5 minutes.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Timeline
            </h3>
            <div className="space-y-4 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
              <div className="relative pl-6">
                <div className="absolute left-0 top-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-background" />
                <p className="text-sm font-medium text-foreground">
                  Task Created
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(task.createdAt).toLocaleString()}
                </p>
              </div>

              {task.startedAt && (
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-3.5 h-3.5 bg-yellow-500 rounded-full border-2 border-background" />
                  <p className="text-sm font-medium text-foreground">
                    Execution Started
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(task.startedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {task.completedAt && (
                <div className="relative pl-6">
                  <div
                    className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-background ${task.status === "completed" ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <p className="text-sm font-medium text-foreground">
                    {task.status === "completed" ? "Completed" : "Failed"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(task.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
