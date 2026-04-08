'use client';

import Link from 'next/link';
import {
  Package, BarChart3, Building2, Share2,
  Zap, FileText, Globe, Box,
  UploadCloud, ChevronRight, Check,
} from 'lucide-react';

const FEATURES = [
  {
    id: 'kargo-optimizasyon',
    title: 'Kargo Optimizasyon',
    highlight: 'Optimizasyon',
    description:
      'Gelişmiş 3D bin-packing algoritmaları ile konteyner ve araç yüklemelerini saniyeler içinde optimize edin. Doluluk oranınızı maksimuma çıkarın, taşıma maliyetlerini düşürün.',
    href: '/features/kargo-optimizasyon',
    icon: Package,
    bullets: ['Süper Hızlı Sonuçlar', 'Optimal Yerleştirme', 'Web Tabanlı', '3D Görünüm'],
    accentFrom: '#2563eb',
    accentTo:   '#7c3aed',
    lightBg:    'bg-blue-50',
    lightText:  'text-blue-600',
    lightBorder:'border-blue-100',
    visual: 'kargo',
  },
  {
    id: 'detayli-raporlama',
    title: 'Detaylı Raporlama',
    highlight: 'Raporlama',
    description:
      'Konteyner kullanımı, kamyon verimliliği ve genel lojistik performansını tek raporla özetleyin. PDF olarak indirin veya paylaşın.',
    href: '/features/detayli-raporlama',
    icon: BarChart3,
    bullets: ['PDF Rapor', 'Grafiksel Analizler', 'Dönemsel Karşılaştırma'],
    accentFrom: '#7c3aed',
    accentTo:   '#db2777',
    lightBg:    'bg-violet-50',
    lightText:  'text-violet-600',
    lightBorder:'border-violet-100',
    visual: 'rapor',
  },
  {
    id: 'yonetme-depolama',
    title: 'Yönetme & Depolama',
    highlight: 'Depolama',
    description:
      'Önceden tanımlı depo alanları, çoklu kargo konteyner yönetimi ve Microsoft Excel içe aktarma ile operasyonlarınızı merkezileştirin.',
    href: '/depolama',
    icon: Building2,
    bullets: ['Çoklu Alan', 'Excel İçe Aktarma', 'Bulut Tabanlı'],
    accentFrom: '#0891b2',
    accentTo:   '#2563eb',
    lightBg:    'bg-sky-50',
    lightText:  'text-sky-600',
    lightBorder:'border-sky-100',
    visual: 'depo',
  },
  {
    id: 'yuk-plani-paylasimi',
    title: 'Yük Planı Paylaşımı',
    highlight: 'Paylaşımı',
    description:
      'Optimize edilmiş yükleme planlarını hesap açmadan tek bir linkle müşterinizle paylaşın. Alıcı planı 3D olarak görüntüler.',
    href: '/features/yuk-plani-paylasimi',
    icon: Share2,
    bullets: ['Hesapsız Erişim', '3D Görünüm', 'Anında Link'],
    accentFrom: '#059669',
    accentTo:   '#0891b2',
    lightBg:    'bg-emerald-50',
    lightText:  'text-emerald-600',
    lightBorder:'border-emerald-100',
    visual: 'paylasim',
  },
];

/* ── Mini visual placeholders per feature ── */
function KargoVisual({ from, to }: { from: string; to: string }) {
  const colors = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316'];
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-[200px]">
        <div className="grid grid-cols-5 gap-1 mb-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-6 rounded-sm opacity-90"
              style={{ background: colors[i % colors.length] }} />
          ))}
        </div>
        <div className="h-2 rounded-full mb-1.5" style={{ background: `linear-gradient(90deg,${from},${to})`, width: '82%' }} />
        <div className="flex justify-between">
          <span className="text-[10px] font-bold" style={{ color: from }}>%82 doluluk</span>
          <span className="text-[10px] text-gray-400">18 kalem</span>
        </div>
      </div>
    </div>
  );
}

