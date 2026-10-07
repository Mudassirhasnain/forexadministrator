import type { EconomicEvent, Instrument } from '@/db/schema';
import { computeInstrumentRelevance } from './relevanceEngine';

export type ImpactLevel = 'high' | 'medium' | 'low';
export type ViewMode = 'previous' | 'today' | 'upcoming' | 'all';

export interface DateFilterConfig {
  mode: 'single' | 'range' | 'multiple';
  values: string[]; // 'YYYY-MM-DD' formatted strings
}

export interface CalendarFilters {
  instruments: string[]; // array of instrument IDs e.g. ['XAU_USD']
  impacts: ImpactLevel[]; // array e.g. ['high', 'medium']
  dates?: DateFilterConfig | null;
  view: ViewMode;
  searchQuery?: string;
  timeZone?: string; // e.g. 'America/New_York' or 'Asia/Tokyo'
}

export interface EnrichedEvent extends EconomicEvent {
  localDateString: string; // 'YYYY-MM-DD' in user timezone
  localDateHeading: string; // e.g. 'Wednesday, October 7, 2026'
  localTimeString: string; // e.g. '08:30 AM' or 'All Day'
  isReleased: boolean;
  timeDiffMinutes: number; // positive = future, negative = past
  timeStatusBadge: 'released' | 'live' | 'upcoming' | 'allday';
  matchingInstruments: string[]; // symbols of matching selected instruments
}

// Format a UTC date into YYYY-MM-DD string in a specified timezone
export function getLocalDateString(date: Date, timeZone: string = 'UTC'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

// Format date into a human readable day heading e.g. "Wednesday, October 7, 2026"
export function getLocalDateHeading(date: Date, timeZone: string = 'UTC'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return date.toDateString();
  }
}

