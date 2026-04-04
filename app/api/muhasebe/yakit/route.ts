import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const aracId = searchParams.get('aracId');

  const rows = await db.yakitKaydi.findMany({
    where: { userId: s.userId, ...(aracId ? { aracId } : {}) },
    orderBy: { tarih: 'desc' },
    include: { arac: { select: { id: true, plaka: true, marka: true, model: true } } },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { aracId, tarih, litre, birimFiyat, kmSayaci, istasyon, notlar } = await req.json();
  if (!aracId || !tarih || !litre || !birimFiyat) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
  }

  // araç bu kullanıcıya ait mi?
  const arac = await db.arac.findFirst({ where: { id: aracId, userId: s.userId } });
  if (!arac) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const litreSayi = Number(litre);
  const fiyat = Number(birimFiyat);
  const row = await db.yakitKaydi.create({
    data: {
      userId: s.userId,
      aracId,
      tarih,
      litre: litreSayi,
      birimFiyat: fiyat,
      toplamTutar: litreSayi * fiyat,
      kmSayaci: Number(kmSayaci) || 0,
      istasyon: istasyon ?? '',
      notlar: notlar ?? '',
    },
    include: { arac: { select: { id: true, plaka: true, marka: true, model: true } } },
  });
  return NextResponse.json(row, { status: 201 });
}
