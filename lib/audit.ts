import type { AuditLog } from "@/types/audit"

// In-memory audit log storage (in production, use a database)
let auditLogs: AuditLog[] = []

export async function createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const auditEntry: AuditLog = {
    ...log,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  auditLogs.unshift(auditEntry) // Add to beginning

  // Keep only last 1000 entries to prevent memory issues
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(0, 1000)
  }

  console.log(`🔍 AUDIT LOG: ${log.action} ${log.entityType} "${log.entityName}" by ${log.username}`)
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  return auditLogs.slice(0, limit)
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
