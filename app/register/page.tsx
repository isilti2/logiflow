'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<typeof form & { server: string }>>({});
  const [loading, setLoading] = useState(false);

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
      router.push('/dashboard');
      router.refresh();
    } catch {
      setErrors({ server: 'Sunucuya bağlanılamadı.' } as typeof errors);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  const fields = [
    { key: 'name',     label: 'Ad Soyad',       type: 'text',     placeholder: 'Adınız Soyadınız' },
    { key: 'email',    label: 'E-posta',         type: 'email',    placeholder: 'ornek@logiflow.io' },
    { key: 'password', label: 'Şifre',           type: 'password', placeholder: '••••••••' },
    { key: 'confirm',  label: 'Şifre Tekrar',    type: 'password', placeholder: '••••••••' },
  ] as const;

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
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Logi<span className="text-blue-600">Flow</span>
              </span>
            </Link>
            <h1 className="text-2xl font-black text-gray-900">Hesap Oluştur</h1>
            <p className="text-gray-500 text-sm mt-1.5 text-center">
              Ücretsiz hesabınızla hemen başlayın.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {label} <span className="text-red-400">*</span>
                </label>
                <input
                  id={key} type={type} placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors[key] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}

            <div className="pt-1">
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Hesap oluşturuluyor…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Hesap Oluştur</>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Giriş Yap
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
