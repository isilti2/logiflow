import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [totalUsers, totalOpts, totalCargo, totalAreas] = await Promise.all([
    db.user.count(),
    db.optimizationRun.count(),
    db.cargoItem.count(),
    db.depotArea.count(),
  ]);

  return NextResponse.json({ totalUsers, totalOpts, totalCargo, totalAreas });
}
