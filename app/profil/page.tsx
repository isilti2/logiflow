'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import {
  LogOut, User, Mail, Building2, Shield, Key,
  Bell, ChevronRight, Edit2, Check, X, CreditCard, Trash2,
} from 'lucide-react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Spinner } from '@/components/ui/Spinner';
import { Breadcrumb } from '@/components/ui/Breadcrumb';


export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(true);
  const [admin, setAdmin]       = useState(false);
  const [editing, setEditing]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [profile, setProfile]   = useState({ name: '', email: '', dept: 'Lojistik', phone: '' });
  const [draft, setDraft]       = useState(profile);
  const [notifs, setNotifs]     = useState({ email: true, activity: true, updates: false });
  const [pwOpen, setPwOpen]     = useState(false);
  const [pwForm, setPwForm]     = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError]   = useState('');
  const [pwSaved, setPwSaved]   = useState(false);
  const [activity, setActivity] = useState<{ label: string; time: string; module: string }[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [meRes, optsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/optimizations'),
      ]);
      if (meRes.status === 401) { router.replace('/login'); return; }
      const me = await meRes.json();
      const p = { name: me.name ?? '', email: me.email ?? '', dept: 'Lojistik', phone: '' };
      setProfile(p);
      setDraft(p);
      setAdmin(me.role === 'admin');

      if (optsRes.ok) {
        const opts = await optsRes.json() as { date: string; containerLabel: string; placedCount: number }[];
        setActivity(opts.slice(0, 5).map((r) => ({
          label: `Kargo optimizasyonu — ${r.containerLabel} (${r.placedCount} birim)`,
          time: r.date,
          module: 'Optimizasyon',
        })));
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave() {
    await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: draft.name }),
    });
    setProfile((p) => ({ ...p, name: draft.name }));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleCancel() {
    setDraft(profile);
    setEditing(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const res = await fetch('/api/auth/me', { method: 'DELETE' });
    if (res.ok) { window.location.href = '/'; }
    else { setDeleting(false); setDeleteConfirm(false); }
  }

  async function handlePwSave() {
    setPwError('');
    if (!pwForm.current.trim()) { setPwError('Mevcut şifre zorunludur.'); return; }
    if (pwForm.next.length < 6) { setPwError('Yeni şifre en az 6 karakter olmalıdır.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Yeni şifreler eşleşmiyor.'); return; }
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    if (!res.ok) { const d = await res.json(); setPwError(d.error ?? 'Bir hata oluştu'); return; }
    setPwSaved(true);
    setPwForm({ current: '', next: '', confirm: '' });
    setPwOpen(false);
    setTimeout(() => setPwSaved(false), 3000);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-black text-xs">LF</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors">
              ← Dashboard
            </Link>
            <button
              onClick={async () => { await logout(); window.location.href = '/'; }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Hesabım' }]} className="mb-2" />

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-2xl font-black">{(profile.name || profile.email).charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-gray-900">{profile.name || profile.email}</h1>
              {admin && (
                <span className="flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
              {saved && (
                <span className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Kaydedildi
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{profile.email}</p>
            <p className="text-gray-500 text-xs mt-0.5">{profile.dept}</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 px-4 py-2 rounded-xl transition-colors">
              <Edit2 className="w-3.5 h-3.5" /> Düzenle
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
                <Check className="w-3.5 h-3.5" /> Kaydet
              </button>
              <button onClick={handleCancel} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: info + security */}
          <div className="lg:col-span-2 space-y-5">

            {/* Profile info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Profil Bilgileri</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Ad Soyad',   key: 'name',  icon: User,     type: 'text',  placeholder: 'Ad Soyad',              editable: true  },
                  { label: 'E-posta',    key: 'email', icon: Mail,     type: 'email', placeholder: 'ornek@logiflow.io',     editable: false },
                  { label: 'Departman',  key: 'dept',  icon: Building2, type: 'text', placeholder: 'Departmanınız',         editable: true  },
                  { label: 'Telefon',    key: 'phone', icon: Key,      type: 'tel',   placeholder: '+90 5xx xxx xx xx',     editable: true  },
                ].map(({ label, key, icon: Icon, type, placeholder, editable }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      {editing && editable ? (
                        <input
                          type={type}
                          value={draft[key as keyof typeof draft]}
                          onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 font-medium truncate">
                          {profile[key as keyof typeof profile] || <span className="text-gray-300 font-normal">—</span>}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Güvenlik</h2>
              </div>
              <div className="space-y-3">
                <div className="py-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Şifre</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pwSaved ? '✓ Şifre güncellendi' : 'Şifrenizi değiştirin'}</p>
                    </div>
                    <button
                      onClick={() => { setPwOpen((o) => !o); setPwError(''); }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      {pwOpen ? 'İptal' : 'Değiştir'}
                    </button>
                  </div>
                  {pwOpen && (
                    <div className="mt-3 space-y-2">
                      {[
                        { key: 'current', placeholder: 'Mevcut şifre' },
                        { key: 'next',    placeholder: 'Yeni şifre (min. 6)' },
                        { key: 'confirm', placeholder: 'Yeni şifre tekrar' },
                      ].map(({ key, placeholder }) => (
                        <input key={key} type="password" placeholder={placeholder}
                          value={pwForm[key as keyof typeof pwForm]}
                          onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                      {pwError && <ErrorAlert message={pwError} onDismiss={() => setPwError('')} />}
                      <button onClick={handlePwSave}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
                        <Check className="w-3 h-3" /> Şifreyi Güncelle
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">İki Faktörlü Doğrulama</p>
                    <p className="text-xs text-gray-500 mt-0.5">Hesabınızı ekstra koruma altına alın</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Kapalı</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Oturum Yönetimi</p>
                    <p className="text-xs text-gray-500 mt-0.5">Aktif oturum sayısı: 1</p>
                  </div>
                  <button className="text-xs font-semibold text-red-500 hover:text-red-600 border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors">
                    Tümünü Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: notifications + quick links */}
          <div className="space-y-5">

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Bildirimler</h2>
              </div>
              <div className="space-y-1">
                {[
                  { key: 'email',    label: 'E-posta bildirimleri' },
                  { key: 'activity', label: 'Aktivite özeti' },
                  { key: 'updates',  label: 'Ürün güncellemeleri' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between py-2.5 cursor-pointer">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div
                      onClick={() => setNotifs((p) => ({ ...p, [key]: !p[key as keyof typeof notifs] }))}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${notifs[key as keyof typeof notifs] ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${notifs[key as keyof typeof notifs] ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Hızlı Erişim</h2>
              <div className="space-y-1">
                {[
                  { label: 'Dashboard',          href: '/dashboard' },
                  { label: 'Kargo Optimizasyon', href: '/features/kargo-optimizasyon' },
                  { label: 'Depolama',           href: '/depolama' },
                  { label: 'Raporlama',          href: '/features/detayli-raporlama' },
                  { label: 'Fatura & Abonelik',  href: '/fatura' },
                  ...(admin ? [{ label: 'Admin Panel', href: '/admin' }] : []),
                ].map(({ label, href }) => (
                  <Link key={href} href={href}
                    className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors">
                    {label}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-gray-900">Tehlikeli Bölge</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Hesabı Sil</p>
              <p className="text-xs text-gray-500 mt-0.5">Tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.</p>
            </div>
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)}
                className="text-xs font-semibold text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors shrink-0">
                Hesabı Sil
              </button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setDeleteConfirm(false)}
                  className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                  Vazgeç
                </button>
                <button onClick={handleDeleteAccount} disabled={deleting}
                  className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl transition-colors disabled:opacity-70">
                  {deleting ? 'Siliniyor…' : 'Evet, Sil'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Son Aktivitelerim</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <p className="text-sm">Henüz aktivite yok</p>
                <Link href="/features/kargo-optimizasyon" className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700">
                  İlk optimizasyonu başlat →
                </Link>
              </div>
            ) : activity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.module}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
