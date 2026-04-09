'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';
import {
  Users, UserPlus, Copy, Check, Trash2, Crown, Eye, Edit3,
  Mail, Shield, X, ChevronDown, Link as LinkIcon, type LucideIcon,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

/* ─── Types ──────────────────────────────────────────────── */
type Role = 'admin' | 'editor' | 'viewer';
type MemberStatus = 'active' | 'invited';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: Role;
  joinedAt: string;
  status: MemberStatus;
}

/* ─── Constants ──────────────────────────────────────────── */
const ROLE_META: Record<Role, { label: string; desc: string; icon: LucideIcon; color: string }> = {
  admin:  { label: 'Admin',   desc: 'Tüm ayarlar ve üye yönetimi',   icon: Crown,  color: 'text-amber-600 bg-amber-50 border-amber-100' },
  editor: { label: 'Editör',  desc: 'Optimizasyon ve depo düzenleme', icon: Edit3,  color: 'text-blue-600 bg-blue-50 border-blue-100' },
  viewer: { label: 'Görüntüleyici', desc: 'Yalnızca okuma erişimi',  icon: Eye,    color: 'text-gray-600 dark:text-gray-300 bg-gray-100 border-gray-200 dark:border-gray-700' },
};

function makeInviteToken(email: string, role: Role): string {
  const payload = { email, role, invitedAt: new Date().toISOString(), exp: Date.now() + 7 * 24 * 3600 * 1000 };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

/* ─── Role badge ─────────────────────────────────────────── */
function RoleBadge({ role }: { role: Role }) {
  const m = ROLE_META[role];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${m.color}`}>
      <Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function TakimPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role>('viewer');

  useEffect(() => {
    fetch('/api/team')
      .then((r) => r.ok ? r.json() : [])
      .then(setMembers);
  }, []);

  async function handleGenerateLink() {
    if (!inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      toast('Geçerli bir e-posta adresi girin.', 'error'); return;
    }
    const token = makeInviteToken(inviteEmail.trim(), inviteRole);
    const url = `${window.location.origin}/join/${token}`;
    setGeneratedLink(url);

    const exists = members.some((m) => m.email === inviteEmail.trim());
    if (!exists) {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteEmail.split('@')[0],
          role: inviteRole,
          joinedAt: new Date().toISOString().slice(0, 10),
          status: 'invited',
        }),
      });
      if (res.ok) {
        const member = await res.json();
        setMembers((prev) => [...prev, member]);
      }
    }
    toast('Davet linki oluşturuldu', 'success');
  }

  function handleCopyLink() {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('Link kopyalandı', 'success');
    });
  }

  async function handleDelete(id: string) {
    await fetch(`/api/team/${id}`, { method: 'DELETE' });
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setDeleteId(null);
    toast('Üye kaldırıldı', 'success');
  }

  async function handleRoleChange(id: string, role: Role) {
    await fetch(`/api/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
    setEditId(null);
    toast('Rol güncellendi', 'success');
  }

  const activeCount  = members.filter((m) => m.status === 'active').length;
  const invitedCount = members.filter((m) => m.status === 'invited').length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />

        {/* Header */}
        <div className="bg-white border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Takım <span className="text-blue-600">Yönetimi</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
              Ekibinizi davet edin, rol ve erişim yetkilerini yönetin.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Toplam Üye',    value: members.length,  icon: Users,    color: 'text-blue-600 bg-blue-50' },
              { label: 'Aktif',         value: activeCount,     icon: Check,    color: 'text-green-600 bg-green-50' },
              { label: 'Davet Bekliyor', value: invitedCount,   icon: Mail,     color: 'text-amber-600 bg-amber-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Members table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Üyeler</h2>
              <button
                onClick={() => { setShowInvite(true); setGeneratedLink(null); setInviteEmail(''); }}
                className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Üye Davet Et
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['Üye', 'Rol', 'Katılım', 'Durum', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    {/* Member info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-black">
                            {m.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{m.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{m.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      {editId === m.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as Role)}
                            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            {(Object.keys(ROLE_META) as Role[]).map((r) => (
                              <option key={r} value={r}>{ROLE_META[r].label}</option>
                            ))}
                          </select>
                          <button onClick={() => handleRoleChange(m.id, editRole)}
                            className="text-green-500 hover:text-green-600 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditId(null)}
                            className="text-gray-300 hover:text-gray-500 dark:text-gray-400 dark:text-gray-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditId(m.id); setEditRole(m.role); }}
                          className="flex items-center gap-1.5 group/role"
                          title="Rolü değiştir"
                        >
                          <RoleBadge role={m.role} />
                          <ChevronDown className="w-3 h-3 text-gray-300 group-hover/role:text-gray-500 dark:text-gray-400 dark:text-gray-500 transition-colors" />
                        </button>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500 font-mono">{m.joinedAt}</td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        m.status === 'active'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} />
                        {m.status === 'active' ? 'Aktif' : 'Davet Bekleniyor'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {deleteId === m.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(m.id)}
                            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors">
                            Sil
                          </button>
                          <button onClick={() => setDeleteId(null)}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(m.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                          title="Üyeyi kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role descriptions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Rol Açıklamaları
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([role, meta]) => {
                const Icon = meta.icon;
                return (
                  <div key={role} className={`rounded-xl border p-4 ${meta.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-bold">{meta.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-80">{meta.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Invite modal */}
        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Üye Davet Et</h2>
                <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">E-posta Adresi</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="ornek@sirket.com"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Rol</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([role, meta]) => {
                      const Icon = meta.icon;
                      return (
                        <button
                          key={role}
                          onClick={() => setInviteRole(role)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                            inviteRole === role ? 'border-blue-500 bg-blue-50' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 dark:border-gray-700'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${inviteRole === role ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`} />
                          <span className={`text-xs font-semibold ${inviteRole === role ? 'text-blue-700' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                            {meta.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleGenerateLink}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  <LinkIcon className="w-4 h-4" /> Davet Linki Oluştur
                </button>

                {generatedLink && (
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">Davet Linki (7 gün geçerli)</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-mono truncate flex-1">{generatedLink}</p>
                      <button
                        onClick={handleCopyLink}
                        className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          copied ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {copied ? <><Check className="w-3 h-3" /> Kopyalandı</> : <><Copy className="w-3 h-3" /> Kopyala</>}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Bu linki davet ettiğiniz kişiyle paylaşın. Link 7 gün sonra geçersiz olur.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
