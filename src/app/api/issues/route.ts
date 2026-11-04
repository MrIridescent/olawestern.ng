import { NextRequest, NextResponse } from 'next/server';
import { addIssue, listPublicIssues } from '@/lib/store';
import { ISSUE_CATEGORIES, WARDS, type IssueCategory } from '@/types';

/**
 * @summary GET /api/issues
 * @description Retrieves a list of all published help-desk issues.
 * This endpoint is for public consumption and powers the progress dashboard.
 * It never includes reporter identity.
 * @returns {NextResponse} A Next.js response object with the list of issues.
 */
export async function GET() {
  try {
    const issues = await listPublicIssues();
    return NextResponse.json({ success: true, data: issues, count: issues.length });
  } catch (err) {
    console.error('Error in GET /api/issues:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve issues.' }, { status: 500 });
  }
}

/**
 * @summary POST /api/issues
 * @description Handles the submission of a new neighborhood issue from a resident.
 * The issue is stored with consent and held for verification by the ward team before being published.
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {NextResponse} A Next.js response object with a success or error message.
 */
export async function POST(request: NextRequest) {
  try {
    const b = await request.json();

    // Sanitize and validate input fields
    const title = String(b.title ?? '').trim();
    const detail = String(b.detail ?? '').trim();
    const name = String(b.reporter_name ?? b.name ?? '').trim();
    const phone = String(b.reporter_phone ?? b.phone ?? '').trim();
    const digits = phone.replace(/[^0-9]/g, '');

    if (title.length < 8 || title.length > 160) {
      return NextResponse.json({ success: false, error: 'Please provide a title between 8 and 160 characters.' }, { status: 400 });
    }
    if (!ISSUE_CATEGORIES.includes(b.category as IssueCategory)) {
      return NextResponse.json({ success: false, error: 'Please select a valid category.' }, { status: 400 });
    }
    if (!WARDS.includes(b.ward)) {
      return NextResponse.json({ success: false, error: 'Please select a valid ward.' }, { status: 400 });
    }
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ success: false, error: 'A valid phone number is required for follow-up.' }, { status: 400 });
    }
    if (b.consent !== true) {
      return NextResponse.json({ success: false, error: 'You must consent to data storage for the team to act on your report.' }, { status: 400 });
    }
    if (detail.length > 2000) {
      return NextResponse.json({ success: false, error: 'The details field cannot exceed 2000 characters.' }, { status: 400 });
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
    console.error('Error in POST /api/issues:', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred during submission.' }, { status: 500 });
  }
}