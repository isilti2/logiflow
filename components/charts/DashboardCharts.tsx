'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Truck, BarChart3 } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

type AylikTrend = { ay: string; ayLabel: string; gelir: number; gider: number; net: number };
type AracPerf   = { plaka: string; gelir: number; gider: number; net: number };
type SeferDurum = { devam: number; tamamlandi: number; iptal: number };

interface OzetData {
  aylikTrend: AylikTrend[];
  aracPerf:   AracPerf[];
  seferDurum: SeferDurum;
}

const TL = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

function CustomTooltipGelirGider({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === 'gelir' ? 'Gelir' : 'Gider'}: {TL(p.value)}
        </p>
      ))}
      {payload.length === 2 && (
        <p className={`font-black mt-1 pt-1 border-t border-gray-100 ${payload[0].value - payload[1].value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          Net: {TL(payload[0].value - payload[1].value)}
        </p>
      )}
    </div>
  );
}

function CustomTooltipArac({ active, payload }: { active?: boolean; payload?: { value: number; payload: AracPerf }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{d.plaka}</p>
      <p className="text-emerald-600 font-semibold">Gelir: {TL(d.gelir)}</p>
      <p className="text-red-500 font-semibold">Gider: {TL(d.gider)}</p>
      <p className={`font-black mt-1 pt-1 border-t border-gray-100 ${d.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        Net: {TL(d.net)}
      </p>
    </div>
  );
}

export default function DashboardCharts() {
  const [data, setData]       = useState<OzetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/ozet')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-center" style={{ minHeight: 260 }}>
            <Spinner size="md" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { aylikTrend, aracPerf, seferDurum } = data;
  const hasFinancial = aylikTrend.some((a) => a.gelir > 0 || a.gider > 0);
  const hasArac      = aracPerf.length > 0;
  const toplamGelir  = aylikTrend.reduce((t, a) => t + a.gelir, 0);
  const toplamGider  = aylikTrend.reduce((t, a) => t + a.gider, 0);
  const toplamNet    = toplamGelir - toplamGider;

  return (
    <div className="space-y-4">
      {/* Section header + özet rakamlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900">Mali Analitik <span className="text-xs font-normal text-gray-500 ml-1">Son 6 ay</span></h2>
        {hasFinancial && (
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <TrendingUp className="w-4 h-4" /> {TL(toplamGelir)}
            </span>
            <span className="flex items-center gap-1.5 text-red-500 font-semibold">
              <TrendingDown className="w-4 h-4" /> {TL(toplamGider)}
            </span>
            <span className={`font-black ${toplamNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Net {TL(toplamNet)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Chart 1: Aylık Gelir / Gider */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Aylık Gelir & Gider</h3>
          </div>
          {hasFinancial ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={aylikTrend} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="ayLabel" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                  <Tooltip content={<CustomTooltipGelirGider />} cursor={{ fill: '#f9fafb' }} />
                  <Legend formatter={(v) => v === 'gelir' ? 'Gelir' : 'Gider'} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="gelir" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gider" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {/* Net kâr mini bar */}
              <div className="mt-3 pt-3 border-t border-gray-50 flex gap-1 items-end h-8">
                {aylikTrend.map((a) => {
                  const max = Math.max(...aylikTrend.map((x) => Math.abs(x.net)), 1);
                  const h = Math.round((Math.abs(a.net) / max) * 100);
                  return (
                    <div key={a.ay} className="flex-1 flex flex-col items-center gap-0.5" title={`Net: ${TL(a.net)}`}>
                      <div
                        className={`w-full rounded-sm ${a.net >= 0 ? 'bg-emerald-400' : 'bg-red-300'}`}
                        style={{ height: `${Math.max(h, 8)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Net kâr/zarar (çubuk)</p>
            </>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="Henüz mali veri yok"
              description="Muhasebe modülünde gelir/gider kaydı oluşturduktan sonra grafik burada görünür."
              action={{ label: 'Muhasebeye Git', href: '/muhasebe' }}
            />
          )}
        </div>

        {/* Chart 2: Araç Net Kâr */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900">Araç Bazlı Performans</h3>
          </div>
          {hasArac ? (
            <ResponsiveContainer width="100%" height={224}>
              <BarChart data={aracPerf} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <YAxis type="category" dataKey="plaka" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<CustomTooltipArac />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="net" radius={[0, 4, 4, 0]} minPointSize={4}>
                  {aracPerf.map((a, i) => (
                    <Cell key={i} fill={a.net >= 0 ? '#10b981' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={Truck}
              title="Araç verisi yok"
              description="Sefer kayıtlarınız oluştuktan sonra araç bazlı kârlılık burada görüntülenir."
              action={{ label: 'Seferlere Git', href: '/muhasebe' }}
            />
          )}

          {/* Sefer durum pills */}
          {(seferDurum.devam + seferDurum.tamamlandi + seferDurum.iptal) > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-50 flex gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {seferDurum.tamamlandi} Tamamlandı
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {seferDurum.devam} Devam Ediyor
              </span>
              {seferDurum.iptal > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                  {seferDurum.iptal} İptal
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
