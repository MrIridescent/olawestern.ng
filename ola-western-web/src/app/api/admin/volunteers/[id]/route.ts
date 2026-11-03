import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteVolunteer } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/volunteers/[id] — discard a spam or duplicate sign-up so the
 * ward team's inbox stays workable. The CSV export is the way to keep a copy
 * before deleting.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const ok = await deleteVolunteer(params.id);
    if (!ok) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
    revalidatePath('/admin');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
