"use client";

import * as React from "react";
import { useState } from "react";
import {
  NotebookText,
  ListOrdered,
  ClipboardPlus,
  CalendarDays,
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import Logo from "@/components/Logo";
import CustomIcon from "./CustomIcon";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AppSidebar({ user }: React.ComponentProps<typeof Sidebar>) {
  const { id } = useParams();
  const eventId = Number(id);
  const prefix = eventId ? "./" : `${eventId}/`;

  const { state, open, setOpen, toggleSidebar } = useSidebar();
  const data = {
    navMain: [
      {
        title: "Eventi",
        url: "/",
        icon: CalendarDays,
      },
    ],
    projects: [
      {
        name: "Gestione portate",
        url: prefix + "menu",
        icon: NotebookText,
      },
      {
        name: "Creazione ordini",
        url: prefix + "create-orders",
        icon: ClipboardPlus,
      },
      {
        name: "Ordini effettuati",
        url: prefix + "orders",
        icon: ListOrdered,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" user={user}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Logo isMobile={false} />
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {id && (
          <>
            <NavProjects
              projects={data.projects}
              toggleSidebar={toggleSidebar}
            />
            <Separator className="my-4" />
          </>
        )}
        <NavMain items={data.navMain} />
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <NavUser
            user={{
              name: user?.email?.split("@")[0],
              email: user.email,
              avatar: "/default-avatar.png",
            }}
          />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
