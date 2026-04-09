'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard, Users, ScrollText, Settings,
  LogOut, Shield, Package, TrendingUp, Activity,
  Search, Plus, Trash2, CheckCircle2,
  XCircle, AlertTriangle, Server, HardDrive,
  Bell, Key, ChevronRight, RefreshCw, Download,
  Eye, EyeOff, ToggleLeft, ToggleRight,
  BarChart3, Building2, Truck, ArrowUpRight, ArrowDownRight,
  Filter, Inbox, Info, type LucideIcon,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */
type ApiUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  optCount: number;
  cargoCount: number;
  lastOpt: { createdAt: string; containerLabel: string; fillPct: number } | null;
  lastLog: { userId: string; action: string; module: string; type: string; createdAt: string } | null;
};
type ApiStats = { totalUsers: number; totalOpts: number; totalCargo: number; totalAreas: number };



/* ─── Reports mock ───────────────────────────────────────── */
const REPORT_MONTHLY = [
  { month: 'Ekim',   optCount: 38, savedM3: 1.2, activeUsers: 4 },
  { month: 'Kas',    optCount: 45, savedM3: 1.5, activeUsers: 4 },
  { month: 'Ara',    optCount: 52, savedM3: 1.8, activeUsers: 5 },
  { month: 'Oca',    optCount: 61, savedM3: 2.1, activeUsers: 5 },
  { month: 'Şub',    optCount: 58, savedM3: 1.9, activeUsers: 6 },
  { month: 'Mar',    optCount: 74, savedM3: 2.4, activeUsers: 6 },
];

const DEPOT_STATS = [
  { name: 'İstanbul Depo', capacity: 2400, used: 1850, unit: 'kg' },
  { name: 'Ankara Depo',   capacity: 1800, used: 920,  unit: 'kg' },
  { name: 'İzmir Depo',    capacity: 3200, used: 2100, unit: 'kg' },
];

type Tab = 'overview' | 'users' | 'logs' | 'reports' | 'notifications' | 'settings';
type NotifRow = { id: string; title: string; message: string; type: string; time: string; read: boolean };

