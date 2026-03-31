'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, Mail, Phone, MapPin, Clock } from 'lucide-react';

const contactDetails = [
  { icon: Mail,    label: 'E-posta', value: 'hello@logiflow.io' },
  { icon: Phone,   label: 'Telefon', value: '+90 (212) 555 00 00' },
  { icon: MapPin,  label: 'Konum',   value: 'Levent, İstanbul, Türkiye' },
  { icon: Clock,   label: 'Çalışma Saatleri', value: 'Hft içi 09:00 – 18:00' },
];

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  }

  function handleChange(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">İletişim</span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Bize <span className="text-blue-600">Ulaşın</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Sorularınız, geri bildirimleriniz veya iş birliği teklifleriniz için aşağıdaki formu doldurun.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">İletişim Bilgileri</h2>
              <p className="text-gray-500 mb-8">Aşağıdaki kanallardan bize doğrudan ulaşabilirsiniz.</p>

              <div className="space-y-5">
                {contactDetails.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                      <p className="text-gray-800 font-medium mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl text-white">
                <h3 className="font-bold mb-2">Hızlı Destek</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Acil teknik sorunlar için destek hattımız mesai saatleri içinde 30 dakika içinde yanıt veriyor.
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Mesajınız İletildi!</h3>
                  <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                    En kısa sürede <strong>{form.email}</strong> adresine dönüş yapacağız. Teşekkürler!
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Yeni mesaj gönder
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Mesaj Gönderin</h2>
                  <form className="space-y-4" onSubmit={handleSubmit} noValidate>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Ad Soyad <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="name" type="text" placeholder="Adınız ve soyadınız"
                        value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        E-posta <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="email" type="email" placeholder="ornek@email.com"
                        value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">Konu</label>
                      <select
                        id="subject" value={form.subject} onChange={(e) => handleChange('subject', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                      >
                        <option value="">Konu seçin (isteğe bağlı)</option>
                        <option>Teknik Destek</option>
                        <option>Fiyatlandırma</option>
                        <option>İş Birliği</option>
                        <option>Geri Bildirim</option>
                        <option>Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mesaj <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="message" rows={5} placeholder="Mesajınızı buraya yazın..."
                        value={form.message} onChange={(e) => handleChange('message', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                    </div>

                    <button
                      type="submit" disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Gönderiliyor…</>
                      ) : 'Gönder'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
