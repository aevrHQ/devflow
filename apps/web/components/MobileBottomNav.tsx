"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category, TaskSquare, Cpu, Setting2, Message } from "iconsax-react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: Category,
      isActive: (path: string) => path === "/dashboard",
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: TaskSquare,
      isActive: (path: string) => path.startsWith("/dashboard/tasks"),
    },
    {
      name: "Agents",
      href: "/dashboard/agents",
      icon: Cpu,
      isActive: (path: string) => path.startsWith("/dashboard/agents"),
    },
    {
      name: "Chat",
      href: "/dashboard/chat",
      icon: Message,
      isActive: (path: string) => path.startsWith("/dashboard/chat"),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Setting2,
      isActive: (path: string) => path.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1",
                active ? "text-black" : "text-gray-400 hover:text-gray-600",
              )}
            >
              <item.icon
                variant={active ? "Bulk" : "TwoTone"}
                color="currentColor"
                size={24}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
