import Link from 'next/link';

/* ── İkonlar (SVG inline — no extra dep) ─────────────────────── */
const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
const Check = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

/* ── Veri ────────────────────────────────────────────────────── */
const STATS = [
  { value: '2.4M+', label: 'Analiz Edilen Yük' },
  { value: '%91',   label: 'Ort. Doluluk Oranı' },
  { value: '<1sn',  label: 'Hesaplama Süresi' },
  { value: '7',     label: 'Entegre Modül' },
];

const OZELLIKLER = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    renk: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    iconRenk: 'text-blue-600',
    baslik: 'Kargo Optimizasyon',
    aciklama: 'Gelişmiş algoritmalar ile 3D yerleşim planı, saniyeler içinde optimal yük düzeni.',
    liste: ['Süper Hızlı Hesaplama', '3D Görselleştirme', 'Web Tabanlı'],
    href: '/features/kargo-optimizasyon',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    renk: 'from-violet-500 to-purple-700',
    bg: 'bg-violet-50',
    iconRenk: 'text-violet-600',
    baslik: 'Detaylı Raporlama',
    aciklama: 'Konteyner kullanımı, verimlilik grafikleri ve PDF raporlar ile tam görünürlük.',
    liste: ['PDF Çıktı', 'Grafiksel Analiz', 'Dönem Karşılaştırma'],
    href: '/features/detayli-raporlama',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    renk: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    iconRenk: 'text-emerald-600',
    baslik: 'Depo Yönetimi',
    aciklama: 'Önceden tanımlı alanlar, bulut depolama ve Excel entegrasyonu ile tam kontrol.',
    liste: ['Çoklu Alan', 'Bulut Tabanlı', 'Excel İçe Aktar'],
    href: '/features/yonetme-depolama',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    renk: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    iconRenk: 'text-orange-600',
    baslik: 'Yük Planı Paylaşımı',
    aciklama: 'Tek tıkla kamyon konfigürasyonlarını paylaşın. Hesap gerektirmez.',
    liste: ['Hesapsız Erişim', '3D Görünüm', 'Anlık Paylaşım'],
    href: '/features/yuk-plani-paylasimi',
  },
];

const MODULLER = [
  {
    href: '/muhasebe',
    gradient: 'from-emerald-400 to-teal-600',
    glow: 'shadow-emerald-500/20',
    badge: 'Yeni',
    badgeCls: 'bg-emerald-100 text-emerald-700',
    baslik: 'Lojistik Muhasebe',
    aciklama: 'Sefer takibi, gelir/gider, cari hesap, fatura, bordro ve araç filosu — tek ekranda.',
    maddeler: ['Otomatik gelir/gider yansıması', 'Personel bordro hesabı', 'Tahsilat ve cari bakiye'],
    stat: '9', statLabel: 'entegre modül',
  },
  {
    href: '/konum',
    gradient: 'from-blue-400 to-indigo-600',
    glow: 'shadow-blue-500/20',
    badge: 'Canlı',
    badgeCls: 'bg-blue-100 text-blue-700',
    baslik: 'Canlı Filo Takibi',
    aciklama: 'Tüm araçları gerçek zamanlı haritada izleyin. Hız, GPS doğruluğu, rota geçmişi.',
    maddeler: ['Her 20 saniyede otomatik güncelleme', 'Sefer bazlı rota geçmişi', 'Kullanıcı izolasyonu'],
    stat: '20sn', statLabel: 'yenileme aralığı',
  },
  {
    href: '/sofor',
    gradient: 'from-violet-400 to-purple-700',
    glow: 'shadow-violet-500/20',
    badge: 'Mobil',
    badgeCls: 'bg-violet-100 text-violet-700',
    baslik: 'Şoför Paneli',
    aciklama: 'Tarayıcıdan aç, sefer seç, başlat. Başka uygulamaya geçsen de konum paylaşımı sürer.',
    maddeler: ['Arka plan GPS paylaşımı', 'WakeLock — ekran uyanık kalır', 'Uygulama indirme gerekmiyor'],
    stat: 'GPS', statLabel: 'watchPosition',
  },
];

