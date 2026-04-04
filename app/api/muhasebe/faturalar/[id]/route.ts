import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const fatura = await db.fatura.findFirst({ where: { id, userId: s.userId } });
  if (!fatura) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { durum } = await req.json();
  const row = await db.fatura.update({
    where: { id },
    data: { durum },
    include: {
      musteri: { select: { id: true, ad: true, vergiNo: true, adres: true, email: true, telefon: true } },
      sefer:   { select: { id: true, rotaDan: true, rotaAya: true, aracPlaka: true } },
    },
  });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const fatura = await db.fatura.findFirst({ where: { id, userId: s.userId } });
  if (!fatura) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Müşteri bakiyesini geri düşür (henüz ödenmemişse)
  if (fatura.musteriId && fatura.durum !== 'odendi') {
    await db.musteri.update({
      where: { id: fatura.musteriId },
      data: { bakiye: { decrement: fatura.genelToplam } },
    });
  }

  await db.fatura.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
