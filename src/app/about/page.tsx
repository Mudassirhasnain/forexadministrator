import React from 'react';
import type { Metadata } from 'next';
import { Target, Layers, Cpu, Compass, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About the Platform | Institutional Market Intelligence',
  description:
    'Forex Administrator was engineered to eradicate calendar clutter and provide professional traders with deterministic macroeconomic event mapping.',
  alternates: {
    canonical: 'https://forexadministrator.vercel.app/about',
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <span>MISSION &amp; ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Why Modern Market Participants Rely on Forex Administrator
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          Traditional financial calendars were designed in the early 2000s as undifferentiated lists of hundreds
          of irrelevant global indicators. Forex Administrator re-engineers economic event awareness around the
          instruments you actually trade.
        </p>
      </div>

      {/* Grid of Key Advantages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Noise Reduction Through Deterministic Mapping</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            When you execute Gold (XAU/USD), you do not need 40 low-tier European balance of payments releases cluttering
            your screen. Our engine isolates exact US Treasury drivers, real-yield catalysts, and central bank bullion
            reserves, eliminating distraction right before volatility events.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Cross-Asset Energy &amp; Metals Relevance</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Commodities trade on distinct macroeconomic vectors. WTI and Brent Crude require immediate awareness of
            Wednesday EIA inventory changes and OPEC committee statements, while Silver responds to both industrial
            PMI surprises and monetary debasement expectations.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Sub-Second Execution Awareness</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Macro releases cause liquidity evaporation and spread widening in microseconds. Having synchronized,
            countdown-aware visibility empowers trading desks to manage margin, widen stop envelopes, and avoid toxic
            order fills during initial price discovery spikes.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Local Timezone Integrity</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            No more manual UTC timezone offsets or daylight saving time confusion. Every release timestamp is
            dynamically computed in your native browser locale, grouped by your genuine calendar day.
          </p>
        </div>
      </div>

      {/* Institutional Values */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 space-y-6">
        <h2 className="text-xl font-bold text-white">The Core Operating Standards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Zero Artificial Hype</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We provide clean statistical actuals, estimates, and revisions without clickbait sensationalism or
              unsubstantiated directional promises.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Trader-Centric UX</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              High information density without visual chaos. Dark-first financial aesthetics calibrated for long
              trading station sessions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Multi-Asset Depth</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Covers major foreign exchange pairs, precious metals bullion, global crude energy, and benchmark crypto
              assets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
