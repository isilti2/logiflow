import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const areas = await db.depotArea.findMany({
    where: { userId: session.userId },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(areas);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const area = await db.depotArea.create({
    data: { userId: session.userId, name: body.name, location: body.location ?? '', capacity: body.capacity ?? 50 },
  });
  return NextResponse.json(area, { status: 201 });
}
