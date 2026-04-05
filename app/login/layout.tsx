import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş Yap — LogiFlow',
  description: 'LogiFlow hesabınıza giriş yapın.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
