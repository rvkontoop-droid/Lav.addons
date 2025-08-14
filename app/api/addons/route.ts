// app/api/addons/route.ts
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createAuditLog } from "@/lib/audit";

type Row = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  download_url: string;
  image_url: string | null;
  video_url: string | null;
  author_discord_tag: string | null;
  author_discord_id: string | null;
  downloads: number | null;
  created_at: string | null;
  updated_at: string | null;
};

function toAddon(row: Row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category: row.category,
    downloadUrl: row.download_url,
    imageUrl: row.image_url ?? "/placeholder.svg?height=200&width=300",
    videoUrl: row.video_url ?? null,
    author: {
      discordTag: row.author_discord_tag ?? "",
      discordId: row.author_discord_id ?? "",
    },
    downloads: row.downloads ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";

    let query = supabaseAdmin.from("addons").select("*");
    if (category) query = query.eq("category", category);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "popular":
        query = query.order("downloads", { ascending: false });
        break;
      case "name":
        query = query.order("name", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data ?? []).map(toAddon);
    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!session.user.isAddonsTeam) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    if (!body.name || !body.description || !body.category || !body.downloadUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `${body.category}_${Date.now()}`;
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("addons")
      .insert([
        {
          id,
          name: body.name,
          description: body.description ?? "",
          category: body.category,
          download_url: body.downloadUrl,
          image_url: body.imageUrl ?? null,
          video_url: body.videoUrl ?? null,
          author_discord_tag: body.author?.discordTag ?? body.authorDiscordTag ?? "",
          author_discord_id: body.author?.discordId ?? body.authorDiscordId ?? "",
          downloads: 0,
          created_at: now,
          updated_at: now,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    await createAuditLog({
      action: "CREATE",
      entityType: "ADDON",
      entityId: (data as Row).id,
      entityName: (data as Row).name,
      username: session.user.username,
      userId: session.user.id,
      userAvatar: session.user.avatar,
    });

    return NextResponse.json(toAddon(data as Row), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload addon" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!session.user.isAddonsTeam) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const addonId = searchParams.get("id");
    if (!addonId) return NextResponse.json({ error: "Addon ID is required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("addons")
      .delete()
      .eq("id", addonId)
      .select("*")
      .single();

    if (error) throw error;

    await createAuditLog({
      action: "DELETE",
      entityType: "ADDON",
      entityId: (data as Row).id,
      entityName: (data as Row).name,
      username: session.user.username,
      userId: session.user.id,
      userAvatar: session.user.avatar,
    });

    return NextResponse.json({ message: "Addon deleted successfully", id: (data as Row)?.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete addon" }, { status: 500 });
  }
}
