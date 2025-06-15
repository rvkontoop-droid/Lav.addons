import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { createAuditLog } from "@/lib/audit"

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data: addons, error } = await supabase
        .from("addons")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      return NextResponse.json(addons || [])
    }

    // Fallback to empty array if Supabase not configured
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching addons:", error)
    return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and has upload role
    if (!session?.user?.isAddonsTeam) {
      return NextResponse.json({ error: "Unauthorized - Addons Team role required" }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.description || !body.category || !body.downloadUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newAddon = {
      id: `addon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      description: body.description,
      category: body.category,
      tags: body.tags || [],
      author: body.author,
      download_url: body.downloadUrl,
      preview_url: body.imageUrl || body.previewUrl,
      video_url: body.videoUrl,
      downloads: 0,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("addons").insert([newAddon]).select().single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Create audit log
      await createAuditLog({
        action: "CREATE",
        entityType: "addon",
        entityId: newAddon.id,
        entityName: newAddon.name,
        username: session.user.username || "Unknown",
        userId: session.user.id,
        changes: { created: newAddon },
      })

      return NextResponse.json(data, { status: 201 })
    } else {
      // Fallback response when Supabase not configured
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload addon" },
      { status: 500 },
    )
  }
}
