import { NextResponse } from 'next/server';
import { dbRepo, isDatabaseConfigured } from '@/db';
import { finnhubClient } from '@/lib/finnhub/client';
import { verifyAdminToken } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [events, instruments, syncState, messages, posts] = await Promise.all([
      dbRepo.getAllEvents(),
      dbRepo.getInstruments(),
      dbRepo.getSyncState(),
      dbRepo.getContactMessages(),
      dbRepo.getBlogPosts(false),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        databaseConfigured: isDatabaseConfigured,
        databaseProvider: isDatabaseConfigured
          ? 'Neon Serverless PostgreSQL (Drizzle ORM)'
          : 'Database Connection Pending',
        finnhubConfigured: finnhubClient.isConfigured(),
        finnhubRpmLimit: process.env.FINNHUB_RPM_LIMIT || '30',
        totalEvents: events.length,
        totalInstruments: instruments.length,
        activeInstruments: instruments.filter((i) => i.isActive).length,
        syncState,
        totalBlogPosts: posts.length,
        unreadMessages: messages.filter((m) => m.status === 'unread').length,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Status retrieval error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
