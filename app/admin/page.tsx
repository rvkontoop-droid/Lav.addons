"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

export default function AdminPage() {
  const [addons, setAddons] = useState<Addon[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    downloadUrl: "",
    imageUrl: "",
    videoUrl: "",
    authorDiscordTag: "",
    authorDiscordId: "",
  })

  useEffect(() => {
    fetchAddons()
  }, [])

  const fetchAddons = async () => {
    try {
      const response = await fetch("/api/addons")
      const data = await response.json()
      setAddons(data)
    } catch (error) {
      console.error("Failed to fetch addons:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const addonData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      downloadUrl: formData.downloadUrl,
      imageUrl: formData.imageUrl || "/placeholder.svg?height=200&width=300",
      videoUrl: formData.videoUrl,
      author: {
        discordTag: formData.authorDiscordTag,
        discordId: formData.authorDiscordId,
      },
    }

    try {
      const response = await fetch("/api/addons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addonData),
      })

      if (response.ok) {
        await fetchAddons()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to create addon:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      downloadUrl: "",
      imageUrl: "",
      videoUrl: "",
      authorDiscordTag: "",
      authorDiscordId: "",
    })
    setEditingAddon(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your FiveM addons</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Addon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAddon ? "Edit Addon" : "Add New Addon"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="downloadUrl">Download URL</Label>
                  <Input
                    id="downloadUrl"
                    type="url"
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Optional - will use placeholder if empty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorDiscordTag">Author Discord Tag</Label>
                  <Input
                    id="authorDiscordTag"
                    value={formData.authorDiscordTag}
                    onChange={(e) => setFormData({ ...formData, authorDiscordTag: e.target.value })}
                    placeholder="Username#1234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="authorDiscordId">Author Discord ID</Label>
                  <Input
                    id="authorDiscordId"
                    value={formData.authorDiscordId}
                    onChange={(e) => setFormData({ ...formData, authorDiscordId: e.target.value })}
                    placeholder="123456789"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingAddon ? "Update" : "Create"} Addon</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {addons.map((addon) => (
          <Card key={addon.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{addon.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">{addon.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Author</p>
                  <p className="font-medium">{addon.author.discordTag}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Downloads</p>
                  <p className="font-medium">{addon.downloads.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{addon.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
