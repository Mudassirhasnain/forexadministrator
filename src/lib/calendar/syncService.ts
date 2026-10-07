import { dbRepo } from '@/db';
import { finnhubClient } from '@/lib/finnhub/client';
import { getCurrencyForCountry } from './currencyMap';
import type { EconomicEvent } from '@/db/schema';
import type { FinnhubEconomicEventRaw } from '@/lib/finnhub/types';

export function normalizeFinnhubEvent(
  raw: FinnhubEconomicEventRaw
): Omit<EconomicEvent, 'createdAt' | 'updatedAt' | 'lastSyncedAt'> {
  const country = (raw.country || 'US').toUpperCase();
  const currency = raw.currency ? raw.currency.toUpperCase() : getCurrencyForCountry(country);
  const eventName = raw.event || 'Economic Release';

  // Construct stable external key
  const timeClean = (raw.time || '').replace(/[^0-9]/g, '');
  const slugEvent = eventName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
  const externalKey = `finnhub_${country}_${currency}_${slugEvent}_${timeClean}`;
  const seriesKey = `${country}_${slugEvent.toUpperCase()}`;

  // Parse time
  let eventTimeUtc: Date | null = null;
  let isAllDay = false;

  if (raw.time) {
    const parsed = new Date(raw.time);
    if (!isNaN(parsed.getTime())) {
      eventTimeUtc = parsed;
      // If time string doesn't specify hours or has length <= 10
      if (raw.time.length <= 10) {
        isAllDay = true;
      }
    }
  }

  // Normalize impact
  let impact: 'high' | 'medium' | 'low' = 'low';
  const rawImpact = (raw.impact || '').toLowerCase();
  if (rawImpact.includes('high') || rawImpact === '3') impact = 'high';
  else if (rawImpact.includes('med') || rawImpact === '2') impact = 'medium';

  const unit = raw.unit || '';
  const actualStr = raw.actual !== null && raw.actual !== undefined ? `${raw.actual}${unit}` : null;
  const forecastStr = raw.estimate !== null && raw.estimate !== undefined ? `${raw.estimate}${unit}` : null;
  const prevStr = raw.prev !== null && raw.prev !== undefined ? `${raw.prev}${unit}` : null;

  return {
    id: `evt-${externalKey}`,
    externalKey,
    eventSeriesKey: seriesKey,
    eventName,
    countryCode: country,
    currency,
    impact,
    eventTimeUtc,
    isAllDay,
    actual: actualStr,
    forecast: forecastStr,
    previous: prevStr,
    unit,
    source: 'Finnhub Market Data',
    rawData: raw,
  };
}

export async function syncFinnhubCalendar(
  from?: string,
  to?: string
): Promise<{
  success: boolean;
  upsertedCount: number;
  releasedCount: number;
  error?: string;
  isDemoMode?: boolean;
}> {
  // Check locking to prevent concurrency collisions
  const acquiredLock = await dbRepo.acquireSyncLock();
  if (!acquiredLock) {
    return {
      success: false,
      upsertedCount: 0,
      releasedCount: 0,
      error: 'Sync already in progress. Database lock active.',
    };
  }

  try {
    if (!finnhubClient.isConfigured()) {
      await dbRepo.releaseSyncLock(true);
      return {
        success: true,
        upsertedCount: 0,
        releasedCount: 0,
        isDemoMode: true,
      };
    }

    // Default window: yesterday to 7 days ahead
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    const defaultTo = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);
    const fromDate = from || defaultFrom;
    const toDate = to || defaultTo;

    const result = await finnhubClient.fetchEconomicCalendar(fromDate, toDate);

    if (result.error) {
      await dbRepo.releaseSyncLock(false, result.error);
      return {
        success: false,
        upsertedCount: 0,
        releasedCount: 0,
        error: result.error,
      };
    }

    let upsertedCount = 0;
    let releasedCount = 0;

    for (const raw of result.data) {
      const normalized = normalizeFinnhubEvent(raw);
      const res = await dbRepo.upsertEvent(normalized);
      upsertedCount++;
      if (res.updatedActual) {
        releasedCount++;
      }
    }

    await dbRepo.releaseSyncLock(true);
    return {
      success: true,
      upsertedCount,
      releasedCount,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown sync failure';
    await dbRepo.releaseSyncLock(false, errorMsg);
    return {
      success: false,
      upsertedCount: 0,
      releasedCount: 0,
      error: errorMsg,
    };
  }
}

// Update release actual value in PostgreSQL
export async function simulateReleaseUpdate(
  eventId: string,
  newActual: string
): Promise<EconomicEvent | null> {
  const existing = await dbRepo.getEventById(eventId);
  if (!existing) return null;

  const res = await dbRepo.upsertEvent({
    ...existing,
    actual: newActual,
  });
  return res.event;
}
