import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { finnhubClient } from '@/lib/finnhub/client';
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL('https://forexadministrator.vercel.app'),
  title: {
    default: 'Forex Administrator | Institutional Economic Calendar for Traders',
    template: '%s | Forex Administrator',
  },
  description:
    'High-velocity economic calendar, multi-instrument macroeconomic event mapping, and real-time release updates built specifically for modern financial traders.',
  applicationName: 'Forex Administrator',
  keywords: [
    'economic calendar',
    'forex calendar',
    'XAUUSD economic calendar',
    'gold news',
    'CPI release',
    'FOMC schedule',
    'institutional forex calendar',
    'macroeconomic data',
  ],
  authors: [{ name: 'Forex Administrator Research Desk' }],
  creator: 'Forex Administrator',
  publisher: 'Forex Administrator',
  alternates: {
    canonical: 'https://forexadministrator.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://forexadministrator.vercel.app',
    title: 'Forex Administrator | Institutional Economic Calendar for Traders',
    description:
      'High-velocity economic calendar, multi-instrument macroeconomic event mapping, and real-time release updates built specifically for modern financial traders.',
    siteName: 'Forex Administrator',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'Forex Administrator Economic Calendar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forex Administrator | Institutional Economic Calendar for Traders',
    description:
      'High-velocity economic calendar, multi-instrument macroeconomic event mapping, and real-time release updates built specifically for modern financial traders.',
    images: ['/icon.svg'],
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemo = !finnhubClient.isConfigured();

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Forex Administrator',
    url: 'https://forexadministrator.vercel.app',
    logo: 'https://forexadministrator.vercel.app/icon.svg',
    description:
      'Institutional economic calendar, foreign exchange event mapping, and macroeconomic volatility intelligence platform for active financial market participants.',
    sameAs: ['https://forexadministrator.vercel.app'],
  };

  const webSiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Forex Administrator',
    url: 'https://forexadministrator.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://forexadministrator.vercel.app/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <script
          id="structured-data-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        <script
          id="structured-data-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteStructuredData) }}
        />
        <Navbar isDemoMode={isDemo} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
