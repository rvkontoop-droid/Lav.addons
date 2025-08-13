import type { AuditLog } from "@/types/audit"
import { supabaseAdmin } from "@/lib/supabase-admin"

let auditLogs: AuditLog[] = []

export async function createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const auditEntry: AuditLog = {
    ...log,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  // تخزين الذاكرة (يبقى شغال زي أول)
  auditLogs.unshift(auditEntry)
  if (auditLogs.length > 1000) auditLogs = auditLogs.slice(0, 1000)

  // محاولة حفظ في Supabase (بدون كسر الموقع لو فشل)
  try {
    const { error } = await supabaseAdmin
      .from("audit_logs")
      .insert([{
        id: auditEntry.id,
        timestamp: auditEntry.timestamp,
        action: auditEntry.action,
        entityType: (auditEntry as any).entityType,
        entityName: (auditEntry as any).entityName,
        entityId: (auditEntry as any).entityId ?? null,
        username: (auditEntry as any).username,
        userId: (auditEntry as any).userId ?? null,
        userAvatar: (auditEntry as any).userAvatar ?? null,
        changes: (auditEntry as any).changes ?? null,
      }])

    if (error) {
      console.error("AUDIT DB insert failed:", error)
    }
  } catch (e) {
    console.error("AUDIT DB insert threw:", e)
  }

  console.log(`🔍 AUDIT LOG: ${log.action} ${log.entityType} "${log.entityName}" by ${log.username}`)
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  return auditLogs.slice(0, limit)
}

export function compareObjects(oldObj: any, newObj: any) {
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
