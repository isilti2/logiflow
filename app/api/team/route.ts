import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const members = await db.teamMember.findMany({ where: { userId: session.userId }, orderBy: { id: 'asc' } });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const member = await db.teamMember.create({ data: { userId: session.userId, ...body } });
  return NextResponse.json(member, { status: 201 });
}
