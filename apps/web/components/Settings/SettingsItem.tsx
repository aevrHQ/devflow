"use client";

import { ArrowRight2 } from "iconsax-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/aevr/button";

interface SettingsItemProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function SettingsItem({
  icon,
  label,
  onClick,
  className,
}: SettingsItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 h-auto rounded-none",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-900">{icon}</div>
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <ArrowRight2 size={16} className="text-gray-400" />
    </Button>
  );
}
