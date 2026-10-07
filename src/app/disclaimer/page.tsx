import React from 'react';
import type { Metadata } from 'next';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Financial Risk Disclaimer | Forex Administrator',
  description:
    'Risk disclosure regarding foreign exchange trading, leverage, economic calendar data latency, and market volatility.',
  alternates: { canonical: 'https://forexadministrator.vercel.app/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>IMPORTANT REGULATORY DISCLOSURE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Risk Disclaimer</h1>
        <p className="text-xs text-slate-400">Applicable to all platform visitors and users.</p>
      </div>

      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <ShieldAlert className="h-5 w-5" />
          <span>High-Risk Investment Warning: Leveraged Trading</span>
        </div>
        <p className="text-xs text-rose-200/90 leading-relaxed">
          Trading foreign exchange (Forex), contracts for difference (CFDs), spot precious metals, energy commodities,
          and cryptocurrencies on margin carries a high level of risk and may not be suitable for all investors. The high
          degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange or any
          other financial instrument, you should carefully consider your investment objectives, level of experience,
          and risk appetite. You could sustain a loss of some or all of your initial investment.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Informational Purpose Only</h2>
          <p>
            The economic calendar, event timestamps, forecasts, historical data, and research articles presented on
            Forex Administrator are provided solely for general informational and educational purposes. Nothing on this
            website constitutes an offer, solicitation, recommendation, or endorsement to buy or sell any currency,
            security, or derivative contract.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Data Latency and Feed Revisions</h2>
          <p>
            Macroeconomic data releases are subject to rapid revisions, transmission delays, reporting delays from
            originating government ministries, and unexpected technical disruptions. While Forex Administrator strives
            for high data fidelity and real-time accuracy, we do not warrant or guarantee that event times, consensus
            estimates, or actual published values are error-free or instantaneous. Traders should not base high-frequency
            execution decisions solely upon third-party web calendar displays.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Market Volatility Around High-Impact Events</h2>
          <p>
            During tier-one news events (such as US CPI, Non-Farm Payrolls, FOMC rate announcements, or ECB meetings),
            liquidity providers may dramatically widen spreads, and execution slippage may occur. Markets frequently
            whipsaw or behave counter-intuitively relative to consensus prints. Users bear 100% full and sole
            responsibility for any trade execution, capital allocation, or risk management strategy implemented.
          </p>
        </section>
      </div>
    </div>
  );
}
