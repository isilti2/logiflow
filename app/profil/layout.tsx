import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hesabım — LogiFlow',
  description: 'Profil bilgilerinizi ve hesap ayarlarınızı yönetin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
