"use client";

import { ReactNode } from "react";
import ResponsiveDialog, {
  ResponsiveDialogProps,
} from "@/components/ui/aevr/responsive-dialog";

interface SettingsDrawerProps extends Omit<
  ResponsiveDialogProps,
  "openPrompt" | "onOpenPromptChange"
> {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean | undefined) => void;
}

export default function SettingsDrawer({
  trigger,
  title,
  children,
  open,
  onOpenChange,
}: SettingsDrawerProps) {
  return (
    <ResponsiveDialog
      openPrompt={open}
      onOpenPromptChange={onOpenChange} // Compatibility adapter
      title={title}
      trigger={trigger}
    >
      {children}
    </ResponsiveDialog>
  );
}
