import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">Forex Administrator</span>
              <span className="text-xs text-slate-400">| Institutional Economic Calendar</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              High-velocity macroeconomic event monitoring and quantitative currency mapping engine for active traders.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
            <Link href="/" className="hover:text-slate-200 transition-colors">Calendar</Link>
            <Link href="/blog" className="hover:text-slate-200 transition-colors">Research Blog</Link>
            <Link href="/about" className="hover:text-slate-200 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-slate-200 transition-colors">Contact Desk</Link>
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-slate-200 transition-colors">Risk Disclaimer</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} Forex Administrator. All rights reserved.</p>
          <p className="text-slate-400">
            Market data powered by Finnhub Economic Calendar API. For informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