function RaporVisual({ from, to }: { from: string; to: string }) {
  const bars = [65, 80, 55, 90, 72, 88, 61];
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-[200px]">
        <div className="flex items-end gap-2 h-24 mb-3">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md transition-all"
              style={{ height: `${h}%`, background: i === 4 ? `linear-gradient(to top,${from},${to})` : '#e5e7eb' }} />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-black" style={{ color: from }}>+24%</p>
            <p className="text-[10px] text-gray-400">bu ay</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-1 rounded-full">
            <FileText className="w-3 h-3" /> PDF
          </div>
        </div>
      </div>
    </div>
  );
}

function DepoVisual({ from, to }: { from: string; to: string }) {
  const areas = [
    { label: 'A Depo', pct: 72 },
    { label: 'B Depo', pct: 45 },
    { label: 'C Depo', pct: 91 },
  ];
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-[200px] space-y-3">
        {areas.map((a, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-semibold text-gray-700">{a.label}</span>
              <span className="text-[11px] font-black" style={{ color: from }}>%{a.pct}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: `linear-gradient(90deg,${from},${to})` }} />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg px-2 py-1.5">
          <UploadCloud className="w-3 h-3" style={{ color: from }} />
          Excel içe aktarıldı
        </div>
      </div>
    </div>
  );
}

function PaylasimVisual({ from, to }: { from: string; to: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-[200px] space-y-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4" style={{ color: from }} />
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate">logiflow.io/plan/abc123</span>
          </div>
          <div className="grid grid-cols-4 gap-0.5">
            {['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#06b6d4','#f97316','#ec4899'].map((c, i) => (
              <div key={i} className="h-5 rounded-sm" style={{ background: c, opacity: 0.85 }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
          <Box className="w-4 h-4" style={{ color: to }} />
          <span className="text-[11px] text-gray-600 dark:text-gray-300">3D görünüm aktif</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );
}

const VISUALS: Record<string, React.ComponentType<{ from: string; to: string }>> = {
  kargo:    KargoVisual,
  rapor:    RaporVisual,
  depo:     DepoVisual,
  paylasim: PaylasimVisual,
};

export default function FeaturesContainer() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-5">
            <Zap className="w-3.5 h-3.5" />
            Özellikler
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-4">
            Lojistiği <span style={{ WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundImage:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'inline' }}>yeniden</span> tanımlayın
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Kargo optimizasyonundan muhasebe takibine kadar tüm operasyonlarınız tek platformda.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => {
            const Icon    = f.icon;
            const Visual  = VISUALS[f.visual];
            const isWide  = i === 0; // first card spans 2 cols on large screens

            return (
              <div
                key={f.id}
                className={`group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col ${isWide ? 'md:col-span-2 md:flex-row' : ''}`}
              >
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg,${f.accentFrom},${f.accentTo})` }} />

                {/* Visual side */}
                <div
                  className={`relative overflow-hidden ${isWide ? 'md:w-1/2 h-64 md:h-auto' : 'h-52'}`}
                  style={{ background: `linear-gradient(135deg,${f.accentFrom}10,${f.accentTo}18)` }}
                >
                  {/* dot pattern */}
                  <div className="absolute inset-0 pointer-events-none opacity-40"
                    style={{ backgroundImage:'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize:'20px 20px' }} />
                  {/* icon badge */}
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: `linear-gradient(135deg,${f.accentFrom},${f.accentTo})` }}>
                    <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                  </div>
                  <Visual from={f.accentFrom} to={f.accentTo} />
                </div>

                {/* Content side */}
                <div className={`flex flex-col justify-between p-7 ${isWide ? 'md:w-1/2' : ''}`}>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5">{f.description}</p>

                    <ul className="space-y-2">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: `${f.accentFrom}18` }}>
                            <Check className="w-2.5 h-2.5" style={{ color: f.accentFrom }} />
                          </div>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={f.href}
                    className="inline-flex items-center gap-1.5 text-sm font-bold mt-7 group/link"
                    style={{ color: f.accentFrom }}>
                    Daha Fazla Bilgi
                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
