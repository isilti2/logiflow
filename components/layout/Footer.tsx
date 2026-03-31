import Link from 'next/link';
import { FEATURES } from '@/lib/constants';

const FOOTER_LINKS = {
  urun: FEATURES.map((f) => ({
    label: f.title.trim() + ' ' + (f.titleHighlight ?? '').trim(),
    href: `/features/${f.id}`,
  })),
  sirket: [
    { label: 'Hakkımızda', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Docs', href: '/docs' },
    { label: 'İletişim', href: '/contact' },
  ],
  hesap: [
    { label: 'Giriş Yap', href: '/login' },
    { label: 'Uygulamayı Aç', href: '/depolama' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm shrink-0">
                <span className="text-white font-black text-xs tracking-tight">LF</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Logi<span className="text-blue-500">Flow</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Web tabanlı 3D kargo optimizasyon ve lojistik yönetim platformu.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-500">Tüm sistemler çalışıyor</span>
            </div>
          </div>

          {/* Ürün */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Ürün</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.urun.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Şirket */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Şirket</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.sirket.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hesap */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Hesap</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.hesap.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/depolama"
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Ücretsiz Dene →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© 2026 LogiFlow. Tüm hakları saklıdır.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Gizlilik Politikası</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Kullanım Koşulları</Link>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">İletişim</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
