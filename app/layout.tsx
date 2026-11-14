import type { Metadata, Viewport } from 'next';
import './globals.css';
import { HeaderTransparent } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EnquiryProvider } from '@/components/layout/EnquiryProvider';
import { SITE } from '@/lib/site';

// const DEFAULT_TITLE = 'Buy Flats, Villas, Plots & Commercial Spaces in Chennai & Bengaluru | One Million Sq.ft.';
const DEFAULT_TITLE = 'India Real Estate Buy Sell Rent Property Portal - One Million Sq.ft.';
const DESCRIPTION =
  'Discover premium properties for sale in Chennai and Bengaluru: flats & apartments, independent villas, residential plots and commercial spaces from trusted builders.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE.name}` },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
  },
};

/** The footer reads live data; keep otherwise-static pages (about, contact …) fresh to within 5 minutes. */
export const revalidate = 300;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <EnquiryProvider>
          <HeaderTransparent />
          <main className="flex-1">{children}</main>
          <Footer />
        </EnquiryProvider>
      </body>
    </html>
  );
}
