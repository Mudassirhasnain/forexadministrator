import { NextResponse } from 'next/server';
import { dbRepo } from '@/db';
import { simulateReleaseUpdate } from '@/lib/calendar/syncService';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { eventId, actualValue } = body;

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ success: false, error: 'eventId is required' }, { status: 400 });
    }

    const updated = await simulateReleaseUpdate(eventId, actualValue || '0.4%');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const updates = await dbRepo.getEventUpdates(eventId);
    return NextResponse.json({
      success: true,
      event: updated,
      historyUpdates: updates,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Release update error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
