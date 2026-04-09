'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Check, X, Zap, Building2, Users, ArrowRight, HelpCircle } from 'lucide-react';

const ANNUAL_DISCOUNT = 0.20;

interface PlanFeature {
  text: string;
  included: boolean;
  note?: string;
}

interface Plan {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: number | null;
  description: string;
  cta: string;
  ctaHref: string;
  highlight: boolean;
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    monthlyPrice: 0,
    description: 'Bireysel kullanım ve küçük operasyonlar için ideal başlangıç noktası.',
    cta: 'Ücretsiz Başla',
    ctaHref: '/register',
    highlight: false,
    features: [
      { text: 'Aylık 10 optimizasyon', included: true },
      { text: '1 konteyner tipi', included: true },
      { text: '3D görselleştirme', included: true },
      { text: 'CSV dışa aktarma', included: true },
      { text: 'Yük planı paylaşımı', included: true },
      { text: 'Depolama yönetimi (3 alan)', included: true },
      { text: 'Sınırsız optimizasyon', included: false },
      { text: 'LIFO/FIFO kuralları', included: false },
      { text: 'Kırılganlık & istiflenebilirlik', included: false },
      { text: 'Çoklu konteyner', included: false },
      { text: 'PDF rapor', included: false },
      { text: 'API erişimi', included: false },
      { text: 'Öncelikli destek', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'En Popüler',
    monthlyPrice: 29,
    description: 'Büyüyen ekipler ve yoğun operasyonlar için gelişmiş araçlar ve sınırsız kullanım.',
    cta: 'Pro\'yu Dene',
    ctaHref: '/register',
    highlight: true,
    features: [
      { text: 'Sınırsız optimizasyon', included: true },
      { text: 'Tüm konteyner tipleri', included: true },
      { text: '3D görselleştirme', included: true },
      { text: 'CSV dışa aktarma', included: true },
      { text: 'Yük planı paylaşımı', included: true },
      { text: 'Depolama yönetimi (sınırsız alan)', included: true },
      { text: 'LIFO/FIFO yükleme kuralları', included: true },
      { text: 'Kırılganlık & istiflenebilirlik', included: true },
      { text: 'Çoklu konteyner optimizasyonu', included: true },
      { text: 'Detaylı PDF rapor', included: true },
      { text: 'API erişimi', included: false, note: 'Yakında' },
      { text: 'Öncelikli e-posta desteği', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    monthlyPrice: null,
    description: 'Büyük filolar, özel entegrasyonlar ve kurumsal düzeyde SLA gerektiren operasyonlar için.',
    cta: 'Bizimle İletişime Geç',
    ctaHref: '/contact',
    highlight: false,
    features: [
      { text: 'Sınırsız optimizasyon', included: true },
      { text: 'Tüm konteyner tipleri', included: true },
      { text: '3D görselleştirme', included: true },
      { text: 'CSV & PDF dışa aktarma', included: true },
      { text: 'Özel alan adı ile paylaşım', included: true },
      { text: 'Sınırsız depolama alanı', included: true },
      { text: 'LIFO/FIFO yükleme kuralları', included: true },
      { text: 'Kırılganlık & istiflenebilirlik', included: true },
      { text: 'Çoklu konteyner optimizasyonu', included: true },
      { text: 'Özel PDF rapor şablonu', included: true },
      { text: 'Tam API erişimi + Webhook', included: true },
      { text: 'Öncelikli + telefon desteği', included: true },
    ],
  },
];

const FAQ = [
  {
    q: 'Ücretsiz plan ne kadar süre geçerli?',
    a: 'Ücretsiz plan süresiz kullanılabilir. Aylık 10 optimizasyon hakkı her ay sıfırlanır.',
  },
  {
    q: 'Pro\'yu deneme süresi var mı?',
    a: '14 gün boyunca kredi kartı gerekmeden Pro planını ücretsiz deneyebilirsiniz.',
  },
  {
    q: 'Yıllık ödeme avantajı nedir?',
    a: 'Yıllık ödeme seçeneğiyle %20 indirim kazanırsınız. Fatura tek seferlik yıllık olarak kesilir.',
  },
  {
    q: 'Planımı istediğim zaman değiştirebilir miyim?',
    a: 'Evet. Yükseltme anında aktif olur, düşürme bir sonraki fatura döneminde geçerli olur.',
  },
  {
    q: 'API erişimi ne zaman gelecek?',
    a: 'API erişimi Pro plan için 2026 Q2\'de, Kurumsal plan için Q1\'de aktif edilmesi planlanıyor.',
  },
  {
    q: 'Kurumsal fiyatlandırma nasıl belirlenir?',
    a: 'Kullanıcı sayısı, aylık optimizasyon hacmi ve özel entegrasyon ihtiyaçlarınıza göre özel teklif sunuyoruz.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => { if (r.ok) setAuthed(true); });
  }, []);

  function ctaHref(plan: Plan): string {
    if (plan.id === 'enterprise') return plan.ctaHref;
    return authed ? '/fatura' : plan.ctaHref;
  }

  function displayPrice(plan: Plan): string {
    if (plan.monthlyPrice === null) return 'Özel';
    if (plan.monthlyPrice === 0) return '₺0';
    const price = annual
      ? Math.round(plan.monthlyPrice * (1 - ANNUAL_DISCOUNT))
      : plan.monthlyPrice;
    return `₺${price}`;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          Şeffaf Fiyatlandırma
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          İhtiyacınıza Uygun<br />
          <span className="text-blue-600">Plan Seçin</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-xl mx-auto mb-8">
          Bireysel kullanıcıdan kurumsal operasyonlara kadar her ölçek için esnek planlar. Gizli ücret yok.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              !annual ? 'bg-white text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              annual ? 'bg-white text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'
            }`}
          >
            Yıllık
            <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-md">
              %20 İndirim
            </span>
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-7 flex flex-col gap-6 ${
                plan.highlight
                  ? 'border-blue-500 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-2xl shadow-blue-200 scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-700 bg-white'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {plan.id === 'free' && <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Zap className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" /></div>}
                  {plan.id === 'pro' && <div className="w-8 h-8 rounded-lg bg-blue-400/30 flex items-center justify-center"><Zap className="w-4 h-4 text-blue-100" /></div>}
                  {plan.id === 'enterprise' && <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" /></div>}
                  <span className={`text-base font-bold ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {plan.name}
                  </span>
                </div>

                <div className="flex items-end gap-1.5 mb-2">
                  <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {displayPrice(plan)}
                  </span>
                  {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                    <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      / ay
                    </span>
                  )}
                  {plan.monthlyPrice === null && (
                    <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      fiyatlandırma
                    </span>
                  )}
                </div>
                {annual && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                  <p className={`text-xs mb-2 ${plan.highlight ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    Yıllık ₺{Math.round(plan.monthlyPrice * (1 - ANNUAL_DISCOUNT) * 12)} faturalandırılır
                  </p>
                )}
                <p className={`text-sm leading-relaxed ${plan.highlight ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              {/* CTA */}
              <Link
                href={ctaHref(plan)}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? 'bg-white text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                    : plan.id === 'enterprise'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Features */}
              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-blue-600'}`} />
                    ) : (
                      <X className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-blue-400/50' : 'text-gray-300'}`} />
                    )}
                    <span className={`text-sm leading-tight ${
                      f.included
                        ? plan.highlight ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                        : plan.highlight ? 'text-blue-300/60' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {f.text}
                      {f.note && (
                        <span className={`ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                          plan.highlight ? 'bg-blue-400/30 text-blue-200' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {f.note}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-10">
          Plan Karşılaştırması
        </h2>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-5 py-4 font-semibold text-gray-700 dark:text-gray-200 w-1/2">Özellik</th>
                <th className="text-center px-4 py-4 font-semibold text-gray-700 dark:text-gray-200">Ücretsiz</th>
                <th className="text-center px-4 py-4 font-bold text-blue-700 bg-blue-50">Pro</th>
                <th className="text-center px-4 py-4 font-semibold text-gray-700 dark:text-gray-200">Kurumsal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                ['Aylık optimizasyon', '10', 'Sınırsız', 'Sınırsız'],
                ['Depolama alanı', '3 alan', 'Sınırsız', 'Sınırsız'],
                ['Konteyner tipleri', '1', 'Tümü', 'Tümü + Özel'],
                ['3D görselleştirme', '✓', '✓', '✓'],
                ['CSV dışa aktarma', '✓', '✓', '✓'],
                ['Yük planı paylaşımı', '✓', '✓', 'Özel Alan Adı'],
                ['LIFO / FIFO kuralları', '—', '✓', '✓'],
                ['Kırılganlık kuralları', '—', '✓', '✓'],
                ['Çoklu konteyner', '—', '✓', '✓'],
                ['PDF rapor', '—', '✓', 'Özel Şablon'],
                ['API erişimi', '—', 'Yakında', 'Tam Erişim'],
                ['Destek', 'Topluluk', 'E-posta', 'Telefon + SLA'],
              ].map(([feature, free, pro, ent], i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-5 py-3.5 text-gray-700 dark:text-gray-200 font-medium">{feature}</td>
                  <td className="px-4 py-3.5 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">{free}</td>
                  <td className="px-4 py-3.5 text-center font-semibold text-blue-700 bg-blue-50/40">{pro}</td>
                  <td className="px-4 py-3.5 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">{ent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-gray-50 dark:bg-gray-800 border-y border-gray-100 dark:border-gray-800 py-14 px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">
            Güvenilen Rakamlar
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '2.400+', label: 'Aktif Kullanıcı' },
              { value: '180.000+', label: 'Tamamlanan Optimizasyon' },
              { value: '%94', label: 'Müşteri Memnuniyeti' },
              { value: '₺0', label: 'Gizli Ücret' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white mb-1">Kurumsal Çözüm mü Arıyorsunuz?</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Özel entegrasyon, yönetilen altyapı ve adanmış destek ekibiyle kurumsal operasyonlarınız için özel teklif alın.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            <Users className="w-4 h-4" />
            Teklif Al
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-8">
          Sıkça Sorulan Sorular
        </h2>
        <div className="flex flex-col gap-2">
          {FAQ.map((item, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm pr-4">{item.q}</span>
                <HelpCircle className={`w-4 h-4 shrink-0 transition-colors ${openFaq === i ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
