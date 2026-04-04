import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

async function owns(id: string, userId: string) {
  return !!(await db.sefer.findFirst({ where: { id, userId } }));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = await req.json();

  // Sefer tamamlandığında otomatik gelir kaydı oluştur (bir kez)
  if (data.durum === 'tamamlandi') {
    const mevcut = await db.sefer.findFirst({ where: { id, userId: s.userId } });
    if (mevcut && mevcut.durum !== 'tamamlandi' && Number(data.seferUcreti ?? mevcut.seferUcreti) > 0) {
      const ucret = Number(data.seferUcreti ?? mevcut.seferUcreti);
      const mevcutGelir = await db.maliIslem.findFirst({
        where: { userId: s.userId, seferId: id, tur: 'gelir', kategori: 'Sefer Ücreti' },
      });
      if (!mevcutGelir) {
        await db.maliIslem.create({
          data: {
            userId: s.userId,
            seferId: id,
            musteriId: data.musteriId || mevcut.musteriId || null,
            tur: 'gelir',
            kategori: 'Sefer Ücreti',
            tutar: ucret,
            kdvOrani: 0,
            aciklama: `Sefer Tamamlandı — ${data.rotaDan ?? mevcut.rotaDan} → ${data.rotaAya ?? mevcut.rotaAya} (${data.aracPlaka ?? mevcut.aracPlaka})`,
            tarih: data.tarih ?? mevcut.tarih,
          },
        });
      }
    }
  }

  const row = await db.sefer.update({
    where: { id },
    data: {
      musteriId: data.musteriId || null,
      aracPlaka: data.aracPlaka,
      rotaDan: data.rotaDan,
      rotaAya: data.rotaAya,
      mesafeKm: Number(data.mesafeKm) || 0,
      tarih: data.tarih,
      yukAgirligi: Number(data.yukAgirligi) || 0,
      seferUcreti: Number(data.seferUcreti) || 0,
      yakitMaliyeti: Number(data.yakitMaliyeti) || 0,
      notlar: data.notlar ?? '',
      durum: data.durum ?? 'planlandi',
    },
    include: { musteri: { select: { id: true, ad: true } } },
  });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.sefer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
