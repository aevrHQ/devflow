"use client";

import { useState } from "react";
import { Loader2, Square } from "lucide-react";
import { useRouter } from "next/navigation";

interface StopTaskButtonProps {
  taskId: string;
  status: string;
}

export default function StopTaskButton({
  taskId,
  status,
}: StopTaskButtonProps) {
  const [isStopping, setIsStopping] = useState(false);
  const router = useRouter();

  const handleStop = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to stop this task? The agent will be notified to cancel execution.",
    );

    if (!confirmed) return;

    setIsStopping(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/terminate`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Failed to stop task: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to stop task:", error);
      alert("An error occurred while stopping the task.");
    } finally {
      setIsStopping(false);
    }
  };

  if (!["pending", "in_progress"].includes(status)) {
    return null;
  }

  return (
    <button
      onClick={handleStop}
      disabled={isStopping}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-background border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isStopping ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Square className="w-4 h-4 fill-current" />
      )}
      {isStopping ? "Stopping..." : "Stop Task"}
    </button>
  );
}
