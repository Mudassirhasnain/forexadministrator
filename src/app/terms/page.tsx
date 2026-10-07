import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Forex Administrator',
  description: 'Terms and conditions governing the use of Forex Administrator economic calendar platform.',
  alternates: { canonical: 'https://forexadministrator.vercel.app/terms' },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400">Effective Date: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Informational Service Only</h2>
          <p>
            Forex Administrator provides macroeconomic calendar schedules, consensus forecasts, historical revisions,
            and research analysis. The information provided is for analytical and informational purposes only and does
            not constitute financial, investment, legal, or tax advice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Acceptable Use and Rate Limits</h2>
          <p>
            Users agree not to scrape, flood, or execute automated denial-of-service scripts against Forex Administrator
            APIs. Excessive requests may result in temporary or permanent IP throttling to preserve service stability
            for all active participants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Intellectual Property</h2>
          <p>
            The software architecture, user interface design, instrument relevance engines, and research articles
            published on Forex Administrator are protected by intellectual property laws. Third-party statistics remain
            the property of their respective originating agencies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Modifications and Termination</h2>
          <p>
            We reserve the right to upgrade, modify, or temporarily suspend aspects of the calendar feeds as required
            for systems maintenance or upstream provider updates.
          </p>
        </section>
      </div>
    </div>
  );
}
