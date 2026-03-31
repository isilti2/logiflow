import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const runs = await db.optimizationRun.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(runs);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const run = await db.optimizationRun.create({
    data: { userId: session.userId, ...body },
  });
  return NextResponse.json(run, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    await db.optimizationRun.deleteMany({ where: { id, userId: session.userId } });
  } else {
    await db.optimizationRun.deleteMany({ where: { userId: session.userId } });
  }
  return NextResponse.json({ ok: true });
}
