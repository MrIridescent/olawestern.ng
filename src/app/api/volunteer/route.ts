import { NextRequest, NextResponse } from 'next/server';
import { addVolunteer } from '@/lib/store';
import { pushLeadToWarRoom, sendWhatsAppWelcome } from '@/lib/whatsapp';
import { WARDS, type VolunteerPayload, type Ward } from '@/types';

const CONCERNS = [
  'Road Infrastructure',
  'Drainage & Flooding',
  'Market & SME Support',
  'Community Security',
  'Youth & Sports',
  'Street Lighting',
];

function validate(body: Partial<VolunteerPayload>): string | null {
  if (!body.fullName || body.fullName.trim().length < 2) return 'Full name is required.';
  const digits = (body.phoneNumber ?? '').replace(/[^0-9]/g, '');
  if (digits.length < 10 || digits.length > 15) return 'A valid phone number is required.';
  if (!WARDS.includes(body.wardLocation as Ward)) return 'Please select a valid ward.';
  if (!CONCERNS.includes(body.primaryConcern ?? '')) return 'Please select your primary concern.';
  if (body.consent !== true) return 'Data-processing consent is required (NDPA 2023).';
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Email address looks invalid.';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VolunteerPayload;
    const invalid = validate(body);
    if (invalid) {
      return NextResponse.json({ success: false, error: invalid }, { status: 400 });
    }

    const record = {
      full_name: body.fullName.trim(),
      phone_number: body.phoneNumber.trim(),
      email: body.email?.trim() ?? null,
      ward_location: body.wardLocation,
      address_street: body.addressStreet?.trim() ?? null,
      polling_unit_code: body.pollingUnitCode?.trim() ?? null,
      primary_concern: body.primaryConcern,
      status: 'pending_verification',
      // The consent checkbox is validated above, so this is the moment it was given.
      consent_at: new Date().toISOString(),
    };

    const result = await addVolunteer(record);
    if (result === 'duplicate') {
      return NextResponse.json(
        { success: false, error: 'This phone number is already registered. Contact your ward captain on WhatsApp.' },
        { status: 409 },
      );
    }

    // Fire-and-forget integrations: CRM sync + WhatsApp welcome.
    await Promise.allSettled([
      pushLeadToWarRoom(record),
      sendWhatsAppWelcome(record.full_name, record.phone_number),
    ]);

    return NextResponse.json({ success: true, message: 'Volunteer registered successfully!' });
  } catch (err) {
    console.error('Error in /api/volunteer:', err);
    // For production, we return a generic error message to avoid leaking implementation details.
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}