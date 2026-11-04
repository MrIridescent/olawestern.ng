import { NextRequest, NextResponse } from 'next/server';
import { listMedia } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** GET /api/media — published photo library (public JSON feed). */
export async function GET(request: NextRequest) {
  const featured = request.nextUrl.searchParams.get('featured') === '1';
  const slot = request.nextUrl.searchParams.get('slot') ?? undefined;
  try {
    const data = await listMedia({ publishedOnly: true, featuredOnly: featured, slot });
    return NextResponse.json({ success: true, data, count: data.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
