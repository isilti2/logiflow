'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('E-posta adresi zorunludur.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Geçerli bir e-posta girin.'); return; }
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #60a5fa 1px, transparent 1px), linear-gradient(to bottom, #60a5fa 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm">LF</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Logi<span className="text-blue-600">Flow</span>
              </span>
            </Link>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Şifremi Unuttum</h1>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mt-1.5 text-center">
              E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">E-posta Gönderildi</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">E-posta görünmüyorsa spam klasörünü kontrol edin.</p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  E-posta Adresi
                </label>
                <input
                  id="email" type="email" placeholder="ornek@logiflow.io"
                  value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 dark:border-gray-700'}`}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Gönderiliyor…</>
                ) : 'Sıfırlama Bağlantısı Gönder'}
              </button>

              <div className="text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Giriş sayfasına dön
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 dark:text-gray-300 mt-6">
          © {new Date().getFullYear()} LogiFlow. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
