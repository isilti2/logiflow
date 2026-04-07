import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { encrypt, decryptMusteri } from '@/lib/encrypt';

async function owns(id: string, userId: string) {
  return !!(await db.musteri.findFirst({ where: { id, userId } }));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { ad, vergiNo, telefon, email, adres } = await req.json();
  const row = await db.musteri.update({
    where: { id },
    data: {
      ad,
      vergiNo:  vergiNo  !== undefined ? encrypt(vergiNo)  : undefined,
      telefon:  telefon  !== undefined ? encrypt(telefon)  : undefined,
      email:    email    !== undefined ? encrypt(email)    : undefined,
      adres:    adres    !== undefined ? encrypt(adres)    : undefined,
    },
  });
  return NextResponse.json(decryptMusteri(row));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.musteri.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
