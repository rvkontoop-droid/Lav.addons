export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createAuditLog, compareObjects } from "@/lib/audit";

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
  deleted_at?: string | null;
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

// GET /api/addons/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin
      .from("addons")
      .select("*")
      .eq("id", params.id)
      .is("deleted_at", null)
      .single();

    if (error && error.code !== "PGRST116") throw error; // not found code
    if (!data) return NextResponse.json({ error: "Addon not found" }, { status: 404 });

    return NextResponse.json(toAddon(data as Row));
  } catch {
    return NextResponse.json({ error: "Failed to fetch addon" }, { status: 500 });
  }
}

// PATCH /api/addons/[id]  (تعديل)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!session.user.isAddonsTeam) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const id = params.id;
    const body = await req.json();

    // جيب النسخة القديمة للمقارنة
    const { data: oldRow, error: selErr } = await supabaseAdmin
      .from("addons")
      .select("*")
      .eq("id", id)
      .single();

    if (selErr && selErr.code !== "PGRST116") throw selErr;
    if (!oldRow) return NextResponse.json({ error: "Addon not found" }, { status: 404 });

    // حضّر حقول التحديث (حوّل camelCase → snake_case)
    const patch: Partial<Row> = {
      name: body.name,
      description: body.description,
      category: body.category,
      download_url: body.downloadUrl,
      image_url: body.imageUrl,
      video_url: body.videoUrl,
      author_discord_tag: body.author?.discordTag ?? body.authorDiscordTag,
      author_discord_id: body.author?.discordId ?? body.authorDiscordId,
      updated_at: new Date().toISOString(),
    };

    // احذف المفاتيح غير المرسلة (لا تحدّثها)
    Object.keys(patch).forEach((k) => {
      const key = k as keyof Row;
      if (patch[key] === undefined) delete patch[key];
    });

    const { data, error } = await supabaseAdmin
      .from("addons")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    // سجّل اللوق مع تفاصيل التغييرات
    try {
      const oldForCompare = toAddon(oldRow as Row);
      const newForCompare = toAddon(data as Row);
      const changes = compareObjects(oldForCompare, newForCompare);

      await createAuditLog({
        action: "UPDATE",
        entityType: "ADDON",
        entityId: id,
        entityName: newForCompare.name,
        username: session.user.username,
        userId: session.user.id,
        userAvatar: session.user.avatar,
        // نرسل التغييرات إذا ودك تحفظها في details/changes حسب تنفيذك
        changes,
      });
    } catch {}

    return NextResponse.json(toAddon(data as Row));
  } catch {
    return NextResponse.json({ error: "Failed to update addon" }, { status: 500 });
  }
}
