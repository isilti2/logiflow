'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { Key, Plus, Copy, Check, Trash2, Eye, EyeOff, X, AlertTriangle, Zap, Clock, Shield } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

/* ─── Types ──────────────────────────────────────────────── */
type ApiKeyScope = 'read' | 'write' | 'admin';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;       // ilk 8 karakter görünür
  secret: string;       // tam key — sadece oluşturulduğunda gösterilir
  scope: ApiKeyScope;
  createdAt: string;
  lastUsed: string | null;
  active: boolean;
}

/* ─── Constants ──────────────────────────────────────────── */
const SCOPE_META: Record<ApiKeyScope, { label: string; desc: string; color: string }> = {
  read:  { label: 'Okuma',   desc: 'GET endpoint\'leri, rapor ve listeleme',       color: 'bg-green-50 text-green-700 border-green-100' },
  write: { label: 'Yazma',   desc: 'Optimizasyon çalıştırma, kargo ekleme',        color: 'bg-blue-50 text-blue-700 border-blue-100' },
  admin: { label: 'Admin',   desc: 'Tüm erişim + takım ve ayar yönetimi',          color: 'bg-purple-50 text-purple-700 border-purple-100' },
};


/* ─── Page ───────────────────────────────────────────────── */
export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newScope, setNewScope] = useState<ApiKeyScope>('read');
  const [justCreated, setJustCreated] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/api-keys')
      .then((r) => r.ok ? r.json() : [])
      .then(setKeys);
  }, []);

  async function handleCreate() {
    if (!newName.trim()) { toast('Anahtar adı gerekli', 'error'); return; }
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), scope: newScope }),
    });
    if (!res.ok) { toast('Anahtar oluşturulamadı', 'error'); return; }
    const data = await res.json();
    const key: ApiKey = { ...data, secret: data.rawKey ?? '' };
    setKeys((prev) => [...prev, key]);
    setJustCreated(key);
    setShowCreate(false);
    setNewName('');
    toast(`"${key.name}" API anahtarı oluşturuldu`, 'success');
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('Kopyalandı', 'success');
    });
  }

  async function handleToggle(id: string) {
    const key = keys.find((k) => k.id === id);
    if (!key) return;
    await fetch(`/api/api-keys/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !key.active }),
    });
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, active: !k.active } : k));
    toast('Anahtar durumu güncellendi', 'success');
  }

  async function handleDelete(id: string) {
    await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setDeleteId(null);
    if (justCreated?.id === id) setJustCreated(null);
    toast('API anahtarı silindi', 'success');
  }

  const activeCount = keys.filter((k) => k.active).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="text-2xl font-black text-gray-900">
              API <span className="text-blue-600">Anahtarları</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              LogiFlow API'sine erişim için anahtarlar oluşturun ve yönetin.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Toplam Anahtar', value: keys.length,   icon: Key,    color: 'text-blue-600 bg-blue-50' },
              { label: 'Aktif',          value: activeCount,   icon: Zap,    color: 'text-green-600 bg-green-50' },
              { label: 'API Durumu',     value: 'Q2\'26',      icon: Clock,  color: 'text-amber-600 bg-amber-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coming soon banner */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-sm text-amber-700">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">API erişimi yakında aktif oluyor</p>
              <p className="text-xs mt-0.5 text-amber-600">
                Pro plan için 2026 Q2, Kurumsal için Q1 hedefleniyor.
                Anahtarlarınızı şimdiden oluşturabilir, hazır tutabilirsiniz.
              </p>
            </div>
          </div>

          {/* Just created — show full key once */}
          {justCreated && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-800">API Anahtarı Oluşturuldu — Şimdi Kopyalayın</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Bu anahtar yalnızca bir kez gösterilir. Güvenli bir yere kaydedin.
                  </p>
                </div>
                <button onClick={() => setJustCreated(null)} className="text-green-400 hover:text-green-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-white border border-green-200 rounded-xl px-4 py-2.5">
                <code className="text-xs font-mono text-gray-800 flex-1 break-all">{justCreated.secret}</code>
                <button
                  onClick={() => handleCopy(justCreated.secret)}
                  className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    copied ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {copied ? <><Check className="w-3 h-3" />Kopyalandı</> : <><Copy className="w-3 h-3" />Kopyala</>}
                </button>
              </div>
            </div>
          )}

          {/* Keys list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">API Anahtarları</h2>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Yeni Anahtar
              </button>
            </div>

            {keys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Key className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm font-medium">Henüz API anahtarı yok.</p>
                <p className="text-xs mt-1">Yeni anahtar oluşturmak için butona tıklayın.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {keys.map((k) => (
                  <div key={k.id} className={`px-6 py-4 flex items-center gap-4 ${!k.active ? 'opacity-50' : ''}`}>
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${k.active ? 'bg-blue-50' : 'bg-gray-100'}`}>
                      <Key className={`w-4 h-4 ${k.active ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-800">{k.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SCOPE_META[k.scope].color}`}>
                          {SCOPE_META[k.scope].label}
                        </span>
                        {!k.active && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Pasif</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <code className="font-mono">{k.prefix}</code>
                        <span>·</span>
                        <span>Oluşturuldu: {k.createdAt}</span>
                        {k.lastUsed && <><span>·</span><span>Son kullanım: {k.lastUsed}</span></>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Reveal secret (only if we have it stored) */}
                      {k.secret && (
                        <button
                          onClick={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Anahtarı göster/gizle"
                        >
                          {revealed[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                      {/* Copy */}
                      {k.secret && (
                        <button
                          onClick={() => handleCopy(k.secret)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Kopyala"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      {/* Toggle active */}
                      <button
                        onClick={() => handleToggle(k.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          k.active ? 'text-green-500 hover:text-red-400 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                        }`}
                        title={k.active ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      {deleteId === k.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(k.id)}
                            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-lg transition-colors">
                            Sil
                          </button>
                          <button onClick={() => setDeleteId(null)}
                            className="text-xs text-gray-500 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(k.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scope descriptions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Kapsam Açıklamaları
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(Object.entries(SCOPE_META) as [ApiKeyScope, typeof SCOPE_META[ApiKeyScope]][]).map(([scope, meta]) => (
                <div key={scope} className={`rounded-xl border p-4 ${meta.color}`}>
                  <p className="text-sm font-bold mb-1">{meta.label}</p>
                  <p className="text-xs leading-relaxed opacity-80">{meta.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-600">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-700">Güvenlik Önerileri</p>
              <ul className="text-xs text-gray-500 mt-1 space-y-0.5 list-disc list-inside">
                <li>API anahtarlarını kaynak koduna veya public repo'ya eklemeyin.</li>
                <li>Her servis için ayrı, minimum kapsamlı anahtar kullanın.</li>
                <li>Kullanılmayan anahtarları devre dışı bırakın veya silin.</li>
                <li>Anahtarı sızdırdıysanız hemen silin ve yenisini oluşturun.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Yeni API Anahtarı</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Anahtar Adı</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="örn. Üretim Servisi, CI/CD"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kapsam</label>
                  <div className="flex flex-col gap-2">
                    {(Object.entries(SCOPE_META) as [ApiKeyScope, typeof SCOPE_META[ApiKeyScope]][]).map(([scope, meta]) => (
                      <label key={scope} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        newScope === scope ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="scope"
                          value={scope}
                          checked={newScope === scope}
                          onChange={() => setNewScope(scope)}
                          className="mt-0.5 accent-blue-600"
                        />
                        <div>
                          <p className={`text-sm font-semibold ${newScope === scope ? 'text-blue-700' : 'text-gray-700'}`}>{meta.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{meta.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  <Key className="w-4 h-4" /> Anahtar Oluştur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
