import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const musteriId = searchParams.get('musteriId');

  const rows = await db.tahsilat.findMany({
    where: { userId: s.userId, ...(musteriId ? { musteriId } : {}) },
    orderBy: { createdAt: 'desc' },
    include: {
      musteri: { select: { id: true, ad: true } },
      fatura:  { select: { id: true, faturaNo: true, genelToplam: true } },
    },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { musteriId, faturaId, tutar, tarih, notlar } = await req.json();
  if (!musteriId || !tutar || !tarih) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
  }

  const musteri = await db.musteri.findFirst({ where: { id: musteriId, userId: s.userId } });
  if (!musteri) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Tahsilat oluştur + müşteri bakiyesini azalt (tahsilat = borç ödeme)
  const [row] = await db.$transaction([
    db.tahsilat.create({
      data: {
        userId: s.userId,
        musteriId,
        faturaId: faturaId || null,
        tutar: Number(tutar),
        tarih,
        notlar: notlar ?? '',
      },
      include: {
        musteri: { select: { id: true, ad: true } },
        fatura:  { select: { id: true, faturaNo: true, genelToplam: true } },
      },
    }),
    db.musteri.update({
      where: { id: musteriId },
      data: { bakiye: { decrement: Number(tutar) } },
    }),
  ]);

  // Bağlı fatura varsa "ödendi" işaretle
  if (faturaId) {
    const fatura = await db.fatura.findFirst({ where: { id: faturaId, userId: s.userId } });
    if (fatura && Number(tutar) >= fatura.genelToplam) {
      await db.fatura.update({ where: { id: faturaId }, data: { durum: 'odendi' } });
    }
  }

  return NextResponse.json(row, { status: 201 });
}
