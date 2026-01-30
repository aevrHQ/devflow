"use client";

import * as React from "react";
import { Home2, TaskSquare, Setting2, Message, Cpu } from "iconsax-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./TeamSwitcher";

// Using Iconsax icons
const navItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home2,
  },
  {
    title: "Tasks",
    url: "/dashboard/tasks",
    icon: TaskSquare,
  },
  {
    title: "Agents",
    url: "/dashboard/agents", // Replaced Robot with Cpu (or check logic below)
    icon: Cpu,
  },
  {
    title: "Chat",
    url: "/dashboard/chat",
    icon: Message,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Setting2,
  },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string };
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: "Devflow",
              plan: "Basic",
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Link href={item.url}>
                      <item.icon
                        variant={isActive ? "Bulk" : "TwoTone"}
                        color="currentColor"
                        size={24}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
