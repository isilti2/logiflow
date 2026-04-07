import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * POST /api/auth/refresh
 * Access token süresi dolduğunda istemci bu endpoint'i çağırır.
 * getSession() zaten refresh token fallback mantığını içeriyor —
 * bu route sadece yeni access token'ın cookie'ye yazılmasını tetikler.
 */
export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Refresh token geçersiz veya süresi dolmuş.' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, userId: session.userId });
}
