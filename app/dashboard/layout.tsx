import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — LogiFlow',
  description: 'Lojistik operasyonlarınıza genel bakış: optimizasyon, depo, araç ve şoför durumu.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
