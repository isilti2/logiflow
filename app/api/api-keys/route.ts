import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const keys = await db.apiKey.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, prefix: true, scopes: true, active: true, createdAt: true, lastUsed: true },
  });
  return NextResponse.json(keys);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, scopes } = await req.json();

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const rawKey = 'lf_' + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const prefix = rawKey.slice(0, 12) + '…';
  const keyHash = await bcrypt.hash(rawKey, 10);

  const key = await db.apiKey.create({
    data: { userId: session.userId, name, prefix, keyHash, scopes: JSON.stringify(scopes ?? []) },
  });

  // Return the raw key ONCE — never stored in plain text again
  return NextResponse.json({ ...key, rawKey }, { status: 201 });
}
