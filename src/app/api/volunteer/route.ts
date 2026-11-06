import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { addVolunteer } from '@/lib/store';
import { WARDS } from '@/types';

export const dynamic = 'force-dynamic';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The lead is always written to the campaign store first. Email is a
 * notification layer on top: if Resend is not configured, or the send fails,
 * the volunteer still reaches the team via the database/file store instead of
 * being lost behind a 500.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? '').trim();
    const email = String(body?.email ?? '').trim();
    const phone = String(body?.phone ?? '').trim();
    const address = String(body?.address ?? '').trim();
    const ward = String(body?.ward ?? '').trim();
    const message = String(body?.message ?? '').trim();

    if (!name || !email || !phone || !address || !ward) {
      return NextResponse.json({ success: false, error: 'Name, email, phone, address and ward are required.' }, { status: 400 });
    }

    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ success: false, error: 'Enter a valid phone number.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Enter a valid email address.' }, { status: 400 });
    }
    if (!WARDS.includes(ward as (typeof WARDS)[number])) {
      return NextResponse.json({ success: false, error: 'Choose one of the four constituency wards.' }, { status: 400 });
    }
    if (body.consent !== true) {
      return NextResponse.json(
        { success: false, error: 'Please agree to the campaign storing your details so the ward team can contact you.' },
        { status: 400 },
      );
    }

    let saved = true;
    try {
      const result = await addVolunteer({
        full_name: name,
        phone_number: phone,
        email,
        ward_location: ward,
        address_street: address,
        polling_unit_code: null,
        primary_concern: message || 'Volunteer signup',
        status: 'pending_verification',
        consent_at: new Date().toISOString(),
      });
      if (result === 'duplicate') saved = false;
    } catch (err) {
      // A store outage must not silently claim success.
      console.error('Volunteer persistence failed:', err);
      return NextResponse.json(
        { success: false, error: 'We could not save your details. Please try again, or message the campaign desk on WhatsApp.' },
        { status: 503 },
      );
    }

    // Best-effort notification. Never blocks the saved lead.
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.EMAIL_TO;
    const from = process.env.EMAIL_FROM;
    if (apiKey && to && from && !to.includes('example.com')) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from,
          to,
          subject: `New volunteer${saved ? '' : ' (already on file)'} — ${name.replace(/[\r\n]/g, ' ')}`,
          html: `
            <h1>New Volunteer Signup</h1>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Address:</strong> ${escapeHtml(address)}</p>
            <p><strong>Ward:</strong> ${escapeHtml(ward)}</p>
            <p><strong>Message:</strong> ${escapeHtml(message) || '—'}</p>
            <p><strong>Status:</strong> ${saved ? 'New lead saved' : 'Duplicate phone — already on file'}</p>
          `,
        });
      } catch (err) {
        console.error('Volunteer notification email failed (lead still saved):', err);
      }
    }

    return NextResponse.json({
      success: true,
      duplicate: !saved,
      message: saved
        ? 'You are on the volunteer list. The ward team will reach out.'
        : 'You are already on the volunteer list — no need to sign up twice.',
    });
  } catch (error) {
    console.error('Error in /api/volunteer:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
