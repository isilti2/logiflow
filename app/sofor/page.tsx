'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Navigation, MapPin, Truck, Play, Square,
  Wifi, WifiOff, AlertTriangle, CheckCircle2,
  Clock, Gauge, Crosshair, Battery,
} from 'lucide-react';

type Sefer = { id: string; rotaDan: string; rotaAya: string; aracPlaka: string; durum: string };
type KonumDurumu = 'bekliyor' | 'aktif' | 'durduruldu' | 'hata';

const GONDER_ARALIĞI_MS = 15_000; // 15 sn
const MIN_MESAFE_M       = 30;     // 30 m'den az hareket varsa gönderme

function mesafeHesapla(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SoforPage() {
  const router = useRouter();
  const [user,         setUser]         = useState<{ id: string; name: string; email: string } | null>(null);
  const [seferler,     setSeferler]     = useState<Sefer[]>([]);
  const [seciliSefer,  setSeciliSefer]  = useState('');
  const [durum,        setDurum]        = useState<KonumDurumu>('bekliyor');
  const [sonKonum,     setSonKonum]     = useState<{ lat: number; lng: number; accuracy: number; hiz: number } | null>(null);
  const [gonderilen,   setGonderilen]   = useState(0);
  const [sure,         setSure]         = useState(0);           // saniye
  const [hata,         setHata]         = useState('');
  const [isIOS,        setIsIOS]        = useState(false);
  const [gizli,        setGizli]        = useState(false);       // sayfa arka planda mı
  const [wakeLock,     setWakeLock]     = useState(false);

  const watchRef      = useRef<number | null>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const sonGonderilen = useRef<{ lat: number; lng: number } | null>(null);
  const sonGonderZaman = useRef<number>(0);
  const wakeLockRef   = useRef<WakeLockSentinel | null>(null);
  const seciliSeferRef = useRef(seciliSefer);

  // seciliSefer değişince ref'i güncelle — stale closure koruması
  useEffect(() => { seciliSeferRef.current = seciliSefer; }, [seciliSefer]);

  /* ── Auth + sefer yükle ── */
  useEffect(() => {
    fetch('/api/auth/me').then(async r => {
      if (r.status === 401) { router.replace('/login'); return; }
      const me = await r.json();
      setUser(me);
    });
    fetch('/api/muhasebe/seferler').then(async r => {
      if (r.ok) {
        const data: Sefer[] = await r.json();
        setSeferler(data.filter(s => s.durum !== 'tamamlandi' && s.durum !== 'iptal'));
      }
    });
    setIsIOS(/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  }, [router]);

  /* ── Sayfa gizlenme tespiti ── */
  useEffect(() => {
    const onVisibility = () => setGizli(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  /* ── Wake Lock talep et ── */
  const wakeLockAl = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen');
      setWakeLock(true);
      wakeLockRef.current.addEventListener('release', () => setWakeLock(false));
    } catch { /* izin verilmedi */ }
  }, []);

  const wakeLockBırak = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
    setWakeLock(false);
  }, []);

  /* ── Konum gönder ── */
  const konumGonder = useCallback(async (lat: number, lng: number, accuracy: number, hiz: number, baslik: number | null) => {
    try {
      await fetch('/api/konum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seferId: seciliSeferRef.current || null, lat, lng, accuracy, hiz, baslik }),
      });
      setGonderilen(n => n + 1);
      sonGonderilen.current = { lat, lng };
      sonGonderZaman.current = Date.now();
    } catch { /* ağ hatası, sessizce geç */ }
  }, []);

  /* ── watchPosition callback ── */
  const konumAlındı = useCallback((pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, accuracy, speed, heading } = pos.coords;
    const hizKmh = speed ? speed * 3.6 : 0;

    setSonKonum({ lat, lng, accuracy, hiz: hizKmh });
    setHata('');

    const şimdi = Date.now();
    const mevcutSon = sonGonderilen.current;
    const mesafe = mevcutSon ? mesafeHesapla(mevcutSon.lat, mevcutSon.lng, lat, lng) : Infinity;
    const zamanFark = şimdi - sonGonderZaman.current;

    // Yeterince hareket veya yeterince zaman geçmişse gönder
    if (mesafe >= MIN_MESAFE_M || zamanFark >= GONDER_ARALIĞI_MS) {
      konumGonder(lat, lng, accuracy, hizKmh, heading ?? null);
    }
  }, [konumGonder]);

  /* ── Başlat ── */
  const baslat = useCallback(async () => {
    if (!seciliSefer) {
      setHata('Lütfen önce bir sefer seçin.');
      return;
    }
    if (!navigator.geolocation) {
      setHata('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }
    setDurum('aktif');
    setGonderilen(0);
    setSure(0);
    sonGonderilen.current = null;
    sonGonderZaman.current = 0;

    await wakeLockAl();

    watchRef.current = navigator.geolocation.watchPosition(
      konumAlındı,
      (err) => {
        if (err.code === 1) setHata('Konum izni reddedildi. Tarayıcı ayarlarından izin verin.');
        else if (err.code === 2) setHata('Konum alınamıyor. GPS sinyali yok.');
        else setHata('Konum hatası: ' + err.message);
        setDurum('hata');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    timerRef.current = setInterval(() => setSure(n => n + 1), 1000);
  }, [wakeLockAl, konumAlındı]);

  /* ── Durdur ── */
  const durdur = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    wakeLockBırak();
    setDurum('durduruldu');
  }, [wakeLockBırak]);

  useEffect(() => () => { durdur(); }, [durdur]);

  /* ── Süre formatlama ── */
  const sureFmt = `${String(Math.floor(sure / 3600)).padStart(2, '0')}:${String(Math.floor((sure % 3600) / 60)).padStart(2, '0')}:${String(sure % 60).padStart(2, '0')}`;

  const sefer = seferler.find(s => s.id === seciliSefer);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <header className="px-4 pt-safe pt-4 pb-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-white font-black text-xs">LF</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">LogiFlow</p>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Şoför Paneli</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wakeLock && <Battery className="w-4 h-4 text-green-400" />}
          {durum === 'aktif' ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> CANLI
            </span>
          ) : durum === 'durduruldu' ? (
            <span className="text-xs font-semibold text-gray-500">DURDURULDU</span>
          ) : (
            <span className="text-xs text-gray-600">{user?.name ?? user?.email ?? '—'}</span>
          )}
        </div>
      </header>

      {/* iOS uyarısı */}
      {isIOS && durum === 'aktif' && (
        <div className="mx-4 mt-3 bg-amber-900/40 border border-amber-700/50 rounded-2xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300 leading-relaxed">
            <strong>iPhone / iPad:</strong> Konum takibi devam etmesi için Safari&apos;yi kapatmayın. Başka uygulamaya geçebilirsiniz ama Safari&apos;yi arka planda açık tutun.
          </p>
        </div>
      )}

      {/* Arka plan uyarısı */}
      {gizli && durum === 'aktif' && !isIOS && (
        <div className="mx-4 mt-3 bg-blue-900/40 border border-blue-700/50 rounded-2xl p-3 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-blue-300">Konum takibi arka planda devam ediyor.</p>
        </div>
      )}

      <div className="flex-1 px-4 py-4 flex flex-col gap-4">

        {/* Sefer seçimi */}
        {durum !== 'aktif' && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <Truck className="w-3.5 h-3.5 inline mr-1.5" /> Aktif Sefer
            </label>
            <select
              value={seciliSefer}
              onChange={e => setSeciliSefer(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">— Sefer seç —</option>
              {seferler.map(s => (
                <option key={s.id} value={s.id}>{s.aracPlaka} · {s.rotaDan} → {s.rotaAya}</option>
              ))}
            </select>
          </div>
        )}

        {/* Aktif sefer gösterimi */}
        {durum === 'aktif' && sefer && (
          <div className="bg-blue-900/30 border border-blue-700/40 rounded-2xl p-4">
            <p className="text-xs text-blue-400 font-semibold mb-1">AKTİF SEFER</p>
            <p className="text-lg font-black text-white">{sefer.rotaDan} → {sefer.rotaAya}</p>
            <p className="text-sm text-blue-300 mt-0.5">{sefer.aracPlaka}</p>
          </div>
        )}

        {/* Ana buton */}
        {durum === 'bekliyor' || durum === 'durduruldu' ? (
          <button
            onClick={baslat}
            aria-label="Yolculuğu başlat ve konum takibini aktif et"
            className="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 active:scale-[0.98] text-white font-black text-xl py-6 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-900/50 select-none focus:outline-none focus:ring-4 focus:ring-green-400/50"
          >
            <Play className="w-8 h-8" aria-hidden="true" />
            Yolculuğu Başlat
          </button>
        ) : durum === 'aktif' ? (
          <button
            onClick={durdur}
            aria-label="Yolculuğu bitir ve konum takibini durdur"
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 active:scale-[0.98] text-white font-black text-xl py-6 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-900/50 select-none focus:outline-none focus:ring-4 focus:ring-red-400/50"
          >
            <Square className="w-7 h-7 fill-white" aria-hidden="true" />
            Yolculuğu Bitir
          </button>
        ) : null}

        {/* Hata */}
        {hata && (
          <div role="alert" className="bg-red-900/40 border border-red-700/50 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-red-300 mb-1">Konum Hatası</p>
              <p className="text-xs text-red-400">{hata}</p>
              <button onClick={baslat} className="mt-2 text-xs text-red-300 underline">Tekrar Dene</button>
            </div>
          </div>
        )}

        {/* İstatistik kartları */}
        {durum === 'aktif' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Clock className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-2xl font-black text-white font-mono">{sureFmt}</p>
              <p className="text-xs text-gray-500 mt-1">Yolda geçen süre</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Gauge className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-2xl font-black text-white">
                {sonKonum ? Math.round(sonKonum.hiz) : '—'}
                <span className="text-sm font-normal text-gray-400 ml-1">km/s</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Anlık hız</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <MapPin className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-2xl font-black text-white">{gonderilen}</p>
              <p className="text-xs text-gray-500 mt-1">Konum gönderildi</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Crosshair className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-2xl font-black text-white">
                {sonKonum ? `±${Math.round(sonKonum.accuracy)}` : '—'}
                <span className="text-sm font-normal text-gray-400 ml-1">m</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">GPS doğruluğu</p>
            </div>
          </div>
        )}

        {/* Son konum */}
        {sonKonum && durum === 'aktif' && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Son Alınan Konum</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                <Wifi className="w-3.5 h-3.5" /> Aktif
              </span>
            </div>
            <p className="text-sm font-mono text-gray-300">
              {sonKonum.lat.toFixed(6)}, {sonKonum.lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Tamamlandı */}
        {durum === 'durduruldu' && gonderilen > 0 && (
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-bold text-white text-lg">Yolculuk Tamamlandı</p>
            <p className="text-sm text-gray-400 mt-1">{gonderilen} konum noktası kaydedildi</p>
            <p className="text-sm text-gray-400">Süre: {sureFmt}</p>
          </div>
        )}

        {/* Bilgi notu */}
        {durum === 'bekliyor' && (
          <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nasıl Çalışır?</p>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 font-bold">1</span>
              <span>Sefer seçin ve <strong className="text-gray-400">Yolculuğu Başlat</strong>&apos;a basın</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 font-bold">2</span>
              <span>Bu sekmeyi açık bırakın — başka uygulamaya geçebilirsiniz</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 font-bold">3</span>
              <span>Konum her 15 saniyede veya 30 m hareket edildiğinde otomatik gönderilir</span>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="px-4 pb-safe pb-4 border-t border-gray-800 pt-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Dashboard</Link>
        {durum === 'aktif' && (
          <span className="flex items-center gap-1.5 text-xs text-green-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Konum paylaşılıyor
          </span>
        )}
        {durum !== 'aktif' && (
          <span className="text-xs text-gray-700">{user?.email ?? ''}</span>
        )}
      </div>

    </div>
  );
}
