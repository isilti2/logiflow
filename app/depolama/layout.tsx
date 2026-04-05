import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Depolama — LogiFlow',
  description: 'Depo alanlarınızı ve kargo stoğunuzu merkezi olarak yönetin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
