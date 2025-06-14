"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Copy, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DebugInfo {
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
}

export default function DebugPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDebugInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug/user-info")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Failed to fetch debug info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchDebugInfo()
    }
  }, [session])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Information copied to clipboard",
    })
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to view debug information.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug Information</h1>
        <Button onClick={fetchDebugInfo} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p>Loading debug information...</p>
          </CardContent>
        </Card>
      ) : debugInfo ? (
        <div className="grid gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Username:</strong> {debugInfo.user.username}#{debugInfo.user.discriminator}
                </div>
                <div>
                  <strong>Discord ID:</strong>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(debugInfo.user.id)}
                    className="ml-2 h-6 px-2"
                  >
                    {debugInfo.user.id} <Copy className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <strong>Has Upload Role:</strong>
                  {debugInfo.user.hasUploadRole ? (
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
                <div className="flex items-center gap-2">
                  <strong>Is Addons Team:</strong>
                  {debugInfo.user.isAddonsTeam ? (
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
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-2">
                {Object.entries(debugInfo.environment).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <strong>{key}:</strong>
                    {typeof value === "boolean" ? (
                      value ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Set
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Missing
                        </Badge>
                      )
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(value)} className="h-6 px-2">
                        {value} <Copy className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {debugInfo.roleCheckError ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <strong className="text-destructive">Role Check Error:</strong>
                  <p className="text-sm mt-1">{debugInfo.roleCheckError}</p>
                </div>
              ) : (
                <>
                  <div>
                    <strong>Required Role ID:</strong>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(debugInfo.requiredRoleId)}
                      className="ml-2 h-6 px-2"
                    >
                      {debugInfo.requiredRoleId} <Copy className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <strong>Your Roles:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {debugInfo.userRoles.map((roleId) => (
                        <Badge
                          key={roleId}
                          variant={roleId === debugInfo.requiredRoleId ? "default" : "secondary"}
                          className={roleId === debugInfo.requiredRoleId ? "bg-green-500" : ""}
                        >
                          {roleId}
                          {roleId === debugInfo.requiredRoleId && " (MATCH!)"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p>Failed to load debug information.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
