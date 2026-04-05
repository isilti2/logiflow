import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ücretsiz Kayıt — LogiFlow',
  description: 'LogiFlow ile ücretsiz hesap oluşturun, 14 gün Pro denemesi başlasın.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
