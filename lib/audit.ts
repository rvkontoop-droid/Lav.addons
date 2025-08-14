import type { AuditLog } from "@/types/audit"
import { createClient } from "@supabase/supabase-js"

// أنشئ عميل Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // أو key لها صلاحيات insert/select
)

// إضافة لوق جديد
export async function createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const auditEntry: AuditLog = {
    ...log,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("audit_logs") // اسم الجدول في Supabase
    .insert(auditEntry)

  if (error) {
    console.error("❌ فشل حفظ الـ Audit Log:", error)
  } else {
    console.log(`🔍 AUDIT LOG: ${log.action} ${log.entityType} "${log.entityName}" by ${log.username}`)
  }
}

// جلب اللوقات
export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("❌ فشل جلب الـ Audit Logs:", error)
    return []
  }

  return data || []
}

// مقارنة البيانات
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
