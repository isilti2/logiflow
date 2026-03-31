import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import { LanguageProvider } from '@/components/ui/LanguageProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LogiFlow — Lojistik Optimizasyon Platformu',
  description: '3D kargo optimizasyonu, depo yönetimi ve yük planı paylaşımını tek platformda yönetin.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          {children}
          <Footer />
          <ToastContainer />
        </LanguageProvider>
      </body>
    </html>
  );
}
