import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { addVideo, listVideos } from '@/lib/store';
import { badRequest, extractYoutubeId, isoDate, serverError, text } from '@/lib/cms';
import { revalidateMedia } from '@/lib/revalidate';
import { checkEmbeddable } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

/** GET /api/admin/videos — full list, drafts included. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listVideos() });
}

/**
 * POST /api/admin/videos — publish a campaign appearance.
 * `youtube` accepts a bare 11-character id or any watch / youtu.be / shorts URL.
 * Embeddability is confirmed with YouTube first so the site never renders a dead
 * player, and the returned metadata is kept only for the confirmation message.
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const youtubeId = extractYoutubeId(b.youtube ?? b.youtube_id);
    if (!youtubeId) return badRequest('A YouTube video id or link is required (e.g. a full watch URL).');
    const title = text(b.title, 200);
    if (!title) return badRequest('A title is required.');

    const check = await checkEmbeddable(youtubeId);
    if (!check.ok) return badRequest(check.error ?? 'That video could not be verified.');

    const rec = await addVideo({
      youtube_id: youtubeId,
      title,
      outlet: text(b.outlet, 120),
      published_at: isoDate(b.published_at),
      featured: !!b.featured,
      published: b.published !== false,
    });
    revalidateMedia();
    return NextResponse.json({ success: true, data: rec, note: check.author ? `Verified on YouTube as "${check.title}" by ${check.author}.` : 'Verified on YouTube.' });
  } catch (err) {
    return serverError(err);
  }
}
