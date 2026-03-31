import Navbar from '@/components/layout/Navbar';

const teamMembers = [
  { name: 'Ahmet Yılmaz', role: 'Kurucu & CEO', initials: 'AY' },
  { name: 'Elif Kaya', role: 'CTO', initials: 'EK' },
  { name: 'Mehmet Demir', role: 'Ürün Müdürü', initials: 'MD' },
  { name: 'Zeynep Çelik', role: 'Baş Mühendis', initials: 'ZÇ' },
];

const cards = [
  {
    title: 'Misyon',
    icon: '🎯',
    description:
      'Lojistik sektörünü dönüştürmek için yapay zeka destekli 3D kargo optimizasyon çözümleri sunarak şirketlerin taşıma maliyetlerini düşürmesine ve verimliliği artırmasına yardımcı olmak.',
  },
  {
    title: 'Vizyon',
    icon: '🔭',
    description:
      'Dünya genelinde her lojistik operasyonunun akıllı, sürdürülebilir ve veriye dayalı kararlar almasını sağlayan lider teknoloji platformu olmak.',
  },
  {
    title: 'Değerlerimiz',
    icon: '💎',
    description:
      'Şeffaflık, yenilikçilik ve müşteri odaklılık temel değerlerimizdir. Her geliştirdiğimiz özellikte kullanıcı deneyimini ön planda tutarak sektörde güvenilir bir çözüm ortağı olmayı hedefliyoruz.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Hakkımızda
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
            Logi<span className="text-blue-600">Flow</span> Hakkında
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            2022 yılında kurulan LogiFlow, lojistik sektörünün en zorlu
            problemlerinden biri olan kargo yerleştirme optimizasyonunu web
            tabanlı yapay zeka ile çözmeyi amaçlamaktadır.
          </p>
        </div>
      </section>

      {/* Misyon / Vizyon / Değerler */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-5">
                {card.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {card.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Takım */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Ekibimiz
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              LogiFlow'ı hayata geçiren, lojistik ve yazılım alanında uzman
              tutkulu bir ekip.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-gray-900 font-semibold">{member.name}</h3>
                <p className="text-blue-600 text-sm mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
