import { NextRequest, NextResponse } from 'next/server';
import { addInquiry } from '@/lib/store';

export const dynamic = 'force-dynamic';

const TYPES = ['Policy Inquiry', 'Rumor Verification', 'General Support', 'Office Hours Booking'] as const;

interface InquiryBody {
  fullName: string;
  phoneNumber: string;
  ward: string;
  messageType: (typeof TYPES)[number];
  messageBody: string;
}

/** POST /api/inquiry — "Ask Ola" submissions are stored for the media desk. */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InquiryBody;

    if (!body.fullName?.trim() || !body.phoneNumber?.trim() || !body.messageBody?.trim()) {
      return NextResponse.json({ success: false, error: 'Name, phone and message are required.' }, { status: 400 });
    }
    if (!TYPES.includes(body.messageType)) {
      return NextResponse.json({ success: false, error: 'Invalid message type.' }, { status: 400 });
    }
    const digits = body.phoneNumber.replace(/[^0-9]/g, '');
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ success: false, error: 'A valid phone number is required.' }, { status: 400 });
    }

    await addInquiry({
      full_name: body.fullName.trim(),
      phone_number: body.phoneNumber.trim(),
      ward: body.ward ?? '',
      message_type: body.messageType,
      message_body: body.messageBody.trim(),
    });

    return NextResponse.json({ success: true, message: 'Inquiry received by the media team.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
