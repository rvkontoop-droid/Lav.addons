import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { Addon } from "@/types/addon"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { randomUUID } from "crypto"
import { createAuditLog } from "@/lib/audit"

export const runtime = "nodejs"

const ALLOWED_CATEGORIES = new Set([
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
])

function rowToAddon(row: any): any {
  return {
    id: row.id,
    name: row.name ?? "",
    description: row.description ?? "",
    category: row.category ?? "",
    downloadUrl: row.download_url ?? "",
    imageUrl: row.image_url ?? "",
    videoUrl: row.video_url ?? "",
    author: {
      discordTag: (row.author_discord_tag ?? row.created_by_username ?? "") || "",
      discordId: (row.author_discord_id ?? row.created_by_user_id ?? "") || "",
    },
    downloads: row.downloads ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    createdByUsername: row.created_by_username ?? "",
    createdByUserId: row.created_by_user_id ?? "",
    createdByUserAvatar: row.created_by_user_avatar ?? "",
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const { data, error } = await supabaseAdmin
      .from("addons")
      .select("*")
      .is("deleted_at", null)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 })
    }

    let addons: any[] = (data || []).map(rowToAddon)

    if (category) {
      addons = addons.filter((a) => a.category === category)
    }

    const search = searchParams.get("search")
    if (search) {
      const s = search.toLowerCase()
      addons = addons.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          (a.description ?? "").toLowerCase().includes(s) ||
          a.tags?.some((t: string) => t.toLowerCase().includes(s)),
      )
    }

    const sortBy = searchParams.get("sortBy") || "newest"
    switch (sortBy) {
      case "oldest":
        addons.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "popular":
        addons.sort((a, b) => b.downloads - a.downloads)
        break
      case "name":
        addons.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        addons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return NextResponse.json(addons)
  } catch {
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

    let addonData: Omit<Addon, "id" | "createdAt" | "downloads" | "updatedAt">
    try {
      addonData = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    if (!addonData.name || !addonData.description || !addonData.category || !addonData.downloadUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!ALLOWED_CATEGORIES.has(addonData.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const id = randomUUID()
    const authorTag = addonData.author?.discordTag ?? session.user.username ?? null
    const authorId = addonData.author?.discordId ?? session.user.id ?? null

    const row = {
      id,
      name: addonData.name,
      description: addonData.description ?? null,
      category: addonData.category,
      download_url: addonData.downloadUrl,
      image_url: addonData.imageUrl ?? null,
      video_url: addonData.videoUrl ?? null,
      author_discord_tag: authorTag,
      author_discord_id: authorId,
      created_by_username: session.user.username,
      created_by_user_id: session.user.id,
      created_by_user_avatar: session.user.avatar,
      downloads: 0,
    }

    const { error: insertError } = await supabaseAdmin.from("addons").insert(row)
    if (insertError) {
      return NextResponse.json({ error: "Failed to upload addon" }, { status: 500 })
    }

    await createAuditLog({
      action: "CREATE",
      entityType: "ADDON",
      entityId: id,
      entityName: addonData.name,
      userId: session.user.id,
      username: session.user.username,
      userAvatar: session.user.avatar,
    })

    const newAddon: any = {
      id,
      name: addonData.name ?? "",
      description: addonData.description ?? "",
      category: addonData.category ?? "",
      downloadUrl: addonData.downloadUrl ?? "",
      imageUrl: addonData.imageUrl ?? "",
      videoUrl: addonData.videoUrl ?? "",
      author: {
        discordTag: authorTag ?? "",
        discordId: authorId ?? "",
      },
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUsername: session.user.username ?? "",
      createdByUserId: session.user.id ?? "",
      createdByUserAvatar: session.user.avatar ?? "",
    }

    return NextResponse.json(newAddon, { status: 201 })
  } catch {
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

    const { data: deleted, error: delError } = await supabaseAdmin
      .from("addons")
      .delete()
      .eq("id", addonId)
      .select("id,name")
      .maybeSingle()

    if (delError) {
      return NextResponse.json({ error: "Failed to delete addon" }, { status: 500 })
    }
    if (!deleted) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 })
    }

    await createAuditLog({
      action: "DELETE",
      entityType: "ADDON",
      entityId: deleted.id,
      entityName: deleted.name,
      userId: session.user.id,
      username: session.user.username,
      userAvatar: session.user.avatar,
    })

    return NextResponse.json({ message: "Addon deleted successfully" })
  } catch {
    return NextResponse.json({ error: "Failed to delete addon" }, { status: 500 })
  }
}
