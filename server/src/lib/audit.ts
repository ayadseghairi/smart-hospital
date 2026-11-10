// server/src/lib/audit.ts
import { prisma } from "./prisma"

interface AuditParams {
  userId?: string
  action: string
  entity?: string
  entityId?: string
  ip?: string
}

export async function audit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({ data: params })
  } catch {
    // Audit failures must not break request handling
  }
}
