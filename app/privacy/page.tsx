import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const sections = [
  {
    title: 'Topladığımız Bilgiler',
    content: `LogiFlow olarak yalnızca hizmetimizi sunmak için gerekli olan bilgileri topluyoruz. Bunlar; hesap oluşturma sırasında verilen ad, e-posta adresi ve şifre gibi kimlik bilgileri ile platform kullanımı sırasında oluşan kargo optimizasyon verileri, depolama kayıtları ve işlem geçmişidir. IP adresi ve tarayıcı bilgileri gibi teknik veriler güvenlik amacıyla otomatik olarak kaydedilebilir.`,
  },
  {
    title: 'Verilerin Kullanımı',
    content: `Topladığımız veriler; hizmetlerin sağlanması ve geliştirilmesi, hesap güvenliğinin korunması, kullanım analizleri ve performans iyileştirmeleri ile yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılmaktadır. Kişisel verileriniz üçüncü taraflara satılmaz veya reklam amacıyla paylaşılmaz.`,
  },
  {
    title: 'Veri Güvenliği',
    content: `Verileriniz AES-256 şifreleme standardıyla korunmakta ve AB Genel Veri Koruma Yönetmeliği (GDPR) ile Türkiye Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki gerekliliklere uygun altyapıda saklanmaktadır. Tüm aktarımlar TLS 1.3 protokolü ile şifrelenmektedir.`,
  },
  {
    title: 'Çerezler',
    content: `LogiFlow, oturum yönetimi ve kullanıcı tercihlerini hatırlamak amacıyla zorunlu çerezler kullanmaktadır. Analitik çerezler yalnızca açık onayınız alındıktan sonra etkinleştirilir. Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman yönetebilirsiniz.`,
  },
  {
    title: 'Haklarınız',
    content: `KVKK ve GDPR kapsamında; verilerinize erişim talep etme, düzeltme ve silme hakkı, işlemeyi kısıtlama ve itiraz etme hakkı ile veri taşınabilirliği hakkına sahipsiniz. Bu haklarınızı kullanmak için privacy@logiflow.io adresine e-posta gönderebilirsiniz.`,
  },
  {
    title: 'Veri Saklama Süresi',
    content: `Aktif hesaplar için verileriniz hesabınız açık olduğu sürece saklanır. Hesap silme talebinde bulunulması durumunda kişisel verileriniz 30 gün içinde sistemlerimizden kalıcı olarak silinir. Yasal zorunluluk gerektiren veriler ilgili mevzuatta öngörülen süreler boyunca saklanmaya devam eder.`,
  },
  {
    title: 'Politika Değişiklikleri',
    content: `Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler kayıtlı e-posta adresinize bildirilir. Politikayı düzenli olarak incelemenizi öneririz. Son güncelleme tarihi sayfanın altında belirtilmektedir.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-16 px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">Hukuki</span>
            <h1 className="text-4xl font-black text-gray-900 mb-3">Gizlilik Politikası</h1>
            <p className="text-gray-500 text-sm">Son güncelleme: 29 Mart 2026 · Sürüm 2.1</p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              LogiFlow olarak kişisel verilerinizin gizliliğine büyük önem veriyoruz. Bu politika, hangi verileri topladığımızı, nasıl kullandığımızı ve haklarınızın neler olduğunu açıklamaktadır.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((s, i) => (
              <div key={s.title} className="flex gap-5">
                <div className="shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.content}</p>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-8">
              <h3 className="font-bold text-gray-900 mb-2">İletişim</h3>
              <p className="text-sm text-gray-600">
                Gizlilik ile ilgili sorularınız için{' '}
                <a href="mailto:privacy@logiflow.io" className="text-blue-600 hover:underline font-medium">privacy@logiflow.io</a>{' '}
                adresine ulaşabilir ya da{' '}
                <Link href="/contact" className="text-blue-600 hover:underline font-medium">iletişim formumuzu</Link>{' '}
                kullanabilirsiniz.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
