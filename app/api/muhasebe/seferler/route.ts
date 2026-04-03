import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.sefer.findMany({
    where: { userId: s.userId },
    orderBy: { createdAt: 'desc' },
    include: { musteri: { select: { id: true, ad: true } } },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { musteriId, aracPlaka, rotaDan, rotaAya, mesafeKm, tarih, yukAgirligi, seferUcreti, yakitMaliyeti, notlar, durum } = await req.json();
  if (!aracPlaka?.trim() || !rotaDan?.trim() || !rotaAya?.trim() || !tarih) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
  }

  const row = await db.sefer.create({
    data: {
      userId: s.userId,
      musteriId: musteriId || null,
      aracPlaka,
      rotaDan,
      rotaAya,
      mesafeKm: Number(mesafeKm) || 0,
      tarih,
      yukAgirligi: Number(yukAgirligi) || 0,
      seferUcreti: Number(seferUcreti) || 0,
      yakitMaliyeti: Number(yakitMaliyeti) || 0,
      notlar: notlar ?? '',
      durum: durum ?? 'planlandi',
    },
    include: { musteri: { select: { id: true, ad: true } } },
  });
  return NextResponse.json(row, { status: 201 });
}
