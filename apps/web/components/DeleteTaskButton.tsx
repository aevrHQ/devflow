"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "iconsax-react";
import Loader from "./ui/aevr/loader";
import ResponsiveDialog from "./ui/aevr/responsive-dialog";
import { Button } from "./ui/aevr/button";

interface DeleteTaskButtonProps {
  taskId: string;
}

export default function DeleteTaskButton({ taskId }: DeleteTaskButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      router.push("/dashboard/tasks");
      router.refresh();
    } catch (error) {
      console.error("Error deleting task:", error);
      setIsDeleting(false);
    }
  };

  return (
    <ResponsiveDialog
      title="Delete Task?"
      description="Are you sure you want to delete this task?"
      trigger={
        <button
          disabled={isDeleting}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors ${
            isDeleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isDeleting ? (
            <Loader loading className="w-4 h-4 " />
          ) : (
            <Trash className="w-4 h-4" variant="TwoTone" color="currentColor" />
          )}
          Delete Task
        </button>
      }
    >
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
          Confirm Delete
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
