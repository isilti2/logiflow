import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

interface TopluEntry {
  personelId: string;
  tarih: string;
  girisSaati?: string;
  cikisSaati?: string;
  fazlaMesai?: number;
  izinTuru?: string;
  notlar?: string;
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { entries }: { entries: TopluEntry[] } = await req.json();
  if (!Array.isArray(entries) || entries.length === 0)
    return NextResponse.json({ error: 'Giriş listesi boş' }, { status: 400 });
  if (entries.length > 500)
    return NextResponse.json({ error: 'Tek seferde en fazla 500 kayıt' }, { status: 400 });

  // Gelen tüm personelId'lerin bu kullanıcıya ait olduğunu doğrula
  const personelIds = [...new Set(entries.map(e => e.personelId))];
  const personeller = await db.personel.findMany({
    where: { id: { in: personelIds }, userId: s.userId },
    select: { id: true },
  });
  const allowedIds = new Set(personeller.map(p => p.id));
  const forbidden = personelIds.filter(id => !allowedIds.has(id));
  if (forbidden.length > 0)
    return NextResponse.json({ error: 'Yetkisiz personel ID' }, { status: 403 });

  // Upsert tüm kayıtları (çakışan tarihler üzerine yazar)
  let created = 0;
  let updated = 0;
  for (const e of entries) {
    const existing = await db.puantaj.findUnique({
      where: { personelId_tarih: { personelId: e.personelId, tarih: e.tarih } },
    });
    await db.puantaj.upsert({
      where: { personelId_tarih: { personelId: e.personelId, tarih: e.tarih } },
      create: {
        userId: s.userId,
        personelId: e.personelId,
        tarih: e.tarih,
        girisSaati: e.girisSaati || null,
        cikisSaati: e.cikisSaati || null,
        fazlaMesai: Number(e.fazlaMesai) || 0,
        izinTuru: e.izinTuru || null,
        notlar: e.notlar ?? '',
      },
      update: {
        girisSaati: e.girisSaati || null,
        cikisSaati: e.cikisSaati || null,
        fazlaMesai: Number(e.fazlaMesai) || 0,
        izinTuru: e.izinTuru || null,
        notlar: e.notlar ?? '',
      },
    });
    existing ? updated++ : created++;
  }

  return NextResponse.json({ created, updated, total: entries.length });
}
