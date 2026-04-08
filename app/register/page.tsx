'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Check } from 'lucide-react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Spinner } from '@/components/ui/Spinner';

function RegisterForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState<Partial<typeof form & { server: string }>>({});
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) setForm((p) => ({ ...p, email }));
  }, [searchParams]);

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())     e.name     = 'Ad Soyad zorunludur.';
    if (!form.email.trim())    e.email    = 'E-posta zorunludur.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Geçerli bir e-posta girin.';
    if (form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalıdır.';
    if (form.password !== form.confirm) e.confirm = 'Şifreler eşleşmiyor.';
    return e;
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, name: form.name }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ server: data.error } as typeof errors); return; }
      window.location.href = '/dashboard';
    } catch {
      setErrors({ server: 'Sunucuya bağlanılamadı.' } as typeof errors);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key as keyof typeof errors]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Zayıf', 'Orta', 'Güçlü'][pwStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400'][pwStrength];

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Sol panel ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-[#03060f] flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }}
          aria-hidden="true" />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.1) 0%, transparent 70%)' }}
          aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)' }}
          aria-hidden="true" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">LF</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Logi<span className="text-blue-400">Flow</span>
          </span>
        </Link>

        {/* Orta içerik */}
        <div className="relative space-y-8">
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">Ücretsiz Başlayın</p>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4">
              Hemen ücretsiz<br />
              <span style={{ background: 'linear-gradient(135deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                başlayın.
              </span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Kredi kartı gerekmez. 30 saniyede kayıt, anında kullanıma hazır.
            </p>
          </div>

          {/* Faydalar listesi */}
          <div className="space-y-3">
            {[
              { text: 'Yük optimizasyonunda %30\'a kadar tasarruf', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
              { text: 'Canlı filo takibi — uygulama gerektirmez', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
              { text: 'Tüm veriler şifreli, KVKK uyumlu', color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
              { text: '9 entegre modül, sıfır kurulum', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
            ].map(({ text, color }) => (
              <div key={text} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${color}`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-gray-400">{text}</span>
              </div>
            ))}
          </div>

          {/* Mini sosyal kanıt */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
                {['AY', 'EK', 'MD'].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 border-2 border-[#03060f] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{i}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">+200 şirket bu ay katıldı</p>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-gray-600 ml-1.5">4.9/5 puan</span>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-gray-700">
          © {new Date().getFullYear()} LogiFlow. Tüm hakları saklıdır.
        </p>
      </div>

      {/* ── Sağ panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[380px]">

          {/* Mobil logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-black text-xs">LF</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <div className="mb-7">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hesap Oluştur</h1>
            <p className="text-gray-500 text-sm mt-2">Ücretsiz hesabınızla hemen başlayın.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>

            {/* Ad Soyad */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Ad Soyad</label>
              <input
                id="name" type="text" autoComplete="name"
                placeholder="Adınız Soyadınız"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${errors.name ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200'}`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* E-posta */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700">E-posta</label>
              <input
                id="reg-email" type="email" autoComplete="email"
                placeholder="ornek@logiflow.io"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${errors.email ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200'}`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Şifre */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700">Şifre</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${errors.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`}
                />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Şifre gücü */}
              {form.password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((lvl) => (
                      <div key={lvl} className={`h-1 flex-1 rounded-full transition-all duration-300 ${pwStrength >= lvl ? strengthColor : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <p className={`text-[11px] font-medium ${['', 'text-red-500', 'text-amber-500', 'text-emerald-500'][pwStrength]}`}>{strengthLabel}</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Şifre tekrar */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="block text-sm font-semibold text-gray-700">Şifre Tekrar</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => handleChange('confirm', e.target.value)}
                  className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${errors.confirm ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`}
                />
                <button type="button" onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
            </div>

            {errors.server && (
              <ErrorAlert message={errors.server} onDismiss={() => setErrors((p) => ({ ...p, server: undefined }))} />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-1"
            >
              {loading ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Hesap oluşturuluyor…</> : 'Hesap Oluştur — Ücretsiz'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">veya</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Giriş Yap
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL ile güvenli bağlantı
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
