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

  // Fatura no: F-YYYY-NNN
  const count = await db.fatura.count({ where: { userId: s.userId } });
  const year = new Date().getFullYear();
  const faturaNo = `F-${year}-${String(count + 1).padStart(3, '0')}`;

  type Satir = { aciklama: string; miktar: number; birimFiyat: number; kdvOrani: number };
  const satirDizi: Satir[] = satirlar;
  const araToplam = satirDizi.reduce((s: number, r: Satir) => s + r.miktar * r.birimFiyat, 0);
  const kdvToplam = satirDizi.reduce((s: number, r: Satir) => s + r.miktar * r.birimFiyat * (r.kdvOrani / 100), 0);

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
      genelToplam: araToplam + kdvToplam,
      notlar: notlar ?? '',
      durum: durum ?? 'beklemede',
    },
    include: {
      musteri: { select: { id: true, ad: true, vergiNo: true, adres: true, email: true, telefon: true } },
      sefer:   { select: { id: true, rotaDan: true, rotaAya: true, aracPlaka: true } },
    },
  });
  return NextResponse.json(row, { status: 201 });
}
