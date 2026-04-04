import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { seferId, lat, lng, accuracy, hiz, baslik, notlar } = await req.json();
  if (!lat || !lng) return NextResponse.json({ error: 'lat/lng zorunlu' }, { status: 400 });

  const row = await db.konumKaydi.create({
    data: {
      userId: s.userId,
      seferId: seferId || null,
      lat: Number(lat),
      lng: Number(lng),
      accuracy: Number(accuracy) || 0,
      hiz: Number(hiz) || 0,
      baslik: baslik != null ? Number(baslik) : null,
      notlar: notlar ?? '',
    },
  });
  return NextResponse.json(row, { status: 201 });
}

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const seferId = searchParams.get('seferId');
  const userId  = searchParams.get('userId');
  const son     = searchParams.get('son'); // "1" = sadece son nokta

  // userId parametresi dışarıdan geçilse bile sadece kendi kaydına izin ver (IDOR koruması)
  const filterUserId = s.userId;

  if (son === '1') {
    const row = await db.konumKaydi.findFirst({
      where: {
        userId: filterUserId,
        ...(seferId ? { seferId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { sefer: { select: { rotaDan: true, rotaAya: true, aracPlaka: true } } },
    });
    return NextResponse.json(row);
  }

  const rows = await db.konumKaydi.findMany({
    where: {
      userId: filterUserId,
      ...(seferId ? { seferId } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: 500,
  });
  return NextResponse.json(rows);
}
