import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Grid bg */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #60a5fa 1px, transparent 1px), linear-gradient(to bottom, #60a5fa 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative text-center max-w-md">
        <div className="w-20 h-20 bg-blue-600/10 border border-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-black text-blue-500">?</span>
        </div>

        <h1 className="text-7xl font-black text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-300 mb-3">Sayfa Bulunamadı</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Destek Al
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span className="text-white font-black text-xs">LF</span>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            Logi<span className="text-blue-400">Flow</span>
          </span>
        </div>
      </div>
    </div>
  );
}
