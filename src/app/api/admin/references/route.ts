import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { addReference, listReferences } from '@/lib/store';
import { badRequest, cleanUrl, isoDate, serverError, text, year } from '@/lib/cms';
import { revalidateReferences } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/** GET /api/admin/references — the press ledger behind the Track Record page. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listReferences() });
}

/**
 * POST /api/admin/references — cite a published story.
 *
 * Only a real, linkable article belongs here. The headline is what the report
 * says, not a paraphrase, so the page stays a verifiable record.
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const url = cleanUrl(b.url);
    if (!url) return badRequest('A working http(s) link to the published story is required.');
    const outlet = text(b.outlet, 100);
    const headline = text(b.headline, 300);
    if (!outlet || !headline) return badRequest('Outlet and headline are both required.');
    const date = isoDate(b.date);
    const yr = year(b.year) ?? (date ? Number(date.slice(0, 4)) : null);
    if (!yr) return badRequest('A publication year (or a valid date) is required.');
    const rec = await addReference({ year: yr, date: date ?? String(yr), outlet, headline, url });
    revalidateReferences();
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    return serverError(err);
  }
}

/** PATCH lives at /api/admin/references/[id]. */
