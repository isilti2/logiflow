'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Navigation, Truck, RefreshCw, LogOut,
  ChevronRight, MapPin, Clock, Gauge, Users,
  Radio,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { logout } from '@/lib/auth';

const RouteMap = dynamic(() => import('@/components/map/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
      <Spinner size="md" />
    </div>
  ),
});

type CanliSofor = {
  id: string; lat: number; lng: number; hiz: number; accuracy: number; createdAt: string;
  user?: { id: string; name: string; email: string };
  sefer?: { rotaDan: string; rotaAya: string; aracPlaka: string; durum: string } | null;
};

type RotaNokta = { lat: number; lng: number; createdAt: string; hiz: number };

type Sefer = { id: string; aracPlaka: string; rotaDan: string; rotaAya: string; durum: string };

const YENİLE_ARALIĞI = 20_000; // 20 sn

export default function KonumPage() {
  const router = useRouter();
  const [authed,       setAuthed]       = useState<boolean | null>(null);
  const [canliSoforler, setCanliSoforler] = useState<CanliSofor[]>([]);
  const [seferler,     setSeferler]     = useState<Sefer[]>([]);
  const [seciliSefer,  setSeciliSefer]  = useState('');
  const [rota,         setRota]         = useState<RotaNokta[]>([]);
  const [sonYenileme,  setSonYenileme]  = useState('');
  const [yukluyor,     setYukluyor]     = useState(false);
  const [netError,     setNetError]     = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canliYukle = useCallback(async () => {
    setYukluyor(true);
    try {
      const res = await fetch('/api/konum/canli');
      if (res.ok) setCanliSoforler(await res.json());
      setSonYenileme(new Date().toLocaleTimeString('tr-TR'));
    } catch {
      setNetError('Konum verisi alınamadı. Bağlantınızı kontrol edin.');
    } finally {
      setYukluyor(false);
    }
  }, []);

  const rotaYukle = useCallback(async (seferId: string) => {
    if (!seferId) { setRota([]); return; }
    const res = await fetch(`/api/konum?seferId=${seferId}`);
    if (res.ok) setRota(await res.json());
  }, []);

  useEffect(() => {
    fetch('/api/auth/me').then(async r => {
      if (r.status === 401) { router.replace('/login'); return; }
      setAuthed(true);
      await canliYukle();
      fetch('/api/muhasebe/seferler').then(async s => {
        if (s.ok) setSeferler(await s.json());
      });
    });
  }, [router, canliYukle]);

  useEffect(() => {
    if (!authed) return;
    intervalRef.current = setInterval(canliYukle, YENİLE_ARALIĞI);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [authed, canliYukle]);

  useEffect(() => {
    rotaYukle(seciliSefer);
  }, [seciliSefer, rotaYukle]);

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );

  const fmtZaman = (d: string) => {
    const diff = Math.round((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return `${diff}s önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
    return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

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
            <span className="text-sm font-bold text-gray-700 hidden sm:block flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600" /> Canlı Konum Takibi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={canliYukle} disabled={yukluyor}
              aria-label="Konumları yenile"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <RefreshCw className={`w-4 h-4 ${yukluyor ? 'animate-spin' : ''}`} aria-hidden="true" /> Yenile
            </button>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors hidden sm:block">← Dashboard</Link>
            <button onClick={async () => { await logout(); window.location.href = '/'; }}
              aria-label="Çıkış yap"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">

        {netError && (
          <ErrorAlert message={netError} onDismiss={() => setNetError('')} />
        )}

        {/* Üst stat bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{canliSoforler.length}</p>
              <p className="text-xs text-gray-400">Aktif Şoför</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{seferler.filter(s => s.durum === 'devam').length}</p>
              <p className="text-xs text-gray-400">Devam Eden Sefer</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {canliSoforler.length
                  ? Math.round(canliSoforler.reduce((s, d) => s + d.hiz, 0) / canliSoforler.length)
                  : 0}
              </p>
              <p className="text-xs text-gray-400">Ort. Hız (km/s)</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{sonYenileme || '—'}</p>
              <p className="text-xs text-gray-400">Son güncelleme</p>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ minHeight: '520px' }}>

          {/* Sol panel: şoförler listesi */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" /> Aktif Şoförler
                </h3>
              </div>
              <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
                {canliSoforler.length === 0 && (
                  <EmptyState
                    icon={Radio}
                    title="Aktif şoför yok"
                    description="Son 2 saatte konum bildirimi gelmedi. Şoförler Şoför Paneli üzerinden bağlanabilir."
                    action={{ label: 'Şoför Paneli', href: '/sofor' }}
                  />
                )}
                {canliSoforler.map(s => (
                  <div key={s.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {s.user?.name || s.user?.email || 'Şoför'}
                      </span>
                    </div>
                    {s.sefer && (
                      <p className="text-xs text-gray-400 ml-4 mb-1">
                        {s.sefer.aracPlaka} · {s.sefer.rotaDan}→{s.sefer.rotaAya}
                      </p>
                    )}
                    <div className="flex items-center gap-3 ml-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {Math.round(s.hiz)} km/s</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtZaman(s.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rota geçmişi seçici */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5 inline mr-1" /> Rota Geçmişi
              </label>
              <select value={seciliSefer} onChange={e => setSeciliSefer(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Sefer seç —</option>
                {seferler.map(s => (
                  <option key={s.id} value={s.id}>{s.aracPlaka} · {s.rotaDan}→{s.rotaAya}</option>
                ))}
              </select>
              {rota.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">{rota.length} konum noktası</p>
              )}
            </div>
          </div>

          {/* Harita */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: '480px' }}>
            <RouteMap
              canliSoforler={canliSoforler}
              rota={rota}
            />
          </div>
        </div>

        {/* Şoför bağlantı bilgisi */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <Navigation className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-gray-900">Şoförler Nasıl Bağlanır?</p>
            <p className="text-sm text-gray-600 mt-1">
              Şoförler telefonunda tarayıcıya <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/sofor</strong> adresini açarak giriş yapar ve &quot;Yolculuğu Başlat&quot; butonuna basar.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
