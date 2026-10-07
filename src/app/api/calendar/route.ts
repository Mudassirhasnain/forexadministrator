import { NextResponse } from 'next/server';
import { dbRepo } from '@/db';
import { finnhubClient } from '@/lib/finnhub/client';
import {
  filterAndSortCalendarEvents,
  CalendarFilters,
  ImpactLevel,
  ViewMode,
} from '@/lib/calendar/filterEngine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse instruments filter: e.g. "XAU_USD,EUR_USD"
    const instrumentsParam = searchParams.get('instruments');
    const instruments = instrumentsParam
      ? instrumentsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : ['XAU_USD']; // Default is XAU_USD per requirements

    // Explicit empty instruments parameter check: "?instruments="
    const hasExplicitEmpty = searchParams.has('instruments') && searchParams.get('instruments') === '';
    const activeInstruments = hasExplicitEmpty ? [] : instruments;

    // Parse impact: e.g. "high,medium"
    const impactParam = searchParams.get('impact');
    const impacts = impactParam
      ? (impactParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) as ImpactLevel[])
      : [];

    // Parse view: "previous" | "today" | "upcoming" | "all"
    const view = (searchParams.get('view') || 'today') as ViewMode;

    // Parse dates filter
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const singleDate = searchParams.get('date');
    const multiDates = searchParams.get('dates');
    let dateFilter = null;

    if (from || to) {
      dateFilter = {
        mode: 'range' as const,
        values: [from || '', to || ''],
      };
    } else if (singleDate) {
      dateFilter = {
        mode: 'single' as const,
        values: [singleDate],
      };
    } else if (multiDates) {
      dateFilter = {
        mode: 'multiple' as const,
        values: multiDates.split(',').map((d) => d.trim()),
      };
    }

    const timeZone = searchParams.get('timeZone') || 'UTC';
    const searchQuery = searchParams.get('search') || '';

    const filterConfig: CalendarFilters = {
      instruments: activeInstruments,
      impacts,
      dates: dateFilter,
      view,
      searchQuery,
      timeZone,
    };

    // Fetch persistent data from PostgreSQL database via Drizzle ORM
    const [allEvents, allInstruments, syncState] = await Promise.all([
      dbRepo.getAllEvents(),
      dbRepo.getInstruments(),
      dbRepo.getSyncState(),
    ]);

    // Apply filtering and sorting
    const { enrichedEvents, groupedByDate, counts } = filterAndSortCalendarEvents(
      allEvents,
      filterConfig,
      allInstruments,
      new Date()
    );

    const isDemoMode = !finnhubClient.isConfigured();

    return NextResponse.json({
      success: true,
      meta: {
        totalLoaded: allEvents.length,
        filteredCount: enrichedEvents.length,
        counts,
        view,
        timeZone,
        isDemoMode,
        finnhubConfigured: finnhubClient.isConfigured(),
        lastSync: syncState.lastSuccessfulSync,
      },
      instruments: allInstruments,
      events: enrichedEvents,
      groupedByDate,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal calendar API failure';
    console.error('[API /calendar] Error:', errorMsg);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve economic calendar data.' },
      { status: 500 }
    );
  }
}
