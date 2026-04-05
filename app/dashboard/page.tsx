'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import {
  Package, BarChart3, Building2, Share2,
  LogOut, TrendingUp, Truck, Clock, ChevronRight, Shield,
  Zap, Box, Calculator, Navigation,
} from 'lucide-react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import OnboardingWizard from '@/components/ui/OnboardingWizard';
import NotificationBell from '@/components/ui/NotificationBell';

const APP_FEATURES = [
  {
    id: 'kargo-optimizasyon',
    title: 'Kargo Optimizasyon',
    description: '3D bin-packing algoritması ile konteyner ve araç yüklemelerini optimize edin.',
    icon: Package,
    href: '/features/kargo-optimizasyon',
    color: 'blue',
    badge: 'Popüler',
  },
  {
    id: 'detayli-raporlama',
    title: 'Detaylı Raporlama',
    description: 'Haftalık, aylık ve yıllık bazda lojistik performansınızı analiz edin.',
    icon: BarChart3,
    href: '/features/detayli-raporlama',
    color: 'purple',
    badge: null,
  },
  {
    id: 'yonetme-depolama',
    title: 'Yönetme & Depolama',
    description: 'Birden fazla depo alanını ve kargo stoğunuzu merkezi olarak yönetin.',
    icon: Building2,
    href: '/depolama',
    color: 'indigo',
    badge: 'Yeni',
  },
  {
    id: 'yuk-plani-paylasimi',
    title: 'Yük Planı Paylaşımı',
    description: 'Optimize edilmiş yük planlarını tek tıkla paylaşın, hesap gerekmez.',
    icon: Share2,
    href: '/features/yuk-plani-paylasimi',
    color: 'sky',
    badge: null,
  },
  {
    id: 'muhasebe',
    title: 'Lojistik Muhasebe',
    description: 'Sefer takibi, gelir-gider, cari hesap ve personel puantajı tek ekranda.',
    icon: Calculator,
    href: '/muhasebe',
    color: 'green',
    badge: 'Yeni',
  },
  {
    id: 'konum',
    title: 'Canlı Konum Takibi',
    description: 'Şoförler telefonda konum paylaşır, harita üzerinde anlık takip.',
    icon: Navigation,
    href: '/konum',
    color: 'teal',
    badge: 'Yeni',
  },
];

interface OptRecord {
  id: string;
  date: string;
  containerLabel: string;
  fillPct: number;
  itemCount: number;
  placedCount: number;
}

