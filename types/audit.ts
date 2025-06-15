export interface AuditLog {
  id: string
  action: "CREATE" | "UPDATE" | "DELETE"
  entityType: "ADDON"
  entityId: string
  entityName: string
  userId: string
  username: string
  userAvatar: string
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  timestamp: string
  ipAddress?: string
  userAgent?: string
}
