'use client';

import { useState, useEffect } from 'react';
import { Package, BarChart3, Building2, Share2, Zap, ChevronRight, X, CheckCircle2 } from 'lucide-react';

const LS_KEY = 'lf_onboarded';

const STEPS = [
  {
    icon: Zap,
    color: 'blue',
    title: "LogiFlow'a Hoş Geldiniz",
    desc: 'Lojistik operasyonlarınızı tek platformda yönetin. Bu kısa tur size 2 dakikada temel özellikleri tanıtacak.',
    tip: null,
  },
  {
    icon: Package,
    color: 'blue',
    title: 'Kargo Optimizasyonu',
    desc: 'Konteyner veya kamyonunuza en uygun yükleme planını saniyeler içinde hesaplayın. 3D bin-packing algoritması ile her kutunun (x, y, z) pozisyonu belirlenir.',
    tip: 'İpucu: LIFO/FIFO sırasını ve kırılgan etiketini artık her kalem için ayrı ayarlayabilirsiniz.',
  },
  {
    icon: Building2,
    color: 'indigo',
    title: 'Yönetme & Depolama',
    desc: 'Birden fazla depo alanı tanımlayın, kargo stoğunuzu raflar ve sütunlar bazında takip edin. Excel ile toplu içe aktarma desteklenir.',
    tip: 'İpucu: Her kargoyu raf (A/B/C), sıra ve sütun bilgisiyle konumlandırabilirsiniz.',
  },
  {
    icon: BarChart3,
    color: 'purple',
    title: 'Detaylı Raporlama',
    desc: 'Haftalık, aylık ve yıllık bazda doluluk oranı trendini, CO₂ tasarrufu tahminini ve hacim başına maliyet analizini görün.',
    tip: 'İpucu: Her optimizasyon otomatik geçmişe kaydedilir, geriye dönük karşılaştırma yapabilirsiniz.',
  },
  {
    icon: Share2,
    color: 'sky',
    title: 'Yük Planı Paylaşımı',
    desc: 'Optimize edilmiş yük planlarınızı tek tıkla oluşturulan URL ile paylaşın. Alıcının hesabı olmasına gerek yok.',
    tip: 'İpucu: Paylaşım linki, konteyner doluluk oranı ve tüm kargo listesini içerir.',
  },
];

const COLOR: Record<string, { bg: string; icon: string; dot: string; btn: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   dot: 'bg-blue-600',   btn: 'bg-blue-600 hover:bg-blue-700' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', dot: 'bg-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', dot: 'bg-purple-600', btn: 'bg-purple-600 hover:bg-purple-700' },
  sky:    { bg: 'bg-sky-50',    icon: 'text-sky-600',    dot: 'bg-sky-600',    btn: 'bg-sky-600 hover:bg-sky-700' },
};

export default function OnboardingWizard() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem(LS_KEY);
      if (!done) setVisible(true);
    }
  }, []);

  function finish() {
    localStorage.setItem(LS_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const c = COLOR[current.color];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={finish} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors z-10"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7">
          {/* Icon */}
          <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mb-5`}>
            <Icon className={`w-7 h-7 ${c.icon}`} />
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-3">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? `w-5 ${c.dot}` : i < step ? 'w-1.5 bg-gray-300' : 'w-1.5 bg-gray-100'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <h2 className="text-xl font-black text-gray-900 mb-2">{current.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">{current.desc}</p>

          {current.tip && (
            <div className={`flex items-start gap-2 ${c.bg} rounded-xl px-3 py-2.5 mb-4`}>
              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${c.icon}`} />
              <p className={`text-xs font-medium ${c.icon}`}>{current.tip}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Geri
              </button>
            )}
            <button
              onClick={() => isLast ? finish() : setStep((s) => s + 1)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${c.btn}`}
            >
              {isLast ? (
                <>Başlayalım <Zap className="w-4 h-4" /></>
              ) : (
                <>Sonraki <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={finish}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
            >
              Turu atla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
