import Link from 'next/link';

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
const Check = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const STATS = [
  { value: '2.4M+', label: 'Analiz Edilen Yük',   color: 'text-blue-600' },
  { value: '%91',   label: 'Ort. Doluluk Oranı',   color: 'text-violet-600' },
  { value: '<1sn',  label: 'Hesaplama Süresi',      color: 'text-emerald-600' },
  { value: '9',     label: 'Entegre Modül',          color: 'text-orange-500' },
];

const OZELLIKLER = [
  {
    num: '01',
    baslik: 'Kargo Optimizasyon',
    aciklama: 'Gelişmiş 3D bin-packing algoritması ile saniyeler içinde optimal yük düzeni. Boş alan sıfıra yaklaşsın.',
    liste: ['3D Görselleştirme', 'Anlık Hesaplama', 'PDF Çıktı'],
    href: '/features/kargo-optimizasyon',
    accent: '#2563eb',
    tag: 'Popüler',
  },
  {
    num: '02',
    baslik: 'Canlı Filo Takibi',
    aciklama: 'Tüm araçlarınızı haritada gerçek zamanlı izleyin. Şoförler telefon tarayıcısından konum paylaşır.',
    liste: ['GPS Takip', '20sn Güncelleme', 'Rota Geçmişi'],
    href: '/konum',
    accent: '#7c3aed',
    tag: 'Yeni',
  },
  {
    num: '03',
    baslik: 'Lojistik Muhasebe',
    aciklama: 'Sefer geliri, yakıt gideri, bordro ve cari bakiye tek ekranda. Türk muhasebe mevzuatına uyumlu.',
    liste: ['Otomatik Gelir', 'Bordro Hesabı', 'KDV Takibi'],
    href: '/muhasebe',
    accent: '#059669',
    tag: 'Yeni',
  },
];

const NASIL_CALISIR = [
  { adim: '1', ikon: '📋', baslik: 'Kayıt Ol', aciklama: '30 saniyede ücretsiz hesap. Kart bilgisi yok.' },
  { adim: '2', ikon: '📦', baslik: 'Veri Gir',  aciklama: 'Kargo veya araç bilgilerini girin ya da Excel\'den yükleyin.' },
  { adim: '3', ikon: '🚀', baslik: 'Optimize Et', aciklama: 'Tek tıkla plan alın, 3D görüntüleyin, paylaşın.' },
];

