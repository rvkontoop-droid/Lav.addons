import { supabase } from "./supabase"
import type { AuditLog } from "@/types/audit"

export async function createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const auditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action: log.action,
    entity_type: log.entityType,
    entity_id: log.entityId,
    entity_name: log.entityName,
    username: log.username,
    user_id: log.userId,
    changes: log.changes,
  }

  const { error } = await supabase.from("audit_logs").insert(auditEntry)

  if (error) {
    console.error("Error creating audit log:", error)
  } else {
    console.log(`🔍 AUDIT LOG: ${log.action} ${log.entityType} "${log.entityName}" by ${log.username}`)
  }
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching audit logs:", error)
    return []
  }

  return (
    logs?.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      entityName: log.entity_name,
      username: log.username,
      userId: log.user_id,
      changes: log.changes,
      timestamp: log.timestamp,
    })) || []
  )
}

export function compareObjects(oldObj: any, newObj: any): { field: string; oldValue: any; newValue: any }[] {
  const changes: { field: string; oldValue: any; newValue: any }[] = []

  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])

  for (const key of allKeys) {
    if (key === "id" || key === "createdAt" || key === "downloads") continue // Skip system fields

    const oldValue = oldObj?.[key]
    const newValue = newObj?.[key]

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue,
      })
    }
  }

  return changes
}
