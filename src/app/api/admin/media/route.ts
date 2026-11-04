import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { addMedia, listMedia } from '@/lib/store';
import { badRequest, cleanSlot, cleanUrl, dim, orientation as toOrientation, serverError, text } from '@/lib/cms';
import { revalidateMedia } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/** GET /api/admin/media — full library, drafts included. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listMedia() });
}

/** POST /api/admin/media — file a photo (usually straight after /media/upload). */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const src = text(b.src, 400);
    const alt = text(b.alt, 240);
    const orientation = toOrientation(b.orientation);
    if (!src || !alt || !orientation) return badRequest('src, alt and a portrait/landscape/square orientation are required.');
    if (!(src.startsWith('/images/') || src.startsWith('https://') || src.startsWith('http://'))) {
      return badRequest('src must be a path under /images/ or a full http(s) URL.');
    }
    // An empty slot means "file it in the library, place it later"; a slot the
    // dashboard never offered means a typo, so it is refused rather than dropped.
    const wantsSlot = b.slot !== undefined && b.slot !== null && String(b.slot).trim() !== '';
    const slot = cleanSlot(b.slot);
    if (wantsSlot && !slot) {
      return badRequest(`Unknown image position "${String(b.slot).slice(0, 40)}". Pick one of the frames listed in the dashboard.`);
    }
    const rec = await addMedia({
      src,
      alt,
      caption: text(b.caption, 400),
      credit: text(b.credit, 160),
      source_url: cleanUrl(b.source_url),
      width: dim(b.width),
      height: dim(b.height),
      orientation,
      slot,
      published: b.published !== false,
      featured: !!b.featured,
    });
    revalidateMedia();
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    return serverError(err);
  }
}