export default function HeroSection() {
  return (
    <>
      {/* ══════════════════ HERO — açık, temiz, bold ══════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Üst gradient fon */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.07) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-20">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 border border-blue-100 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
              </span>
              Türkiye&apos;nin Lojistik Yönetim Platformu
            </div>
          </div>

          {/* Başlık */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.06] text-gray-900 mb-6">
              Lojistiğinizi{' '}
              <span style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                dönüştürün
              </span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
              Kargo optimizasyonu, canlı filo takibi ve lojistik muhasebesi —
              hepsi tek platformda, kurulum gerektirmez.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link href="/register"
                className="group inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 text-sm active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 8px 32px rgba(37,99,235,0.35)' }}>
                Ücretsiz Başla
                <span className="group-hover:translate-x-0.5 transition-transform"><ArrowRight /></span>
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-medium text-sm px-5 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                Giriş Yap
              </Link>
            </div>

            {/* Güven satırı */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
              {['Kredi kartı gerekmez', 'Anında kurulum', 'KVKK uyumlu', '500+ aktif şirket'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="text-emerald-500"><Check /></span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* App önizleme */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            {/* Glow */}
            <div className="absolute -inset-4 rounded-[2.5rem] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />

            <div className="relative bg-white rounded-[1.75rem] border border-gray-200 shadow-2xl shadow-gray-200/80 overflow-hidden">
              {/* Tarayıcı chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  <span className="text-xs text-gray-400 font-mono">app.logiflow.com/dashboard</span>
                </div>
              </div>

              {/* Dashboard UI mockup */}
              <div className="bg-gray-50 p-5 sm:p-7">
                {/* Üst bar */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-base font-black text-gray-900">Hoş geldiniz, Ahmet 👋</div>
                    <div className="text-xs text-gray-500 mt-0.5">Bugün ne optimize etmek istersiniz?</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { l: 'Optimizasyon', v: '24', sub: '+3 bu hafta', bar: 80, c: '#2563eb' },
                    { l: 'Aktif Kargo', v: '138', sub: 'depolarınızda', bar: 65, c: '#7c3aed' },
                    { l: 'Canlı Araç', v: '5', sub: 'GPS aktif', bar: 50, c: '#059669' },
                    { l: 'Sefer Geliri', v: '₺84K', sub: 'bu ay', bar: 91, c: '#d97706' },
                  ].map(({ l, v, sub, bar, c }) => (
                    <div key={l} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-[11px] text-gray-400 mb-1">{l}</p>
                      <p className="text-xl font-black text-gray-900">{v}</p>
                      <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${bar}%`, background: c }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Alt iki panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Grafik */}
                  <div className="sm:col-span-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-700">Aylık Sefer Geliri</p>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">▲ %18 artış</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-20">
                      {[35, 52, 45, 68, 55, 80, 72, 91, 78, 95, 85, 100].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm"
                          style={{
                            height: `${h}%`,
                            background: i >= 10
                              ? 'linear-gradient(180deg, #2563eb, rgba(37,99,235,0.3))'
                              : 'rgba(37,99,235,0.12)',
                          }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'].map((m, i) => (
                        <span key={i} className="text-[8px] text-gray-400 flex-1 text-center">{m}</span>
                      ))}
                    </div>
                  </div>
                  {/* Hızlı erişim */}
                  <div className="flex flex-col gap-2">
                    {[
                      { l: 'Muhasebe', c: '#059669', icon: '₺' },
                      { l: 'Filo Takibi', c: '#7c3aed', icon: '📍' },
                      { l: 'Optimizasyon', c: '#2563eb', icon: '📦' },
                    ].map(({ l, c, icon }) => (
                      <div key={l} className="bg-white rounded-xl px-3 py-2.5 border border-gray-100 shadow-sm flex items-center gap-2.5 flex-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: c + '15' }}>
                          {icon}
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{l}</span>
                        <svg className="w-3 h-3 text-gray-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS BAR ══════════════════ */}
      <section className="bg-gray-950 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {STATS.map(({ value, label, color }) => (
              <div key={label} className="py-10 px-6 text-center">
                <p className={`text-4xl font-black mb-1.5 tabular-nums ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ ÖZELLİKLER — yatay kartlar ══════════════════ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Ne sunuyoruz?</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              Tek platform,<br className="sm:hidden" /> sonsuz imkân
            </h2>
          </div>

          <div className="space-y-5">
            {OZELLIKLER.map((o, i) => (
              <Link key={o.href} href={o.href}
                className="group flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 p-7 md:p-9 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/80 bg-white hover:bg-gray-50/50 transition-all duration-300">
                {/* Numara */}
                <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white"
                  style={{ background: `linear-gradient(135deg, ${o.accent}, ${o.accent}bb)`, boxShadow: `0 8px 24px ${o.accent}33` }}>
                  {o.num}
                </div>
                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-black text-gray-900">{o.baslik}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: o.accent }}>{o.tag}</span>
                  </div>
                  <p className="text-gray-500 leading-relaxed mb-4 max-w-xl">{o.aciklama}</p>
                  <div className="flex flex-wrap gap-2">
                    {o.liste.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                        <span style={{ color: o.accent }}><Check /></span>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Ok */}
                <div className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all duration-200">
                  <ArrowRight />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ NASIL ÇALIŞIR ══════════════════ */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Başlamak kolay</p>
            <h2 className="text-4xl font-black text-gray-900">3 adımda hazır</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NASIL_CALISIR.map((a, i) => (
              <div key={a.adim} className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 -right-2.5 z-10 text-gray-300">
                    <ArrowRight />
                  </div>
                )}
                <div className="text-4xl mb-5">{a.ikon}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Adım {a.adim}</div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{a.baslik}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative rounded-[2.5rem] overflow-hidden p-12 md:p-20"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #7c3aed 100%)' }}>
            {/* Doku */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full opacity-5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-300 rounded-full opacity-10 blur-3xl pointer-events-none" />

            <div className="relative">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-4">Hemen Başlayın</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Lojistiğinizi dönüştürün
              </h2>
              <p className="text-blue-200/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Ücretsiz hesap oluşturun, dakikalar içinde aktif olun.<br />
                Kredi kartı gerekmez.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register"
                  className="group inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:scale-[0.98] text-indigo-700 font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl text-sm">
                  Ücretsiz Başla
                  <span className="group-hover:translate-x-0.5 transition-transform"><ArrowRight /></span>
                </Link>
                <Link href="/login"
                  className="inline-flex items-center text-blue-200 hover:text-white font-medium text-sm px-5 py-4 transition-colors">
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
