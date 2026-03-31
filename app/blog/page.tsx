import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const posts = [
  {
    id: 1,
    title: '3D Kargo Optimizasyonunda Yapay Zeka Kullanımı',
    date: '15 Mart 2026',
    category: 'Teknoloji',
    summary:
      'Makine öğrenimi algoritmalarının kargo yerleştirme problemlerine nasıl uygulandığını ve geleneksel yöntemlere kıyasla sağladığı avantajları ele alıyoruz.',
  },
  {
    id: 2,
    title: 'Lojistik Maliyetlerini %30 Düşürmenin Yolları',
    date: '8 Mart 2026',
    category: 'Lojistik',
    summary:
      'Konteyner doluluk oranını artırarak ve boşta kalan alanı minimize ederek taşıma maliyetlerini önemli ölçüde azaltmanın pratik yöntemleri.',
  },
  {
    id: 3,
    title: 'Web Tabanlı 3D Görselleştirme: Three.js ile Neler Yapılabilir?',
    date: '1 Mart 2026',
    category: 'Geliştirici',
    summary:
      'Three.js kütüphanesini kullanarak tarayıcıda yüksek performanslı 3D kargo simülasyonları oluşturma deneyimimizi paylaşıyoruz.',
  },
  {
    id: 4,
    title: 'Sürdürülebilir Lojistik: Karbon Ayak İzini Azaltmak',
    date: '22 Şubat 2026',
    category: 'Sürdürülebilirlik',
    summary:
      'Optimum yükleme planlamasının yakıt tüketimini ve karbon emisyonlarını nasıl azalttığını verilerle inceliyoruz.',
  },
  {
    id: 5,
    title: 'LogiFlow v2.0: Yeni Özellikler ve İyileştirmeler',
    date: '14 Şubat 2026',
    category: 'Ürün',
    summary:
      'Excel içe aktarma desteği, gelişmiş raporlama araçları ve yeni API uç noktaları dahil olmak üzere v2.0 sürümündeki tüm yeniliklere göz atın.',
  },
  {
    id: 6,
    title: 'Müşteri Başarı Hikayesi: GlobalFreight ile Çalışmak',
    date: '5 Şubat 2026',
    category: 'Başarı Hikayeleri',
    summary:
      'GlobalFreight, LogiFlow entegrasyonundan sonra yıllık operasyonel maliyetlerini nasıl düşürdüğünü ve süreçlerini nasıl otomatikleştirdiğini anlatıyor.',
  },
];

const categoryColors: Record<string, string> = {
  Teknoloji: 'bg-blue-50 text-blue-600',
  Lojistik: 'bg-orange-50 text-orange-600',
  Geliştirici: 'bg-purple-50 text-purple-600',
  Sürdürülebilirlik: 'bg-green-50 text-green-600',
  Ürün: 'bg-blue-50 text-blue-700',
  'Başarı Hikayeleri': 'bg-yellow-50 text-yellow-600',
};

const categoryHero: Record<string, { from: string; to: string; icon: string }> = {
  Teknoloji:          { from: 'from-blue-600',   to: 'to-blue-800',   icon: '🤖' },
  Lojistik:           { from: 'from-orange-500', to: 'to-orange-700', icon: '🚛' },
  Geliştirici:        { from: 'from-purple-600', to: 'to-purple-800', icon: '⚙️' },
  Sürdürülebilirlik:  { from: 'from-green-600',  to: 'to-green-800',  icon: '🌱' },
  Ürün:               { from: 'from-blue-500',   to: 'to-indigo-700', icon: '🚀' },
  'Başarı Hikayeleri':{ from: 'from-yellow-500', to: 'to-amber-600',  icon: '⭐' },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
            Son <span className="text-blue-600">Yazılar</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Lojistik, teknoloji ve ürün güncellemeleri hakkında en son
            içerikler. Sektör trendlerini ve LogiFlow'ın gelişimini takip
            edin.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Category-specific hero image */}
              {(() => {
                const h = categoryHero[post.category] ?? categoryHero['Ürün'];
                return (
                  <div className={`h-44 bg-gradient-to-br ${h.from} ${h.to} flex flex-col items-center justify-center gap-3 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <span className="text-4xl">{h.icon}</span>
                    <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">{post.category}</span>
                  </div>
                );
              })()}

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>

                <h2 className="text-gray-900 font-bold text-base mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">
                  {post.summary}
                </p>

                <Link
                  href={`/blog/${post.id}`}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  Devamını Oku
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
