"use client"

import { Download, Eye, Calendar, Shield, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { AddonPreviewModal } from "./addon-preview-modal"
import { EditAddonDialog } from "./edit-addon-dialog"
import type { Addon } from "@/types/addon"

interface AddonCardProps {
  addon: Addon
  onDelete?: () => void
}

export function AddonCard({ addon, onDelete }: AddonCardProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const categoryColors: Record<string, string> = {
    bloodfx: "bg-red-500/10 text-red-500 border-red-500/20",
    skin: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    reshades: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    sound: "bg-green-500/10 text-green-500 border-green-500/20",
    mods: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    props: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    settings: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    citizen: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    killfx: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    explanation: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  }

  const getAvatarUrl = (avatar: string, userId: string) => {
    if (!avatar) return "/placeholder.svg"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=64`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/addons?id=${addon.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Addon "${addon.name}" has been deleted.`,
        })
        onDelete?.()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete addon")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete addon",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async () => {
    // Increment download count
    try {
      await fetch(`/api/addons/download?id=${addon.id}`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Failed to track download:", error)
    }

    // Open download link
    window.open(addon.downloadUrl, "_blank", "noopener,noreferrer")
  }

  const handleEditSuccess = () => {
    // Refresh the page to show updated addon
    window.location.reload()
  }

  const isAddonsTeamMember = session?.user?.isAddonsTeam || false

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border-muted">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={addon.imageUrl || "/placeholder.svg?height=200&width=300"}
              alt={addon.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Button variant="secondary" size="sm" onClick={() => setIsPreviewOpen(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
            {addon.featured && <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">Featured</Badge>}

            {/* Debug: Show if user has edit permissions */}
            {isAddonsTeamMember && (
              <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs">
                <Edit className="w-3 h-3 mr-1" />
                Can Edit
              </Badge>
            )}

            {/* Action buttons for Addons Team members */}
            {isAddonsTeamMember && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-black border-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditOpen(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Addon</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{addon.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">{addon.name}</h3>
            <Badge variant="outline" className={categoryColors[addon.category] || "bg-gray-500/10 text-gray-500"}>
              {addon.category}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{addon.description}</p>

          {/* Publisher Info */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-muted/30 rounded-lg">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={getAvatarUrl(addon.author.discordAvatar, addon.author.discordId) || "/placeholder.svg"}
                alt={addon.author.discordUsername}
              />
              <AvatarFallback className="text-xs">{addon.author.discordUsername?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium truncate">{addon.author.discordUsername}</span>
                <Shield className="w-3 h-3 text-blue-500" title="Addons Team Member" />
              </div>
              <span className="text-xs text-muted-foreground">#{addon.author.discordTag.split("#")[1]}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{addon.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(addon.createdAt)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button className="w-full" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </CardFooter>
      </Card>

      {/* Preview Modal */}
      <AddonPreviewModal addon={addon} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />

      {/* Edit Modal */}
      {isAddonsTeamMember && (
        <EditAddonDialog
          addon={addon}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}
