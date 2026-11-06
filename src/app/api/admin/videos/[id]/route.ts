import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteVideo, updateVideo } from '@/lib/store';
import type { VideoItem } from '@/types';
import { badRequest, extractYoutubeId, isoDate, notFound, serverError, text } from '@/lib/cms';
import { revalidateMedia } from '@/lib/revalidate';
import { checkEmbeddable } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

/** PATCH /api/admin/videos/[id] — retitle, re-slot or unpublish an appearance. */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const patch: Partial<VideoItem> = {};
    if (b.youtube !== undefined || b.youtube_id !== undefined) {
      const id = extractYoutubeId(b.youtube ?? b.youtube_id);
      if (!id) return badRequest('That does not look like a YouTube video.');
      const check = await checkEmbeddable(id);
      if (!check.ok) return badRequest(check.error ?? 'That video could not be verified.');
      patch.youtube_id = id;
    }
    if (b.title !== undefined) {
      const title = text(b.title, 200);
      if (!title) return badRequest('A title is required.');
      patch.title = title;
    }
    if (b.outlet !== undefined) patch.outlet = text(b.outlet, 120);
    if (b.published_at !== undefined) patch.published_at = isoDate(b.published_at);
    if (b.featured !== undefined) patch.featured = !!b.featured;
    if (b.published !== undefined) patch.published = !!b.published;
    if (Object.keys(patch).length === 0) return badRequest('Nothing to update.');
    const ok = await updateVideo((await context.params).id, patch);
    if (!ok) return notFound('Video');
    revalidateMedia();
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

/** DELETE /api/admin/videos/[id] — remove an appearance from the library. */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const ok = await deleteVideo((await context.params).id);
    if (!ok) return notFound('Video');
    revalidateMedia();
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}