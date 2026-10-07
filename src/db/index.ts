import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import * as schema from './schema';

export const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
);

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim().length === 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'CRITICAL CONFIGURATION ERROR: DATABASE_URL environment variable is missing. Neon PostgreSQL connection required.'
      );
    }
    return '';
  }
  return url.trim();
}

// Initialized Neon HTTP client and Drizzle instance
const databaseUrl = process.env.DATABASE_URL?.trim() || '';

export const db = databaseUrl ? drizzle(neon(databaseUrl), { schema }) : null;

export function getDb() {
  if (!db) {
    throw new Error(
      'Database connection is not initialized. Please ensure DATABASE_URL is configured in your environment variables.'
    );
  }
  return db;
}

/**
 * Production-ready Drizzle ORM + Neon PostgreSQL Repository.
 * Replaces the obsolete in-memory repository completely.
 */
export class DrizzlePostgresRepository {
  // 1. INSTRUMENTS
  public async getInstruments(activeOnly = false): Promise<schema.Instrument[]> {
    if (!db) return [];
    if (activeOnly) {
      return db
        .select()
        .from(schema.instruments)
        .where(eq(schema.instruments.isActive, true))
        .orderBy(asc(schema.instruments.sortOrder));
    }
    return db
      .select()
      .from(schema.instruments)
      .orderBy(asc(schema.instruments.sortOrder));
  }

