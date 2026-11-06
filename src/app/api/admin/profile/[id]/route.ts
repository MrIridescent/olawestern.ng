import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteProfileFact } from '@/lib/store';
import { notFound, serverError } from '@/lib/cms';
import { revalidateCopy } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/** DELETE /api/admin/profile/[id] — retire a dossier row from the About page. */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const ok = await deleteProfileFact((await context.params).id);
    if (!ok) return notFound('Profile fact');
    revalidateCopy();
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}