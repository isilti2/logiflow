import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

async function owns(id: string, userId: string) {
  return !!(await db.maliIslem.findFirst({ where: { id, userId } }));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.maliIslem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
