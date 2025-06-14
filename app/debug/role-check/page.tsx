"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Copy, CheckCircle, XCircle, AlertTriangle, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RoleDebugInfo {
  user: {
    id: string
    username: string
    discriminator: string
    hasUploadRole: boolean
    isAddonsTeam: boolean
  }
  environment: {
    DISCORD_BOT_TOKEN: boolean
    DISCORD_GUILD_ID: boolean
    DISCORD_UPLOAD_ROLE_ID: boolean
    DISCORD_GUILD_ID_VALUE: string
    DISCORD_UPLOAD_ROLE_ID_VALUE: string
  }
  userRoles: string[]
  roleCheckError: string | null
  requiredRoleId: string
  hasRequiredRole: boolean
  botPermissions?: string
}

export default function RoleCheckPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [debugInfo, setDebugInfo] = useState<RoleDebugInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "lav09191878") {
      setIsAuthenticated(true)
      setPasswordError("")
    } else {
      setPasswordError("Incorrect password")
    }
  }

  const fetchDebugInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug/role-check")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Failed to fetch debug info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session && isAuthenticated) {
      fetchDebugInfo()
    }
  }, [session, isAuthenticated])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Information copied to clipboard",
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl">Protected Area</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? "border-red-500" : ""}
                />
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
              <Button type="submit" className="w-full">
                Access Debug Page
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to check your role status.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Addons Team Role Check</h1>
          <p className="text-muted-foreground">Debug why the + New button isn't showing</p>
        </div>
        <Button onClick={fetchDebugInfo} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p>Checking your role status...</p>
          </CardContent>
        </Card>
      ) : debugInfo ? (
        <div className="grid gap-6">
          {/* Quick Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Quick Status
                {debugInfo.user.isAddonsTeam ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Addons Team Member
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Addons Team
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.user.isAddonsTeam ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ You should see the + New button on category pages!</p>
                  <p className="text-green-600 text-sm mt-1">
                    If you don't see it, try refreshing the page or clearing your browser cache.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">❌ You don't have the Addons Team role</p>
                  <p className="text-red-600 text-sm mt-1">
                    Contact a server admin to get the role ID: 1383315641632555018
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Discord Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Username:</strong> {debugInfo.user.username}#{debugInfo.user.discriminator}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Discord ID:</strong>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(debugInfo.user.id)}
                    className="h-6 px-2 text-xs"
                  >
                    {debugInfo.user.id} <Copy className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Check */}
          <Card>
            <CardHeader>
              <CardTitle>Server Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <strong>Bot Token:</strong>
                  {debugInfo.environment.DISCORD_BOT_TOKEN ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Set
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <strong>Guild ID:</strong>
                  {debugInfo.environment.DISCORD_GUILD_ID ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-500">
                        Set
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(debugInfo.environment.DISCORD_GUILD_ID_VALUE)}
                        className="h-6 px-2 text-xs"
                      >
                        {debugInfo.environment.DISCORD_GUILD_ID_VALUE}
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <strong>Required Role ID:</strong>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">1383315641632555018</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("1383315641632555018")}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Discord Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {debugInfo.roleCheckError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Role Check Failed
                  </div>
                  <p className="text-red-600 text-sm">{debugInfo.roleCheckError}</p>
                  <div className="mt-3 text-xs text-red-500">
                    <p>Possible issues:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Bot is not in the Discord server</li>
                      <li>Bot doesn't have permission to read member roles</li>
                      <li>Wrong Guild ID configured</li>
                      <li>Bot token is invalid</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <strong>Has Required Role:</strong>
                    {debugInfo.hasRequiredRole ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        No
                      </Badge>
                    )}
                  </div>

                  <div>
                    <strong className="block mb-2">All Your Roles:</strong>
                    <div className="flex flex-wrap gap-2">
                      {debugInfo.userRoles.length > 0 ? (
                        debugInfo.userRoles.map((roleId) => (
                          <Badge
                            key={roleId}
                            variant={roleId === "1383315641632555018" ? "default" : "secondary"}
                            className={roleId === "1383315641632555018" ? "bg-green-500" : ""}
                          >
                            {roleId}
                            {roleId === "1383315641632555018" && " ✅ MATCH!"}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No roles found or unable to fetch roles</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">
                    If you should have the role but don't see the button:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Make sure you have the role "1383315641632555018" in the Discord server</li>
                    <li>Try logging out and logging back in</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Check if the bot has proper permissions in the Discord server</li>
                  </ol>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800 mb-2">For server admins:</p>
                  <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                    <li>
                      Ensure the bot is in the server with "Read Message History" and "View Server Insights" permissions
                    </li>
                    <li>Verify the DISCORD_GUILD_ID matches your server ID</li>
                    <li>Confirm the DISCORD_BOT_TOKEN is valid and active</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p>Failed to load role information.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
