import Link from 'next/link';
import { FEATURES } from '@/lib/constants';

const FEATURE_ICONS = ['📦', '📊', '🗄️', '🔗'];

export default function HeroSection() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gray-950 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #60a5fa 1px, transparent 1px), linear-gradient(to bottom, #60a5fa 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Lojistik Optimizasyon Platformu
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              Yük Planlamanızı{' '}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Optimize Edin
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              LogiFlow ile 3D kargo optimizasyonu, depo yönetimi ve yük planı paylaşımını
              tek platformda yönetin. Saniyeler içinde optimal yerleşim planı oluşturun.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/depolama"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/30 text-sm"
              >
                Ücretsiz Başla
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/features/kargo-optimizasyon"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 font-medium px-7 py-3.5 rounded-xl transition-colors text-sm"
              >
                Demo İzle
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
              {['2.4M+ Analiz Edilen Yük', '%91 Ortalama Doluluk', '< 1sn Hesaplama'].map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Özellikler</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              LogiFlow ile neler yapabilirsiniz?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
              Güçlü özelliklerimiz sayesinde kargo yüklemesini yönetme şeklinizi değiştirin.
              Daha verimli operasyonlar, daha düşük maliyetler.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature, index) => (
              <Link
                key={feature.id}
                href={`/features/${feature.id}`}
                className="group flex flex-col gap-4 p-6 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-2xl transition-colors">
                  {FEATURE_ICONS[index]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors mb-2">
                    {feature.title}
                    {feature.titleHighlight && (
                      <span className="text-blue-600">{feature.titleHighlight}</span>
                    )}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                    {feature.description}
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 mt-auto">
                  İncele
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
