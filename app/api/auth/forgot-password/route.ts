import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'E-posta gerekli.' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ ok: true });

  // Invalidate old tokens for this user
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const origin = req.headers.get('origin') ?? 'https://logiflow.vercel.app';
  const resetUrl = `${origin}/reset-password/${token}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  return NextResponse.json({ ok: true });
}
