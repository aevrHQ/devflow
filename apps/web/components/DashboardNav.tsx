"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex gap-6 text-sm font-medium">
      <Link
        href="/dashboard"
        className={`px-4 py-2 rounded-xl transition-colors ${
          pathname === "/dashboard"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        Overview
      </Link>
      <Link
        href="/dashboard/tasks"
        className={`px-4 py-2 rounded-xl transition-colors ${
          pathname === "/dashboard/tasks" ||
          pathname?.startsWith("/dashboard/tasks/")
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        Tasks
      </Link>
      <Link
        href="/dashboard/agents"
        className={`px-4 py-2 rounded-xl transition-colors ${
          pathname === "/dashboard/agents"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        Agents
      </Link>
      <Link
        href="/dashboard/chat"
        className={`px-4 py-2 rounded-xl transition-colors ${
          pathname === "/dashboard/chat"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        Chat
      </Link>
      <Link
        href="/dashboard/settings"
        className={`px-4 py-2 rounded-xl transition-colors ${
          pathname === "/dashboard/settings"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        Settings
      </Link>
    </nav>
  );
}
