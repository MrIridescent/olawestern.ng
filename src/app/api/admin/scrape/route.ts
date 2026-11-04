
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { WebFetch } from '@/lib/tools'; // Assuming WebFetch is available as a tool

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();

  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse(JSON.stringify({ success: false, error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const content = await WebFetch(url);
    return new NextResponse(JSON.stringify({ success: true, content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ success: false, error: 'Failed to fetch content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}