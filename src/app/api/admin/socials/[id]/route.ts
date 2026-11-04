import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteSocial } from '@/lib/store';
import { notFound, serverError } from '@/lib/cms';
import { revalidateCopy } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/** DELETE /api/admin/socials/[id] — take a channel off the site. */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const ok = await deleteSocial(params.id);
    if (!ok) return notFound('Social channel');
    revalidateCopy();
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
