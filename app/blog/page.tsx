import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const POSTS = [
  {
    id: 1,
    title: '3D Kargo Optimizasyonunda Yapay Zeka Kullanımı',
    date: '15 Mar 2026',
    readTime: '6 dk',
    category: 'Teknoloji',
    summary: 'Makine öğrenimi algoritmalarının kargo yerleştirme problemlerine nasıl uygulandığını ve geleneksel yöntemlere kıyasla sağladığı avantajları ele alıyoruz.',
    featured: true,
  },
  {
    id: 2,
    title: 'Lojistik Maliyetlerini %30 Düşürmenin Yolları',
    date: '8 Mar 2026',
    readTime: '5 dk',
    category: 'Lojistik',
    summary: 'Konteyner doluluk oranını artırarak ve boşta kalan alanı minimize ederek taşıma maliyetlerini önemli ölçüde azaltmanın pratik yöntemleri.',
    featured: false,
  },
  {
    id: 3,
    title: 'Web Tabanlı 3D Görselleştirme: Three.js ile Neler Yapılabilir?',
    date: '1 Mar 2026',
    readTime: '8 dk',
    category: 'Geliştirici',
    summary: 'Three.js kütüphanesini kullanarak tarayıcıda yüksek performanslı 3D kargo simülasyonları oluşturma deneyimimizi paylaşıyoruz.',
    featured: false,
  },
  {
    id: 4,
    title: 'Sürdürülebilir Lojistik: Karbon Ayak İzini Azaltmak',
    date: '22 Şub 2026',
    readTime: '4 dk',
    category: 'Sürdürülebilirlik',
    summary: 'Optimum yükleme planlamasının yakıt tüketimini ve karbon emisyonlarını nasıl azalttığını verilerle inceliyoruz.',
    featured: false,
  },
  {
    id: 5,
    title: 'LogiFlow v2.0: Yeni Özellikler ve İyileştirmeler',
    date: '14 Şub 2026',
    readTime: '7 dk',
    category: 'Ürün',
    summary: 'Excel içe aktarma desteği, gelişmiş raporlama araçları ve yeni API uç noktaları dahil olmak üzere v2.0 sürümündeki tüm yeniliklere göz atın.',
    featured: false,
  },
  {
    id: 6,
    title: 'Müşteri Başarı Hikayesi: GlobalFreight ile Çalışmak',
    date: '5 Şub 2026',
    readTime: '3 dk',
    category: 'Başarı Hikayeleri',
    summary: 'GlobalFreight, LogiFlow entegrasyonundan sonra yıllık operasyonel maliyetlerini nasıl düşürdüğünü ve süreçlerini nasıl otomatikleştirdiğini anlatıyor.',
    featured: false,
  },
];

const CAT_STYLE: Record<string, { badge: string; dot: string }> = {
  Teknoloji:            { badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900',      dot: 'bg-blue-500' },
  Lojistik:             { badge: 'bg-orange-50 text-orange-600 border border-orange-100', dot: 'bg-orange-500' },
  Geliştirici:          { badge: 'bg-violet-50 text-violet-600 border border-violet-100', dot: 'bg-violet-500' },
  Sürdürülebilirlik:    { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-500' },
  Ürün:                 { badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100',  dot: 'bg-indigo-500' },
  'Başarı Hikayeleri':  { badge: 'bg-amber-50 text-amber-700 border border-amber-100',   dot: 'bg-amber-500' },
};

const CAT_GRADIENT: Record<string, string> = {
  Teknoloji:            'from-blue-500/20 to-blue-600/5',
  Lojistik:             'from-orange-500/20 to-orange-600/5',
  Geliştirici:          'from-violet-500/20 to-violet-600/5',
  Sürdürülebilirlik:    'from-emerald-500/20 to-emerald-600/5',
  Ürün:                 'from-indigo-500/20 to-indigo-600/5',
  'Başarı Hikayeleri':  'from-amber-500/20 to-amber-600/5',
};

const CAT_ICON: Record<string, string> = {
  Teknoloji: 'T', Lojistik: 'L', Geliştirici: 'G',
  Sürdürülebilirlik: 'S', Ürün: 'Ü', 'Başarı Hikayeleri': 'B',
};

const CATEGORIES = ['Tümü', 'Teknoloji', 'Lojistik', 'Geliştirici', 'Sürdürülebilirlik', 'Ürün', 'Başarı Hikayeleri'];

export default function BlogPage() {
  const featured = POSTS.find((p) => p.featured)!;
  const rest = POSTS.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#03060f] overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-4 py-2 rounded-full mb-6">
            Blog
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
            Son <span className="text-blue-400">Yazılar</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Lojistik, teknoloji ve ürün güncellemeleri. Sektör trendlerini ve LogiFlow&apos;ın gelişimini takip edin.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none dark:hidden"
          style={{ background: 'linear-gradient(to bottom, transparent, #ffffff)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none hidden dark:block"
          style={{ background: 'linear-gradient(to bottom, transparent, #111827)' }} />
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">

        {/* Kategori filtresi */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => {
            const style = CAT_STYLE[cat];
            return (
              <button key={cat}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                  cat === 'Tümü'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : style ? style.badge : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Öne çıkan yazı */}
        <Link href={`/blog/${featured.id}`}
          className="group block bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300">
          <div className="grid md:grid-cols-2">
            {/* Sol — görsel */}
            <div className={`h-56 md:h-auto min-h-[220px] bg-gradient-to-br ${CAT_GRADIENT[featured.category] ?? 'from-blue-50 to-white'} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="relative text-center">
                <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-black text-gray-400 dark:text-gray-300">{CAT_ICON[featured.category]}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${CAT_STYLE[featured.category]?.badge}`}>
                  {featured.category}
                </span>
              </div>
            </div>
            {/* Sağ — içerik */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900">Öne Çıkan</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{featured.date} · {featured.readTime} okuma</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{featured.summary}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
                Devamını Oku
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Yazı grid */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Tüm Yazılar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post) => {
              const style = CAT_STYLE[post.category] ?? { badge: 'bg-gray-100 text-gray-600 border border-gray-200', dot: 'bg-gray-400' };
              const grad = CAT_GRADIENT[post.category] ?? 'from-gray-100 to-white';
              return (
                <Link key={post.id} href={`/blog/${post.id}`}
                  className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                  {/* Görsel alanı */}
                  <div className={`h-36 bg-gradient-to-br ${grad} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0"
                      style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <div className="relative w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl shadow flex items-center justify-center">
                      <span className="text-lg font-black text-gray-400 dark:text-gray-300">{CAT_ICON[post.category]}</span>
                    </div>
                  </div>
                  {/* İçerik */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>{post.category}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{post.readTime}</span>
                    </div>
                    <h2 className="text-base font-black text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors flex-1">
                      {post.title}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">{post.summary}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{post.date}</span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-1.5 flex items-center gap-1 transition-all">
                        Oku
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gray-900 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139,92,246,0.06) 0%, transparent 50%)' }} />
          <div className="relative">
            <h3 className="text-2xl font-black text-white mb-2">Gelişmeleri kaçırmayın</h3>
            <p className="text-gray-400 text-sm mb-6">Yeni yazılar ve ürün güncellemeleri için bültenimize abone olun.</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input type="email" placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              <button className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shrink-0">
                Abone Ol
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
