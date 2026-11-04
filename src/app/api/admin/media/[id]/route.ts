import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteMedia, listMedia, updateMedia } from '@/lib/store';
import type { MediaAsset } from '@/types';
import { badRequest, cleanSlot, cleanUrl, dim, notFound, orientation, serverError, text } from '@/lib/cms';
import { revalidateMedia } from '@/lib/revalidate';
import { purgeUpload } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

/** Delete a desk upload only when no library row still points at it. */
async function purgeIfUnused(src: string) {
  const rows = await listMedia();
  if (!rows.some((r) => r.src === src)) purgeUpload(src);
}

/**
 * PATCH /api/admin/media/[id] — edit one photo row.
 * Only known fields are copied, and each is validated, so a stray key in the
 * request body cannot reach the store.
 */
export async function PATCH(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const patch: Partial<MediaAsset> = {};
    if (b.src !== undefined) {
      const src = text(b.src, 400);
      if (!src || !(src.startsWith('/images/') || src.startsWith('http://') || src.startsWith('https://'))) {
        return badRequest('src must be a path under /images/ or a full http(s) URL.');
      }
      patch.src = src;
    }
    if (b.alt !== undefined) {
      const alt = text(b.alt, 240);
      if (!alt) return badRequest('alt text is required — screen readers and search both need it.');
      patch.alt = alt;
    }
    if (b.caption !== undefined) patch.caption = text(b.caption, 400);
    if (b.credit !== undefined) patch.credit = text(b.credit, 160);
    if (b.source_url !== undefined) patch.source_url = cleanUrl(b.source_url);
    if (b.width !== undefined) patch.width = dim(b.width);
    if (b.height !== undefined) patch.height = dim(b.height);
    if (b.orientation !== undefined) {
      const o = orientation(b.orientation);
      if (!o) return badRequest('orientation must be portrait, landscape or square.');
      patch.orientation = o;
    }
    if (b.slot !== undefined) {
      if (b.slot === '' || b.slot === null) patch.slot = null;
      else {
        const slot = cleanSlot(b.slot);
        if (!slot) return badRequest('Unknown image position.');
        patch.slot = slot;
      }
    }
    if (b.published !== undefined) patch.published = !!b.published;
    if (b.featured !== undefined) patch.featured = !!b.featured;
    if (Object.keys(patch).length === 0) return badRequest('Nothing to update.');
    const previous = patch.src ? (await listMedia()).find((m) => m.id === context.params.id) : null;
    const ok = await updateMedia(context.params.id, patch);
    if (!ok) return notFound('Media');
    if (previous && patch.src && previous.src !== patch.src) await purgeIfUnused(previous.src);
    revalidateMedia();
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

/**
 * DELETE /api/admin/media/[id] — remove a photo from the library.
 * The file a desk upload pointed at is cleaned up too, so repeated
 * upload-and-discard does not leave the repository full of orphan photos.
 */
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const target = (await listMedia()).find((m) => m.id === context.params.id);
    const ok = await deleteMedia(context.params.id);
    if (!ok) return notFound('Media');
    if (target?.src) await purgeIfUnused(target.src);
    revalidateMedia();
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}