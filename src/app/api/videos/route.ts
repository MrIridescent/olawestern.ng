import { NextResponse } from 'next/server';
import { listVideos } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** GET /api/videos — published broadcast coverage (public JSON feed). */
export async function GET() {
  try {
    const data = await listVideos({ publishedOnly: true });
    return NextResponse.json({ success: true, data, count: data.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
