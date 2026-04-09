import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Target, Eye, Heart, Users, TrendingUp, Globe, Award } from 'lucide-react';

const TEAM = [
  { name: 'Ahmet Yılmaz', role: 'Kurucu & CEO', initials: 'AY', color: 'from-blue-500 to-blue-700' },
  { name: 'Elif Kaya',    role: 'CTO',           initials: 'EK', color: 'from-violet-500 to-purple-700' },
  { name: 'Mehmet Demir', role: 'Ürün Müdürü',   initials: 'MD', color: 'from-emerald-500 to-teal-600' },
  { name: 'Zeynep Çelik', role: 'Baş Mühendis',  initials: 'ZÇ', color: 'from-orange-500 to-amber-600' },
];

const CARDS = [
  {
    title: 'Misyon',
    Icon: Target,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    description: 'Lojistik sektörünü dönüştürmek için yapay zeka destekli 3D kargo optimizasyon çözümleri sunarak şirketlerin taşıma maliyetlerini düşürmesine ve verimliliği artırmasına yardımcı olmak.',
  },
  {
    title: 'Vizyon',
    Icon: Eye,
    color: 'text-violet-600 bg-violet-50 border-violet-100',
    description: 'Dünya genelinde her lojistik operasyonunun akıllı, sürdürülebilir ve veriye dayalı kararlar almasını sağlayan lider teknoloji platformu olmak.',
  },
  {
    title: 'Değerlerimiz',
    Icon: Heart,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    description: 'Şeffaflık, yenilikçilik ve müşteri odaklılık temel değerlerimizdir. Her geliştirdiğimiz özellikte kullanıcı deneyimini ön planda tutarak sektörde güvenilir bir çözüm ortağı olmayı hedefliyoruz.',
  },
];

const STATS = [
  { icon: Users,     value: '500+',  label: 'Aktif Şirket' },
  { icon: TrendingUp, value: '%91',  label: 'Ort. Doluluk Oranı' },
  { icon: Globe,     value: '2.4M+', label: 'Analiz Edilen Yük' },
  { icon: Award,     value: '2022',  label: 'Kuruluş Yılı' },
];

const TIMELINE = [
  { yil: '2022', baslik: 'Kuruluş', aciklama: 'LogiFlow, İstanbul\'da 3D kargo optimizasyonu vizyonuyla kuruldu.' },
  { yil: '2023', baslik: 'İlk 100 Müşteri', aciklama: 'Depo yönetimi ve raporlama modülleri eklendi, 100 şirkete ulaşıldı.' },
  { yil: '2024', baslik: 'Filo & Muhasebe', aciklama: 'Canlı filo takibi, şoför paneli ve lojistik muhasebesi platforma entegre edildi.' },
  { yil: '2025', baslik: 'Platform v2', aciklama: 'Tam entegre 9 modül, AES-256 şifreleme, JWT güvenliği ve ölçeklenebilir altyapı.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#03060f] overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.1) 0%, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-4 py-2 rounded-full mb-6">
            Hakkımızda
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
            Logi<span className="text-blue-400">Flow</span> Hakkında
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            2022 yılında kurulan LogiFlow, lojistik sektörünün en zorlu problemlerinden biri olan
            kargo yerleştirme optimizasyonunu web tabanlı yapay zeka ile çözmeyi amaçlamaktadır.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #ffffff)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none dark:hidden" />
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none hidden dark:block"
          style={{ background: 'linear-gradient(to bottom, transparent, #030712)' }} />
      </section>

      {/* ── İstatistikler ── */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Misyon / Vizyon / Değerler ── */}
      <section className="py-24 bg-gray-50/60 dark:bg-gray-800/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4">
              <span className="w-4 h-px bg-gray-300 dark:bg-gray-600" />Kim Olduğumuz<span className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
            </span>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Bizi harekete geçiren değerler</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CARDS.map((card) => (
              <div key={card.title}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 border rounded-2xl flex items-center justify-center mb-6 ${card.color}`}>
                  <card.Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{card.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Zaman Çizelgesi ── */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4">
              <span className="w-4 h-px bg-gray-300 dark:bg-gray-600" />Yolculuğumuz<span className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
            </span>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Büyüme hikayemiz</h2>
          </div>
          <div className="relative">
            {/* Dikey çizgi */}
            <div className="absolute left-[3.25rem] top-4 bottom-4 w-px bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div key={item.yil} className="flex gap-6">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black z-10 ${i === TIMELINE.length - 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                      {item.yil.slice(2)}
                    </div>
                  </div>
                  <div className="pb-8 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{item.yil}</span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">{item.baslik}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.aciklama}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Takım ── */}
      <section className="py-24 bg-gray-50/60 dark:bg-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4">
              <span className="w-4 h-px bg-gray-300 dark:bg-gray-600" />Ekibimiz<span className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
            </span>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Arkasındaki insanlar</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              LogiFlow&apos;u hayata geçiren, lojistik ve yazılım alanında uzman tutkulu bir ekip.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((member) => (
              <div key={member.name}
                className="bg-white dark:bg-gray-800 rounded-3xl p-7 text-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${member.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-white font-black text-lg">{member.initials}</span>
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-base mb-0.5">{member.name}</h3>
                <p className="text-blue-600 text-xs font-semibold">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Bize katılın</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Türkiye&apos;nin lojistik geleceğini birlikte şekillendirelim.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold px-7 py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-blue-500/25">
              Ücretsiz Başla
            </a>
            <a href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold px-7 py-3.5 rounded-2xl transition-all text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
              Bize Ulaşın
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
