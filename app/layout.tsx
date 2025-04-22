import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomIcon from "@/components/CustomIcon";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Orders",
  description: "The fastest way to take orders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <nav className="w-full border-b border-b-foreground/10 h-16">
              <div className="container  flex justify-between items-center p-3 px-5 text-sm ">
                <div className="flex gap-5 items-center font-semibold">
                  <Link href={"/"}>
                    <div className="bg-foreground p-1">
                      <CustomIcon
                        fileName="logo"
                        classes="bg-background size-8"
                      />
                    </div>
                  </Link>
                </div>
                <div className="ml-auto flex gap-x-3 items-center">
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  <ThemeSwitcher />
                </div>
              </div>
            </nav>
            <div className="container mt-10 p-5">{children}</div>
            <ToastContainer position="top-right" autoClose={3000} />

            <footer className="mt-auto w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8">
              <p>
                Powered by{" "}
                <a
                  href="https://alessandrodonnini.dev"
                  target="_blank"
                  className="font-bold hover:underline"
                  rel="noreferrer"
                >
                  AD.D
                </a>
              </p>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
