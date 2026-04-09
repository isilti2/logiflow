'use client';

import { AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { fmtDate, Fatura } from './types';

export function expiryStatus(dateStr: string | null | undefined): 'expired' | 'warn' | 'ok' | 'none' {
  if (!dateStr) return 'none';
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = diff / 86_400_000;
  if (days < 0) return 'expired';
  if (days <= 30) return 'warn';
  return 'ok';
}

export function ExpiryPill({ label, date }: { label: string; date: string | null | undefined }) {
  const s = expiryStatus(date);
  const cfg = {
    expired: { cls: 'bg-red-50 text-red-700 border border-red-100',      icon: <AlertTriangle className="w-3 h-3" /> },
    warn:    { cls: 'bg-amber-50 text-amber-700 border border-amber-100', icon: <Clock className="w-3 h-3" /> },
    ok:      { cls: 'bg-green-50 text-green-700 border border-green-100', icon: <ShieldCheck className="w-3 h-3" /> },
    none:    { cls: 'bg-gray-50 text-gray-500 dark:text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800',    icon: null },
  }[s];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.icon} {label}{date ? `: ${fmtDate(date)}` : ': —'}
    </span>
  );
}

export function DurumBadge({ durum }: { durum: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    planlandi:  { label: 'Planlandı',    cls: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    devam:      { label: 'Devam Ediyor', cls: 'bg-amber-50 text-amber-700' },
    tamamlandi: { label: 'Tamamlandı',  cls: 'bg-green-50 text-green-700' },
    iptal:      { label: 'İptal',        cls: 'bg-red-50 text-red-600' },
    beklemede:  { label: 'Beklemede',   cls: 'bg-yellow-50 text-yellow-700' },
    odendi:     { label: 'Ödendi',       cls: 'bg-green-50 text-green-700' },
  };
  const d = map[durum] ?? { label: durum, cls: 'bg-gray-100 text-gray-600 dark:text-gray-300' };
  return <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${d.cls}`}>{d.label}</span>;
}

export function IzinBadge({ izin }: { izin: string | null }) {
  if (!izin) return <span className="text-xs text-green-700 font-semibold">Çalışıldı</span>;
  const map: Record<string, string>    = { yillik: 'Yıllık İzin', hastalik: 'Hastalık', ucretsiz: 'Ücretsiz', resmi: 'Resmi Tatil' };
  const colors: Record<string, string> = { yillik: 'text-blue-700', hastalik: 'text-red-600', ucretsiz: 'text-orange-600', resmi: 'text-purple-700' };
  return <span className={`text-xs font-semibold ${colors[izin] ?? 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>{map[izin] ?? izin}</span>;
}

export function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub?: string; color: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colors: Record<string, string> = {
    green:  'bg-green-50 text-green-600',
    red:    'bg-red-50 text-red-600',
    blue:   'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber:  'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[color] ?? colors.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export function printFatura(fatura: Fatura) {
  const TLf = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
  const kdvOrani = fatura.araToplam > 0 ? Math.round((fatura.kdvToplam / fatura.araToplam) * 100) : 0;
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Fatura ${fatura.faturaNo}</title>
  <style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:40px;color:#111;font-size:14px}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
    .logo{font-size:22px;font-weight:900}.logo span{color:#2563eb}
    .badge{display:inline-block;margin-top:8px;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;background:${fatura.durum==='odendi'?'#dcfce7':fatura.durum==='iptal'?'#fee2e2':'#fef9c3'};color:${fatura.durum==='odendi'?'#166534':fatura.durum==='iptal'?'#991b1b':'#854d0e'}}
    .musteri-box{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:24px;background:#f9fafb}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    th{background:#f3f4f6;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280}
    td{padding:9px 12px;border-bottom:1px solid #f3f4f6}
    .tr{text-align:right}.totals{width:280px;margin-left:auto}
    .totals td{padding:5px 12px;font-size:13px}.grand{font-weight:700;font-size:15px;border-top:2px solid #111}
    .footer{margin-top:36px;text-align:center;font-size:11px;color:#9ca3af}
    @media print{body{padding:20px}}
  </style></head><body>
  <div class="hdr">
    <div><div class="logo">Logi<span>Flow</span></div><div style="font-size:11px;color:#6b7280;margin-top:3px">Lojistik Yönetim Platformu</div></div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:700">${fatura.faturaNo}</div>
      <div style="color:#6b7280;font-size:12px">Tarih: ${fmtDate(fatura.tarih)}</div>
      ${fatura.vadeTarih ? `<div style="color:#6b7280;font-size:12px">Vade: ${fmtDate(fatura.vadeTarih)}</div>` : ''}
      <div class="badge">${fatura.durum === 'odendi' ? 'ÖDENDİ' : fatura.durum === 'iptal' ? 'İPTAL' : 'BEKLEMEDE'}</div>
    </div>
  </div>
  ${fatura.musteri ? `<div class="musteri-box">
    <div style="font-size:10px;color:#9ca3af;margin-bottom:4px;text-transform:uppercase">Fatura Kesilen</div>
    <div style="font-weight:700;font-size:15px">${fatura.musteri.ad}</div>
    ${fatura.musteri.vergiNo ? `<div style="font-size:12px;color:#6b7280">Vergi No: ${fatura.musteri.vergiNo}</div>` : ''}
    ${fatura.musteri.adres   ? `<div style="font-size:12px;color:#6b7280">${fatura.musteri.adres}</div>` : ''}
    ${fatura.musteri.email   ? `<div style="font-size:12px;color:#6b7280">${fatura.musteri.email}</div>` : ''}
  </div>` : ''}
  ${fatura.sefer ? `<div style="margin-bottom:16px;font-size:12px;color:#6b7280;padding:8px 12px;background:#f0f9ff;border-radius:6px">Sefer: ${fatura.sefer.rotaDan} → ${fatura.sefer.rotaAya} · ${fatura.sefer.aracPlaka}</div>` : ''}
  <table>
    <thead><tr><th>Açıklama</th><th class="tr">KDV Oranı</th><th class="tr">Ara Toplam</th><th class="tr">KDV Tutarı</th><th class="tr">Toplam (KDV Dahil)</th></tr></thead>
    <tbody><tr>
      <td>${fatura.notlar || 'Lojistik hizmet bedeli'}</td>
      <td class="tr">%${kdvOrani}</td>
      <td class="tr">${TLf(fatura.araToplam)}</td>
      <td class="tr">${TLf(fatura.kdvToplam)}</td>
      <td class="tr" style="font-weight:600">${TLf(fatura.genelToplam)}</td>
    </tr></tbody>
  </table>
  <table class="totals">
    <tr><td>Ara Toplam</td><td class="tr">${TLf(fatura.araToplam)}</td></tr>
    <tr><td>KDV (%${kdvOrani})</td><td class="tr">${TLf(fatura.kdvToplam)}</td></tr>
    <tr class="grand"><td>GENEL TOPLAM</td><td class="tr">${TLf(fatura.genelToplam)}</td></tr>
  </table>
  ${fatura.sefer ? `<div style="margin-top:8px;font-size:12px;color:#6b7280">İlgili Sefer: ${fatura.sefer.rotaDan} → ${fatura.sefer.rotaAya} (${fatura.sefer.aracPlaka})</div>` : ''}
  <div class="footer">LogiFlow Lojistik Yönetim Platformu · Bu belge bilgisayar ortamında üretilmiştir.</div>
  </body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}
