import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteFactCheck, updateFactCheck } from '@/lib/store';
import type { FactCheck, FactVerdict } from '@/types';
import { badRequest, keepEvidence, notFound, serverError, text } from '@/lib/cms';

export const dynamic = 'force-dynamic';

const VERDICTS: FactVerdict[] = ['VERIFIED FACT', 'FALSE CLAIM', 'MISLEADING'];

/**
 * PATCH /api/admin/fact-checks/[id]
 * Only the ledger's own fields are copied, each validated — a Truth Room ruling
 * is public evidence, so a stray key or a made-up verdict must not reach the row.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const patch: Partial<FactCheck> = {};
    if (b.claim_summary !== undefined) {
      const claim = text(b.claim_summary, 300);
      if (!claim) return badRequest('The claim summary cannot be empty.');
      patch.claim_summary = claim;
    }
    if (b.detailed_explanation !== undefined) {
      const why = text(b.detailed_explanation, 8000);
      if (!why) return badRequest('The explanation is the evidence — it cannot be empty.');
      patch.detailed_explanation = why;
    }
    if (b.verdict !== undefined) {
      if (!VERDICTS.includes(b.verdict)) return badRequest(`verdict must be one of: ${VERDICTS.join(' | ')}.`);
      patch.verdict = b.verdict;
    }
    if (b.official_document_url !== undefined) {
      // A ruling may cite a different document; it cannot cite none.
      const keep = keepEvidence(b.official_document_url);
      if (keep.error) return badRequest(keep.error);
      patch.official_document_url = keep.url;
    }
    if (b.is_featured !== undefined) patch.is_featured = !!b.is_featured;
    if (Object.keys(patch).length === 0) return badRequest('Nothing to update.');
    const ok = await updateFactCheck(params.id, patch);
    if (!ok) return notFound('Truth Room entry');
    revalidatePath('/truth-room');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

/** DELETE /api/admin/fact-checks/[id] */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const ok = await deleteFactCheck(params.id);
    if (!ok) return notFound('Truth Room entry');
    revalidatePath('/truth-room');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
