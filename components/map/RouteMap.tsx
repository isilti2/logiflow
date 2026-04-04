'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet';

type Nokta = { lat: number; lng: number; createdAt: string; hiz?: number };
type CanliSofor = {
  id: string; lat: number; lng: number; hiz: number; accuracy: number; createdAt: string;
  user?: { id: string; name: string; email: string };
  sefer?: { rotaDan: string; rotaAya: string; aracPlaka: string; durum: string } | null;
};

interface Props {
  canliSoforler?: CanliSofor[];
  rota?: Nokta[];
  merkez?: [number, number];
  zoom?: number;
}

export default function RouteMap({ canliSoforler = [], rota = [], merkez, zoom = 7 }: Props) {
  const mapRef   = useRef<LeafletMap | null>(null);
  const divRef   = useRef<HTMLDivElement>(null);
  const markerRef = useRef<Map<string, Marker>>(new Map());
  const rotaRef   = useRef<Polyline | null>(null);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    // Leaflet SSR-safe import
    import('leaflet').then(L => {
      // Leaflet default icon fix for Next.js
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const defaultCenter: [number, number] = merkez ?? [39.0, 35.0]; // Türkiye merkezi
      const map = L.map(divRef.current!).setView(defaultCenter, zoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canlı şoförleri güncelle
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => {
      const map = mapRef.current!;

      canliSoforler.forEach(s => {
        const label = s.user?.name || s.user?.email || 'Şoför';
        const popup = `
          <div style="min-width:160px">
            <strong style="font-size:14px">${label}</strong><br/>
            ${s.sefer ? `<span style="color:#6b7280;font-size:12px">${s.sefer.aracPlaka} · ${s.sefer.rotaDan}→${s.sefer.rotaAya}</span><br/>` : ''}
            <span style="font-size:12px">Hız: ${Math.round(s.hiz)} km/s</span><br/>
            <span style="font-size:11px;color:#9ca3af">${new Date(s.createdAt).toLocaleTimeString('tr-TR')}</span>
          </div>`;

        const icon = L.divIcon({
          html: `<div style="background:#2563eb;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚛</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const existing = markerRef.current.get(s.user?.id ?? s.id);
        if (existing) {
          existing.setLatLng([s.lat, s.lng]).setPopupContent(popup);
        } else {
          const m = L.marker([s.lat, s.lng], { icon }).bindPopup(popup).addTo(map);
          markerRef.current.set(s.user?.id ?? s.id, m);
        }
      });

      // Haritada kimse yoksa Türkiye'ye zoom
      if (canliSoforler.length > 0) {
        const bounds = L.latLngBounds(canliSoforler.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    });
  }, [canliSoforler]);

  // Rota çizgisi
  useEffect(() => {
    if (!mapRef.current || !rota.length) return;
    import('leaflet').then(L => {
      const map = mapRef.current!;
      rotaRef.current?.remove();

      const points = rota.map(n => [n.lat, n.lng] as [number, number]);
      rotaRef.current = L.polyline(points, {
        color: '#2563eb', weight: 4, opacity: 0.8, dashArray: undefined,
      }).addTo(map);

      // Başlangıç ve bitiş marker
      if (points.length > 0) {
        L.circleMarker(points[0], { radius: 8, fillColor: '#22c55e', color: 'white', weight: 2, fillOpacity: 1 })
          .bindTooltip('Başlangıç').addTo(map);
        if (points.length > 1) {
          L.circleMarker(points[points.length - 1], { radius: 8, fillColor: '#ef4444', color: 'white', weight: 2, fillOpacity: 1 })
            .bindTooltip('Son konum').addTo(map);
        }
        map.fitBounds(rotaRef.current.getBounds(), { padding: [40, 40] });
      }
    });
  }, [rota]);

  return <div ref={divRef} style={{ width: '100%', height: '100%' }} />;
}
