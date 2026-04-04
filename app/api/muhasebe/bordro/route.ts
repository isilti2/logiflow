import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

/* ── GV Dilimleri — 2025 Türkiye yıllık sınırlar ─── */
const GV_DILIMLERI = [
  { sinir: 96_000,  oran: 0.15 },
  { sinir: 230_000, oran: 0.20 },
  { sinir: 580_000, oran: 0.27 },
  { sinir: Infinity, oran: 0.35 },
];

// Kümülatif GV: yıl başından o ana kadar birikmiş matrah üzerinden aylık GV farkı hesaplar
function hesaplaKumulatifGV(oncekiKumulatif: number, aylikMatrah: number): number {
  const yeniKumulatif = oncekiKumulatif + aylikMatrah;
  let oncekiVergi = 0;
  let yeniVergi   = 0;
  let kalan = 0;

  for (const { sinir, oran } of GV_DILIMLERI) {
    // Önceki kümülatif için vergi
    if (oncekiKumulatif > kalan) {
      const dilimGiren = Math.min(oncekiKumulatif, sinir) - kalan;
      oncekiVergi += Math.max(0, dilimGiren) * oran;
    }
    // Yeni kümülatif için vergi
    if (yeniKumulatif > kalan) {
      const dilimGiren = Math.min(yeniKumulatif, sinir) - kalan;
      yeniVergi += Math.max(0, dilimGiren) * oran;
    }
    kalan = sinir;
    if (sinir === Infinity) break;
  }

  return Math.max(0, yeniVergi - oncekiVergi);
}

/* ── Bordro Hesaplama (2025 Türkiye, kümülatif GV) ─── */
function hesaplaBordro(brutMaas: number, fazlaMesaiUcret: number, oncekiGvKumulatif: number) {
  const toplamBrut = brutMaas + fazlaMesaiUcret;

  // SGK işçi payı: %14 emeklilik + %1 işsizlik
  const sgkIsci      = toplamBrut * 0.14;
  const issizlikIsci = toplamBrut * 0.01;

  // GV matrahı (aylık)
  const gvMatrah = toplamBrut - sgkIsci - issizlikIsci;

  // Kümülatif GV hesabı — yıl içinde dilim geçişleri doğru yansır
  const gelirVergisi = hesaplaKumulatifGV(oncekiGvKumulatif, gvMatrah);
  const yeniGvKumulatif = oncekiGvKumulatif + gvMatrah;

  // Damga vergisi: %0.759
  const damgaVergisi = toplamBrut * 0.00759;

  const netMaas = Math.max(0, toplamBrut - sgkIsci - issizlikIsci - gelirVergisi - damgaVergisi);

  // SGK işveren payı: %15.5 + %2 işsizlik
  const sgkIsveren      = toplamBrut * 0.155;
  const issizlikIsveren = toplamBrut * 0.02;
  const toplamMaliyet   = toplamBrut + sgkIsveren + issizlikIsveren;

  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    sgkIsci:       r(sgkIsci),
    issizlikIsci:  r(issizlikIsci),
    gelirVergisi:  r(gelirVergisi),
    damgaVergisi:  r(damgaVergisi),
    netMaas:       r(netMaas),
    sgkIsveren:    r(sgkIsveren + issizlikIsveren),
    toplamMaliyet: r(toplamMaliyet),
    gvKumulatif:   r(yeniGvKumulatif),
  };
}

export async function GET(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ay = searchParams.get('ay');

  const rows = await db.bordro.findMany({
    where: { userId: s.userId, ...(ay ? { ay } : {}) },
    orderBy: [{ ay: 'desc' }, { createdAt: 'desc' }],
    include: { personel: { select: { id: true, ad: true, unvan: true } } },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { personelId, ay, fazlaMesaiUcret } = await req.json();
  if (!personelId || !ay) return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });

  const personel = await db.personel.findFirst({ where: { id: personelId, userId: s.userId } });
  if (!personel) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Fazla mesai: bu aydaki puantajlardan hesapla
  let hesaplananFazla = 0;
  if (!fazlaMesaiUcret) {
    const puantajlar = await db.puantaj.findMany({
      where: { personelId, tarih: { startsWith: ay } },
    });
    const toplamFazla = puantajlar.reduce((t, p) => t + p.fazlaMesai, 0);
    // Saatlik ücret = aylık maaş / 225 (yasal çalışma saati)
    const saatlikUcret = personel.maas / 225;
    hesaplananFazla = toplamFazla * saatlikUcret * 1.5; // yasal: 1.5x
  }

  const fazlaUcret = Number(fazlaMesaiUcret) || hesaplananFazla;

  // Bu aydan önceki en son bordrodan kümülatif GV matrahını al (aynı yıl)
  const yil = ay.slice(0, 4);
  const oncekiBordro = await db.bordro.findFirst({
    where: {
      personelId,
      ay: { startsWith: yil, lt: ay },
    },
    orderBy: { ay: 'desc' },
    select: { gvKumulatif: true },
  });
  const oncekiGvKumulatif = oncekiBordro?.gvKumulatif ?? 0;

  const hesap = hesaplaBordro(personel.maas, fazlaUcret, oncekiGvKumulatif);

  const row = await db.bordro.upsert({
    where: { personelId_ay: { personelId, ay } },
    create: {
      userId: s.userId,
      personelId,
      ay,
      brutMaas: personel.maas,
      fazlaMesaiUcret: fazlaUcret,
      ...hesap,
    },
    update: {
      brutMaas: personel.maas,
      fazlaMesaiUcret: fazlaUcret,
      ...hesap,
    },
    include: { personel: { select: { id: true, ad: true, unvan: true } } },
  });
  return NextResponse.json(row, { status: 201 });
}
