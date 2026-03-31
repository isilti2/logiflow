'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';
import {
  BarChart3, FileText, Download, TrendingUp, CheckCircle2, Calendar, Package, Leaf, DollarSign,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'Haftalık' | 'Aylık' | 'Yıllık';

interface OptRecord {
  date: string;
  containerLabel: string;
  fillPct: number;
  itemCount: number;
  placedCount: number;
}

interface PeriodData {
  labels: string[];
  values: number[];
  totalYukleme: string;
  verimlilik: string;
  tasarruf: string;
  co2Saved: string;    // kg CO₂ tahmini tasarruf
  costPerM3: string;   // ₺ hacim başına maliyet tahmini
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_LABELS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

function parseOptDate(s: string): Date {
  try {
    const [datePart] = s.split(' ');
    const parts = datePart.split('.');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  } catch { return new Date(0); }
}

const FALLBACK: Record<Period, PeriodData> = {
  Haftalık: {
    labels: ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],
    values: [65,72,58,80,75,45,30],
    totalYukleme: '—', verimlilik: '—', tasarruf: '—', co2Saved: '—', costPerM3: '—',
  },
  Aylık: {
    labels: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
    values: [55,60,72,68,75,80,78,82,76,70,65,58],
    totalYukleme: '—', verimlilik: '—', tasarruf: '—', co2Saved: '—', costPerM3: '—',
  },
  Yıllık: {
    labels: ['Q1','Q2','Q3','Q4'],
    values: [65,75,80,72],
    totalYukleme: '—', verimlilik: '—', tasarruf: '—', co2Saved: '—', costPerM3: '—',
  },
};

function avg(arr: number[]): number {
  return arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// CO₂ tasarrufu: her optimizasyonda ortalama doluluk ile sektör ortalaması (65%) arasındaki fark
// Varsayım: 20ft konteyner başına 45 kg CO₂/optimizasyon, her %1 verimlilik artışı = 0.45 kg tasarruf
function calcCo2Saved(fills: number[]): string {
  if (fills.length === 0) return '—';
  const avgFill = avg(fills);
  const savedPerOpt = Math.max(0, (avgFill - 65) * 0.45); // kg per optimization
  const total = Math.round(savedPerOpt * fills.length);
  return total >= 1000 ? `${(total / 1000).toFixed(1)} t` : `${total} kg`;
}

// Hacim başına maliyet: 20ft konteyner ≈ 33 m³, mock ₺850/optimizasyon
function calcCostPerM3(fills: number[]): string {
  if (fills.length === 0) return '—';
  const avgFill = avg(fills);
  const usedM3 = (33 * avgFill) / 100; // avg used m³ per opt
  const costPerOpt = 850; // mock ₺
  const cpm3 = usedM3 > 0 ? Math.round(costPerOpt / usedM3) : 0;
  return `₺${cpm3}/m³`;
}

function computePeriodData(history: OptRecord[], period: Period): PeriodData {
  if (history.length === 0) return FALLBACK[period];

  if (period === 'Haftalık') {
    const slice = history.slice(0, Math.min(10, history.length)).reverse();
    const sliceFills = slice.map((r) => r.fillPct);
    return {
      labels: slice.map((r) => {
        const d = parseOptDate(r.date);
        return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
      }),
      values: sliceFills,
      totalYukleme: String(slice.length),
      verimlilik: `${avg(sliceFills)}%`,
      tasarruf: `${slice.reduce((s, r) => s + r.placedCount, 0)} birim`,
      co2Saved: calcCo2Saved(sliceFills),
      costPerM3: calcCostPerM3(sliceFills),
    };
  }

  if (period === 'Aylık') {
    const now = new Date();
    const months: { label: string; vals: number[]; placed: number }[] = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return { label: MONTH_LABELS[d.getMonth()], vals: [], placed: 0 };
    });
    for (const rec of history) {
      const d = parseOptDate(rec.date);
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      const idx = 11 - monthsAgo;
      if (idx >= 0 && idx < 12) {
        months[idx].vals.push(rec.fillPct);
        months[idx].placed += rec.placedCount;
      }
    }
    const allFills = history.map((r) => r.fillPct);
    return {
      labels: months.map((m) => m.label),
      values: months.map((m) => avg(m.vals)),
      totalYukleme: String(history.length),
      verimlilik: `${avg(allFills)}%`,
      tasarruf: `${history.reduce((s, r) => s + r.placedCount, 0)} birim`,
      co2Saved: calcCo2Saved(allFills),
      costPerM3: calcCostPerM3(allFills),
    };
  }

  // Yıllık
  const quarters = [
    { label: 'Q1', vals: [] as number[], placed: 0 },
    { label: 'Q2', vals: [] as number[], placed: 0 },
    { label: 'Q3', vals: [] as number[], placed: 0 },
    { label: 'Q4', vals: [] as number[], placed: 0 },
  ];
  for (const rec of history) {
    const d = parseOptDate(rec.date);
    const q = Math.floor(d.getMonth() / 3);
    quarters[q].vals.push(rec.fillPct);
    quarters[q].placed += rec.placedCount;
  }
  const yearlyFills = history.map((r) => r.fillPct);
  return {
    labels: quarters.map((q) => q.label),
    values: quarters.map((q) => avg(q.vals)),
    totalYukleme: String(history.length),
    verimlilik: `${avg(yearlyFills)}%`,
    tasarruf: `${history.reduce((s, r) => s + r.placedCount, 0)} birim`,
    co2Saved: calcCo2Saved(yearlyFills),
    costPerM3: calcCostPerM3(yearlyFills),
  };
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ labels, values }: { labels: string[]; values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 sm:gap-2 h-48 w-full pt-2">
      {labels.map((label, i) => {
        const heightPct = Math.round((values[i] / max) * 100);
        const isHigh = values[i] >= 75;
        return (
          <div key={label + i} className="flex flex-col items-center flex-1 gap-1.5">
            <span className="text-[10px] font-semibold text-blue-700 leading-none">{values[i] > 0 ? `${values[i]}%` : ''}</span>
            <div
              className={`w-full rounded-t-lg transition-all duration-500 ease-out ${isHigh ? 'bg-gradient-to-t from-blue-700 to-blue-500' : 'bg-gradient-to-t from-blue-400 to-blue-300'}`}
              style={{ height: heightPct > 0 ? `${heightPct}%` : '4px', opacity: heightPct > 0 ? 1 : 0.3 }}
            />
            <span className="text-[9px] text-gray-400 font-medium leading-none truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">{icon}</div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DetayliRaporlamaPage() {
  const [period, setPeriod] = useState<Period>('Haftalık');
  const [history, setHistory] = useState<OptRecord[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    fetch('/api/optimizations')
      .then((r) => r.ok ? r.json() : [])
      .then(setHistory);
  }, []);

  const data = useMemo(() => computePeriodData(history, period), [history, period]);
  const periods: Period[] = ['Haftalık', 'Aylık', 'Yıllık'];
  const hasData = history.length > 0;

  const reportRows = useMemo(() => {
    if (!hasData) return [
      { name: 'Haftalık Özet — 17 Mar', date: '17.03.2026', efficiency: '78%', status: 'Tamamlandı' as const },
      { name: 'Aylık Analiz — Şubat',   date: '01.03.2026', efficiency: '71%', status: 'Tamamlandı' as const },
      { name: 'Kargo Hat Q1 2026',       date: '28.02.2026', efficiency: '74%', status: 'Tamamlandı' as const },
      { name: 'Bölgesel Karşılaştırma',  date: '15.02.2026', efficiency: '—',   status: 'İşleniyor'  as const },
      { name: 'Yıllık Özet 2025',        date: '01.01.2026', efficiency: '69%', status: 'Tamamlandı' as const },
    ];
    return history.slice(0, 15).map((rec, i) => ({
      name: `Optimizasyon #${history.length - i} — ${rec.containerLabel}`,
      date: rec.date.split(' ')[0],
      efficiency: `${rec.fillPct}%`,
      status: 'Tamamlandı' as const,
    }));
  }, [history, hasData]);

  const STATUS_STYLES = {
    'Tamamlandı': 'bg-blue-50 text-blue-700',
    'İşleniyor':  'bg-amber-50 text-amber-600',
    'Bekliyor':   'bg-gray-100 text-gray-500',
  };

  function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setTimeout(() => {
      if (hasData) {
        const header = ['#','Tarih','Konteyner','Doluluk %','Toplam Birim','Yerleştirilen'];
        const rows = history.map((r, i) => [
          history.length - i, r.date, r.containerLabel, r.fillPct, r.itemCount, r.placedCount,
        ]);
        const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'logiflow-rapor.csv'; a.click();
        URL.revokeObjectURL(url);
      }
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }, 800);
  }

  return (
    <AuthGuard><div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <BarChart3 size={15} /> Özellik
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-5 leading-tight">
            Detaylı <span className="text-blue-600">Raporlama</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Kargo operasyonlarınızı gerçek zamanlı verilerle takip edin.
            {hasData ? ` ${history.length} adet optimizasyon kaydınız analiz ediliyor.` : ' Veriler optimizasyon geçmişinizden otomatik alınır.'}
          </p>
        </div>
      </section>

      {/* Dashboard */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* No data banner */}
          {!hasData && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-8 text-sm text-amber-700">
              <Package size={16} className="shrink-0" />
              Henüz optimizasyon geçmişi bulunamadı. Veriler,{' '}
              <Link href="/features/kargo-optimizasyon" className="font-semibold underline">Kargo Optimizasyonu</Link>'nu
              kullandıktan sonra otomatik görünür.
            </div>
          )}

          {/* Period selector */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-gray-400 font-medium">
              <Calendar size={15} /> Dönem:
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {periods.map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                  {p}
                </button>
              ))}
            </div>
            {hasData && (
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                {history.length} optimizasyon · gerçek veri
              </span>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={<FileText size={20} />}      label="Toplam Optimizasyon" value={data.totalYukleme} />
            <StatCard icon={<TrendingUp size={20} />}    label="Ortalama Doluluk"    value={data.verimlilik} />
            <StatCard icon={<BarChart3 size={20} />}     label="Yerleştirilen Birim" value={data.tasarruf} />
            <StatCard icon={<Leaf size={20} />}          label="CO₂ Tasarrufu"       value={data.co2Saved} />
            <StatCard icon={<DollarSign size={20} />}    label="Hacim Başına Maliyet" value={data.costPerM3} />
          </div>

          {/* Bar chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                {hasData ? 'Doluluk Oranı Trendi' : 'Verimlilik Grafiği'}
              </h2>
              <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">{period}</span>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col justify-between text-[10px] text-gray-300 font-medium pb-6 pt-2 select-none">
                <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
              </div>
              <div className="flex-1">
                <BarChart labels={data.labels} values={data.values} />
              </div>
            </div>
          </div>

          {/* CO₂ & cost note */}
          {hasData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Leaf size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800 mb-1">Tahmini CO₂ Tasarrufu</p>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Sektör ortalaması %65 dolulukta çalışırken siz{' '}
                    <span className="font-bold">{data.verimlilik}</span> verimlilik elde ediyorsunuz.
                    Bu fark, dönem başına yaklaşık <span className="font-bold">{data.co2Saved}</span> CO₂ tasarrufu sağlıyor.
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <DollarSign size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800 mb-1">Hacim Başına Maliyet Analizi</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Mevcut doluluk oranınızda tahmini hacim maliyeti{' '}
                    <span className="font-bold">{data.costPerM3}</span>.
                    Doluluk arttıkça birim maliyet düşer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reports table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                {hasData ? 'Optimizasyon Geçmişi' : 'Son Raporlar'}
              </h2>
              <button onClick={handleDownload} disabled={downloading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  downloaded ? 'bg-blue-50 text-blue-700'
                  : downloading ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}>
                <Download size={15} />
                {downloaded ? 'İndirildi ✓' : downloading ? 'Hazırlanıyor...' : hasData ? 'CSV İndir' : 'PDF İndir'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    {['Rapor / Optimizasyon','Tarih','Verimlilik','Durum'].map((h) => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{row.name}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">{row.date}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {row.efficiency !== '—' ? (
                          <span className={`${parseInt(row.efficiency) >= 80 ? 'text-green-600' : parseInt(row.efficiency) >= 60 ? 'text-blue-600' : 'text-orange-500'}`}>
                            {row.efficiency}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature checkmarks */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            {[
              { label: hasData ? 'Gerçek Veri Analizi' : 'Hepsi Bir Arada CSV/PDF', desc: hasData ? 'Tüm optimizasyon geçmişiniz tek tabloda.' : 'Tüm dönem verilerini tek dosyada topla.' },
              { label: 'Grafiksel Analizler', desc: 'Doluluk oranı trendi ve karşılaştırma grafikleri.' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 bg-blue-50 rounded-2xl px-5 py-4 flex-1">
                <CheckCircle2 size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/features/kargo-optimizasyon"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-3.5 rounded-xl transition-colors shadow-sm text-base">
              <TrendingUp size={18} /> Optimizasyona Git
            </Link>
          </div>
        </div>
      </section>
    </div></AuthGuard>
  );
}
