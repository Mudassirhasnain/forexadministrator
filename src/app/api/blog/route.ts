import { NextResponse } from 'next/server';
import { dbRepo } from '@/db';
import { verifyAdminToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(5),
  contentMarkdown: z.string().min(10),
  coverImageUrl: z.string().url().or(z.string().min(5)),
  authorName: z.string().default('Forex Administrator Research'),
  status: z.enum(['draft', 'published']),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('all') === 'true';

    // If requesting drafts, verify admin authorization
    if (includeDrafts) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '') || '';
      if (!verifyAdminToken(token)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const posts = await dbRepo.getBlogPosts(!includeDrafts);
    return NextResponse.json({ success: true, posts });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to retrieve blog posts';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 401 }
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid post payload' },
        { status: 400 }
      );
    }

    const saved = await dbRepo.saveBlogPost({
      ...parsed.data,
      title: parsed.data.title,
      slug: parsed.data.slug,
    });
    return NextResponse.json({ success: true, post: saved });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to save blog post';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
