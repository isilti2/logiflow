import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

// GET /api/muhasebe/rapor?tip=seferler|araclar|musteriler&donem=2026-04
export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tip    = searchParams.get('tip') ?? 'seferler';
  const donem  = searchParams.get('donem'); // "2026-04" veya null (tümü)

  const tarihFilter = donem ? { tarih: { startsWith: donem } } : {};

  if (tip === 'seferler') {
    const seferler = await db.sefer.findMany({
      where: { userId: s.userId, ...(donem ? { tarih: { startsWith: donem } } : {}) },
      include: {
        musteri: { select: { id: true, ad: true } },
        islemler: { where: { userId: s.userId } },
      },
      orderBy: { tarih: 'desc' },
    });

    const rapor = seferler.map(s => {
      const gelirIslemler = s.islemler.filter(i => i.tur === 'gelir');
      const giderIslemler = s.islemler.filter(i => i.tur === 'gider');
      const toplamGelir  = gelirIslemler.reduce((t, i) => t + i.tutar, 0);
      const toplamGider  = giderIslemler.reduce((t, i) => t + i.tutar, 0) + s.yakitMaliyeti;
      return {
        id: s.id, rotaDan: s.rotaDan, rotaAya: s.rotaAya, aracPlaka: s.aracPlaka,
        tarih: s.tarih, durum: s.durum, musteriAd: s.musteri?.ad ?? null,
        seferUcreti: s.seferUcreti, yakitMaliyeti: s.yakitMaliyeti,
        toplamGelir, toplamGider, netKar: toplamGelir - toplamGider,
        mesafeKm: s.mesafeKm,
      };
    });
    return NextResponse.json(rapor);
  }

  if (tip === 'araclar') {
    const seferler = await db.sefer.findMany({
      where: { userId: s.userId, ...(donem ? { tarih: { startsWith: donem } } : {}) },
    });
    const yakitlar = await db.yakitKaydi.findMany({
      where: { userId: s.userId, ...(donem ? tarihFilter : {}) },
      include: { arac: { select: { plaka: true, marka: true, model: true } } },
    });

    const araçMap: Record<string, { plaka: string; marka: string; model: string; seferGelir: number; seferSayisi: number; yakitTutar: number; kmTopla: number }> = {};

    for (const sf of seferler) {
      const k = sf.aracPlaka;
      if (!araçMap[k]) araçMap[k] = { plaka: k, marka: '', model: '', seferGelir: 0, seferSayisi: 0, yakitTutar: 0, kmTopla: 0 };
      araçMap[k].seferGelir  += sf.seferUcreti;
      araçMap[k].seferSayisi += 1;
      araçMap[k].kmTopla     += sf.mesafeKm;
    }
    for (const y of yakitlar) {
      const k = y.arac?.plaka ?? '';
      if (!araçMap[k]) araçMap[k] = { plaka: k, marka: y.arac?.marka ?? '', model: y.arac?.model ?? '', seferGelir: 0, seferSayisi: 0, yakitTutar: 0, kmTopla: 0 };
      araçMap[k].yakitTutar += y.toplamTutar;
      if (!araçMap[k].marka) { araçMap[k].marka = y.arac?.marka ?? ''; araçMap[k].model = y.arac?.model ?? ''; }
    }

    const rapor = Object.values(araçMap).map(a => ({
      ...a, netKar: a.seferGelir - a.yakitTutar,
      kmBasiMaliyet: a.kmTopla > 0 ? a.yakitTutar / a.kmTopla : 0,
    })).sort((a, b) => b.netKar - a.netKar);
    return NextResponse.json(rapor);
  }

  if (tip === 'musteriler') {
    const musteriler = await db.musteri.findMany({
      where: { userId: s.userId },
      include: {
        faturalar: { where: { userId: s.userId, ...(donem ? { tarih: { startsWith: donem } } : {}) } },
        tahsilatlar: { where: { userId: s.userId, ...(donem ? tarihFilter : {}) } },
        seferler: { where: { userId: s.userId, ...(donem ? { tarih: { startsWith: donem } } : {}) } },
      },
    });

    const rapor = musteriler.map(m => {
      const toplamFatura  = m.faturalar.reduce((t, f) => t + f.genelToplam, 0);
      const toplamTahsilat = m.tahsilatlar.reduce((t, t2) => t + t2.tutar, 0);
      const bekleyenFatura = m.faturalar.filter(f => f.durum !== 'odendi').reduce((t, f) => t + f.genelToplam, 0);
      return {
        id: m.id, ad: m.ad, vergiNo: m.vergiNo,
        seferSayisi: m.seferler.length, faturaSayisi: m.faturalar.length,
        toplamFatura, toplamTahsilat, bakiye: m.bakiye,
        bekleyenFatura, tahsilatOrani: toplamFatura > 0 ? (toplamTahsilat / toplamFatura) * 100 : 0,
      };
    }).sort((a, b) => b.toplamFatura - a.toplamFatura);
    return NextResponse.json(rapor);
  }

  return NextResponse.json({ error: 'Geçersiz tip' }, { status: 400 });
}
