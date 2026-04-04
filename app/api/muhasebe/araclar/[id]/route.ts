import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

async function owns(id: string, userId: string) {
  return !!(await db.arac.findFirst({ where: { id, userId } }));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { plaka, marka, model, yil, ruhsatSon, sigortaSon, muayeneSon, aktif, notlar } = await req.json();
  const row = await db.arac.update({
    where: { id },
    data: {
      plaka: plaka?.toUpperCase().trim(),
      marka, model,
      yil: yil ? Number(yil) : null,
      ruhsatSon: ruhsatSon || null,
      sigortaSon: sigortaSon || null,
      muayeneSon: muayeneSon || null,
      aktif, notlar,
    },
    include: { _count: { select: { yakitKayitlari: true } } },
  });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.arac.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
