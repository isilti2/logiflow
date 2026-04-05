import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lojistik Muhasebe — LogiFlow',
  description: 'Sefer gelir/gider takibi, fatura yönetimi, müşteri cari hesap ve personel bordrolu tek sayfada.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
