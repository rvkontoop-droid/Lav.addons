import type { AuditLog, CreateAuditLogData } from "@/types/audit"
import { supabase, isSupabaseConfigured } from "./supabase"

// In-memory storage fallback
let auditLogsCache: AuditLog[] = []

export async function createAuditLog(data: CreateAuditLogData): Promise<void> {
  const auditLog: AuditLog = {
    id: crypto.randomUUID(),
    ...data,
    timestamp: new Date().toISOString(),
  }

  // Try Supabase first if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from("audit_logs").insert([auditLog])

      if (!error) return
      console.error("Supabase error, falling back to memory storage:", error)
    } catch (error) {
      console.error("Supabase error, falling back to memory storage:", error)
    }
  }

  // Fallback to in-memory storage
  auditLogsCache.push(auditLog)

  // Keep only last 1000 entries in memory
  if (auditLogsCache.length > 1000) {
    auditLogsCache = auditLogsCache.slice(-1000)
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  // Try Supabase first if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (error) throw error
      return logs || []
    } catch (error) {
      console.error("Supabase error, falling back to memory storage:", error)
    }
  }

  // Fallback to in-memory storage
  return [...auditLogsCache].reverse()
}

export function compareObjects(oldObj: any, newObj: any): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {}

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

  for (const key of allKeys) {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = {
        old: oldObj[key],
        new: newObj[key],
      }
    }
  }

  return changes
}
