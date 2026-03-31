import { NextRequest, NextResponse } from 'next/server';
import { loginAction } from '@/app/actions/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { email, password } = await req.json();

  const key = `login:${ip}:${(email ?? '').toLowerCase()}`;
  const limit = checkRateLimit(key);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Çok fazla deneme. ${limit.retryAfterSeconds} saniye bekleyin.` },
      { status: 429 }
    );
  }

  const error = await loginAction(email, password);
  if (error) return NextResponse.json({ error }, { status: 401 });

  resetRateLimit(key); // başarılı girişte sıfırla
  return NextResponse.json({ ok: true });
}
