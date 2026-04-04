import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const row = await db.tahsilat.findFirst({ where: { id, userId: s.userId } });
  if (!row) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Tahsilat silinince müşteri bakiyesi geri artar
  await db.$transaction([
    db.tahsilat.delete({ where: { id } }),
    db.musteri.update({
      where: { id: row.musteriId },
      data: { bakiye: { increment: row.tutar } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
