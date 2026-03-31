'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('E-posta adresi zorunludur.'); return; }
    if (!EMAIL_RE.test(email)) { setError('Geçerli bir e-posta adresi girin.'); return; }
    if (!password.trim()) { setError('Şifre zorunludur.'); return; }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Giriş yapılamadı.'); return; }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #60a5fa 1px, transparent 1px), linear-gradient(to bottom, #60a5fa 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm">LF</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Logi<span className="text-blue-600">Flow</span>
              </span>
            </Link>
            <h1 className="text-2xl font-black text-gray-900">Giriş Yap</h1>
            <p className="text-gray-500 text-sm mt-1.5 text-center">
              Hesabınıza erişmek için giriş yapın.
            </p>
          </div>

          {/* Demo info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-xs text-blue-700 text-center">
            Demo: herhangi bir e-posta ve şifre girin.<br />
            <span className="text-blue-500">Admin: <strong>admin@logiflow.io</strong></span>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ornek@logiflow.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                  Şifremi unuttum
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Giriş yapılıyor…
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">veya</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Hesap oluştur
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()} LogiFlow. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
