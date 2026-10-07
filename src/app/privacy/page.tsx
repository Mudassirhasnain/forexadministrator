import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Forex Administrator',
  description: 'Privacy standards and client data governance policy for Forex Administrator.',
  alternates: { canonical: 'https://forexadministrator.vercel.app/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            Forex Administrator is designed to minimize personal data collection. When accessing the platform,
            we may automatically receive technical connection metadata such as IP address, browser type, and
            local timezone preferences required to format economic calendar event times in your geographic locale.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Local Storage and Browser Notifications</h2>
          <p>
            When you select preferred currency pairs, impact filters, or event reminders, these preferences are
            stored within your local browser storage. Notification permissions are requested only upon explicit user
            consent to alert you of impending releases and are processed client-side.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Third-Party Data Providers</h2>
          <p>
            Market and macroeconomic calendar data is ingested server-side from institutional data providers
            (including Finnhub). Your client browser communicates exclusively with our proxy APIs and does not directly
            transmit your client identity or queries to third-party data providers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Inquiries and Contact Data</h2>
          <p>
            If you voluntarily submit communications through our Contact Desk, your name, email, and message
            details are retained strictly to address your operational inquiry in our PostgreSQL database. We never sell, monetize, or license
            contact information to marketing aggregators.
          </p>
        </section>
      </div>
    </div>
  );
}
