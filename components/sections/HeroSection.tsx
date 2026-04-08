import Link from 'next/link';

/* ── İkonlar ─────────────────────────────────────────────────── */
const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
const Check = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

/* ── Veri ────────────────────────────────────────────────────── */
const STATS = [
  { value: '2.4M+', label: 'Analiz Edilen Yük', sub: 'başarıyla optimize edildi' },
  { value: '%91',   label: 'Ort. Doluluk Oranı', sub: 'sektör ortalaması %68' },
  { value: '<1sn',  label: 'Hesaplama Süresi', sub: 'gerçek zamanlı sonuç' },
  { value: '9',     label: 'Entegre Modül', sub: 'tek platformda' },
];

const OZELLIKLER = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    gradient: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-500/10',
    iconRenk: 'text-blue-400',
    baslik: 'Kargo Optimizasyon',
    aciklama: 'Gelişmiş 3D bin-packing algoritması ile saniyeler içinde optimal yük düzeni.',
    liste: ['Süper Hızlı Hesaplama', '3D Görselleştirme', 'Web Tabanlı'],
    href: '/features/kargo-optimizasyon',
    size: 'lg',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-700',
    bg: 'bg-violet-500/10',
    iconRenk: 'text-violet-400',
    baslik: 'Detaylı Raporlama',
    aciklama: 'PDF raporlar, grafiksel analizler ve dönem karşılaştırmalarıyla tam görünürlük.',
    liste: ['PDF Çıktı', 'Dönem Analizi'],
    href: '/features/detayli-raporlama',
    size: 'sm',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    iconRenk: 'text-emerald-400',
    baslik: 'Depo Yönetimi',
    aciklama: 'Çoklu depo alanları, Excel içe aktarma ve bulut depolama ile tam kontrol.',
    liste: ['Çoklu Alan', 'Excel İçe Aktar'],
    href: '/features/yonetme-depolama',
    size: 'sm',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-500/10',
    iconRenk: 'text-orange-400',
    baslik: 'Plan Paylaşımı',
    aciklama: 'Tek tıkla yük planlarını paylaşın. Alıcının hesabı olmasına gerek yok.',
    liste: ['Hesapsız Erişim', 'Anlık Link'],
    href: '/features/yuk-plani-paylasimi',
    size: 'sm',
  },
];

const MODULLER = [
  {
    href: '/muhasebe',
    gradient: 'from-emerald-400 to-teal-500',
    glowColor: 'bg-emerald-400',
    badge: 'Muhasebe',
    badgeBg: 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20',
    baslik: 'Lojistik Muhasebe',
    aciklama: 'Sefer takibi, gelir/gider, cari hesap, fatura ve bordro — tek ekranda.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    maddeler: ['Otomatik gelir/gider', 'Personel bordrosu', 'Tahsilat & cari'],
    stat: '9', statLabel: 'modül',
  },
  {
    href: '/konum',
    gradient: 'from-blue-400 to-indigo-500',
    glowColor: 'bg-blue-400',
    badge: 'Canlı',
    badgeBg: 'bg-blue-400/10 text-blue-300 border border-blue-400/20',
    baslik: 'Canlı Filo Takibi',
    aciklama: 'Tüm araçları gerçek zamanlı haritada izleyin. Hız, GPS, rota geçmişi.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    maddeler: ['20 sn. otomatik güncelleme', 'Sefer bazlı rota', 'Kullanıcı izolasyonu'],
    stat: '20s', statLabel: 'yenileme',
  },
  {
    href: '/sofor',
    gradient: 'from-violet-400 to-purple-600',
    glowColor: 'bg-violet-400',
    badge: 'Mobil',
    badgeBg: 'bg-violet-400/10 text-violet-300 border border-violet-400/20',
    baslik: 'Şoför Paneli',
    aciklama: 'Tarayıcıdan aç, sefer seç, başlat. Arka planda GPS paylaşımı sürer.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    maddeler: ['Arka plan GPS paylaşımı', 'WakeLock ekran açık', 'Uygulama gerektirmez'],
    stat: 'GPS', statLabel: 'watchPosition',
  },
];

