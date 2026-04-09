'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, Mail, Phone, MapPin, Clock, MessageSquare, Zap } from 'lucide-react';

const CONTACT_ITEMS = [
  { icon: Mail,   label: 'E-posta',           value: 'hello@logiflow.io',        href: 'mailto:hello@logiflow.io' },
  { icon: Phone,  label: 'Telefon',            value: '+90 (212) 555 00 00',      href: 'tel:+902125550000' },
  { icon: MapPin, label: 'Konum',              value: 'Levent, İstanbul',          href: null },
  { icon: Clock,  label: 'Çalışma Saatleri',   value: 'Hft içi 09:00 – 18:00',   href: null },
];

const KONULAR = ['Teknik Destek', 'Fiyatlandırma', 'İş Birliği', 'Geri Bildirim', 'Diğer'];

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors]   = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())    e.name    = 'Ad Soyad zorunludur.';
    if (!form.email.trim())   e.email   = 'E-posta zorunludur.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Geçerli bir e-posta girin.';
    if (!form.message.trim()) e.message = 'Mesaj zorunludur.';
    return e;
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 900);
  }

  function handleChange(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  const inputCls = (field: keyof typeof form) =>
    `w-full px-4 py-3 border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 bg-gray-50/50 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${
      errors[field] ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/20' : 'border-gray-200 dark:border-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#03060f] overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-4 py-2 rounded-full mb-6">
            İletişim
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
            Bize <span className="text-blue-400">Ulaşın</span>
          </h1>
          <p className="text-lg text-gray-400 dark:text-gray-500 max-w-xl mx-auto leading-relaxed">
            Sorularınız, önerileriniz veya iş birliği teklifleriniz için buradayız. Ortalama yanıt süremiz 30 dakika.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #ffffff)' }} />
      </section>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* ── Sol panel ── */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">İletişim Bilgileri</h2>
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm">Aşağıdaki kanallardan bize doğrudan ulaşabilirsiniz.</p>
              </div>

              <div className="space-y-3">
                {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }) => {
                  const inner = (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-200 dark:hover:border-gray-700 dark:border-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">{value}</p>
                      </div>
                    </div>
                  );
                  return href
                    ? <a key={label} href={href}>{inner}</a>
                    : <div key={label}>{inner}</div>;
                })}
              </div>

              {/* Hızlı destek kartı */}
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-bold text-white text-sm">Hızlı Destek</p>
                  </div>
                  <p className="text-blue-100 text-sm leading-relaxed mb-4">
                    Teknik sorunlar için mesai saatleri içinde <strong className="text-white">30 dakika</strong> içinde yanıt alırsınız.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-blue-200">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    Destek hattı aktif
                  </div>
                </div>
              </div>

              {/* Canlı sohbet */}
              <div className="flex items-center gap-4 p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Canlı Sohbet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Sağ alttaki simgeden bize yazın.</p>
                </div>
              </div>
            </div>

            {/* ── Form paneli ── */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-8 sm:p-10">
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Mesajınız İletildi!</h3>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm max-w-xs leading-relaxed">
                      En kısa sürede <strong className="text-gray-700 dark:text-gray-200">{form.email}</strong> adresine dönüş yapacağız.
                    </p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                      className="mt-8 text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 hover:border-blue-200 px-5 py-2.5 rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      ← Yeni mesaj gönder
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Mesaj Gönderin</h2>
                      <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mt-1.5">Tüm alanları doldurun, en kısa sürede yanıt vereceğiz.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="ct-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Ad Soyad <span className="text-red-400">*</span>
                          </label>
                          <input id="ct-name" type="text" placeholder="Adınız Soyadınız"
                            value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                            className={inputCls('name')} />
                          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="ct-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            E-posta <span className="text-red-400">*</span>
                          </label>
                          <input id="ct-email" type="email" placeholder="ornek@email.com"
                            value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                            className={inputCls('email')} />
                          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="ct-subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Konu</label>
                        <select id="ct-subject" value={form.subject} onChange={(e) => handleChange('subject', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white bg-gray-50/50 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none">
                          <option value="">Konu seçin (isteğe bağlı)</option>
                          {KONULAR.map(k => <option key={k}>{k}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="ct-message" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Mesaj <span className="text-red-400">*</span>
                        </label>
                        <textarea id="ct-message" rows={5} placeholder="Mesajınızı buraya yazın…"
                          value={form.message} onChange={(e) => handleChange('message', e.target.value)}
                          className={`${inputCls('message')} resize-none`} />
                        {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                      </div>

                      <button type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        {loading ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gönderiliyor…</>
                        ) : 'Mesaj Gönder'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
