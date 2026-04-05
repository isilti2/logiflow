'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';
import {
  Package, Box, BarChart3, CheckCircle2, ChevronRight,
  Plus, Trash2, Zap, AlertTriangle, Printer, RotateCcw, Lightbulb,
  Pencil, Maximize2, Minimize2,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { addNotification } from '@/lib/notifications';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

/* ─── Template types ─────────────────────────────────────── */
interface OptTemplate {
  id: string;
  name: string;
  items: CargoItem[];
  savedAt: string;
}

const CargoViewer3D = dynamic(() => import('@/components/3d/CargoViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center" style={{ minHeight: '400px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)', borderRadius: '1rem' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-blue-400 text-xs font-semibold">3D Görünüm Yükleniyor…</span>
      </div>
    </div>
  ),
});

/* ─── Types ─────────────────────────────────────────────── */
type LoadPriority = 'first-out' | 'any' | 'last-out';

interface CargoItem {
  id: number;
  name: string;
  width: number;
  height: number;
  depth: number;
  qty: number;
  weight: number; // kg per unit
  canRotate: boolean;
  stackable: boolean;   // false = nothing goes on top
  fragile: boolean;     // true = placed last (on top)
  priority: LoadPriority; // first-out = near door, last-out = back
}

interface ContainerDims {
  width: number;
  height: number;
  depth: number;
  maxWeight: number;
}

interface PlacedBox {
  uid: string;
  cargoId: number;
  name: string;
  x: number; y: number; z: number; // bottom-left-front (cm)
  w: number; h: number; d: number; // final placed dims
  colorIdx: number;
  instance: number;
}

interface PackResult {
  placed: PlacedBox[];
  unplacedItems: CargoItem[];
  usedVolume: number;
  totalWeight: number;
  frontWeight: number;   // ön yarı ağırlığı (z < depth/2)
  rearWeight: number;    // arka yarı ağırlığı
  leftWeight: number;    // sol yarı ağırlığı (x < width/2)
  rightWeight: number;   // sağ yarı ağırlığı
}

/* ─── Constants ──────────────────────────────────────────── */
const PRESETS = [
  { label: 'Özel',           width: 240, height: 240, depth:  600, maxWeight: 20000 },
  { label: '20ft Konteyner', width: 234, height: 239, depth:  590, maxWeight: 21700 },
  { label: '40ft Konteyner', width: 234, height: 239, depth: 1203, maxWeight: 26680 },
  { label: 'TIR / Kamyon',   width: 245, height: 270, depth: 1360, maxWeight: 24000 },
  { label: 'Küçük Van',      width: 180, height: 180, depth:  350, maxWeight:   800 },
];

const COLORS = [
  { bg: '#60a5fa', dark: '#1d4ed8', mid: '#bfdbfe', light: '#dbeafe' },
  { bg: '#34d399', dark: '#047857', mid: '#a7f3d0', light: '#d1fae5' },
  { bg: '#c084fc', dark: '#7e22ce', mid: '#e9d5ff', light: '#f3e8ff' },
  { bg: '#fb923c', dark: '#c2410c', mid: '#fed7aa', light: '#ffedd5' },
  { bg: '#f472b6', dark: '#be185d', mid: '#fbcfe8', light: '#fce7f3' },
  { bg: '#fbbf24', dark: '#b45309', mid: '#fde68a', light: '#fef3c7' },
];

let nextId = 4;

const DEFAULT_CONTAINER: ContainerDims = { width: 240, height: 240, depth: 600, maxWeight: 20000 };

const DEFAULT_CARGO: CargoItem[] = [
  { id: 1, name: 'Koli A',   width: 40,  height: 30, depth: 20, qty: 5, weight: 3.5,  canRotate: true,  stackable: true,  fragile: false, priority: 'any'       },
  { id: 2, name: 'Koli B',   width: 60,  height: 50, depth: 40, qty: 3, weight: 8.0,  canRotate: true,  stackable: true,  fragile: false, priority: 'any'       },
  { id: 3, name: 'Palet C',  width: 120, height: 80, depth: 15, qty: 2, weight: 25.0, canRotate: false, stackable: false, fragile: false, priority: 'last-out'  },
];

/* ─── Packing Algorithm ──────────────────────────────────── */
function getRotations(w: number, h: number, d: number, canRotate: boolean) {
  if (!canRotate) return [{ w, h, d }];
  // 6 permutations of (w, h, d) — keep height ≤ original h as first option
  return [
    { w, h, d },
    { w: d, h, d: w },
    { w: w, h: d, d: h },
    { w: h, h: w, d },
    { w: h, h: d, d: w },
    { w: d, h: h, d: w },
  ];
}

