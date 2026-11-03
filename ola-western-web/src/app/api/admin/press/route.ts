import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { addPress, listPress } from '@/lib/store';
import { badRequest, cleanUrl, serverError, text } from '@/lib/cms';

export const dynamic = 'force-dynamic';

const SOURCES = ['campaign_hq', 'festaconline', 'partner_press'] as const;

/** GET /api/admin/press */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listPress() });
}

/** POST /api/admin/press — publish a newsroom release. */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const title = text(b.title, 200);
    const body = text(b.body, 20000);
    if (!title || !body || !SOURCES.includes(b.source)) {
      return badRequest('title, body and a valid source are required.');
    }
    const pdf = b.pdf_url ? cleanUrl(b.pdf_url) : null;
    if (b.pdf_url && !pdf) return badRequest('pdf_url must be a full http(s) link.');
    const rec = await addPress({
      title,
      summary: text(b.summary, 400) ?? body.slice(0, 160),
      body,
      source: b.source,
      pdf_url: pdf,
      publish: b.publish !== false,
    });
    revalidatePath('/news');
    revalidatePath('/');
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    return serverError(err);
  }
}
