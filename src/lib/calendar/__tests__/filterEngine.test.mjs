import test from 'node:test';
import assert from 'node:assert/strict';

// Import modules
import { computeInstrumentRelevance } from '../relevanceEngine.ts';
import { filterAndSortCalendarEvents, getLocalDateString } from '../filterEngine.ts';
import { normalizeFinnhubEvent } from '../syncService.ts';

const mockInstruments = [
  {
    id: 'XAU_USD',
    symbol: 'XAU/USD',
    displayName: 'Gold / US Dollar',
    category: 'Metals',
    baseCurrency: 'XAU',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'EUR_USD',
    symbol: 'EUR/USD',
    displayName: 'Euro / US Dollar',
    category: 'Forex',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'USD_JPY',
    symbol: 'USD/JPY',
    displayName: 'US Dollar / Japanese Yen',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockEvents = [
  {
    id: 'evt-cpi',
    externalKey: 'finnhub_us_cpi',
    eventSeriesKey: 'US_CPI',
    eventName: 'US CPI m/m',
    countryCode: 'US',
    currency: 'USD',
    impact: 'high',
    eventTimeUtc: new Date('2026-10-07T12:30:00Z'),
    isAllDay: false,
    actual: null,
    forecast: '0.3%',
    previous: '0.2%',
    unit: '%',
    source: 'BLS',
    rawData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSyncedAt: new Date(),
  },
  {
    id: 'evt-ecb',
    externalKey: 'finnhub_eu_ecb',
    eventSeriesKey: 'EU_ECB',
    eventName: 'ECB Rate Decision',
    countryCode: 'EU',
    currency: 'EUR',
    impact: 'high',
    eventTimeUtc: new Date('2026-10-07T11:45:00Z'),
    isAllDay: false,
    actual: '3.25%',
    forecast: '3.25%',
    previous: '3.50%',
    unit: '%',
    source: 'ECB',
    rawData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSyncedAt: new Date(),
  },
  {
    id: 'evt-boj',
    externalKey: 'finnhub_jp_boj',
    eventSeriesKey: 'JP_BOJ',
    eventName: 'BOJ Core CPI',
    countryCode: 'JP',
    currency: 'JPY',
    impact: 'medium',
    eventTimeUtc: new Date('2026-10-06T23:30:00Z'),
    isAllDay: false,
    actual: '1.8%',
    forecast: '1.9%',
    previous: '2.0%',
    unit: '%',
    source: 'BOJ',
    rawData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSyncedAt: new Date(),
  },
];

test('Edge Case: Zero selected instruments must return ALL events', () => {
  const result = filterAndSortCalendarEvents(
    mockEvents,
    {
      instruments: [], // Intentionally empty array
      impacts: [],
      dates: null,
      view: 'all',
      timeZone: 'UTC',
    },
    mockInstruments,
    new Date('2026-10-07T12:00:00Z')
  );
  assert.equal(result.enrichedEvents.length, 3, 'Zero selected instruments should display all 3 events');
});

test('Edge Case: Default XAU/USD includes USD macroeconomic events', () => {
  const result = filterAndSortCalendarEvents(
    mockEvents,
    {
      instruments: ['XAU_USD'],
      impacts: [],
      dates: null,
      view: 'all',
      timeZone: 'UTC',
    },
    mockInstruments,
    new Date('2026-10-07T12:00:00Z')
  );
  // XAU/USD should include US CPI, but not ECB or BOJ
  assert.equal(result.enrichedEvents.length, 1);
  assert.equal(result.enrichedEvents[0].id, 'evt-cpi');
});

test('Multi-Select Instruments: XAU/USD + EUR/USD matches either instrument', () => {
  const result = filterAndSortCalendarEvents(
    mockEvents,
    {
      instruments: ['XAU_USD', 'EUR_USD'],
      impacts: [],
      dates: null,
      view: 'all',
      timeZone: 'UTC',
    },
    mockInstruments,
    new Date('2026-10-07T12:00:00Z')
  );
  // US CPI matches both; ECB matches EUR/USD. JPY event is excluded.
  assert.equal(result.enrichedEvents.length, 2);
  const ids = result.enrichedEvents.map((e) => e.id);
  assert.ok(ids.includes('evt-cpi'));
  assert.ok(ids.includes('evt-ecb'));
  assert.ok(!ids.includes('evt-boj'));
});

test('Impact Filter: Selecting high impact excludes medium/low', () => {
  const result = filterAndSortCalendarEvents(
    mockEvents,
    {
      instruments: [],
      impacts: ['high'],
      dates: null,
      view: 'all',
      timeZone: 'UTC',
    },
    mockInstruments,
    new Date('2026-10-07T12:00:00Z')
  );
  assert.equal(result.enrichedEvents.length, 2);
  assert.ok(result.enrichedEvents.every((e) => e.impact === 'high'));
});

test('Date Filter: Range filter includes events strictly inside bounds', () => {
  const result = filterAndSortCalendarEvents(
    mockEvents,
    {
      instruments: [],
      impacts: [],
      dates: { mode: 'range', values: ['2026-10-07', '2026-10-07'] },
      view: 'all',
      timeZone: 'UTC',
    },
    mockInstruments,
    new Date('2026-10-07T12:00:00Z')
  );
  // Only the two Oct 7 events in UTC
  assert.equal(result.enrichedEvents.length, 2);
});

test('API Normalization: Finnhub raw event normalized with stable key', () => {
  const raw = {
    country: 'US',
    currency: 'USD',
    event: 'CPI m/m',
    impact: 'high',
    time: '2026-10-07 12:30:00',
    actual: 0.3,
    estimate: 0.3,
    prev: 0.2,
    unit: '%',
  };
  const normalized = normalizeFinnhubEvent(raw);
  assert.equal(normalized.countryCode, 'US');
  assert.equal(normalized.currency, 'USD');
  assert.equal(normalized.impact, 'high');
  assert.equal(normalized.actual, '0.3%');
  assert.ok(normalized.externalKey.startsWith('finnhub_US_USD_cpi_m_m_'));
});
