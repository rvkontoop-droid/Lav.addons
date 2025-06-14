import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ŁAF | لـاَف - FiveM Addons Hub",
  description: "Your ultimate FiveM addons collection - ŁAF | لـاَف",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <SidebarProvider defaultOpen={true}>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1 p-6">{children}</main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