interface AreaInfo {
  id: string;
  name: string;
  capacity: number;
  count: number;
  pct: number;
}

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300 hover:shadow-blue-50',
  purple: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300 hover:shadow-purple-50',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-50',
  sky:   'bg-sky-50 text-sky-600 border-sky-100 hover:border-sky-300 hover:shadow-sky-50',
  green: 'bg-green-50 text-green-600 border-green-100 hover:border-green-300 hover:shadow-green-50',
  teal:  'bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300 hover:shadow-teal-50',
};

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin]   = useState(false);
  const [stats, setStats]       = useState([
    { label: 'Toplam Optimizasyon', value: '0',  delta: 'henüz yok',       icon: TrendingUp },
    { label: 'Aktif Kargo',         value: '0',  delta: 'depolarınızda',   icon: Package },
    { label: 'Aktif Depo Alanı',    value: '0',  delta: 'tanımlı alan',    icon: Building2 },
    { label: 'Son Aktivite',        value: '—',  delta: 'henüz işlem yok', icon: Clock },
  ]);
  const [recentOpts, setRecentOpts] = useState<OptRecord[]>([]);
  const [lastOpt, setLastOpt]       = useState<OptRecord | null>(null);
  const [areaInfos, setAreaInfos]   = useState<AreaInfo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [netError, setNetError]     = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [meRes, optsRes, areasRes, cargoRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/optimizations'),
          fetch('/api/depot-areas'),
          fetch('/api/cargo'),
        ]);

        if (meRes.status === 401) { router.replace('/login'); return; }

        const me     = await meRes.json();
        const opts   = optsRes.ok   ? await optsRes.json()   : [];
        const areas  = areasRes.ok  ? await areasRes.json()  : [];
        const cargo  = cargoRes.ok  ? await cargoRes.json()  : [];

        setUserName(me.name ?? me.email ?? '');
        setIsAdmin(me.role === 'admin');

        const lastDate = opts[0]?.date ?? '—';
        setStats([
          { label: 'Toplam Optimizasyon', value: String(opts.length),   delta: opts.length ? 'toplam çalıştırıldı' : 'henüz yok',    icon: TrendingUp },
          { label: 'Aktif Kargo',         value: String(cargo.length),  delta: 'depolarınızda',                                       icon: Package },
          { label: 'Aktif Depo Alanı',    value: String(areas.length),  delta: areas.length ? 'tanımlı alan' : 'alan eklenmemiş',    icon: Building2 },
          { label: 'Son Optimizasyon',    value: opts.length ? String(opts.length) + '. çalışma' : '—', delta: lastDate,             icon: Clock },
        ]);

        setRecentOpts(opts.slice(0, 5));
        setLastOpt(opts[0] ?? null);

        const infos: AreaInfo[] = areas.map((a: { id: string; name: string; capacity: number }) => {
          const count = cargo.filter((c: { areaId: string }) => c.areaId === a.id).length;
          const pct   = Math.min(100, Math.round((count / Math.max(a.capacity, 1)) * 100));
          return { id: a.id, name: a.name, capacity: a.capacity, count, pct };
        });
        setAreaInfos(infos);
      } catch {
        setNetError('Sunucuya bağlanılamadı. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  const userInitial = userName ? userName[0].toUpperCase() : '?';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Skeleton topbar */}
        <header className="bg-white border-b border-gray-100 h-16" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Skeleton welcome */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          {/* Skeleton stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
                <div className="w-11 h-11 bg-gray-100 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {netError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ErrorAlert message={netError} onDismiss={() => setNetError('')} />
        </div>
      )}
      <OnboardingWizard />

      {/* App topbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-black text-xs">LF</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {APP_FEATURES.map((f) => (
              <Link
                key={f.id}
                href={f.href}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {f.title.split(' ')[0]}
              </Link>
            ))}
            <Link href="/takim" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Takım
            </Link>
            <Link href="/api-keys" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              API
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/profil" className="hidden sm:flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 hover:border-blue-200 transition-colors">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">{userInitial}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{userName || 'Hesabım'}</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-xl transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              aria-label="Çıkış yap"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Hoş geldiniz{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">Bugün ne optimize etmek istersiniz?</p>
          </div>
          <Link
            href="/features/kargo-optimizasyon"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Package className="w-4 h-4" />
            Yeni Optimizasyon
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, delta, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">{label}</span>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{delta}</p>
            </div>
          ))}
        </div>

        {/* Getting started — only when no data yet */}
        {recentOpts.length === 0 && areaInfos.length === 0 && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Başlangıç Rehberi</p>
                <h2 className="text-xl font-black">3 adımda hazır olun</h2>
              </div>
              <Zap className="w-8 h-8 text-blue-300 shrink-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '1', title: 'Depo Alanı Ekle', desc: 'Stoğunuzu tutacak depo alanı tanımlayın.', href: '/depolama', cta: 'Depoya Git' },
                { step: '2', title: 'Kargo Girin',     desc: 'Boyut ve ağırlık bilgileriyle kargo ekleyin.', href: '/depolama', cta: 'Kargo Ekle' },
                { step: '3', title: 'Optimize Et',     desc: '3D algoritma ile yükleme planınızı oluşturun.', href: '/features/kargo-optimizasyon', cta: 'Optimizasyon' },
              ].map(({ step, title, desc, href, cta }) => (
                <Link key={step} href={href}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors group">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-xs font-black mb-3">{step}</div>
                  <p className="font-bold text-sm mb-1">{title}</p>
                  <p className="text-blue-200 text-xs leading-relaxed mb-3">{desc}</p>
                  <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors flex items-center gap-1">
                    {cta} <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Feature cards */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Uygulamalar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {APP_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const colors = COLOR_MAP[feature.color];
              const [iconBg, iconText] = colors.split(' ');
              return (
                <Link
                  key={feature.id}
                  href={feature.href}
                  className={`group flex flex-col gap-4 p-5 bg-white rounded-2xl border hover:shadow-md transition-all duration-200 ${colors.split(' ').slice(2).join(' ')}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${iconText}`} />
                    </div>
                    {feature.badge && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${iconBg} ${iconText}`}>
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5">{feature.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{feature.description}</p>
                  </div>
                  <span className={`text-xs font-semibold ${iconText} flex items-center gap-1 mt-auto`}>
                    Aç <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Widgets row: last opt + depo status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Son Optimizasyon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Son Optimizasyon</h2>
              <Link href="/opt-gecmisi" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                Tümü <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {lastOpt ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Box className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{lastOpt.containerLabel}</p>
                    <p className="text-xs text-gray-400">{lastOpt.date}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Doluluk</span>
                    <span className={`font-bold ${lastOpt.fillPct >= 80 ? 'text-emerald-600' : lastOpt.fillPct >= 60 ? 'text-blue-600' : 'text-amber-500'}`}>
                      %{lastOpt.fillPct}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${lastOpt.fillPct >= 80 ? 'bg-emerald-500' : lastOpt.fillPct >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                      style={{ width: `${lastOpt.fillPct}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{lastOpt.itemCount} kargo</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-emerald-500" />{lastOpt.placedCount} yerleşti</span>
                  {lastOpt.itemCount - lastOpt.placedCount > 0 && (
                    <span className="text-amber-500">{lastOpt.itemCount - lastOpt.placedCount} sığmadı</span>
                  )}
                </div>
                {recentOpts.length > 1 && (
                  <div className="pt-2 border-t border-gray-50">
                    <p className="text-[11px] text-gray-400 mb-2">Son {recentOpts.length} çalışma</p>
                    <div className="flex items-end gap-1 h-8">
                      {recentOpts.slice().reverse().map((r, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${r.fillPct >= 80 ? 'bg-emerald-400' : r.fillPct >= 60 ? 'bg-blue-400' : 'bg-amber-300'}`}
                          style={{ height: `${Math.max(20, r.fillPct)}%` }}
                          title={`%${r.fillPct} — ${r.date}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={Box}
                title="Henüz optimizasyon yok"
                description="İlk yükleme planınızı oluşturun ve doluluk oranınızı burada takip edin."
                action={{ label: 'İlk Optimizasyonu Yap', href: '/features/kargo-optimizasyon' }}
              />
            )}
          </div>

          {/* Depo Durumu */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Depo Durumu</h2>
              <Link href="/depolama" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                Yönet <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {areaInfos.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Depo alanı yok"
                description="Kargo stoğunuzu takip etmek için bir depo alanı tanımlayın."
                action={{ label: 'Depo Ekle', href: '/depolama' }}
              />
            ) : (
              <div className="space-y-3">
                {areaInfos.map((a) => {
                  const barColor = a.pct >= 90 ? 'bg-red-400' : a.pct >= 70 ? 'bg-amber-400' : 'bg-blue-500';
                  const textColor = a.pct >= 90 ? 'text-red-500' : a.pct >= 70 ? 'text-amber-500' : 'text-blue-600';
                  return (
                    <div key={a.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[60%]">{a.name}</span>
                        <span className={`text-xs font-bold ${textColor}`}>
                          {a.count}/{a.capacity} · %{a.pct}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${a.pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent optimizations table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Son Optimizasyonlar</h2>
            <Link href="/opt-gecmisi" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {recentOpts.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="Henüz optimizasyon yapılmadı"
                description="3D bin-packing algoritmasıyla ilk yükleme planınızı oluşturduğunuzda burada görüntülenecek."
                action={{ label: 'Optimizasyona Git', href: '/features/kargo-optimizasyon' }}
                secondaryAction={{ label: 'Nasıl çalışır?', href: '/docs' }}
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Konteyner', 'Doluluk', 'Kargo', 'Tarih'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOpts.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{r.containerLabel}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${r.fillPct >= 80 ? 'bg-emerald-500' : r.fillPct >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`} style={{ width: `${r.fillPct}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${r.fillPct >= 80 ? 'text-emerald-600' : r.fillPct >= 60 ? 'text-blue-600' : 'text-amber-500'}`}>%{r.fillPct}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{r.placedCount}/{r.itemCount}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Usage analytics — only when there's data */}
        {recentOpts.length > 0 && (() => {
          const avgFill = Math.round(recentOpts.reduce((s, r) => s + r.fillPct, 0) / recentOpts.length);
          const totalPlaced = recentOpts.reduce((s, r) => s + r.placedCount, 0);
          const totalItems = recentOpts.reduce((s, r) => s + r.itemCount, 0);
          const efficiency = totalItems > 0 ? Math.round((totalPlaced / totalItems) * 100) : 0;
          const savedSpace = Math.max(0, avgFill - 70); // compared to 70% baseline
          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">Performans Özeti</h2>
                <Link href="/opt-gecmisi" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Tüm geçmiş <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Ort. Doluluk',      value: `%${avgFill}`,        color: avgFill >= 80 ? 'text-emerald-600' : avgFill >= 60 ? 'text-blue-600' : 'text-amber-500', desc: 'son çalışmalar' },
                  { label: 'Yerleştirme Oranı', value: `%${efficiency}`,     color: 'text-blue-600',    desc: 'kargo başarısı' },
                  { label: 'Toplam Kargo',      value: String(totalItems),   color: 'text-gray-900',    desc: 'işlenen kalem' },
                  { label: 'Alan Tasarrufu',    value: `+%${savedSpace}`,    color: 'text-emerald-600', desc: 'bazeline göre' },
                ].map(({ label, value, color, desc }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-xs font-semibold text-gray-700 mt-1">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Quick access truck banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Yeni bir yükleme mi planlıyorsunuz?</h3>
              <p className="text-blue-200 text-sm mt-0.5">Konteyner boyutlarını girin, kargonuzu listeleyin, planı saniyeler içinde alın.</p>
            </div>
          </div>
          <Link
            href="/features/kargo-optimizasyon"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Optimizörü Aç <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}
