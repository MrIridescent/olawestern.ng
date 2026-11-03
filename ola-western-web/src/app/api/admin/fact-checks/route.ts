import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { addFactCheck, listFactChecks } from '@/lib/store';
import { badRequest, evidence, serverError, text } from '@/lib/cms';

export const dynamic = 'force-dynamic';

const VERDICTS = ['VERIFIED FACT', 'FALSE CLAIM', 'MISLEADING'] as const;

/** GET /api/admin/fact-checks — full ledger (auth required). */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listFactChecks() });
}

/** POST /api/admin/fact-checks — publish a new ruling (document link required). */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const claim = text(b.claim_summary, 300);
    const why = text(b.detailed_explanation, 8000);
    if (!claim || !why || !VERDICTS.includes(b.verdict)) {
      return badRequest('claim_summary, verdict and detailed_explanation are required.');
    }
    const doc = evidence(b.official_document_url);
    if (doc.error) return badRequest(doc.error);
    const rec = await addFactCheck({
      claim_summary: claim,
      verdict: b.verdict,
      detailed_explanation: why,
      official_document_url: doc.url,
      is_featured: !!b.is_featured,
    });
    revalidatePath('/truth-room');
    revalidatePath('/');
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    return serverError(err);
  }
}
