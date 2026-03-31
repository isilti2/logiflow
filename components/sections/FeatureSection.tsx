import BrowserMockup from '../ui/BrowserMockup';
import FeatureCard from '../ui/FeatureCard';
import { FeatureSectionData } from '@/lib/types';

const colorSchemes = ['teal', 'blue', 'purple', 'orange'] as const;

interface FeatureSectionProps {
  data: FeatureSectionData;
  index: number;
}

export default function FeatureSection({ data, index }: FeatureSectionProps) {
  const isImageLeft = data.imageSide === 'left';
  const colorScheme = colorSchemes[index % colorSchemes.length];
  const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

  return (
    <section className={`py-16 md:py-24 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Mockup */}
          <div className={`relative ${isImageLeft ? 'md:order-1' : 'md:order-2'} order-1`}>
            <div className="absolute -inset-4 bg-gray-100 rounded-3xl opacity-50 blur-2xl" />
            <BrowserMockup
              label={data.mockupLabel}
              colorScheme={colorScheme}
              className="relative"
            />
          </div>

          {/* Feature Card */}
          <div className={`${isImageLeft ? 'md:order-2' : 'md:order-1'} order-2`}>
            <FeatureCard
              title={data.title}
              titleHighlight={data.titleHighlight}
              description={data.description}
              features={data.features}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
