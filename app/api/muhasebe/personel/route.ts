import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { encrypt, decryptPersonel } from '@/lib/encrypt';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.personel.findMany({
    where: { userId: s.userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { puantajlar: true } } },
  });
  return NextResponse.json(rows.map(decryptPersonel));
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ad, unvan, telefon, tcNo, maas, baslangicTarihi } = await req.json();
  if (!ad?.trim() || !baslangicTarihi) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
  }

  const row = await db.personel.create({
    data: {
      userId: s.userId,
      ad,
      unvan:          unvan ?? '',
      telefon:        encrypt(telefon ?? ''),
      tcNo:           encrypt(tcNo    ?? ''),
      maas:           Number(maas) || 0,
      baslangicTarihi,
    },
    include: { _count: { select: { puantajlar: true } } },
  });
  return NextResponse.json(decryptPersonel(row), { status: 201 });
}
