import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { listProfileFacts, upsertProfileFact } from '@/lib/store';
import type { ProfileFactRow } from '@/types';
import { badRequest, serverError, text } from '@/lib/cms';
import { revalidateCopy } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/** GET /api/admin/profile — the editable "By the numbers" dossier. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listProfileFacts() });
}

/**
 * PUT /api/admin/profile — create or correct one fact row.
 *
 * A row with an empty value is kept but unpublished: the About page only shows
 * what campaign HQ has confirmed in writing, so nothing speculative goes live.
 */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const key = text(b.key, 80);
    if (!key) return badRequest('A field name is required (e.g. "Profession").');
    const row: ProfileFactRow = {
      id: text(b.id, 60) ?? `pf-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      key,
      value: text(b.value, 200),
      note: text(b.note, 300),
      sort: Number.isFinite(Number(b.sort)) ? Math.trunc(Number(b.sort)) : 0,
    };
    const rec = await upsertProfileFact(row);
    revalidateCopy();
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    return serverError(err);
  }
}
