import React, { Suspense } from 'react';
import { CalendarContainer } from '@/components/calendar/CalendarContainer';
import { Zap, ShieldCheck, Clock, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Editorial Trader Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>INSTITUTIONAL TAPE ENGINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
            Your economic calendar,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              built for traders.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Filter macroeconomic noise with surgical precision. Instant correlation mapping between
            global central bank releases, precious metals volatility, and foreign exchange order flow.
          </p>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Sub-Second Release Updates</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Deterministic Pair Relevance</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4 text-sky-400 shrink-0" />
              <span>Browser Timezone Sync</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <TrendingUp className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Historical Sparklines</span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />
      </section>

      {/* Main Interactive Calendar Section */}
      <section aria-label="Macroeconomic Calendar Tape">
        <Suspense
          fallback={
            <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 animate-pulse" />
          }
        >
          <CalendarContainer />
        </Suspense>
      </section>
    </div>
  );
}
