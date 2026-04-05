import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.fatura.findMany({
    where: { userId: s.userId },
    orderBy: { vadeTarih: 'asc' },
    include: {
      musteri: { select: { id: true, ad: true, vergiNo: true, adres: true, email: true, telefon: true } },
      sefer:   { select: { id: true, rotaDan: true, rotaAya: true, aracPlaka: true } },
    },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const {
    musteriId, seferId, tarih, vadeTarih,
    tutar, kdvOrani = 20,
    aciklama, durum = 'beklemede', dosyaUrl,
  } = await req.json();

  if (!tarih || !tutar) {
    return NextResponse.json({ error: 'Tarih ve tutar zorunludur' }, { status: 400 });
  }

  const genelToplam = Number(tutar);
  const kdv         = Number(kdvOrani);
  const araToplam   = Math.round((genelToplam / (1 + kdv / 100)) * 100) / 100;
  const kdvToplam   = Math.round((genelToplam - araToplam) * 100) / 100;

  const year = new Date().getFullYear();
  const lastFatura = await db.fatura.findFirst({
    where: { userId: s.userId, faturaNo: { startsWith: `F-${year}-` } },
    orderBy: { faturaNo: 'desc' },
    select: { faturaNo: true },
  });
  const lastNum = lastFatura ? parseInt(lastFatura.faturaNo.split('-')[2] ?? '0', 10) : 0;
  const faturaNo = `F-${year}-${String(lastNum + 1).padStart(3, '0')}`;

  const row = await db.fatura.create({
    data: {
      userId:     s.userId,
      musteriId:  musteriId  || null,
      seferId:    seferId    || null,
      faturaNo,
      tarih,
      vadeTarih:  vadeTarih  || null,
      satirlar:   '[]',
      araToplam,
      kdvToplam,
      genelToplam,
      notlar:     aciklama   ?? '',
      durum,
      dosyaUrl:   dosyaUrl   || null,
    },
    include: {
      musteri: { select: { id: true, ad: true, vergiNo: true, adres: true, email: true, telefon: true } },
      sefer:   { select: { id: true, rotaDan: true, rotaAya: true, aracPlaka: true } },
    },
  });

  if (musteriId) {
    await db.musteri.update({
      where: { id: musteriId },
      data: { bakiye: { increment: genelToplam } },
    });
  }

  return NextResponse.json(row, { status: 201 });
}
