import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import BrowserMockup from '@/components/ui/BrowserMockup';
import CheckmarkItem from '@/components/ui/CheckmarkItem';
import { FEATURES } from '@/lib/constants';
import Link from 'next/link';

const COLOR_SCHEMES: Array<'teal' | 'blue' | 'purple' | 'orange'> = [
  'teal',
  'blue',
  'purple',
  'orange',
];

export async function generateStaticParams() {
  return FEATURES.map((feature) => ({ slug: feature.id }));
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const featureIndex = FEATURES.findIndex((f) => f.id === slug);

  if (featureIndex === -1) {
    notFound();
  }

  const feature = FEATURES[featureIndex];
  const colorScheme = COLOR_SCHEMES[featureIndex];

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950 dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-10">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Anasayfa
            </Link>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {feature.title}
              {feature.titleHighlight}
            </span>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text Content */}
            <div className="flex flex-col gap-6">
              <div className="inline-block w-8 h-1 bg-blue-600 rounded" />

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                {feature.title}
                {feature.titleHighlight && (
                  <span className="text-blue-600">{feature.titleHighlight}</span>
                )}
              </h1>

              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg leading-relaxed">
                {feature.description}
              </p>

              {/* Features List */}
              <div className="flex flex-col gap-3 mt-2">
                {feature.features.map((item, index) => (
                  <CheckmarkItem key={index} text={item.text} />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-4">
                <Link
                  href="#demo"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm shadow-blue-100"
                >
                  Ücretsiz Dene
                </Link>
              </div>
            </div>

            {/* Right: Browser Mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-50 rounded-3xl opacity-50 blur-2xl" />
              <BrowserMockup
                label={feature.mockupLabel ?? 'LogiFlow'}
                colorScheme={colorScheme}
                className="relative"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Other Features */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Diğer Özellikler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.filter((f) => f.id !== slug).map((f, i) => {
              const originalIndex = FEATURES.findIndex((x) => x.id === f.id);
              const scheme = COLOR_SCHEMES[originalIndex];
              const accentMap: Record<string, string> = {
                teal: 'border-blue-200 hover:border-blue-500',
                blue: 'border-blue-200 hover:border-blue-400',
                purple: 'border-purple-200 hover:border-purple-400',
                orange: 'border-orange-200 hover:border-orange-400',
              };
              return (
                <Link
                  key={f.id}
                  href={`/features/${f.id}`}
                  className={`flex flex-col gap-2 p-5 bg-white rounded-2xl border ${accentMap[scheme]} hover:shadow-md transition-all duration-200`}
                >
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {f.title}
                    {f.titleHighlight && (
                      <span className="text-blue-600">{f.titleHighlight}</span>
                    )}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm line-clamp-2">{f.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
