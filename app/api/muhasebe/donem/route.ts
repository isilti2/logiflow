import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.donem.findMany({
    where: { userId: s.userId },
    orderBy: { ay: 'desc' },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ay, notlar } = await req.json();
  if (!ay) return NextResponse.json({ error: 'ay zorunlu' }, { status: 400 });

  const row = await db.donem.upsert({
    where: { userId_ay: { userId: s.userId, ay } },
    create: { userId: s.userId, ay, notlar: notlar ?? '' },
    update: { notlar: notlar ?? '' },
  });
  return NextResponse.json(row, { status: 201 });
}
