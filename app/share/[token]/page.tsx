'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Package, ExternalLink, AlertTriangle } from 'lucide-react';

interface CargoRow { name: string; dims: string; qty: number; weight: string; }

interface ShareData {
  containerLabel: string;
  fillPct: number;
  totalWeight?: number;
  date: string;
  items: CargoRow[];
}

export default function SharePage() {
  const params = useParams();
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const raw = Array.isArray(params.token) ? params.token[0] : params.token;
      if (!raw) { setError(true); return; }
      const json = decodeURIComponent(atob(raw));
      setData(JSON.parse(json) as ShareData);
    } catch {
      setError(true);
    }
  }, [params.token]);

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-10 max-w-md text-center space-y-4">
        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-orange-500" />
        </div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Link Geçersiz</h1>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm">Bu paylaşım linki geçersiz veya süresi dolmuş.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalQty = data.items.reduce((s, r) => s + r.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-black text-[10px]">LF</span>
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              Logi<span className="text-blue-600">Flow</span>
            </span>
          </Link>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Salt Okunur</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* Plan summary card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-black text-gray-900 dark:text-white text-lg">LogiFlow Yük Planı</h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{data.containerLabel} · {data.date}</p>
              </div>
            </div>
            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold px-2.5 py-1 rounded-full border border-blue-100">
              Paylaşılan Plan
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Toplam Kalem', value: String(totalQty) },
              { label: 'Kargo Tipi', value: String(data.items.length) },
              { label: 'Doluluk', value: `${data.fillPct}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
                <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Fill bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
              <span>Konteyner Kullanımı</span>
              <span className="font-semibold text-blue-700">{data.fillPct}%</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-700"
                style={{ width: `${data.fillPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cargo table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Kargo Listesi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['Ürün Adı','Boyutlar','Adet','Birim Ağırlık'].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.items.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-100">{item.name}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 dark:text-gray-500 font-mono text-xs">{item.dims}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-lg">
                        {item.qty}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs">{item.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white">Kendi planınızı oluşturun</h3>
            <p className="text-blue-200 text-sm mt-0.5">LogiFlow ile saniyeler içinde optimize edilmiş yük planı alın.</p>
          </div>
          <Link href="/features/kargo-optimizasyon"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
            Optimizörü Dene <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-4">
          Bu plan LogiFlow tarafından oluşturulup paylaşılmıştır.{' '}
          <Link href="/" className="text-blue-500 hover:text-blue-600">logiflow.io</Link>
        </p>
      </main>
    </div>
  );
}
