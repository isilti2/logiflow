import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const posts = [
  {
    id: 1,
    title: '3D Kargo Optimizasyonunda Yapay Zeka Kullanımı',
    date: '15 Mart 2026',
    readTime: '6 dk',
    category: 'Teknoloji',
    author: { name: 'Elif Kaya', role: 'CTO', initials: 'EK' },
    summary: 'Makine öğrenimi algoritmalarının kargo yerleştirme problemlerine nasıl uygulandığını ve geleneksel yöntemlere kıyasla sağladığı avantajları ele alıyoruz.',
    content: [
      {
        type: 'paragraph',
        text: 'Kargo yerleştirme problemi (bin packing problem), bilgisayar biliminde NP-zor olarak sınıflandırılan klasik bir optimizasyon problemidir. Geleneksel yöntemler kaba kuvvet algoritmaları veya basit heuristikler kullanırken, yapay zeka destekli yaklaşımlar bu problemi tamamen farklı bir boyuta taşıyor.',
      },
      {
        type: 'heading',
        text: 'Geleneksel Yaklaşımların Sınırları',
      },
      {
        text: 'İlk nesil kargo yazılımları, First Fit Decreasing (FFD) gibi basit sıralama algoritmalarına dayanıyordu. Bu yöntemler hızlı sonuç üretse de optimal çözüme genellikle %60-70 oranında yaklaşabiliyordu. 100 farklı boyuttaki kargo kalemini bir konteynere yerleştirirken mümkün olan yerleşim kombinasyonu sayısı 10¹⁵⁷\'yi aşmakta — bu sayı evrendeki atom sayısından fazladır.',
        type: 'paragraph',
      },
      {
        type: 'heading',
        text: 'LogiFlow\'un Hibrit Yaklaşımı',
      },
      {
        type: 'paragraph',
        text: 'LogiFlow\'da geliştirdiğimiz algoritma, shelf-based bin packing ile 6 farklı rotasyon kombinasyonunu birleştiriyor. Her kargo kalemi için 6 farklı yönelim (x-y-z, x-z-y, y-x-z, y-z-x, z-x-y, z-y-x) deneniyor ve ağırlık merkezi kısıtlamaları göz önünde bulundurularak en uygun yerleşim seçiliyor. Sonuç: standart algoritmalara kıyasla ortalama %23 daha yüksek doluluk oranı.',
      },
      {
        type: 'callout',
        text: '💡 Gerçek Sonuç: GlobalFreight ile yaptığımız pilot çalışmada, aynı kargo yükü için gerekli konteyner sayısı 12\'den 9\'a düştü — %25 maliyet tasarrufu.',
      },
      {
        type: 'heading',
        text: 'Ağırlık Dengesi ve Güvenlik',
      },
      {
        type: 'paragraph',
        text: 'Sadece hacimsel doluluk yeterli değil. Ağır kalemlerin altta, hafif ve kırılgan olanların üstte konumlanması, uzun taşımacılıkta kritik önem taşır. Algoritmamız, ağırlık merkezi hesaplamalarını da optimizasyon sürecine dahil ederek sürücü güvenliğini ve kargo bütünlüğünü korur.',
      },
      {
        type: 'heading',
        text: 'Gelecek: Pekiştirmeli Öğrenme',
      },
      {
        type: 'paragraph',
        text: 'Bir sonraki adım, geçmiş optimizasyon verilerinden öğrenen bir reinforcement learning modelidir. Şirketinize özgü kargo profilleri üzerinde eğitilen model, zamanla daha da iyi sonuçlar üretecek. Beta programı 2026 Q3\'te başlayacak.',
      },
    ],
    tags: ['Yapay Zeka', '3D Optimizasyon', 'Algoritma', 'Lojistik'],
  },
  {
    id: 2,
    title: 'Lojistik Maliyetlerini %30 Düşürmenin Yolları',
    date: '8 Mart 2026',
    readTime: '5 dk',
    category: 'Lojistik',
    author: { name: 'Ahmet Yılmaz', role: 'CEO', initials: 'AY' },
    summary: 'Konteyner doluluk oranını artırarak ve boşta kalan alanı minimize ederek taşıma maliyetlerini önemli ölçüde azaltmanın pratik yöntemleri.',
    content: [
      {
        type: 'paragraph',
        text: 'Lojistik sektöründe taşıma maliyetleri, toplam operasyonel giderlerin %40-60\'ını oluşturmaktadır. Bu maliyetleri düşürmenin en etkili yolu, mevcut araç ve konteynerleri daha verimli kullanmaktan geçiyor.',
      },
      {
        type: 'heading',
        text: '1. Konteyner Doluluk Oranını Optimize Edin',
      },
      {
        type: 'paragraph',
        text: 'Sektör ortalaması konteyner doluluk oranı %67\'dir. LogiFlow kullanan şirketler bu oranı ortalama %89\'a çıkarmaktadır. Bu fark, aynı kargo hacmi için %25 daha az konteyner kullanmak anlamına geliyor.',
      },
      {
        type: 'heading',
        text: '2. Rota Planlamasını Veriye Dayalı Yapın',
      },
      {
        type: 'paragraph',
        text: 'Boş dönüş (dead mileage) problemi, Türkiye\'deki lojistik şirketlerinin yakıt maliyetlerinin %18\'ini oluşturuyor. Gelişmiş raporlama araçlarıyla rota verimliliğinizi analiz ederek bu oranı yarıya indirebilirsiniz.',
      },
      {
        type: 'callout',
        text: '📊 Veri: LogiFlow kullanan 45 lojistik firmasının 2025 yılı analizinde ortalama maliyet düşüşü %28,4 olarak ölçüldü.',
      },
      {
        type: 'heading',
        text: '3. Depo Alanını Verimli Kullanın',
      },
      {
        type: 'paragraph',
        text: 'Depo içi stok yönetimi, yükleme süresini ve dolayısıyla iş gücü maliyetini doğrudan etkiler. Kategorize edilmiş, etiketlenmiş ve dijital takibi yapılan bir depo, yükleme süresini ortalama %35 kısaltır.',
      },
    ],
    tags: ['Maliyet Optimizasyon', 'Konteyner', 'Rota Planlama', 'Verimlilik'],
  },
  {
    id: 3,
    title: 'Web Tabanlı 3D Görselleştirme: Three.js ile Neler Yapılabilir?',
    date: '1 Mart 2026',
    readTime: '8 dk',
    category: 'Geliştirici',
    author: { name: 'Mehmet Demir', role: 'Ürün Müdürü', initials: 'MD' },
    summary: 'Three.js kütüphanesini kullanarak tarayıcıda yüksek performanslı 3D kargo simülasyonları oluşturma deneyimimizi paylaşıyoruz.',
    content: [
      {
        type: 'paragraph',
        text: 'Modern web tarayıcıları artık WebGL desteğiyle son derece güçlü 3D renderlamaları doğrudan sayfada çizebilmektedir. Three.js bu gücü kullanılabilir bir API arkasına saklar ve LogiFlow\'un görselleştirme altyapısının temelini oluşturur.',
      },
      {
        type: 'heading',
        text: 'Neden Three.js?',
      },
      {
        type: 'paragraph',
        text: 'Babylon.js, PlayCanvas ve Three.js arasında yaptığımız karşılaştırmada Three.js, geniş ekosistemi, aktif topluluğu ve küçük bundle boyutu ile öne çıktı. Kargo kutusu gibi geometrik şekilleri temsil etmek için BoxGeometry primitifi kullanımı son derece pratik.',
      },
      {
        type: 'heading',
        text: 'Isometric Görünüm Tasarımı',
      },
      {
        type: 'paragraph',
        text: 'Kullanıcıların konteyner içindeki kargo düzenini rahatça görmesi için isometric perspektif kullandık. OrthographicCamera ile elde edilen bu görünüm, derinlik yanılsaması olmadan tüm kutuların görünür kalmasını sağlıyor.',
      },
      {
        type: 'callout',
        text: '⚡ Performans: 500+ kargo kalemini 60 FPS\'de render edebiliyoruz — instanced mesh kullanarak draw call sayısını %90 azalttık.',
      },
      {
        type: 'heading',
        text: 'SVG Fallback Stratejisi',
      },
      {
        type: 'paragraph',
        text: 'WebGL desteği olmayan ortamlar (bazı mobil tarayıcılar, PDF çıktısı) için SVG tabanlı isometric projeksiyon geliştirdik. Bu yaklaşım, matematiksel dönüşümler kullanarak 3D koordinatları 2D SVG\'ye yansıtıyor.',
      },
    ],
    tags: ['Three.js', 'WebGL', '3D', 'React', 'Geliştirici'],
  },
  {
    id: 4,
    title: 'Sürdürülebilir Lojistik: Karbon Ayak İzini Azaltmak',
    date: '22 Şubat 2026',
    readTime: '5 dk',
    category: 'Sürdürülebilirlik',
    author: { name: 'Zeynep Çelik', role: 'Baş Mühendis', initials: 'ZÇ' },
    summary: 'Optimum yükleme planlamasının yakıt tüketimini ve karbon emisyonlarını nasıl azalttığını verilerle inceliyoruz.',
    content: [
      {
        type: 'paragraph',
        text: 'Lojistik sektörü küresel CO₂ emisyonlarının yaklaşık %8\'inden sorumludur. Avrupa Yeşil Mutabakatı çerçevesinde 2030\'a kadar bu oranın yarıya indirilmesi hedefleniyor. Kargo optimizasyonu bu hedefin en maliyet etkin ayaklarından birini oluşturuyor.',
      },
      {
        type: 'heading',
        text: 'Doluluk Oranı ve Emisyon İlişkisi',
      },
      {
        type: 'paragraph',
        text: 'Bir TIR\'ın %70 dolulukla sefer yapması ile %90 dolulukla sefer yapması arasında, ton başına CO₂ emisyonu açısından %22 fark oluşuyor. Yılda 1000 sefer yapan bir nakliyeci için bu fark, 47 ton CO₂\'e eşdeğer.',
      },
      {
        type: 'callout',
        text: '🌱 LogiFlow kullanıcılarının 2025 yılında önlediği tahmini CO₂ emisyonu: 1.240 ton — 56.000 ağaç dikmekle eşdeğer.',
      },
      {
        type: 'heading',
        text: 'Raporlama ve ESG Uyumu',
      },
      {
        type: 'paragraph',
        text: 'LogiFlow\'un raporlama modülü, her optimizasyon için hesaplanan emisyon tasarrufunu otomatik olarak kaydeder. Bu veriler CSRD (Corporate Sustainability Reporting Directive) kapsamındaki ESG raporlarınıza doğrudan entegre edilebilir.',
      },
    ],
    tags: ['Sürdürülebilirlik', 'CO₂', 'ESG', 'Yeşil Lojistik'],
  },
  {
    id: 5,
    title: 'LogiFlow v2.0: Yeni Özellikler ve İyileştirmeler',
    date: '14 Şubat 2026',
    readTime: '4 dk',
    category: 'Ürün',
    author: { name: 'Ahmet Yılmaz', role: 'CEO', initials: 'AY' },
    summary: 'Excel içe aktarma desteği, gelişmiş raporlama araçları ve yeni API uç noktaları dahil olmak üzere v2.0 sürümündeki tüm yeniliklere göz atın.',
    content: [
      {
        type: 'paragraph',
        text: 'LogiFlow v2.0, kullanıcı geri bildirimlerinden doğan 40\'tan fazla iyileştirme ve 8 yeni özellik içeriyor. Bu sürümle birlikte platform, bir prototipten kurumsal düzeyde kullanıma hazır bir ürüne dönüşüyor.',
      },
      {
        type: 'heading',
        text: '🆕 Yeni: Excel Toplu İçe Aktarma',
      },
      {
        type: 'paragraph',
        text: 'Kargo kalemlerinizi artık .xlsx dosyasıyla toplu olarak yükleyebilirsiniz. LogiFlow şablonunu indirin, doldurun, yükleyin — 500 kalem 3 saniyede sisteme girer.',
      },
      {
        type: 'heading',
        text: '🆕 Yeni: Detaylı Raporlama Modülü',
      },
      {
        type: 'paragraph',
        text: 'Haftalık, aylık ve yıllık performans raporları artık tek tıkla PDF olarak dışa aktarılabiliyor. Konteyner doluluk oranı, ağırlık dağılımı ve maliyet tasarrufu metrikleri görselleştirilmiş şekilde sunuluyor.',
      },
      {
        type: 'callout',
        text: '📅 v2.1 yol haritası: Çoklu kullanıcı desteği, gerçek zamanlı işbirliği ve mobil uygulama — Q2 2026\'da yayında.',
      },
    ],
    tags: ['Ürün Güncelleme', 'Excel', 'API', 'Raporlama'],
  },
  {
    id: 6,
    title: 'Müşteri Başarı Hikayesi: GlobalFreight ile Çalışmak',
    date: '5 Şubat 2026',
    readTime: '7 dk',
    category: 'Başarı Hikayeleri',
    author: { name: 'Elif Kaya', role: 'CTO', initials: 'EK' },
    summary: 'GlobalFreight, LogiFlow entegrasyonundan sonra yıllık operasyonel maliyetlerini nasıl düşürdüğünü ve süreçlerini nasıl otomatikleştirdiğini anlatıyor.',
    content: [
      {
        type: 'paragraph',
        text: 'GlobalFreight, İstanbul merkezli ve Türkiye\'nin 12 ilinde deposu bulunan orta ölçekli bir lojistik firması. Aylık 2.400\'den fazla konteyner hareketi gerçekleştiren şirket, 2024 yılı sonunda LogiFlow\'u pilot olarak uygulamaya aldı.',
      },
      {
        type: 'heading',
        text: 'Sorun: Elle Yapılan Yükleme Planlaması',
      },
      {
        type: 'paragraph',
        text: '"Her sabah 4 operatörümüz 3 saat harcayarak yükleme planları hazırlıyordu," diyor GlobalFreight Operasyon Müdürü Serkan Yurt. "Hatalar kaçınılmazdı ve bir konteyneri yeniden düzenlemek saatlerimizi alıyordu."',
      },
      {
        type: 'heading',
        text: 'Uygulama Süreci',
      },
      {
        type: 'paragraph',
        text: 'LogiFlow entegrasyonu 2 haftada tamamlandı. Mevcut Excel tabanlı kargo kayıtları platforma aktarıldı, depo alanları tanımlandı ve ekip 4 saatlik eğitimle sistemi kullanmaya başladı.',
      },
      {
        type: 'callout',
        text: '📈 Sonuçlar (6 aylık pilot): Konteyner doluluk oranı %69 → %91 · Planlama süresi 3 saat → 18 dakika · Yıllık tahmini tasarruf: ₺2,4 milyon',
      },
      {
        type: 'heading',
        text: '"Artık Geri Dönmek İstemiyoruz"',
      },
      {
        type: 'paragraph',
        text: '"LogiFlow sadece bir yazılım değil, operasyon kültürümüzü değiştirdi," diyor Serkan Yurt. "Veriye dayalı karar alma artık şirketimizin DNA\'sında." GlobalFreight, pilot başarısının ardından 3 yıllık kurumsal lisans sözleşmesi imzaladı.',
      },
    ],
    tags: ['Müşteri Hikayesi', 'ROI', 'Entegrasyon', 'Kurumsal'],
  },
];

