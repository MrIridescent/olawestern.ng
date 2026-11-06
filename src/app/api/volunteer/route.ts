import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Resend API key is not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { name, email, phone, address, ward, message } = body;

    if (!name || !email || !phone || !address || !ward) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailHtml = `
      <h1>New Volunteer Signup</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Ward:</strong> ${ward}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_TO!,
      subject: 'New Volunteer Signup - Ola Western Campaign',
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}