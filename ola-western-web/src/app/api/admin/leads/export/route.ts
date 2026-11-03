import { NextRequest } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { listInquiries, listVolunteers } from '@/lib/store';

export const dynamic = 'force-dynamic';

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\r\n');
}

/** GET /api/admin/leads/export?type=volunteers|inquiries — CSV download. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  const type = request.nextUrl.searchParams.get('type') ?? 'volunteers';
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === 'inquiries') {
    const rows = await listInquiries();
    const csv = toCsv(
      ['Received', 'Name', 'Phone', 'Ward', 'Type', 'Message', 'Status'],
      rows.map((r) => [r.created_at, r.full_name, r.phone_number, r.ward, r.message_type, r.message_body, r.status]),
    );
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ola-inquiries-${stamp}.csv"`,
      },
    });
  }

  const rows = await listVolunteers();
  const csv = toCsv(
    ['Registered', 'Name', 'Phone', 'Email', 'Ward', 'Street', 'Polling Unit', 'Concern', 'Status', 'NDPA consent given'],
    rows.map((r) => [r.created_at, r.full_name, r.phone_number, r.email, r.ward_location, r.address_street, r.polling_unit_code, r.primary_concern, r.status, r.consent_at ?? '']),
  );
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ola-volunteers-${stamp}.csv"`,
    },
  });
}
