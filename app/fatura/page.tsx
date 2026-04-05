'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import {
  CreditCard, CheckCircle2, LogOut, Zap, Shield, BarChart3,
  Users, Package, ArrowRight, Star,
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '₺0',
    period: '/ay',
    desc: 'Bireysel kullanıcılar için',
    color: 'gray',
    features: [
      '50 optimizasyon/ay',
      '1 depo alanı',
      '3D görüntüleyici',
      'Optimizasyon geçmişi (son 10)',
      'CSV dışa aktarma',
    ],
    missing: ['Detaylı raporlama', 'Takım üyeleri', 'API erişimi', 'Öncelikli destek'],
    cta: 'Mevcut Plan',
    popular: false,
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '₺299',
    period: '/ay',
    desc: 'Büyüyen işletmeler için',
    color: 'blue',
    features: [
      'Sınırsız optimizasyon',
      '10 depo alanı',
      '3D görüntüleyici + paylaşım',
      'Sınırsız geçmiş',
      'CSV / PDF dışa aktarma',
      'Detaylı raporlama',
      '5 takım üyesi',
      'API erişimi',
    ],
    missing: ['Öncelikli destek', 'Özel entegrasyon'],
    cta: 'Pro\'ya Geç',
    popular: true,
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    price: 'Özel',
    period: '',
    desc: 'Kurumsal müşteriler için',
    color: 'indigo',
    features: [
      'Sınırsız her şey',
      'Sınırsız depo alanı',
      'Özel entegrasyon & API',
      'Sınırsız takım üyesi',
      'SLA garantisi',
      'Öncelikli & özel destek',
      'Özel eğitim',
      'Beyaz etiket seçeneği',
    ],
    missing: [],
    cta: 'Satış Ekibiyle Görüş',
    popular: false,
  },
];

const USAGE_STATS = [
  { icon: Zap,      label: 'Bu ay optimizasyon', used: 12,  total: 50  },
  { icon: Package,  label: 'Depo alanı',          used: 1,   total: 1   },
  { icon: BarChart3,label: 'API isteği',           used: 0,   total: 0   },
  { icon: Users,    label: 'Takım üyesi',          used: 0,   total: 0   },
];

const INVOICES = [
  { date: '01 Mar 2026', amount: '₺0', status: 'Ödendi', plan: 'Free' },
  { date: '01 Şub 2026', amount: '₺0', status: 'Ödendi', plan: 'Free' },
  { date: '01 Oca 2026', amount: '₺0', status: 'Ödendi', plan: 'Free' },
];

export default function FaturaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => {
      if (r.status === 401) router.replace('/login');
      else setLoading(false);
    });
  }, [router]);

  function handleUpgrade(planKey: string) {
    if (planKey === 'free' || planKey === currentPlan) return;
    if (planKey === 'enterprise') {
      window.location.href = 'mailto:sales@logiflow.io?subject=Enterprise Plan Talebi';
      return;
    }
    setUpgrading(planKey);
    setTimeout(() => {
      setUpgrading(null);
      alert('Ödeme altyapısı yakında aktif olacak. Şimdilik Free plan üzerindeysiniz.');
    }, 1200);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-black text-xs">LF</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/profil" className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors">
              ← Profilim
            </Link>
            <button
              onClick={async () => { await logout(); window.location.href = '/'; }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Plan & Fatura' }]} className="mb-2" />

        {/* Hero */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Fatura & Abonelik</h1>
            <p className="text-sm text-gray-500 mt-0.5">Planınızı yönetin ve kullanım durumunuzu takip edin.</p>
          </div>
        </div>

        {/* Current plan banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">Mevcut Plan: <span className="text-blue-600">Free</span></p>
            <p className="text-xs text-gray-500 mt-0.5">Daha fazla özellik için Pro plana geçin.</p>
          </div>
          <button
            onClick={() => handleUpgrade('pro')}
            className="shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Pro&apos;ya Geç <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Usage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-5">Bu Ayki Kullanım</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {USAGE_STATS.map(({ icon: Icon, label, used, total }) => (
              <div key={label} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {used}
                  {total > 0 && <span className="text-sm text-gray-500 font-medium"> / {total}</span>}
                </p>
                {total > 0 && (
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${(used / total) >= 0.8 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, (used / total) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Plan comparison */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-4">Planlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.key === currentPlan;
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.key}
                  className={`relative bg-white rounded-2xl border shadow-sm p-6 flex flex-col ${
                    isPopular ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        <Star className="w-3 h-3" /> En Popüler
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{plan.label}</p>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                      {plan.period && <span className="text-sm text-gray-500 mb-1">{plan.period}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                  </div>

                  <ul className="flex flex-col gap-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300 line-through">
                        <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={isCurrent || upgrading === plan.key}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {upgrading === plan.key ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        İşleniyor…
                      </span>
                    ) : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Fatura Geçmişi</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Tarih', 'Plan', 'Tutar', 'Durum'].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {INVOICES.map((inv, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-700 font-medium">{inv.date}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{inv.plan}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-700 font-mono">{inv.amount}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 text-xs text-gray-500 border-t border-gray-100">{INVOICES.length} kayıt</div>
        </div>

      </main>
    </div>
  );
}
