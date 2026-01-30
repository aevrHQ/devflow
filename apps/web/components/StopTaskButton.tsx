"use client";

import { useState } from "react";
import { Refresh, Stop } from "iconsax-react";
import { useRouter } from "next/navigation";
import ResponsiveDialog from "./ui/aevr/responsive-dialog";
import { Button } from "./ui/aevr/button";

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
    setIsStopping(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/terminate`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        console.error(`Failed to stop task: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to stop task:", error);
    } finally {
      setIsStopping(false);
    }
  };

  if (!["pending", "in_progress"].includes(status)) {
    return null;
  }

  return (
    <ResponsiveDialog
      title="Stop Task?"
      description="Are you sure you want to stop this task? The agent will be notified to cancel execution."
      trigger={
        <button
          disabled={isStopping}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-background border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isStopping ? (
            <Refresh
              className="w-4 h-4 animate-spin"
              variant="TwoTone"
              color="currentColor"
            />
          ) : (
            <Stop
              className="w-4 h-4 fill-current"
              variant="Bulk"
              color="currentColor"
            />
          )}
          {isStopping ? "Stopping..." : "Stop Task"}
        </button>
      }
    >
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="danger" onClick={handleStop} disabled={isStopping}>
          Confirm Stop
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
