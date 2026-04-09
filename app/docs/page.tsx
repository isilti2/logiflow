'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const SIDEBAR = [
  {
    id: 'baslangic',
    label: 'Başlangıç',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: 'api',
    label: 'API Referansı',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    id: 'ozellikler',
    label: 'Özellikler',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'sss',
    label: 'SSS',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-gray-800/80 px-4 py-2.5 rounded-t-xl border-b border-white/5">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500 font-mono">terminal</span>
      </div>
      <pre className="bg-gray-900 rounded-b-xl p-5 text-sm font-mono text-emerald-400 overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
      <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-sm text-blue-800 leading-relaxed">{children}</div>
    </div>
  );
}

const CONTENT: Record<string, React.ReactNode> = {
  baslangic: (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Başlangıç</h2>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed">
          LogiFlow platformuna hoş geldiniz. Bu rehber, hesap oluşturmaktan ilk kargo optimizasyonunuzu çalıştırmaya kadar tüm adımları kapsamaktadır.
        </p>
      </div>

      {[
        {
          num: '1',
          title: 'Hesap Oluşturma',
          body: (
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
              <Link href="/register" className="text-blue-600 hover:underline font-semibold">Kayıt sayfasına</Link> gidin. E-posta adresinizi, adınızı ve şifrenizi girerek 30 saniyede ücretsiz hesap oluşturun. Kredi kartı gerekmez.
            </p>
          ),
        },
        {
          num: '2',
          title: 'İlk Projenizi Oluşturun',
          body: <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm leading-relaxed">Dashboard&apos;dan &ldquo;Yeni Proje&rdquo; butonuna tıklayın. Konteyner boyutlarını ve kargo kalemlerini girerek optimizasyon işlemini başlatabilirsiniz.</p>,
        },
        {
          num: '3',
          title: 'Kargo Kalemlerini Ekleyin',
          body: <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm leading-relaxed">Kargo kalemlerini manuel olarak girebilir veya Microsoft Excel şablonumuzu kullanarak toplu içe aktarabilirsiniz. Her kalem için boyut (G × D × Y) ve ağırlık bilgisi zorunludur.</p>,
        },
        {
          num: '4',
          title: 'Optimizasyonu Çalıştırın',
          body: <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm leading-relaxed">&ldquo;Optimize Et&rdquo; butonuna tıklayın. Yapay zeka motorumuz saniyeler içinde en iyi yerleştirme planını hesaplayacak ve 3D görselleştirme ile sonuçları gösterecektir.</p>,
        },
      ].map(({ num, title, body }) => (
        <div key={num} className="flex gap-5">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">{num}</div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">{title}</h3>
            {body}
          </div>
        </div>
      ))}

      <InfoBox>
        <strong>İpucu:</strong> Konteyner doluluk oranını maksimuma çıkarmak için kargo kalemlerinin doğru boyutlarda girildiğinden emin olun. Boyutlar santimetre cinsinden girilmelidir.
      </InfoBox>
    </div>
  ),

  api: (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">API Referansı</h2>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed">
          LogiFlow REST API&apos;sini kullanarak kargo optimizasyonunu kendi sisteminize entegre edin.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-black text-gray-900 dark:text-white">Kimlik Doğrulama</h3>
        <CodeBlock>{`POST /api/auth/login
Content-Type: application/json

{
  "email": "kullanici@example.com",
  "password": "sifreniz"
}`}</CodeBlock>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-black text-gray-900 dark:text-white">Optimizasyon İsteği</h3>
        <CodeBlock>{`POST /api/v1/optimize
Authorization: Bearer <token>
Content-Type: application/json

{
  "container": { "width": 240, "depth": 590, "height": 240 },
  "items": [
    { "id": "1", "width": 60, "depth": 80, "height": 60, "weight": 10 }
  ]
}`}</CodeBlock>
      </div>

      <InfoBox>
        Tam API dokümantasyonu ve Postman koleksiyonu yakında yayınlanacak. Erken erişim için <Link href="/contact" className="font-semibold underline">bizimle iletişime geçin</Link>.
      </InfoBox>
    </div>
  ),

  ozellikler: (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Özellikler</h2>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed">LogiFlow&apos;un sunduğu tüm özellikler ve kapasiteler.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: '3D Görselleştirme', desc: 'Gerçek zamanlı Three.js tabanlı 3D kargo önizlemesi.', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' },
          { title: 'Excel İçe Aktarma', desc: 'Kargo kalemlerinizi .xlsx formatında toplu yükleyin.', color: 'bg-emerald-50 text-emerald-600' },
          { title: 'PDF Raporu', desc: 'Yükleme planını tek tıkla PDF olarak dışa aktarın.', color: 'bg-violet-50 text-violet-600' },
          { title: 'Paylaşım Linki', desc: 'Hesapsız erişim için özel paylaşım bağlantısı oluşturun.', color: 'bg-orange-50 text-orange-600' },
          { title: 'Canlı Filo Takibi', desc: 'Tüm araçlarınızı gerçek zamanlı harita üzerinde izleyin.', color: 'bg-teal-50 text-teal-600' },
          { title: 'Lojistik Muhasebe', desc: 'Sefer, gelir, gider, bordro ve cari hesap yönetimi.', color: 'bg-indigo-50 text-indigo-600' },
          { title: 'AES-256 Şifreleme', desc: 'Tüm hassas veriler uçtan uca şifrelenerek saklanır.', color: 'bg-red-50 text-red-600' },
          { title: 'Bulut Tabanlı', desc: 'Tüm projeleriniz güvenli bulut altyapısında saklanır.', color: 'bg-gray-100 text-gray-600 dark:text-gray-300' },
        ].map((f) => (
          <div key={f.title} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-200 dark:hover:border-gray-700 dark:border-gray-700 hover:bg-white transition-all">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${f.color}`}>
              {f.title[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{f.title}</p>
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  sss: (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Sık Sorulan Sorular</h2>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed">En çok merak edilen konular hakkında hızlı yanıtlar.</p>
      </div>
      <div className="space-y-3">
        {[
          { q: 'LogiFlow ücretsiz mi?', a: 'Temel plan tamamen ücretsizdir. Gelişmiş özellikler için Pro ve Kurumsal planlarımızı inceleyebilirsiniz.' },
          { q: 'Hangi konteyner boyutları destekleniyor?', a: 'Standart 20ft, 40ft ve özel boyutlu konteynerler dahil her türlü boyutu manuel olarak girebilirsiniz. Pikap, kamyon ve tır için de kullanılabilir.' },
          { q: 'Verilerim güvende mi?', a: 'Verileriniz AES-256-GCM şifreleme ile korunmakta ve Türkiye\'de barındırılan altyapıda KVKK uyumlu olarak saklanmaktadır.' },
          { q: 'API entegrasyonu nasıl yapılır?', a: 'API bölümündeki dokümantasyonu takip edin. REST API ve webhook desteği sunulmaktadır. Erken erişim için bizimle iletişime geçin.' },
          { q: 'Mobil cihazlarda kullanılabiliyor mu?', a: 'Evet. Şoför paneli özellikle mobil tarayıcılar için optimize edilmiştir. Canlı GPS paylaşımı için uygulama indirmenize gerek yoktur.' },
          { q: 'Takım üyeleri ekleyebilir miyim?', a: 'Pro ve Kurumsal planlarda takım üyesi desteği mevcuttur. Her kullanıcı için ayrı rol tanımlaması yapılabilir.' },
        ].map((item, i) => (
          <details key={i} className="group border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors list-none">
              <span className="font-bold text-gray-900 dark:text-white text-sm pr-4">{item.q}</span>
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5 pt-1 border-t border-gray-50">
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  ),
};

export default function DocsPage() {
  const [active, setActive] = useState('baslangic');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#03060f] overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-4 py-2 rounded-full mb-6">
            Dokümantasyon
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
            Her şey burada
          </h1>
          <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto">
            LogiFlow&apos;u kullanmaya başlamak ve entegre etmek için ihtiyacınız olan tüm rehberler.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #ffffff)' }} />
      </section>

      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="md:w-56 shrink-0">
            <nav className="sticky top-20 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 pb-2">Bölümler</p>
              {SIDEBAR.map((item) => (
                <button key={item.id} onClick={() => setActive(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                    active === item.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white dark:text-white'
                  }`}>
                  <span className={active === item.id ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 pb-2">Hızlı Erişim</p>
                <Link href="/register"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  Hemen Başla
                </Link>
                <Link href="/contact"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-xl transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  Destek Al
                </Link>
              </div>
            </nav>
          </aside>

          {/* ── İçerik ── */}
          <main className="flex-1 min-w-0">
            <div className="bg-white border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-sm">
              {CONTENT[active]}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
