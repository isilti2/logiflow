'use server';

import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, destroySession } from '@/lib/session';
import { writeAuditLog } from '@/lib/auditLog';
import { redirect } from 'next/navigation';

export async function loginAction(email: string, password: string, ip?: string): Promise<string | null> {
  const normalEmail = email.toLowerCase().trim();
  const user = await db.user.findUnique({ where: { email: normalEmail } });
  if (!user) {
    await writeAuditLog({ userEmail: normalEmail, action: 'Başarısız giriş denemesi', module: 'Auth', ip, type: 'error' });
    return 'E-posta veya şifre hatalı.';
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    await writeAuditLog({ userId: user.id, userEmail: user.email, action: 'Başarısız giriş denemesi', module: 'Auth', ip, type: 'error' });
    return 'E-posta veya şifre hatalı.';
  }

  await createSession({ userId: user.id, email: user.email, role: user.role });
  await writeAuditLog({ userId: user.id, userEmail: user.email, action: 'Kullanıcı giriş yaptı', module: 'Auth', ip, type: 'success' });
  return null;
}

export async function registerAction(
  email: string,
  password: string,
  name: string
): Promise<string | null> {
  const normalEmail = email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email: normalEmail } });
  if (existing) return 'Bu e-posta adresi zaten kullanılıyor.';

  const hashed = await hashPassword(password);
  const ADMIN_EMAILS = ['admin@logiflow.io'];
  const role = ADMIN_EMAILS.includes(normalEmail) ? 'admin' : 'user';

  const user = await db.user.create({
    data: { email: normalEmail, password: hashed, name: name.trim(), role },
  });

  // Seed starter depot areas
  await db.depotArea.createMany({
    data: [
      { userId: user.id, name: 'Depo 1', location: '', capacity: 50 },
    ],
  });

  await createSession({ userId: user.id, email: user.email, role: user.role });
  await writeAuditLog({ userId: user.id, userEmail: user.email, action: 'Yeni kullanıcı kaydı', module: 'Auth', type: 'success' });
  return null;
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}
