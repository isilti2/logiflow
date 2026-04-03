'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard, Truck, Receipt, Users, UserCheck,
  LogOut, Plus, Trash2, ChevronRight, ArrowUpRight,
  ArrowDownRight, TrendingUp, Wallet, Calendar,
  Search, X, CheckCircle2, Clock, AlertCircle,
  ClipboardList, Building2, Phone, Mail, MapPin,
  Edit2, Save, CalendarDays,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
type Musteri   = { id: string; ad: string; vergiNo: string; telefon: string; email: string; adres: string; createdAt: string; _count?: { seferler: number; islemler: number } };
type Sefer     = { id: string; musteriId: string | null; musteri?: { id: string; ad: string } | null; aracPlaka: string; rotaDan: string; rotaAya: string; mesafeKm: number; tarih: string; yukAgirligi: number; seferUcreti: number; yakitMaliyeti: number; notlar: string; durum: string; createdAt: string };
type MaliIslem = { id: string; seferId: string | null; musteriId: string | null; sefer?: { rotaDan: string; rotaAya: string } | null; musteri?: { ad: string } | null; tur: string; kategori: string; tutar: number; kdvOrani: number; aciklama: string; tarih: string; createdAt: string };
type Personel  = { id: string; ad: string; unvan: string; telefon: string; tcNo: string; maas: number; baslangicTarihi: string; aktif: boolean; createdAt: string; _count?: { puantajlar: number } };
type Puantaj   = { id: string; personelId: string; tarih: string; girisSaati: string | null; cikisSaati: string | null; fazlaMesai: number; izinTuru: string | null; notlar: string; personel?: { id: string; ad: string; unvan: string } };

type Tab = 'genel' | 'seferler' | 'islemler' | 'cari' | 'personel';

const TL = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const thisMonth = () => new Date().toISOString().slice(0, 7);

const GIDER_KATEGORILER = ['Yakıt', 'Bakım', 'Sigorta', 'Ruhsat', 'Köprü / Geçiş', 'Personel Maaşı', 'Kira', 'Diğer'];
const GELIR_KATEGORILER = ['Sefer Ücreti', 'Kira Geliri', 'Diğer'];

