import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const personelId = searchParams.get('personelId');
  const ay = searchParams.get('ay'); // YYYY-MM

  const rows = await db.puantaj.findMany({
    where: {
      userId: s.userId,
      ...(personelId ? { personelId } : {}),
      ...(ay ? { tarih: { startsWith: ay } } : {}),
    },
    orderBy: { tarih: 'asc' },
    include: { personel: { select: { id: true, ad: true, unvan: true } } },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { personelId, tarih, girisSaati, cikisSaati, fazlaMesai, izinTuru, notlar } = await req.json();
  if (!personelId || !tarih) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
  }

  // Personel bu kullanıcıya ait mi?
  const p = await db.personel.findFirst({ where: { id: personelId, userId: s.userId } });
  if (!p) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const row = await db.puantaj.upsert({
    where: { personelId_tarih: { personelId, tarih } },
    create: {
      userId: s.userId,
      personelId,
      tarih,
      girisSaati: girisSaati || null,
      cikisSaati: cikisSaati || null,
      fazlaMesai: Number(fazlaMesai) || 0,
      izinTuru: izinTuru || null,
      notlar: notlar ?? '',
    },
    update: {
      girisSaati: girisSaati || null,
      cikisSaati: cikisSaati || null,
      fazlaMesai: Number(fazlaMesai) || 0,
      izinTuru: izinTuru || null,
      notlar: notlar ?? '',
    },
    include: { personel: { select: { id: true, ad: true, unvan: true } } },
  });
  return NextResponse.json(row, { status: 201 });
}
