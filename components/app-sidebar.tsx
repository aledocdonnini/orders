"use client";

import * as React from "react";
import {
  NotebookText,
  ListOrdered,
  ClipboardPlus,
  CalendarDays,
  GalleryVerticalEnd,
} from "lucide-react";
import { useParams } from "next/navigation";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import CustomIcon from "./CustomIcon";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { id } = useParams();
  const eventId = Number(id);
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
        url: "./menu",
        icon: NotebookText,
      },
      {
        name: "Creazione ordini",
        url: "./create-orders",
        icon: ClipboardPlus,
      },
      {
        name: "Ordini effettuati",
        url: "./orders",
        icon: ListOrdered,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <a href="/" className="flex gap-3 items-center">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-foreground p-1">
              <CustomIcon fileName="logo" classes="size-6 bg-background" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-lg uppercase">
                Orders
              </span>
            </div>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="divide-y">
        {id && <NavProjects projects={data.projects} />}
        <NavMain items={data.navMain} />
      </SidebarContent>
      {props.user && (
        <SidebarFooter>
          <NavUser
            user={{
              name: props.user?.email?.split("@")[0],
              email: props.user.email,
              avatar: "/default-avatar.png",
            }}
          />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
