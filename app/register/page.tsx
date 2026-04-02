'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Users, TrendingUp, Lock } from 'lucide-react';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]       = useState<Partial<typeof form & { server: string }>>({});
  const [loading, setLoading]     = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right,#60a5fa 1px,transparent 1px),linear-gradient(to bottom,#60a5fa 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10 pointer-events-none" aria-hidden="true" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">LF</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Logi<span className="text-blue-400">Flow</span>
          </span>
        </Link>

        {/* Center copy */}
        <div className="relative">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Hemen ücretsiz<br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              başlayın.
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm">
            Kredi kartı gerekmez. 14 gün ücretsiz Pro deneme — sonrasında dilediğiniz planı seçin.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: TrendingUp, text: 'Yük optimizasyonunda %30\'a kadar tasarruf' },
              { icon: Users,      text: 'Takımınızla gerçek zamanlı iş birliği' },
              { icon: Lock,       text: 'Verileriniz şifreli ve güvende' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-gray-600">
          © {new Date().getFullYear()} LogiFlow. Tüm hakları saklıdır.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-black text-xs">LF</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900">Hesap Oluştur</h1>
            <p className="text-gray-500 text-sm mt-1.5">Ücretsiz hesabınızla hemen başlayın.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Ad Soyad
              </label>
              <input
                id="name" type="text" autoComplete="name"
                placeholder="Adınız Soyadınız"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-posta
              </label>
              <input
                id="email" type="email" autoComplete="email"
                placeholder="ornek@logiflow.io"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                Şifre Tekrar
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => handleChange('confirm', e.target.value)}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${errors.confirm ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>

            {/* Server error */}
            {errors.server && (
              <div role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                {errors.server}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-sm shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" /> Hesap oluşturuluyor…</>
              ) : 'Hesap Oluştur'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">veya</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
