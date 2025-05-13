"use client";

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
  toggleSidebar,
  pathname,
}: {
  toggleSidebar: any;
  pathname: string;
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { isMobile } = useSidebar();

  function handleCloseSidebar() {
    if (isMobile) {
      toggleSidebar();
    }
  }

  function getLastPathSegment(url: string): string {
    const segments = url.trim().split("/");
    return segments.filter(Boolean).pop() || "";
  }
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:icon">
      <SidebarGroupLabel>Evento</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActiveLink =
            getLastPathSegment(pathname) === getLastPathSegment(item.url);

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                className={`flex px-4 py-2 rounded hover:bg-muted transition-colors ${isActiveLink && "bg-muted font-bold"}`}
                onClick={() => handleCloseSidebar()}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className="!size-6" />}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
