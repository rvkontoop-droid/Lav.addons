"use client"

import { Search, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"

export function Header() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  const isLoading = status === "loading"
  const isLoggedIn = !!session

  const getAvatarUrl = (avatar: string, userId: string) => {
    if (!avatar) return "/placeholder.svg"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=128`
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />

      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search addons..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={getAvatarUrl(session.user.avatar, session.user.id) || "/placeholder.svg"}
                      alt={session.user.username}
                    />
                    <AvatarFallback>{session.user.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="flex items-center justify-start gap-3 p-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={getAvatarUrl(session.user.avatar, session.user.id) || "/placeholder.svg"}
                      alt={session.user.username}
                    />
                    <AvatarFallback>{session.user.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{session.user.username}</p>
                    <p className="text-xs text-muted-foreground">#0</p>
                    {session.user.isAddonsTeam && (
                      <Badge variant="secondary" className="text-xs w-fit">
                        <Shield className="w-3 h-3 mr-1" />
                        Addons Team
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
}
