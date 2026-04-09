'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';
import {
  BarChart3, Zap, TrendingUp, Package, Trash2,
  ChevronRight, AlertCircle, Clock, Box, FileDown,
} from 'lucide-react';

interface OptRecord {
  id: string;
  date: string;
  containerLabel: string;
  fillPct: number;
  itemCount: number;
  placedCount: number;
}

function FillBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-9 text-right ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-blue-600' : 'text-amber-500'}`}>
        %{pct}
      </span>
    </div>
  );
}

export default function OptGecmisiPage() {
  const [history, setHistory] = useState<OptRecord[]>([]);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'fill_desc' | 'fill_asc'>('newest');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    fetch('/api/optimizations')
      .then((r) => r.ok ? r.json() : [])
      .then(setHistory);
  }, []);

  async function deleteRecord(id: string) {
    await fetch(`/api/optimizations?id=${id}`, { method: 'DELETE' });
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }

  async function clearAll() {
    await fetch('/api/optimizations', { method: 'DELETE' });
    setHistory([]);
    setConfirmClear(false);
  }

  const sorted = [...history].sort((a, b) => {
    if (sort === 'fill_desc') return b.fillPct - a.fillPct;
    if (sort === 'fill_asc') return a.fillPct - b.fillPct;
    if (sort === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    return new Date(b.date).getTime() - new Date(a.date).getTime(); // newest
  });

  const avgFill = history.length ? Math.round(history.reduce((s, r) => s + r.fillPct, 0) / history.length) : 0;
  const bestFill = history.length ? Math.max(...history.map((r) => r.fillPct)) : 0;
  const totalItems = history.reduce((s, r) => s + r.itemCount, 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />

        {/* Header */}
        <div className="bg-white border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                Optimizasyon <span className="text-blue-600">Geçmişi</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                Geçmiş kargo paketleme sonuçlarınız ve istatistikler.
              </p>
            </div>
            <div className="flex items-center gap-2">
            <a
              href="/api/optimizations/export"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-600 text-gray-600 dark:text-gray-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <FileDown className="w-4 h-4" />
              PDF Rapor
            </a>
            <Link
              href="/features/kargo-optimizasyon"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Zap className="w-4 h-4" />
              Yeni Optimizasyon
            </Link>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <BarChart3 className="w-5 h-5" />, label: 'Toplam Çalıştırma', value: history.length },
              { icon: <TrendingUp className="w-5 h-5" />, label: 'Ortalama Doluluk', value: history.length ? `%${avgFill}` : '—' },
              { icon: <Zap className="w-5 h-5" />, label: 'En İyi Doluluk', value: history.length ? `%${bestFill}` : '—' },
              { icon: <Package className="w-5 h-5" />, label: 'Toplam Kargo', value: totalItems },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-3 shadow-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          {history.length > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="fill_desc">Doluluk (Yüksek → Düşük)</option>
                <option value="fill_asc">Doluluk (Düşük → Yüksek)</option>
              </select>

              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 font-medium">Tüm geçmiş silinsin mi?</span>
                  <button onClick={clearAll} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
                    Evet, Sil
                  </button>
                  <button onClick={() => setConfirmClear(false)} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    İptal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 border border-gray-200 dark:border-gray-700 hover:border-red-200 px-3 py-2 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Geçmişi Temizle
                </button>
              )}
            </div>
          )}

          {/* List */}
          {history.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <AlertCircle className="w-10 h-10 mb-3" />
              <p className="text-sm font-semibold">Henüz optimizasyon yapılmadı.</p>
              <p className="text-xs mt-1">Kargo optimizasyonu sayfasından başlayın.</p>
              <Link href="/features/kargo-optimizasyon" className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Optimizasyona Git <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((rec, i) => {
                const unplaced = rec.itemCount - rec.placedCount;
                return (
                  <div key={rec.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-4 flex items-center gap-5 group hover:border-blue-100 transition-colors">
                    {/* Rank badge */}
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {i + 1}
                    </div>

                    {/* Container icon */}
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Box className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{rec.containerLabel}</span>
                        {unplaced > 0 && (
                          <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full">
                            {unplaced} yerleştirilmedi
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3" />
                        {rec.date}
                        <span className="mx-1">·</span>
                        <Package className="w-3 h-3" />
                        {rec.itemCount} kargo, {rec.placedCount} yerleşti
                      </div>
                    </div>

                    {/* Fill bar */}
                    <div className="w-36 flex-shrink-0">
                      <FillBar pct={rec.fillPct} />
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteRecord(rec.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                      aria-label="Kaydı sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer note */}
          {history.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
              Son {history.length} optimizasyon gösteriliyor · Maksimum 50 kayıt saklanır.
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
