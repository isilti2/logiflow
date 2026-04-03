import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

async function owns(id: string, userId: string) {
  return !!(await db.sefer.findFirst({ where: { id, userId } }));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = await req.json();
  const row = await db.sefer.update({
    where: { id },
    data: {
      musteriId: data.musteriId || null,
      aracPlaka: data.aracPlaka,
      rotaDan: data.rotaDan,
      rotaAya: data.rotaAya,
      mesafeKm: Number(data.mesafeKm) || 0,
      tarih: data.tarih,
      yukAgirligi: Number(data.yukAgirligi) || 0,
      seferUcreti: Number(data.seferUcreti) || 0,
      yakitMaliyeti: Number(data.yakitMaliyeti) || 0,
      notlar: data.notlar ?? '',
      durum: data.durum ?? 'planlandi',
    },
    include: { musteri: { select: { id: true, ad: true } } },
  });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.sefer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
