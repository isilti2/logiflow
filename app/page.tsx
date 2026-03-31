import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesContainer from '@/components/sections/FeaturesContainer';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesContainer />
    </main>
  );
}
