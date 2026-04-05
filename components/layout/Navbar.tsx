'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { logout } from '@/lib/auth';
import { useLanguage } from '@/components/ui/LanguageProvider';
import GlobalSearch from '@/components/ui/GlobalSearch';
import {
  Calculator, Navigation, Truck, Building2,
  BarChart3, Package, ChevronDown, LayoutDashboard,
  History, CreditCard, User, LogOut, ChevronRight,
} from 'lucide-react';

const MODULLER = [
  {
    href: '/muhasebe',
    icon: Calculator,
    label: 'Lojistik Muhasebe',
    desc: 'Sefer, gelir-gider, fatura, bordro',
    color: 'text-green-600 bg-green-50',
  },
  {
    href: '/konum',
    icon: Navigation,
    label: 'Canlı Konum Takibi',
    desc: 'Araç takibi ve rota geçmişi',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    href: '/sofor',
    icon: Truck,
    label: 'Şoför Paneli',
    desc: 'GPS paylaşımı ve sefer yönetimi',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    href: '/depolama',
    icon: Building2,
    label: 'Depolama',
    desc: 'Depo ve kargo stok yönetimi',
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    href: '/features/detayli-raporlama',
    icon: BarChart3,
    label: 'Raporlama',
    desc: 'Performans analizi ve raporlar',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    href: '/features/kargo-optimizasyon',
    icon: Package,
    label: 'Optimizasyon',
    desc: '3D bin-packing ve yük planı',
    color: 'text-orange-600 bg-orange-50',
  },
];

export default function Navbar() {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [modullerOpen, setModullerOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [authed,       setAuthed]       = useState<boolean | null>(null);
  const navRef      = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => { setAuthed(r.ok); }).catch(() => setAuthed(false));
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Dışarı tıklayınca kapat */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setModullerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Escape ile kapat */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setModullerOpen(false); setMenuOpen(false); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={authed ? '/dashboard' : '/'} className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-xs tracking-tight">LF</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          {/* Nav Links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {authed ? (
              <>
                <Link href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Dashboard
                </Link>

                {/* Modüller dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setModullerOpen((p) => !p)}
                    aria-expanded={modullerOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      modullerOpen
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Modüller
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${modullerOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  {/* Dropdown panel */}
                  {modullerOpen && (
                    <div
                      role="menu"
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-white rounded-2xl shadow-xl border border-gray-100 p-3 grid grid-cols-2 gap-1.5 z-50"
                    >
                      {MODULLER.map((m) => {
                        const Icon = m.icon;
                        return (
                          <Link
                            key={m.href}
                            href={m.href}
                            role="menuitem"
                            onClick={() => setModullerOpen(false)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                              <Icon className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">{m.label}</p>
                              <p className="text-xs text-gray-500 leading-tight mt-0.5">{m.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Link href="/opt-gecmisi"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <History className="w-4 h-4" aria-hidden="true" />
                  Geçmiş
                </Link>
              </>
            ) : (
              NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  {item.label}
                </Link>
              ))
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {authed && <GlobalSearch />}

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
              aria-label="Dil değiştir"
            >
              {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>

            {authed === null ? (
              <div className="w-20 h-8 bg-gray-100 rounded-xl animate-pulse hidden sm:block" />
            ) : authed ? (
              <>
                <Link href="/fatura"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors">
                  <CreditCard className="w-4 h-4" aria-hidden="true" />
                  Fatura
                </Link>
                <Link href="/profil"
                  className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 hover:border-blue-200 transition-colors">
                  <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t('nav_account')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-colors"
                  aria-label="Çıkış yap"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="hidden sm:inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors">
                  {t('nav_login')}
                </Link>
                <Link href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                  {t('nav_open_app')}
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </>
            )}

            {/* Hamburger — mobile */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((p) => !p)}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden border-t border-gray-100 bg-white shadow-lg overflow-hidden transition-all duration-200 ease-in-out ${
          menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
          {authed ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors">
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" /> Dashboard
              </Link>

              {/* Modüller grup başlığı */}
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 pt-3 pb-1">Modüller</p>
              {MODULLER.map((m) => {
                const Icon = m.icon;
                return (
                  <Link key={m.href} href={m.href} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors">
                    <Icon className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    {m.label}
                  </Link>
                );
              })}

              <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-0.5">
                <Link href="/opt-gecmisi" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors">
                  <History className="w-4 h-4" aria-hidden="true" /> Geçmiş
                </Link>
                <Link href="/fatura" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors">
                  <CreditCard className="w-4 h-4" aria-hidden="true" /> Fatura
                </Link>
                <Link href="/profil" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors">
                  <User className="w-4 h-4" aria-hidden="true" /> Hesabım
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 text-left text-red-500 text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" aria-hidden="true" /> Çıkış Yap
                </button>
              </div>
            </>
          ) : (
            <>
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors">
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-1">
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2.5 rounded-xl transition-colors">
                  Giriş Yap
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold bg-blue-600 text-white px-3 py-2.5 rounded-xl text-center transition-colors hover:bg-blue-700">
                  Ücretsiz Başla
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
