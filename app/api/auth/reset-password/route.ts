import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || typeof token !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Şifre en az 8 karakter olmalıdır.' }, { status: 400 });
  }

  const record = await db.passwordResetToken.findUnique({ where: { token } });

  if (!record) {
    return NextResponse.json({ error: 'Link geçersiz veya süresi dolmuş.' }, { status: 400 });
  }
  if (record.expiresAt < new Date()) {
    await db.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ error: 'Link süresi dolmuş. Yeni bir talep oluşturun.' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  await db.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await db.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ ok: true });
}
