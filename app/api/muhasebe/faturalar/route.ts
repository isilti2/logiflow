import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.fatura.findMany({
    where: { userId: s.userId },
    orderBy: { createdAt: 'desc' },
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

  const { musteriId, seferId, tarih, vadeTarih, satirlar, notlar, durum } = await req.json();
  if (!tarih || !satirlar?.length) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
  }

  // Fatura no: F-YYYY-NNN — son fatura üzerinden üret (race condition'dan korunmak için count yerine max)
  const year = new Date().getFullYear();
  const lastFatura = await db.fatura.findFirst({
    where: { userId: s.userId, faturaNo: { startsWith: `F-${year}-` } },
    orderBy: { faturaNo: 'desc' },
    select: { faturaNo: true },
  });
  const lastNum = lastFatura ? parseInt(lastFatura.faturaNo.split('-')[2] ?? '0', 10) : 0;
  const faturaNo = `F-${year}-${String(lastNum + 1).padStart(3, '0')}`;

  type Satir = { aciklama: string; miktar: number; birimFiyat: number; kdvOrani: number };
  const satirDizi: Satir[] = satirlar;
  const araToplam = satirDizi.reduce((s: number, r: Satir) => s + r.miktar * r.birimFiyat, 0);
  const kdvToplam = satirDizi.reduce((s: number, r: Satir) => s + r.miktar * r.birimFiyat * (r.kdvOrani / 100), 0);

  const genelToplam = araToplam + kdvToplam;

  const row = await db.fatura.create({
    data: {
      userId: s.userId,
      musteriId: musteriId || null,
      seferId: seferId || null,
      faturaNo,
      tarih,
      vadeTarih: vadeTarih || null,
      satirlar: JSON.stringify(satirlar),
      araToplam,
      kdvToplam,
      genelToplam,
      notlar: notlar ?? '',
      durum: durum ?? 'beklemede',
    },
    include: {
      musteri: { select: { id: true, ad: true, vergiNo: true, adres: true, email: true, telefon: true } },
      sefer:   { select: { id: true, rotaDan: true, rotaAya: true, aracPlaka: true } },
    },
  });

  // Müşteriye bağlı fatura ise bakiyeyi artır (borçlandır)
  if (musteriId) {
    await db.musteri.update({
      where: { id: musteriId },
      data: { bakiye: { increment: genelToplam } },
    });
  }

  return NextResponse.json(row, { status: 201 });
}