const NASIL_CALISIR = [
  {
    adim: '01',
    baslik: 'Hesap Oluşturun',
    aciklama: '30 saniyede ücretsiz kayıt. Kredi kartı gerekmez, kurulum gerekmez.',
    renk: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    adim: '02',
    baslik: 'Verilerinizi Girin',
    aciklama: 'Kargo bilgilerini girin ya da Excel\'den içe aktarın. Sistem anında hazır.',
    renk: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/20',
  },
  {
    adim: '03',
    baslik: 'Optimize Edin',
    aciklama: 'Tek tıkla optimal yerleştirme planı alın. 3D görüntüleyin ve paylaşın.',
    renk: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
];

/* ── Component ───────────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          HERO — tam ekran, koyu tema
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#03060f] overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Animasyonlu arka plan grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-20">

          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2.5 bg-white/4 backdrop-blur-sm border border-white/10 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full ring-1 ring-inset ring-blue-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400" />
              </span>
              Türkiye&apos;nin Lojistik Yönetim Platformu
              <span className="w-px h-3 bg-white/10" />
              <span className="text-white/40">v2.0</span>
            </div>
          </div>

          {/* Başlık */}
          <div className="text-center max-w-5xl mx-auto mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black text-white leading-[1.05] tracking-tight">
              Lojistiğinizi{' '}
              <span className="relative">
                <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  akıllıca
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />
              </span>{' '}
              yönetin
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Kargo optimizasyonundan canlı filo takibine, lojistik muhasebesinden şoför paneline —
              <span className="text-gray-300"> tüm operasyonunuz tek platformda.</span>
            </p>
          </div>

          {/* CTA butonları */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link href="/register"
              className="group relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-2xl shadow-blue-900/60 text-sm overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              Ücretsiz Başla — Kredi Kartı Yok
              <span className="group-hover:translate-x-0.5 transition-transform"><ArrowRight /></span>
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-200 font-medium text-sm px-5 py-4 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/3 transition-all duration-200">
              Giriş yap
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          {/* Dashboard önizleme kartı */}
          <div className="relative mx-auto max-w-4xl">
            {/* Dış glow */}
            <div className="absolute -inset-px rounded-[20px] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }} />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 blur-3xl rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.3) 0%, transparent 100%)' }} />

            <div className="bg-[#0a0f1e]/90 backdrop-blur-xl border border-white/[0.07] rounded-[20px] overflow-hidden shadow-2xl">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4">
                  <div className="max-w-xs mx-auto flex items-center gap-2 bg-white/[0.05] rounded-md px-3 py-1">
                    <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    <span className="text-xs text-gray-600 font-mono">app.logiflow.com/dashboard</span>
                  </div>
                </div>
              </div>

              {/* İçerik */}
              <div className="p-5 sm:p-7">
                {/* Üst metrikler */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { l: 'Aktif Sefer', v: '12', c: 'text-blue-400', t: '+3 bu hafta', bg: 'bg-blue-400/5 border-blue-400/10' },
                    { l: 'Toplam Gelir', v: '₺184K', c: 'text-emerald-400', t: '+%12 artış', bg: 'bg-emerald-400/5 border-emerald-400/10' },
                    { l: 'Canlı Araç', v: '5', c: 'text-violet-400', t: 'GPS aktif', bg: 'bg-violet-400/5 border-violet-400/10' },
                    { l: 'Bekleyen Fatura', v: '3', c: 'text-amber-400', t: '₺42K toplam', bg: 'bg-amber-400/5 border-amber-400/10' },
                  ].map(({ l, v, c, t, bg }) => (
                    <div key={l} className={`border rounded-xl p-3.5 ${bg}`}>
                      <p className="text-[11px] text-gray-500 mb-1">{l}</p>
                      <p className={`text-2xl font-black ${c}`}>{v}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{t}</p>
                    </div>
                  ))}
                </div>

                {/* Grafik */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                    <p className="text-[11px] text-gray-500 mb-3">Aylık Gelir Trendi</p>
                    <div className="flex items-end gap-1 h-16">
                      {[30, 50, 40, 65, 55, 80, 70, 90, 75, 100, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm transition-all"
                          style={{
                            height: `${h}%`,
                            background: i === 11
                              ? 'linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.3) 100%)'
                              : 'linear-gradient(180deg, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0.1) 100%)',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'].map(m => (
                        <span key={m} className="text-[8px] text-gray-700">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 flex-1">
                      <p className="text-[11px] text-gray-500 mb-2">Doluluk Oranı</p>
                      <div className="relative w-12 h-12 mx-auto">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="3"
                            strokeDasharray={`${91 * 0.879} ${100 * 0.879}`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-blue-400">91%</span>
                      </div>
                    </div>
                    <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-3 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-[11px] text-emerald-400">Canlı</p>
                      </div>
                      <p className="text-xs font-bold text-white">5 araç</p>
                      <p className="text-[10px] text-gray-600">GPS aktif</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt geçiş */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #ffffff)' }} />
      </section>

      {/* ══════════════════════════════════════════════════════════
          İSTATİSTİKLER — beyaz, modern
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-gray-900 mb-1 tabular-nums tracking-tight">{value}</p>
                <p className="text-sm font-semibold text-gray-700 mb-0.5">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ÖZELLİKLER — bento grid tasarım
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">
              <span className="w-4 h-px bg-blue-600" />
              Özellikler
              <span className="w-4 h-px bg-blue-600" />
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">
              Operasyonunuzu{' '}
              <span className="text-blue-600">güçlendirin</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
              İhtiyacınız olan her araç, tek platformda. Kurulum yok, karmaşıklık yok.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Büyük kart — Kargo Optimizasyon */}
            <Link href={OZELLIKLER[0].href}
              className="group lg:col-span-3 relative bg-gradient-to-br from-gray-900 to-[#0a0f1e] rounded-3xl p-8 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 flex flex-col">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 60%)' }} />
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }} />

              <div className="relative">
                <div className="inline-flex w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl items-center justify-center text-blue-400 mb-6">
                  {OZELLIKLER[0].icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-3">{OZELLIKLER[0].baslik}</h3>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">{OZELLIKLER[0].aciklama}</p>
                <ul className="space-y-2 mb-8">
                  {OZELLIKLER[0].liste.map(m => (
                    <li key={m} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-blue-400"><Check /></span>{m}
                    </li>
                  ))}
                </ul>
                {/* Mini mock */}
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
                  <div className="flex gap-2 mb-3">
                    {['Konteyner A', 'Konteyner B', 'Konteyner C'].map((l, i) => (
                      <div key={l} className={`flex-1 h-1.5 rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-blue-400/50' : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-6 gap-1 h-16">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${i < 12 ? 'bg-blue-500/30' : 'bg-white/5'} ${[0,3,6].includes(i) ? 'row-span-2' : ''}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-6 flex items-center gap-1.5 text-sm font-semibold text-blue-400 group-hover:gap-3 transition-all">
                Keşfet <ArrowRight />
              </div>
            </Link>

            {/* Sağ sütun — 3 küçük kart */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {OZELLIKLER.slice(1).map((o) => (
                <Link key={o.href} href={o.href}
                  className="group relative bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-6 overflow-hidden hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300 flex-1">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(59,130,246,0.04) 0%, transparent 60%)' }} />
                  <div className="relative">
                    <div className={`inline-flex w-10 h-10 ${o.bg.replace('/10', '/15')} border border-current/10 rounded-xl items-center justify-center ${o.iconRenk} mb-4`}
                      style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                      {o.icon}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">{o.baslik}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{o.aciklama}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {o.liste.map(m => (
                        <span key={m} className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          <Check />{m}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NASIL ÇALIŞIR — 3 adım, temiz
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
              <span className="w-4 h-px bg-gray-300" />
              Nasıl Çalışır?
              <span className="w-4 h-px bg-gray-300" />
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">
              Dakikalar içinde{' '}
              <span className="text-blue-600">hazır</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Bağlantı çizgisi */}
            <div className="hidden md:block absolute top-[2.75rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)' }} />

            {NASIL_CALISIR.map((adim, i) => (
              <div key={adim.adim} className="relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className={`inline-flex w-14 h-14 ${adim.bg} border rounded-2xl items-center justify-center mb-6`}>
                  <span className={`text-2xl font-black ${adim.renk} font-mono`}>{adim.adim}</span>
                </div>
                {i < 2 && (
                  <div className="md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 w-px h-8 bg-gray-200" />
                )}
                <h3 className="text-xl font-black text-gray-900 mb-3">{adim.baslik}</h3>
                <p className="text-gray-500 leading-relaxed">{adim.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PLATFORM MODÜLLERİ — koyu, immersive
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#03060f] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-400/8 border border-emerald-400/15 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Yeni Modüller Aktif
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Tüm operasyonunuz,{' '}
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                tek çatı altında
              </span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
              Kargo optimizasyonunun çok ötesinde — muhasebe, filo takibi ve şoför uygulaması.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MODULLER.map((m) => (
              <Link key={m.href} href={m.href}
                className="group relative flex flex-col rounded-3xl border border-white/[0.07] overflow-hidden transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl">
                {/* Gradient top border */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.gradient} opacity-70`} />
                {/* Background */}
                <div className="absolute inset-0 bg-white/[0.025]" />
                <div className={`absolute top-0 right-0 w-48 h-48 ${m.glowColor} rounded-full blur-3xl opacity-[0.04] -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.08] transition-opacity`} />

                <div className="relative p-7 flex flex-col h-full">
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 bg-gradient-to-br ${m.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      {m.icon}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m.badgeBg}`}>
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-2">{m.baslik}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5">{m.aciklama}</p>

                  <ul className="space-y-2.5 mb-6">
                    {m.maddeler.map(md => (
                      <li key={md} className="flex items-center gap-2.5 text-xs text-gray-500">
                        <span className={`w-1 h-1 rounded-full bg-gradient-to-br ${m.gradient} shrink-0 opacity-70`} />
                        {md}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-5 border-t border-white/[0.06] mt-auto">
                    <div>
                      <p className={`text-2xl font-black bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent`}>
                        {m.stat}
                      </p>
                      <p className="text-xs text-gray-600">{m.statLabel}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 group-hover:text-white group-hover:gap-2.5 transition-all duration-200">
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
          CTA — gradient, güçlü
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #4338ca 100%)' }}>
            {/* Pattern */}
            <div className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            {/* Orbs */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-10" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-400 rounded-full blur-3xl opacity-10" />

            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                Hemen Başlayın
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Lojistiğinizi dönüştürün
              </h2>
              <p className="text-blue-200/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Ücretsiz hesap oluşturun, dakikalar içinde kurulum tamamlayın.
                Kredi kartı gerekmez.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register"
                  className="group inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:scale-[0.98] text-blue-700 font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl text-sm">
                  Ücretsiz Başla — Kredi Kartı Yok
                  <span className="group-hover:translate-x-0.5 transition-transform"><ArrowRight /></span>
                </Link>
                <Link href="/login"
                  className="inline-flex items-center gap-2 text-blue-200/70 hover:text-white font-medium text-sm px-5 py-4 transition-colors">
                  Zaten hesabım var
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
