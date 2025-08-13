import type { AuditLog } from "@/types/audit"

// ✅ يبقى التخزين في الذاكرة شغال زي ما هو
let auditLogs: AuditLog[] = []

// 👇 نحمّل supabaseAdmin فقط عند الحاجة (عشان ما نكسر شي)
const auditToDb = process.env.AUDIT_TO_DB === "true"
const loadAdmin = async () =>
  auditToDb ? (await import("@/lib/supabase-admin")).supabaseAdmin : null

export async function createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const auditEntry: AuditLog = {
    ...log,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  // الذاكرة: نفس السلوك الحالي
  auditLogs.unshift(auditEntry)
  if (auditLogs.length > 1000) auditLogs = auditLogs.slice(0, 1000)

  // اختياري: ارسال نسخة للـ DB بدون ما يوقف الموقع لو فشل
  if (auditToDb) {
    try {
      const supabaseAdmin = await loadAdmin()
      if (supabaseAdmin) {
        await supabaseAdmin.from("audit_logs").insert([auditEntry])
      }
    } catch (e) {
      console.error("AUDIT DB insert failed:", e)
    }
  }

  console.log(`🔍 AUDIT LOG: ${log.action} ${log.entityType} "${log.entityName}" by ${log.username}`)
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  // نرجع من الذاكرة زي ما هو الآن
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
