"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex gap-6 text-sm font-medium">
      <Link
        href="/dashboard"
        className={`px-4 py-2 rounded-lg transition-colors ${
          pathname === "/dashboard"
            ? "bg-gray-900 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Overview
      </Link>
      <Link
        href="/dashboard/tasks"
        className={`px-4 py-2 rounded-lg transition-colors ${
          pathname === "/dashboard/tasks" ||
          pathname?.startsWith("/dashboard/tasks/")
            ? "bg-gray-900 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Tasks
      </Link>
      <Link
        href="/dashboard/agents"
        className={`px-4 py-2 rounded-lg transition-colors ${
          pathname === "/dashboard/agents"
            ? "bg-gray-900 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Agents
      </Link>
      <Link
        href="/dashboard/chat"
        className={`px-4 py-2 rounded-lg transition-colors ${
          pathname === "/dashboard/chat"
            ? "bg-gray-900 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Chat
      </Link>
      <Link
        href="/dashboard/settings"
        className={`px-4 py-2 rounded-lg transition-colors ${
          pathname === "/dashboard/settings"
            ? "bg-gray-900 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Settings
      </Link>
    </nav>
  );
}
