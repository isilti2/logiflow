import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.maliIslem.findMany({
    where: { userId: s.userId },
    orderBy: { tarih: 'desc' },
    include: {
      sefer: { select: { id: true, rotaDan: true, rotaAya: true } },
      musteri: { select: { id: true, ad: true } },
    },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { seferId, musteriId, tur, kategori, tutar, kdvOrani, aciklama, tarih } = await req.json();
  if (!tur || !kategori || !tutar || !tarih) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
  }

  const row = await db.maliIslem.create({
    data: {
      userId: s.userId,
      seferId: seferId || null,
      musteriId: musteriId || null,
      tur,
      kategori,
      tutar: Number(tutar),
      kdvOrani: Number(kdvOrani) || 0,
      aciklama: aciklama ?? '',
      tarih,
    },
    include: {
      sefer: { select: { id: true, rotaDan: true, rotaAya: true } },
      musteri: { select: { id: true, ad: true } },
    },
  });
  return NextResponse.json(row, { status: 201 });
}
