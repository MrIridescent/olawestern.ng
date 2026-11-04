import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deletePress, listPress, updatePress } from '@/lib/store';
import type { PressItem } from '@/types';
import { badRequest, cleanUrl, notFound, serverError, text } from '@/lib/cms';

export const dynamic = 'force-dynamic';

const SOURCES: PressItem['source'][] = ['campaign_hq', 'festaconline', 'partner_press'];

/**
 * PATCH /api/admin/press/[id] — correct or withdraw a release.
 * `publish: false` takes it off the public newsfeed but keeps the text, so a
 * typo found after publishing is a fix rather than a delete-and-retype.
 */
type RouteContext = { params: { id: string } };

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const patch: Partial<PressItem> = {};
    if (b.title !== undefined) {
      const title = text(b.title, 200);
      if (!title) return badRequest('A headline is required.');
      patch.title = title;
    }
    if (b.summary !== undefined) {
      const summary = text(b.summary, 400);
      if (!summary) return badRequest('A one-paragraph summary is required — it is what the newsfeed cards show.');
      patch.summary = summary;
    }
    if (b.body !== undefined) {
      const body = text(b.body, 20000);
      if (!body) return badRequest('The release cannot be emptied — withdraw it instead.');
      patch.body = body;
    }
    if (b.source !== undefined) {
      if (!SOURCES.includes(b.source)) return badRequest(`source must be one of: ${SOURCES.join(', ')}.`);
      patch.source = b.source;
    }
    if (b.pdf_url !== undefined) {
      patch.pdf_url = b.pdf_url === '' || b.pdf_url === null ? null : cleanUrl(b.pdf_url);
      if (b.pdf_url && !patch.pdf_url) return badRequest('pdf_url must be a full http(s) link.');
    }
    if (b.publish !== undefined) {
      if (b.publish) {
        const current = (await listPress()).find((p) => p.id === context.params.id);
        patch.published_at = current?.published_at ?? new Date().toISOString();
      } else {
        patch.published_at = null;
      }
    }
    if (Object.keys(patch).length === 0) return badRequest('Nothing to update.');
    const ok = await updatePress(context.params.id, patch);
    if (!ok) return notFound('Press release');
    revalidatePath('/news');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

/** DELETE /api/admin/press/[id] — remove a newsroom release. */
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const ok = await deletePress(params.id);
    if (!ok) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
    revalidatePath('/news');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}