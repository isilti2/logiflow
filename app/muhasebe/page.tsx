'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard, Truck, Receipt, Users, UserCheck,
  LogOut, Plus, Trash2, ChevronRight, ArrowUpRight,
  ArrowDownRight, TrendingUp, Wallet, Calendar,
  Search, X, CheckCircle2, Clock, Building2, Phone,
  Mail, MapPin, Save, CalendarDays, Car, Fuel,
  FileText, Printer, AlertTriangle, ShieldCheck,
  ClipboardList, Calculator,
} from 'lucide-react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

/* ─── Types ─────────────────────────────────────────────────── */
type Musteri   = { id: string; ad: string; vergiNo: string; telefon: string; email: string; adres: string; bakiye: number; createdAt: string };
type Tahsilat  = { id: string; musteriId: string; faturaId: string | null; tutar: number; tarih: string; notlar: string; createdAt: string; musteri?: { id: string; ad: string }; fatura?: { id: string; faturaNo: string; genelToplam: number } | null };
type Sefer     = { id: string; musteriId: string | null; musteri?: { id: string; ad: string } | null; aracPlaka: string; rotaDan: string; rotaAya: string; mesafeKm: number; tarih: string; yukAgirligi: number; seferUcreti: number; yakitMaliyeti: number; notlar: string; durum: string; createdAt: string };
type MaliIslem = { id: string; seferId: string | null; musteriId: string | null; sefer?: { rotaDan: string; rotaAya: string } | null; musteri?: { ad: string } | null; tur: string; kategori: string; tutar: number; kdvOrani: number; aciklama: string; tarih: string; createdAt: string };
type Personel  = { id: string; ad: string; unvan: string; telefon: string; tcNo: string; maas: number; baslangicTarihi: string; aktif: boolean; createdAt: string; _count?: { puantajlar: number } };
type Puantaj   = { id: string; personelId: string; tarih: string; girisSaati: string | null; cikisSaati: string | null; fazlaMesai: number; izinTuru: string | null; notlar: string; personel?: { id: string; ad: string; unvan: string } };
type Arac      = { id: string; plaka: string; marka: string; model: string; yil: number | null; ruhsatSon: string | null; sigortaSon: string | null; muayeneSon: string | null; aktif: boolean; notlar: string; createdAt: string; _count?: { yakitKayitlari: number } };
type YakitKaydi = { id: string; aracId: string; tarih: string; litre: number; birimFiyat: number; toplamTutar: number; kmSayaci: number; istasyon: string; notlar: string; arac?: { id: string; plaka: string; marka: string; model: string } };
type FaturaSatiri = { aciklama: string; miktar: number; birimFiyat: number; kdvOrani: number };
type Fatura    = { id: string; faturaNo: string; tarih: string; vadeTarih: string | null; satirlar: string; araToplam: number; kdvToplam: number; genelToplam: number; notlar: string; durum: string; createdAt: string; musteri?: { id: string; ad: string; vergiNo: string; adres: string; email: string; telefon: string } | null; sefer?: { id: string; rotaDan: string; rotaAya: string; aracPlaka: string } | null };
type Bordro    = { id: string; personelId: string; ay: string; brutMaas: number; fazlaMesaiUcret: number; sgkIsci: number; issizlikIsci: number; gelirVergisi: number; damgaVergisi: number; netMaas: number; sgkIsveren: number; toplamMaliyet: number; createdAt: string; personel?: { id: string; ad: string; unvan: string } };

type Tab = 'genel' | 'seferler' | 'islemler' | 'cari' | 'araclar' | 'faturalar' | 'personel' | 'raporlar' | 'donem';

type SeferRapor   = { id: string; rotaDan: string; rotaAya: string; aracPlaka: string; tarih: string; durum: string; musteriAd: string | null; seferUcreti: number; yakitMaliyeti: number; toplamGelir: number; toplamGider: number; netKar: number; mesafeKm: number };
type AracRapor    = { plaka: string; marka: string; model: string; seferGelir: number; seferSayisi: number; yakitTutar: number; kmTopla: number; netKar: number; kmBasiMaliyet: number };
type MusteriRapor = { id: string; ad: string; vergiNo: string; seferSayisi: number; faturaSayisi: number; toplamFatura: number; toplamTahsilat: number; bakiye: number; bekleyenFatura: number; tahsilatOrani: number };
type Donem        = { id: string; ay: string; durum: string; notlar: string; kapatildiAt: string | null; createdAt: string };

/* ─── Sabit listeler ─────────────────────────────────────────── */
const GIDER_KATEGORILER = ['Yakıt', 'Bakım', 'Sigorta', 'Ruhsat', 'Köprü / Geçiş', 'Personel Maaşı', 'Kira', 'Diğer'];
const GELIR_KATEGORILER = ['Sefer Ücreti', 'Kira Geliri', 'Diğer'];
const KDV_ORANLARI      = [0, 10, 20];

/* ─── Yardımcılar ────────────────────────────────────────────── */
const TL       = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
const fmtDate  = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const thisMonth = () => new Date().toISOString().slice(0, 7);

function expiryStatus(dateStr: string | null | undefined): 'expired' | 'warn' | 'ok' | 'none' {
  if (!dateStr) return 'none';
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = diff / 86_400_000;
  if (days < 0) return 'expired';
  if (days <= 30) return 'warn';
  return 'ok';
}
function ExpiryPill({ label, date }: { label: string; date: string | null | undefined }) {
  const s = expiryStatus(date);
  const cfg = {
    expired: { cls: 'bg-red-50 text-red-700 border border-red-100',   icon: <AlertTriangle className="w-3 h-3" /> },
    warn:    { cls: 'bg-amber-50 text-amber-700 border border-amber-100', icon: <Clock className="w-3 h-3" /> },
    ok:      { cls: 'bg-green-50 text-green-700 border border-green-100', icon: <ShieldCheck className="w-3 h-3" /> },
    none:    { cls: 'bg-gray-50 text-gray-400 border border-gray-100',  icon: null },
  }[s];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.icon} {label}{date ? `: ${fmtDate(date)}` : ': —'}
    </span>
  );
}

