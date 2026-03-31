import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const allowed = ['role', 'name'] as const;
  const data: Partial<Record<typeof allowed[number], string>> = {};
  for (const key of allowed) { if (body[key] !== undefined) data[key] = body[key]; }
  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  if (id === session.userId) return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 });
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
