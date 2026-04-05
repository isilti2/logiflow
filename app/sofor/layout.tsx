import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Şoför Paneli — LogiFlow',
  description: 'GPS konum paylaşımı ve sefer yönetimi için şoför paneli.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
