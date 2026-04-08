import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import { LanguageProvider } from '@/components/ui/LanguageProvider';
import ThemeProvider from '@/components/ui/ThemeProvider';

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
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-950 transition-colors duration-300`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Footer />
            <ToastContainer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