function packBoxes(items: CargoItem[], container: ContainerDims): PackResult {
  // Expand items into individual units
  const units: {
    cargoId: number; name: string; w: number; h: number; d: number;
    colorIdx: number; weight: number; canRotate: boolean; origIdx: number;
    stackable: boolean; fragile: boolean; priority: LoadPriority;
  }[] = [];
  items.forEach((item, idx) => {
    for (let i = 0; i < item.qty; i++) {
      units.push({
        cargoId: item.id,
        name: item.name,
        w: item.width, h: item.height, d: item.depth,
        colorIdx: idx, weight: item.weight, canRotate: item.canRotate, origIdx: idx,
        stackable: item.stackable, fragile: item.fragile, priority: item.priority,
      });
    }
  });

  // Sort: önce öncelik grubu, sonra ağırlık dengesi
  units.sort((a, b) => {
    const pOrder = { 'first-out': 0, 'any': 1, 'last-out': 2 };
    const pa = pOrder[a.priority], pb = pOrder[b.priority];
    if (pa !== pb) return pa - pb;
    const aTop = (a.fragile || !a.stackable) ? 1 : 0;
    const bTop = (b.fragile || !b.stackable) ? 1 : 0;
    if (aTop !== bTop) return aTop - bTop;
    return (b.w * b.h * b.d) - (a.w * a.h * a.d);
  });

  // ── Uluslararası TIR standardı: ağırlık bölge dağılımı ──────────────
  // "any" öncelikli, normal (istifleme OK, kırılgan değil) kalemleri
  // 3 bölgeye (ön/orta/arka) eşit dağıt — ağır kalemler bölgelere döngüsel atanır
  // Böylece her bölgede benzer toplam ağırlık olur (AB Direktifi 96/53/EC).
  {
    const anyNormal = units.filter(u => u.priority === 'any' && u.stackable && !u.fragile);
    const rest      = units.filter(u => !(u.priority === 'any' && u.stackable && !u.fragile));

    if (anyNormal.length > 3) {
      // Ağırlığa göre sırala (en ağır → en hafif)
      anyNormal.sort((a, b) => b.weight - a.weight);

      // 3 bölgeye döngüsel ata: 0=ön, 1=orta, 2=arka
      const zones: typeof anyNormal[] = [[], [], []];
      anyNormal.forEach((u, i) => zones[i % 3].push(u));

      // Sıra: firstOut → ön bölge → orta bölge → arka bölge → özel(fragile/non-stack) → lastOut
      const firstOut = rest.filter(u => u.priority === 'first-out');
      const special  = rest.filter(u => u.priority === 'any');
      const lastOut  = rest.filter(u => u.priority === 'last-out');

      units.length = 0;
      units.push(...firstOut, ...zones[0], ...zones[1], ...zones[2], ...special, ...lastOut);
    }
  }

  const placed: PlacedBox[] = [];
  const failedIds = new Set<number>();
  let totalWeight = 0;
  let usedVolume = 0;

  // Shelf-based layer packing
  // Each "shelf" occupies a z-range. Within a shelf, "rows" occupy a y-range.
  // Within a row, boxes are placed along x.
  let shelfZ = 0;
  let shelfD = 0; // max depth of current shelf
  let rowY = 0;
  let rowH = 0;   // max height of current row
  let rowX = 0;

  const instanceCount: Record<number, number> = {};

  for (const unit of units) {
    const rotations = getRotations(unit.w, unit.h, unit.d, unit.canRotate);
    let placed_this = false;

    // Try current position in current row
    for (const rot of rotations) {
      if (
        rowX + rot.w <= container.width &&
        rowY + rot.h <= container.height &&
        shelfZ + rot.d <= container.depth &&
        totalWeight + unit.weight <= container.maxWeight
      ) {
        instanceCount[unit.cargoId] = (instanceCount[unit.cargoId] || 0) + 1;
        placed.push({
          uid: `${unit.cargoId}_${placed.length}`,
          cargoId: unit.cargoId,
          name: unit.name,
          x: rowX, y: rowY, z: shelfZ,
          w: rot.w, h: rot.h, d: rot.d,
          colorIdx: unit.colorIdx,
          instance: instanceCount[unit.cargoId],
        });
        rowX += rot.w;
        rowH = Math.max(rowH, rot.h);
        // Non-stackable/fragile: fill remaining height so nothing can stack on top
        if (!unit.stackable || unit.fragile) rowH = container.height - rowY;
        shelfD = Math.max(shelfD, rot.d);
        totalWeight += unit.weight;
        usedVolume += rot.w * rot.h * rot.d;
        placed_this = true;
        break;
      }
    }
    if (placed_this) continue;

    // Try next row in same shelf
    const newRowY = rowY + rowH;
    for (const rot of rotations) {
      if (
        rot.w <= container.width &&
        newRowY + rot.h <= container.height &&
        shelfZ + rot.d <= container.depth &&
        totalWeight + unit.weight <= container.maxWeight
      ) {
        rowY = newRowY;
        rowH = 0;
        rowX = 0;
        instanceCount[unit.cargoId] = (instanceCount[unit.cargoId] || 0) + 1;
        placed.push({
          uid: `${unit.cargoId}_${placed.length}`,
          cargoId: unit.cargoId,
          name: unit.name,
          x: rowX, y: rowY, z: shelfZ,
          w: rot.w, h: rot.h, d: rot.d,
          colorIdx: unit.colorIdx,
          instance: instanceCount[unit.cargoId],
        });
        rowX += rot.w;
        rowH = Math.max(rowH, rot.h);
        if (!unit.stackable || unit.fragile) rowH = container.height - rowY;
        shelfD = Math.max(shelfD, rot.d);
        totalWeight += unit.weight;
        usedVolume += rot.w * rot.h * rot.d;
        placed_this = true;
        break;
      }
    }
    if (placed_this) continue;

    // Try new shelf
    const newShelfZ = shelfZ + (shelfD || 1);
    for (const rot of rotations) {
      if (
        rot.w <= container.width &&
        rot.h <= container.height &&
        newShelfZ + rot.d <= container.depth &&
        totalWeight + unit.weight <= container.maxWeight
      ) {
        shelfZ = newShelfZ;
        shelfD = 0;
        rowY = 0;
        rowH = 0;
        rowX = 0;
        instanceCount[unit.cargoId] = (instanceCount[unit.cargoId] || 0) + 1;
        placed.push({
          uid: `${unit.cargoId}_${placed.length}`,
          cargoId: unit.cargoId,
          name: unit.name,
          x: rowX, y: rowY, z: shelfZ,
          w: rot.w, h: rot.h, d: rot.d,
          colorIdx: unit.colorIdx,
          instance: instanceCount[unit.cargoId],
        });
        rowX += rot.w;
        rowH = Math.max(rowH, rot.h);
        if (!unit.stackable || unit.fragile) rowH = container.height - rowY;
        shelfD = Math.max(shelfD, rot.d);
        totalWeight += unit.weight;
        usedVolume += rot.w * rot.h * rot.d;
        placed_this = true;
        break;
      }
    }
    if (!placed_this) {
      failedIds.add(unit.cargoId);
    }
  }

  const unplacedItems = items.filter((item) => failedIds.has(item.id));

  // ── Ağırlık dağılımı hesapla ─────────────────────────────────────────
  const halfZ = container.depth  / 2;
  const halfX = container.width  / 2;
  let frontWeight = 0, rearWeight = 0, leftWeight = 0, rightWeight = 0;

  for (const p of placed) {
    const unit = items.find(i => i.id === p.cargoId);
    const w    = unit?.weight ?? 0;
    const cz   = p.z + p.d / 2;
    const cx   = p.x + p.w / 2;
    if (cz < halfZ) frontWeight += w; else rearWeight += w;
    if (cx < halfX) leftWeight  += w; else rightWeight += w;
  }

  return { placed, unplacedItems, usedVolume, totalWeight, frontWeight, rearWeight, leftWeight, rightWeight };
}


interface OptRecord {
  id?: string;
  date: string;
  containerLabel: string;
  fillPct: number;
  itemCount: number;
  placedCount: number;
  payload?: { items: CargoItem[]; container: ContainerDims };
}

