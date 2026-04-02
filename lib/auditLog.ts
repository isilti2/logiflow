import { db } from '@/lib/db';

export async function writeAuditLog(params: {
  userId?: string;
  userEmail?: string;
  action: string;
  module: string;
  ip?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        module: params.module,
        ip: params.ip,
        type: params.type ?? 'info',
      },
    });
  } catch {
    // audit log failures must never break main flow
  }
}
