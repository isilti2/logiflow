import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { encrypt, decryptPersonel } from '@/lib/encrypt';

async function owns(id: string, userId: string) {
  return !!(await db.personel.findFirst({ where: { id, userId } }));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { ad, unvan, telefon, tcNo, maas, baslangicTarihi, aktif } = await req.json();
  const row = await db.personel.update({
    where: { id },
    data: {
      ad, unvan,
      telefon:        telefon  !== undefined ? encrypt(telefon)  : undefined,
      tcNo:           tcNo     !== undefined ? encrypt(tcNo)     : undefined,
      maas:           maas     !== undefined ? Number(maas) || 0 : undefined,
      baslangicTarihi,
      aktif,
    },
    include: { _count: { select: { puantajlar: true } } },
  });
  return NextResponse.json(decryptPersonel(row));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!await owns(id, s.userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.personel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
