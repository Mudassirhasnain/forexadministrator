import { NextResponse } from 'next/server';
import { syncFinnhubCalendar } from '@/lib/calendar/syncService';
import { verifyAdminToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    const session = verifyAdminToken(token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const from = body.from;
    const to = body.to;

    const result = await syncFinnhubCalendar(from, to);

    return NextResponse.json({
      success: result.success,
      upsertedCount: result.upsertedCount,
      releasedCount: result.releasedCount,
      isDemoMode: result.isDemoMode,
      error: result.error,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Sync execution error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
