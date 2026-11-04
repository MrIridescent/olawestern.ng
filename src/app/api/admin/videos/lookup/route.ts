import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { extractYoutubeId, serverError } from '@/lib/cms';
import { checkEmbeddable, ytThumb } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/videos/lookup?u=<url or id>
 *
 * Lets the desk see what a link actually points to before it is published: the
 * real YouTube title, the channel that owns it and the poster frame. Nothing is
 * written to the store here.
 */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const raw = request.nextUrl.searchParams.get('u') ?? '';
    const id = extractYoutubeId(raw);
    if (!id) return NextResponse.json({ success: false, error: 'That is not a YouTube link or video id.' }, { status: 400 });
    const check = await checkEmbeddable(id);
    if (!check.ok) return NextResponse.json({ success: false, error: check.error }, { status: 422 });
    return NextResponse.json({
      success: true,
      data: { youtube_id: id, title: check.title ?? null, outlet: check.author ?? null, thumbnail: check.thumbnail ?? ytThumb(id) },
    });
  } catch (err) {
    return serverError(err);
  }
}
