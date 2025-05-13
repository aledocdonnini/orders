"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  toggleSidebar,
  pathname,
}: {
  toggleSidebar: any;
  pathname: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
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

  console.log("getLastPathSegment(pathname)", getLastPathSegment(pathname));
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Gestione</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActiveLink = getLastPathSegment(pathname) === "protected";

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`flex px-4 py-2 rounded hover:bg-muted transition-colors ${isActiveLink && "bg-muted font-bold"}`}
                onClick={() => handleCloseSidebar()}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className="!size-6" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
