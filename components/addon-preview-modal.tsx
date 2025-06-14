"use client"

import { useState } from "react"
import { Download, Shield, Play, ExternalLink, Tag, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { Addon } from "@/types/addon"

interface AddonPreviewModalProps {
  addon: Addon
  isOpen: boolean
  onClose: () => void
}

export function AddonPreviewModal({ addon, isOpen, onClose }: AddonPreviewModalProps) {
  const [liked, setLiked] = useState(false)

  const categoryColors: Record<string, string> = {
    bloodfx: "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border-red-500/30",
    skin: "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30",
    reshades: "bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30",
    sound: "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border-green-500/30",
    mods: "bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30",
    props: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-yellow-500/30",
    settings: "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30",
    citizen: "bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-400 border-cyan-500/30",
    killfx: "bg-gradient-to-r from-pink-500/20 to-pink-600/20 text-pink-400 border-pink-500/30",
    explanation: "bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 text-indigo-400 border-indigo-500/30",
  }

  const getAvatarUrl = (avatar: string, userId: string) => {
    if (!avatar) return "/placeholder.svg"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=64`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const isDiscordCDNVideo = (url: string) => {
    if (!url) return false
    return url.includes("cdn.discordapp.com") && (url.includes(".mp4") || url.includes(".webm") || url.includes(".mov"))
  }

  const handleDownload = async () => {
    try {
      await fetch(`/api/addons/download?id=${addon.id}`, { method: "POST" })
    } catch (error) {
      // Silent fail
    }
    window.open(addon.downloadUrl, "_blank", "noopener,noreferrer")
  }

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: addon.name,
        text: addon.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const hasVideo = addon.videoUrl && isDiscordCDNVideo(addon.videoUrl)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-4">
            <DialogTitle className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {addon.name}
            </DialogTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={categoryColors[addon.category] || "bg-gray-500/20 text-gray-400"}>
                  ✨ {addon.category.toUpperCase()}
                </Badge>
                {addon.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                    🔥 FEATURED
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleLike} className="hover:bg-red-500/10">
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="hover:bg-blue-500/10">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="px-6 mb-6">
            <div className="relative aspect-video bg-gradient-to-br from-black via-gray-900 to-black rounded-xl overflow-hidden shadow-2xl">
              {hasVideo ? (
                <video
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  poster={addon.imageUrl}
                  style={{ backgroundColor: "#000" }}
                >
                  <source src={addon.videoUrl} type="video/mp4" />
                  <source src={addon.videoUrl} type="video/webm" />
                </video>
              ) : (
                <>
                  <img
                    src={addon.imageUrl || "/placeholder.svg?height=400&width=600"}
                    alt={addon.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        <span className="text-sm font-medium">Preview Available</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 space-y-8">
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">📝 About This Addon</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">{addon.description}</p>
            </div>

            {/* Tags */}
            {addon.tags && addon.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {addon.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 text-sm hover:bg-primary/20 transition-colors"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Creator Spotlight */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">👨‍💻 Creator</h3>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-muted/20">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                  <AvatarImage
                    src={getAvatarUrl(addon.author.discordAvatar, addon.author.discordId) || "/placeholder.svg"}
                    alt={addon.author.discordUsername}
                  />
                  <AvatarFallback className="text-lg font-bold">
                    {addon.author.discordUsername?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{addon.author.discordUsername}</span>
                    <Shield className="w-5 h-5 text-blue-400" />
                    <Badge variant="secondary" className="text-xs">
                      VERIFIED CREATOR
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">Addons Team Member</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20">
                <div className="text-3xl font-bold text-green-400 mb-1">{addon.downloads.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20">
                <div className="text-3xl font-bold text-blue-400 mb-1">{formatDate(addon.createdAt)}</div>
                <div className="text-sm text-muted-foreground">Released</div>
              </div>
            </div>

            {/* Download CTA */}
            <div className="pb-8">
              <Button
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleDownload}
              >
                <Download className="w-6 h-6 mr-3" />
                Download Now - Free
                <ExternalLink className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