function DurumBadge({ durum }: { durum: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    planlandi:  { label: 'Planlandı',    cls: 'bg-blue-50 text-blue-700' },
    devam:      { label: 'Devam Ediyor', cls: 'bg-amber-50 text-amber-700' },
    tamamlandi: { label: 'Tamamlandı',  cls: 'bg-green-50 text-green-700' },
    iptal:      { label: 'İptal',        cls: 'bg-red-50 text-red-600' },
    beklemede:  { label: 'Beklemede',   cls: 'bg-yellow-50 text-yellow-700' },
    odendi:     { label: 'Ödendi',       cls: 'bg-green-50 text-green-700' },
  };
  const d = map[durum] ?? { label: durum, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${d.cls}`}>{d.label}</span>;
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
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[color] ?? colors.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Fatura Yazdır ──────────────────────────────────────────── */
function printFatura(fatura: Fatura) {
  const satirlar: FaturaSatiri[] = JSON.parse(fatura.satirlar || '[]');
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Fatura ${fatura.faturaNo}</title>
  <style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:40px;color:#111;font-size:14px}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
    .logo{font-size:22px;font-weight:900}.logo span{color:#2563eb}
    .badge{display:inline-block;margin-top:8px;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;background:${fatura.durum==='odendi'?'#dcfce7':fatura.durum==='iptal'?'#fee2e2':'#fef9c3'};color:${fatura.durum==='odendi'?'#166534':fatura.durum==='iptal'?'#991b1b':'#854d0e'}}
    .musteri-box{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:24px;background:#f9fafb}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    th{background:#f3f4f6;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280}
    td{padding:9px 12px;border-bottom:1px solid #f3f4f6}
    .tr{text-align:right}.totals{width:280px;margin-left:auto}
    .totals td{padding:5px 12px;font-size:13px}.grand{font-weight:700;font-size:15px;border-top:2px solid #111}
    .footer{margin-top:36px;text-align:center;font-size:11px;color:#9ca3af}
    @media print{body{padding:20px}}
  </style></head><body>
  <div class="hdr">
    <div><div class="logo">Logi<span>Flow</span></div><div style="font-size:11px;color:#6b7280;margin-top:3px">Lojistik Yönetim Platformu</div></div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:700">${fatura.faturaNo}</div>
      <div style="color:#6b7280;font-size:12px">Tarih: ${fmtDate(fatura.tarih)}</div>
      ${fatura.vadeTarih ? `<div style="color:#6b7280;font-size:12px">Vade: ${fmtDate(fatura.vadeTarih)}</div>` : ''}
      <div class="badge">${fatura.durum === 'odendi' ? 'ÖDENDİ' : fatura.durum === 'iptal' ? 'İPTAL' : 'BEKLEMEDE'}</div>
    </div>
  </div>
  ${fatura.musteri ? `<div class="musteri-box">
    <div style="font-size:10px;color:#9ca3af;margin-bottom:4px;text-transform:uppercase">Fatura Kesilen</div>
    <div style="font-weight:700;font-size:15px">${fatura.musteri.ad}</div>
    ${fatura.musteri.vergiNo ? `<div style="font-size:12px;color:#6b7280">Vergi No: ${fatura.musteri.vergiNo}</div>` : ''}
    ${fatura.musteri.adres ? `<div style="font-size:12px;color:#6b7280">${fatura.musteri.adres}</div>` : ''}
    ${fatura.musteri.email ? `<div style="font-size:12px;color:#6b7280">${fatura.musteri.email}</div>` : ''}
  </div>` : ''}
  <table>
    <thead><tr><th>Açıklama</th><th class="tr">Miktar</th><th class="tr">Birim Fiyat</th><th class="tr">KDV</th><th class="tr">Toplam</th></tr></thead>
    <tbody>${satirlar.map(s => `<tr>
      <td>${s.aciklama}</td><td class="tr">${s.miktar}</td>
      <td class="tr">${new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(s.birimFiyat)}</td>
      <td class="tr">%${s.kdvOrani}</td>
      <td class="tr">${new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(s.miktar*s.birimFiyat*(1+s.kdvOrani/100))}</td>
    </tr>`).join('')}</tbody>
  </table>
  <table class="totals">
    <tr><td>Ara Toplam</td><td class="tr">${new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(fatura.araToplam)}</td></tr>
    <tr><td>KDV Toplam</td><td class="tr">${new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(fatura.kdvToplam)}</td></tr>
    <tr class="grand"><td>GENEL TOPLAM</td><td class="tr">${new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(fatura.genelToplam)}</td></tr>
  </table>
  ${fatura.notlar ? `<div style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:6px;font-size:12px"><b>Notlar:</b> ${fatura.notlar}</div>` : ''}
  ${fatura.sefer ? `<div style="margin-top:8px;font-size:12px;color:#6b7280">İlgili Sefer: ${fatura.sefer.rotaDan} → ${fatura.sefer.rotaAya} (${fatura.sefer.aracPlaka})</div>` : ''}
  <div class="footer">Bu fatura LogiFlow lojistik yönetim sistemi ile oluşturulmuştur.</div>
  </body></html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function MuhasebePage() {
  const router = useRouter();
  const [authed, setAuthed]     = useState<boolean | null>(null);
  const [tab, setTab]           = useState<Tab>('genel');
  const [netError, setNetError] = useState('');

  // Core data
  const [musteriler,  setMusteriler]  = useState<Musteri[]>([]);
  const [seferler,    setSeferler]    = useState<Sefer[]>([]);
  const [islemler,    setIslemler]    = useState<MaliIslem[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [puantajlar,  setPuantajlar]  = useState<Puantaj[]>([]);
  const [araclar,     setAraclar]     = useState<Arac[]>([]);
  const [yakitlar,    setYakitlar]    = useState<YakitKaydi[]>([]);
  const [faturalar,   setFaturalar]   = useState<Fatura[]>([]);
  const [bordrolar,   setBordrolar]   = useState<Bordro[]>([]);
  const [tahsilatlar,   setTahsilatlar]   = useState<Tahsilat[]>([]);
  const [donemler,      setDonemler]      = useState<Donem[]>([]);
  const [seferRapor,    setSeferRapor]    = useState<SeferRapor[]>([]);
  const [aracRapor,     setAracRapor]     = useState<AracRapor[]>([]);
  const [musteriRapor,  setMusteriRapor]  = useState<MusteriRapor[]>([]);
  const [raporTip,      setRaporTip]      = useState<'seferler'|'araclar'|'musteriler'>('seferler');
  const [raporDonem,    setRaporDonem]    = useState('');
  const [raporYuklendi, setRaporYuklendi] = useState(false);

  // UI
  const [search,      setSearch]      = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [puantajAy,   setPuantajAy]   = useState(thisMonth);
  const [selPersonel, setSelPersonel] = useState('');
  const [bordroAy,    setBordroAy]    = useState(thisMonth);
  const [selArac,     setSelArac]     = useState('');
  const [plakaManuel,    setPlakaManuel]    = useState(false);
  const [selMusteri,     setSelMusteri]     = useState('');
  const [tahsilatForm,   setTahsilatForm]   = useState({ musteriId: '', faturaId: '', tutar: '', tarih: '', notlar: '' });

  // Forms
  const [musteriForm,  setMusteriForm]  = useState({ ad: '', vergiNo: '', telefon: '', email: '', adres: '' });
  const [seferForm,    setSeferForm]    = useState({ musteriId: '', aracPlaka: '', rotaDan: '', rotaAya: '', mesafeKm: '', tarih: '', yukAgirligi: '', seferUcreti: '', yakitMaliyeti: '', notlar: '', durum: 'planlandi' });
  const [islemForm,    setIslemForm]    = useState({ seferId: '', musteriId: '', tur: 'gider', kategori: 'Yakıt', tutar: '', kdvOrani: '0', aciklama: '', tarih: '' });
  const [personelForm, setPersonelForm] = useState({ ad: '', unvan: '', telefon: '', tcNo: '', maas: '', baslangicTarihi: '' });
  const [puantajForm,  setPuantajForm]  = useState({ personelId: '', tarih: '', girisSaati: '08:00', cikisSaati: '17:00', fazlaMesai: '0', izinTuru: '', notlar: '' });
  const [aracForm,     setAracForm]     = useState({ plaka: '', marka: '', model: '', yil: '', ruhsatSon: '', sigortaSon: '', muayeneSon: '', notlar: '' });
  const [yakitForm,    setYakitForm]    = useState({ aracId: '', tarih: '', litre: '', birimFiyat: '', kmSayaci: '', istasyon: '', notlar: '' });
  const [faturaForm,   setFaturaForm]   = useState({ musteriId: '', seferId: '', tarih: '', vadeTarih: '', notlar: '', durum: 'beklemede' });
  const [faturaSatirlari, setFaturaSatirlari] = useState<FaturaSatiri[]>([{ aciklama: '', miktar: 1, birimFiyat: 0, kdvOrani: 20 }]);

  /* ── Veri yükleme ── */
  const loadAll = useCallback(async () => {
    const [mRes, sRes, iRes, pRes, aRes, fRes, tRes] = await Promise.all([
      fetch('/api/muhasebe/musteriler'),
      fetch('/api/muhasebe/seferler'),
      fetch('/api/muhasebe/islemler'),
      fetch('/api/muhasebe/personel'),
      fetch('/api/muhasebe/araclar'),
      fetch('/api/muhasebe/faturalar'),
      fetch('/api/muhasebe/tahsilat'),
    ]);
    if (mRes.ok) setMusteriler(await mRes.json());
    if (sRes.ok) setSeferler(await sRes.json());
    if (iRes.ok) setIslemler(await iRes.json());
    if (pRes.ok) setPersoneller(await pRes.json());
    if (aRes.ok) setAraclar(await aRes.json());
    if (fRes.ok) setFaturalar(await fRes.json());
    if (tRes.ok) setTahsilatlar(await tRes.json());
    const dRes = await fetch('/api/muhasebe/donem');
    if (dRes.ok) setDonemler(await dRes.json());
  }, []);

  const loadRapor = useCallback(async (tip: string, donem: string) => {
    setRaporYuklendi(false);
    const params = new URLSearchParams({ tip });
    if (donem) params.set('donem', donem);
    const res = await fetch(`/api/muhasebe/rapor?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    if (tip === 'seferler')   setSeferRapor(data);
    if (tip === 'araclar')    setAracRapor(data);
    if (tip === 'musteriler') setMusteriRapor(data);
    setRaporYuklendi(true);
  }, []);

  const loadYakit = useCallback(async () => {
    const params = selArac ? `?aracId=${selArac}` : '';
    const res = await fetch(`/api/muhasebe/yakit${params}`);
    if (res.ok) setYakitlar(await res.json());
  }, [selArac]);

  const loadPuantaj = useCallback(async () => {
    const params = new URLSearchParams({ ay: puantajAy });
    if (selPersonel) params.set('personelId', selPersonel);
    const res = await fetch(`/api/muhasebe/puantaj?${params}`);
    if (res.ok) setPuantajlar(await res.json());
  }, [puantajAy, selPersonel]);

  const loadBordro = useCallback(async () => {
    const res = await fetch(`/api/muhasebe/bordro?ay=${bordroAy}`);
    if (res.ok) setBordrolar(await res.json());
  }, [bordroAy]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (r) => {
        if (r.status === 401) { router.replace('/login'); return; }
        setAuthed(true);
        try {
          await loadAll();
        } catch {
          setNetError('Veriler yüklenemedi. Lütfen sayfayı yenileyin.');
        }
      })
      .catch(() => setNetError('Sunucuya bağlanılamadı.'));
  }, [router, loadAll]);

  useEffect(() => { if (authed && tab === 'personel') { loadPuantaj(); loadBordro(); } }, [authed, tab, puantajAy, selPersonel, bordroAy, loadPuantaj, loadBordro]);
  useEffect(() => { if (authed && tab === 'araclar') loadYakit(); }, [authed, tab, selArac, loadYakit]);
  useEffect(() => { if (authed && tab === 'raporlar') loadRapor(raporTip, raporDonem); }, [authed, tab, raporTip, raporDonem, loadRapor]);

  /* ── Hesaplar ── */
  const toplamGelir = islemler.filter(i => i.tur === 'gelir').reduce((s, i) => s + i.tutar, 0);
  const toplamGider = islemler.filter(i => i.tur === 'gider').reduce((s, i) => s + i.tutar, 0);
  const netKar      = toplamGelir - toplamGider;
  const aktifSefer  = seferler.filter(s => s.durum === 'devam').length;

  const faturaAraToplam = faturaSatirlari.reduce((s, r) => s + r.miktar * r.birimFiyat, 0);
  const faturaKdvToplam = faturaSatirlari.reduce((s, r) => s + r.miktar * r.birimFiyat * (r.kdvOrani / 100), 0);

  /* ── Handlers: Müşteri ── */
  async function submitMusteri(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/musteriler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(musteriForm) });
    if (res.ok) { const n = await res.json(); setMusteriler(p => [n, ...p]); setMusteriForm({ ad: '', vergiNo: '', telefon: '', email: '', adres: '' }); setShowForm(false); }
  }
  async function deleteMusteri(id: string) {
    await fetch(`/api/muhasebe/musteriler/${id}`, { method: 'DELETE' });
    setMusteriler(p => p.filter(m => m.id !== id));
  }

  /* ── Handlers: Dönem ── */
  async function donemOlustur(ay: string) {
    const res = await fetch('/api/muhasebe/donem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ay }) });
    if (res.ok) { const n = await res.json(); setDonemler(p => { const ex = p.find(d => d.ay === ay); return ex ? p.map(d => d.ay === ay ? n : d) : [n, ...p]; }); }
  }
  async function donemKapat(id: string) {
    const res = await fetch(`/api/muhasebe/donem/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ durum: 'kapali' }) });
    if (res.ok) { const n = await res.json(); setDonemler(p => p.map(d => d.id === id ? n : d)); }
  }
  async function donemAc(id: string) {
    const res = await fetch(`/api/muhasebe/donem/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ durum: 'acik' }) });
    if (res.ok) { const n = await res.json(); setDonemler(p => p.map(d => d.id === id ? n : d)); }
  }
  async function donemSil(id: string) {
    const res = await fetch(`/api/muhasebe/donem/${id}`, { method: 'DELETE' });
    if (res.ok) setDonemler(p => p.filter(d => d.id !== id));
    else { const e = await res.json(); alert(e.error); }
  }

  /* ── Handlers: Tahsilat ── */
  async function submitTahsilat(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/tahsilat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tahsilatForm) });
    if (res.ok) {
      const n = await res.json();
      setTahsilatlar(p => [n, ...p]);
      setMusteriler(p => p.map(m => m.id === tahsilatForm.musteriId ? { ...m, bakiye: m.bakiye - Number(tahsilatForm.tutar) } : m));
      if (tahsilatForm.faturaId) setFaturalar(p => p.map(f => f.id === tahsilatForm.faturaId && Number(tahsilatForm.tutar) >= f.genelToplam ? { ...f, durum: 'odendi' } : f));
      setTahsilatForm({ musteriId: '', faturaId: '', tutar: '', tarih: '', notlar: '' });
      setShowForm(false);
    }
  }
  async function deleteTahsilat(id: string) {
    const t = tahsilatlar.find(x => x.id === id);
    await fetch(`/api/muhasebe/tahsilat/${id}`, { method: 'DELETE' });
    setTahsilatlar(p => p.filter(x => x.id !== id));
    if (t) setMusteriler(p => p.map(m => m.id === t.musteriId ? { ...m, bakiye: m.bakiye + t.tutar } : m));
  }

  /* ── Handlers: Sefer ── */
  async function submitSefer(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/seferler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seferForm) });
    if (res.ok) { const n = await res.json(); setSeferler(p => [n, ...p]); setSeferForm({ musteriId: '', aracPlaka: '', rotaDan: '', rotaAya: '', mesafeKm: '', tarih: '', yukAgirligi: '', seferUcreti: '', yakitMaliyeti: '', notlar: '', durum: 'planlandi' }); setPlakaManuel(false); setShowForm(false); }
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

  /* ── Handlers: Mali İşlem ── */
  async function submitIslem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/islemler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(islemForm) });
    if (res.ok) { const n = await res.json(); setIslemler(p => [n, ...p]); setIslemForm({ seferId: '', musteriId: '', tur: 'gider', kategori: 'Yakıt', tutar: '', kdvOrani: '0', aciklama: '', tarih: '' }); setShowForm(false); }
  }
  async function deleteIslem(id: string) {
    await fetch(`/api/muhasebe/islemler/${id}`, { method: 'DELETE' });
    setIslemler(p => p.filter(i => i.id !== id));
  }

  /* ── Handlers: Personel & Puantaj ── */
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
  async function hesaplaBordro(personelId: string) {
    const res = await fetch('/api/muhasebe/bordro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personelId, ay: bordroAy }) });
    if (res.ok) { const n = await res.json(); setBordrolar(p => { const existing = p.find(b => b.personelId === personelId && b.ay === bordroAy); return existing ? p.map(b => b.personelId === personelId && b.ay === bordroAy ? n : b) : [n, ...p]; }); }
  }

  /* ── Handlers: Araç & Yakıt ── */
  async function submitArac(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/araclar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aracForm) });
    if (res.ok) { const n = await res.json(); setAraclar(p => [n, ...p]); setAracForm({ plaka: '', marka: '', model: '', yil: '', ruhsatSon: '', sigortaSon: '', muayeneSon: '', notlar: '' }); setShowForm(false); }
  }
  async function deleteArac(id: string) {
    await fetch(`/api/muhasebe/araclar/${id}`, { method: 'DELETE' });
    setAraclar(p => p.filter(a => a.id !== id));
  }
  async function submitYakit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/yakit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yakitForm) });
    if (res.ok) {
      const n = await res.json();
      setYakitlar(p => [n, ...p]);
      // Otomatik gider kaydı oluştur
      const plaka = araclar.find(a => a.id === yakitForm.aracId)?.plaka ?? '';
      const aciklama = ['Yakıt', plaka, yakitForm.istasyon].filter(Boolean).join(' — ');
      const islemRes = await fetch('/api/muhasebe/islemler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tur: 'gider', kategori: 'Yakıt', tutar: n.toplamTutar, kdvOrani: 18, aciklama, tarih: yakitForm.tarih }),
      });
      if (islemRes.ok) { const ni = await islemRes.json(); setIslemler(p => [ni, ...p]); }
      setYakitForm(f => ({ ...f, tarih: '', litre: '', birimFiyat: '', kmSayaci: '', istasyon: '', notlar: '' }));
      setShowForm(false);
    }
  }
  async function deleteYakit(id: string) {
    await fetch(`/api/muhasebe/yakit/${id}`, { method: 'DELETE' });
    setYakitlar(p => p.filter(y => y.id !== id));
  }

  /* ── Handlers: Fatura ── */
  function addFaturaSatiri() { setFaturaSatirlari(p => [...p, { aciklama: '', miktar: 1, birimFiyat: 0, kdvOrani: 20 }]); }
  function removeFaturaSatiri(i: number) { setFaturaSatirlari(p => p.filter((_, idx) => idx !== i)); }
  function updateSatir(i: number, field: keyof FaturaSatiri, value: string | number) {
    setFaturaSatirlari(p => p.map((s, idx) => idx === i ? { ...s, [field]: typeof value === 'string' ? value : Number(value) } : s));
  }
  async function submitFatura(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/muhasebe/faturalar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...faturaForm, satirlar: faturaSatirlari }) });
    if (res.ok) { const n = await res.json(); setFaturalar(p => [n, ...p]); setFaturaForm({ musteriId: '', seferId: '', tarih: '', vadeTarih: '', notlar: '', durum: 'beklemede' }); setFaturaSatirlari([{ aciklama: '', miktar: 1, birimFiyat: 0, kdvOrani: 20 }]); setShowForm(false); }
  }
  async function updateFaturaDurum(id: string, durum: string) {
    const res = await fetch(`/api/muhasebe/faturalar/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ durum }) });
    if (res.ok) { const u = await res.json(); setFaturalar(p => p.map(f => f.id === id ? u : f)); }
  }
  async function deleteFatura(id: string) {
    await fetch(`/api/muhasebe/faturalar/${id}`, { method: 'DELETE' });
    setFaturalar(p => p.filter(f => f.id !== id));
  }

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" role="status" aria-label="Yükleniyor" />
    </div>
  );

  const NAV: { tab: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'genel',    label: 'Genel Bakış',        icon: LayoutDashboard },
    { tab: 'seferler', label: 'Seferler',            icon: Truck },
    { tab: 'islemler', label: 'Gelir / Gider',       icon: Receipt },
    { tab: 'cari',     label: 'Cari Hesap',          icon: Building2 },
    { tab: 'araclar',  label: 'Araçlar & Yakıt',    icon: Car },
    { tab: 'faturalar',label: 'Faturalar',           icon: FileText },
    { tab: 'personel', label: 'Personel & Puantaj',  icon: UserCheck },
    { tab: 'raporlar', label: 'Raporlar',             icon: TrendingUp },
    { tab: 'donem',    label: 'Dönem Yönetimi',       icon: CalendarDays },
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
              <span className="text-lg font-bold text-gray-900 tracking-tight hidden sm:block">Logi<span className="text-blue-600">Flow</span></span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
            <span className="text-sm font-bold text-gray-700 hidden sm:block">Muhasebe</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors hidden sm:block">← Dashboard</Link>
            <button onClick={async () => { await logout(); window.location.href = '/'; }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4 pb-1">
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lojistik Muhasebe' },
        ]} />
      </div>

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
            {NAV.map(({ tab: t, label, icon: Icon }) => (
              <button key={t} onClick={() => { setTab(t); setShowForm(false); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">

        {netError && (
          <ErrorAlert message={netError} onDismiss={() => setNetError('')} />
        )}

        {/* ════════════════════════════════════════════════════════
            GENEL BAKIŞ
        ════════════════════════════════════════════════════════ */}
        {tab === 'genel' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Toplam Gelir"  value={TL(toplamGelir)} sub={`${islemler.filter(i=>i.tur==='gelir').length} işlem`} color="green"  icon={ArrowUpRight} />
              <StatCard label="Toplam Gider"  value={TL(toplamGider)} sub={`${islemler.filter(i=>i.tur==='gider').length} işlem`} color="red"    icon={ArrowDownRight} />
              <StatCard label="Net Kar"       value={TL(netKar)}      sub={netKar >= 0 ? 'Kârlı' : 'Zararda'} color={netKar >= 0 ? 'blue' : 'red'} icon={TrendingUp} />
              <StatCard label="Aktif Sefer"   value={String(aktifSefer)} sub={`${seferler.length} toplam`} color="amber" icon={Truck} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Araç Sayısı"   value={String(araclar.filter(a=>a.aktif).length)} sub={`${araclar.length} toplam`} color="indigo" icon={Car} />
              <StatCard label="Açık Fatura"   value={TL(faturalar.filter(f=>f.durum==='beklemede').reduce((s,f)=>s+f.genelToplam,0))} sub={`${faturalar.filter(f=>f.durum==='beklemede').length} bekliyor`} color="amber" icon={FileText} />
              <StatCard label="Aktif Personel" value={String(personeller.filter(p=>p.aktif).length)} sub={`${personeller.length} toplam`} color="purple" icon={Users} />
              <StatCard label="Müşteri / Cari" value={String(musteriler.length)} color="blue" icon={Building2} />
            </div>

            {/* Uyarılar: Süresi dolan/yaklaşan belgeler */}
            {(() => {
              const uyarilar: { plaka: string; label: string; tarih: string; status: string }[] = [];
              araclar.forEach(a => {
                [{ key: 'ruhsatSon', label: 'Ruhsat' }, { key: 'sigortaSon', label: 'Sigorta' }, { key: 'muayeneSon', label: 'Muayene' }].forEach(({ key, label }) => {
                  const d = a[key as keyof Arac] as string | null;
                  const s = expiryStatus(d);
                  if (s === 'expired' || s === 'warn') uyarilar.push({ plaka: a.plaka, label, tarih: d!, status: s });
                });
              });
              if (!uyarilar.length) return null;
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Araç Belge Uyarıları ({uyarilar.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {uyarilar.map((u, i) => (
                      <span key={i} className={`text-xs font-semibold px-3 py-1 rounded-full ${u.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {u.plaka} — {u.label} {u.status === 'expired' ? 'süresi doldu' : `(${fmtDate(u.tarih)})`}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Son Seferler</h3>
                  <button onClick={() => setTab('seferler')} className="text-xs text-blue-600 hover:underline font-semibold">Tümü →</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {seferler.slice(0, 5).map(s => (
                    <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><Truck className="w-4 h-4 text-blue-600" /></div>
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
                  {!seferler.length && (
                    <EmptyState
                      icon={Truck}
                      title="Henüz sefer yok"
                      description="İlk seferinizi ekleyerek gelir takibine başlayın."
                      action={{ label: 'Sefer Ekle', onClick: () => setShowForm(true) }}
                    />
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Son Faturalar</h3>
                  <button onClick={() => setTab('faturalar')} className="text-xs text-blue-600 hover:underline font-semibold">Tümü →</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {faturalar.slice(0, 5).map(f => (
                    <div key={f.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-purple-600" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{f.faturaNo}</p>
                        <p className="text-xs text-gray-400">{f.musteri?.ad ?? '—'} · {fmtDate(f.tarih)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{TL(f.genelToplam)}</p>
                        <DurumBadge durum={f.durum} />
                      </div>
                    </div>
                  ))}
                  {!faturalar.length && (
                    <EmptyState icon={FileText} title="Henüz fatura yok" description="Müşterilere fatura keserek alacak takibine başlayın." action={{ label: 'Fatura Oluştur', onClick: () => setShowForm(true) }} />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            SEFERLER
        ════════════════════════════════════════════════════════ */}
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
                {[
                  { label: 'Müşteri (opsiyonel)', type: 'select', key: 'musteriId', options: musteriler.map(m => ({ v: m.id, l: m.ad })) },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                    <select value={seferForm[f.key as keyof typeof seferForm]} onChange={e => setSeferForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">— Seç —</option>
                      {f.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                ))}
                {/* Araç Plakası — kayıtlı araçlardan seç ya da el ile gir */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Araç Plakası *</label>
                  {!plakaManuel && araclar.length > 0 ? (
                    <div className="flex gap-2">
                      <select required value={seferForm.aracPlaka} onChange={e => setSeferForm(p => ({ ...p, aracPlaka: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">— Kayıtlı araç seç —</option>
                        {araclar.filter(a => a.aktif).map(a => <option key={a.id} value={a.plaka}>{a.plaka}{a.marka ? ` · ${a.marka} ${a.model ?? ''}`.trim() : ''}</option>)}
                      </select>
                      <button type="button" onClick={() => { setPlakaManuel(true); setSeferForm(p => ({ ...p, aracPlaka: '' })); }}
                        className="px-3 py-2 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 rounded-xl whitespace-nowrap">El ile gir</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input required value={seferForm.aracPlaka} onChange={e => setSeferForm(p => ({ ...p, aracPlaka: e.target.value.toUpperCase() }))}
                        placeholder="34 ABC 123" className="flex-1 px-3 py-2 border border-blue-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                      {araclar.length > 0 && (
                        <button type="button" onClick={() => { setPlakaManuel(false); setSeferForm(p => ({ ...p, aracPlaka: '' })); }}
                          className="px-3 py-2 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 rounded-xl whitespace-nowrap">← Listeden seç</button>
                      )}
                    </div>
                  )}
                </div>
                {([['Çıkış Noktası *', 'rotaDan', 'text', 'İstanbul'], ['Varış Noktası *', 'rotaAya', 'text', 'Ankara'], ['Tarih *', 'tarih', 'date', ''], ['Mesafe (km)', 'mesafeKm', 'number', '0'], ['Yük Ağırlığı (kg)', 'yukAgirligi', 'number', '0'], ['Sefer Ücreti (₺)', 'seferUcreti', 'number', '0'], ['Yakıt Maliyeti (₺)', 'yakitMaliyeti', 'number', '0']] as [string, keyof typeof seferForm, string, string][]).map(([lbl, key, type, ph]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{lbl}</label>
                    <input required={lbl.endsWith('*')} type={type} min={type==='number'?0:undefined} value={seferForm[key]} onChange={e => setSeferForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Durum</label>
                  <select value={seferForm.durum} onChange={e => setSeferForm(p => ({ ...p, durum: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="planlandi">Planlandı</option><option value="devam">Devam Ediyor</option><option value="tamamlandi">Tamamlandı</option><option value="iptal">İptal</option>
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notlar</label>
                  <input value={seferForm.notlar} onChange={e => setSeferForm(p => ({ ...p, notlar: e.target.value }))} placeholder="Opsiyonel not…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Save className="w-4 h-4" /> Kaydet</button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">{['Rota', 'Plaka', 'Tarih', 'Müşteri', 'Ücret', 'Yakıt', 'Net', 'Durum', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {seferler.filter(s => !search || s.aracPlaka.toLowerCase().includes(search.toLowerCase()) || s.rotaDan.toLowerCase().includes(search.toLowerCase()) || s.rotaAya.toLowerCase().includes(search.toLowerCase())).map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{s.rotaDan} → {s.rotaAya}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{s.aracPlaka}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(s.tarih)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.musteri?.ad ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold text-green-700 whitespace-nowrap">{TL(s.seferUcreti)}</td>
                      <td className="px-4 py-3 text-red-500 whitespace-nowrap">{TL(s.yakitMaliyeti)}</td>
                      <td className={`px-4 py-3 font-bold whitespace-nowrap ${(s.seferUcreti - s.yakitMaliyeti) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{TL(s.seferUcreti - s.yakitMaliyeti)}</td>
                      <td className="px-4 py-3">
                        <select value={s.durum} onChange={e => updateSeferDurum(s.id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="planlandi">Planlandı</option><option value="devam">Devam</option><option value="tamamlandi">Tamamlandı</option><option value="iptal">İptal</option>
                        </select>
                      </td>
                      <td className="px-4 py-3"><button onClick={() => deleteSefer(s.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                  {!seferler.length && <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Henüz sefer kaydı yok.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            GELİR / GİDER
        ════════════════════════════════════════════════════════ */}
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
              <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"><Plus className="w-4 h-4" /> Yeni İşlem</button>
            </div>
            {showForm && (
              <form onSubmit={submitIslem} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full font-bold text-gray-900">Yeni Mali İşlem</h3>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tür *</label>
                  <select value={islemForm.tur} onChange={e => { const tur = e.target.value; setIslemForm(p => ({ ...p, tur, kategori: tur==='gelir'?'Sefer Ücreti':'Yakıt' })); }} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="gider">Gider</option><option value="gelir">Gelir</option>
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Kategori *</label>
                  <select value={islemForm.kategori} onChange={e => setIslemForm(p => ({ ...p, kategori: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {(islemForm.tur==='gelir'?GELIR_KATEGORILER:GIDER_KATEGORILER).map(k => <option key={k}>{k}</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tutar (₺) *</label><input required type="number" min="0" step="0.01" value={islemForm.tutar} onChange={e => setIslemForm(p => ({ ...p, tutar: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">KDV Oranı (%)</label>
                  <select value={islemForm.kdvOrani} onChange={e => setIslemForm(p => ({ ...p, kdvOrani: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {KDV_ORANLARI.map(k => <option key={k} value={k}>%{k}</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tarih *</label><input required type="date" value={islemForm.tarih} onChange={e => setIslemForm(p => ({ ...p, tarih: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">İlgili Sefer</label>
                  <select value={islemForm.seferId} onChange={e => setIslemForm(p => ({ ...p, seferId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— Seç —</option>{seferler.map(s => <option key={s.id} value={s.id}>{s.rotaDan}→{s.rotaAya} ({s.aracPlaka})</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Müşteri</label>
                  <select value={islemForm.musteriId} onChange={e => setIslemForm(p => ({ ...p, musteriId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— Seç —</option>{musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
                  </select></div>
                <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Açıklama</label><input value={islemForm.aciklama} onChange={e => setIslemForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="Opsiyonel açıklama…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Save className="w-4 h-4" /> Kaydet</button>
                </div>
              </form>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">{['Tarih','Tür','Kategori','Açıklama','Sefer','Müşteri','KDV','Tutar',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {islemler.filter(i => !search || i.kategori.toLowerCase().includes(search.toLowerCase()) || i.aciklama.toLowerCase().includes(search.toLowerCase())).map(i => (
                    <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(i.tarih)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${i.tur==='gelir'?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}`}>{i.tur}</span></td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{i.kategori}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{i.aciklama||'—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{i.sefer?`${i.sefer.rotaDan}→${i.sefer.rotaAya}`:'—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{i.musteri?.ad??'—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">%{i.kdvOrani}</td>
                      <td className={`px-4 py-3 font-bold whitespace-nowrap ${i.tur==='gelir'?'text-green-600':'text-red-500'}`}>{i.tur==='gelir'?'+':'-'}{TL(i.tutar)}</td>
                      <td className="px-4 py-3"><button onClick={()=>deleteIslem(i.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                    </tr>
                  ))}
                  {!islemler.length && (
                    <tr><td colSpan={9}>
                      <EmptyState icon={Receipt} title="Henüz mali işlem yok" description="Sefer gelirleri ve giderler burada listelenir. İlk işlemi ekleyin." action={{ label: 'İşlem Ekle', onClick: () => setShowForm(true) }} />
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            CARİ HESAP
        ════════════════════════════════════════════════════════ */}
        {tab === 'cari' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Müşteri ara…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <button onClick={()=>setShowForm(p=>!p)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"><Plus className="w-4 h-4"/> Yeni Müşteri</button>
            </div>
            {showForm && (
              <form onSubmit={submitMusteri} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full font-bold text-gray-900">Yeni Müşteri / Cari</h3>
                {([['Ad / Firma *','ad','text','ABC Lojistik A.Ş.'],['Vergi No','vergiNo','text','1234567890'],['Telefon','telefon','text','+90 212 000 00 00'],['E-posta','email','email','info@firma.com']] as [string,keyof typeof musteriForm,string,string][]).map(([lbl,key,type,ph])=>(
                  <div key={key}><label className="block text-xs font-semibold text-gray-600 mb-1">{lbl}</label><input required={lbl.endsWith('*')} type={type} value={musteriForm[key]} onChange={e=>setMusteriForm(p=>({...p,[key]:e.target.value}))} placeholder={ph} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                ))}
                <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Adres</label><input value={musteriForm.adres} onChange={e=>setMusteriForm(p=>({...p,adres:e.target.value}))} placeholder="İl, ilçe, sokak…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Save className="w-4 h-4"/> Kaydet</button>
                </div>
              </form>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {musteriler.filter(m=>!search||m.ad.toLowerCase().includes(search.toLowerCase())).map(m=>{
                const mSefer = seferler.filter(s=>s.musteriId===m.id).length;
                const mFatura = faturalar.filter(f=>f.musteri?.id===m.id);
                const bekleyen = mFatura.filter(f=>f.durum==='beklemede').reduce((s,f)=>s+f.genelToplam,0);
                const borclu = m.bakiye > 0;
                const alacakli = m.bakiye < 0;
                return (
                  <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${borclu?'border-amber-200':alacakli?'border-green-200':'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${borclu?'bg-amber-50':'bg-blue-50'}`}><Building2 className={`w-5 h-5 ${borclu?'text-amber-600':'text-blue-600'}`}/></div>
                        <div><p className="font-bold text-gray-900">{m.ad}</p>{m.vergiNo&&<p className="text-xs text-gray-400">VN: {m.vergiNo}</p>}</div>
                      </div>
                      <button onClick={()=>deleteMusteri(m.id)} className="text-gray-200 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <div className="space-y-1 mb-3">
                      {m.telefon&&<p className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5"/>{m.telefon}</p>}
                      {m.email&&<p className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5"/>{m.email}</p>}
                      {m.adres&&<p className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="w-3.5 h-3.5"/>{m.adres}</p>}
                    </div>
                    {/* Bakiye gösterimi */}
                    <div className={`rounded-xl px-3 py-2 mb-3 flex items-center justify-between ${borclu?'bg-amber-50':alacakli?'bg-green-50':'bg-gray-50'}`}>
                      <span className="text-xs font-semibold text-gray-500">Cari Bakiye</span>
                      <span className={`font-black text-base ${borclu?'text-amber-700':alacakli?'text-green-700':'text-gray-400'}`}>
                        {m.bakiye > 0 ? '+' : ''}{TL(m.bakiye)}
                        <span className="text-xs font-normal ml-1">{borclu?'borçlu':alacakli?'alacaklı':'sıfır'}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex gap-4">
                        {bekleyen>0&&<div><p className="text-sm font-bold text-amber-600">{TL(bekleyen)}</p><p className="text-xs text-gray-400">Bekleyen fatura</p></div>}
                        <div><p className="text-sm font-bold text-gray-900">{mSefer}</p><p className="text-xs text-gray-400">Sefer</p></div>
                      </div>
                      <button onClick={()=>{setTahsilatForm(f=>({...f,musteriId:m.id,tarih:new Date().toISOString().slice(0,10)}));setSelMusteri(m.id);setShowForm(true);setEditId('tahsilat');}}
                        className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 font-semibold border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Wallet className="w-3.5 h-3.5"/> Tahsilat
                      </button>
                    </div>
                  </div>
                );
              })}
              {!musteriler.length&&(
                <div className="col-span-full">
                  <EmptyState
                    icon={Building2}
                    title="Henüz müşteri yok"
                    description="Fatura kesmek ve cari hesap takibi yapmak için müşteri ekleyin."
                    action={{ label: 'Müşteri Ekle', onClick: () => setShowForm(true) }}
                  />
                </div>
              )}
            </div>

            {/* Tahsilat formu */}
            {showForm && editId==='tahsilat' && (
              <form onSubmit={submitTahsilat} className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-full flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Tahsilat Kaydı — {musteriler.find(m=>m.id===tahsilatForm.musteriId)?.ad}</h3>
                  <button type="button" onClick={()=>setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Müşteri *</label>
                  <select required value={tahsilatForm.musteriId} onChange={e=>setTahsilatForm(p=>({...p,musteriId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">— Seç —</option>{musteriler.map(m=><option key={m.id} value={m.id}>{m.ad}</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">İlgili Fatura (opsiyonel)</label>
                  <select value={tahsilatForm.faturaId} onChange={e=>setTahsilatForm(p=>({...p,faturaId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">— Seç —</option>
                    {faturalar.filter(f=>f.musteri?.id===tahsilatForm.musteriId&&f.durum!=='odendi').map(f=><option key={f.id} value={f.id}>{f.faturaNo} — {TL(f.genelToplam)}</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tutar (₺) *</label>
                  <input required type="number" min="0" step="0.01" value={tahsilatForm.tutar} onChange={e=>setTahsilatForm(p=>({...p,tutar:e.target.value}))} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tarih *</label>
                  <input required type="date" value={tahsilatForm.tarih} onChange={e=>setTahsilatForm(p=>({...p,tarih:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
                <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Notlar</label>
                  <input value={tahsilatForm.notlar} onChange={e=>setTahsilatForm(p=>({...p,notlar:e.target.value}))} placeholder="Opsiyonel not…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Save className="w-4 h-4"/> Kaydet</button>
                </div>
              </form>
            )}

            {/* Tahsilat tablosu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                <Wallet className="w-4 h-4 text-gray-400"/>
                <h3 className="font-bold text-gray-900 text-sm">Tahsilat Geçmişi</h3>
                <select value={selMusteri} onChange={e=>setSelMusteri(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none ml-auto">
                  <option value="">Tüm Müşteriler</option>{musteriler.map(m=><option key={m.id} value={m.id}>{m.ad}</option>)}
                </select>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">{['Tarih','Müşteri','Fatura','Tutar','Not',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {tahsilatlar.filter(t=>!selMusteri||t.musteriId===selMusteri).map(t=>(
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(t.tarih)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{t.musteri?.ad??'—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{t.fatura?.faturaNo??'—'}</td>
                      <td className="px-4 py-3 font-bold text-green-600 whitespace-nowrap">{TL(t.tutar)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{t.notlar||'—'}</td>
                      <td className="px-4 py-3"><button onClick={()=>deleteTahsilat(t.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                    </tr>
                  ))}
                  {!tahsilatlar.length&&<tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Henüz tahsilat kaydı yok.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            ARAÇLAR & YAKIT
        ════════════════════════════════════════════════════════ */}
        {tab === 'araclar' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-bold text-gray-900 flex-1">Araç Filosu</h2>
              <button onClick={()=>{setShowForm(p=>!p);setEditId('arac');}} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"><Plus className="w-4 h-4"/> Araç Ekle</button>
            </div>

            {showForm && editId==='arac' && (
              <form onSubmit={submitArac} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full font-bold text-gray-900">Yeni Araç</h3>
                {([['Plaka *','plaka','text','34 ABC 123'],['Marka','marka','text','Mercedes'],['Model','model','text','Actros'],['Yıl','yil','number','2020']] as [string,keyof typeof aracForm,string,string][]).map(([lbl,key,type,ph])=>(
                  <div key={key}><label className="block text-xs font-semibold text-gray-600 mb-1">{lbl}</label><input required={lbl.endsWith('*')} type={type} value={aracForm[key]} onChange={e=>setAracForm(p=>({...p,[key]:e.target.value}))} placeholder={ph} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                ))}
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Ruhsat Bitiş</label><input type="date" value={aracForm.ruhsatSon} onChange={e=>setAracForm(p=>({...p,ruhsatSon:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Sigorta Bitiş</label><input type="date" value={aracForm.sigortaSon} onChange={e=>setAracForm(p=>({...p,sigortaSon:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Muayene Bitiş</label><input type="date" value={aracForm.muayeneSon} onChange={e=>setAracForm(p=>({...p,muayeneSon:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Save className="w-4 h-4"/> Kaydet</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {araclar.map(a => {
                const aYakit = yakitlar.filter(y=>y.aracId===a.id);
                const toplamYakit = aYakit.reduce((s,y)=>s+y.toplamTutar,0);
                const hasExpiry = expiryStatus(a.ruhsatSon)==='expired'||expiryStatus(a.sigortaSon)==='expired'||expiryStatus(a.muayeneSon)==='expired';
                return (
                  <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${hasExpiry?'border-red-200':'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasExpiry?'bg-red-50':'bg-indigo-50'}`}>
                          <Car className={`w-5 h-5 ${hasExpiry?'text-red-500':'text-indigo-600'}`}/>
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg">{a.plaka}</p>
                          <p className="text-xs text-gray-400">{[a.marka,a.model,a.yil].filter(Boolean).join(' ')}</p>
                        </div>
                      </div>
                      <button onClick={()=>deleteArac(a.id)} className="text-gray-200 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <div className="flex flex-col gap-1.5 mb-4">
                      <ExpiryPill label="Ruhsat"  date={a.ruhsatSon}  />
                      <ExpiryPill label="Sigorta" date={a.sigortaSon} />
                      <ExpiryPill label="Muayene" date={a.muayeneSon} />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{TL(toplamYakit)}</p>
                        <p className="text-xs text-gray-400">{a._count?.yakitKayitlari??0} yakıt kaydı</p>
                      </div>
                      <button onClick={()=>{setYakitForm(p=>({...p,aracId:a.id}));setShowForm(true);setEditId('yakit');setSelArac(a.id);}}
                        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Fuel className="w-3.5 h-3.5"/> Yakıt Gir
                      </button>
                    </div>
                  </div>
                );
              })}
              {!araclar.length&&(
                <div className="col-span-full">
                  <EmptyState
                    icon={Truck}
                    title="Henüz araç yok"
                    description="Araç ekleyerek yakıt takibi ve sözleşme maliyeti analizine başlayın."
                    action={{ label: 'Araç Ekle', onClick: () => setShowForm(true) }}
                  />
                </div>
              )}
            </div>

            {/* Yakıt girişi formu */}
            {showForm && editId==='yakit' && (
              <form onSubmit={submitYakit} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-full flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Yakıt Kaydı — {araclar.find(a=>a.id===yakitForm.aracId)?.plaka}</h3>
                  <button type="button" onClick={()=>setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Araç *</label>
                  <select required value={yakitForm.aracId} onChange={e=>setYakitForm(p=>({...p,aracId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">— Seç —</option>{araclar.map(a=><option key={a.id} value={a.id}>{a.plaka}</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tarih *</label><input required type="date" value={yakitForm.tarih} onChange={e=>setYakitForm(p=>({...p,tarih:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Litre *</label><input required type="number" min="0" step="0.01" value={yakitForm.litre} onChange={e=>setYakitForm(p=>({...p,litre:e.target.value}))} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Birim Fiyat (₺/L) *</label><input required type="number" min="0" step="0.001" value={yakitForm.birimFiyat} onChange={e=>setYakitForm(p=>({...p,birimFiyat:e.target.value}))} placeholder="0.000" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">KM Sayacı</label><input type="number" min="0" value={yakitForm.kmSayaci} onChange={e=>setYakitForm(p=>({...p,kmSayaci:e.target.value}))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">İstasyon</label><input value={yakitForm.istasyon} onChange={e=>setYakitForm(p=>({...p,istasyon:e.target.value}))} placeholder="Shell, BP…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                {yakitForm.litre&&yakitForm.birimFiyat&&(
                  <div className="sm:col-span-2 flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-2 text-sm font-bold text-indigo-700">
                    <Fuel className="w-4 h-4"/> Toplam: {TL(Number(yakitForm.litre)*Number(yakitForm.birimFiyat))}
                  </div>
                )}
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Save className="w-4 h-4"/> Kaydet</button>
                </div>
              </form>
            )}

            {/* Yakıt tablosu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                <Fuel className="w-4 h-4 text-gray-400"/>
                <h3 className="font-bold text-gray-900 text-sm">Yakıt Kayıtları</h3>
                <select value={selArac} onChange={e=>setSelArac(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ml-auto">
                  <option value="">Tüm Araçlar</option>{araclar.map(a=><option key={a.id} value={a.id}>{a.plaka}</option>)}
                </select>
              </div>
              {yakitlar.length > 0 && (
                <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex gap-6 text-sm">
                  <span className="font-bold text-indigo-800">{yakitlar.reduce((s,y)=>s+y.litre,0).toFixed(1)} L toplam</span>
                  <span className="font-bold text-indigo-800">{TL(yakitlar.reduce((s,y)=>s+y.toplamTutar,0))} toplam</span>
                  <span className="text-indigo-600">{(yakitlar.reduce((s,y)=>s+y.toplamTutar,0)/yakitlar.reduce((s,y)=>s+y.litre,0)||0).toFixed(2)} ₺/L ort.</span>
                </div>
              )}
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">{['Tarih','Araç','Litre','₺/L','Toplam','KM','İstasyon',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {yakitlar.map(y=>(
                    <tr key={y.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(y.tarih)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800">{y.arac?.plaka??'—'}</td>
                      <td className="px-4 py-3 text-gray-700">{y.litre.toFixed(1)} L</td>
                      <td className="px-4 py-3 text-gray-500">{y.birimFiyat.toFixed(3)} ₺</td>
                      <td className="px-4 py-3 font-semibold text-red-500 whitespace-nowrap">{TL(y.toplamTutar)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{y.kmSayaci>0?`${y.kmSayaci.toLocaleString('tr-TR')} km`:'—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{y.istasyon||'—'}</td>
                      <td className="px-4 py-3"><button onClick={()=>deleteYakit(y.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                    </tr>
                  ))}
                  {!yakitlar.length&&<tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Henüz yakıt kaydı yok.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            FATURALAR
        ════════════════════════════════════════════════════════ */}
        {tab === 'faturalar' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Toplam Fatura" value={TL(faturalar.reduce((s,f)=>s+f.genelToplam,0))} color="blue" icon={FileText} sub={`${faturalar.length} adet`}/>
              <StatCard label="Ödenen" value={TL(faturalar.filter(f=>f.durum==='odendi').reduce((s,f)=>s+f.genelToplam,0))} color="green" icon={CheckCircle2}/>
              <StatCard label="Bekleyen" value={TL(faturalar.filter(f=>f.durum==='beklemede').reduce((s,f)=>s+f.genelToplam,0))} color="amber" icon={Clock} sub={`${faturalar.filter(f=>f.durum==='beklemede').length} açık`}/>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Fatura no veya müşteri ara…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <button onClick={()=>setShowForm(p=>!p)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"><Plus className="w-4 h-4"/> Yeni Fatura</button>
            </div>

            {showForm && (
              <form onSubmit={submitFatura} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Yeni Fatura</h3>
                  <button type="button" onClick={()=>setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Müşteri</label>
                    <select value={faturaForm.musteriId} onChange={e=>setFaturaForm(p=>({...p,musteriId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">— Seç —</option>{musteriler.map(m=><option key={m.id} value={m.id}>{m.ad}</option>)}
                    </select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">İlgili Sefer</label>
                    <select value={faturaForm.seferId} onChange={e=>setFaturaForm(p=>({...p,seferId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">— Seç —</option>{seferler.map(s=><option key={s.id} value={s.id}>{s.rotaDan}→{s.rotaAya} ({s.aracPlaka})</option>)}
                    </select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Fatura Tarihi *</label><input required type="date" value={faturaForm.tarih} onChange={e=>setFaturaForm(p=>({...p,tarih:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Vade Tarihi</label><input type="date" value={faturaForm.vadeTarih} onChange={e=>setFaturaForm(p=>({...p,vadeTarih:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                </div>

                {/* Satır kalemleri */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Fatura Kalemleri</label>
                    <button type="button" onClick={addFaturaSatiri} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"><Plus className="w-3.5 h-3.5"/> Satır Ekle</button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 border-b border-gray-100">
                        {['Açıklama','Miktar','Birim Fiyat (₺)','KDV (%)','Toplam',''].map(h=><th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-400 whitespace-nowrap">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {faturaSatirlari.map((s,i)=>(
                          <tr key={i} className="border-b border-gray-50">
                            <td className="px-3 py-2"><input value={s.aciklama} onChange={e=>updateSatir(i,'aciklama',e.target.value)} placeholder="Hizmet/Ürün açıklaması" className="w-full min-w-[180px] px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></td>
                            <td className="px-3 py-2"><input type="number" min="1" value={s.miktar} onChange={e=>updateSatir(i,'miktar',e.target.value)} className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></td>
                            <td className="px-3 py-2"><input type="number" min="0" step="0.01" value={s.birimFiyat} onChange={e=>updateSatir(i,'birimFiyat',e.target.value)} className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></td>
                            <td className="px-3 py-2">
                              <select value={s.kdvOrani} onChange={e=>updateSatir(i,'kdvOrani',e.target.value)} className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {KDV_ORANLARI.map(k=><option key={k} value={k}>%{k}</option>)}
                              </select></td>
                            <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{TL(s.miktar*s.birimFiyat*(1+s.kdvOrani/100))}</td>
                            <td className="px-3 py-2"><button type="button" onClick={()=>removeFaturaSatiri(i)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-6 mt-3 pr-3 text-sm">
                    <span className="text-gray-500">Ara: <strong>{TL(faturaAraToplam)}</strong></span>
                    <span className="text-gray-500">KDV: <strong>{TL(faturaKdvToplam)}</strong></span>
                    <span className="text-gray-900 font-black">Toplam: {TL(faturaAraToplam+faturaKdvToplam)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Notlar</label><input value={faturaForm.notlar} onChange={e=>setFaturaForm(p=>({...p,notlar:e.target.value}))} placeholder="Opsiyonel not…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Durum</label>
                    <select value={faturaForm.durum} onChange={e=>setFaturaForm(p=>({...p,durum:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="beklemede">Beklemede</option><option value="odendi">Ödendi</option><option value="iptal">İptal</option>
                    </select></div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"><Save className="w-4 h-4"/> Fatura Oluştur</button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">{['Fatura No','Tarih','Vade','Müşteri','Sefer','Tutar','KDV','Toplam','Durum',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {faturalar.filter(f=>!search||f.faturaNo.toLowerCase().includes(search.toLowerCase())||(f.musteri?.ad??'').toLowerCase().includes(search.toLowerCase())).map(f=>(
                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{f.faturaNo}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(f.tarih)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{f.vadeTarih?fmtDate(f.vadeTarih):'—'}</td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">{f.musteri?.ad??'—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{f.sefer?`${f.sefer.rotaDan}→${f.sefer.rotaAya}`:'—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{TL(f.araToplam)}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{TL(f.kdvToplam)}</td>
                      <td className="px-4 py-3 font-black text-gray-900 whitespace-nowrap">{TL(f.genelToplam)}</td>
                      <td className="px-4 py-3">
                        <select value={f.durum} onChange={e=>updateFaturaDurum(f.id,e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="beklemede">Beklemede</option><option value="odendi">Ödendi</option><option value="iptal">İptal</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={()=>printFatura(f)} title="Yazdır / PDF" className="text-gray-400 hover:text-blue-600 transition-colors"><Printer className="w-4 h-4"/></button>
                          <button onClick={()=>deleteFatura(f.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!faturalar.length&&(
                    <tr><td colSpan={10}>
                      <EmptyState icon={FileText} title="Henüz fatura yok" description="Müşterilerinize fatura keserek alacak takibine başlayın." action={{ label: 'Fatura Oluştur', onClick: () => setShowForm(true) }} />
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            PERSONEL & PUANTAJ & BORDRO
        ════════════════════════════════════════════════════════ */}
        {tab === 'personel' && (
          <>
            {/* Personel listesi */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-gray-900">Personel</h2>
              <button onClick={()=>{setShowForm(p=>!p);setEditId(null);}} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"><Plus className="w-4 h-4"/> Yeni Personel</button>
            </div>

            {showForm && editId===null && (
              <form onSubmit={submitPersonel} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full font-bold text-gray-900">Yeni Personel</h3>
                {([['Ad Soyad *','ad','text','Ahmet Yılmaz'],['Unvan / Pozisyon','unvan','text','TIR Şoförü'],['Telefon','telefon','text','+90 5xx xxx xx xx'],['TC Kimlik No','tcNo','text','12345678901'],['Maaş (₺ / ay)','maas','number','0'],['İşe Başlangıç *','baslangicTarihi','date','']] as [string,keyof typeof personelForm,string,string][]).map(([lbl,key,type,ph])=>(
                  <div key={key}><label className="block text-xs font-semibold text-gray-600 mb-1">{lbl}</label><input required={lbl.endsWith('*')} type={type} value={personelForm[key]} onChange={e=>setPersonelForm(p=>({...p,[key]:e.target.value}))} placeholder={ph} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                ))}
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 rounded-xl">İptal</button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Save className="w-4 h-4"/> Kaydet</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personeller.map(p => (
                <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${!p.aktif?'opacity-60':'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.aktif?'bg-indigo-50':'bg-gray-100'}`}>
                        <Users className={`w-5 h-5 ${p.aktif?'text-indigo-600':'text-gray-400'}`}/>
                      </div>
                      <div><p className="font-bold text-gray-900">{p.ad}</p><p className="text-xs text-gray-400">{p.unvan||'Pozisyon belirtilmemiş'}</p></div>
                    </div>
                    <button onClick={()=>deletePersonel(p.id)} className="text-gray-200 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="space-y-1 mb-3 text-xs text-gray-500">
                    {p.telefon&&<p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5"/>{p.telefon}</p>}
                    <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5"/>{fmtDate(p.baslangicTarihi)}&apos;dan beri</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-2 flex-wrap">
                    <div><p className="text-base font-black text-gray-900">{TL(p.maas)}</p><p className="text-xs text-gray-400">/ay brüt</p></div>
                    <div className="flex gap-2">
                      <button onClick={()=>{setSelPersonel(p.id);setEditId(p.id);setShowForm(true);setPuantajForm(prev=>({...prev,personelId:p.id}));}}
                        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors">
                        <ClipboardList className="w-3.5 h-3.5"/> Puantaj
                      </button>
                      <button onClick={()=>hesaplaBordro(p.id)}
                        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 font-semibold border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Calculator className="w-3.5 h-3.5"/> Bordro
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!personeller.length&&(
                <div className="col-span-full">
                  <EmptyState
                    icon={Users}
                    title="Henüz personel yok"
                    description="Çalışanlarınızı ekleyerek puantaj ve bordro hesaplamasına başlayın."
                    action={{ label: 'Personel Ekle', onClick: () => setShowForm(true) }}
                  />
                </div>
              )}
            </div>

            {/* Puantaj girişi */}
            {showForm && editId !== null && (
              <form onSubmit={submitPuantaj} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-full flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Puantaj Girişi — {personeller.find(p=>p.id===editId)?.ad}</h3>
                  <button type="button" onClick={()=>{setShowForm(false);setEditId(null);}} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tarih *</label><input required type="date" value={puantajForm.tarih} onChange={e=>setPuantajForm(p=>({...p,tarih:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giriş Saati</label><input type="time" value={puantajForm.girisSaati} onChange={e=>setPuantajForm(p=>({...p,girisSaati:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Çıkış Saati</label><input type="time" value={puantajForm.cikisSaati} onChange={e=>setPuantajForm(p=>({...p,cikisSaati:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Fazla Mesai (saat)</label><input type="number" min="0" step="0.5" value={puantajForm.fazlaMesai} onChange={e=>setPuantajForm(p=>({...p,fazlaMesai:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">İzin Türü</label>
                  <select value={puantajForm.izinTuru} onChange={e=>setPuantajForm(p=>({...p,izinTuru:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Çalışıldı</option><option value="yillik">Yıllık İzin</option><option value="hastalik">Hastalık İzni</option><option value="ucretsiz">Ücretsiz İzin</option><option value="resmi">Resmi Tatil</option>
                  </select></div>
                <div className="sm:col-span-2 lg:col-span-3"><label className="block text-xs font-semibold text-gray-600 mb-1">Not</label><input value={puantajForm.notlar} onChange={e=>setPuantajForm(p=>({...p,notlar:e.target.value}))} placeholder="Opsiyonel not…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div className="col-span-full flex gap-2 justify-end">
                  <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"><Save className="w-4 h-4"/> Kaydet</button>
                </div>
              </form>
            )}

            {/* Puantaj tablosu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                <CalendarDays className="w-4 h-4 text-gray-400"/><h3 className="font-bold text-gray-900 text-sm">Puantaj Tablosu</h3>
                <input type="month" value={puantajAy} onChange={e=>setPuantajAy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <select value={selPersonel} onChange={e=>setSelPersonel(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Tüm Personel</option>{personeller.map(p=><option key={p.id} value={p.id}>{p.ad}</option>)}
                </select>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">{['Personel','Tarih','Giriş','Çıkış','Fazla Mesai','Durum','Not',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {puantajlar.map(pt=>(
                    <tr key={pt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{pt.personel?.ad??'—'}{pt.personel?.unvan&&<span className="block text-xs text-gray-400 font-normal">{pt.personel.unvan}</span>}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(pt.tarih)}</td>
                      <td className="px-4 py-3 text-gray-700 font-mono">{pt.girisSaati??'—'}</td>
                      <td className="px-4 py-3 text-gray-700 font-mono">{pt.cikisSaati??'—'}</td>
                      <td className="px-4 py-3 text-center">{pt.fazlaMesai>0?<span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">+{pt.fazlaMesai}s</span>:<span className="text-xs text-gray-300">—</span>}</td>
                      <td className="px-4 py-3"><IzinBadge izin={pt.izinTuru}/></td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[120px] truncate">{pt.notlar||'—'}</td>
                      <td className="px-4 py-3"><button onClick={()=>deletePuantaj(pt.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                    </tr>
                  ))}
                  {!puantajlar.length&&<tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Bu ay için puantaj kaydı yok.</td></tr>}
                </tbody>
              </table>
              {puantajlar.length>0&&(
                <div className="px-5 py-3 border-t border-gray-50 flex gap-6 text-xs text-gray-500">
                  <span>{puantajlar.filter(p=>!p.izinTuru).length} çalışma günü</span>
                  <span className="text-amber-600">{puantajlar.filter(p=>p.izinTuru==='yillik').length} yıllık izin</span>
                  <span className="text-red-500">{puantajlar.filter(p=>p.izinTuru==='hastalik').length} hastalık</span>
                  <span className="text-amber-700">{puantajlar.reduce((s,p)=>s+p.fazlaMesai,0).toFixed(1)}s fazla mesai</span>
                </div>
              )}
            </div>

            {/* ── Bordro ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                <Calculator className="w-4 h-4 text-gray-400"/>
                <h3 className="font-bold text-gray-900 text-sm">Bordro Hesaplama</h3>
                <input type="month" value={bordroAy} onChange={e=>setBordroAy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                <span className="text-xs text-gray-400 ml-auto">2025 Türkiye SGK oranları · tahmini hesap</span>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['Personel','Brüt','Fazla Mesai','SGK İşçi','İşsizlik','Gel. Vergisi','Damga','NET MAAŞ','İşveren Toplam',''].map(h=><th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {personeller.map(p => {
                    const b = bordrolar.find(b=>b.personelId===p.id&&b.ay===bordroAy);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 font-semibold text-gray-900 whitespace-nowrap">{p.ad}<span className="block text-xs text-gray-400 font-normal">{p.unvan}</span></td>
                        {b ? (
                          <>
                            <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{TL(b.brutMaas)}</td>
                            <td className="px-3 py-3 text-amber-600 whitespace-nowrap">{b.fazlaMesaiUcret>0?TL(b.fazlaMesaiUcret):'—'}</td>
                            <td className="px-3 py-3 text-red-500 whitespace-nowrap">-{TL(b.sgkIsci)}</td>
                            <td className="px-3 py-3 text-red-400 whitespace-nowrap">-{TL(b.issizlikIsci)}</td>
                            <td className="px-3 py-3 text-red-500 whitespace-nowrap">-{TL(b.gelirVergisi)}</td>
                            <td className="px-3 py-3 text-red-300 whitespace-nowrap">-{TL(b.damgaVergisi)}</td>
                            <td className="px-3 py-3 font-black text-emerald-700 whitespace-nowrap text-base">{TL(b.netMaas)}</td>
                            <td className="px-3 py-3 text-purple-600 whitespace-nowrap">{TL(b.toplamMaliyet)}</td>
                          </>
                        ) : (
                          <td colSpan={8} className="px-3 py-3">
                            <button onClick={()=>hesaplaBordro(p.id)} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 font-semibold border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                              <Calculator className="w-3.5 h-3.5"/> {bordroAy} bordrosunu hesapla
                            </button>
                          </td>
                        )}
                        <td className="px-3 py-3">
                          {b&&<button onClick={()=>hesaplaBordro(p.id)} title="Yeniden hesapla" className="text-gray-300 hover:text-emerald-500 transition-colors"><Calculator className="w-4 h-4"/></button>}
                        </td>
                      </tr>
                    );
                  })}
                  {!personeller.length&&(
                    <tr><td colSpan={10}>
                      <EmptyState icon={Users} title="Henüz personel yok" description="Çalışanlarınızı ekleyerek bordro ve puantaj hesaplamasına başlayın." action={{ label: 'Personel Ekle', onClick: () => setShowForm(true) }} />
                    </td></tr>
                  )}
                </tbody>
              </table>
              {bordrolar.filter(b=>b.ay===bordroAy).length>0&&(
                <div className="px-5 py-3 border-t border-gray-50 flex gap-6 text-xs font-semibold">
                  <span className="text-gray-500">Toplam Brüt: <span className="text-gray-900">{TL(bordrolar.filter(b=>b.ay===bordroAy).reduce((s,b)=>s+b.brutMaas+b.fazlaMesaiUcret,0))}</span></span>
                  <span className="text-emerald-600">Toplam Net: {TL(bordrolar.filter(b=>b.ay===bordroAy).reduce((s,b)=>s+b.netMaas,0))}</span>
                  <span className="text-purple-600">Toplam Maliyet: {TL(bordrolar.filter(b=>b.ay===bordroAy).reduce((s,b)=>s+b.toplamMaliyet,0))}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            RAPORLAR
        ════════════════════════════════════════════════════════ */}
        {tab === 'raporlar' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-bold text-gray-900 flex-1">Raporlar</h2>
              <div className="flex gap-2">
                {(['seferler','araclar','musteriler'] as const).map(t => (
                  <button key={t} onClick={()=>setRaporTip(t)}
                    className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${raporTip===t?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {t==='seferler'?'Sefer K/Z':t==='araclar'?'Araç K/Z':'Müşteri Ciro'}
                  </button>
                ))}
              </div>
              <input type="month" value={raporDonem} onChange={e=>setRaporDonem(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              {raporDonem && <button onClick={()=>setRaporDonem('')} className="text-xs text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>}
            </div>

            {/* Sefer K/Z */}
            {raporTip === 'seferler' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {raporYuklendi && seferRapor.length > 0 && (
                  <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 grid grid-cols-4 gap-4 text-xs font-semibold text-blue-800">
                    <span>Toplam Sefer: {seferRapor.length}</span>
                    <span className="text-green-700">Toplam Gelir: {TL(seferRapor.reduce((s,r)=>s+r.toplamGelir,0))}</span>
                    <span className="text-red-600">Toplam Gider: {TL(seferRapor.reduce((s,r)=>s+r.toplamGider,0))}</span>
                    <span className={seferRapor.reduce((s,r)=>s+r.netKar,0)>=0?'text-emerald-700':'text-red-700'}>
                      Net K/Z: {TL(seferRapor.reduce((s,r)=>s+r.netKar,0))}
                    </span>
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">{['Rota','Araç','Tarih','Müşteri','Ücret','Yakıt','Net K/Z','Durum'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {seferRapor.map(r=>(
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{r.rotaDan} → {r.rotaAya}</td>
                        <td className="px-4 py-3 font-mono text-gray-600 text-xs">{r.aracPlaka}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(r.tarih)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.musteriAd??'—'}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold whitespace-nowrap">{TL(r.seferUcreti)}</td>
                        <td className="px-4 py-3 text-red-500 whitespace-nowrap">{TL(r.yakitMaliyeti)}</td>
                        <td className={`px-4 py-3 font-black whitespace-nowrap ${r.netKar>=0?'text-emerald-600':'text-red-600'}`}>{TL(r.netKar)}</td>
                        <td className="px-4 py-3"><DurumBadge durum={r.durum}/></td>
                      </tr>
                    ))}
                    {!seferRapor.length&&raporYuklendi&&<tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Bu dönemde sefer yok.</td></tr>}
                    {!raporYuklendi&&<tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">Yükleniyor…</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* Araç K/Z */}
            {raporTip === 'araclar' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">{['Plaka','Marka/Model','Sefer','KM','Sefer Geliri','Yakıt Gideri','Net K/Z','km Maliyeti'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {aracRapor.map(r=>(
                      <tr key={r.plaka} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-black text-gray-900">{r.plaka}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{[r.marka,r.model].filter(Boolean).join(' ')||'—'}</td>
                        <td className="px-4 py-3 text-gray-700">{r.seferSayisi}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.kmTopla.toLocaleString('tr-TR')} km</td>
                        <td className="px-4 py-3 text-green-600 font-semibold whitespace-nowrap">{TL(r.seferGelir)}</td>
                        <td className="px-4 py-3 text-red-500 whitespace-nowrap">{TL(r.yakitTutar)}</td>
                        <td className={`px-4 py-3 font-black whitespace-nowrap ${r.netKar>=0?'text-emerald-600':'text-red-600'}`}>{TL(r.netKar)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.kmBasiMaliyet>0?`${r.kmBasiMaliyet.toFixed(2)} ₺/km`:'—'}</td>
                      </tr>
                    ))}
                    {!aracRapor.length&&raporYuklendi&&<tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Bu dönemde araç verisi yok.</td></tr>}
                    {!raporYuklendi&&<tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">Yükleniyor…</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* Müşteri Ciro */}
            {raporTip === 'musteriler' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">{['Müşteri','Sefer','Fatura','Top. Fatura','Tahsilat','Tahsilat %','Bekleyen','Bakiye'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {musteriRapor.map(r=>(
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.ad}</td>
                        <td className="px-4 py-3 text-gray-600">{r.seferSayisi}</td>
                        <td className="px-4 py-3 text-gray-600">{r.faturaSayisi}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap">{TL(r.toplamFatura)}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold whitespace-nowrap">{TL(r.toplamTahsilat)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[40px]">
                              <div className={`h-1.5 rounded-full ${r.tahsilatOrani>=100?'bg-green-500':r.tahsilatOrani>=50?'bg-amber-400':'bg-red-400'}`} style={{width:`${Math.min(100,r.tahsilatOrani).toFixed(0)}%`}}/>
                            </div>
                            <span className="text-xs font-semibold text-gray-600">{r.tahsilatOrani.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 font-semibold whitespace-nowrap ${r.bekleyenFatura>0?'text-amber-600':'text-gray-400'}`}>{r.bekleyenFatura>0?TL(r.bekleyenFatura):'—'}</td>
                        <td className={`px-4 py-3 font-black whitespace-nowrap ${r.bakiye>0?'text-amber-600':r.bakiye<0?'text-green-600':'text-gray-400'}`}>{TL(r.bakiye)}</td>
                      </tr>
                    ))}
                    {!musteriRapor.length&&raporYuklendi&&<tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Müşteri verisi yok.</td></tr>}
                    {!raporYuklendi&&<tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">Yükleniyor…</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            DÖNEM YÖNETİMİ
        ════════════════════════════════════════════════════════ */}
        {tab === 'donem' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-bold text-gray-900 flex-1">Dönem Yönetimi</h2>
              <button onClick={()=>donemOlustur(thisMonth())}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4"/> Bu Ayı Ekle
              </button>
            </div>

            {/* Çift kayıt açıklama kutusu */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-blue-800 mb-1">Dönem Kilitleme Hakkında</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Bir dönemi kapattığınızda o aya ait mali işlemler dondurulur ve denetim güvenliği sağlanır.
                Kapalı bir dönem ancak yeniden açılarak değiştirilebilir.
                <strong> Çift taraflı muhasebe özeti</strong>: Her dönemin toplam gelir/gider dengesi aşağıda gösterilir.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Dönem olmayan ayları otomatik göster */}
              {(()=>{
                const aylar: string[] = [];
                const simdi = new Date();
                for (let i = 0; i < 12; i++) {
                  const d = new Date(simdi.getFullYear(), simdi.getMonth() - i, 1);
                  aylar.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
                }
                return aylar.map(ay => {
                  const donem = donemler.find(d => d.ay === ay);
                  const ayIslemler = islemler.filter(i => i.tarih.startsWith(ay));
                  const gelir = ayIslemler.filter(i=>i.tur==='gelir').reduce((s,i)=>s+i.tutar,0);
                  const gider = ayIslemler.filter(i=>i.tur==='gider').reduce((s,i)=>s+i.tutar,0);
                  const kapali = donem?.durum === 'kapali';
                  return (
                    <div key={ay} className={`bg-white rounded-2xl border shadow-sm p-5 ${kapali?'border-gray-300 opacity-80':'border-gray-100'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-black text-gray-900 text-lg">{ay}</p>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${kapali?'bg-gray-100 text-gray-500':'bg-green-50 text-green-700'}`}>
                            {kapali?'🔒 Kapalı':'🟢 Açık'}
                          </span>
                        </div>
                        {donem && (
                          <div className="flex gap-1">
                            {kapali
                              ? <button onClick={()=>donemAc(donem.id)} className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded-lg">Aç</button>
                              : <button onClick={()=>donemKapat(donem.id)} className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-2 py-1 rounded-lg">Kapat</button>
                            }
                            {!kapali && <button onClick={()=>donemSil(donem.id)} className="text-gray-200 hover:text-red-500 p-1"><Trash2 className="w-4 h-4"/></button>}
                          </div>
                        )}
                        {!donem && (
                          <button onClick={()=>donemOlustur(ay)} className="text-xs text-blue-600 border border-blue-100 px-2 py-1 rounded-lg hover:border-blue-300">Oluştur</button>
                        )}
                      </div>
                      {/* Dönem özeti — basitleştirilmiş çift taraflı */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50">
                        <div><p className="text-xs text-gray-400">Gelir</p><p className="text-sm font-bold text-green-600">{TL(gelir)}</p></div>
                        <div><p className="text-xs text-gray-400">Gider</p><p className="text-sm font-bold text-red-500">{TL(gider)}</p></div>
                        <div><p className="text-xs text-gray-400">Net</p><p className={`text-sm font-black ${gelir-gider>=0?'text-emerald-600':'text-red-600'}`}>{TL(gelir-gider)}</p></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bilanço özeti (çift taraflı muhasebe basit formu) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-blue-600"/> Basitleştirilmiş Bilanço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AKTİF */}
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">AKTİFLER (Ne var?)</p>
                  <div className="space-y-2">
                    {[
                      { ad: 'Nakit / Tahsilatlar', tutar: tahsilatlar.reduce((s,t)=>s+t.tutar,0), renk: 'text-green-700' },
                      { ad: 'Müşteri Alacakları', tutar: faturalar.filter(f=>f.durum!=='odendi').reduce((s,f)=>s+f.genelToplam,0), renk: 'text-amber-600' },
                      { ad: 'Toplam Gelirler', tutar: islemler.filter(i=>i.tur==='gelir').reduce((s,i)=>s+i.tutar,0), renk: 'text-blue-700' },
                    ].map(r=>(
                      <div key={r.ad} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                        <span className="text-sm text-gray-600">{r.ad}</span>
                        <span className={`text-sm font-bold ${r.renk}`}>{TL(r.tutar)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* PASİF */}
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">PASİFLER + ÖZKAYNAKLAR (Ne gitti?)</p>
                  <div className="space-y-2">
                    {[
                      { ad: 'Toplam Giderler', tutar: islemler.filter(i=>i.tur==='gider').reduce((s,i)=>s+i.tutar,0), renk: 'text-red-600' },
                      { ad: 'Personel Maliyeti', tutar: bordrolar.reduce((s,b)=>s+b.toplamMaliyet,0), renk: 'text-purple-600' },
                      { ad: 'Net Kar / Zarar', tutar: islemler.filter(i=>i.tur==='gelir').reduce((s,i)=>s+i.tutar,0) - islemler.filter(i=>i.tur==='gider').reduce((s,i)=>s+i.tutar,0), renk: 'text-emerald-700 font-black' },
                    ].map(r=>(
                      <div key={r.ad} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                        <span className="text-sm text-gray-600">{r.ad}</span>
                        <span className={`text-sm font-bold ${r.renk}`}>{TL(r.tutar)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
