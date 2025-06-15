export interface AuditLog {
  id: string
  action: "CREATE" | "UPDATE" | "DELETE"
  entityType: "addon"
  entityId: string
  entityName: string
  username: string
  userId: string
  changes: Record<string, any>
  timestamp: string
}

export type CreateAuditLogData = Omit<AuditLog, "id" | "timestamp">
