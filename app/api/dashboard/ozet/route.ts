import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

const AY_LABEL: Record<number, string> = {
  1: 'Oca', 2: 'Şub', 3: 'Mar', 4: 'Nis', 5: 'May', 6: 'Haz',
  7: 'Tem', 8: 'Ağu', 9: 'Eyl', 10: 'Eki', 11: 'Kas', 12: 'Ara',
};

// Son 6 ayın YYYY-MM listesini döner
function sonAltiAy(): string[] {
  const now = new Date();
  const aylar: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    aylar.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return aylar;
}

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const aylar = sonAltiAy();
  const baslangic = aylar[0] + '-01';

  const [islemler, seferler] = await Promise.all([
    db.maliIslem.findMany({
      where: { userId: s.userId, tarih: { gte: baslangic } },
      select: { tur: true, tutar: true, tarih: true },
    }),
    db.sefer.findMany({
      where: { userId: s.userId, tarih: { gte: baslangic } },
      select: { aracPlaka: true, seferUcreti: true, yakitMaliyeti: true, tarih: true },
    }),
  ]);

  // --- Aylık gelir/gider trend ---
  const aylikTrend = aylar.map((ay) => {
    const ayIslemler = islemler.filter((i) => i.tarih.startsWith(ay));
    const gelir = ayIslemler.filter((i) => i.tur === 'gelir').reduce((t, i) => t + i.tutar, 0);
    const gider = ayIslemler.filter((i) => i.tur === 'gider').reduce((t, i) => t + i.tutar, 0);
    const [yil, ayNo] = ay.split('-');
    return {
      ay,
      ayLabel: `${AY_LABEL[Number(ayNo)]} ${yil.slice(2)}`,
      gelir: Math.round(gelir),
      gider: Math.round(gider),
      net: Math.round(gelir - gider),
    };
  });

  // --- Araç net kâr (son 6 ay, top 6) ---
  const aracMap: Record<string, { plaka: string; gelir: number; gider: number }> = {};
  for (const sf of seferler) {
    if (!aracMap[sf.aracPlaka]) aracMap[sf.aracPlaka] = { plaka: sf.aracPlaka, gelir: 0, gider: 0 };
    aracMap[sf.aracPlaka].gelir += sf.seferUcreti;
    aracMap[sf.aracPlaka].gider += sf.yakitMaliyeti;
  }
  const aracPerf = Object.values(aracMap)
    .map((a) => ({ ...a, net: Math.round(a.gelir - a.gider), gelir: Math.round(a.gelir), gider: Math.round(a.gider) }))
    .sort((a, b) => b.net - a.net)
    .slice(0, 6);

  // --- Sefer durum dağılımı ---
  const tumSeferler = await db.sefer.findMany({
    where: { userId: s.userId },
    select: { durum: true },
  });
  const seferDurum = {
    devam:       tumSeferler.filter((s) => s.durum === 'devam').length,
    tamamlandi:  tumSeferler.filter((s) => s.durum === 'tamamlandi').length,
    iptal:       tumSeferler.filter((s) => s.durum === 'iptal').length,
  };

  return NextResponse.json({ aylikTrend, aracPerf, seferDurum });
}
