import { ReactNode } from "react";

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
}

export default function SettingsSection({
  title,
  children,
}: SettingsSectionProps) {
  return (
    <div className="mb-6">
      {title && (
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
          {title}
        </h3>
      )}
      <div className="bg-card text-card-foreground rounded-2xl overflow-hidden border border-border">
        {children}
      </div>
    </div>
  );
}