  public async updateInstrument(
    id: string,
    updates: Partial<schema.Instrument>
  ): Promise<schema.Instrument | null> {
    const client = getDb();
    const [updated] = await client
      .update(schema.instruments)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.instruments.id, id))
      .returning();
    return updated || null;
  }

  // 2. ECONOMIC EVENTS
  public async getAllEvents(): Promise<schema.EconomicEvent[]> {
    if (!db) return [];
    return db
      .select()
      .from(schema.economicEvents)
      .orderBy(desc(schema.economicEvents.eventTimeUtc));
  }

  public async getEventById(id: string): Promise<schema.EconomicEvent | null> {
    if (!db) return null;
    const [event] = await db
      .select()
      .from(schema.economicEvents)
      .where(eq(schema.economicEvents.id, id))
      .limit(1);
    return event || null;
  }

  public async getEventByExternalKey(externalKey: string): Promise<schema.EconomicEvent | null> {
    if (!db) return null;
    const [event] = await db
      .select()
      .from(schema.economicEvents)
      .where(eq(schema.economicEvents.externalKey, externalKey))
      .limit(1);
    return event || null;
  }

  public async getEventUpdates(eventId: string): Promise<schema.EconomicEventUpdate[]> {
    if (!db) return [];
    return db
      .select()
      .from(schema.economicEventUpdates)
      .where(eq(schema.economicEventUpdates.eventId, eventId))
      .orderBy(asc(schema.economicEventUpdates.observedAt));
  }

  /**
   * Idempotent upsert of economic event into PostgreSQL using Drizzle ORM.
   * If actual value changed, records an audit snapshot in economic_event_updates.
   */
  public async upsertEvent(
    data: Omit<schema.EconomicEvent, 'createdAt' | 'updatedAt' | 'lastSyncedAt'> & {
      lastSyncedAt?: Date;
    }
  ): Promise<{ event: schema.EconomicEvent; wasCreated: boolean; updatedActual: boolean }> {
    const client = getDb();
    const now = new Date();

    // Check existing for update detection
    const [existing] = await client
      .select()
      .from(schema.economicEvents)
      .where(eq(schema.economicEvents.externalKey, data.externalKey))
      .limit(1);

    let updatedActual = false;
    let resultEvent: schema.EconomicEvent;

    if (existing) {
      updatedActual = Boolean(
        data.actual &&
          data.actual.trim() !== '' &&
          (!existing.actual || existing.actual.trim() !== data.actual.trim())
      );

      const [updated] = await client
        .update(schema.economicEvents)
        .set({
          eventName: data.eventName,
          eventSeriesKey: data.eventSeriesKey,
          countryCode: data.countryCode,
          currency: data.currency,
          impact: data.impact,
          eventTimeUtc: data.eventTimeUtc,
          isAllDay: data.isAllDay,
          actual: data.actual,
          forecast: data.forecast,
          previous: data.previous,
          unit: data.unit,
          source: data.source,
          rawData: data.rawData,
          updatedAt: now,
          lastSyncedAt: now,
        })
        .where(eq(schema.economicEvents.id, existing.id))
        .returning();

      resultEvent = updated;

      if (updatedActual && data.actual) {
        await client.insert(schema.economicEventUpdates).values({
          id: `upd-${existing.id}-${Date.now()}`,
          eventId: existing.id,
          actual: data.actual,
          forecast: data.forecast,
          previous: data.previous,
          observedAt: now,
          sourceTimestamp: now,
        });
      }

      return { event: resultEvent, wasCreated: false, updatedActual };
    } else {
      const [inserted] = await client
        .insert(schema.economicEvents)
        .values({
          id: data.id,
          externalKey: data.externalKey,
          eventSeriesKey: data.eventSeriesKey,
          eventName: data.eventName,
          countryCode: data.countryCode,
          currency: data.currency,
          impact: data.impact,
          eventTimeUtc: data.eventTimeUtc,
          isAllDay: data.isAllDay,
          actual: data.actual,
          forecast: data.forecast,
          previous: data.previous,
          unit: data.unit,
          source: data.source,
          rawData: data.rawData,
          createdAt: now,
          updatedAt: now,
          lastSyncedAt: now,
        })
        .returning();

      resultEvent = inserted;

      if (data.actual) {
        await client.insert(schema.economicEventUpdates).values({
          id: `upd-${inserted.id}-${Date.now()}`,
          eventId: inserted.id,
          actual: data.actual,
          forecast: data.forecast,
          previous: data.previous,
          observedAt: now,
          sourceTimestamp: now,
        });
      }

      return { event: resultEvent, wasCreated: true, updatedActual: false };
    }
  }

  // 3. BLOG POSTS
  public async getBlogPosts(publishedOnly = true): Promise<schema.BlogPost[]> {
    if (!db) return [];
    if (publishedOnly) {
      return db
        .select()
        .from(schema.blogPosts)
        .where(eq(schema.blogPosts.status, 'published'))
        .orderBy(desc(schema.blogPosts.publishedAt), desc(schema.blogPosts.createdAt));
    }
    return db
      .select()
      .from(schema.blogPosts)
      .orderBy(desc(schema.blogPosts.createdAt));
  }

  public async getBlogPostBySlug(slug: string): Promise<schema.BlogPost | null> {
    if (!db) return null;
    const [post] = await db
      .select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, slug))
      .limit(1);
    return post || null;
  }

  public async saveBlogPost(
    postData: Partial<schema.BlogPost> & { title: string; slug: string }
  ): Promise<schema.BlogPost> {
    const client = getDb();
    const now = new Date();
    const id = postData.id || `blog-${Date.now()}`;

    const [existing] = await client
      .select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.id, id))
      .limit(1);

    if (existing) {
      const [updated] = await client
        .update(schema.blogPosts)
        .set({
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt || existing.excerpt,
          contentMarkdown: postData.contentMarkdown || existing.contentMarkdown,
          coverImageUrl: postData.coverImageUrl || existing.coverImageUrl,
          authorName: postData.authorName || existing.authorName,
          status: postData.status || existing.status,
          publishedAt:
            postData.status === 'published'
              ? existing.publishedAt || now
              : postData.status === 'draft'
              ? null
              : existing.publishedAt,
          seoTitle: postData.seoTitle || postData.title,
          seoDescription: postData.seoDescription || postData.excerpt || existing.seoDescription,
          updatedAt: now,
        })
        .where(eq(schema.blogPosts.id, id))
        .returning();
      return updated;
    } else {
      const [created] = await client
        .insert(schema.blogPosts)
        .values({
          id,
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt || '',
          contentMarkdown: postData.contentMarkdown || '',
          coverImageUrl: postData.coverImageUrl || '',
          authorName: postData.authorName || 'Forex Administrator Research',
          status: postData.status || 'draft',
          publishedAt: postData.status === 'published' ? postData.publishedAt || now : null,
          seoTitle: postData.seoTitle || postData.title,
          seoDescription: postData.seoDescription || postData.excerpt || '',
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return created;
    }
  }

  public async deleteBlogPost(id: string): Promise<boolean> {
    const client = getDb();
    const deleted = await client
      .delete(schema.blogPosts)
      .where(eq(schema.blogPosts.id, id))
      .returning();
    return deleted.length > 0;
  }

  // 4. CONTACT MESSAGES
  public async saveContactMessage(
    msg: Omit<schema.ContactMessage, 'id' | 'createdAt' | 'status'>
  ): Promise<schema.ContactMessage> {
    const client = getDb();
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const [inserted] = await client
      .insert(schema.contactMessages)
      .values({
        id,
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        message: msg.message,
        status: 'unread',
        createdAt: new Date(),
      })
      .returning();
    return inserted;
  }

  public async getContactMessages(): Promise<schema.ContactMessage[]> {
    if (!db) return [];
    return db
      .select()
      .from(schema.contactMessages)
      .orderBy(desc(schema.contactMessages.createdAt));
  }

  // 5. ADMIN USERS
  public async getAdminUserByEmail(email: string): Promise<schema.AdminUser | null> {
    if (!db) return null;
    const cleanEmail = email.toLowerCase().trim();
    const [admin] = await db
      .select()
      .from(schema.adminUsers)
      .where(eq(sql`lower(${schema.adminUsers.email})`, cleanEmail))
      .limit(1);
    return admin || null;
  }

  // 6. SYNC STATE & DISTRIBUTED LOCK
  public async getSyncState(): Promise<schema.SyncState> {
    if (!db) {
      return {
        provider: 'finnhub',
        lastSuccessfulSync: null,
        lastAttemptedSync: null,
        lastError: null,
        lastEventRefresh: new Date(),
        isLocked: false,
        lockedUntil: null,
        updatedAt: new Date(),
      };
    }
    const [state] = await db
      .select()
      .from(schema.syncState)
      .where(eq(schema.syncState.provider, 'finnhub'))
      .limit(1);

    if (state) {
      return state;
    }

    // Initialize provider state
    const now = new Date();
    const [initial] = await db
      .insert(schema.syncState)
      .values({
        provider: 'finnhub',
        lastSuccessfulSync: null,
        lastAttemptedSync: null,
        lastError: null,
        lastEventRefresh: now,
        isLocked: false,
        lockedUntil: null,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .returning();

    return (
      initial || {
        provider: 'finnhub',
        lastSuccessfulSync: null,
        lastAttemptedSync: null,
        lastError: null,
        lastEventRefresh: now,
        isLocked: false,
        lockedUntil: null,
        updatedAt: now,
      }
    );
  }

  public async acquireSyncLock(): Promise<boolean> {
    const client = getDb();
    const now = new Date();
    const lockExpires = new Date(now.getTime() + 60000); // 1-minute expiration

    // First ensure row exists
    await client
      .insert(schema.syncState)
      .values({
        provider: 'finnhub',
        lastSuccessfulSync: null,
        lastAttemptedSync: now,
        lastError: null,
        lastEventRefresh: now,
        isLocked: false,
        lockedUntil: null,
        updatedAt: now,
      })
      .onConflictDoNothing();

    // Atomic conditional update to acquire lock
    const [acquired] = await client
      .update(schema.syncState)
      .set({
        isLocked: true,
        lockedUntil: lockExpires,
        lastAttemptedSync: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.syncState.provider, 'finnhub'),
          sql`(${schema.syncState.isLocked} = false OR ${schema.syncState.lockedUntil} IS NULL OR ${schema.syncState.lockedUntil} < ${now})`
        )
      )
      .returning();

    return Boolean(acquired);
  }

  public async releaseSyncLock(success: boolean, error?: string): Promise<void> {
    if (!db) return;
    const now = new Date();
    await db
      .update(schema.syncState)
      .set({
        isLocked: false,
        lockedUntil: null,
        updatedAt: now,
        ...(success
          ? { lastSuccessfulSync: now, lastError: null }
          : { ...(error ? { lastError: error } : {}) }),
      })
      .where(eq(schema.syncState.provider, 'finnhub'));
  }
}

export const dbRepo = new DrizzlePostgresRepository();
