import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAddons, saveAddons, flattenAddons } from "@/lib/storage"
import { createAuditLog } from "@/lib/audit"
import type { Addon } from "@/types/addon"

export async function GET(request: NextRequest) {
  try {
    const categorizedAddons = await getAddons()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let filteredAddons: Addon[] = []

    if (category && categorizedAddons[category]) {
      filteredAddons = [...categorizedAddons[category]]
    } else {
      filteredAddons = flattenAddons(categorizedAddons)
    }

    const search = searchParams.get("search")
    if (search) {
      const searchLower = search.toLowerCase()
      filteredAddons = filteredAddons.filter(
        (addon) =>
          addon.name.toLowerCase().includes(searchLower) ||
          addon.description.toLowerCase().includes(searchLower) ||
          addon.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    const sortBy = searchParams.get("sortBy") || "newest"
    switch (sortBy) {
      case "oldest":
        filteredAddons.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "popular":
        filteredAddons.sort((a, b) => b.downloads - a.downloads)
        break
      case "name":
        filteredAddons.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        filteredAddons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return NextResponse.json(filteredAddons)
  } catch (error) {
    console.error("Failed to fetch addons:", error)
    return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!session.user.isAddonsTeam) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let addonData: Omit<Addon, "id" | "createdAt" | "downloads">
    try {
      const body = await request.text()
      addonData = JSON.parse(body)
    } catch (error) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    if (!addonData.name || !addonData.description || !addonData.category || !addonData.downloadUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const categorizedAddons = await getAddons()

    if (!categorizedAddons.hasOwnProperty(addonData.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const newAddon: Addon = {
      ...addonData,
      id: `${addonData.category}_${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      downloads: 0,
    }

    categorizedAddons[addonData.category].push(newAddon)
    await saveAddons(categorizedAddons)

    // Create audit log
    await createAuditLog({
      action: "CREATE",
      entityType: "ADDON",
      entityId: newAddon.id,
      entityName: newAddon.name,
      userId: session.user.id,
      username: session.user.username,
      userAvatar: session.user.avatar,
    })

    return NextResponse.json(newAddon, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload addon" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!session.user.isAddonsTeam) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const addonId = searchParams.get("id")

    if (!addonId) {
      return NextResponse.json({ error: "Addon ID is required" }, { status: 400 })
    }

    const categorizedAddons = await getAddons()

    let found = false
    let deletedAddon: Addon | null = null

    for (const category in categorizedAddons) {
      const index = categorizedAddons[category].findIndex((addon) => addon.id === addonId)
      if (index !== -1) {
        deletedAddon = categorizedAddons[category][index]
        categorizedAddons[category].splice(index, 1)
        found = true
        break
      }
    }

    if (!found || !deletedAddon) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 })
    }

    await saveAddons(categorizedAddons)

    // Create audit log
    await createAuditLog({
      action: "DELETE",
      entityType: "ADDON",
      entityId: deletedAddon.id,
      entityName: deletedAddon.name,
      userId: session.user.id,
      username: session.user.username,
      userAvatar: session.user.avatar,
    })

    return NextResponse.json({ message: "Addon deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete addon" }, { status: 500 })
  }
}