/* ─── Page ───────────────────────────────────────────────── */
export default function KargoOptimizasyonPage() {
  const [container, setContainer]     = useState<ContainerDims>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONTAINER;
    try {
      const saved = localStorage.getItem('lf_last_container');
      if (saved) return { ...DEFAULT_CONTAINER, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return DEFAULT_CONTAINER;
  });
  const [cargoItems, setCargoItems]   = useState<CargoItem[]>(DEFAULT_CARGO);
  const [showResult, setShowResult]   = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult]           = useState<PackResult | null>(null);
  const [activeTab, setActiveTab]     = useState<'3d' | 'table'>('3d');
  const [optHistory, setOptHistory]   = useState<OptRecord[]>([]);
  const [newItem, setNewItem]         = useState<Omit<CargoItem,'id'>>({
    name: '', width: 40, height: 30, depth: 20, qty: 1, weight: 5,
    canRotate: true, stackable: true, fragile: false, priority: 'any',
  });
  const [editId, setEditId]           = useState<number | null>(null);
  const [editDraft, setEditDraft]     = useState<CargoItem | null>(null);
  const [result2, setResult2]         = useState<PackResult | null>(null);
  const [activeContainer, setActiveContainer] = useState<1 | 2>(1);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates]     = useState<OptTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [fullscreen3D, setFullscreen3D] = useState(false);

  useEffect(() => {
    fetch('/api/opt-templates')
      .then((r) => r.ok ? r.json() : [])
      .then(setTemplates);
    fetch('/api/optimizations')
      .then((r) => r.ok ? r.json() : [])
      .then(setOptHistory);
  }, []);

  const totalVolume = container.width * container.height * container.depth;
  const fillPct     = result ? Math.min(Math.round((result.usedVolume / totalVolume) * 100), 100) : 0;
  const weightPct   = result ? Math.min(Math.round((result.totalWeight / container.maxWeight) * 100), 100) : 0;

  function applyPreset(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = PRESETS[parseInt(e.target.value)];
    setContainer(p);
    localStorage.setItem('lf_last_container', JSON.stringify(p));
    setShowResult(false);
    setResult(null);
  }

  function handleContainerChange(field: keyof ContainerDims, val: string) {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) {
      setContainer((prev) => {
        const next = { ...prev, [field]: n };
        localStorage.setItem('lf_last_container', JSON.stringify(next));
        return next;
      });
      setShowResult(false);
      setResult(null);
    }
  }

  function handleAddItem() {
    if (!newItem.name.trim()) return;
    setCargoItems((prev) => [...prev, { id: nextId++, ...newItem }]);
    setNewItem({ name: '', width: 40, height: 30, depth: 20, qty: 1, weight: 5, canRotate: true, stackable: true, fragile: false, priority: 'any' });
    setShowResult(false);
    setResult(null);
    toast(`"${newItem.name}" eklendi`, 'success');
  }

  function handleRemoveItem(id: number) {
    setCargoItems((prev) => prev.filter((c) => c.id !== id));
    setShowResult(false);
    setResult(null);
  }

  function handleOptimize() {
    setIsOptimizing(true);
    setResult2(null);
    setActiveContainer(1);
    setTimeout(() => {
      const res = packBoxes(cargoItems, container);
      setResult(res);
      setIsOptimizing(false);
      setShowResult(true);
      const fill2 = Math.min(Math.round((res.usedVolume / (container.width * container.height * container.depth)) * 100), 100);
      toast(`Optimizasyon tamamlandı — %${fill2} doluluk`, res.unplacedItems.length > 0 ? 'info' : 'success');
      // Persist to history
      const totalVol = container.width * container.height * container.depth;
      const fill = Math.min(Math.round((res.usedVolume / totalVol) * 100), 100);
      const preset = PRESETS.find((p) => p.width === container.width && p.depth === container.depth);
      const record: OptRecord = {
        date: new Date().toLocaleString('tr-TR'),
        containerLabel: preset?.label ?? 'Özel',
        fillPct: fill,
        itemCount: cargoItems.reduce((s, i) => s + i.qty, 0),
        placedCount: res.placed.length,
        payload: { items: cargoItems, container },
      };
      fetch('/api/optimizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      }).then((r) => r.ok ? r.json() : null).then((saved) => {
        const entry = saved ?? { ...record, id: Math.random().toString(36) };
        setOptHistory((prev) => [entry, ...prev].slice(0, 50));
      });
      // Fire notification
      const unplacedCount = res.unplacedItems.reduce((s, i) => s + i.qty, 0);
      addNotification({
        type: unplacedCount > 0 ? 'info' : 'success',
        title: `Optimizasyon tamamlandı — %${fill} doluluk`,
        message: unplacedCount > 0
          ? `${record.containerLabel}: ${res.placed.length} yerleşti, ${unplacedCount} kalem sığmadı.`
          : `${record.containerLabel}: ${res.placed.length} kalem başarıyla yerleştirildi.`,
      });
    }, 800);
  }

  function handleReset() {
    setCargoItems(DEFAULT_CARGO);
    setContainer(DEFAULT_CONTAINER);
    setShowResult(false);
    setResult(null);
    setResult2(null);
    setEditId(null);
  }

  function handleEditStart(item: CargoItem) {
    setEditId(item.id);
    setEditDraft({ ...item });
  }

  function handleEditSave() {
    if (!editDraft) return;
    setCargoItems((prev) => prev.map((c) => c.id === editDraft.id ? editDraft : c));
    setEditId(null);
    setEditDraft(null);
    setShowResult(false); setResult(null); setResult2(null);
  }

  function handleEditCancel() { setEditId(null); setEditDraft(null); }

  function handleRestoreOpt(rec: OptRecord) {
    if (!rec.payload) { toast('Bu çalışmada kaydedilmiş yük verisi yok.', 'info'); return; }
    const { items, container: savedContainer } = rec.payload;
    nextId = Math.max(...items.map((i) => i.id), 0) + 1;
    setCargoItems(items);
    setContainer(savedContainer);
    setResult(null);
    setResult2(null);
    setShowResult(false);
    toast(`"${rec.containerLabel}" geri yüklendi — ${items.length} tip, ${items.reduce((s,i)=>s+i.qty,0)} birim`, 'success');
    setTimeout(() => document.getElementById('optimizer')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  function handleSecondContainer() {
    if (!result || result.unplacedItems.length === 0) return;
    const res2 = packBoxes(result.unplacedItems, container);
    setResult2(res2);
    setActiveContainer(2);
  }

  async function handleSaveTemplate() {
    if (!templateName.trim() || cargoItems.length === 0) return;
    const res = await fetch('/api/opt-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: templateName.trim(), items: cargoItems }),
    });
    if (res.ok) {
      const t = await res.json();
      setTemplates((prev) => [t, ...prev].slice(0, 20));
      setTemplateName('');
      toast(`"${t.name}" şablonu kaydedildi`, 'success');
    }
  }

  function handleLoadTemplate(t: OptTemplate) {
    nextId = Math.max(...t.items.map((i) => i.id)) + 1;
    setCargoItems(t.items);
    setShowResult(false); setResult(null); setResult2(null);
    setShowTemplates(false);
    toast(`"${t.name}" şablonu yüklendi — ${t.items.length} kalem`, 'success');
  }

  async function handleDeleteTemplate(id: string) {
    await fetch(`/api/opt-templates/${id}`, { method: 'DELETE' });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleImportFromDepo() {
    try {
      const res = await fetch('/api/cargo');
      if (!res.ok) { toast('Depo verisi alınamadı', 'error'); return; }
      const depoCargo = await res.json() as { id: string; name: string; weight: number; dimensions: string }[];
      if (!depoCargo.length) { toast('Depoda kayıtlı kargo bulunamadı.', 'error'); return; }
      const imported: CargoItem[] = depoCargo.map((c) => {
        const parts = c.dimensions.replace(/[×x]/g, ' ').split(/\s+/).map(Number);
        const [w = 40, h = 30, d = 20] = parts;
        return { id: nextId++, name: c.name, width: w, height: h, depth: d, qty: 1, weight: c.weight, canRotate: true, stackable: true, fragile: false, priority: 'any' as LoadPriority };
      });
      setCargoItems((prev) => {
        const merged = [...prev];
        for (const imp of imported) {
          if (!merged.some((m) => m.name === imp.name)) merged.push(imp);
        }
        return merged;
      });
      setShowResult(false);
      setResult(null);
      toast(`${imported.length} kalem depodan aktarıldı`, 'success');
    } catch { toast('Depo verisi okunamadı', 'error'); }
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) { toast('CSV dosyası boş veya geçersiz.', 'error'); return; }
        // Detect header row: name,width,height,depth,qty,weight
        const header = lines[0].toLowerCase().replace(/\s/g, '');
        const hasHeader = header.includes('name') || header.includes('ad') || header.includes('isim');
        const dataLines = hasHeader ? lines.slice(1) : lines;
        const imported: CargoItem[] = [];
        for (const line of dataLines) {
          const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          const name   = cols[0];
          const width  = parseFloat(cols[1]);
          const height = parseFloat(cols[2]);
          const depth  = parseFloat(cols[3]);
          const qty    = parseInt(cols[4]) || 1;
          const weight = parseFloat(cols[5]) || 1;
          if (!name || isNaN(width) || isNaN(height) || isNaN(depth)) continue;
          imported.push({ id: nextId++, name, width, height, depth, qty, weight, canRotate: true, stackable: true, fragile: false, priority: 'any' });
        }
        if (imported.length === 0) { toast('Geçerli satır bulunamadı. Format: isim,en,boy,yükseklik,adet,ağırlık', 'error'); return; }
        setCargoItems((prev) => {
          const merged = [...prev];
          for (const imp of imported) {
            if (!merged.some((m) => m.name === imp.name)) merged.push(imp);
          }
          return merged;
        });
        setShowResult(false);
        setResult(null);
        toast(`${imported.length} kalem CSV'den aktarıldı`, 'success');
      } catch { toast('CSV okunamadı.', 'error'); }
    };
    reader.readAsText(file);
  }

  function handleExportCSV() {
    if (!result) return;
    const header = ['#', 'Ürün', 'X (cm)', 'Y (cm)', 'Z (cm)', 'G (cm)', 'Y (cm)', 'D (cm)'];
    const rows = result.placed.map((p, i) => [i + 1, p.name, p.x, p.y, p.z, p.w, p.h, p.d]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'logiflow-yerlestirme.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV indirildi', 'success');
  }

  // Group placed boxes by cargo name for summary
  const placedSummary = useMemo(() => {
    if (!result) return [];
    const map: Record<number, { name: string; count: number; colorIdx: number }> = {};
    for (const p of result.placed) {
      if (!map[p.cargoId]) map[p.cargoId] = { name: p.name, count: 0, colorIdx: p.colorIdx };
      map[p.cargoId].count++;
    }
    return Object.values(map);
  }, [result]);

  // Center of Gravity
  const cog = useMemo(() => {
    const boxes = result?.placed ?? [];
    if (boxes.length === 0) return null;
    let totalVol = 0, sx = 0, sy = 0, sz = 0;
    for (const b of boxes) {
      const v = b.w * b.h * b.d;
      sx += (b.x + b.w / 2) * v;
      sy += (b.y + b.h / 2) * v;
      sz += (b.z + b.d / 2) * v;
      totalVol += v;
    }
    if (totalVol === 0) return null;
    return { x: sx / totalVol, y: sy / totalVol, z: sz / totalVol };
  }, [result]);

  return (
    <AuthGuard><main className="min-h-screen bg-white">

      {/* ── Fullscreen 3D overlay ── */}
      {fullscreen3D && result && (() => {
        const fsPlaced = activeContainer === 1 ? result.placed : (result2?.placed ?? []);
        return (
          <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-900/80 border-b border-white/10 backdrop-blur-sm flex-wrap">
              <span className="text-white font-bold text-sm">3D Konteyner Görünümü</span>
              <span className="text-gray-500 text-xs">— {PRESETS.find((p) => p.width === container.width && p.depth === container.depth)?.label ?? 'Özel'}</span>
              <div className="flex flex-wrap gap-3 ml-2">
                {placedSummary.map((s) => {
                  const c = COLORS[s.colorIdx % COLORS.length];
                  return (
                    <span key={s.name} className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.bg }} />
                      {s.name} ×{s.count}
                    </span>
                  );
                })}
                {cog && activeContainer === 1 && (
                  <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Ağırlık Merkezi
                  </span>
                )}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="hidden sm:block text-xs text-gray-500">Sol tık: döndür · Scroll: zoom · Sağ tık: taşı</span>
                <button
                  onClick={() => setFullscreen3D(false)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Minimize2 className="w-3.5 h-3.5" /> Küçült
                </button>
              </div>
            </div>
            {/* Viewer */}
            <div className="flex-1">
              <ErrorBoundary>
                <CargoViewer3D
                  placed={fsPlaced}
                  container={container}
                  cog={activeContainer === 1 ? cog : null}
                />
              </ErrorBoundary>
            </div>
            {/* Stats footer */}
            <div className="flex items-center justify-center gap-8 px-5 py-2.5 bg-gray-900/60 border-t border-white/10 text-xs text-gray-400">
              <span>Doluluk: <strong className="text-white">{fillPct}%</strong></span>
              <span>Ağırlık: <strong className="text-white">{result.totalWeight.toFixed(1)} kg</strong> / {container.maxWeight} kg</span>
              <span>Paketlenen: <strong className="text-white">{fsPlaced.length}</strong> kutu</span>
              {result.unplacedItems.length > 0 && (
                <span className="text-orange-400">Sığmayan: {result.unplacedItems.length} tip</span>
              )}
            </div>
          </div>
        );
      })()}

      <Navbar />

      {/* Hero */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">Anasayfa</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-600 font-medium">Kargo Optimizasyon</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <div className="w-8 h-1 bg-blue-600 rounded" />
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                Kargo <span className="text-blue-600">Optimizasyon</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                Konteyner ve kamyon yüklemelerini saniyeler içinde hesaplayın. Gerçek 3D
                bin-packing algoritması ile her kutu için optimal (x, y, z) pozisyonu bulunur,
                doluluk maksimuma taşınır.
              </p>
              <div className="flex flex-col gap-3">
                {['Süper Hızlı Sonuçlar', 'Gerçek 3D Bin-Packing', 'LIFO/FIFO Yükleme Sırası', 'Kırılgan & İstifleme Kuralları'].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-gray-700 font-medium">{t}</span>
                  </div>
                ))}
              </div>
              <Link href="#optimizer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl transition-colors self-start">
                <Zap className="w-4 h-4" /> Optimizörü Dene
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="absolute -z-10 blur-3xl opacity-40 bg-blue-100 rounded-full w-64 h-64" />
              {[
                { icon: Package,  label: 'Analiz Edilen Kargo', value: '2.4M+', sub: 'yük birimi' },
                { icon: BarChart3, label: 'Ort. Doluluk Oranı',  value: '%91',   sub: 'konteyner verimliliği' },
                { icon: Zap,      label: 'Hesaplama Süresi',    value: '<1s',   sub: 'gerçek zamanlı sonuç' },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-2xl font-black text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Optimizer */}
      <section id="optimizer" className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                Kargo <span className="text-blue-600">Optimizörü</span>
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Konteyner seçin, kargo ekleyin, optimize edin.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 border border-gray-200 rounded-xl px-3 py-2 bg-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Sıfırla
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            {/* LEFT: Inputs */}
            <div className="flex flex-col gap-5">

              {/* Preset selector */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <Box className="w-4 h-4 text-blue-600" /> Konteyner Önayarı
                </h3>
                <select
                  onChange={applyPreset}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                >
                  {PRESETS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
                </select>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([
                    { field: 'depth',     label: 'Uzunluk (cm)' },
                    { field: 'width',     label: 'Genişlik (cm)' },
                    { field: 'height',    label: 'Yükseklik (cm)' },
                    { field: 'maxWeight', label: 'Maks. Ağırlık (kg)' },
                  ] as { field: keyof ContainerDims; label: string }[]).map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
                      <input
                        type="number" min={1}
                        value={container[field]}
                        onChange={(e) => handleContainerChange(field, e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Cargo list */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-blue-600" /> Kargo Kalemleri
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTemplates((v) => !v)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${showTemplates ? 'bg-amber-50 text-amber-700 border-amber-200' : 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100'}`}
                      title="Şablonları göster/gizle"
                    >
                      <Printer className="w-3.5 h-3.5" /> Şablonlar {templates.length > 0 && <span className="bg-amber-200 text-amber-800 text-[10px] rounded-full px-1.5">{templates.length}</span>}
                    </button>
                    <button
                      onClick={handleImportFromDepo}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      title="Depolamadaki kargo kalemlerini buraya aktar"
                    >
                      <Box className="w-3.5 h-3.5" /> Depodan Aktar
                    </button>
                  </div>
                </div>

                {/* Template panel */}
                {showTemplates && (
                  <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-amber-800">Kargo Şablonları</p>

                    {/* Save current */}
                    <div className="flex gap-2">
                      <input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
                        placeholder="Şablon adı…"
                        className="flex-1 px-3 py-1.5 text-xs border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        onClick={handleSaveTemplate}
                        disabled={!templateName.trim() || cargoItems.length === 0}
                        className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Kaydet
                      </button>
                    </div>

                    {/* Saved templates */}
                    {templates.length === 0 ? (
                      <p className="text-xs text-amber-600 opacity-60">Henüz kayıtlı şablon yok.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {templates.map((t) => (
                          <div key={t.id} className="flex items-center gap-2 bg-white border border-amber-100 rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">{t.name}</p>
                              <p className="text-[10px] text-gray-400">{t.items.length} kalem · {t.savedAt}</p>
                            </div>
                            <button
                              onClick={() => handleLoadTemplate(t)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                            >
                              Yükle
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(t.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400">
                        <th className="text-left pb-2 pr-2 font-semibold">Ad</th>
                        <th className="text-left pb-2 pr-2 font-semibold">U×G×Y (cm)</th>
                        <th className="text-center pb-2 pr-2 font-semibold">Adet</th>
                        <th className="text-center pb-2 pr-2 font-semibold">Ağırlık</th>
                        <th className="text-center pb-2 pr-2 font-semibold">Rot.</th>
                        <th className="text-center pb-2 pr-2 font-semibold" title="İstifleme: Bu ürünün üstüne başka ürün konulabilir mi?">İstif.</th>
                        <th className="text-center pb-2 pr-2 font-semibold" title="Kırılgan ürün — üste yerleştirilir">Kır.</th>
                        <th className="text-center pb-2 pr-2 font-semibold" title="Çıkış önceliği: Önce Çıkar / Herhangi / Sonra Çıkar">Sıra</th>
                        <th className="w-12 pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {cargoItems.map((item, idx) => {
                        const c = COLORS[idx % COLORS.length];
                        const isEditing = editId === item.id;
                        const d = isEditing ? editDraft! : item;
                        return (
                          <tr key={item.id} className={`border-b border-gray-50 transition-colors ${isEditing ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                            <td className="py-1.5 pr-2">
                              {isEditing ? (
                                <input value={d.name} onChange={(e) => setEditDraft((p) => p ? { ...p, name: e.target.value } : p)}
                                  className="w-full border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: c.bg }} />
                                  <span className="font-medium text-gray-800">{item.name}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 pr-2">
                              {isEditing ? (
                                <div className="flex gap-1">
                                  {(['width','height','depth'] as const).map((f) => (
                                    <input key={f} type="number" min={1} value={(d as CargoItem)[f]}
                                      onChange={(e) => setEditDraft((p) => p ? { ...p, [f]: parseInt(e.target.value) || 1 } : p)}
                                      className="w-12 border border-blue-300 rounded-lg px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500 font-mono">{item.depth}×{item.width}×{item.height}</span>
                              )}
                            </td>
                            <td className="py-1.5 pr-2 text-center">
                              {isEditing ? (
                                <input type="number" min={1} value={d.qty}
                                  onChange={(e) => setEditDraft((p) => p ? { ...p, qty: parseInt(e.target.value) || 1 } : p)}
                                  className="w-12 border border-blue-300 rounded-lg px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-50 text-blue-800 font-bold rounded-md">{item.qty}</span>
                              )}
                            </td>
                            <td className="py-1.5 pr-2 text-center">
                              {isEditing ? (
                                <input type="number" min={0} step="0.1" value={d.weight}
                                  onChange={(e) => setEditDraft((p) => p ? { ...p, weight: parseFloat(e.target.value) || 0 } : p)}
                                  className="w-14 border border-blue-300 rounded-lg px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              ) : (
                                <span className="text-gray-600">{item.weight}</span>
                              )}
                            </td>
                            <td className="py-1.5 pr-2 text-center">
                              {isEditing ? (
                                <label className="flex items-center justify-center gap-1 cursor-pointer">
                                  <input type="checkbox" checked={d.canRotate}
                                    onChange={(e) => setEditDraft((p) => p ? { ...p, canRotate: e.target.checked } : p)}
                                    className="accent-blue-600 w-3 h-3" />
                                </label>
                              ) : (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.canRotate ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                  {item.canRotate ? 'Var' : 'Yok'}
                                </span>
                              )}
                            </td>
                            {/* stackable */}
                            <td className="py-1.5 pr-2 text-center">
                              {isEditing ? (
                                <label className="flex items-center justify-center cursor-pointer">
                                  <input type="checkbox" checked={d.stackable}
                                    onChange={(e) => setEditDraft((p) => p ? { ...p, stackable: e.target.checked } : p)}
                                    className="accent-blue-600 w-3 h-3" />
                                </label>
                              ) : (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.stackable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                  {item.stackable ? 'Evet' : 'Hayır'}
                                </span>
                              )}
                            </td>
                            {/* fragile */}
                            <td className="py-1.5 pr-2 text-center">
                              {isEditing ? (
                                <label className="flex items-center justify-center cursor-pointer">
                                  <input type="checkbox" checked={d.fragile}
                                    onChange={(e) => setEditDraft((p) => p ? { ...p, fragile: e.target.checked } : p)}
                                    className="accent-amber-600 w-3 h-3" />
                                </label>
                              ) : (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.fragile ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-300'}`}>
                                  {item.fragile ? 'Evet' : '—'}
                                </span>
                              )}
                            </td>
                            {/* priority */}
                            <td className="py-1.5 pr-2 text-center">
                              {isEditing ? (
                                <select value={d.priority}
                                  onChange={(e) => setEditDraft((p) => p ? { ...p, priority: e.target.value as LoadPriority } : p)}
                                  className="border border-blue-300 rounded-lg px-1 py-0.5 text-xs focus:outline-none">
                                  <option value="first-out">Önce</option>
                                  <option value="any">Herhangi</option>
                                  <option value="last-out">Sonra</option>
                                </select>
                              ) : (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                  item.priority === 'first-out' ? 'bg-blue-50 text-blue-700' :
                                  item.priority === 'last-out'  ? 'bg-purple-50 text-purple-600' :
                                  'bg-gray-50 text-gray-400'
                                }`}>
                                  {item.priority === 'first-out' ? 'Önce' : item.priority === 'last-out' ? 'Sonra' : '—'}
                                </span>
                              )}
                            </td>
                            <td className="py-1.5">
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <button onClick={handleEditSave} className="text-green-500 hover:text-green-600 transition-colors" title="Kaydet">
                                    <Plus className="w-3.5 h-3.5 rotate-45" />
                                  </button>
                                  <button onClick={handleEditCancel} className="text-gray-300 hover:text-gray-500 transition-colors" title="İptal">
                                    <RotateCcw className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <button onClick={() => handleEditStart(item)} className="text-gray-300 hover:text-blue-400 transition-colors" title="Düzenle">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors" title="Sil">
                                    <Trash2 className="w-3.5 h-3.5" />
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

                {/* Add item */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Yeni Kalem Ekle</p>

                  {/* Row 1: Ad + Boyutlar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {/* Ad */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Ürün Adı</label>
                      <input
                        type="text"
                        placeholder="ör. Koli A, Palet B…"
                        value={newItem.name}
                        onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Boyutlar: Uzunluk × Genişlik × Yükseklik */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        Boyutlar <span className="font-normal normal-case text-gray-300">(Uzunluk × Genişlik × Yükseklik — cm)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        {([
                          { field: 'depth',  ph: 'Uzunluk' },
                          { field: 'width',  ph: 'Genişlik' },
                          { field: 'height', ph: 'Yükseklik' },
                        ] as { field: 'width' | 'height' | 'depth'; ph: string }[]).map(({ field, ph }, i) => (
                          <>
                            <div key={field} className="flex flex-col gap-0.5 flex-1">
                              <span className="text-[10px] text-gray-400 text-center">{ph}</span>
                              <input
                                type="number" min={1}
                                value={newItem[field]}
                                onChange={(e) => setNewItem((p) => ({ ...p, [field]: parseInt(e.target.value) || 1 }))}
                                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            {i < 2 && <span key={`sep-${i}`} className="text-gray-300 text-sm font-bold mt-4">×</span>}
                          </>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Adet + Ağırlık */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Adet</label>
                      <input
                        type="number" min={1}
                        value={newItem.qty}
                        onChange={(e) => setNewItem((p) => ({ ...p, qty: parseInt(e.target.value) || 1 }))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Ağırlık <span className="font-normal">(kg / adet)</span></label>
                      <input
                        type="number" min={0} step="0.1"
                        value={newItem.weight}
                        onChange={(e) => setNewItem((p) => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Özellikler */}
                  <div className="flex flex-col gap-1 mb-3">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Özellikler</label>
                    <div className="flex flex-wrap gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer" title="Kutu farklı yönlerde yerleştirilebilir">
                        <input type="checkbox" checked={newItem.canRotate}
                          onChange={(e) => setNewItem((p) => ({ ...p, canRotate: e.target.checked }))}
                          className="accent-blue-600 w-3.5 h-3.5" />
                        <span>Rotasyon <span className="text-gray-400">(yön değiştirilebilir)</span></span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer" title="Bu kutunun üstüne başka kutu konulabilir">
                        <input type="checkbox" checked={newItem.stackable}
                          onChange={(e) => setNewItem((p) => ({ ...p, stackable: e.target.checked }))}
                          className="accent-green-600 w-3.5 h-3.5" />
                        <span>İstifleme <span className="text-gray-400">(üste kutu konabilir)</span></span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer" title="Kırılgan — en üste yerleştirilir">
                        <input type="checkbox" checked={newItem.fragile}
                          onChange={(e) => setNewItem((p) => ({ ...p, fragile: e.target.checked }))}
                          className="accent-amber-500 w-3.5 h-3.5" />
                        <span>Kırılgan <span className="text-gray-400">(en üste yerleştirilir)</span></span>
                      </label>
                    </div>
                  </div>

                  {/* Row 4: Çıkış sırası */}
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Çıkış Sırası</label>
                    <select
                      value={newItem.priority}
                      onChange={(e) => setNewItem((p) => ({ ...p, priority: e.target.value as LoadPriority }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                    >
                      <option value="first-out">Önce Çıkar — LIFO (kapı tarafına yakın yerleşir)</option>
                      <option value="any">Herhangi — hacim bazlı optimal yerleşim</option>
                      <option value="last-out">Sonra Çıkar — FIFO (en arkaya yerleşir)</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddItem}
                      disabled={!newItem.name.trim()}
                      className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Kalem Ekle
                    </button>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
                      <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                      CSV İçe Aktar
                    </label>
                  </div>
                </div>
              </div>

              {/* Pre-optimize summary */}
              {cargoItems.length > 0 && (() => {
                const totalUnits = cargoItems.reduce((s, c) => s + c.qty, 0);
                const totalW     = cargoItems.reduce((s, c) => s + c.qty * c.weight, 0);
                const wPct       = Math.min(110, Math.round((totalW / container.maxWeight) * 100));
                const over       = totalW > container.maxWeight;
                return (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-gray-500">
                        {cargoItems.length} tip · <span className="text-gray-700 font-bold">{totalUnits} adet</span>
                      </span>
                      <span className={`font-semibold ${over ? 'text-red-500' : 'text-gray-600'}`}>
                        {totalW.toFixed(1)} / {container.maxWeight} kg
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : wPct > 80 ? 'bg-amber-400' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, wPct)}%` }}
                      />
                    </div>
                    {over && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Toplam ağırlık konteyner limitini aşıyor
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Optimize button */}
              <button
                onClick={handleOptimize}
                disabled={cargoItems.length === 0 || isOptimizing}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-base px-8 py-4 rounded-2xl transition-colors shadow-sm shadow-blue-100"
              >
                {isOptimizing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Hesaplanıyor…
                  </>
                ) : (
                  <><Zap className="w-5 h-5" /> Optimize Et</>
                )}
              </button>
            </div>

            {/* RIGHT: Results */}
            <div className="flex flex-col gap-5">
              {showResult && result ? (
                <>
                  {/* Stats cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Doluluk Oranı',    value: `${fillPct}%`,   color: 'teal',   sub: `${(result.usedVolume / 1e6).toFixed(2)} m³` },
                      { label: 'Ağırlık Yükü',     value: `${weightPct}%`, color: 'blue',   sub: `${result.totalWeight.toFixed(1)} / ${container.maxWeight} kg` },
                      { label: 'Paketlenen Kutu',  value: result.placed.length, color: 'purple', sub: `${cargoItems.reduce((s,c) => s+c.qty,0)} birim toplamda` },
                      { label: 'Sığmayan Tip',     value: result.unplacedItems.length, color: result.unplacedItems.length > 0 ? 'orange' : 'teal', sub: result.unplacedItems.length > 0 ? 'uyarı: alan dolu' : 'tüm tipler yerleşti' },
                    ].map(({ label, value, color, sub }) => (
                      <div key={label} className={`rounded-2xl p-4 border bg-${color}-50 border-${color}-100`}>
                        <p className="text-xs text-gray-500 font-semibold">{label}</p>
                        <p className={`text-2xl font-black text-${color}-600`}>{value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Fill bar */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Hacim Doluluk</span>
                      <span className="text-xs font-bold text-blue-700">{fillPct}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-700"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mb-2 mt-3">
                      <span className="text-xs font-semibold text-gray-500">Ağırlık Yükü</span>
                      <span className={`text-xs font-bold ${weightPct > 90 ? 'text-red-500' : 'text-blue-600'}`}>{weightPct}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${weightPct > 90 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                        style={{ width: `${weightPct}%` }}
                      />
                    </div>
                    {cog && activeContainer === 1 && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-500">Ağırlık Merkezi (CoG)</span>
                        <span className="text-xs font-mono font-bold text-amber-600">
                          x:{cog.x.toFixed(0)} y:{cog.y.toFixed(0)} z:{cog.z.toFixed(0)} cm
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Ağırlık Dağılımı Paneli (AB/TIR standardı) ── */}
                  {activeContainer === 1 && result.totalWeight > 0 && (() => {
                    const { frontWeight: fw, rearWeight: rw, leftWeight: lw, rightWeight: rght } = result;
                    const totalW   = fw + rw;
                    const frontPct = Math.round((fw / Math.max(totalW, 1)) * 100);
                    const rearPct  = 100 - frontPct;
                    const leftPct  = Math.round((lw / Math.max(lw + rght, 1)) * 100);

                    // CoG z konumu % olarak (dorsenin başından)
                    const cogZPct  = cog ? Math.round((cog.z / container.depth) * 100) : null;

                    // AB standart aralığı: CoG %35-55, yan fark <%15
                    const cogOk    = cogZPct !== null && cogZPct >= 35 && cogZPct <= 55;
                    const lateralOk = Math.abs(leftPct - 50) <= 10;
                    const frontRearOk = frontPct >= 40 && frontPct <= 60;

                    // Tahmini aks yükleri (basitleştirilmiş fizik modeli)
                    // Dorse aksı ≈ toplam yük * cogZ / dorseBoyu
                    const trailerAxleLoad = cog ? Math.round(result.totalWeight * (cog.z / container.depth)) : null;
                    const kingpinLoad     = trailerAxleLoad !== null ? Math.round(result.totalWeight - trailerAxleLoad) : null;

                    const EU_TRAILER_AXL = 24000; // tandem aks kg
                    const EU_KINGPIN_MAX = 12000;  // beşinci teker kg

                    return (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900">Ağırlık Dağılımı</h3>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">AB Direktifi 96/53/EC</span>
                        </div>

                        {/* Ön / Arka */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-gray-500">Ön – Arka Dağılımı</span>
                            <span className={`font-bold ${frontRearOk ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {frontRearOk ? '✓ Dengeli' : frontPct > 60 ? '⚠ Öne ağırlıklı' : '⚠ Arkaya ağırlıklı'}
                            </span>
                          </div>
                          <div className="flex h-5 rounded-lg overflow-hidden text-[10px] font-bold">
                            <div className="bg-blue-500 flex items-center justify-center text-white transition-all" style={{ width: `${frontPct}%` }}>
                              {frontPct >= 15 && `Ön %${frontPct}`}
                            </div>
                            <div className="bg-indigo-400 flex items-center justify-center text-white transition-all" style={{ width: `${rearPct}%` }}>
                              {rearPct >= 15 && `Arka %${rearPct}`}
                            </div>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>{fw.toFixed(0)} kg</span>
                            <span className="text-gray-300">|  İdeal: %40-60  |</span>
                            <span>{rw.toFixed(0)} kg</span>
                          </div>
                        </div>

                        {/* Sol / Sağ */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-gray-500">Sol – Sağ Dengesi</span>
                            <span className={`font-bold ${lateralOk ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {lateralOk ? '✓ Dengeli' : leftPct > 60 ? '⚠ Sola yatık' : '⚠ Sağa yatık'}
                            </span>
                          </div>
                          <div className="flex h-4 rounded-lg overflow-hidden text-[10px] font-bold">
                            <div className="bg-teal-500 flex items-center justify-center text-white transition-all" style={{ width: `${leftPct}%` }}>
                              {leftPct >= 20 && `Sol %${leftPct}`}
                            </div>
                            <div className="bg-cyan-400 flex items-center justify-center text-white transition-all" style={{ width: `${100 - leftPct}%` }}>
                              {(100 - leftPct) >= 20 && `Sağ %${100 - leftPct}`}
                            </div>
                          </div>
                        </div>

                        {/* Aks yükleri */}
                        {kingpinLoad !== null && trailerAxleLoad !== null && (
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                            <div className={`rounded-xl p-3 ${kingpinLoad > EU_KINGPIN_MAX ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Beşinci Teker Yükü</p>
                              <p className={`text-lg font-black ${kingpinLoad > EU_KINGPIN_MAX ? 'text-red-600' : 'text-gray-800'}`}>
                                {(kingpinLoad / 1000).toFixed(1)} t
                              </p>
                              <p className="text-[10px] text-gray-400">limit: {EU_KINGPIN_MAX / 1000} t</p>
                              {kingpinLoad > EU_KINGPIN_MAX && <p className="text-[10px] text-red-500 font-semibold mt-0.5">⚠ Limit aşıldı</p>}
                            </div>
                            <div className={`rounded-xl p-3 ${trailerAxleLoad > EU_TRAILER_AXL ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Dorse Aks Yükü</p>
                              <p className={`text-lg font-black ${trailerAxleLoad > EU_TRAILER_AXL ? 'text-red-600' : 'text-gray-800'}`}>
                                {(trailerAxleLoad / 1000).toFixed(1)} t
                              </p>
                              <p className="text-[10px] text-gray-400">limit: {EU_TRAILER_AXL / 1000} t (tandem)</p>
                              {trailerAxleLoad > EU_TRAILER_AXL && <p className="text-[10px] text-red-500 font-semibold mt-0.5">⚠ Limit aşıldı</p>}
                            </div>
                          </div>
                        )}

                        {/* CoG konumu */}
                        {cogZPct !== null && (
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                            <span className="font-semibold text-gray-500">Ağırlık Merkezi (Z ekseni)</span>
                            <span className={`font-bold ${cogOk ? 'text-emerald-600' : 'text-amber-500'}`}>
                              %{cogZPct} — {cogOk ? '✓ İdeal aralıkta' : '⚠ Aralık dışı'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ─── Akıllı Öneri Paneli ─── */}
                  {(() => {
                    type Oneri = { seviye: 'kritik' | 'uyari' | 'ipucu'; baslik: string; aciklama: string };
                    const oneriler: Oneri[] = [];

                    const { frontWeight: fw2, rearWeight: rw2, leftWeight: lw2, rightWeight: rght2 } = result;
                    const totalW2   = fw2 + rw2;
                    const frontPct2 = Math.round((fw2 / Math.max(totalW2, 1)) * 100);
                    const leftPct2  = Math.round((lw2 / Math.max(lw2 + rght2, 1)) * 100);
                    const cogZPct2  = cog ? Math.round((cog.z / container.depth) * 100) : null;
                    const trailerAL = cog ? Math.round(result.totalWeight * (cog.z / container.depth)) : null;
                    const kingpinL  = trailerAL !== null ? Math.round(result.totalWeight - trailerAL) : null;
                    const KP_MAX = 12000, TR_MAX = 24000;

                    // 1. Beşinci teker limit aşımı
                    if (kingpinL !== null && kingpinL > KP_MAX) {
                      const fazla = ((kingpinL - KP_MAX) / 1000).toFixed(1);
                      oneriler.push({
                        seviye: 'kritik',
                        baslik: `Beşinci Teker Limiti Aşıldı (+${fazla} t)`,
                        aciklama: `${(kingpinL / 1000).toFixed(1)} t yük var, yasal limit 12 t. Ağır kalemleri dorsenin arka yarısına (z > ${Math.round(container.depth / 2)} cm) taşıyın veya toplam yükü ${Math.round(kingpinL - KP_MAX).toLocaleString('tr-TR')} kg azaltın.`,
                      });
                    }

                    // 2. Dorse aks limit aşımı
                    if (trailerAL !== null && trailerAL > TR_MAX) {
                      const fazla = ((trailerAL - TR_MAX) / 1000).toFixed(1);
                      oneriler.push({
                        seviye: 'kritik',
                        baslik: `Dorse Aks Limiti Aşıldı (+${fazla} t)`,
                        aciklama: `Dorse üzerinde ${(trailerAL / 1000).toFixed(1)} t var, tandem limit 24 t. Ağır kalemlerin bir kısmını öne alın veya yükü ikinci konteynere bölün.`,
                      });
                    }

                    // 3. Ön ağırlıklı yük
                    if (frontPct2 > 62) {
                      const onKalemler = result.placed
                        .filter((p) => p.z < container.depth / 2)
                        .map((p) => cargoItems.find((c) => c.id === p.cargoId)?.name)
                        .filter(Boolean);
                      const onAd = [...new Set(onKalemler)].slice(0, 2).join(', ');
                      oneriler.push({
                        seviye: 'uyari',
                        baslik: `Öne Ağırlıklı Yerleşim (%${frontPct2} ön)`,
                        aciklama: `İdeal ön-arka oranı %40-60. ${onAd ? `"${onAd}" gibi ağır kalemleri` : 'Ağır kalemleri'} dorsenin arka yarısına alın. Kalemlerin "Çıkış Sırası"nı "Sonra Çıkar" yaparak algoritmayı arkaya yönlendirin.`,
                      });
                    }

                    // 4. Arka ağırlıklı yük
                    if (frontPct2 < 38 && totalW2 > 0) {
                      oneriler.push({
                        seviye: 'uyari',
                        baslik: `Arkaya Ağırlıklı Yerleşim (%${100 - frontPct2} arka)`,
                        aciklama: `Ağır kalemleri "Önce Çıkar" (kapıya yakın) olarak işaretleyin — algoritma onları ön bölüme yerleştirir.`,
                      });
                    }

                    // 5. Sol-sağ dengesi
                    if (Math.abs(leftPct2 - 50) > 15 && totalW2 > 0) {
                      const taraf = leftPct2 > 50 ? 'sola' : 'sağa';
                      const rotasyonluAdlar = cargoItems
                        .filter((c) => c.canRotate && result.placed.some((p) => p.cargoId === c.id))
                        .map((c) => c.name).join(', ');
                      oneriler.push({
                        seviye: 'uyari',
                        baslik: `Yan Dengesizlik — ${taraf === 'sola' ? `Sol %${leftPct2}` : `Sağ %${100 - leftPct2}`}`,
                        aciklama: `Rotasyon açık kalemler (${rotasyonluAdlar || 'yok'}) için yeniden optimize edin. Dikdörtgen kalemlerde rotasyon ağırlığı sola-sağa dağıtabilir.`,
                      });
                    }

                    // 6. CoG Z ekseni aralık dışı
                    if (cogZPct2 !== null && (cogZPct2 < 35 || cogZPct2 > 55)) {
                      const yon = cogZPct2 < 35 ? 'çok öne' : 'çok arkaya';
                      oneriler.push({
                        seviye: 'uyari',
                        baslik: `Ağırlık Merkezi Aralık Dışı (%${cogZPct2})`,
                        aciklama: `AB 96/53/EC standardı %35-55. Yük ${yon} kaymış. ${cogZPct2 < 35 ? 'Ağır kalemleri "Sonra Çıkar" yapın — arkaya itilirler.' : 'Ağır kalemleri "Önce Çıkar" yapın — öne çekilirler.'}`,
                      });
                    }

                    // 7. Düşük doluluk
                    if (fillPct < 50 && result.placed.length > 0) {
                      oneriler.push({
                        seviye: 'ipucu',
                        baslik: `Düşük Hacim Kullanımı (%${fillPct})`,
                        aciklama: `Konteyner kapasitesinin yarısından azı kullanılıyor. Bir sonraki sevkiyatla birleştirin veya daha küçük konteyner/araç seçin.`,
                      });
                    }

                    // 8. Rotasyon kapalı kalemler varsa ve denge bozuk
                    if (Math.abs(leftPct2 - 50) > 10 || frontPct2 > 60 || frontPct2 < 40) {
                      const rotKapali = cargoItems.filter(
                        (c) => !c.canRotate && result.placed.some((p) => p.cargoId === c.id)
                      );
                      if (rotKapali.length > 0) {
                        oneriler.push({
                          seviye: 'ipucu',
                          baslik: `Rotasyon Deneyin: "${rotKapali.map((c) => c.name).join(', ')}"`,
                          aciklama: `Bu kalemlerin rotasyonu kapalı. Açarsanız algoritma farklı yönlerde deneyerek daha iyi dağılım bulabilir.`,
                        });
                      }
                    }

                    if (oneriler.length === 0) {
                      return (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-emerald-700">Yerleşim Optimize</p>
                            <p className="text-xs text-emerald-600 mt-0.5">Ağırlık dağılımı, aks yükleri ve hacim kullanımı kabul edilebilir aralıkta.</p>
                          </div>
                        </div>
                      );
                    }

                    const renkMap = {
                      kritik: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'KRİTİK' },
                      uyari:  { bg: 'bg-amber-50', border: 'border-amber-100', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', label: 'UYARI' },
                      ipucu:  { bg: 'bg-blue-50', border: 'border-blue-100', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400', label: 'İPUCU' },
                    };

                    return (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <h3 className="text-sm font-bold text-gray-900">Akıllı Öneriler</h3>
                          <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {oneriler.length} öneri
                          </span>
                        </div>
                        <div className="space-y-2">
                          {oneriler.map((o, i) => {
                            const r = renkMap[o.seviye];
                            return (
                              <div key={i} className={`${r.bg} border ${r.border} rounded-xl p-3`}>
                                <div className="flex items-start gap-2.5">
                                  <span className={`w-2 h-2 rounded-full ${r.dot} shrink-0 mt-1.5`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${r.badge}`}>{r.label}</span>
                                      <p className="text-xs font-bold text-gray-900">{o.baslik}</p>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">{o.aciklama}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Unplaced warning + multi-container */}
                  {result.unplacedItems.length > 0 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-orange-700">Sığmayan Ürünler</p>
                          <p className="text-xs text-orange-600 mt-1">
                            {result.unplacedItems.map((i) => i.name).join(', ')} — {result.unplacedItems.reduce((s, i) => s + i.qty, 0)} birim ilk konteynere sığmadı.
                          </p>
                        </div>
                        {!result2 && (
                          <button onClick={handleSecondContainer}
                            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-xl transition-colors">
                            <Plus className="w-3.5 h-3.5" /> 2. Konteyner
                          </button>
                        )}
                      </div>
                      {result2 && (
                        <div className="flex gap-2 border-t border-orange-100 pt-3">
                          {([1, 2] as const).map((n) => (
                            <button key={n} onClick={() => setActiveContainer(n)}
                              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeContainer === n ? 'bg-orange-500 text-white' : 'bg-white text-orange-700 border border-orange-200 hover:bg-orange-50'}`}>
                              Konteyner {n} · {n === 1 ? result.placed.length : result2.placed.length} kutu
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: 3D / Table */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-100">
                      {(['3d', 'table'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {tab === '3d' ? '3D Görünüm' : 'Yerleşim Tablosu'}
                        </button>
                      ))}
                    </div>

                    <div className="p-4">
                      {activeTab === '3d' ? (
                        <>
                          {/* Viewer + fullscreen btn */}
                          <div className="relative rounded-xl overflow-hidden" style={{ height: '460px' }}>
                            <ErrorBoundary>
                              <CargoViewer3D
                                placed={activeContainer === 1 ? result.placed : (result2?.placed ?? [])}
                                container={container}
                                cog={activeContainer === 1 ? cog : null}
                              />
                            </ErrorBoundary>
                            <button
                              onClick={() => setFullscreen3D(true)}
                              title="Tam ekrana aç"
                              className="absolute top-3 right-3 z-10 bg-gray-900/60 hover:bg-gray-900/90 text-white/70 hover:text-white p-2 rounded-lg transition-all backdrop-blur-sm"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Controls hint */}
                          <p className="text-center text-xs text-gray-400 mt-2">
                            Sol tık: döndür · Kaydır: zoom · Sağ tık: taşı
                          </p>

                          {/* Legend */}
                          <div className="mt-3 flex flex-wrap gap-3">
                            {placedSummary.map((s) => {
                              const c = COLORS[s.colorIdx % COLORS.length];
                              return (
                                <span key={s.name} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.bg }} />
                                  {s.name} ×{s.count}
                                </span>
                              );
                            })}
                            {(activeContainer === 1 ? cog : null) && (
                              <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                                <span className="w-3 h-3 rounded-full bg-amber-400" />
                                Ağırlık Merkezi
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div>
                          <div className="flex justify-end mb-3">
                            <button
                              onClick={handleExportCSV}
                              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <BarChart3 className="w-3.5 h-3.5" /> CSV İndir
                            </button>
                          </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-100 text-gray-400 text-left">
                                <th className="pb-2 pr-3 font-semibold">#</th>
                                <th className="pb-2 pr-3 font-semibold">Ürün</th>
                                <th className="pb-2 pr-3 font-semibold">X (cm)</th>
                                <th className="pb-2 pr-3 font-semibold">Y (cm)</th>
                                <th className="pb-2 pr-3 font-semibold">Z (cm)</th>
                                <th className="pb-2 font-semibold">G×Y×D</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.placed.map((p, i) => {
                                const c = COLORS[p.colorIdx % COLORS.length];
                                return (
                                  <tr key={p.uid} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-1.5 pr-3 text-gray-400">{i + 1}</td>
                                    <td className="py-1.5 pr-3">
                                      <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: c.bg }} />
                                        <span className="font-medium text-gray-700">{p.name}</span>
                                      </span>
                                    </td>
                                    <td className="py-1.5 pr-3 font-mono text-gray-600">{p.x}</td>
                                    <td className="py-1.5 pr-3 font-mono text-gray-600">{p.y}</td>
                                    <td className="py-1.5 pr-3 font-mono text-gray-600">{p.z}</td>
                                    <td className="py-1.5 font-mono text-gray-500">{p.w}×{p.h}×{p.d}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes + Print */}
                  <div className="flex gap-3">
                    <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <p className="text-sm font-bold text-blue-800 mb-2">Optimizasyon Notları</p>
                      <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                        <li>Ürünler hacme göre büyükten küçüğe sıralanarak yerleştirildi.</li>
                        <li>İzin verilen ürünlerde 6 farklı rotasyon denendi.</li>
                        <li>Raf-bazlı (shelf) algoritma ile Z katmanları oluşturuldu.</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-500 hover:text-blue-700 hover:border-blue-200 transition-colors text-xs font-semibold"
                    >
                      <Printer className="w-5 h-5" />
                      Planı Yazdır
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center min-h-96">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <Box className="w-8 h-8 text-blue-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Konteyner ve kargo bilgilerini doldurun,</p>
                  <p className="text-gray-400 text-sm mt-1">ardından <span className="font-bold text-blue-600">"Optimize Et"</span> butonuna tıklayın.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Optimization History */}
      {optHistory.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">
                Optimizasyon <span className="text-blue-600">Geçmişi</span>
              </h2>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Son {Math.min(optHistory.length, 10)} çalışma</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-semibold">Tarih</th>
                      <th className="text-left px-5 py-3 font-semibold">Konteyner</th>
                      <th className="text-center px-5 py-3 font-semibold">Doluluk</th>
                      <th className="text-center px-5 py-3 font-semibold">Toplam Birim</th>
                      <th className="text-center px-5 py-3 font-semibold">Yerleştirilen</th>
                      <th className="w-24 px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {optHistory.slice(0, 10).map((rec, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-5 py-3 text-gray-400 text-xs font-mono">{rec.date}</td>
                        <td className="px-5 py-3 font-medium text-gray-700">{rec.containerLabel}</td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${rec.fillPct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-blue-700">{rec.fillPct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center text-gray-600 font-medium">{rec.itemCount}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rec.placedCount === rec.itemCount ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                            {rec.placedCount} / {rec.itemCount}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleRestoreOpt(rec)}
                            disabled={!rec.payload}
                            title={rec.payload ? 'Yük bilgilerini geri yükle' : 'Bu çalışmada veri yok'}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-100 disabled:text-gray-300 disabled:cursor-not-allowed px-3 py-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ↩ Yükle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Nasıl <span className="text-blue-600">Çalışır?</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">3 adımda optimal kargo planına ulaşın.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: Box,      title: 'Konteyner Seç',    desc: 'Hazır önayarlardan seçin veya özel ölçü ve maksimum ağırlık tanımlayın.' },
              { step: '02', icon: Package,  title: 'Kargoyu Listele',  desc: 'Her ürün tipini boyut, adet, ağırlık ve rotasyon izniyle ekleyin.' },
              { step: '03', icon: BarChart3, title: 'Planı İncele',     desc: '3D görünüm, yerleşim tablosu ve doluluk istatistiklerini alın.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col gap-4 bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-blue-100">{step}</span>
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Neden <span className="text-blue-600">LogiFlow?</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Sadece bir optimizasyon aracından fazlası — uçtan uca yük planlama platformu.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '⚡',
                title: 'Zaman Tasarrufu',
                desc: 'Saniyeler içinde ayrıntılı yük planları oluşturarak zamandan tasarruf edin.',
              },
              {
                icon: '📦',
                title: 'Maksimum Alan',
                desc: 'Optimize edilmiş kargo yerleştirme ile alan kullanımını en üst düzeye çıkarın.',
              },
              {
                icon: '🖱️',
                title: 'Kolay Arayüz',
                desc: 'Yük planlarınızı oluşturmak için basit adımlar içeren, kullanımı kolay arayüz.',
              },
              {
                icon: '🎮',
                title: 'İnteraktif 3D',
                desc: 'İnteraktif 3D görselleştirme, tıpkı bir oyun gibi.',
              },
              {
                icon: '🔗',
                title: 'Entegrasyon',
                desc: 'Microsoft Excel, SAP veya API ile sorunsuz entegrasyon.',
              },
              {
                icon: '📤',
                title: 'Anında Paylaşım',
                desc: 'Yazdırılabilir raporlar veya genel bağlantılar ile anında yükleme planı paylaşımı.',
              },
              {
                icon: '✏️',
                title: 'Manuel Ayarlama',
                desc: 'İhtiyaç duyulduğunda yük planlarında manuel ayarlamalar yapın.',
              },
              {
                icon: '🗺️',
                title: 'Varış Yeri Düzeni',
                desc: 'Öncelikli grupları varış yerine göre düzenleyin, boşaltma sırasını optimize edin.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Depolamayla Bütünleşik Kullanın</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Optimizasyonu depo yönetimiyle birleştirerek uçtan uca lojistik verimliliği elde edin.
          </p>
          <Link href="/depolama" className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-2xl transition-colors shadow-sm">
            Uygulamaya Git <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main></AuthGuard>
  );
}
