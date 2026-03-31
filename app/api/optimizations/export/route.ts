import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  let runs;
  if (id) {
    const run = await db.optimizationRun.findFirst({ where: { id, userId: session.userId } });
    if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    runs = [run];
  } else {
    runs = await db.optimizationRun.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  const rows = runs.map((r) => `
    <tr>
      <td>${r.date}</td>
      <td>${r.containerLabel}</td>
      <td>${r.itemCount}</td>
      <td>${r.placedCount}</td>
      <td>
        <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;
          background:${r.fillPct >= 85 ? '#dcfce7' : r.fillPct >= 60 ? '#fef9c3' : '#fee2e2'};
          color:${r.fillPct >= 85 ? '#166534' : r.fillPct >= 60 ? '#854d0e' : '#991b1b'}">
          %${r.fillPct}
        </span>
      </td>
    </tr>`).join('');

  const avgFill = runs.length
    ? Math.round(runs.reduce((s, r) => s + r.fillPct, 0) / runs.length)
    : 0;
  const totalItems = runs.reduce((s, r) => s + r.itemCount, 0);
  const totalPlaced = runs.reduce((s, r) => s + r.placedCount, 0);

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<title>LogiFlow — Optimizasyon Raporu</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
  .logo { font-size: 22px; font-weight: 900; color: #1e293b; }
  .logo span { color: #2563eb; }
  .meta { text-align: right; font-size: 12px; color: #6b7280; }
  .meta strong { color: #374151; }
  h1 { font-size: 20px; font-weight: 800; margin-bottom: 6px; color: #1e293b; }
  .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 28px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
  .stat-value { font-size: 28px; font-weight: 900; color: #1e293b; }
  .stat-label { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { background: #1e293b; color: #fff; }
  thead th { padding: 10px 14px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo">Logi<span>Flow</span></div>
  <div class="meta">
    <strong>${user?.name ?? user?.email ?? 'Kullanıcı'}</strong><br/>
    Oluşturulma: ${new Date().toLocaleDateString('tr-TR', { day:'2-digit', month:'long', year:'numeric' })}<br/>
    ${id ? 'Tek Kayıt Raporu' : `Son ${runs.length} Optimizasyon`}
  </div>
</div>

<h1>Optimizasyon Raporu</h1>
<p class="subtitle">LogiFlow tarafından oluşturuldu · ${new Date().toLocaleString('tr-TR')}</p>

<div class="stats">
  <div class="stat"><div class="stat-value">${runs.length}</div><div class="stat-label">Toplam Çalışma</div></div>
  <div class="stat"><div class="stat-value">%${avgFill}</div><div class="stat-label">Ort. Doluluk</div></div>
  <div class="stat"><div class="stat-value">${totalItems}</div><div class="stat-label">Toplam Öğe</div></div>
  <div class="stat"><div class="stat-value">${totalPlaced}</div><div class="stat-label">Yerleştirilen</div></div>
</div>

<table>
  <thead>
    <tr>
      <th>Tarih</th>
      <th>Konteyner</th>
      <th>Öğe Sayısı</th>
      <th>Yerleştirilen</th>
      <th>Doluluk</th>
    </tr>
  </thead>
  <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:24px;color:#9ca3af;">Henüz optimizasyon kaydı yok</td></tr>'}</tbody>
</table>

<div class="footer">
  <span>LogiFlow · logiflow.vercel.app</span>
  <span>Bu rapor otomatik olarak oluşturulmuştur.</span>
</div>

<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
