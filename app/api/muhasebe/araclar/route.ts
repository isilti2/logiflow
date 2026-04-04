import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.arac.findMany({
    where: { userId: s.userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { yakitKayitlari: true } } },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plaka, marka, model, yil, ruhsatSon, sigortaSon, muayeneSon, notlar } = await req.json();
  if (!plaka?.trim()) return NextResponse.json({ error: 'Plaka zorunludur' }, { status: 400 });

  const row = await db.arac.create({
    data: {
      userId: s.userId,
      plaka: plaka.toUpperCase().trim(),
      marka: marka ?? '',
      model: model ?? '',
      yil: yil ? Number(yil) : null,
      ruhsatSon: ruhsatSon || null,
      sigortaSon: sigortaSon || null,
      muayeneSon: muayeneSon || null,
      notlar: notlar ?? '',
    },
    include: { _count: { select: { yakitKayitlari: true } } },
  });
  return NextResponse.json(row, { status: 201 });
}
