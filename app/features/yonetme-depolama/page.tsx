import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import {
  Building2,
  Cloud,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';

const featureCards = [
  {
    icon: Building2,
    title: 'Önceden Tanımlı Çoklu Alanlar',
    description:
      'İstanbul, Ankara, İzmir gibi birden fazla depo alanını tek platformdan yönetin.',
  },
  {
    icon: Cloud,
    title: 'Bulut Tabanlı Depolama',
    description:
      'Verilerinize her cihazdan, her yerden anlık erişim sağlayın.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Microsoft Excel İçe Aktarma',
    description:
      'Mevcut Excel tablolarınızı tek tıkla sisteme aktarın.',
  },
];

const checkmarkItems = [
  'Önceden Tanımlı Çoklu Alanlar',
  'Bulut Tabanlı Depolama',
  'Microsoft Excel İçe Aktarma',
];

const stats = [
  { value: '3', label: 'Hazır Alan' },
  { value: 'Excel', label: 'Desteği' },
  { value: 'Bulut', label: 'Senkron' },
];

export default function YonetmeDepolamaPage() {
  return (
    <AuthGuard><main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950 dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-10">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Anasayfa
            </Link>
            <span>/</span>
            <Link
              href="/#features"
              className="hover:text-blue-600 transition-colors"
            >
              Özellikler
            </Link>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              Yönetme ve Depolama
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text Content */}
            <div className="flex flex-col gap-6">
              <div className="inline-block w-8 h-1 bg-blue-600 rounded" />

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                Yönetme{' '}
                <span className="text-blue-600">ve Depolama</span>
              </h1>

              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg leading-relaxed">
                Önceden tanımlanmış depo alanlarını ve kargo konteynerlerini
                merkezi bir platformdan kolayca yönetin. Birden fazla lokasyonu
                aynı anda takip edin, verilerinizi bulutta saklayın ve mevcut
                Excel tablolarınızı anında sisteme aktarın.
              </p>

              {/* Checkmark Items */}
              <div className="flex flex-col gap-3 mt-2">
                {checkmarkItems.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2
                      className="text-blue-600 shrink-0"
                      size={20}
                    />
                    <span className="text-gray-700 dark:text-gray-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-4">
                <Link
                  href="/depolama"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm shadow-blue-100"
                >
                  Uygulamaya Git
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right: Preview Mockup */}
            <div className="relative">
              {/* Glow background */}
              <div className="absolute -inset-4 bg-blue-50 rounded-3xl opacity-60 blur-2xl" />

              {/* Mock UI Card */}
              <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-3 flex-1 bg-gray-200 rounded-full h-5 max-w-48" />
                </div>

                {/* App layout */}
                <div className="flex h-64">
                  {/* Sidebar */}
                  <div className="w-36 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-3 flex flex-col gap-2 shrink-0">
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-1">
                      Alanlar
                    </div>
                    {['İstanbul', 'Ankara', 'İzmir'].map((city, i) => (
                      <div
                        key={city}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          i === 0
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            i === 0 ? 'bg-white' : 'bg-blue-500'
                          }`}
                        />
                        {city}
                      </div>
                    ))}
                    <div className="mt-auto">
                      <div className="w-full h-6 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 text-xs font-semibold">
                          + Alan Ekle
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
                    {/* Toolbar row */}
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                      <div className="h-6 w-16 bg-blue-100 rounded-lg" />
                      <div className="ml-auto h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-4 gap-1.5 px-1">
                      {['Kargo ID', 'Tür', 'Ağırlık', 'Durum'].map((col) => (
                        <div
                          key={col}
                          className="h-5 bg-gray-200 rounded text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 flex items-center px-1.5"
                        >
                          <span className="truncate text-[9px]">{col}</span>
                        </div>
                      ))}
                    </div>

                    {/* Table rows */}
                    {[
                      ['IST-001', 'Kutu', '12 kg', 'Aktif'],
                      ['IST-002', 'Palet', '85 kg', 'Beklemede'],
                      ['IST-003', 'Konteyner', '2.4 t', 'Aktif'],
                      ['IST-004', 'Kutu', '5 kg', 'Teslim'],
                    ].map((row, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-4 gap-1.5 px-1 py-1 rounded-lg ${
                          i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        {row.map((cell, j) => (
                          <div
                            key={j}
                            className={`text-[9px] font-medium truncate flex items-center ${
                              j === 3
                                ? cell === 'Aktif'
                                  ? 'text-blue-700'
                                  : cell === 'Beklemede'
                                  ? 'text-yellow-600'
                                  : 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {cell}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
              Neler Sunuyoruz?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-xl mx-auto">
              Depolama yönetimini kolaylaştıran üç temel özellik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4 hover:shadow-md hover:border-blue-200 transition-all duration-200"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="text-blue-600" size={22} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black text-blue-600">
                  {value}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Package className="text-white" size={28} />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Hemen Başlayın
          </h2>

          <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
            Depo alanlarınızı ve kargo konteynerlerinizi tek bir platformdan
            yönetmeye başlayın. Kurulum gerektirmez, hemen kullanıma hazır.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/depolama"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 dark:hover:bg-gray-800 text-blue-700 font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-800/20"
            >
              Uygulamaya Git
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/#features"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors"
            >
              Özelliği İncele
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main></AuthGuard>
  );
}
