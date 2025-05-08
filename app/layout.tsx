import { ThemeSwitcher } from "@/components/theme-switcher";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "next-themes";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "@/components/ui/toaster";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import CustomIcon from "@/components/CustomIcon";
import EventTitle from "@/components/EventTitle";

import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Orders",
  description: "The fastest way to take orders",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
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
                    <div className="flex aspect-square rounded-md bg-foreground p-1 mr-1">
                      <CustomIcon
                        fileName="logo"
                        classes="size-6 bg-background"
                      />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
