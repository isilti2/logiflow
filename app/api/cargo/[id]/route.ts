import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

async function owns(userId: string, id: string) {
  return !!(await db.cargoItem.findFirst({ where: { id, userId } }));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(session.userId, id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const item = await db.cargoItem.update({ where: { id }, data: body });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(session.userId, id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await db.cargoItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