/* ─── Helpers ───────────────────────────────────────────────── */
function DurumBadge({ durum }: { durum: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    planlandi:  { label: 'Planlandı',  cls: 'bg-blue-50 text-blue-700',   icon: <Clock className="w-3 h-3" /> },
    devam:      { label: 'Devam Ediyor', cls: 'bg-amber-50 text-amber-700', icon: <Truck className="w-3 h-3" /> },
    tamamlandi: { label: 'Tamamlandı', cls: 'bg-green-50 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
    iptal:      { label: 'İptal',      cls: 'bg-red-50 text-red-700',     icon: <X className="w-3 h-3" /> },
  };
  const d = map[durum] ?? map.planlandi;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${d.cls}`}>
      {d.icon} {d.label}
    </span>
  );
}

function IzinBadge({ izin }: { izin: string | null }) {
  if (!izin) return <span className="text-xs text-green-700 font-semibold">Çalışıldı</span>;
  const map: Record<string, string> = { yillik: 'Yıllık İzin', hastalik: 'Hastalık', ucretsiz: 'Ücretsiz', resmi: 'Resmi Tatil' };
  const colors: Record<string, string> = { yillik: 'text-blue-700', hastalik: 'text-red-600', ucretsiz: 'text-orange-600', resmi: 'text-purple-700' };
  return <span className={`text-xs font-semibold ${colors[izin] ?? 'text-gray-500'}`}>{map[izin] ?? izin}</span>;
}

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub?: string; color: string; icon: React.ComponentType<{ className?: string }> }) {
  const colors: Record<string, string> = {
    green:  'bg-green-50 text-green-600',
    red:    'bg-red-50 text-red-600',
    blue:   'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber:  'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function MuhasebePage() {
  const router = useRouter();
  const [authed, setAuthed]     = useState<boolean | null>(null);
  const [tab, setTab]           = useState<Tab>('genel');

  // Data
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [seferler, setSeferler]     = useState<Sefer[]>([]);
  const [islemler, setIslemler]     = useState<MaliIslem[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [puantajlar, setPuantajlar] = useState<Puantaj[]>([]);

  // UI state
  const [search, setSearch]         = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [puantajAy, setPuantajAy]   = useState(thisMonth);
  const [selPersonel, setSelPersonel] = useState<string>('');
  const [editId, setEditId]         = useState<string | null>(null);

  // Forms
  const [musteriForm, setMusteriForm] = useState({ ad: '', vergiNo: '', telefon: '', email: '', adres: '' });
  const [seferForm, setSeferForm]     = useState({ musteriId: '', aracPlaka: '', rotaDan: '', rotaAya: '', mesafeKm: '', tarih: '', yukAgirligi: '', seferUcreti: '', yakitMaliyeti: '', notlar: '', durum: 'planlandi' });
  const [islemForm, setIslemForm]     = useState({ seferId: '', musteriId: '', tur: 'gider', kategori: 'Yakıt', tutar: '', kdvOrani: '0', aciklama: '', tarih: '' });
  const [personelForm, setPersonelForm] = useState({ ad: '', unvan: '', telefon: '', tcNo: '', maas: '', baslangicTarihi: '' });
  const [puantajForm, setPuantajForm] = useState({ personelId: '', tarih: '', girisSaati: '08:00', cikisSaati: '17:00', fazlaMesai: '0', izinTuru: '', notlar: '' });

  const loadAll = useCallback(async () => {
    const [mRes, sRes, iRes, pRes] = await Promise.all([
      fetch('/api/muhasebe/musteriler'),
      fetch('/api/muhasebe/seferler'),
      fetch('/api/muhasebe/islemler'),
      fetch('/api/muhasebe/personel'),
    ]);
    if (mRes.ok) setMusteriler(await mRes.json());
    if (sRes.ok) setSeferler(await sRes.json());
    if (iRes.ok) setIslemler(await iRes.json());
    if (pRes.ok) setPersoneller(await pRes.json());
  }, []);

  const loadPuantaj = useCallback(async () => {
    const params = new URLSearchParams({ ay: puantajAy });
    if (selPersonel) params.set('personelId', selPersonel);
    const res = await fetch(`/api/muhasebe/puantaj?${params}`);
    if (res.ok) setPuantajlar(await res.json());
  }, [puantajAy, selPersonel]);

  useEffect(() => {
    fetch('/api/auth/me').then(async (r) => {
      if (r.status === 401) { router.replace('/login'); return; }
      setAuthed(true);
      await loadAll();
    });
  }, [router, loadAll]);

  useEffect(() => {
    if (authed && tab === 'personel') loadPuantaj();
  }, [authed, tab, puantajAy, selPersonel, loadPuantaj]);

  /* ── Computed ── */
  const toplamGelir  = islemler.filter(i => i.tur === 'gelir').reduce((s, i) => s + i.tutar, 0);
  const toplamGider  = islemler.filter(i => i.tur === 'gider').reduce((s, i) => s + i.tutar, 0);
  const netKar       = toplamGelir - toplamGider;
  const aktifSefer   = seferler.filter(s => s.durum === 'devam').length;

  /* ── Handlers ── */
  async function submitMusteri(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/musteriler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(musteriForm) });
    if (res.ok) { const n = await res.json(); setMusteriler(p => [n, ...p]); setMusteriForm({ ad: '', vergiNo: '', telefon: '', email: '', adres: '' }); setShowForm(false); }
  }

  async function deleteMusteri(id: string) {
    await fetch(`/api/muhasebe/musteriler/${id}`, { method: 'DELETE' });
    setMusteriler(p => p.filter(m => m.id !== id));
  }

  async function submitSefer(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/seferler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seferForm) });
    if (res.ok) { const n = await res.json(); setSeferler(p => [n, ...p]); setSeferForm({ musteriId: '', aracPlaka: '', rotaDan: '', rotaAya: '', mesafeKm: '', tarih: '', yukAgirligi: '', seferUcreti: '', yakitMaliyeti: '', notlar: '', durum: 'planlandi' }); setShowForm(false); }
  }

  async function updateSeferDurum(id: string, durum: string) {
    const sefer = seferler.find(s => s.id === id);
    if (!sefer) return;
    const res = await fetch(`/api/muhasebe/seferler/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...sefer, durum }) });
    if (res.ok) { const u = await res.json(); setSeferler(p => p.map(s => s.id === id ? u : s)); }
  }

  async function deleteSefer(id: string) {
    await fetch(`/api/muhasebe/seferler/${id}`, { method: 'DELETE' });
    setSeferler(p => p.filter(s => s.id !== id));
  }

  async function submitIslem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/islemler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(islemForm) });
    if (res.ok) { const n = await res.json(); setIslemler(p => [n, ...p]); setIslemForm({ seferId: '', musteriId: '', tur: 'gider', kategori: 'Yakıt', tutar: '', kdvOrani: '0', aciklama: '', tarih: '' }); setShowForm(false); }
  }

  async function deleteIslem(id: string) {
    await fetch(`/api/muhasebe/islemler/${id}`, { method: 'DELETE' });
    setIslemler(p => p.filter(i => i.id !== id));
  }

  async function submitPersonel(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/personel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(personelForm) });
    if (res.ok) { const n = await res.json(); setPersoneller(p => [n, ...p]); setPersonelForm({ ad: '', unvan: '', telefon: '', tcNo: '', maas: '', baslangicTarihi: '' }); setShowForm(false); }
  }

  async function deletePersonel(id: string) {
    await fetch(`/api/muhasebe/personel/${id}`, { method: 'DELETE' });
    setPersoneller(p => p.filter(x => x.id !== id));
  }

  async function submitPuantaj(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/puantaj', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(puantajForm) });
    if (res.ok) { await loadPuantaj(); setPuantajForm(p => ({ ...p, tarih: '', girisSaati: '08:00', cikisSaati: '17:00', fazlaMesai: '0', izinTuru: '', notlar: '' })); setShowForm(false); }
  }

  async function deletePuantaj(id: string) {
    await fetch(`/api/muhasebe/puantaj/${id}`, { method: 'DELETE' });
    setPuantajlar(p => p.filter(x => x.id !== id));
  }

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const NAV: { tab: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'genel',    label: 'Genel Bakış',    icon: LayoutDashboard },
    { tab: 'seferler', label: 'Seferler',        icon: Truck },
    { tab: 'islemler', label: 'Gelir / Gider',   icon: Receipt },
    { tab: 'cari',     label: 'Cari Hesap',      icon: Building2 },
    { tab: 'personel', label: 'Personel & Puantaj', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white font-black text-xs">LF</span>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight hidden sm:block">
                Logi<span className="text-blue-600">Flow</span>
              </span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
            <span className="text-sm font-bold text-gray-700 hidden sm:block">Muhasebe</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors hidden sm:block">
              ← Dashboard
            </Link>
            <button
              onClick={async () => { await logout(); window.location.href = '/'; }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {NAV.map(({ tab: t, label, icon: Icon }) => (
              <button
                key={t}
                onClick={() => { setTab(t); setShowForm(false); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">

        {/* ── GENEL BAKIŞ ────────────────────────────────────── */}
        {tab === 'genel' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Toplam Gelir"  value={TL(toplamGelir)} sub={`${islemler.filter(i=>i.tur==='gelir').length} işlem`} color="green"  icon={ArrowUpRight} />
              <StatCard label="Toplam Gider"  value={TL(toplamGider)} sub={`${islemler.filter(i=>i.tur==='gider').length} işlem`} color="red"    icon={ArrowDownRight} />
              <StatCard label="Net Kar"       value={TL(netKar)}      sub={netKar >= 0 ? 'Kârlı' : 'Zararda'} color={netKar >= 0 ? 'blue' : 'red'} icon={TrendingUp} />
              <StatCard label="Aktif Sefer"   value={String(aktifSefer)} sub={`${seferler.length} toplam`}   color="amber"  icon={Truck} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Son seferler */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Son Seferler</h3>
                  <button onClick={() => setTab('seferler')} className="text-xs text-blue-600 hover:underline font-semibold">Tümü →</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {seferler.slice(0, 5).map(s => (
                    <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{s.rotaDan} → {s.rotaAya}</p>
                        <p className="text-xs text-gray-400">{s.aracPlaka} · {fmtDate(s.tarih)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{TL(s.seferUcreti)}</p>
                        <DurumBadge durum={s.durum} />
                      </div>
                    </div>
                  ))}
                  {seferler.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-400">Henüz sefer yok</p>}
                </div>
              </div>

              {/* Son işlemler */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Son İşlemler</h3>
                  <button onClick={() => setTab('islemler')} className="text-xs text-blue-600 hover:underline font-semibold">Tümü →</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {islemler.slice(0, 5).map(i => (
                    <div key={i.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i.tur === 'gelir' ? 'bg-green-50' : 'bg-red-50'}`}>
                        {i.tur === 'gelir' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{i.kategori}</p>
                        <p className="text-xs text-gray-400">{i.aciklama || '—'} · {fmtDate(i.tarih)}</p>
                      </div>
                      <p className={`text-sm font-bold shrink-0 ${i.tur === 'gelir' ? 'text-green-600' : 'text-red-500'}`}>
                        {i.tur === 'gelir' ? '+' : '-'}{TL(i.tutar)}
                      </p>
                    </div>
                  ))}
                  {islemler.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-400">Henüz işlem yok</p>}
                </div>
              </div>
            </div>

            {/* Personel özeti */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm">Personel Özeti</h3>
                <button onClick={() => setTab('personel')} className="text-xs text-blue-600 hover:underline font-semibold">Puantaj →</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900">{personeller.filter(p => p.aktif).length}</p>
                  <p className="text-xs text-gray-400 mt-1">Aktif Personel</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900">{personeller.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Toplam Personel</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900">{TL(personeller.reduce((s, p) => s + p.maas, 0))}</p>
                  <p className="text-xs text-gray-400 mt-1">Aylık Maaş Toplam</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900">{musteriler.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Müşteri / Cari</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── SEFERLER ─────────────────────────────────────────── */}
        {tab === 'seferler' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Plaka veya rota ara…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Yeni Sefer
              </button>
            </div>

            {showForm && (
              <form onSubmit={submitSefer} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full font-bold text-gray-900">Yeni Sefer Kaydı</h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Müşteri (opsiyonel)</label>
                  <select value={seferForm.musteriId} onChange={e => setSeferForm(p => ({ ...p, musteriId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— Seç —</option>
                    {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Araç Plakası *</label>
                  <input required value={seferForm.aracPlaka} onChange={e => setSeferForm(p => ({ ...p, aracPlaka: e.target.value }))} placeholder="34 ABC 123" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Çıkış Noktası *</label>
                  <input required value={seferForm.rotaDan} onChange={e => setSeferForm(p => ({ ...p, rotaDan: e.target.value }))} placeholder="İstanbul" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Varış Noktası *</label>
                  <input required value={seferForm.rotaAya} onChange={e => setSeferForm(p => ({ ...p, rotaAya: e.target.value }))} placeholder="Ankara" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tarih *</label>
                  <input required type="date" value={seferForm.tarih} onChange={e => setSeferForm(p => ({ ...p, tarih: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mesafe (km)</label>
                  <input type="number" min="0" value={seferForm.mesafeKm} onChange={e => setSeferForm(p => ({ ...p, mesafeKm: e.target.value }))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Yük Ağırlığı (kg)</label>
                  <input type="number" min="0" value={seferForm.yukAgirligi} onChange={e => setSeferForm(p => ({ ...p, yukAgirligi: e.target.value }))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sefer Ücreti (₺)</label>
                  <input type="number" min="0" value={seferForm.seferUcreti} onChange={e => setSeferForm(p => ({ ...p, seferUcreti: e.target.value }))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Yakıt Maliyeti (₺)</label>
                  <input type="number" min="0" value={seferForm.yakitMaliyeti} onChange={e => setSeferForm(p => ({ ...p, yakitMaliyeti: e.target.value }))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Durum</label>
                  <select value={seferForm.durum} onChange={e => setSeferForm(p => ({ ...p, durum: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="planlandi">Planlandı</option>
                    <option value="devam">Devam Ediyor</option>
                    <option value="tamamlandi">Tamamlandı</option>
                    <option value="iptal">İptal</option>
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notlar</label>
                  <input value={seferForm.notlar} onChange={e => setSeferForm(p => ({ ...p, notlar: e.target.value }))} placeholder="Opsiyonel not…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                    <Save className="w-4 h-4" /> Kaydet
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Rota', 'Plaka', 'Tarih', 'Müşteri', 'Ücret', 'Yakıt', 'Durum', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {seferler.filter(s => !search || s.aracPlaka.toLowerCase().includes(search.toLowerCase()) || s.rotaDan.toLowerCase().includes(search.toLowerCase()) || s.rotaAya.toLowerCase().includes(search.toLowerCase())).map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{s.rotaDan} → {s.rotaAya}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{s.aracPlaka}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(s.tarih)}</td>
                      <td className="px-4 py-3 text-gray-500">{s.musteri?.ad ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold text-green-700 whitespace-nowrap">{TL(s.seferUcreti)}</td>
                      <td className="px-4 py-3 text-red-500 whitespace-nowrap">{TL(s.yakitMaliyeti)}</td>
                      <td className="px-4 py-3">
                        <select value={s.durum} onChange={e => updateSeferDurum(s.id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="planlandi">Planlandı</option>
                          <option value="devam">Devam</option>
                          <option value="tamamlandi">Tamamlandı</option>
                          <option value="iptal">İptal</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteSefer(s.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {seferler.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Henüz sefer kaydı yok. &ldquo;Yeni Sefer&rdquo; ile ekleyin.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── GELİR / GİDER ────────────────────────────────────── */}
        {tab === 'islemler' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Gelir" value={TL(toplamGelir)} color="green" icon={ArrowUpRight} />
              <StatCard label="Gider" value={TL(toplamGider)} color="red"   icon={ArrowDownRight} />
              <StatCard label="Net"   value={TL(netKar)}      color={netKar >= 0 ? 'blue' : 'red'} icon={Wallet} />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kategori veya açıklama ara…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Yeni İşlem
              </button>
            </div>

            {showForm && (
              <form onSubmit={submitIslem} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full font-bold text-gray-900">Yeni Mali İşlem</h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tür *</label>
                  <select value={islemForm.tur} onChange={e => { const tur = e.target.value; setIslemForm(p => ({ ...p, tur, kategori: tur === 'gelir' ? 'Sefer Ücreti' : 'Yakıt' })); }} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="gider">Gider</option>
                    <option value="gelir">Gelir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori *</label>
                  <select value={islemForm.kategori} onChange={e => setIslemForm(p => ({ ...p, kategori: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {(islemForm.tur === 'gelir' ? GELIR_KATEGORILER : GIDER_KATEGORILER).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tutar (₺) *</label>
                  <input required type="number" min="0" step="0.01" value={islemForm.tutar} onChange={e => setIslemForm(p => ({ ...p, tutar: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">KDV Oranı (%)</label>
                  <select value={islemForm.kdvOrani} onChange={e => setIslemForm(p => ({ ...p, kdvOrani: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="0">%0</option>
                    <option value="10">%10</option>
                    <option value="20">%20</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tarih *</label>
                  <input required type="date" value={islemForm.tarih} onChange={e => setIslemForm(p => ({ ...p, tarih: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">İlgili Sefer</label>
                  <select value={islemForm.seferId} onChange={e => setIslemForm(p => ({ ...p, seferId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— Seç —</option>
                    {seferler.map(s => <option key={s.id} value={s.id}>{s.rotaDan}→{s.rotaAya} ({s.aracPlaka})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Müşteri</label>
                  <select value={islemForm.musteriId} onChange={e => setIslemForm(p => ({ ...p, musteriId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— Seç —</option>
                    {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Açıklama</label>
                  <input value={islemForm.aciklama} onChange={e => setIslemForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="Opsiyonel açıklama…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                    <Save className="w-4 h-4" /> Kaydet
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Tarih', 'Tür', 'Kategori', 'Açıklama', 'Sefer', 'Müşteri', 'KDV', 'Tutar', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {islemler.filter(i => !search || i.kategori.toLowerCase().includes(search.toLowerCase()) || i.aciklama.toLowerCase().includes(search.toLowerCase())).map(i => (
                    <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(i.tarih)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${i.tur === 'gelir' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          {i.tur === 'gelir' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {i.tur}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{i.kategori}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{i.aciklama || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{i.sefer ? `${i.sefer.rotaDan}→${i.sefer.rotaAya}` : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{i.musteri?.ad ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">%{i.kdvOrani}</td>
                      <td className={`px-4 py-3 font-bold whitespace-nowrap ${i.tur === 'gelir' ? 'text-green-600' : 'text-red-500'}`}>
                        {i.tur === 'gelir' ? '+' : '-'}{TL(i.tutar)}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteIslem(i.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {islemler.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Henüz mali işlem yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── CARİ HESAP ──────────────────────────────────────── */}
        {tab === 'cari' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Müşteri ara…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Yeni Müşteri
              </button>
            </div>

            {showForm && (
              <form onSubmit={submitMusteri} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full font-bold text-gray-900">Yeni Müşteri / Cari</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ad / Firma *</label>
                  <input required value={musteriForm.ad} onChange={e => setMusteriForm(p => ({ ...p, ad: e.target.value }))} placeholder="ABC Lojistik A.Ş." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Vergi No</label>
                  <input value={musteriForm.vergiNo} onChange={e => setMusteriForm(p => ({ ...p, vergiNo: e.target.value }))} placeholder="1234567890" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Telefon</label>
                  <input value={musteriForm.telefon} onChange={e => setMusteriForm(p => ({ ...p, telefon: e.target.value }))} placeholder="+90 212 000 00 00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">E-posta</label>
                  <input type="email" value={musteriForm.email} onChange={e => setMusteriForm(p => ({ ...p, email: e.target.value }))} placeholder="info@firma.com" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Adres</label>
                  <input value={musteriForm.adres} onChange={e => setMusteriForm(p => ({ ...p, adres: e.target.value }))} placeholder="İl, ilçe, sokak…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                    <Save className="w-4 h-4" /> Kaydet
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {musteriler.filter(m => !search || m.ad.toLowerCase().includes(search.toLowerCase())).map(m => {
                const mGelir = islemler.filter(i => i.musteriId === m.id && i.tur === 'gelir').reduce((s, i) => s + i.tutar, 0);
                const mSefer = seferler.filter(s => s.musteriId === m.id).length;
                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{m.ad}</p>
                          {m.vergiNo && <p className="text-xs text-gray-400">VN: {m.vergiNo}</p>}
                        </div>
                      </div>
                      <button onClick={() => deleteMusteri(m.id)} className="text-gray-200 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      {m.telefon && <p className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5" /> {m.telefon}</p>}
                      {m.email   && <p className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5" /> {m.email}</p>}
                      {m.adres   && <p className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="w-3.5 h-3.5" /> {m.adres}</p>}
                    </div>
                    <div className="flex gap-4 pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-lg font-black text-green-600">{TL(mGelir)}</p>
                        <p className="text-xs text-gray-400">Toplam Alacak</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900">{mSefer}</p>
                        <p className="text-xs text-gray-400">Sefer</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {musteriler.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 text-sm">Henüz müşteri yok. &ldquo;Yeni Müşteri&rdquo; ile ekleyin.</div>
              )}
            </div>
          </>
        )}

        {/* ── PERSONEL & PUANTAJ ──────────────────────────────── */}
        {tab === 'personel' && (
          <>
            {/* Personel listesi */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-gray-900">Personel</h2>
              <button onClick={() => { setShowForm(p => !p); setEditId(null); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Yeni Personel
              </button>
            </div>

            {showForm && editId === null && (
              <form onSubmit={submitPersonel} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full font-bold text-gray-900">Yeni Personel</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ad Soyad *</label>
                  <input required value={personelForm.ad} onChange={e => setPersonelForm(p => ({ ...p, ad: e.target.value }))} placeholder="Ahmet Yılmaz" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Unvan / Pozisyon</label>
                  <input value={personelForm.unvan} onChange={e => setPersonelForm(p => ({ ...p, unvan: e.target.value }))} placeholder="TIR Şoförü" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Telefon</label>
                  <input value={personelForm.telefon} onChange={e => setPersonelForm(p => ({ ...p, telefon: e.target.value }))} placeholder="+90 5xx xxx xx xx" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">TC Kimlik No</label>
                  <input value={personelForm.tcNo} onChange={e => setPersonelForm(p => ({ ...p, tcNo: e.target.value }))} placeholder="12345678901" maxLength={11} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Maaş (₺ / ay)</label>
                  <input type="number" min="0" value={personelForm.maas} onChange={e => setPersonelForm(p => ({ ...p, maas: e.target.value }))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">İşe Başlangıç *</label>
                  <input required type="date" value={personelForm.baslangicTarihi} onChange={e => setPersonelForm(p => ({ ...p, baslangicTarihi: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                    <Save className="w-4 h-4" /> Kaydet
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personeller.map(p => (
                <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${!p.aktif ? 'opacity-60' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.aktif ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                        <Users className={`w-5 h-5 ${p.aktif ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.ad}</p>
                        <p className="text-xs text-gray-400">{p.unvan || 'Pozisyon belirtilmemiş'}</p>
                      </div>
                    </div>
                    <button onClick={() => deletePersonel(p.id)} className="text-gray-200 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 mb-4 text-xs text-gray-500">
                    {p.telefon && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {p.telefon}</p>}
                    <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {fmtDate(p.baslangicTarihi)}&apos;dan beri</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-lg font-black text-gray-900">{TL(p.maas)}</p>
                      <p className="text-xs text-gray-400">/ay</p>
                    </div>
                    <button
                      onClick={() => { setSelPersonel(p.id); setEditId(p.id); setShowForm(true); setPuantajForm(prev => ({ ...prev, personelId: p.id })); }}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ClipboardList className="w-3.5 h-3.5" /> Puantaj Gir
                    </button>
                  </div>
                </div>
              ))}
              {personeller.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 text-sm">Henüz personel yok.</div>
              )}
            </div>

            {/* Puantaj girişi */}
            {showForm && editId !== null && (
              <form onSubmit={submitPuantaj} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-full flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Puantaj Girişi — {personeller.find(p => p.id === editId)?.ad}</h3>
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tarih *</label>
                  <input required type="date" value={puantajForm.tarih} onChange={e => setPuantajForm(p => ({ ...p, tarih: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Giriş Saati</label>
                  <input type="time" value={puantajForm.girisSaati} onChange={e => setPuantajForm(p => ({ ...p, girisSaati: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Çıkış Saati</label>
                  <input type="time" value={puantajForm.cikisSaati} onChange={e => setPuantajForm(p => ({ ...p, cikisSaati: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fazla Mesai (saat)</label>
                  <input type="number" min="0" step="0.5" value={puantajForm.fazlaMesai} onChange={e => setPuantajForm(p => ({ ...p, fazlaMesai: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">İzin Türü</label>
                  <select value={puantajForm.izinTuru} onChange={e => setPuantajForm(p => ({ ...p, izinTuru: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Çalışıldı</option>
                    <option value="yillik">Yıllık İzin</option>
                    <option value="hastalik">Hastalık İzni</option>
                    <option value="ucretsiz">Ücretsiz İzin</option>
                    <option value="resmi">Resmi Tatil</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Not</label>
                  <input value={puantajForm.notlar} onChange={e => setPuantajForm(p => ({ ...p, notlar: e.target.value }))} placeholder="Opsiyonel not…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                    <Save className="w-4 h-4" /> Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Puantaj tablosu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <h3 className="font-bold text-gray-900 text-sm">Puantaj Tablosu</h3>
                <input type="month" value={puantajAy} onChange={e => setPuantajAy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={selPersonel} onChange={e => setSelPersonel(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Tüm Personel</option>
                  {personeller.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
                </select>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Personel', 'Tarih', 'Giriş', 'Çıkış', 'Fazla Mesai', 'Durum', 'Not', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {puantajlar.map(pt => (
                    <tr key={pt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {pt.personel?.ad ?? '—'}
                        {pt.personel?.unvan && <span className="block text-xs text-gray-400 font-normal">{pt.personel.unvan}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(pt.tarih)}</td>
                      <td className="px-4 py-3 text-gray-700 font-mono">{pt.girisSaati ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700 font-mono">{pt.cikisSaati ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {pt.fazlaMesai > 0
                          ? <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">+{pt.fazlaMesai}s</span>
                          : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3"><IzinBadge izin={pt.izinTuru} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[120px] truncate">{pt.notlar || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deletePuantaj(pt.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {puantajlar.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Bu ay için puantaj kaydı yok.</td></tr>
                  )}
                </tbody>
              </table>
              {puantajlar.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-50 flex gap-6 text-xs text-gray-500">
                  <span>{puantajlar.filter(p => !p.izinTuru).length} çalışma günü</span>
                  <span className="text-amber-600">{puantajlar.filter(p => p.izinTuru === 'yillik').length} yıllık izin</span>
                  <span className="text-red-500">{puantajlar.filter(p => p.izinTuru === 'hastalik').length} hastalık izni</span>
                  <span className="text-amber-700">{puantajlar.reduce((s, p) => s + p.fazlaMesai, 0).toFixed(1)}s fazla mesai</span>
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
