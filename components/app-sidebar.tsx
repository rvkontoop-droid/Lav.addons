import type * as React from "react"
import {
  Settings,
  Volume2,
  Droplets,
  Users,
  Wrench,
  Shirt,
  Zap,
  Palette,
  FileText,
  Home,
  Package,
  Shield,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation items matching Discord categories
const navItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Explanation",
    url: "/category/explanation",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/category/settings",
    icon: Settings,
  },
  {
    title: "Sound",
    url: "/category/sound",
    icon: Volume2,
  },
  {
    title: "Bloodfx",
    url: "/category/bloodfx",
    icon: Droplets,
  },
  {
    title: "Citizen",
    url: "/category/citizen",
    icon: Users,
  },
  {
    title: "Mods",
    url: "/category/mods",
    icon: Wrench,
  },
  {
    title: "Skin",
    url: "/category/skin",
    icon: Shirt,
  },
  {
    title: "Killfx",
    url: "/category/killfx",
    icon: Zap,
  },
  {
    title: "Props",
    url: "/category/props",
    icon: Package,
  },
  {
    title: "Reshades",
    url: "/category/reshades",
    icon: Palette,
  },
]

const adminItems = [
  {
    title: "Audit Log",
    url: "/audit",
    icon: Shield,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl overflow-hidden">
            <img
              src="/images/server-avatar.jpg"
              alt="✨ ɓℓσσ∂ყ ℓσѵε ✨ Server Avatar"
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              ŁAF | لـاَف
            </span>
            <span className="truncate text-xs text-muted-foreground">Best Community Server !</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        }
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