/* ── Component ───────────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#020817] overflow-hidden">
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* Grid */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[700px] bg-blue-600 rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600 rounded-full blur-[100px] opacity-[0.06] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-4xl mx-auto text-center">

            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-10 ring-1 ring-blue-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              Türkiye&apos;nin Lojistik Yönetim Platformu
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.08] tracking-tight mb-7">
              Lojistiğinizi{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  akıllıca
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-blue-400/0 via-indigo-400/60 to-violet-400/0" />
              </span>{' '}
              yönetin
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Kargo optimizasyonundan canlı filo takibine, lojistik muhasebesinden şoför paneline —
              tüm operasyonunuz tek platformda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
              <Link href="/register"
                className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-blue-900/50 text-sm ring-1 ring-blue-400">
                Ücretsiz Başla — Kredi Kartı Yok
                <span className="group-hover:translate-x-0.5 transition-transform"><ArrowRight /></span>
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 font-medium text-sm px-4 py-4 transition-colors">
                Zaten hesabım var →
              </Link>
            </div>

            {/* Dashboard preview card */}
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-white/0 pointer-events-none" />
              <div className="bg-gray-900/80 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/3">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="flex-1 mx-4 text-xs text-gray-600 text-center font-mono">logiflow.app/dashboard</span>
                </div>
                {/* Mock dashboard content */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[['Aktif Sefer', '12', 'text-blue-400'],['Toplam Gelir','₺184K','text-emerald-400'],['Canlı Araç','5','text-violet-400'],['Bekleyen Fatura','3','text-amber-400']].map(([l,v,c])=>(
                    <div key={l} className="bg-white/3 border border-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">{l}</p>
                      <p className={`text-xl font-black ${c}`}>{v}</p>
                    </div>
                  ))}
                  {/* Mini chart bars */}
                  <div className="col-span-2 sm:col-span-4 bg-white/3 border border-white/5 rounded-xl p-3 flex items-end gap-1.5 h-20">
                    {[40,65,45,80,55,90,70,85,60,95,75,100].map((h,i)=>(
                      <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-blue-600/80 to-blue-400/40 transition-all" style={{height:`${h}%`}} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow under card */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-blue-600/20 blur-2xl rounded-full" />
            </div>
          </div>
        </div>
        {/* Gradient fade to white — smooth dark→light transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" aria-hidden="true" />
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-8 px-6 text-center">
                <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ÖZELLİKLER
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-3">Özellikler</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">
              Operasyonunuzu <span className="text-blue-600">güçlendirin</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              İhtiyacınız olan her araç, tek platformda. Kurulum yok, karmaşıklık yok.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OZELLIKLER.map((o) => (
              <Link key={o.href} href={o.href}
                className="group relative flex flex-col p-6 rounded-2xl border border-gray-100 bg-white hover:border-transparent hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 overflow-hidden">
                {/* hover bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className={`w-12 h-12 ${o.bg} rounded-xl flex items-center justify-center mb-5 ${o.iconRenk} group-hover:scale-110 transition-transform duration-300`}>
                    {o.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{o.baslik}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{o.aciklama}</p>
                  <ul className="space-y-1.5 mb-6">
                    {o.liste.map(m => (
                      <li key={m} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-500"><Check /></span>{m}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all mt-auto">
                    Keşfet <ArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PLATFORM MODÜLLERİ
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#020817] relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-700 rounded-full blur-[150px] opacity-5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              Yeni Modüller
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Tüm operasyonunuz,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                tek çatı altında
              </span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              Kargo optimizasyonunun çok ötesinde — muhasebe, filo takibi ve şoför uygulaması.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODULLER.map((m) => (
              <Link key={m.href} href={m.href}
                className={`group relative flex flex-col p-7 rounded-2xl border border-white/8 bg-white/3 backdrop-blur hover:bg-white/6 transition-all duration-300 hover:shadow-2xl ${m.glow} overflow-hidden`}>
                {/* top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${m.gradient} opacity-60`} />
                {/* corner glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${m.gradient} opacity-5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2`} />

                <div className="relative">
                  {/* badge */}
                  <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full mb-5 ${m.badgeCls}`}>
                    {m.badge}
                  </span>

                  <h3 className="text-xl font-black text-white mb-3">{m.baslik}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">{m.aciklama}</p>

                  <ul className="space-y-2 mb-8">
                    {m.maddeler.map(md => (
                      <li key={md} className="flex items-center gap-2.5 text-xs text-gray-500">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${m.gradient} shrink-0`} />
                        {md}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-auto">
                    <div>
                      <p className={`text-2xl font-black bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent`}>{m.stat}</p>
                      <p className="text-xs text-gray-600">{m.statLabel}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-white group-hover:gap-2 transition-all">
                      Aç <ArrowRight />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 md:p-16 overflow-hidden shadow-2xl shadow-blue-200">
            {/* bg pattern */}
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white rounded-full opacity-5 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-300 rounded-full opacity-10 blur-3xl" />

            <div className="relative">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-4">Hemen Başlayın</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Lojistiğinizi dönüştürün
              </h2>
              <p className="text-blue-200 text-base max-w-xl mx-auto mb-10 leading-relaxed">
                Ücretsiz hesap oluşturun, dakikalar içinde kurulum tamamlayın.
                Kredi kartı gerekmez.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register"
                  className="group inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-blue-700 font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg text-sm">
                  Ücretsiz Başla — Kredi Kartı Yok
                  <span className="group-hover:translate-x-0.5 transition-transform"><ArrowRight /></span>
                </Link>
                <Link href="/login"
                  className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-medium text-sm px-4 py-4 transition-colors">
                  Zaten hesabım var →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
