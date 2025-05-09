"use client";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "@/components/ui/toaster";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import CustomIcon from "@/components/CustomIcon";
import EventTitle from "@/components/EventTitle";

export default function Template({
  user,
  children,
}: Readonly<{
  user: any;
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {user && (
        <AppSidebar
          user={{
            name: user?.email?.split("@")[0],
            email: user?.email,
            avatar: "/default-avatar.png",
          }}
        />
      )}
      <main className="w-full min-h-screen flex flex-col items-center">
        <nav className="w-full border-b border-b-foreground/10 h-16">
          <div className="flex justify-between items-center p-3 px-5 text-sm gap-x-3">
            {user && <SidebarTrigger />}
            {!user && (
              <div className="flex aspect-square rounded-sm bg-foreground p-1 mr-1">
                <CustomIcon fileName="logo" classes="size-8 bg-background" />
              </div>
            )}
            {user && <AppBreadcrumb />}
            <div className="ml-auto">
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <div className="w-full p-5">
          {user && <EventTitle />}
          {children}
        </div>
        <Toaster />
      </main>
    </SidebarProvider>
  );
}
