import { FEATURES } from '@/lib/constants';
import FeatureSection from './FeatureSection';

export default function FeaturesContainer() {
  return (
    <div>
      {FEATURES.map((feature, index) => (
        <FeatureSection key={feature.id} data={feature} index={index} />
      ))}
    </div>
  );
}
