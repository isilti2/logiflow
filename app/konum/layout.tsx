import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Canlı Konum Takibi — LogiFlow',
  description: 'Şoförlerinizin araç konumlarını gerçek zamanlı harita üzerinde takip edin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
