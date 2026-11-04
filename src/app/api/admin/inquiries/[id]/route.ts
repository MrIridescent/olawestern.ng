import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteInquiry, updateInquiryStatus } from '@/lib/store';

export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'reviewed', 'answered'] as const;

/** PATCH /api/admin/inquiries/[id] — update triage status. */
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } },
): Promise<NextResponse> {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    if (!STATUSES.includes(b.status)) {
      return NextResponse.json({ success: false, error: 'status must be new | reviewed | answered.' }, { status: 400 });
    }
    const ok = await updateInquiryStatus(context.params.id, b.status);
    if (!ok) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
    revalidatePath('/admin');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/inquiries/[id] — discard a spam or duplicate "Ask Ola"
 * message. Deleting a real constituent question is the desk's judgement call,
 * which is why the dashboard asks for confirmation first.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } },
) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const ok = await deleteInquiry(params.id);
    if (!ok) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
    revalidatePath('/admin');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}