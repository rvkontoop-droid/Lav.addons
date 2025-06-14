"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus, Edit, Trash2, Eye, Shield } from "lucide-react"
import type { AuditLog } from "@/types/audit"

export default function AuditPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/audit")
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.isAddonsTeam) {
      fetchLogs()
    }
  }, [session])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Plus className="w-4 h-4 text-green-500" />
      case "UPDATE":
        return <Edit className="w-4 h-4 text-blue-500" />
      case "DELETE":
        return <Trash2 className="w-4 h-4 text-red-500" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "UPDATE":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "DELETE":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAvatarUrl = (avatar: string, userId: string) => {
    if (!avatar) return "/placeholder.svg"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=64`
  }

  if (!session?.user?.isAddonsTeam) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">You need Addons Team permissions to view audit logs.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔍 Audit Log</h1>
          <p className="text-muted-foreground">Track all addon changes and activities</p>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <Eye className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No Activity Yet</h3>
              <p className="text-sm">Audit logs will appear here when addons are created, updated, or deleted.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={getAvatarUrl(log.userAvatar, log.userId) || "/placeholder.svg"}
                        alt={log.username}
                      />
                      <AvatarFallback>{log.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getActionIcon(log.action)}
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="font-medium">{log.username}</span>
                      <span className="text-muted-foreground text-sm">{log.action.toLowerCase()}d addon</span>
                      <span className="font-medium">"{log.entityName}"</span>
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">{formatTimestamp(log.timestamp)}</div>

                    {log.changes && log.changes.length > 0 && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm font-medium mb-2">Changes:</div>
                        <div className="space-y-1">
                          {log.changes.map((change, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">{change.field}:</span>
                              <span className="text-red-500 line-through ml-1">
                                {typeof change.oldValue === "object"
                                  ? JSON.stringify(change.oldValue)
                                  : String(change.oldValue || "empty")}
                              </span>
                              <span className="mx-1">→</span>
                              <span className="text-green-500">
                                {typeof change.newValue === "object"
                                  ? JSON.stringify(change.newValue)
                                  : String(change.newValue || "empty")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