const categoryColors: Record<string, string> = {
  Teknoloji: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
  Lojistik: 'bg-orange-50 text-orange-600',
  Geliştirici: 'bg-purple-50 text-purple-600',
  Sürdürülebilirlik: 'bg-green-50 text-green-600',
  Ürün: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Başarı Hikayeleri': 'bg-yellow-50 text-yellow-600',
};

export function generateStaticParams() {
  return posts.map((p) => ({ id: String(p.id) }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = posts.find((p) => p.id === Number(id));
  if (!post) notFound();

  const others = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-16 px-4 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Link href="/blog" className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors">Blog</Link>
              <span className="text-gray-300 text-xs">›</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600 dark:text-gray-300'}`}>
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">{post.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed mb-6">{post.summary}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{post.author.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{post.author.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{post.author.role}</p>
                </div>
              </div>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">{post.date}</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">{post.readTime} okuma</span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {post.content.map((block, i) => {
                if (block.type === 'heading') {
                  return <h2 key={i} className="text-xl font-black text-gray-900 dark:text-white mt-8 mb-2">{block.text}</h2>;
                }
                if (block.type === 'callout') {
                  return (
                    <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-sm text-blue-800 font-medium leading-relaxed">
                      {block.text}
                    </div>
                  );
                }
                return <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed">{block.text}</p>;
              })}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium bg-gray-100 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Other posts */}
        <section className="bg-gray-50 py-12 px-4 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-base font-black text-gray-900 dark:text-white mb-5">Diğer Yazılar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {others.map((p) => (
                <Link key={p.id} href={`/blog/${p.id}`}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category] ?? 'bg-gray-100 text-gray-600 dark:text-gray-300'}`}>
                    {p.category}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-2 leading-snug line-clamp-2">{p.title}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{p.date}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
