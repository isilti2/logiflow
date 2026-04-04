import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const row = await db.yakitKaydi.findFirst({
    where: { id, userId: s.userId },
    include: { arac: { select: { plaka: true } } },
  });
  if (!row) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.yakitKaydi.delete({ where: { id } });

  // Otomatik oluşturulan gider kaydını da sil
  await db.maliIslem.deleteMany({
    where: {
      userId: s.userId,
      kategori: 'Yakıt',
      tarih: row.tarih,
      tutar: row.toplamTutar,
    },
  });

  return NextResponse.json({ ok: true });
}
