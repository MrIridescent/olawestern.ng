import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteAccomplishment, updateAccomplishment } from '@/lib/store';
import type { Accomplishment, AccomplishmentCategory } from '@/types';
import { badRequest, cleanImage, keepEvidence, notFound, serverError, text } from '@/lib/cms';

export const dynamic = 'force-dynamic';

const CATEGORIES: AccomplishmentCategory[] = [
  'Infrastructure',
  'Youth & Sports',
  'Security',
  'Philanthropy',
  'Legislative',
];

/**
 * PATCH /api/admin/record/[id] — correct a track-record entry.
 * The public page is the campaign's promise of an open ledger, so a wrong date
 * or ward is fixed in place rather than deleted and re-typed.
 */
export async function PATCH(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const patch: Partial<Accomplishment> = {};
    if (b.title !== undefined) {
      const title = text(b.title, 200);
      if (!title) return badRequest('A title is required.');
      patch.title = title;
    }
    if (b.description !== undefined) {
      const description = text(b.description, 4000);
      if (!description) return badRequest('The description cannot be emptied.');
      patch.description = description;
    }
    if (b.category !== undefined) {
      if (!CATEGORIES.includes(b.category)) return badRequest(`category must be one of: ${CATEGORIES.join(', ')}.`);
      patch.category = b.category;
    }
    if (b.ward_impact !== undefined) {
      const ward = text(b.ward_impact, 120);
      if (!ward) return badRequest('The ward or constituency covered is required.');
      patch.ward_impact = ward;
    }
    if (b.image_url !== undefined) {
      if (b.image_url === '' || b.image_url === null) patch.image_url = null;
      else {
        const img = cleanImage(b.image_url);
        if (!img) return badRequest('image_url must be a media-library path (/images/…) or a full http(s) link.');
        patch.image_url = img;
      }
    }
    if (b.verification_source_url !== undefined) {
      // A live claim may change which report proves it, but never how many.
      const keep = keepEvidence(b.verification_source_url);
      if (keep.error) return badRequest(keep.error);
      patch.verification_source_url = keep.url;
    }
    if (Object.keys(patch).length === 0) return badRequest('Nothing to update.');
        const ok = await updateAccomplishment(context.params.id, patch);
    if (!ok) return notFound('Track record entry');
    revalidatePath('/impact');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

/** DELETE /api/admin/record/[id] — remove a track-record entry. */
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
        const ok = await deleteAccomplishment(context.params.id);
    if (!ok) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
    revalidatePath('/impact');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}