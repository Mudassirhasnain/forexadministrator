'use client';

import React from 'react';
import type { EnrichedEvent } from '@/lib/calendar/filterEngine';
import { Bell, Radio } from 'lucide-react';
import { MiniSparkline } from './MiniSparkline';
import { getCountryMeta } from '@/lib/calendar/currencyMap';

interface EventRowProps {
  event: EnrichedEvent;
  onSelectEvent: (event: EnrichedEvent) => void;
  onOpenAlert: (event: EnrichedEvent) => void;
  hasAlertSet?: boolean;
}

export function EventRow({ event, onSelectEvent, onOpenAlert, hasAlertSet }: EventRowProps) {
  const country = getCountryMeta(event.countryCode || event.currency);

  const getImpactBadge = () => {
    switch (event.impact) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            MED
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-500/15 border border-slate-500/30 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = () => {
    if (event.isAllDay) {
      return (
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
          ALL DAY
        </span>
      );
    }
    if (event.timeStatusBadge === 'live') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 animate-pulse">
          <Radio className="h-2.5 w-2.5" />
          LIVE
        </span>
      );
    }
    if (event.isReleased) {
      return (
        <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
          Released
        </span>
      );
    }
    if (event.timeDiffMinutes > 0 && event.timeDiffMinutes <= 120) {
      return (
        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-400">
          in {event.timeDiffMinutes}m
        </span>
      );
    }
    return null;
  };

  // Construct history points for sparkline if actual and previous are present
  const sparklineValues: string[] = [];
  if (event.previous) sparklineValues.push(event.previous);
  if (event.forecast) sparklineValues.push(event.forecast);
  if (event.actual) sparklineValues.push(event.actual);

  return (
    <div
      onClick={() => onSelectEvent(event)}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-950/40 p-3.5 hover:bg-slate-900/50 transition-colors cursor-pointer"
    >
      {/* Left side: Time, Currency, Impact, Title */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Time column */}
        <div className="w-16 sm:w-20 shrink-0 text-left">
          <span className="text-xs font-mono font-semibold text-slate-200 block">
            {event.localTimeString}
          </span>
          <div className="mt-0.5">{getStatusBadge()}</div>
        </div>

        {/* Currency & Flag */}
        <div className="flex items-center gap-1.5 shrink-0 w-16">
          <span className="text-base select-none">{country.flagEmoji}</span>
          <span className="text-xs font-mono font-bold text-slate-300">{event.currency}</span>
        </div>

        {/* Impact */}
        <div className="shrink-0 w-16 hidden md:block">{getImpactBadge()}</div>

        {/* Title */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white group-hover:text-amber-400 transition-colors truncate">
              {event.eventName}
            </span>
            <div className="md:hidden shrink-0">{getImpactBadge()}</div>
          </div>
          {event.matchingInstruments && event.matchingInstruments.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
              <span className="text-[10px] text-slate-400">Affects:</span>
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {event.matchingInstruments.slice(0, 3).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Numbers (Actual, Forecast, Previous), Sparkline, Alert */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 border-t sm:border-t-0 border-slate-800/40 pt-2 sm:pt-0">
        {/* Numbers Column */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 text-right font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block sm:hidden uppercase font-sans">Act</span>
            <span
              className={`font-bold tabular-nums block ${
                event.actual
                  ? 'text-amber-400 font-extrabold bg-amber-500/10 px-1 rounded'
                  : 'text-slate-400'
              }`}
            >
              {event.actual || '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block sm:hidden uppercase font-sans">Frc</span>
            <span className="tabular-nums text-slate-300 block">
              {event.forecast || '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block sm:hidden uppercase font-sans">Prv</span>
            <span className="tabular-nums text-slate-400 block">
              {event.previous || '—'}
            </span>
          </div>
        </div>

        {/* Mini Graph (Sparkline) */}
        <div className="hidden lg:block w-14 text-center">
          <MiniSparkline values={sparklineValues} />
        </div>

        {/* Alert Bell Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAlert(event);
          }}
          title="Set release notification"
          className={`p-1.5 rounded-md transition-colors ${
            hasAlertSet
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
