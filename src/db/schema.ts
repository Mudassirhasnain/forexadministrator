import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// 1. INSTRUMENTS
export const instruments = pgTable(
  'instruments',
  {
    id: text('id').primaryKey(), // e.g. 'XAU_USD' or slug
    symbol: text('symbol').notNull().unique(), // e.g. 'XAU/USD'
    displayName: text('display_name').notNull(), // e.g. 'Gold / US Dollar'
    category: text('category').notNull(), // 'Metals' | 'Forex' | 'Energy' | 'Crypto'
    baseCurrency: text('base_currency').notNull(), // 'XAU'
    quoteCurrency: text('quote_currency').notNull(), // 'USD'
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('instruments_category_idx').on(table.category),
    index('instruments_is_active_idx').on(table.isActive),
    index('instruments_sort_order_idx').on(table.sortOrder),
  ]
);

// 2. ECONOMIC EVENTS
export const economicEvents = pgTable(
  'economic_events',
  {
    id: text('id').primaryKey(),
    externalKey: text('external_key').notNull().unique(),
    eventSeriesKey: text('event_series_key'), // Groups recurring events e.g. 'US_CPI_MOM'
    eventName: text('event_name').notNull(),
    countryCode: text('country_code').notNull(), // 'US', 'EU', 'JP', etc.
    currency: text('currency').notNull(), // 'USD', 'EUR', 'JPY', etc.
    impact: text('impact').notNull(), // 'high' | 'medium' | 'low'
    eventTimeUtc: timestamp('event_time_utc', { withTimezone: true }), // null for all-day
    isAllDay: boolean('is_all_day').notNull().default(false),
    actual: text('actual'), // can be null before release
    forecast: text('forecast'),
    previous: text('previous'),
    unit: text('unit'), // '%', 'K', 'B', etc.
    source: text('source'), // 'Bureau of Labor Statistics', etc.
    rawData: jsonb('raw_data'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('economic_events_time_idx').on(table.eventTimeUtc),
    index('economic_events_currency_idx').on(table.currency),
    index('economic_events_impact_idx').on(table.impact),
    index('economic_events_series_idx').on(table.eventSeriesKey),
  ]
);

// 3. ECONOMIC EVENT UPDATES (Snapshot history for sparklines & audit)
export const economicEventUpdates = pgTable(
  'economic_event_updates',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => economicEvents.id, { onDelete: 'cascade' }),
    actual: text('actual'),
    forecast: text('forecast'),
    previous: text('previous'),
    observedAt: timestamp('observed_at', { withTimezone: true }).notNull().defaultNow(),
    sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }),
  },
  (table) => [
    index('event_updates_event_id_idx').on(table.eventId),
    index('event_updates_observed_at_idx').on(table.observedAt),
  ]
);

// 4. INSTRUMENT EVENT MAP (Deterministic many-to-many relationship)
export const instrumentEventMap = pgTable(
  'instrument_event_map',
  {
    id: text('id').primaryKey(),
    instrumentId: text('instrument_id')
      .notNull()
      .references(() => instruments.id, { onDelete: 'cascade' }),
    economicEventId: text('economic_event_id')
      .notNull()
      .references(() => economicEvents.id, { onDelete: 'cascade' }),
    relevanceScore: integer('relevance_score').notNull().default(100), // 1-100
    relevanceReason: text('relevance_reason').notNull(), // e.g. 'Primary quote currency USD release'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('inst_event_pair_idx').on(table.instrumentId, table.economicEventId),
    index('inst_event_instrument_idx').on(table.instrumentId),
    index('inst_event_event_idx').on(table.economicEventId),
  ]
);

// 5. SYNC STATE (Locks and tracking external provider synchronization)
export const syncState = pgTable('sync_state', {
  provider: text('provider').primaryKey(), // 'finnhub'
  lastSuccessfulSync: timestamp('last_successful_sync', { withTimezone: true }),
  lastAttemptedSync: timestamp('last_attempted_sync', { withTimezone: true }),
  lastError: text('last_error'),
  lastEventRefresh: timestamp('last_event_refresh', { withTimezone: true }),
  isLocked: boolean('is_locked').notNull().default(false),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 6. BLOG POSTS
export const blogPosts = pgTable(
  'blog_posts',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt').notNull(),
    contentMarkdown: text('content_markdown').notNull(),
    coverImageUrl: text('cover_image_url').notNull(),
    authorName: text('author_name').notNull().default('Forex Administrator Research'),
    status: text('status').notNull().default('draft'), // 'published' | 'draft'
    publishedAt: timestamp('published_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('blog_posts_slug_idx').on(table.slug),
    index('blog_posts_status_published_idx').on(table.status, table.publishedAt),
  ]
);

// 7. ADMIN USERS
export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 8. CONTACT MESSAGES
export const contactMessages = pgTable(
  'contact_messages',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    status: text('status').notNull().default('unread'), // 'unread' | 'read' | 'replied'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('contact_messages_created_idx').on(table.createdAt)]
);

export type Instrument = typeof instruments.$inferSelect;
export type NewInstrument = typeof instruments.$inferInsert;

export type EconomicEvent = typeof economicEvents.$inferSelect;
export type NewEconomicEvent = typeof economicEvents.$inferInsert;

export type EconomicEventUpdate = typeof economicEventUpdates.$inferSelect;
export type NewEconomicEventUpdate = typeof economicEventUpdates.$inferInsert;

export type InstrumentEventMap = typeof instrumentEventMap.$inferSelect;
export type NewInstrumentEventMap = typeof instrumentEventMap.$inferInsert;

export type SyncState = typeof syncState.$inferSelect;
export type NewSyncState = typeof syncState.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