// Format local time e.g. "08:30 AM" or "All Day"
export function getLocalTimeString(date: Date | null, isAllDay: boolean, timeZone: string = 'UTC'): string {
  if (isAllDay || !date) {
    return 'All Day';
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return formatter.format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function enrichEvent(
  event: EconomicEvent,
  timeZone: string,
  now: Date = new Date(),
  allInstruments: Instrument[] = []
): EnrichedEvent {
  const eventDate = event.eventTimeUtc ? new Date(event.eventTimeUtc) : now;
  const localDateString = getLocalDateString(eventDate, timeZone);
  const localDateHeading = getLocalDateHeading(eventDate, timeZone);
  const localTimeString = getLocalTimeString(event.eventTimeUtc ? eventDate : null, event.isAllDay, timeZone);

  const diffMs = eventDate.getTime() - now.getTime();
  const timeDiffMinutes = Math.round(diffMs / 60000);
  const isReleased = Boolean(event.actual && event.actual.trim() !== '');

  let timeStatusBadge: EnrichedEvent['timeStatusBadge'] = 'upcoming';
  if (event.isAllDay) {
    timeStatusBadge = 'allday';
  } else if (isReleased) {
    // If released within the last 15 minutes, mark as live
    if (timeDiffMinutes >= -15 && timeDiffMinutes <= 15) {
      timeStatusBadge = 'live';
    } else {
      timeStatusBadge = 'released';
    }
  } else if (timeDiffMinutes <= 0) {
    // Scheduled time arrived but no actual value yet
    timeStatusBadge = 'live';
  } else {
    timeStatusBadge = 'upcoming';
  }

  // Find matching instruments
  const matchingInstruments = allInstruments
    .filter((inst) => computeInstrumentRelevance(inst, event).isRelevant)
    .map((inst) => inst.symbol);

  return {
    ...event,
    localDateString,
    localDateHeading,
    localTimeString,
    isReleased,
    timeDiffMinutes,
    timeStatusBadge,
    matchingInstruments,
  };
}

export function filterAndSortCalendarEvents(
  events: EconomicEvent[],
  filters: CalendarFilters,
  allInstruments: Instrument[],
  referenceNow: Date = new Date()
): {
  enrichedEvents: EnrichedEvent[];
  groupedByDate: Record<string, { heading: string; isToday: boolean; events: EnrichedEvent[] }>;
  counts: { high: number; medium: number; low: number; total: number };
} {
  const userTimeZone =
    filters.timeZone ||
    (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');

  const todayLocalDateString = getLocalDateString(referenceNow, userTimeZone);

  // Map instrument lookup for fast access
  const selectedInstrumentObjs =
    filters.instruments.length > 0
      ? allInstruments.filter(
          (inst) => filters.instruments.includes(inst.id) || filters.instruments.includes(inst.symbol)
        )
      : [];

  const counts = { high: 0, medium: 0, low: 0, total: 0 };

  // First enrich all events
  const allEnriched = events.map((evt) => enrichEvent(evt, userTimeZone, referenceNow, allInstruments));

  // Count distribution across all active instruments
  allEnriched.forEach((evt) => {
    // Check instrument match for count
    let matchesInstrument = true;
    if (selectedInstrumentObjs.length > 0) {
      matchesInstrument = selectedInstrumentObjs.some(
        (inst) => computeInstrumentRelevance(inst, evt).isRelevant
      );
    }

    if (matchesInstrument) {
      if (evt.impact === 'high') counts.high++;
      else if (evt.impact === 'medium') counts.medium++;
      else if (evt.impact === 'low') counts.low++;
      counts.total++;
    }
  });

  // Apply filters
  const filtered = allEnriched.filter((evt) => {
    // 1. INSTRUMENT FILTER
    // Rule: If zero instruments selected, SHOW ALL EVENTS (do NOT show nothing)
    if (selectedInstrumentObjs.length > 0) {
      const isRelevantToAny = selectedInstrumentObjs.some(
        (inst) => computeInstrumentRelevance(inst, evt).isRelevant
      );
      if (!isRelevantToAny) {
        return false;
      }
    }

    // 2. IMPACT FILTER
    // Rule: If no impact selected, interpret as ALL impact levels
    if (filters.impacts && filters.impacts.length > 0) {
      if (!filters.impacts.includes(evt.impact as ImpactLevel)) {
        return false;
      }
    }

    // 3. DATE FILTER
    // Rule: If no date filter active, do not restrict by date
    if (filters.dates && filters.dates.values.length > 0) {
      const { mode, values } = filters.dates;
      if (mode === 'single') {
        if (evt.localDateString !== values[0]) {
          return false;
        }
      } else if (mode === 'range') {
        const [from, to] = values;
        if (from && evt.localDateString < from) return false;
        if (to && evt.localDateString > to) return false;
      } else if (mode === 'multiple') {
        if (!values.includes(evt.localDateString)) {
          return false;
        }
      }
    }

    // 4. SEARCH QUERY FILTER
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const inTitle = evt.eventName.toLowerCase().includes(q);
      const inCurrency = evt.currency.toLowerCase().includes(q);
      const inCountry = evt.countryCode.toLowerCase().includes(q);
      if (!inTitle && !inCurrency && !inCountry) {
        return false;
      }
    }

    // 5. VIEW MODE FILTER
    const eventTime = evt.eventTimeUtc ? new Date(evt.eventTimeUtc).getTime() : referenceNow.getTime();
    const nowTime = referenceNow.getTime();

    if (filters.view === 'previous') {
      // Scheduled time has passed
      if (evt.isAllDay) {
        if (evt.localDateString >= todayLocalDateString) return false;
      } else {
        if (eventTime >= nowTime) return false;
      }
    } else if (filters.view === 'today') {
      // Local date for user is today
      if (evt.localDateString !== todayLocalDateString) {
        return false;
      }
    } else if (filters.view === 'upcoming') {
      // Scheduled in future
      if (evt.isAllDay) {
        if (evt.localDateString < todayLocalDateString) return false;
      } else {
        if (eventTime < nowTime) return false;
      }
    }
    // 'all' includes all events
    return true;
  });

  // Sort according to view mode
  filtered.sort((a, b) => {
    // All day events sort first on that date
    if (a.localDateString === b.localDateString) {
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
    }

    const timeA = a.eventTimeUtc ? new Date(a.eventTimeUtc).getTime() : 0;
    const timeB = b.eventTimeUtc ? new Date(b.eventTimeUtc).getTime() : 0;

    if (filters.view === 'previous') {
      // Newest past events first (descending)
      return timeB - timeA;
    } else {
      // Chronological (ascending)
      return timeA - timeB;
    }
  });

  // Group by user's local calendar date
  const groupedByDate: Record<string, { heading: string; isToday: boolean; events: EnrichedEvent[] }> = {};

  filtered.forEach((evt) => {
    const key = evt.localDateString;
    if (!groupedByDate[key]) {
      groupedByDate[key] = {
        heading: evt.localDateHeading,
        isToday: key === todayLocalDateString,
        events: [],
      };
    }
    groupedByDate[key].events.push(evt);
  });

  return {
    enrichedEvents: filtered,
    groupedByDate,
    counts,
  };
}
