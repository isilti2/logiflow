'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Package, X, Building2 } from 'lucide-react';

interface CargoRow {
  id: string;
  areaId: string;
  name: string;
  type: string;
  status: string;
  shelf?: string;
  row?: number;
  col?: number;
}

interface AreaRow {
  id: string;
  name: string;
}

const STATUS_COLOR: Record<string, string> = {
  depolarda: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  çıkışta:   'bg-orange-50 text-orange-600',
  beklemede: 'bg-gray-100 text-gray-500 dark:text-gray-400 dark:text-gray-500',
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ area: AreaRow; items: CargoRow[] }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    try {
      const [areasRes, cargoRes] = await Promise.all([
        fetch('/api/depot-areas'),
        fetch('/api/cargo'),
      ]);
      const areas: AreaRow[] = areasRes.ok ? await areasRes.json() : [];
      const cargo: CargoRow[] = cargoRes.ok ? await cargoRes.json() : [];
      const lower = q.toLowerCase();
      const grouped = areas.map((area) => ({
        area,
        items: cargo.filter(
          (c) => c.areaId === area.id &&
            (c.name.toLowerCase().includes(lower) ||
             c.type.toLowerCase().includes(lower) ||
             area.name.toLowerCase().includes(lower) ||
             (c.shelf ?? '').toLowerCase().includes(lower))
        ),
      })).filter((g) => g.items.length > 0);
      setResults(grouped);
    } catch { setResults([]); }
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function handleSelect(areaId: string) {
    localStorage.setItem('lf_depo_area_select', areaId);
    setOpen(false);
    router.push('/depolama');
  }

  const totalHits = results.reduce((s, g) => s + g.items.length, 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-blue-600 border border-gray-200 dark:border-gray-700 hover:border-blue-300 rounded-xl px-3 py-1.5 bg-white transition-colors"
        title="Kargo Ara (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline text-xs">Kargo ara…</span>
        <kbd className="hidden lg:inline text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-400 dark:text-gray-500">⌃K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kargo adı, tipi veya depo ara…"
                className="flex-1 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 bg-transparent focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-xs text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded font-mono">esc</button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {!query.trim() ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                  <Search className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">Tüm depolarda kargo arayın</p>
                  <p className="text-[10px] mt-1 text-gray-300">Ad, tip veya raf konumu</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                  <Package className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">Sonuç bulunamadı</p>
                </div>
              ) : (
                <div>
                  <div className="px-4 py-2 text-[11px] text-gray-400 dark:text-gray-500 border-b border-gray-50">
                    {totalHits} sonuç — {results.length} depoda
                  </div>
                  {results.map(({ area, items }) => (
                    <div key={area.id}>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{area.name}</span>
                        <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500">{items.length} kalem</span>
                      </div>
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(area.id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-left group"
                        >
                          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                            <Package className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.type}</span>
                              {item.shelf && (
                                <span className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {item.shelf}{item.row ? `-${item.row}` : ''}{item.col ? `-${item.col}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLOR[item.status] ?? 'bg-gray-100 text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                            {item.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
