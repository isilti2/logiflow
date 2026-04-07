import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { encrypt, decryptMusteri } from '@/lib/encrypt';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.musteri.findMany({
    where: { userId: s.userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { seferler: true, islemler: true } } },
  });
  return NextResponse.json(rows.map(decryptMusteri));
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ad, vergiNo, telefon, email, adres } = await req.json();
  if (!ad?.trim()) return NextResponse.json({ error: 'Ad zorunludur' }, { status: 400 });

  const row = await db.musteri.create({
    data: {
      userId: s.userId,
      ad,
      vergiNo:  encrypt(vergiNo  ?? ''),
      telefon:  encrypt(telefon  ?? ''),
      email:    encrypt(email    ?? ''),
      adres:    encrypt(adres    ?? ''),
    },
  });
  return NextResponse.json(decryptMusteri(row), { status: 201 });
}
