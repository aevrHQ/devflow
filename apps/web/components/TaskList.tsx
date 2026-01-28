"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  GitBranch,
  Terminal,
  ChevronRight,
  Trash2,
} from "lucide-react";
import Loader from "@/components/ui/aevr/loader";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  _id: string;
  taskId: string;
  intent: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  repo?: string;
  agentId: string;
  createdAt: string;
}

interface TaskListProps {
  initialTasks: Task[];
  agentMap: Map<string, string>;
}

export default function TaskList({ initialTasks, agentMap }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");

  // Toggle individual task selection
  const toggleTask = useCallback((taskId: string) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  // Toggle all tasks selection
  const toggleAll = useCallback(() => {
    const filtered = tasks.filter((task) => {
      if (filter === "all") return true;
      return task.status === filter;
    });
    if (selectedTasks.size === filtered.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filtered.map((t) => t.taskId)));
    }
  }, [selectedTasks.size, tasks, filter]);

  // Bulk delete handler
  const handleBulkDelete = useCallback(async () => {
    if (selectedTasks.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedTasks.size} task(s)? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/tasks/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds: Array.from(selectedTasks) }),
      });

      if (response.ok) {
        // Remove deleted tasks from local state
        setTasks((prev) =>
          prev.filter((task) => !selectedTasks.has(task.taskId)),
        );
        setSelectedTasks(new Set());
      } else {
        alert("Failed to delete tasks. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete tasks:", error);
      alert("An error occurred while deleting tasks.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedTasks]);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Sort by status: failed > in_progress > pending > completed > cancelled
    const statusOrder: Record<Task["status"], number> = {
      failed: 0,
      in_progress: 1,
      pending: 2,
      completed: 3,
      cancelled: 4,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "in_progress":
        return (
          <Loader loading className="w-5 h-5 text-blue-500 animate-spin" />
        );
      case "pending":
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadgeClass = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "in_progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
        return "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Bulk actions */}
          {selectedTasks.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? (
                <>
                  <Loader loading className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedTasks.size} task
                  {selectedTasks.size > 1 ? "s" : ""}
                </>
              )}
            </button>
          )}

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "status")}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          {selectedTasks.size > 0
            ? `${selectedTasks.size} selected`
            : `${sortedTasks.length} task${sortedTasks.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              {filter === "all"
                ? 'Ask your agent to do something via Telegram or Slack (e.g., "Ask my agent to fix the bug...").'
                : `Try changing the filter to see other tasks.`}
            </p>
            {filter === "all" && (
              <Link
                href="/help/agents"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline"
              >
                Learn how to run tasks
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Header with select all */}
            <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-3">
              <Checkbox
                checked={
                  selectedTasks.size === sortedTasks.length &&
                  sortedTasks.length > 0
                }
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-medium text-foreground">
                {selectedTasks.size === sortedTasks.length &&
                sortedTasks.length > 0
                  ? "Deselect all"
                  : "Select all"}
              </span>
            </div>

            {/* Task rows */}
            <div className="divide-y divide-border">
              {sortedTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedTasks.has(task.taskId)}
                    onCheckedChange={() => toggleTask(task.taskId)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Task content - clickable link */}
                  <Link
                    href={`/dashboard/tasks/${task.taskId}`}
                    className="flex-1 flex items-start justify-between gap-4 group min-w-0"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-1">{getStatusIcon(task.status)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground truncate">
                            {task.intent || "Unknown Task"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(
                              task.status,
                            )}`}
                          >
                            {task.status}
                          </span>
                          {task.repo && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 border border-border px-1.5 py-0.5 rounded-sm">
                              <GitBranch className="w-3 h-3" />
                              {task.repo}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>
                            Agent:{" "}
                            {agentMap.get(task.agentId) ||
                              task.agentId.substring(0, 8)}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(task.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0 mt-2" />
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
