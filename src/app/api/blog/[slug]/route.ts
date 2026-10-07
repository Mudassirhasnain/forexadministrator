import { NextResponse } from 'next/server';
import { dbRepo } from '@/db';

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const { slug } = params;
    const post = await dbRepo.getBlogPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Error fetching article';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
