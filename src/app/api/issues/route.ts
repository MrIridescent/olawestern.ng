import { NextRequest, NextResponse } from 'next/server';
import { addIssue, listPublicIssues } from '@/lib/store';
import { ISSUE_CATEGORIES, WARDS, type IssueCategory } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/issues — the published help-desk dashboard feed (reporter identity
 * is never included; only HQ-published rows are returned).
 */
export async function GET() {
  const issues = await listPublicIssues();
  return NextResponse.json({ success: true, data: issues, count: issues.length });
}

/**
 * POST /api/issues — a resident files a neighbourhood issue.
 * Stored with consent, held unpublished until the ward team verifies it.
 */
export async function POST(request: NextRequest) {
  try {
    const b = await request.json();

    const title = String(b.title ?? '').trim();
    const detail = String(b.detail ?? '').trim();
    const name = String(b.reporter_name ?? b.name ?? '').trim();
    const phone = String(b.reporter_phone ?? b.phone ?? '').trim();
    const digits = phone.replace(/[^0-9]/g, '');

    if (title.length < 8) {
      return NextResponse.json({ success: false, error: 'Describe the issue in a little more detail (at least 8 characters).' }, { status: 400 });
    }
    if (!ISSUE_CATEGORIES.includes(b.category as IssueCategory)) {
      return NextResponse.json({ success: false, error: `Pick a valid category: ${ISSUE_CATEGORIES.join(' | ')}.` }, { status: 400 });
    }
    if (!WARDS.includes(b.ward) && !String(b.ward ?? '').trim()) {
      return NextResponse.json({ success: false, error: 'Select your ward.' }, { status: 400 });
    }
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ success: false, error: 'A reachable phone number (WhatsApp) is required.' }, { status: 400 });
    }
    if (b.consent !== true) {
      return NextResponse.json({ success: false, error: 'Consent is required before the desk can act on your report (NDPA 2023).' }, { status: 400 });
    }
    if (title.length > 160 || detail.length > 2000) {
      return NextResponse.json({ success: false, error: 'Message too long — keep it under 160 characters for the title and 2,000 for the detail.' }, { status: 400 });
    }

    const rec = await addIssue({
      title,
      ward: String(b.ward).trim(),
      category: b.category as IssueCategory,
      detail: detail || null,
      reporter_name: name || null,
      reporter_phone: phone,
      consent: true,
    });

    return NextResponse.json({
      success: true,
      data: { id: rec.id, status: rec.status },
      message: 'Report received. Your ward team will verify it and publish the status here.',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
