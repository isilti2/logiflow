import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 400 });

  const hashed = await hashPassword(newPassword);
  await db.user.update({ where: { id: session.userId }, data: { password: hashed } });

  return NextResponse.json({ ok: true });
}
