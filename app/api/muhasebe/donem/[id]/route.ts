import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const donem = await db.donem.findFirst({ where: { id, userId: s.userId } });
  if (!donem) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { durum, notlar } = await req.json();

  const row = await db.donem.update({
    where: { id },
    data: {
      durum: durum ?? donem.durum,
      notlar: notlar ?? donem.notlar,
      kapatildiAt: durum === 'kapali' ? new Date() : durum === 'acik' ? null : undefined,
    },
  });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const donem = await db.donem.findFirst({ where: { id, userId: s.userId } });
  if (!donem) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (donem.durum === 'kapali') return NextResponse.json({ error: 'Kapalı dönem silinemez' }, { status: 409 });

  await db.donem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
