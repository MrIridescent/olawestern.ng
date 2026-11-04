import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { addAccomplishment, listAccomplishments } from '@/lib/store';
import type { AccomplishmentCategory } from '@/types';
import { badRequest, cleanImage, evidence, serverError, text } from '@/lib/cms';

export const dynamic = 'force-dynamic';

const CATEGORIES: AccomplishmentCategory[] = [
  'Infrastructure',
  'Youth & Sports',
  'Security',
  'Philanthropy',
  'Legislative',
];

/** GET /api/admin/record — full track-record ledger. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listAccomplishments() });
}

/** POST /api/admin/record — add a service-record entry (evidence link required). */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const title = text(b.title, 200);
    const description = text(b.description, 4000);
    if (!title || !description || !CATEGORIES.includes(b.category)) {
      return badRequest(`title, description and a valid category (${CATEGORIES.join(' | ')}) are required.`);
    }
    const image = b.image_url ? cleanImage(b.image_url) : null;
    if (b.image_url && !image) return badRequest('image_url must be a media-library path (/images/…) or a full http(s) link.');
    // Publish gate — the entry is live the moment it is created, so the report that
    // proves it arrives with it. See the note on `evidence` in lib/cms.ts.
    const src = evidence(b.verification_source_url);
    if (src.error) return badRequest(src.error);
    const rec = await addAccomplishment({
      title,
      category: b.category,
      ward_impact: text(b.ward_impact, 120) ?? 'Amuwo-Odofin Constituency I',
      description,
      image_url: image,
      verification_source_url: src.url,
    });
    revalidatePath('/impact');
    revalidatePath('/');
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    return serverError(err);
  }
}
