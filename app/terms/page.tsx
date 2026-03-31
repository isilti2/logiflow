import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const sections = [
  {
    title: 'Hizmetin Kapsamı',
    content: `LogiFlow, web tabanlı 3D kargo optimizasyonu, depolama yönetimi, detaylı raporlama ve yük planı paylaşımı hizmetleri sunmaktadır. Platform, taşımacılık ve lojistik sektöründeki profesyonellerin iş süreçlerini dijitalleştirmek amacıyla tasarlanmıştır. Hizmetlerimiz "olduğu gibi" sunulmakta olup kapsamı önceden haber verilmeksizin değiştirilebilir.`,
  },
  {
    title: 'Hesap ve Sorumluluk',
    content: `Platformu kullanabilmek için geçerli bir hesap oluşturmanız gerekmektedir. Hesabınızın güvenliğinden ve hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlusunuz. Şüpheli bir faaliyet fark etmeniz durumunda derhal destek ekibimize bildirmeniz gerekmektedir. 18 yaşın altındaki bireyler platformu bağımsız olarak kullanamaz.`,
  },
  {
    title: 'Kabul Edilemez Kullanım',
    content: `Platformu; yasadışı faaliyetler, sistemi aşırı yükleme (DoS/DDoS), diğer kullanıcıların verilerine yetkisiz erişim, kötü amaçlı yazılım dağıtımı veya LogiFlow'un ticari itibarına zarar verecek içerik oluşturma amacıyla kullanamazsınız. Bu maddeyi ihlal eden hesaplar uyarı yapılmaksızın askıya alınabilir.`,
  },
  {
    title: 'Fikri Mülkiyet',
    content: `Platform üzerindeki tüm içerik, yazılım, tasarım ve algoritmalar LogiFlow'a aittir ve telif hakkı yasalarıyla korunmaktadır. Kullanıcılar platforma yükledikleri verilerin telif hakkı sahibidir; LogiFlow bu verileri yalnızca hizmet sunumu amacıyla işler. Platform kodunu kopyalamak, tersine mühendislik yapmak veya türev çalışma oluşturmak yasaktır.`,
  },
  {
    title: 'Veri ve Gizlilik',
    content: `Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için Gizlilik Politikamızı inceleyiniz. Hizmet kullanımınız süresince oluşturulan optimizasyon sonuçları, raporlar ve yük planları size aittir ve talep üzerine export edilebilir ya da silinebilir.`,
  },
  {
    title: 'Hizmet Kesintileri ve Garanti Reddi',
    content: `LogiFlow, hizmetin kesintisiz veya hatasız olacağını garanti etmemektedir. Planlı bakımlar önceden duyurulur. Beklenmedik teknik arızalar nedeniyle oluşabilecek veri kayıplarında sorumluluk, üyelik planı kapsamındaki hizmet düzeyi anlaşmasıyla sınırlıdır.`,
  },
  {
    title: 'Fiyatlandırma ve İptal',
    content: `Ücretli planlar için faturalama dönem başında gerçekleştirilir. İptal taleplerini bir sonraki dönem başlamadan en az 7 gün önce iletmeniz gerekmektedir. Mevcut dönem için ücret iadesi yapılmaz. Fiyatlar 30 gün önceden bildirim yapılarak değiştirilebilir.`,
  },
  {
    title: 'Değişiklikler ve Yürürlük',
    content: `Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler 30 gün önceden kayıtlı e-posta adresinize bildirilir. Değişiklik sonrası platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir. Koşullar Türkiye Cumhuriyeti hukukuna tabidir.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-50 to-white py-16 px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">Hukuki</span>
            <h1 className="text-4xl font-black text-gray-900 mb-3">Kullanım Koşulları</h1>
            <p className="text-gray-500 text-sm">Son güncelleme: 29 Mart 2026 · Sürüm 2.1</p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              LogiFlow platformunu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Lütfen bu belgeyi dikkatlice okuyunuz.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((s, i) => (
              <div key={s.title} className="flex gap-5">
                <div className="shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.content}</p>
                </div>
              </div>
            ))}

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mt-8">
              <h3 className="font-bold text-gray-900 mb-2">Sorularınız mı var?</h3>
              <p className="text-sm text-gray-600">
                Kullanım koşullarına ilişkin sorularınız için{' '}
                <a href="mailto:legal@logiflow.io" className="text-blue-600 hover:underline font-medium">legal@logiflow.io</a>{' '}
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
