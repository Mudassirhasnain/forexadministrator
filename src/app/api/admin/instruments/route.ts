import { NextResponse } from 'next/server';
import { dbRepo } from '@/db';
import { verifyAdminToken } from '@/lib/auth/jwt';

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, isActive, sortOrder, displayName, category } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Instrument ID is required' }, { status: 400 });
    }

    const updated = await dbRepo.updateInstrument(id, {
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(displayName !== undefined && { displayName }),
      ...(category !== undefined && { category }),
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Instrument not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, instrument: updated });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Instrument update failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
