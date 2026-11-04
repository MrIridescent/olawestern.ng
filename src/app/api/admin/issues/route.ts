import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { addIssue, listIssues } from '@/lib/store';
import { ISSUE_CATEGORIES, type IssueCategory } from '@/types';

export const dynamic = 'force-dynamic';

/** GET /api/admin/issues — every help-desk row, published or not, with reporter contacts. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listIssues() });
}

/** POST /api/admin/issues — the ward team logs an issue directly (published by default). */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const title = String(b.title ?? '').trim();
    if (title.length < 8 || !ISSUE_CATEGORIES.includes(b.category as IssueCategory)) {
      return NextResponse.json(
        { success: false, error: `title (8+ characters) and a valid category (${ISSUE_CATEGORIES.join(' | ')}) are required.` },
        { status: 400 },
      );
    }
    const rec = await addIssue({
      title,
      ward: String(b.ward ?? 'Amuwo-Odofin Constituency I').trim(),
      category: b.category as IssueCategory,
      detail: String(b.detail ?? '').trim() || null,
      consent: true,
      published: b.published !== false,
      status: b.status,
      update_note: String(b.update_note ?? '').trim() || null,
    });
    revalidatePath('/help-desk');
    revalidatePath('/admin');
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
