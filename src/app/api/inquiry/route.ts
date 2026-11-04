import { NextRequest, NextResponse } from 'next/server';
import { addInquiry } from '@/lib/store';

// Define the allowed message types for inquiries.
const TYPES = ['Policy Inquiry', 'Rumor Verification', 'General Support', 'Office Hours Booking'] as const;

/**
 * @typedef {object} InquiryBody
 * @property {string} fullName - The full name of the person making the inquiry.
 * @property {string} phoneNumber - The phone number of the person.
 * @property {string} ward - The ward the person belongs to.
 * @property {'Policy Inquiry' | 'Rumor Verification' | 'General Support' | 'Office Hours Booking'} messageType - The type of the message.
 * @property {string} messageBody - The body of the message.
 */
interface InquiryBody {
  fullName: string;
  phoneNumber: string;
  ward: string;
  messageType: (typeof TYPES)[number];
  messageBody: string;
}

/**
 * @summary POST /api/inquiry
 * @description Handles "Ask Ola" form submissions. It validates the incoming data,
 * and if valid, stores it for the media desk to review.
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {NextResponse} A Next.js response object with a success or error message.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InquiryBody;

    // Validate the request body.
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

    // Add the inquiry to the store.
    await addInquiry({
      full_name: body.fullName.trim(),
      phone_number: body.phoneNumber.trim(),
      ward: body.ward ?? '',
      message_type: body.messageType,
      message_body: body.messageBody.trim(),
    });

    return NextResponse.json({ success: true, message: 'Inquiry received by the media team.' });
  } catch (err) {
    console.error('Error in /api/inquiry:', err);
    // For production, we return a generic error message to avoid leaking implementation details.
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}