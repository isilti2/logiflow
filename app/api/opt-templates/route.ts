import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const templates = await db.optTemplate.findMany({
    where: { userId: session.userId },
    orderBy: { savedAt: 'desc' },
    take: 20,
  });
  return NextResponse.json(templates.map((t: { items: string; [key: string]: unknown }) => ({ ...t, items: JSON.parse(t.items) })));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, items } = await req.json();
  const template = await db.optTemplate.create({
    data: { userId: session.userId, name, items: JSON.stringify(items) },
  });
  return NextResponse.json({ ...template, items }, { status: 201 });
}
