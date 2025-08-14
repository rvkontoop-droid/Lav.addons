import type { AuditLog } from "@/types/audit"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const auditEntry: AuditLog = {
    ...log,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  await supabaseAdmin.from("audit_logs").insert({
    id: auditEntry.id,
    timestamp: auditEntry.timestamp,
    username: auditEntry.username,
    action: auditEntry.action,
    entityType: auditEntry.entityType,
    entityName: auditEntry.entityName,
    details: (auditEntry as any).changes ?? null,
  })
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const { data } = await supabaseAdmin
    .from("audit_logs")
    .select("id,timestamp,username,action,entityType,entityName,details")
    .order("timestamp", { ascending: false })
    .limit(limit)

  return (data ?? []).map((r: any) => ({
    id: r.id,
    timestamp: r.timestamp,
    username: r.username,
    action: r.action,
    entityType: r.entityType,
    entityName: r.entityName,
    changes: r.details ?? undefined,
  }))
}

export function compareObjects(oldObj: any, newObj: any): { field: string; oldValue: any; newValue: any }[] {
  const changes: { field: string; oldValue: any; newValue: any }[] = []
  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])
  for (const key of allKeys) {
    if (key === "id" || key === "createdAt" || key === "downloads") continue
    const oldValue = oldObj?.[key]
    const newValue = newObj?.[key]
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({ field: key, oldValue, newValue })
    }
  }
  return changes
}
