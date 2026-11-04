import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { listInquiries, listVolunteers } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** GET /api/admin/leads — volunteer sign-ups + Ask-Ola inquiries. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  const [volunteers, inquiries] = await Promise.all([listVolunteers(), listInquiries()]);
  return NextResponse.json({ success: true, data: { volunteers, inquiries } });
}
