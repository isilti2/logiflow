'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';

const sidebarItems = [
  { id: 'baslangic', label: 'Başlangıç' },
  { id: 'api', label: 'API' },
  { id: 'ozellikler', label: 'Özellikler' },
  { id: 'sss', label: 'SSS' },
];

const content: Record<string, React.ReactNode> = {
  baslangic: (
    <div className="prose max-w-none">
      <h2 className="text-2xl font-black text-gray-900 mb-4">Başlangıç</h2>
      <p className="text-gray-500 mb-6">
        LogiFlow platformuna hoş geldiniz. Bu rehber, hesap oluşturmaktan
        ilk kargo optimizasyonunuzu çalıştırmaya kadar tüm adımları
        kapsamaktadır.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mb-3">
        1. Hesap Oluşturma
      </h3>
      <p className="text-gray-500 mb-4">
        <a href="/login" className="text-blue-600 hover:underline font-medium">
          Giriş sayfasına
        </a>{' '}
        gidin ve "Hesap oluştur" bağlantısına tıklayın. E-posta adresinizi ve
        şifrenizi girdikten sonra hesabınız aktif hale gelecektir.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mb-3">
        2. İlk Projenizi Oluşturun
      </h3>
      <p className="text-gray-500 mb-4">
        Dashboard'dan "Yeni Proje" butonuna tıklayın. Konteyner boyutlarını
        ve kargo kalemlerini girerek optimizasyon işlemini başlatabilirsiniz.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mb-3">
        3. Kargo Kalemlerini Ekleyin
      </h3>
      <p className="text-gray-500 mb-4">
        Kargo kalemlerini manuel olarak girebilir veya Microsoft Excel
        şablonumuzu kullanarak toplu içe aktarabilirsiniz. Her kalem için
        boyut (G × D × Y) ve ağırlık bilgisi girilmesi zorunludur.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mb-3">
        4. Optimizasyonu Çalıştırın
      </h3>
      <p className="text-gray-500 mb-4">
        "Optimize Et" butonuna tıklayın. Yapay zeka motorumuz saniyeler
        içinde en iyi yerleştirme planını hesaplayacak ve 3D görselleştirme
        ile sonuçları gösterecektir.
      </p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-6">
        <p className="text-blue-800 text-sm font-medium">
          💡 <strong>İpucu:</strong> Konteyner doluluk oranını en üst düzeye
          çıkarmak için kargo kalemlerinin doğru boyutlarda girildiğinden emin
          olun.
        </p>
      </div>
    </div>
  ),
  api: (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-4">API Referansı</h2>
      <p className="text-gray-500 mb-6">
        LogiFlow REST API'sini kullanarak kargo optimizasyonunu kendi
        sisteminize entegre edin.
      </p>
      <div className="bg-gray-900 rounded-xl p-5 text-sm font-mono text-green-400">
        <p className="text-gray-400 mb-1"># Örnek istek</p>
        <p>POST /api/v1/optimize</p>
        <p className="text-gray-400 mt-3 mb-1">Authorization: Bearer {'<token>'}</p>
        <p className="text-gray-400">Content-Type: application/json</p>
      </div>
      <p className="text-gray-500 mt-6 text-sm">
        Tam API dokümantasyonu yakında yayınlanacak.
      </p>
    </div>
  ),
  ozellikler: (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Özellikler</h2>
      <ul className="space-y-4">
        {[
          { title: '3D Görselleştirme', desc: 'Gerçek zamanlı Three.js tabanlı 3D kargo önizlemesi.' },
          { title: 'Excel İçe Aktarma', desc: 'Kargo kalemlerinizi .xlsx formatında toplu yükleyin.' },
          { title: 'PDF Raporu', desc: 'Yükleme planını tek tıkla PDF olarak dışa aktarın.' },
          { title: 'Paylaşım Linki', desc: 'Hesapsız erişim için özel paylaşım bağlantısı oluşturun.' },
          { title: 'Bulut Depolama', desc: 'Tüm projeleriniz güvenli bulut altyapısında saklanır.' },
        ].map((f) => (
          <li key={f.title} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
              <p className="text-gray-500 text-sm mt-0.5">{f.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  ),
  sss: (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-4">
        Sık Sorulan Sorular
      </h2>
      <div className="space-y-5">
        {[
          {
            q: 'LogiFlow ücretsiz mi?',
            a: 'Temel plan ücretsizdir. Gelişmiş özellikler için Pro ve Kurumsal planlarımızı inceleyebilirsiniz.',
          },
          {
            q: 'Hangi konteyner boyutları destekleniyor?',
            a: 'Standart 20ft, 40ft ve özel boyutlu konteynerler dahil her türlü boyutu manuel olarak girebilirsiniz.',
          },
          {
            q: 'Verilerim güvende mi?',
            a: 'Verileriniz AES-256 şifreleme ile korunmakta ve AB veri gizlilik standartlarına uygun altyapıda saklanmaktadır.',
          },
          {
            q: 'API entegrasyonu nasıl yapılır?',
            a: 'API bölümündeki dokümantasyonu takip edin. REST API ve webhook desteği sunulmaktadır.',
          },
        ].map((item) => (
          <div key={item.q} className="border border-gray-100 rounded-xl p-5">
            <p className="font-semibold text-gray-900 text-sm mb-2">{item.q}</p>
            <p className="text-gray-500 text-sm">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export default function DocsPage() {
  const [active, setActive] = useState<string>('baslangic');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">
            Dokümantasyon
          </h1>
          <p className="text-gray-500 mt-1">
            LogiFlow'ı kullanmaya başlamak için ihtiyacınız olan her şey.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0">
            <nav className="sticky top-20 bg-gray-50 rounded-2xl border border-gray-100 p-3">
              <ul className="space-y-1">
                {sidebarItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActive(item.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-white hover:text-blue-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            {content[active]}
          </main>
        </div>
      </div>
    </div>
  );
}
