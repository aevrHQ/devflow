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
        <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">
          {title}
        </h3>
      )}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {children}
      </div>
    </div>
  );
}
