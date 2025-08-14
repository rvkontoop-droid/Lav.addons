import fs from "fs"
import path from "path"
import type { AuditLog } from "@/types/audit"

const LOG_FILE_PATH = path.join(process.cwd(), "audit-logs.json")

// Load logs from file if exists
let auditLogs: AuditLog[] = []
if (fs.existsSync(LOG_FILE_PATH)) {
  try {
    auditLogs = JSON.parse(fs.readFileSync(LOG_FILE_PATH, "utf8"))
  } catch {
    auditLogs = []
  }
}

function saveLogsToFile() {
  fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(auditLogs, null, 2), "utf8")
}

export async function createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const auditEntry: AuditLog = {
    ...log,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  auditLogs.unshift(auditEntry)

  // Keep only last 1000 entries
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(0, 1000)
  }

  saveLogsToFile()

  console.log(`🔍 AUDIT LOG: ${log.action} ${log.entityType} "${log.entityName}" by ${log.username}`)
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  return auditLogs.slice(0, limit)
}

export function compareObjects(oldObj: any, newObj: any): { field: string; oldValue: any; newValue: any }[] {
  const changes: { field: string; oldValue: any; newValue: any }[] = []

  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])

  for (const key of allKeys) {
    if (key === "id" || key === "createdAt" || key === "downloads") continue

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
