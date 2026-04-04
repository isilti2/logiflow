import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

async function owns(id: string, userId: string) {
  return !!(await db.fatura.findFirst({ where: { id, userId } }));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { durum, notlar, vadeTarih } = await req.json();
  const row = await db.fatura.update({
    where: { id },
    data: { durum, notlar, vadeTarih: vadeTarih || null },
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
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.fatura.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
