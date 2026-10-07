import { NextResponse } from 'next/server';
import { syncFinnhubCalendar } from '@/lib/calendar/syncService';

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error: CRON_SECRET is not configured.' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    const queryKey = url.searchParams.get('key');

    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` || queryKey === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const result = await syncFinnhubCalendar();
    return NextResponse.json({
      success: result.success,
      upsertedCount: result.upsertedCount,
      releasedCount: result.releasedCount,
      isDemoMode: result.isDemoMode,
      error: result.error,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Cron execution failure';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
