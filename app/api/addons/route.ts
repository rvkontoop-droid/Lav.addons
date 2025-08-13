import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-admin" // استيراد كلاينت السيرفر
import { createAuditLog } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "newest"

    let query = supabaseAdmin.from("addons").select("*")

    if (category) query = query.eq("category", category)
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "popular":
        query = query.order("downloads", { ascending: false })
        break
      case "name":
        query = query.order("name", { ascending: true })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
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

    const body = await request.json()

    if (!body.name || !body.description || !body.category || !body.downloadUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const id = `${body.category}_${Date.now()}`
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from("addons")
      .insert([{
        id,
        name: body.name,
        description: body.description,
        category: body.category,
        download_url: body.downloadUrl,
        image_url: body.imageUrl || null,
        video_url: body.videoUrl || null,
        author_discord_tag: body.authorDiscordTag,
        author_discord_id: body.authorDiscordId,
        downloads: 0,
        created_at: now,
        updated_at: now
      }])
      .select("*")
      .single()

    if (error) throw error

    await createAuditLog({
      action: "CREATE",
      entityType: "ADDON",
      entityId: id,
      entityName: body.name,
      userId: session.user.id,
      username: session.user.username,
      userAvatar: session.user.avatar,
    })

    return NextResponse.json(data, { status: 201 })
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

    const { data: deletedData, error } = await supabaseAdmin
      .from("addons")
      .delete()
      .eq("id", addonId)
      .select("*")
      .single()

    if (error) throw error

    await createAuditLog({
      action: "DELETE",
      entityType: "ADDON",
      entityId: deletedData.id,
      entityName: deletedData.name,
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
