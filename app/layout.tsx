import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import { LanguageProvider } from '@/components/ui/LanguageProvider';
import ThemeProvider from '@/components/ui/ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LogiFlow — Logistics Optimization Platform',
  description: 'Manage 3D cargo optimization, warehouse management and load plan sharing on one platform.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-950 transition-colors duration-300`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <LanguageProvider>
              {children}
              <Footer />
              <ToastContainer />
            </LanguageProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
