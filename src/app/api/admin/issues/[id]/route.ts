import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteIssue, updateIssue } from '@/lib/store';
import { ISSUE_STATUSES, type CommunityIssue, type IssueStatus } from '@/types';

export const dynamic = 'force-dynamic';

function revalidated() {
  revalidatePath('/help-desk');
  revalidatePath('/admin');
}

/**
 * PATCH /api/admin/issues/[id] — triage a report: move the status, write the
 * public progress note, and gate publication.
 */
export async function PATCH(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const patch: Partial<Omit<CommunityIssue, 'id' | 'created_at'>> = {};

    if (b.status !== undefined) {
      if (!ISSUE_STATUSES.includes(b.status as IssueStatus)) {
        return NextResponse.json({ success: false, error: `status must be one of ${ISSUE_STATUSES.join(' | ')}.` }, { status: 400 });
      }
      patch.status = b.status;
    }
    if (b.published !== undefined) patch.published = !!b.published;
    if (b.update_note !== undefined) patch.update_note = String(b.update_note ?? '').trim() || null;
    if (b.title !== undefined) patch.title = String(b.title).trim();
    if (b.ward !== undefined) patch.ward = String(b.ward).trim();

    if (!Object.keys(patch).length) {
      return NextResponse.json({ success: false, error: 'Nothing to update.' }, { status: 400 });
    }

    const ok = await updateIssue(context.params.id, patch);
    if (!ok) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
    revalidated();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

/** DELETE /api/admin/issues/[id] — remove a row (spam / duplicate reports). */
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  if (!isAdminRequest(request)) return unauthorized();
  const ok = await deleteIssue(params.id);
  if (!ok) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
  revalidated();
  return NextResponse.json({ success: true });
}