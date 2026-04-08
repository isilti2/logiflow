'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Spinner } from '@/components/ui/Spinner';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError('');
    if (!email.trim())           { setError('E-posta adresi zorunludur.'); return; }
    if (!EMAIL_RE.test(email))   { setError('Geçerli bir e-posta adresi girin.'); return; }
    if (!password.trim())        { setError('Şifre zorunludur.'); return; }
    if (password.length < 6)     { setError('Şifre en az 6 karakter olmalıdır.'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Giriş yapılamadı.'); return; }
      window.location.href = '/dashboard';
    } catch {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Sol panel — dark, immersive ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-[#03060f] flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }}
          aria-hidden="true" />
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.1) 0%, transparent 70%)' }}
          aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)' }}
          aria-hidden="true" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 w-fit group">
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
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">Platform Önizleme</p>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4">
              Lojistiğinizi<br />
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                kontrol altında
              </span><br />
              tutun.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              3D kargo optimizasyonu, canlı filo takibi ve lojistik muhasebesi tek platformda.
            </p>
          </div>

          {/* Mini dashboard önizleme */}
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))' }} />
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 space-y-3">
              {/* Başlık satırı */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400">Bu Ay</p>
                <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">▲ %12 artış</span>
              </div>
              {/* Metrik satırlar */}
              {[
                { label: 'Aktif Sefer', val: '12', bar: 75, color: '#3b82f6' },
                { label: 'Toplam Gelir', val: '₺184K', bar: 91, color: '#10b981' },
                { label: 'Canlı Araç', val: '5', bar: 50, color: '#8b5cf6' },
              ].map(({ label, val, bar, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-white">{val}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${bar}%`, background: color, opacity: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Güven göstergeleri */}
          <div className="flex flex-wrap gap-3">
            {['🔒 KVKK Uyumlu', '⚡ <1sn Hesaplama', '🌍 Türkiye\'de Barındırılıyor'].map(t => (
              <span key={t} className="text-xs text-gray-600 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* Alt */}
        <p className="relative text-xs text-gray-700">
          © {new Date().getFullYear()} LogiFlow. Tüm hakları saklıdır.
        </p>
      </div>

      {/* ── Sağ panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[380px]">

          {/* Mobil logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-black text-xs">LF</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tekrar hoş geldiniz</h1>
            <p className="text-gray-500 text-sm mt-2">Hesabınıza giriş yapın ve devam edin.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                E-posta
              </label>
              <input
                id="email" type="email" autoComplete="email"
                placeholder="ornek@logiflow.io"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Şifre</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-1"
            >
              {loading ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Giriş yapılıyor…</> : 'Giriş Yap'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">veya</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Ücretsiz oluştur
            </Link>
          </p>

          {/* Alt güven */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
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
