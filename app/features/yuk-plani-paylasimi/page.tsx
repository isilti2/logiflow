'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';
import {
  Share2,
  Link as LinkIcon,
  Copy,
  Check,
  CheckCircle2,
  Eye,
  Package,
  ArrowRight,
} from 'lucide-react';

interface CargoRow { name: string; dims: string; qty: number; weight: string; }

const FALLBACK_CARGO: CargoRow[] = [
  { name: 'Koli A', dims: '40x30x20 cm', qty: 5, weight: '2.5 kg' },
  { name: 'Palet B', dims: '120x80x15 cm', qty: 2, weight: '18.0 kg' },
  { name: 'Kutu C', dims: '60x50x40 cm', qty: 3, weight: '7.2 kg' },
  { name: 'Çanta D', dims: '30x25x20 cm', qty: 8, weight: '1.1 kg' },
];

const FEATURES_LIST = [
  { icon: CheckCircle2, text: 'Hesapsız Erişim' },
  { icon: Eye, text: '3D Görünüm' },
];

const STATS = [
  { label: '1 Tıkla Paylaşım', value: '1-Click' },
  { label: 'Hesap Gerekmez', value: '0' },
  { label: 'Anlık Erişim', value: '<1s' },
];

export default function YukPlaniPaylasimi() {
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [cargoRows, setCargoRows] = useState<CargoRow[]>(FALLBACK_CARGO);
  const [fillPct, setFillPct] = useState(84);
  const [containerLabel, setContainerLabel] = useState('40ft Standart Konteyner');
  const [lastDate, setLastDate] = useState('');
  const [totalItems, setTotalItems] = useState(FALLBACK_CARGO.reduce((s, r) => s + r.qty, 0));
  const [hasRealData, setHasRealData] = useState(false);

  useEffect(() => {
    fetch('/api/optimizations')
      .then((r) => r.ok ? r.json() : [])
      .then((opts: { date: string; containerLabel: string; fillPct: number; itemCount: number }[]) => {
        if (opts.length > 0) {
          const last = opts[0];
          setContainerLabel(last.containerLabel);
          setFillPct(last.fillPct);
          setTotalItems(last.itemCount);
          setLastDate(last.date);
          setHasRealData(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleGenerateLink() {
    try {
      const optsRes = await fetch('/api/optimizations');
      const opts = optsRes.ok ? await optsRes.json() as { date: string; containerLabel: string; fillPct: number; itemCount: number }[] : [];
      const lastRun = opts[0];
      const rows: CargoRow[] = FALLBACK_CARGO;
      const shareData = {
        containerLabel: lastRun?.containerLabel ?? 'Özel Konteyner',
        fillPct: lastRun?.fillPct ?? 84,
        totalWeight: lastRun?.itemCount ?? rows.reduce((s, r) => s + r.qty, 0),
        date: lastRun?.date ?? new Date().toLocaleDateString('tr-TR'),
        items: rows,
      };
      const token = btoa(encodeURIComponent(JSON.stringify(shareData)));
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
      setCargoRows(rows);
      setFillPct(shareData.fillPct);
      setContainerLabel(shareData.containerLabel);
    } catch {
      const token = btoa(JSON.stringify({ containerLabel: 'Özel', fillPct: 84, items: FALLBACK_CARGO, date: new Date().toLocaleDateString('tr-TR') }));
      setShareUrl(`${window.location.origin}/share/${token}`);
    }
    setLinkGenerated(true);
  }

  async function handleCopy() {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(shareUrl);
    } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AuthGuard><main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950 dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-10">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Anasayfa
            </Link>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300 font-medium">Yük Planı Paylaşımı</span>
          </div>

          {/* Hero Content */}
          <div className="max-w-2xl">
            <div className="inline-block w-8 h-1 bg-blue-600 rounded mb-6" />
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
              Yük Planı{' '}
              <span className="text-blue-600">Paylaşımı</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg leading-relaxed">
              Optimize edilmiş konteyner düzenlemelerinizi tek tıkla ekip arkadaşlarınız,
              müşterileriniz veya lojistik ortaklarınızla paylaşın. Hesap açmadan anında
              erişim, tam 3D görünüm desteğiyle.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Share Demo */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Left: Load Plan Card + Share Controls */}
            <div className="flex flex-col gap-6">

              {/* Load Plan Card */}
              <div className="bg-white border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {hasRealData ? 'Son Optimizasyon' : 'İstanbul → Ankara #2847'}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{containerLabel}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                    {lastDate || '27 Mart 2026'}
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-6 mb-5 text-sm text-gray-600 dark:text-gray-300">
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> kalem kargo
                  </span>
                  <span className="flex items-center gap-1">
                    Doluluk:{' '}
                    <span className="font-semibold text-blue-700 ml-1">{fillPct}%</span>
                  </span>
                </div>

                {/* Mini bar visualization */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                    <span>Konteyner Kullanımı</span>
                    <span>84 / 100 m³</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-sm ${
                          i < Math.round(fillPct / 10) ? 'bg-blue-500' : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Generate Link Button */}
                {!linkGenerated ? (
                  <button
                    onClick={handleGenerateLink}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-sm shadow-blue-100"
                  >
                    <Share2 className="w-4 h-4" />
                    Paylaşım Linki Oluştur
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Link input + Copy */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                      <LinkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                      <span className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate font-mono">
                        {shareUrl}
                      </span>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0 ${
                          copied
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-500 hover:text-blue-700'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Kopyalandı ✓
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Kopyala
                          </>
                        )}
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hesapsız Erişim
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                        <Eye className="w-3.5 h-3.5" />
                        3D Görünüm
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Checkmarks */}
              <div className="flex flex-col gap-3">
                {FEATURES_LIST.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Shared View Preview */}
            <div>
              {linkGenerated ? (
                <div className="bg-white border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  {/* Preview header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Paylaşılan Görünüm
                    </span>
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 bg-white border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">
                      Salt Okunur
                    </span>
                  </div>

                  {/* Plan summary in preview */}
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Yük Planı</p>
                    <p className="font-bold text-gray-900 dark:text-white">LogiFlow Yük Planı</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">
                      {containerLabel} · {new Date().toLocaleDateString('tr-TR')}
                    </p>
                  </div>

                  {/* Cargo table */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                      Kargo Listesi
                    </p>
                    <div className="flex flex-col gap-0">
                      {/* Table header */}
                      <div className="grid grid-cols-4 text-xs font-semibold text-gray-400 dark:text-gray-500 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <span>İsim</span>
                        <span>Boyutlar</span>
                        <span className="text-center">Adet</span>
                        <span className="text-right">Ağırlık</span>
                      </div>
                      {/* Table rows */}
                      {cargoRows.map((item, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-4 text-sm py-2.5 border-b border-gray-50 last:border-0"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                          <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs self-center">
                            {item.dims}
                          </span>
                          <span className="text-center text-gray-700 dark:text-gray-200 font-semibold">
                            x{item.qty}
                          </span>
                          <span className="text-right text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs self-center">
                            {item.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview footer */}
                  <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      LogiFlow tarafından paylaşıldı
                    </span>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      3D Görünümü Aç →
                    </a>
                  </div>
                </div>
              ) : (
                /* Placeholder before link is generated */
                <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
                  <div className="w-14 h-14 bg-white border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center shadow-sm">
                    <Share2 className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-400 dark:text-gray-500 text-sm">Önizleme</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Link oluşturduktan sonra alıcı görünümü burada görünecek
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STATS.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-8"
              >
                <span className="text-3xl font-black text-blue-600">{value}</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Planlarınızı Anında{' '}
            <span className="text-blue-600">Paylaşmaya</span> Başlayın
          </h2>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Hesap açmaya gerek yok. Tek link, tam erişim.
          </p>
          <Link
            href="/features/kargo-optimizasyon"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-sm shadow-blue-100 text-lg"
          >
            Uygulamaya Git
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main></AuthGuard>
  );
}
