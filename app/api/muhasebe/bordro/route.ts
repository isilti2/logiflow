import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

/* ── Bordro Hesaplama (2025 Türkiye, basitleştirilmiş) ─── */
function hesaplaBordro(brutMaas: number, fazlaMesaiUcret: number) {
  const toplamBrut = brutMaas + fazlaMesaiUcret;

  // SGK işçi payı: %14 emeklilik + %1 işsizlik = %15
  const sgkIsci      = toplamBrut * 0.14;
  const issizlikIsci = toplamBrut * 0.01;

  // Gelir vergisi matrahı
  const gvMatrah = toplamBrut - sgkIsci - issizlikIsci;

  // Aylık GV dilimleri (2025 tahmini, kümülatif değil basit)
  let gelirVergisi = 0;
  if (gvMatrah <= 96_000 / 12) {
    gelirVergisi = gvMatrah * 0.15;
  } else if (gvMatrah <= 230_000 / 12) {
    gelirVergisi = (96_000 / 12) * 0.15 + (gvMatrah - 96_000 / 12) * 0.20;
  } else if (gvMatrah <= 580_000 / 12) {
    gelirVergisi = (96_000 / 12) * 0.15 + (134_000 / 12) * 0.20 + (gvMatrah - 230_000 / 12) * 0.27;
  } else {
    gelirVergisi = (96_000 / 12) * 0.15 + (134_000 / 12) * 0.20 + (350_000 / 12) * 0.27 + (gvMatrah - 580_000 / 12) * 0.35;
  }

  // Damga vergisi: %0.759
  const damgaVergisi = toplamBrut * 0.00759;

  const netMaas = toplamBrut - sgkIsci - issizlikIsci - gelirVergisi - damgaVergisi;

  // SGK işveren payı: %15.5 + %2 işsizlik = %17.5
  const sgkIsveren   = toplamBrut * 0.155;
  const issizlikIsveren = toplamBrut * 0.02;
  const toplamMaliyet   = toplamBrut + sgkIsveren + issizlikIsveren;

  return {
    sgkIsci: Math.round(sgkIsci * 100) / 100,
    issizlikIsci: Math.round(issizlikIsci * 100) / 100,
    gelirVergisi: Math.round(gelirVergisi * 100) / 100,
    damgaVergisi: Math.round(damgaVergisi * 100) / 100,
    netMaas: Math.round(netMaas * 100) / 100,
    sgkIsveren: Math.round((sgkIsveren + issizlikIsveren) * 100) / 100,
    toplamMaliyet: Math.round(toplamMaliyet * 100) / 100,
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
  const hesap = hesaplaBordro(personel.maas, fazlaUcret);

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
