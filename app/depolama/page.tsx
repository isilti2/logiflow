'use client';

import { useState, useRef, useId, useEffect, lazy, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import {
  Package, Plus, Search, Trash2,
  MapPin, Box, X, Building2, FileSpreadsheet,
  AlertCircle, Pencil, Check, Download, ArrowRightLeft,
  BarChart2, Weight, Boxes,
} from 'lucide-react';

const DepotViewer3D = lazy(() => import('@/components/3d/DepotViewer3D'));

/* ─── Types ─────────────────────────────────────────────── */
interface Area {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

type StatusKey = 'depolarda' | 'çıkışta' | 'beklemede';

interface CargoItem {
  id: string;
  areaId: string;
  name: string;
  type: string;
  weight: number;
  dimensions: string;
  date: string;
  status: StatusKey;
  shelf?: string;
  row?: number;
  col?: number;
}

const EXCEL_MOCK: Omit<CargoItem, 'id' | 'areaId'>[] = [
  { name: 'Excel Kargo 1', type: 'Elektronik', weight: 5.5, dimensions: '30×20×15', date: '2026-03-20', status: 'depolarda' },
  { name: 'Excel Kargo 2', type: 'Tekstil', weight: 12.0, dimensions: '50×40×30', date: '2026-03-20', status: 'beklemede' },
  { name: 'Excel Kargo 3', type: 'Mobilya', weight: 35.0, dimensions: '100×60×40', date: '2026-03-20', status: 'depolarda' },
];

const STATUS_STYLE: Record<StatusKey, string> = {
  depolarda: 'bg-blue-50 text-blue-800 border border-blue-100',
  çıkışta: 'bg-orange-50 text-orange-700 border border-orange-100',
  beklemede: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const CARGO_TYPES = ['Elektronik', 'Mobilya', 'Tekstil', 'Sanayi', 'Kimyasal', 'Gıda', 'Diğer'];

/* ─── Sub-components ─────────────────────────────────────── */
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; }
function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function DepolamaPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [cargo, setCargo] = useState<CargoItem[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load from API on mount
  useEffect(() => {
    async function load() {
      const [areasRes, cargoRes] = await Promise.all([
        fetch('/api/depot-areas'),
        fetch('/api/cargo'),
      ]);
      const areasData: Area[] = areasRes.ok ? await areasRes.json() : [];
      const cargoData: CargoItem[] = cargoRes.ok ? await cargoRes.json() : [];
      setAreas(areasData);
      setCargo(cargoData);
      // Honor area selection from global search
      const sel = localStorage.getItem('lf_depo_area_select');
      if (sel) {
        setSelectedAreaId(sel);
        localStorage.removeItem('lf_depo_area_select');
      } else if (areasData.length > 0) {
        setSelectedAreaId(areasData[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  const [show3D, setShow3D] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusKey | 'tümü'>('tümü');

  const [showAddCargo, setShowAddCargo] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [importBanner, setImportBanner] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CargoItem | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  useId();

  // Derived
  const selectedArea = areas.find((a) => a.id === selectedAreaId);
  const areaCargo = cargo.filter((c) => c.areaId === selectedAreaId);
  const filteredCargo = areaCargo.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'tümü' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCargo = cargo.length;
  const totalWeight = cargo.reduce((s, c) => s + c.weight, 0);
  const fillRate = selectedArea ? Math.round((areaCargo.length / Math.max(selectedArea.capacity, 1)) * 100) : 0;

  // Reset selection when area or filter changes
  useEffect(() => { setSelectedIds(new Set()); }, [selectedAreaId, statusFilter, search]);

  const allVisibleSelected = filteredCargo.length > 0 && filteredCargo.every((c) => selectedIds.has(c.id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCargo.map((c) => c.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => fetch(`/api/cargo/${id}`, { method: 'DELETE' })));
    setCargo((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
  }

  async function handleBulkStatus(status: StatusKey) {
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => fetch(`/api/cargo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })));
    setCargo((prev) => prev.map((c) => selectedIds.has(c.id) ? { ...c, status } : c));
    setSelectedIds(new Set());
  }

  function startEdit(item: CargoItem) {
    setEditId(item.id);
    setEditDraft({ ...item });
  }

  function cancelEdit() {
    setEditId(null);
    setEditDraft(null);
  }

  async function saveEdit() {
    if (!editDraft) return;
    await fetch(`/api/cargo/${editDraft.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editDraft),
    });
    setCargo((prev) => prev.map((c) => c.id === editDraft.id ? editDraft : c));
    setEditId(null);
    setEditDraft(null);
  }

  function startTransfer(item: CargoItem) {
    setTransferId(item.id);
    const otherArea = areas.find((a) => a.id !== item.areaId);
    setTransferTarget(otherArea?.id ?? '');
  }

  async function confirmTransfer() {
    if (!transferId || !transferTarget) return;
    await fetch(`/api/cargo/${transferId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areaId: transferTarget, shelf: null, row: null, col: null }),
    });
    setCargo((prev) => prev.map((c) => c.id === transferId ? { ...c, areaId: transferTarget, shelf: undefined, row: undefined, col: undefined } : c));
    setTransferId(null);
    setTransferTarget('');
  }

  // Type distribution for selected area
  const typeStats = (() => {
    const map = new Map<string, { count: number; weight: number }>();
    areaCargo.forEach((c) => {
      const entry = map.get(c.type) ?? { count: 0, weight: 0 };
      map.set(c.type, { count: entry.count + 1, weight: entry.weight + c.weight });
    });
    const total = areaCargo.length || 1;
    return Array.from(map.entries())
      .map(([type, { count, weight }]) => ({ type, count, weight, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  })();

  function handleCSVExport() {
    if (!selectedArea) return;
    const headers = ['Ad', 'Tip', 'Ağırlık (kg)', 'Boyutlar', 'Raf', 'Sıra', 'Sütun', 'Tarih', 'Durum'];
    const rows = filteredCargo.map((c) => [
      c.name, c.type, c.weight.toFixed(1), c.dimensions,
      c.shelf ?? '', c.row ?? '', c.col ?? '', c.date, c.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedArea.name.replace(/\s+/g, '_')}_kargo_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteCargo(id: string) {
    await fetch(`/api/cargo/${id}`, { method: 'DELETE' });
    setCargo((prev) => prev.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
  }

  async function handleAddCargo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const shelfVal = (fd.get('shelf') as string)?.trim().toUpperCase() || undefined;
    const rowVal   = parseInt(fd.get('row') as string) || undefined;
    const colVal   = parseInt(fd.get('col') as string) || undefined;
    const body = {
      areaId: selectedAreaId,
      name: fd.get('name') as string,
      type: fd.get('type') as string,
      weight: parseFloat(fd.get('weight') as string) || 0,
      dimensions: `${fd.get('w')}×${fd.get('h')}×${fd.get('d')}`,
      date: fd.get('date') as string || new Date().toISOString().slice(0, 10),
      status: fd.get('status') as StatusKey,
      shelf: shelfVal,
      row: rowVal,
      col: colVal,
    };
    const res = await fetch('/api/cargo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const item = await res.json();
      setCargo((prev) => [...prev, item]);
    }
    setShowAddCargo(false);
  }

  async function handleAddArea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/depot-areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name') as string,
        location: fd.get('location') as string,
        capacity: parseInt(fd.get('capacity') as string) || 50,
      }),
    });
    if (res.ok) {
      const area = await res.json();
      setAreas((prev) => [...prev, area]);
      setSelectedAreaId(area.id);
    }
    setShowAddArea(false);
  }

  async function handleExcelImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const results = await Promise.all(
      EXCEL_MOCK.map((m) =>
        fetch('/api/cargo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...m, areaId: selectedAreaId }),
        }).then((r) => r.ok ? r.json() : null)
      )
    );
    const newItems = results.filter(Boolean) as CargoItem[];
    setCargo((prev) => [...prev, ...newItems]);
    setImportBanner(`"${file.name}" dosyasından ${newItems.length} kargo başarıyla içe aktarıldı.`);
    setTimeout(() => setImportBanner(''), 4000);
    e.target.value = '';
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard><div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-black text-gray-900">
            Yönetme &amp; <span className="text-blue-600">Depolama</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Alanlarınızı ve kargo stoğunuzu merkezi olarak yönetin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Building2 className="w-5 h-5" />} label="Toplam Alan" value={areas.length} sub="tanımlı depo alanı" />
          <StatCard icon={<Package className="w-5 h-5" />} label="Toplam Kargo" value={totalCargo} sub={`${totalWeight.toFixed(1)} kg stok`} />
          <StatCard
            icon={<Box className="w-5 h-5" />}
            label="Seçili Alan Doluluk"
            value={`%${fillRate}`}
            sub={selectedArea ? `${areaCargo.length} / ${selectedArea.capacity} kapasite` : '—'}
          />
        </div>

        {/* Type distribution */}
        {typeStats.length > 0 && selectedArea && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">Kargo Tipi Dağılımı</h2>
              <span className="text-xs text-gray-400 ml-1">— {selectedArea.name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
              {typeStats.map(({ type, count, weight, pct }, i) => {
                const HUE = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-400', 'bg-pink-500', 'bg-sky-400', 'bg-orange-400'];
                const bar = HUE[i % HUE.length];
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{type}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <Package className="w-3 h-3" />{count}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Weight className="w-3 h-3" />{weight.toFixed(0)} kg
                        </span>
                        <span className="font-semibold text-gray-600 w-8 text-right">%{pct}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Import success banner */}
        {importBanner && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 text-blue-800 text-sm px-4 py-3 rounded-xl">
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
            {importBanner}
          </div>
        )}

        {/* Empty state */}
        {areas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Building2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Henüz depo alanı yok.</p>
            <button
              onClick={() => setShowAddArea(true)}
              className="mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Alan Ekle
            </button>
          </div>
        ) : (
          /* Main layout: sidebar + table */
          <div className="flex gap-6 items-start">

            {/* Sidebar — areas */}
            <aside className="w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alanlar</span>
                <button
                  onClick={() => setShowAddArea(true)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Yeni alan ekle"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="py-2">
                {areas.map((area) => {
                  const count = cargo.filter((c) => c.areaId === area.id).length;
                  const active = area.id === selectedAreaId;
                  const capPct = Math.min(100, Math.round((count / Math.max(area.capacity, 1)) * 100));
                  const capColor = capPct >= 90 ? 'bg-red-400' : capPct >= 70 ? 'bg-amber-400' : 'bg-blue-500';
                  return (
                    <li key={area.id}>
                      <button
                        onClick={() => setSelectedAreaId(area.id)}
                        className={`w-full flex flex-col gap-2 px-4 py-3 text-left transition-colors ${
                          active ? 'bg-blue-50 text-blue-800' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{area.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{area.location}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                            {count}/{area.capacity}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${capColor}`} style={{ width: `${capPct}%` }} />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Kargo ara…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusKey | 'tümü')}
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-700"
                >
                  <option value="tümü">Tüm Durumlar</option>
                  <option value="depolarda">Depolarda</option>
                  <option value="çıkışta">Çıkışta</option>
                  <option value="beklemede">Beklemede</option>
                </select>

                {/* Excel import */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleExcelImport}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel İçe Aktar
                </button>

                {/* CSV Export */}
                <button
                  onClick={handleCSVExport}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                  title="Kargo listesini CSV olarak indir"
                >
                  <Download className="w-4 h-4" />
                  CSV İndir
                </button>

                {/* 3D toggle */}
                <button
                  onClick={() => setShow3D((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors border ${
                    show3D
                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-700'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  3D Görünüm
                </button>

                {/* Add cargo */}
                <button
                  onClick={() => setShowAddCargo(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Kargo Ekle
                </button>
              </div>

              {/* Bulk action bar */}
              {someSelected && (
                <div className="flex flex-wrap items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-semibold text-blue-700">
                    {selectedIds.size} seçili
                  </span>
                  <div className="h-4 w-px bg-blue-200" />
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-white border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Seçilenleri Sil
                  </button>
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) handleBulkStatus(e.target.value as StatusKey); e.target.value = ''; }}
                    className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="" disabled>Durum Değiştir</option>
                    <option value="depolarda">Depolarda</option>
                    <option value="beklemede">Beklemede</option>
                    <option value="çıkışta">Çıkışta</option>
                  </select>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Seçimi Temizle
                  </button>
                </div>
              )}

              {/* 3D Depot View */}
              {show3D && selectedArea && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
                    <Boxes className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-gray-900">3D Depo Doluluk Görünümü</h2>
                    <span className="text-xs text-gray-400 ml-1">— {selectedArea.name}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {areaCargo.length}/{selectedArea.capacity} slot dolu · fareyle döndür, kaydır
                    </span>
                  </div>
                  <ErrorBoundary>
                    <Suspense fallback={
                      <div className="flex items-center justify-center" style={{ height: 380, background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)' }}>
                        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    }>
                      <DepotViewer3D
                        capacity={selectedArea.capacity}
                        cargo={areaCargo}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              )}

              {/* Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredCargo.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <AlertCircle className="w-8 h-8 mb-3" />
                    <p className="text-sm font-medium">Bu alanda kargo bulunamadı.</p>
                    <p className="text-xs mt-1">Yeni kargo eklemek için &quot;Kargo Ekle&quot; butonunu kullanın.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="pl-5 py-3 w-8">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              aria-label="Tümünü seç"
                            />
                          </th>
                          {['Kargo Adı', 'Tip', 'Ağırlık (kg)', 'Boyutlar (cm)', 'Konum', 'Tarih', 'Durum', ''].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredCargo.map((item) => {
                          const isEditing = editId === item.id && editDraft;
                          return (
                            <tr key={item.id} className={`hover:bg-gray-50 transition-colors group ${selectedIds.has(item.id) ? 'bg-blue-50/50' : ''} ${isEditing ? 'bg-blue-50/30' : ''}`}>
                              <td className="pl-5 py-3.5 w-8">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(item.id)}
                                  onChange={() => toggleSelect(item.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  aria-label={`${item.name} seç`}
                                />
                              </td>

                              {/* Name */}
                              <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    value={editDraft.name}
                                    onChange={(e) => setEditDraft((d) => d && ({ ...d, name: e.target.value }))}
                                    className="w-full px-2 py-1 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : (
                                  <span className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    {item.name}
                                  </span>
                                )}
                              </td>

                              {/* Type */}
                              <td className="px-5 py-3 text-gray-600">
                                {isEditing ? (
                                  <select
                                    value={editDraft.type}
                                    onChange={(e) => setEditDraft((d) => d && ({ ...d, type: e.target.value }))}
                                    className="px-2 py-1 border border-blue-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    {CARGO_TYPES.map((t) => <option key={t}>{t}</option>)}
                                  </select>
                                ) : item.type}
                              </td>

                              {/* Weight */}
                              <td className="px-5 py-3 text-gray-600">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={editDraft.weight}
                                    onChange={(e) => setEditDraft((d) => d && ({ ...d, weight: parseFloat(e.target.value) || 0 }))}
                                    className="w-20 px-2 py-1 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : item.weight.toFixed(1)}
                              </td>

                              {/* Dimensions */}
                              <td className="px-5 py-3 text-gray-500 font-mono text-xs">{item.dimensions}</td>

                              {/* Location */}
                              <td className="px-5 py-3">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      value={editDraft.shelf ?? ''}
                                      onChange={(e) => setEditDraft((d) => d && ({ ...d, shelf: e.target.value.toUpperCase() || undefined }))}
                                      placeholder="Raf"
                                      maxLength={3}
                                      className="w-12 px-2 py-1 border border-blue-300 rounded-lg text-xs uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                      type="number"
                                      min="1"
                                      value={editDraft.row ?? ''}
                                      onChange={(e) => setEditDraft((d) => d && ({ ...d, row: parseInt(e.target.value) || undefined }))}
                                      placeholder="Sıra"
                                      className="w-12 px-2 py-1 border border-blue-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                      type="number"
                                      min="1"
                                      value={editDraft.col ?? ''}
                                      onChange={(e) => setEditDraft((d) => d && ({ ...d, col: parseInt(e.target.value) || undefined }))}
                                      placeholder="Sütun"
                                      className="w-14 px-2 py-1 border border-blue-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                ) : item.shelf ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-mono">
                                    <MapPin className="w-3 h-3 text-blue-400" />
                                    {item.shelf}{item.row ? `-${item.row}` : ''}{item.col ? `-${item.col}` : ''}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-300">—</span>
                                )}
                              </td>

                              {/* Date */}
                              <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{item.date}</td>

                              {/* Status */}
                              <td className="px-5 py-3">
                                {isEditing ? (
                                  <select
                                    value={editDraft.status}
                                    onChange={(e) => setEditDraft((d) => d && ({ ...d, status: e.target.value as StatusKey }))}
                                    className="px-2 py-1 border border-blue-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="depolarda">Depolarda</option>
                                    <option value="beklemede">Beklemede</option>
                                    <option value="çıkışta">Çıkışta</option>
                                  </select>
                                ) : (
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[item.status]}`}>
                                    {item.status}
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-3">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={saveEdit}
                                      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      Kaydet
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      İptal
                                    </button>
                                  </div>
                                ) : confirmDeleteId === item.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteCargo(item.id)}
                                      className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors"
                                    >Sil</button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    >İptal</button>
                                  </div>
                                ) : transferId === item.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <select
                                      value={transferTarget}
                                      onChange={(e) => setTransferTarget(e.target.value)}
                                      className="text-xs border border-blue-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      {areas.filter((a) => a.id !== item.areaId).map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={confirmTransfer}
                                      disabled={!transferTarget}
                                      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      Taşı
                                    </button>
                                    <button
                                      onClick={() => setTransferId(null)}
                                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    >İptal</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                      onClick={() => startEdit(item)}
                                      className="text-gray-300 hover:text-blue-500 transition-colors"
                                      aria-label={`${item.name} düzenle`}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    {areas.length > 1 && (
                                      <button
                                        onClick={() => startTransfer(item)}
                                        className="text-gray-300 hover:text-violet-500 transition-colors"
                                        aria-label={`${item.name} transfer et`}
                                      >
                                        <ArrowRightLeft className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setConfirmDeleteId(item.id)}
                                      className="text-gray-300 hover:text-red-400 transition-colors"
                                      aria-label={`${item.name} sil`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer info */}
              <p className="text-xs text-gray-400 px-1">
                {filteredCargo.length} kargo gösteriliyor
                {statusFilter !== 'tümü' && ` · Filtre: ${statusFilter}`}
                {search && ` · Arama: "${search}"`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Add Cargo ── */}
      {showAddCargo && selectedArea && (
        <Modal title={`Kargo Ekle — ${selectedArea.name}`} onClose={() => setShowAddCargo(false)}>
          <form onSubmit={handleAddCargo} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kargo Adı *</label>
              <input
                name="name"
                required
                placeholder="örn. Elektronik Paket A"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tip *</label>
                <select
                  name="type"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="" disabled>Seçin</option>
                  {CARGO_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ağırlık (kg) *</label>
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="0.0"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Boyutlar (cm) — G × Y × D</label>
              <div className="grid grid-cols-3 gap-2">
                {(['w', 'h', 'd'] as const).map((k, i) => (
                  <input
                    key={k}
                    name={k}
                    type="number"
                    min="0"
                    placeholder={['Genişlik', 'Yükseklik', 'Derinlik'][i]}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tarih</label>
                <input
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durum *</label>
                <select
                  name="status"
                  required
                  defaultValue="depolarda"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="depolarda">Depolarda</option>
                  <option value="beklemede">Beklemede</option>
                  <option value="çıkışta">Çıkışta</option>
                </select>
              </div>
            </div>
            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Depo Konumu (isteğe bağlı)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Raf</label>
                  <input
                    name="shelf"
                    maxLength={3}
                    placeholder="A"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Sıra</label>
                  <input
                    name="row"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Sütun</label>
                  <input
                    name="col"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Örn: Raf B, Sıra 3, Sütun 2 → B-3-2</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddCargo(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Ekle
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Add Area ── */}
      {showAddArea && (
        <Modal title="Yeni Alan Tanımla" onClose={() => setShowAddArea(false)}>
          <form onSubmit={handleAddArea} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alan Adı *</label>
              <input
                name="name"
                required
                placeholder="örn. Bursa Depo"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Konum</label>
              <input
                name="location"
                placeholder="örn. Osmangazi, Bursa"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kapasite (adet)</label>
              <input
                name="capacity"
                type="number"
                min="1"
                defaultValue={50}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddArea(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Oluştur
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div></AuthGuard>
  );
}