/* ─── Sub-components ─────────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin:  'bg-red-50 text-red-700 border border-red-100',
    editor: 'bg-purple-50 text-purple-700 border border-purple-100',
    user:   'bg-gray-100 text-gray-600 dark:text-gray-300',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[role] ?? map.user}`}>{role}</span>;
}

function StatusBadge({ status }: { status: string }) {
  return status === 'aktif' ? (
    <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> aktif
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 dark:text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> pasif
    </span>
  );
}

function LogIcon({ type }: { type: string }) {
  if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (type === 'error')   return <XCircle className="w-4 h-4 text-red-500" />;
  if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <Info className="w-4 h-4 text-blue-500" />;
}

function HealthBar({ label, pct, warn }: { label: string; pct: number; warn: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium text-gray-600 dark:text-gray-300">{label}</span>
        <span className={`font-bold ${warn ? 'text-amber-600' : 'text-gray-700 dark:text-gray-200'}`}>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${warn ? 'bg-amber-400' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SettingToggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button onClick={onChange} className="shrink-0 ml-4">
        {value ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed]             = useState<boolean | null>(null);
  const [activeTab, setActiveTab]       = useState<Tab>('overview');
  const [users, setUsers]               = useState<ApiUser[]>([]);
  const [dbStats, setDbStats]           = useState<ApiStats | null>(null);
  const [auditLogs, setAuditLogs]       = useState<{ id: string; userId: string | null; userEmail: string | null; action: string; module: string; ip: string | null; type: string; createdAt: string }[]>([]);
  const [notifications, setNotifications] = useState<NotifRow[]>([]);
  const [userSearch, setUserSearch]     = useState('');
  const [logSearch, setLogSearch]       = useState('');
  const [logFilter, setLogFilter]       = useState('tümü');
  const [showApiKey, setShowApiKey]     = useState(false);
  const [settings, setSettings]         = useState({
    emailNotif: true, autoBackup: true, maintenanceMode: false,
    twoFactor: false, activityLog: true, shareLinks: true,
  });
  const [showAddUser, setShowAddUser]       = useState(false);
  const [newUser, setNewUser]               = useState({ name: '', email: '', password: '', role: 'user' });
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState<'6m' | '3m' | '1m'>('6m');
  const [lastRefresh, setLastRefresh]   = useState(() => new Date().toLocaleString('tr-TR'));
  const [apiKey, setApiKey]             = useState('lf_live_sk_a7b3c9d2e1f4g8h5i6j0k3l');

  useEffect(() => {
    fetch('/api/auth/me').then(async (res) => {
      if (res.status === 401) { router.replace('/login'); return; }
      const me = await res.json();
      if (me.role !== 'admin') { router.replace('/dashboard'); return; }
      setAuthed(true);
      const [usersRes, statsRes, logsRes, notifsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/logs'),
        fetch('/api/notifications'),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (statsRes.ok) setDbStats(await statsRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
      if (notifsRes.ok) {
        const raw = await notifsRes.json() as { id: string; title: string; message: string; type: string; time: string; read: boolean }[];
        setNotifications(raw.map((n) => ({ ...n, time: new Date(n.time).toLocaleString('tr-TR') })));
      }
    });
  }, [router]);

  async function handleLogout() { await logout(); window.location.href = '/'; }
  function toggleSetting(key: keyof typeof settings) { setSettings((p) => ({ ...p, [key]: !p[key] })); }
  async function handleDeleteUser(id: string) {
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setUsers((p) => p.filter((u) => u.id !== id));
    setConfirmDeleteUserId(null);
  }
  async function handleRoleChange(id: string, role: string) {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    if (res.ok) { const updated = await res.json(); setUsers((p) => p.map((u) => u.id === id ? updated : u)); }
  }
  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    if (res.ok) { const created = await res.json(); setUsers((p) => [...p, created]); }
    setNewUser({ name: '', email: '', password: '', role: 'user' });
    setShowAddUser(false);
  }
  async function markAllRead() {
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ readAll: true }) }).catch(() => {});
  }
  async function deleteNotif(id: string) {
    setNotifications((p) => p.filter((n) => n.id !== id));
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  function handleRefresh() { setLastRefresh(new Date().toLocaleString('tr-TR')); }

  function handleDownloadCSV() {
    const header = ['Tür', 'İşlem', 'Kullanıcı', 'Modül', 'IP', 'Zaman'];
    const rows = filteredLogs.map((l) => [l.type, l.action, l.userEmail ?? '—', l.module, l.ip ?? '—', new Date(l.createdAt).toLocaleString('tr-TR')]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'logiflow-aktivite.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleRegenerateKey() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const rand = Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setApiKey(`lf_live_sk_${rand}`);
    setShowApiKey(true);
  }

  const filteredUsers = users.filter((u) =>
    (u.name ?? '').toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredLogs = auditLogs.filter((l) => {
    const matchSearch = (l.userEmail ?? '').toLowerCase().includes(logSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(logSearch.toLowerCase());
    const matchType = logFilter === 'tümü' || l.type === logFilter;
    return matchSearch && matchType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const reportData = reportPeriod === '1m' ? REPORT_MONTHLY.slice(-1)
    : reportPeriod === '3m' ? REPORT_MONTHLY.slice(-3)
    : REPORT_MONTHLY;

  const maxOpt = Math.max(...reportData.map((r) => r.optCount));

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );


  const NAV: { tab: Tab; label: string; icon: LucideIcon; badge?: number }[] = [
    { tab: 'overview',      label: 'Genel Bakış',       icon: LayoutDashboard },
    { tab: 'users',         label: 'Kullanıcılar',       icon: Users },
    { tab: 'reports',       label: 'Raporlar',           icon: BarChart3 },
    { tab: 'logs',          label: 'Aktivite Günlüğü',   icon: ScrollText },
    { tab: 'notifications', label: 'Bildirimler',        icon: Bell, badge: unreadCount || undefined },
    { tab: 'settings',      label: 'Sistem',             icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      {/* Top bar */}
      <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white font-black text-xs">LF</span>
              </div>
              <span className="text-sm font-bold text-white tracking-tight">Logi<span className="text-blue-400">Flow</span></span>
            </Link>
            <span className="text-gray-700 dark:text-gray-200 text-xs">·</span>
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              <Shield className="w-3 h-3" /> Admin Panel
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={() => setActiveTab('notifications')} className="relative text-gray-400 dark:text-gray-500 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              </button>
            )}
            <Link href="/dashboard" className="text-xs text-gray-400 dark:text-gray-500 hover:text-white transition-colors">← Uygulamaya Dön</Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <nav className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {NAV.map(({ tab, label, icon: Icon, badge }) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors text-left border-b border-gray-50 last:border-0 ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white dark:text-white'
                }`}
              >
                <span className="flex items-center gap-3"><Icon className="w-4 h-4 shrink-0" />{label}</span>
                {badge ? (
                  <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                    {badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sistem Sağlığı</p>
            <HealthBar label="CPU" pct={34} warn={false} />
            <HealthBar label="RAM" pct={61} warn={false} />
            <HealthBar label="Disk" pct={80} warn={true} />
          </div>

          <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Hızlı Bağlantılar</p>
            {[
              { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
              { label: 'Optimizasyon', href: '/features/kargo-optimizasyon', icon: Truck },
              { label: 'Depolama', href: '/depolama', icon: Building2 },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1.5 rounded-lg transition-colors">
                <Icon className="w-3.5 h-3.5" />{label}
              </Link>
            ))}
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden w-full">
          <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-1 mb-4 overflow-x-auto">
            {NAV.map(({ tab, icon: Icon, badge }) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`relative flex-shrink-0 flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <Icon className="w-4 h-4" />
                {badge ? <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">{badge}</span> : null}
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-5">

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">Genel Bakış</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Son güncelleme: {lastRefresh}</span>
                  <button onClick={handleRefresh} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl hover:text-blue-600 hover:border-blue-200 transition-colors bg-white">
                    <RefreshCw className="w-3.5 h-3.5" /> Yenile
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Toplam Kullanıcı', value: dbStats?.totalUsers ?? '—', delta: 'kayıtlı',        icon: Users,      color: 'blue' },
                  { label: 'Optimizasyon',      value: dbStats?.totalOpts ?? '—',  delta: 'toplam çalışma', icon: TrendingUp, color: 'green' },
                  { label: 'Kargo Kalemi',      value: dbStats?.totalCargo ?? '—', delta: 'depoda',         icon: Package,    color: 'purple' },
                  { label: 'Depo Alanı',        value: dbStats?.totalAreas ?? '—', delta: 'tanımlı',        icon: Activity,   color: 'indigo' },
                ].map(({ label, value, delta, icon: Icon, color }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</span>
                      <div className={`w-8 h-8 bg-${color}-50 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-600`} />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-green-500" />{delta}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mini bar chart — optimizations this week */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Bu Hafta — Günlük Optimizasyonlar</h2>
                  <button onClick={() => setActiveTab('reports')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Tüm rapor <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-end gap-2 h-24">
                  {[8, 12, 6, 15, 11, 9, 14].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-md bg-blue-100 hover:bg-blue-600 transition-colors cursor-default group relative"
                        style={{ height: `${(v / 15) * 100}%` }}>
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-700 opacity-0 group-hover:opacity-100">{v}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent logs */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Son Aktiviteler</h2>
                  <button onClick={() => setActiveTab('logs')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Tümünü gör <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 px-5 py-3">
                      <LogIcon type={log.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-100 font-medium truncate">{log.action}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{log.userEmail ?? '—'} · {log.module}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{new Date(log.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User summary */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Kullanıcı Özeti</h2>
                  <button onClick={() => setActiveTab('users')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Yönet <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="px-5 py-4 flex flex-wrap gap-8">
                  {[
                    { label: 'Toplam',  value: users.length,                              color: 'text-gray-900 dark:text-white' },
                    { label: 'Admin',   value: users.filter(u => u.role === 'admin').length, color: 'text-red-600' },
                    { label: 'Üye',     value: users.filter(u => u.role === 'user').length,  color: 'text-blue-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`text-2xl font-black ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Users ── */}
          {activeTab === 'users' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">Kullanıcılar</h1>
                <button onClick={() => setShowAddUser(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
                  <Plus className="w-4 h-4" /> Kullanıcı Ekle
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Ad veya e-posta ara…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
              </div>

              {showAddUser && (
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">Yeni Kullanıcı</h3>
                  <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-3">
                    <input value={newUser.name} onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ad Soyad" className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                    <input required type="email" value={newUser.email} onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                      placeholder="E-posta" className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                    <input required type="password" value={newUser.password} onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
                      placeholder="Şifre" className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                    <select value={newUser.role} onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value }))}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <div className="col-span-2 flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">İptal</button>
                      <button type="submit" className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700">Ekle</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[820px]">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50">
                        {['Kullanıcı', 'Durum', 'Son İşlem', 'Opt.', 'Kargo', 'Rol', 'Rol Değiştir', ''].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {filteredUsers.map((user) => {
                        // Aktivite durumu
                        const lastSeenMs = user.lastLog ? Date.now() - new Date(user.lastLog.createdAt).getTime() : null;
                        const status = lastSeenMs === null ? 'pasif'
                          : lastSeenMs < 30 * 60_000   ? 'aktif'
                          : lastSeenMs < 24 * 3600_000 ? 'yakın'
                          : 'pasif';

                        // Son işlem metni
                        const lastAction = user.lastLog
                          ? `${user.lastLog.action} (${user.lastLog.module})`
                          : null;
                        const lastWhen = user.lastLog
                          ? new Date(user.lastLog.createdAt).toLocaleString('tr-TR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
                          : null;

                        return (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            {/* Kullanıcı */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                  <span className="text-white text-xs font-bold">{(user.name ?? user.email).charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white leading-tight">{user.name || '—'}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Durum */}
                            <td className="px-4 py-3.5">
                              {status === 'aktif' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Aktif
                                </span>
                              ) : status === 'yakın' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Yakında
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 px-2 py-1 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Pasif
                                </span>
                              )}
                            </td>

                            {/* Son İşlem */}
                            <td className="px-4 py-3.5 max-w-[200px]">
                              {lastAction ? (
                                <div>
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{lastAction}</p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{lastWhen}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>

                            {/* Opt sayısı */}
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-6 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-md">
                                {user.optCount ?? 0}
                              </span>
                            </td>

                            {/* Kargo sayısı */}
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-6 bg-gray-50 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-md">
                                {user.cargoCount ?? 0}
                              </span>
                            </td>

                            {/* Rol badge */}
                            <td className="px-4 py-3.5"><RoleBadge role={user.role} /></td>

                            {/* Rol değiştir */}
                            <td className="px-4 py-3.5">
                              <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-950 focus:outline-none focus:ring-1 focus:ring-blue-600">
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>

                            {/* Sil */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {confirmDeleteUserId === user.id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleDeleteUser(user.id)}
                                      className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors">Sil</button>
                                    <button onClick={() => setConfirmDeleteUserId(null)}
                                      className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">İptal</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDeleteUserId(user.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>{filteredUsers.length} kullanıcı</span>
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Aktif: son 30 dk</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Yakında: son 24 sa</span>
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ── Reports ── */}
          {activeTab === 'reports' && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">Raporlar</h1>
                <div className="flex gap-1 bg-white border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                  {(['1m', '3m', '6m'] as const).map((p) => (
                    <button key={p} onClick={() => setReportPeriod(p)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${reportPeriod === p ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-white'}`}>
                      {p === '1m' ? 'Bu Ay' : p === '3m' ? '3 Ay' : '6 Ay'}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Toplam Optimizasyon', value: reportData.reduce((s, r) => s + r.optCount, 0), icon: Truck, color: 'blue' },
                  { label: 'Tasarruf Edilen Alan', value: `${reportData.reduce((s, r) => s + r.savedM3, 0).toFixed(1)} m³`, icon: Package, color: 'purple' },
                  { label: 'Ortalama Aylık', value: Math.round(reportData.reduce((s, r) => s + r.optCount, 0) / reportData.length), icon: BarChart3, color: 'indigo' },
                  { label: 'Aktif Kullanıcı', value: reportData[reportData.length - 1].activeUsers, icon: Users, color: 'green' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</span>
                      <div className={`w-8 h-8 bg-${color}-50 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-600`} />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Optimization bar chart */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Aylık Optimizasyon Sayısı</h2>
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl hover:text-blue-600 hover:border-blue-200 bg-white transition-colors">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
                <div className="flex items-end gap-3 h-40">
                  {reportData.map((r) => (
                    <div key={r.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-blue-700">{r.optCount}</span>
                      <div className="w-full rounded-t-lg bg-blue-600 hover:bg-blue-700 transition-colors cursor-default"
                        style={{ height: `${(r.optCount / maxOpt) * 100}%` }} />
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{r.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Depot capacity */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">Depo Doluluk Oranları</h2>
                <div className="space-y-4">
                  {DEPOT_STATS.map((d) => {
                    const pct = Math.round((d.used / d.capacity) * 100);
                    const warn = pct >= 80;
                    return (
                      <div key={d.name}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-200">{d.name}</span>
                          <span className={`font-bold text-xs ${warn ? 'text-amber-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            {d.used.toLocaleString()} / {d.capacity.toLocaleString()} {d.unit} ({pct}%)
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${warn ? 'bg-amber-400' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Saved volume trend */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">Tasarruf Edilen Hacim (m³)</h2>
                <div className="flex items-end gap-3 h-28">
                  {reportData.map((r) => {
                    const maxV = Math.max(...reportData.map((x) => x.savedM3));
                    return (
                      <div key={r.month} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-purple-700">{r.savedM3}</span>
                        <div className="w-full rounded-t-lg bg-purple-400 hover:bg-purple-600 transition-colors cursor-default"
                          style={{ height: `${(r.savedM3 / maxV) * 100}%` }} />
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{r.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── Activity Logs ── */}
          {activeTab === 'logs' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">Aktivite Günlüğü</h1>
                <button onClick={handleDownloadCSV} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl hover:text-blue-600 hover:border-blue-200 transition-colors bg-white">
                  <Download className="w-3.5 h-3.5" /> CSV İndir
                </button>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input value={logSearch} onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Kullanıcı veya işlem ara…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" />
                </div>
                <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-700 dark:text-gray-200">
                  <option value="tümü">Tüm Türler</option>
                  <option value="success">Başarılı</option>
                  <option value="error">Hata</option>
                  <option value="warning">Uyarı</option>
                  <option value="info">Bilgi</option>
                </select>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50">
                        {['', 'İşlem', 'Kullanıcı', 'Modül', 'IP', 'Zaman'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-4 py-3"><LogIcon type={log.type} /></td>
                          <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100 max-w-xs">{log.action}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{log.userEmail ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">{log.module}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">{log.ip ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString('tr-TR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">{filteredLogs.length} kayıt gösteriliyor</div>
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-gray-900 dark:text-white">Bildirimler</h1>
                  {unreadCount > 0 && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{unreadCount} okunmamış bildirim</p>}
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl hover:text-blue-600 hover:border-blue-200 bg-white transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tümünü Okundu İşaretle
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl hover:text-blue-600 hover:border-blue-200 bg-white transition-colors">
                    <Filter className="w-3.5 h-3.5" /> Filtrele
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
                  <Inbox className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">Bildirim yok</p>
                  <p className="text-xs text-gray-300 mt-1">Yeni bildirimler burada görünecek.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 transition-all ${n.read ? 'border-gray-100 dark:border-gray-800 opacity-70' : 'border-blue-100'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === 'success' ? 'bg-green-50' : n.type === 'error' ? 'bg-red-50' : n.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                      }`}>
                        <LogIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold ${n.read ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                            <button onClick={() => deleteNotif(n.id)} aria-label="Bildirimi sil" className="text-gray-300 hover:text-red-400 transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-gray-300 mt-1.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Settings ── */}
          {activeTab === 'settings' && (
            <>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">Sistem Ayarları</h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">Bildirimler</h2>
                  </div>
                  <SettingToggle label="E-posta Bildirimleri" desc="Önemli olaylar için e-posta gönder" value={settings.emailNotif} onChange={() => toggleSetting('emailNotif')} />
                  <SettingToggle label="Aktivite Günlüğü" desc="Tüm kullanıcı işlemlerini kaydet" value={settings.activityLog} onChange={() => toggleSetting('activityLog')} />
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">Güvenlik</h2>
                  </div>
                  <SettingToggle label="İki Faktörlü Doğrulama" desc="Tüm kullanıcılar için zorunlu yap" value={settings.twoFactor} onChange={() => toggleSetting('twoFactor')} />
                  <SettingToggle label="Paylaşım Linkleri" desc="Anonim yük planı paylaşımına izin ver" value={settings.shareLinks} onChange={() => toggleSetting('shareLinks')} />
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Server className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">Sistem</h2>
                  </div>
                  <SettingToggle label="Otomatik Yedekleme" desc="Her gün 03:00'te yedek al" value={settings.autoBackup} onChange={() => toggleSetting('autoBackup')} />
                  <SettingToggle label="Bakım Modu" desc="Aktif edilirse kullanıcılar giriş yapamaz" value={settings.maintenanceMode} onChange={() => toggleSetting('maintenanceMode')} />
                  {settings.maintenanceMode && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Bakım modu aktif — yalnızca adminler giriş yapabilir.
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">API Anahtarı</h2>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-3">Harici sistemlerle entegrasyon için kullanın (Excel, SAP vb.)</p>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5">
                    <code className="text-xs text-gray-700 dark:text-gray-200 font-mono flex-1 truncate">
                      {showApiKey ? apiKey : '••••••••••••••••••••••••••••'}
                    </code>
                    <button onClick={() => setShowApiKey((p) => !p)} aria-label={showApiKey ? 'API anahtarını gizle' : 'API anahtarını göster'} className="text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors shrink-0">
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button onClick={handleRegenerateKey} className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Yeni anahtar oluştur
                  </button>
                </div>

                {/* Storage info */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">Depolama & Altyapı</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <HealthBar label="CPU Kullanımı" pct={34} warn={false} />
                    <HealthBar label="RAM Kullanımı" pct={61} warn={false} />
                    <HealthBar label="Disk Kullanımı" pct={80} warn={true} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                      { label: 'Sunucu', value: 'AWS EU-1', sub: 'Frankfurt' },
                      { label: 'DB', value: 'PostgreSQL', sub: 'v15.2' },
                      { label: 'Uptime', value: '99.9%', sub: 'son 30 gün' },
                      { label: 'Son Yedek', value: '26 Mar', sub: '03:00' },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{value}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
