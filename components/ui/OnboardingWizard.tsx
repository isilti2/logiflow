'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Package, BarChart3, Building2, Share2, Zap,
  ChevronRight, X, CheckCircle2, Calculator, Navigation, Truck,
} from 'lucide-react';

const LS_KEY = 'lf_onboarded_v2';

const STEPS = [
  {
    icon: Zap,
    color: 'blue',
    title: "LogiFlow'a Hoş Geldiniz",
    desc: 'Lojistik operasyonlarınızı tek platformda yönetin. Bu kısa tur size 2 dakikada temel özellikleri tanıtacak.',
    tip: null,
    cta: null,
  },
  {
    icon: Package,
    color: 'blue',
    title: 'Kargo & Depolama',
    desc: 'Konteyner veya kamyonunuza en uygun yükleme planını saniyeler içinde hesaplayın. Birden fazla depo alanını raflar ve sütunlar bazında takip edin.',
    tip: '3D bin-packing ile her kutunun pozisyonu belirlenir; LIFO/FIFO ve kırılgan etiketi desteklenir.',
    cta: null,
  },
  {
    icon: Calculator,
    color: 'green',
    title: 'Lojistik Muhasebe',
    desc: 'Sefer gelir/gider takibi, otomatik fatura oluşturma, müşteri cari hesap ve personel bordrosu — tek sayfada.',
    tip: 'Sefer tamamlandığında gelir otomatik kayıt oluşturur; yakıt girişi anında gider olarak yansır.',
    cta: null,
  },
  {
    icon: Navigation,
    color: 'teal',
    title: 'Canlı Konum & Şoför Paneli',
    desc: 'Şoförler telefondaki Şoför Paneli üzerinden konum paylaşır. Siz harita üzerinde anlık takip edersiniz.',
    tip: 'GPS sefer bazında kaydedilir; rota geçmişini ve hız verilerini her sefer için ayrı görebilirsiniz.',
    cta: null,
  },
  {
    icon: Share2,
    color: 'sky',
    title: 'Raporlama & Paylaşım',
    desc: 'Araç, sefer ve müşteri bazlı kar/zarar raporları alın. Optimize edilmiş yük planlarını tek tıkla paylaşın.',
    tip: 'Her optimizasyon geçmişe kaydedilir. Paylaşım linki için alıcının hesabı olmasına gerek yok.',
    cta: '/dashboard',
  },
];

const COLOR: Record<string, { bg: string; icon: string; dot: string; btn: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   dot: 'bg-blue-600',   btn: 'bg-blue-600 hover:bg-blue-700' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', dot: 'bg-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', dot: 'bg-purple-600', btn: 'bg-purple-600 hover:bg-purple-700' },
  sky:    { bg: 'bg-sky-50',    icon: 'text-sky-600',    dot: 'bg-sky-600',    btn: 'bg-sky-600 hover:bg-sky-700' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  dot: 'bg-green-600',  btn: 'bg-green-600 hover:bg-green-700' },
  teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   dot: 'bg-teal-600',   btn: 'bg-teal-600 hover:bg-teal-700' },
};

export default function OnboardingWizard() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem(LS_KEY);
      if (!done) setVisible(true);
    }
  }, []);

  /* Focus trap: Tab tuşu modal içinde kalır */
  useEffect(() => {
    if (!visible) return;
    const el = dialogRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { finish(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, step]); // step değişince focusable elementler yeniden hesapla

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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={finish} aria-hidden="true" />

      {/* Card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label={`Adım ${step + 1} / ${STEPS.length}`}
          />
        </div>

        {/* Close */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
          aria-label="Turu kapat"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="p-7">
          {/* Icon */}
          <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mb-5`}>
            <Icon className={`w-7 h-7 ${c.icon}`} aria-hidden="true" />
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-3" aria-hidden="true">
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
          <h2 id="onboarding-title" className="text-xl font-black text-gray-900 mb-2">{current.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">{current.desc}</p>

          {current.tip && (
            <div className={`flex items-start gap-2 ${c.bg} rounded-xl px-3 py-2.5 mb-4`}>
              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${c.icon}`} aria-hidden="true" />
              <p className={`text-xs font-medium ${c.icon}`}>{current.tip}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Geri
              </button>
            )}
            <button
              onClick={() => isLast ? finish() : setStep((s) => s + 1)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${c.btn}`}
            >
              {isLast ? (
                <><Zap className="w-4 h-4" aria-hidden="true" /> Haydi Başlayalım!</>
              ) : (
                <>Sonraki <ChevronRight className="w-4 h-4" aria-hidden="true" /></>
              )}
            </button>
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={finish}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors focus:outline-none focus:underline"
            >
              Turu atla
            </button>
          )}

          {/* Step counter */}
          <p className="text-center text-xs text-gray-300 mt-3">
            {step + 1} / {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
