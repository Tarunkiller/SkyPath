import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SupabaseProvider } from '../components/providers/SupabaseProvider';
import { Navbar } from '../components/layout/Navbar';
import { InstallBanner } from '../components/layout/InstallBanner';

export const metadata: Metadata = {
  title: 'SkyPath — Flight Booking',
  description: 'Search, book, and manage flights with real-time seat selection and offline support.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }, { rel: 'apple-touch-icon', url: '/icons/icon-192.png' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <SupabaseProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          <InstallBanner />
        </SupabaseProvider>
      </body>
    </html>
  );
}
