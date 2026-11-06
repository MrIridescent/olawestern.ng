import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { deleteReference, updateReference } from '@/lib/store';
import type { ReferenceRow } from '@/types';
import { badRequest, cleanUrl, isoDate, notFound, serverError, text, year } from '@/lib/cms';
import { revalidateReferences } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/admin/references/[id] — correct a citation (same rules as POST). */
export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const patch: Partial<ReferenceRow> = {};
    if (b.url !== undefined) {
      const url = cleanUrl(b.url);
      if (!url) return badRequest('Link must be a valid http(s) address.');
      patch.url = url;
    }
    if (b.outlet !== undefined) {
      const outlet = text(b.outlet, 100);
      if (!outlet) return badRequest('Outlet cannot be blank.');
      patch.outlet = outlet;
    }
    if (b.headline !== undefined) {
      const headline = text(b.headline, 300);
      if (!headline) return badRequest('Headline cannot be blank.');
      patch.headline = headline;
    }
    if (b.date !== undefined) {
      const d = isoDate(b.date);
      if (d) { patch.date = d; patch.year = Number(d.slice(0, 4)); }
    }
    if (b.year !== undefined) { const y = year(b.year); if (y) patch.year = y; }
    if (Object.keys(patch).length === 0) return badRequest('Nothing to update.');
    const ok = await updateReference((await context.params).id, patch);
    if (!ok) return notFound('Reference');
    revalidateReferences();
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

/** DELETE /api/admin/references/[id] — withdraw a citation. */
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const ok = await deleteReference((await context.params).id);
    if (!ok) return notFound('Reference');
    revalidateReferences();
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}