// lib/audit.ts
import { supabaseAdmin } from "@/lib/supabase-admin"
import { randomUUID } from "crypto"
import type { AuditLog } from "@/types/audit"

export async function createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    action: log.action,
    entity_type: log.entityType,
    entity_name: log.entityName,
    entity_id: log.entityId ?? null,
    username: log.username,
    user_id: log.userId ?? null,
    user_avatar: log.userAvatar ?? null,
    changes: log.changes ?? null,
  })
  if (error) throw error
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map((row: any) => ({
    id: row.id,
    timestamp: row.timestamp,
    action: row.action,
    entityType: row.entity_type,
    entityName: row.entity_name,
    entityId: row.entity_id ?? undefined,
    username: row.username,
    userId: row.user_id ?? undefined,
    userAvatar: row.user_avatar ?? undefined,
    changes: row.changes ?? undefined,
  }))
}

export function compareObjects(oldObj: any, newObj: any) {
  const diff: { field: string; oldValue: any; newValue: any }[] = []
  const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])
  for (const k of keys) {
    if (k === "id" || k === "createdAt" || k === "downloads") continue
    const oldValue = oldObj?.[k]
    const newValue = newObj?.[k]
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff.push({ field: k, oldValue, newValue })
    }
  }
  return diff
}
