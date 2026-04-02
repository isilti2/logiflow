'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { logout } from '@/lib/auth';
import { useLanguage } from '@/components/ui/LanguageProvider';
import GlobalSearch from '@/components/ui/GlobalSearch';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => { setAuthed(r.ok); }).catch(() => setAuthed(false));
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  return (
    <nav
      ref={menuRef}
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
                <Link href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  {t('nav_dashboard')}
                </Link>
                <Link href="/features/kargo-optimizasyon" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  {t('nav_optimization')}
                </Link>
                <Link href="/features/detayli-raporlama" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  {t('nav_reporting')}
                </Link>
                <Link href="/depolama" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  {t('nav_storage')}
                </Link>
                <Link href="/opt-gecmisi" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  Geçmiş
                </Link>
              </>
            ) : (
              NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Global search — only when authed */}
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
                <Link
                  href="/fatura"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors"
                >
                  Fatura
                </Link>
                <Link
                  href="/profil"
                  className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">K</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t('nav_account')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-colors"
                  aria-label="Çıkış yap"
                >
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  {t('nav_open_app')}
                </Link>
              </>
            )}

            {/* Hamburger — mobile */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {authed ? (
              <>
                {[
                  { label: 'Dashboard',   href: '/dashboard' },
                  { label: 'Optimizasyon', href: '/features/kargo-optimizasyon' },
                  { label: 'Geçmiş', href: '/opt-gecmisi' },
                  { label: 'Raporlama', href: '/features/detayli-raporlama' },
                  { label: 'Depolama', href: '/depolama' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors">
                    {item.label}
                  </Link>
                ))}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="text-left text-red-500 text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                  Çıkış Yap
                </button>
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
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-semibold bg-blue-600 text-white px-3 py-2.5 rounded-xl text-center">
                    Giriş Yap
                  </Link>
                </div>
              </>
            )}
          </div>
      </div>
    </nav>
  );
}
