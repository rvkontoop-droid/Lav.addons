import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { Addon } from "@/types/addon"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createAuditLog, compareObjects } from "@/lib/audit"

export const runtime = "nodejs"

function rowToAddon(row: any): Addon {
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
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin.from("addons").select("*").eq("id", params.id).maybeSingle()
    if (error) return NextResponse.json({ error: "Failed to fetch addon" }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(rowToAddon(data))
  } catch {
    return NextResponse.json({ error: "Failed to fetch addon" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!session.user.isAddonsTeam) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    let body: Partial<Addon>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const { data: before, error: e1 } = await supabaseAdmin.from("addons").select("*").eq("id", params.id).maybeSingle()
    if (e1) return NextResponse.json({ error: "Failed to load addon" }, { status: 500 })
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const patch: any = {}
    if (body.name !== undefined) patch.name = body.name
    if (body.description !== undefined) patch.description = body.description ?? null
    if (body.category !== undefined) patch.category = body.category
    if (body.downloadUrl !== undefined) patch.download_url = body.downloadUrl
    if (body.imageUrl !== undefined) patch.image_url = body.imageUrl ?? null
    if (body.videoUrl !== undefined) patch.video_url = body.videoUrl ?? null
    if (body.author?.discordTag !== undefined) patch.author_discord_tag = body.author.discordTag ?? null
    if (body.author?.discordId !== undefined) patch.author_discord_id = body.author.discordId ?? null
    if (body.downloads !== undefined) patch.downloads = body.downloads

    const { data: after, error: e2 } = await supabaseAdmin
      .from("addons")
      .update(patch)
      .eq("id", params.id)
      .select("*")
      .maybeSingle()

    if (e2) return NextResponse.json({ error: "Failed to update addon" }, { status: 500 })
    if (!after) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const changes = compareObjects(rowToAddon(before), rowToAddon(after))
    if (changes.length) {
      await createAuditLog({
        action: "UPDATE",
        entityType: "ADDON",
        entityId: params.id,
        entityName: after.name ?? params.id,
        username: session.user.username,
        userId: session.user.id,
        userAvatar: session.user.avatar,
        changes,
      })
    }

    return NextResponse.json(rowToAddon(after))
  } catch {
    return NextResponse.json({ error: "Failed to update addon" }, { status: 500 })
  }
}
