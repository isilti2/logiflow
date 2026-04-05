import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plan & Fatura — LogiFlow',
  description: 'LogiFlow abonelik planlarınızı görüntüleyin ve yönetin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
