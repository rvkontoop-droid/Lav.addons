"use client"

import React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, Info, AlertTriangle, Edit, Video } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Addon } from "@/types/addon"

const categories = [
  "explanation",
  "settings",
  "sound",
  "bloodfx",
  "citizen",
  "mods",
  "skin",
  "killfx",
  "props",
  "reshades",
]

interface EditAddonDialogProps {
  addon: Addon
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditAddonDialog({ addon, isOpen, onClose, onSuccess }: EditAddonDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: addon.name,
    description: addon.description,
    category: addon.category,
    downloadUrl: addon.downloadUrl,
    imageUrl: addon.imageUrl,
    videoUrl: addon.videoUrl || "",
    tags: addon.tags?.join(", ") || "",
  })

  const { useEffect } = React
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: addon.name,
        description: addon.description,
        category: addon.category,
        downloadUrl: addon.downloadUrl,
        imageUrl: addon.imageUrl,
        videoUrl: addon.videoUrl || "",
        tags: addon.tags?.join(", ") || "",
      })
      setUpdateError(null)
    }
  }, [isOpen, addon])

  const getAvatarUrl = (avatar: string, userId: string) => {
    if (!avatar) return "/placeholder.svg"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=64`
  }

  const isValidDiscordVideo = (url: string) => {
    if (!url) return true // Empty is valid (optional field)
    return (
      url.includes("cdn.discordapp.com") &&
      (url.includes(".mp4") || url.includes(".webm") || url.includes(".mov") || url.includes(".avi"))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError(null)

    if (!session?.user?.isAddonsTeam) {
      setUpdateError("You need to be an Addons Team member to edit addons.")
      return
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.downloadUrl.trim()) {
      setUpdateError("Please fill in all required fields.")
      return
    }

    if (formData.videoUrl && !isValidDiscordVideo(formData.videoUrl)) {
      setUpdateError(
        "Video URL must be a Discord CDN link (cdn.discordapp.com) with a video file extension (.mp4, .webm, .mov, .avi)",
      )
      return
    }

    setIsSubmitting(true)

    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        downloadUrl: formData.downloadUrl.trim(),
        imageUrl: formData.imageUrl.trim() || "/placeholder.svg?height=200&width=300",
        videoUrl: formData.videoUrl.trim() || undefined,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        updatedAt: new Date().toISOString().split("T")[0],
      }

      const response = await fetch(`/api/addons/${addon.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Addon "${formData.name}" has been updated.`,
        })
        onClose()
        onSuccess?.()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }
    } catch (error) {
      console.error("Update error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update addon. Please try again."
      setUpdateError(errorMessage)

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Edit className="h-5 w-5" />
            Edit Addon
            {session?.user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={getAvatarUrl(session.user.avatar, session.user.id) || "/placeholder.svg"}
                    alt={session.user.username}
                  />
                  <AvatarFallback className="text-xs">{session.user.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{session.user.username}</span>
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Editing addon: <strong>{addon.name}</strong>
          </AlertDescription>
        </Alert>

        {updateError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{updateError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Addon Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter addon name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your addon..."
              rows={3}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="downloadUrl">Download Link *</Label>
            <Input
              id="downloadUrl"
              type="url"
              value={formData.downloadUrl}
              onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
              placeholder="https://example.com/download/addon.zip"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imageUrl">Preview Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/preview.jpg (optional)"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="videoUrl" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Discord Video URL
              </Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://cdn.discordapp.com/attachments/.../video.mp4"
                disabled={isSubmitting}
                className={formData.videoUrl && !isValidDiscordVideo(formData.videoUrl) ? "border-red-500" : ""}
              />
              {formData.videoUrl && !isValidDiscordVideo(formData.videoUrl) && (
                <p className="text-xs text-red-500 mt-1">Must be a Discord CDN link with video extension</p>
              )}
            </div>
          </div>

          <Alert>
            <Video className="h-4 w-4" />
            <AlertDescription>
              <strong>Video Requirements:</strong> Only Discord CDN links are supported
              <br />
              <code className="bg-black/10 px-1 rounded text-xs">
                https://cdn.discordapp.com/attachments/.../video.mp4
              </code>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="realistic, blood, effects, immersive"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !session?.user?.isAddonsTeam}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Addon
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
