import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get('areaId');
  const cargo = await db.cargoItem.findMany({
    where: { userId: session.userId, ...(areaId ? { areaId } : {}) },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(cargo);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const item = await db.cargoItem.create({
    data: { userId: session.userId, ...body },
  });
  return NextResponse.json(item, { status: 201 });
}
