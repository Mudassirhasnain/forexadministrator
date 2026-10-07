'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Instrument } from '@/db/schema';
import type {
  EnrichedEvent,
  ImpactLevel,
  ViewMode,
  DateFilterConfig,
} from '@/lib/calendar/filterEngine';
import { InstrumentSelector } from './InstrumentSelector';
import { ImpactFilter } from './ImpactFilter';
import { DatePickerModal } from './DatePickerModal';
import { ViewModeSelector } from './ViewModeSelector';
import { EventRow } from './EventRow';
import { EventDetailModal } from './EventDetailModal';
import { EventAlertModal } from './EventAlertModal';
import { RotateCcw, Globe, Search, RefreshCw, AlertCircle } from 'lucide-react';

interface CalendarApiResponse {
  success: boolean;
  meta: {
    totalLoaded: number;
    filteredCount: number;
    counts: { high: number; medium: number; low: number; total: number };
    view: ViewMode;
    timeZone: string;
    isDemoMode: boolean;
    finnhubConfigured: boolean;
    lastSync: string | null;
  };
  instruments: Instrument[];
  events: EnrichedEvent[];
  groupedByDate: Record<string, { heading: string; isToday: boolean; events: EnrichedEvent[] }>;
}

export function CalendarContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Detect browser local timezone
  const [userTimeZone, setUserTimeZone] = useState<string>('UTC');

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setUserTimeZone(tz);
    } catch {
      setUserTimeZone('UTC');
    }
  }, []);

  // Filter States initialized from URL or defaults
  // Default filter: XAU_USD selected on initial load
  const initialInstrumentsParam = searchParams.get('instruments');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(() => {
    if (initialInstrumentsParam !== null) {
      return initialInstrumentsParam ? initialInstrumentsParam.split(',').filter(Boolean) : [];
    }
    return ['XAU_USD'];
  });

  const initialImpactParam = searchParams.get('impact');
  const [selectedImpacts, setSelectedImpacts] = useState<ImpactLevel[]>(() => {
    if (initialImpactParam) {
      return initialImpactParam.split(',').map((s) => s.toLowerCase()) as ImpactLevel[];
    }
    return [];
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const v = searchParams.get('view');
    if (v === 'previous' || v === 'today' || v === 'upcoming' || v === 'all') return v;
    return 'today';
  });

  const [dateFilter, setDateFilter] = useState<DateFilterConfig | null>(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const single = searchParams.get('date');
    const multi = searchParams.get('dates');

    if (from || to) {
      return { mode: 'range', values: [from || '', to || ''] };
    }
    if (single) {
      return { mode: 'single', values: [single] };
    }
    if (multi) {
      return { mode: 'multiple', values: multi.split(',') };
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CalendarApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals & Alerts
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EnrichedEvent | null>(null);
  const [selectedEventForAlert, setSelectedEventForAlert] = useState<EnrichedEvent | null>(null);
  const [userAlerts, setUserAlerts] = useState<Record<string, number>>({});

  // Synchronize URL with active filters
  const updateUrlParams = useCallback(
    (
      insts: string[],
      impacts: ImpactLevel[],
      view: ViewMode,
      dates: DateFilterConfig | null
    ) => {
      const params = new URLSearchParams();

      if (insts.length === 0) {
        params.set('instruments', '');
      } else if (insts.length === 1 && insts[0] === 'XAU_USD') {
        params.set('instruments', 'XAU_USD');
      } else {
        params.set('instruments', insts.join(','));
      }

      if (impacts.length > 0 && impacts.length < 3) {
        params.set('impact', impacts.join(','));
      }

      if (view !== 'today') {
        params.set('view', view);
      }

      if (dates && dates.values.length > 0) {
        if (dates.mode === 'range') {
          if (dates.values[0]) params.set('from', dates.values[0]);
          if (dates.values[1]) params.set('to', dates.values[1]);
        } else if (dates.mode === 'single') {
          params.set('date', dates.values[0]);
        } else if (dates.mode === 'multiple') {
          params.set('dates', dates.values.join(','));
        }
      }

      const queryString = params.toString();
      const newUrl = queryString ? `/?${queryString}` : '/';
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [router]
  );

  // Fetch Calendar Data
  const fetchCalendarData = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (selectedInstruments.length === 0) {
        params.set('instruments', '');
      } else {
        params.set('instruments', selectedInstruments.join(','));
      }

      if (selectedImpacts.length > 0) {
        params.set('impact', selectedImpacts.join(','));
      }

      params.set('view', viewMode);
      params.set('timeZone', userTimeZone);

      if (dateFilter && dateFilter.values.length > 0) {
        if (dateFilter.mode === 'range') {
          if (dateFilter.values[0]) params.set('from', dateFilter.values[0]);
          if (dateFilter.values[1]) params.set('to', dateFilter.values[1]);
        } else if (dateFilter.mode === 'single') {
          params.set('date', dateFilter.values[0]);
        } else if (dateFilter.mode === 'multiple') {
          params.set('dates', dateFilter.values.join(','));
        }
      }

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/calendar?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Calendar API returned HTTP ${res.status}`);
      }
      const json: CalendarApiResponse = await res.json();
      if (!json.success) {
        throw new Error('API failed to load economic releases');
      }

      setData(json);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch calendar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedInstruments, selectedImpacts, viewMode, dateFilter, searchQuery, userTimeZone]);

  // Initial and reactive load
  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Background polling for freshness (every 30s)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchCalendarData();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchCalendarData]);

  // Check and fire alerts
  useEffect(() => {
    if (!data?.events || Object.keys(userAlerts).length === 0) return;
    const now = Date.now();
    data.events.forEach((evt) => {
      const minutesBefore = userAlerts[evt.id];
      if (minutesBefore !== undefined && evt.eventTimeUtc) {
        const eventMs = new Date(evt.eventTimeUtc).getTime();
        const diffMinutes = Math.round((eventMs - now) / 60000);
        if (diffMinutes <= minutesBefore && diffMinutes >= minutesBefore - 1) {
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`Forex Administrator Alert: ${evt.eventName}`, {
              body: `${evt.currency} release scheduled in ${diffMinutes} minutes! Forecast: ${evt.forecast || '—'}`,
              icon: '/icon.svg',
            });
            setUserAlerts((prev) => {
              const copy = { ...prev };
              delete copy[evt.id];
              return copy;
            });
          }
        }
      }
    });
  }, [data?.events, userAlerts]);

  // Handlers for Filters
  const handleToggleInstrument = (id: string) => {
    let next: string[];
    if (selectedInstruments.includes(id)) {
      next = selectedInstruments.filter((item) => item !== id);
    } else {
      next = [...selectedInstruments, id];
    }
    setSelectedInstruments(next);
    updateUrlParams(next, selectedImpacts, viewMode, dateFilter);
  };

  const handleClearInstruments = () => {
    setSelectedInstruments([]);
    updateUrlParams([], selectedImpacts, viewMode, dateFilter);
  };

  const handleToggleImpact = (impact: ImpactLevel) => {
    let next: ImpactLevel[];
    if (selectedImpacts.includes(impact)) {
      next = selectedImpacts.filter((item) => item !== impact);
    } else {
      next = [...selectedImpacts, impact];
    }
    setSelectedImpacts(next);
    updateUrlParams(selectedInstruments, next, viewMode, dateFilter);
  };

  const handleSelectView = (view: ViewMode) => {
    setViewMode(view);
    updateUrlParams(selectedInstruments, selectedImpacts, view, dateFilter);
  };

  const handleApplyDateFilter = (cfg: DateFilterConfig | null) => {
    setDateFilter(cfg);
    updateUrlParams(selectedInstruments, selectedImpacts, viewMode, cfg);
  };

  const handleResetFilters = () => {
    setSelectedInstruments(['XAU_USD']);
    setSelectedImpacts([]);
    setDateFilter(null);
    setViewMode('today');
    setSearchQuery('');
    updateUrlParams(['XAU_USD'], [], 'today', null);
  };

  const handleSimulateActual = async (eventId: string, actual: string) => {
    try {
      const res = await fetch('/api/calendar/release-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, actualValue: actual }),
      });
      if (res.ok) {
        await fetchCalendarData();
        setSelectedEventForDetail(null);
      }
    } catch (err) {
      console.error('Failed to trigger actual update', err);
    }
  };

  const instrumentsList = data?.instruments || [];
  const groupedDates = data?.groupedByDate || {};
  const dateKeys = Object.keys(groupedDates);
  const totalEventsFound = data?.meta?.filteredCount ?? 0;

  return (
    <div className="w-full space-y-6">
      {/* Demo Mode / Finnhub Status Banner if needed */}
      {data?.meta?.isDemoMode && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Development Configuration:</strong> Finnhub API key is not configured in this environment. Showing database records.
            </span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-amber-400/80">
            FINNHUB_API_KEY required for live upstream ingest
          </span>
        </div>
      )}

      {/* FILTER CONTROL DECK */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-xl space-y-5 backdrop-blur-md">
        {/* 1. Instruments Selector Row */}
        <InstrumentSelector
          instruments={instrumentsList}
          selectedIds={selectedInstruments}
          onToggleInstrument={handleToggleInstrument}
          onClearInstruments={handleClearInstruments}
        />

        {/* Separator */}
        <div className="h-px bg-slate-800/80" />

        {/* 2. Impact & Date Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-wrap">
            <ImpactFilter
              selectedImpacts={selectedImpacts}
              onToggleImpact={handleToggleImpact}
              counts={data?.meta?.counts || { high: 0, medium: 0, low: 0 }}
            />
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <DatePickerModal
              currentFilter={dateFilter}
              onApply={handleApplyDateFilter}
            />
          </div>

          {/* Reset Filters Action */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-800/80" />

        {/* 3. View Mode Selector & Search / Timezone Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <ViewModeSelector currentView={viewMode} onSelectView={handleSelectView} />

          <div className="flex items-center gap-3">
            {/* Live Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search releases (CPI, FOMC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-48 sm:w-56 rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Timezone Indicator */}
            <div
              title={`Times displayed in your browser timezone: ${userTimeZone}`}
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg"
            >
              <Globe className="h-3 w-3 text-slate-400" />
              <span className="font-mono text-[11px] truncate max-w-[130px]">{userTimeZone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CALENDAR TABLE / LIST VIEW */}
      <div className="space-y-4">
        {/* Header summary */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Schedule ({totalEventsFound} releases)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Times in local timezone • Auto-refresh active
            </span>
            <button
              type="button"
              onClick={fetchCalendarData}
              title="Refresh tape now"
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && !data && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 animate-pulse">
            <div className="h-4 w-48 bg-slate-800 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-slate-900 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
            <p className="text-sm font-medium text-rose-300">{error}</p>
            <button
              type="button"
              onClick={fetchCalendarData}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Populated Groups */}
        {!loading && dateKeys.length > 0 && (
          <div className="space-y-6">
            {dateKeys.map((dateKey) => {
              const group = groupedDates[dateKey];
              return (
                <div
                  key={dateKey}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden shadow-sm"
                >
                  {/* Date Section Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {group.heading}
                      </span>
                      {group.isToday && (
                        <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase">
                          TODAY
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>

                  {/* Events in this day */}
                  <div className="divide-y divide-slate-800/40">
                    {group.events.map((evt) => (
                      <EventRow
                        key={evt.id}
                        event={evt}
                        onSelectEvent={(e) => setSelectedEventForDetail(e)}
                        onOpenAlert={(e) => setSelectedEventForAlert(e)}
                        hasAlertSet={Boolean(userAlerts[evt.id] !== undefined)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && dateKeys.length === 0 && !error && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
              <Search className="h-6 w-6 text-slate-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No economic events match your criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your active impact ratings, clearing date constraints, or resetting to default instrument view.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Default Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedEventForDetail && (
        <EventDetailModal
          event={selectedEventForDetail}
          onClose={() => setSelectedEventForDetail(null)}
          onOpenAlert={() => {
            const ev = selectedEventForDetail;
            setSelectedEventForDetail(null);
            setSelectedEventForAlert(ev);
          }}
          onSimulateActual={handleSimulateActual}
        />
      )}

      {selectedEventForAlert && (
        <EventAlertModal
          event={selectedEventForAlert}
          onClose={() => setSelectedEventForAlert(null)}
          existingMinutes={userAlerts[selectedEventForAlert.id]}
          onSaveAlert={(id, mins) => {
            setUserAlerts((prev) => ({ ...prev, [id]: mins }));
          }}
        />
      )}
    </div>
  );
}
