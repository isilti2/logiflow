import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

// Admin: tüm şoförlerin en son konumu (son 2 saat içinde)
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sinir = new Date(Date.now() - 2 * 60 * 60 * 1000); // son 2 saat

  // Her userId için en son kayıt
  const rows = await db.konumKaydi.findMany({
    where: {
      createdAt: { gte: sinir },
    },
    orderBy: { createdAt: 'desc' },
    distinct: ['userId'],
    include: {
      user:  { select: { id: true, name: true, email: true } },
      sefer: { select: { rotaDan: true, rotaAya: true, aracPlaka: true, durum: true } },
    },
  });

  return NextResponse.json(rows);
}
