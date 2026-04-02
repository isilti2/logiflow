import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const notifs = await db.appNotification.findMany({
    where: { userId: session.userId },
    orderBy: { time: 'desc' },
    take: 50,
  });
  return NextResponse.json(notifs);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const notif = await db.appNotification.create({
    data: { userId: session.userId, type: body.type, title: body.title, message: body.message },
  });
  return NextResponse.json(notif, { status: 201 });
}

export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await db.appNotification.updateMany({ where: { userId: session.userId }, data: { read: true } });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await db.appNotification.deleteMany({ where: { userId: session.userId } });
  return NextResponse.json({ ok: true });
}
