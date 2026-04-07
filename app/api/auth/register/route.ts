import { NextRequest, NextResponse } from 'next/server';
import { registerAction } from '@/app/actions/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { email, password, name } = await req.json();

  // IP bazlı brute-force koruması (10 deneme / 15 dk)
  const key = `register:${ip}`;
  const limit = checkRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Çok fazla kayıt denemesi. ${limit.retryAfterSeconds} saniye bekleyin.` },
      { status: 429 },
    );
  }

  const error = await registerAction(email, password, name ?? '');
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
