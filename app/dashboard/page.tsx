'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import {
  Package, BarChart3, Building2, Share2,
  LogOut, TrendingUp, Truck, Clock, ChevronRight, Shield,
  Zap, Box, Calculator, Navigation,
  ArrowUpRight, Activity, Layers,
} from 'lucide-react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import OnboardingWizard from '@/components/ui/OnboardingWizard';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/charts/DashboardCharts'), { ssr: false });

const APP_MODULES = [
  {
    id: 'kargo-optimizasyon',
    title: 'Kargo Optimizasyon',
    description: '3D bin-packing ile konteyner yüklemelerini optimize edin.',
    icon: Package,
    href: '/features/kargo-optimizasyon',
    badge: 'Popüler',
    gradient: 'from-blue-500 to-blue-700',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-100',
    hoverShadow: 'hover:shadow-blue-100',
    ring: 'ring-blue-200',
  },
  {
    id: 'detayli-raporlama',
    title: 'Detaylı Raporlama',
    description: 'Haftalık, aylık ve yıllık lojistik performans analizi.',
    icon: BarChart3,
    href: '/features/detayli-raporlama',
    badge: null,
    gradient: 'from-violet-500 to-purple-700',
    lightBg: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-100',
    hoverShadow: 'hover:shadow-violet-100',
    ring: 'ring-violet-200',
  },
  {
    id: 'yonetme-depolama',
    title: 'Yönetme & Depolama',
    description: 'Depo alanlarını ve kargo stoğunu merkezi yönetin.',
    icon: Building2,
    href: '/depolama',
    badge: 'Yeni',
    gradient: 'from-indigo-500 to-indigo-700',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-100',
    hoverShadow: 'hover:shadow-indigo-100',
    ring: 'ring-indigo-200',
  },
  {
    id: 'yuk-plani-paylasimi',
    title: 'Yük Planı Paylaşımı',
    description: 'Optimize edilmiş planları tek tıkla paylaşın.',
    icon: Share2,
    href: '/features/yuk-plani-paylasimi',
    badge: null,
    gradient: 'from-sky-500 to-cyan-700',
    lightBg: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-100',
    hoverShadow: 'hover:shadow-sky-100',
    ring: 'ring-sky-200',
  },
  {
    id: 'muhasebe',
    title: 'Lojistik Muhasebe',
    description: 'Sefer, gelir-gider, cari hesap ve puantaj tek ekranda.',
    icon: Calculator,
    href: '/muhasebe',
    badge: 'Yeni',
    gradient: 'from-emerald-500 to-green-700',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    hoverShadow: 'hover:shadow-emerald-100',
    ring: 'ring-emerald-200',
  },
  {
    id: 'konum',
    title: 'Canlı Konum Takibi',
    description: 'Şoförler konum paylaşır, haritada anlık takip yapın.',
    icon: Navigation,
    href: '/konum',
    badge: 'Yeni',
    gradient: 'from-teal-500 to-teal-700',
    lightBg: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-100',
    hoverShadow: 'hover:shadow-teal-100',
    ring: 'ring-teal-200',
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin]   = useState(false);
  const [stats, setStats]       = useState([
    { label: 'Toplam Optimizasyon', value: '0',  sub: 'henüz yok',       icon: TrendingUp, color: 'blue' },
    { label: 'Aktif Kargo',         value: '0',  sub: 'depolarınızda',   icon: Package,    color: 'violet' },
    { label: 'Aktif Depo',          value: '0',  sub: 'tanımlı alan',    icon: Building2,  color: 'indigo' },
    { label: 'Son Aktivite',        value: '—',  sub: 'henüz işlem yok', icon: Clock,      color: 'emerald' },
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

        const me    = await meRes.json();
        const opts  = optsRes.ok  ? await optsRes.json()  : [];
        const areas = areasRes.ok ? await areasRes.json() : [];
        const cargo = cargoRes.ok ? await cargoRes.json() : [];

        setUserName(me.name ?? me.email ?? '');
        setIsAdmin(me.role === 'admin');

        const lastDate = opts[0]?.date ?? '—';
        setStats([
          { label: 'Toplam Optimizasyon', value: String(opts.length),  sub: opts.length ? 'toplam çalışma'  : 'henüz yok',   icon: TrendingUp, color: 'blue' },
          { label: 'Aktif Kargo',         value: String(cargo.length), sub: 'depolarınızda',                                  icon: Package,    color: 'violet' },
          { label: 'Aktif Depo',          value: String(areas.length), sub: areas.length ? 'tanımlı alan'   : 'alan yok',    icon: Building2,  color: 'indigo' },
          { label: 'Son Aktivite',        value: opts.length ? `${opts.length}. çalışma` : '—', sub: lastDate,               icon: Clock,      color: 'emerald' },
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
  const greeting    = getGreeting();

  const statColorMap: Record<string, { bg: string; text: string; border: string; ring: string }> = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100',    ring: 'ring-blue-200' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-100',  ring: 'ring-violet-200' },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-100',  ring: 'ring-indigo-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', ring: 'ring-emerald-200' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 h-16 sticky top-0 z-40" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-7 w-52 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                </div>
                <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-gray-950">
      {netError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ErrorAlert message={netError} onDismiss={() => setNetError('')} />
        </div>
      )}
      <OnboardingWizard />

      {/* ── Topbar ── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
              <span className="text-white font-black text-xs">LF</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {[
              { href: '/features/kargo-optimizasyon', label: 'Optimizasyon' },
              { href: '/depolama',                    label: 'Depolama' },
              { href: '/muhasebe',                    label: 'Muhasebe' },
              { href: '/konum',                       label: 'Konum' },
              { href: '/sofor',                       label: 'Şoförler' },
              { href: '/takim',                       label: 'Takım' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />

            <Link href="/profil"
              className="hidden sm:flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                {userInitial}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">{userName || 'Hesabım'}</span>
            </Link>

            {isAdmin && (
              <Link href="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-xl transition-colors">
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}

            <button onClick={handleLogout} aria-label="Çıkış yap"
              className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800 p-2 rounded-xl transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Welcome banner ── */}
        <div className="relative overflow-hidden rounded-3xl p-7"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)' }}>
          {/* grid pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
          {/* glow */}
          <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">
                {greeting}{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Bugün ne optimize<br className="hidden sm:block" /> etmek istersiniz?
              </h1>
              <p className="text-blue-200/80 text-sm mt-2">
                Lojistik operasyonlarınız tek ekranda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/features/kargo-optimizasyon"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/30">
                <Package className="w-4 h-4" />
                Yeni Optimizasyon
              </Link>
              <Link href="/muhasebe"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all border border-white/20">
                <Calculator className="w-4 h-4" />
                Muhasebe
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, sub, icon: Icon, color }) => {
            const c = statColorMap[color];
            return (
              <div key={label}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-snug pr-2">{label}</p>
                  <div className={`w-9 h-9 ${c.bg} ${c.border} border rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${c.text}`} style={{ width: 18, height: 18 }} />
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Charts ── */}
        <DashboardCharts />

        {/* ── Getting started (empty state) ── */}
        {recentOpts.length === 0 && areaInfos.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-7">
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Başlangıç Rehberi</p>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">3 adımda hazır olun</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: '01', title: 'Depo Alanı Ekle', desc: 'Stoğunuzu tutacak depo alanı tanımlayın.', href: '/depolama',                      cta: 'Depoya Git',    accent: 'bg-blue-100 text-blue-700' },
                  { step: '02', title: 'Kargo Girin',     desc: 'Boyut ve ağırlık bilgileriyle kargo ekleyin.', href: '/depolama',                   cta: 'Kargo Ekle',    accent: 'bg-indigo-100 text-indigo-700' },
                  { step: '03', title: 'Optimize Et',     desc: '3D algoritma ile yükleme planınızı oluşturun.', href: '/features/kargo-optimizasyon', cta: 'Optimizasyon',  accent: 'bg-violet-100 text-violet-700' },
                ].map(({ step, title, desc, href, cta, accent }) => (
                  <Link key={step} href={href}
                    className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 rounded-2xl p-5 hover:shadow-md transition-all duration-200">
                    <div className={`w-8 h-8 ${accent} rounded-xl flex items-center justify-center text-xs font-black mb-4`}>{step}</div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">{title}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4">{desc}</p>
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      {cta} <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Module grid ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-400" />
              Uygulamalar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {APP_MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <Link key={m.id} href={m.href}
                  className={`group relative bg-white dark:bg-gray-900 border ${m.borderColor} dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg ${m.hoverShadow} hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col gap-4`}>
                  {/* subtle gradient top accent */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${m.lightBg} rounded-2xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${m.textColor}`} />
                    </div>
                    {m.badge && (
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${m.lightBg} ${m.textColor}`}>
                        {m.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{m.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{m.description}</p>
                  </div>

                  <span className={`text-sm font-semibold ${m.textColor} flex items-center gap-1.5 group-hover:gap-2.5 transition-all`}>
                    Aç <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Widgets row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Son Optimizasyon */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Son Optimizasyon
              </h2>
              <Link href="/opt-gecmisi" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors">
                Tümü <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {lastOpt ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Box className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{lastOpt.containerLabel}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{lastOpt.date}</p>
                  </div>
                  <span className={`text-sm font-black ${lastOpt.fillPct >= 80 ? 'text-emerald-600' : lastOpt.fillPct >= 60 ? 'text-blue-600' : 'text-amber-500'}`}>
                    %{lastOpt.fillPct}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Doluluk oranı</span>
                    <span className="font-semibold">{lastOpt.placedCount}/{lastOpt.itemCount} kargo</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${lastOpt.fillPct >= 80 ? 'bg-emerald-500' : lastOpt.fillPct >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                      style={{ width: `${lastOpt.fillPct}%` }} />
                  </div>
                </div>
                {recentOpts.length > 1 && (
                  <div className="pt-3 border-t border-gray-50">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2 font-medium">Son {recentOpts.length} çalışma</p>
                    <div className="flex items-end gap-1 h-10">
                      {recentOpts.slice().reverse().map((r, i) => (
                        <div key={i}
                          className={`flex-1 rounded-sm ${r.fillPct >= 80 ? 'bg-emerald-400' : r.fillPct >= 60 ? 'bg-blue-400' : 'bg-amber-300'}`}
                          style={{ height: `${Math.max(20, r.fillPct)}%` }}
                          title={`%${r.fillPct} — ${r.date}`} />
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Depo Durumu
              </h2>
              <Link href="/depolama" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors">
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
              <div className="space-y-4">
                {areaInfos.map((a) => {
                  const barColor  = a.pct >= 90 ? 'bg-red-400'  : a.pct >= 70 ? 'bg-amber-400'  : 'bg-indigo-500';
                  const textColor = a.pct >= 90 ? 'text-red-500' : a.pct >= 70 ? 'text-amber-500' : 'text-indigo-600';
                  return (
                    <div key={a.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[60%]">{a.name}</span>
                        <span className={`text-xs font-black ${textColor}`}>
                          {a.count}/{a.capacity} · %{a.pct}
                        </span>
                      </div>
                      <div className="h-2 bg-white dark:bg-gray-700 rounded-full overflow-hidden border border-gray-100 dark:border-gray-600">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${a.pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent optimizations table ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-900 dark:text-white">Son Optimizasyonlar</h2>
            <Link href="/opt-gecmisi" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
              Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
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
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    {['Konteyner', 'Doluluk', 'Kargo', 'Tarih'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {recentOpts.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">{r.containerLabel}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${r.fillPct >= 80 ? 'bg-emerald-500' : r.fillPct >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                              style={{ width: `${r.fillPct}%` }} />
                          </div>
                          <span className={`text-xs font-black ${r.fillPct >= 80 ? 'text-emerald-600' : r.fillPct >= 60 ? 'text-blue-600' : 'text-amber-500'}`}>
                            %{r.fillPct}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs font-medium">{r.placedCount}/{r.itemCount}</td>
                      <td className="px-5 py-4 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Performance summary ── */}
        {recentOpts.length > 0 && (() => {
          const avgFill     = Math.round(recentOpts.reduce((s, r) => s + r.fillPct, 0) / recentOpts.length);
          const totalPlaced = recentOpts.reduce((s, r) => s + r.placedCount, 0);
          const totalItems  = recentOpts.reduce((s, r) => s + r.itemCount, 0);
          const efficiency  = totalItems > 0 ? Math.round((totalPlaced / totalItems) * 100) : 0;
          const savedSpace  = Math.max(0, avgFill - 70);
          return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900 dark:text-white">Performans Özeti</h2>
                <Link href="/opt-gecmisi" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-semibold">
                  Tüm geçmiş <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Ort. Doluluk',      value: `%${avgFill}`,      valueColor: avgFill >= 80 ? 'text-emerald-600' : avgFill >= 60 ? 'text-blue-600' : 'text-amber-500', bg: 'bg-gray-50 dark:bg-gray-800', desc: 'son çalışmalar' },
                  { label: 'Yerleştirme Oranı', value: `%${efficiency}`,   valueColor: 'text-blue-600',    bg: 'bg-blue-50/50 dark:bg-blue-900/20',    desc: 'kargo başarısı' },
                  { label: 'Toplam Kargo',      value: String(totalItems), valueColor: 'text-gray-900 dark:text-white',    bg: 'bg-gray-50 dark:bg-gray-800',       desc: 'işlenen kalem' },
                  { label: 'Alan Tasarrufu',    value: `+%${savedSpace}`,  valueColor: 'text-emerald-600', bg: 'bg-emerald-50/50 dark:bg-emerald-900/20', desc: 'bazeline göre' },
                ].map(({ label, value, valueColor, bg, desc }) => (
                  <div key={label} className={`${bg} rounded-2xl p-4 border border-gray-100 dark:border-gray-700`}>
                    <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">{label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── CTA banner ── */}
        <div className="relative overflow-hidden rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)' }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg">Yeni bir yükleme mi planlıyorsunuz?</h3>
              <p className="text-gray-400 text-sm mt-0.5">Konteyner boyutlarını girin, kargonuzu listeleyin, planı saniyeler içinde alın.</p>
            </div>
          </div>
          <Link href="/features/kargo-optimizasyon"
            className="relative shrink-0 inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg">
            Optimizörü Aç <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}
