import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { optimizations: true, cargo: true },
      },
      optimizations: {
        select: { createdAt: true, containerLabel: true, fillPct: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Her kullanıcı için en son AuditLog kaydını çek
  const userIds = users.map((u) => u.id).filter(Boolean);
  const recentLogs = userIds.length
    ? await db.auditLog.findMany({
        where: { userId: { in: userIds } },
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
        select: { userId: true, action: true, module: true, type: true, createdAt: true },
      })
    : [];

  const logMap = Object.fromEntries(recentLogs.map((l) => [l.userId, l]));

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    optCount: u._count.optimizations,
    cargoCount: u._count.cargo,
    lastOpt: u.optimizations[0] ?? null,
    lastLog: logMap[u.id] ?? null,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, email, password, role } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 });
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Bu email zaten kayıtlı' }, { status: 409 });
  const hashed = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email, password: hashed, role: role ?? 'user' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
