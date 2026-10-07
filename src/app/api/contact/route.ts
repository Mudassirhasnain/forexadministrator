import { NextResponse } from 'next/server';
import { dbRepo } from '@/db';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Valid email address is required').max(150),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
  honeypot: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ success: false, error: 'Invalid JSON request payload' }, { status: 400 });
    }

    // Anti-spam honeypot
    if (json.honeypot && json.honeypot.trim() !== '') {
      return NextResponse.json({ success: true, message: 'Message submitted successfully' });
    }

    const parseResult = contactSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Validation failed',
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parseResult.data;
    const saved = await dbRepo.saveContactMessage({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: 'Thank you. Your message has been received by the Forex Administrator desk.',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Contact submission failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
