/**
 * GET /api/admin/health — the Live Desk integrity report.
 *
 * One admin-guarded read that answers "is what is live right now defensible?"
 * It computes from the same rows the public pages render, so the gauge in the
 * dock and the page a voter is looking at can never disagree.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { assess } from '@/lib/liveDesk/integrity';
import {
  getSettings, listAccomplishments, listFactChecks, listInquiries, listIssues,
  listMedia, listPress, listProfileFacts, listReferences, listSocials, listVideos, listVolunteers,
} from '@/lib/store';
import { serverError } from '@/lib/cms';
import { storageState } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const [media, videos, facts, record, press, references, issues, inquiries, volunteers, profile, socials, settings] =
      await Promise.all([
        listMedia(), listVideos(), listFactChecks(), listAccomplishments(), listPress(),
        listReferences(), listIssues(), listInquiries(), listVolunteers(), listProfileFacts(), listSocials(), getSettings(),
      ]);
    return NextResponse.json({
      success: true,
      data: assess({ media, videos, facts, record, press, references, issues, inquiries, volunteers, profile, socials, settings }),
      store: storageState(),
    });
  } catch (err) {
    return serverError(err);
  }
}
