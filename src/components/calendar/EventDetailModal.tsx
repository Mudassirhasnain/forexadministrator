'use client';

import React, { useState } from 'react';
import { X, Bell, Info, Zap } from 'lucide-react';
import type { EnrichedEvent } from '@/lib/calendar/filterEngine';
import { getCountryMeta } from '@/lib/calendar/currencyMap';

interface EventDetailModalProps {
  event: EnrichedEvent;
  onClose: () => void;
  onOpenAlert: () => void;
  onSimulateActual?: (eventId: string, actual: string) => Promise<void>;
}

export function EventDetailModal({
  event,
  onClose,
  onOpenAlert,
  onSimulateActual,
}: EventDetailModalProps) {
  const country = getCountryMeta(event.countryCode || event.currency);
  const [simulating, setSimulating] = useState(false);
  const [mockInput, setMockInput] = useState('0.4%');

  const getWhyItMatters = (eventName: string, currency: string) => {
    const name = eventName.toLowerCase();
    if (name.includes('cpi')) {
      return `Primary gauge of consumer price inflation. Significant surprises alter interest-rate expectations, impacting bond yields and ${currency} valuation.`;
    }
    if (name.includes('fomc') || name.includes('fed') || name.includes('rate decision')) {
      return `Central bank benchmark policy decision. Directly shifts short-term borrowing costs, bank liquidity, and global FX carry trades.`;
    }
    if (name.includes('ism') || name.includes('pmi')) {
      return `Leading indicator of economic expansion versus contraction in private sector manufacturing and services.`;
    }
    if (name.includes('crude') || name.includes('oil') || name.includes('eia') || name.includes('opec')) {
      return `Key petroleum supply benchmark. Influences energy commodity prices, inflation expectations, and petro-currencies like CAD and NOK.`;
    }
    if (name.includes('employment') || name.includes('payrolls') || name.includes('jobs')) {
      return `Labor market conditions dictate wage pressure and consumer consumption capacity, a primary input into central bank policy.`;
    }
    return `Critical macroeconomic release providing institutional visibility into sovereign economic growth and monetary policy trajectories.`;
  };

  const handleTriggerRelease = async () => {
    if (!onSimulateActual) return;
    setSimulating(true);
    try {
      await onSimulateActual(event.id, mockInput);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{country.flagEmoji}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {event.currency} • {country.countryName}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                  event.impact === 'high'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : event.impact === 'medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}
              >
                {event.impact} IMPACT
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{event.eventName}</h2>
            <p className="text-xs text-slate-400">
              {event.localDateHeading} • {event.localTimeString}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
          <div className="text-center">
            <span className="text-[11px] font-medium text-slate-400 block uppercase">Actual</span>
            <span
              className={`text-lg font-bold tabular-nums block mt-0.5 ${
                event.actual ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              {event.actual || '—'}
            </span>
          </div>
          <div className="text-center border-x border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block uppercase">Forecast</span>
            <span className="text-lg font-bold tabular-nums text-slate-300 block mt-0.5">
              {event.forecast || '—'}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[11px] font-medium text-slate-400 block uppercase">Previous</span>
            <span className="text-lg font-bold tabular-nums text-slate-400 block mt-0.5">
              {event.previous || '—'}
            </span>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Info className="h-3.5 w-3.5 text-amber-400" />
            <span>Why It Matters</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {getWhyItMatters(event.eventName, event.currency)}
          </p>
        </div>

        {/* Affected Instruments */}
        {event.matchingInstruments && event.matchingInstruments.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300 block">Affected Instruments</span>
            <div className="flex flex-wrap gap-1.5">
              {event.matchingInstruments.map((sym) => (
                <span
                  key={sym}
                  className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-mono font-medium text-amber-300"
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source & Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <span>Source: {event.source || 'Official National Statistical Agency'}</span>
          <span className="font-mono">Series: {event.eventSeriesKey || 'MACRO'}</span>
        </div>

        {/* Release Simulation / Tester */}
        {!event.actual && onSimulateActual && (
          <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-300 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                Live Release Test Trigger
              </span>
              <span className="text-[10px] text-slate-400">Updates UI dynamically</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={mockInput}
                onChange={(e) => setMockInput(e.target.value)}
                placeholder="0.4%"
                className="h-8 w-24 rounded border border-slate-800 bg-slate-950 px-2 text-xs font-mono text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTriggerRelease}
                disabled={simulating}
                className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                {simulating ? 'Publishing...' : 'Simulate Release Now'}
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onOpenAlert}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:text-white transition-colors"
          >
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            <span>Set Reminder</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
