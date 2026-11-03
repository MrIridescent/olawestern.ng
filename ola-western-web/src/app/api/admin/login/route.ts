import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminPassword, createSessionToken, isAdminRequest } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** POST /api/admin/login — real password auth, issues a signed session cookie. */
export async function POST(request: NextRequest) {
  const { password } = (await request.json().catch(() => ({ password: '' }))) as { password: string };
  const expected = adminPassword();
  if (!expected || password !== expected) {
    return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
  }
  const res = NextResponse.json({ success: true, message: 'Welcome back, campaign team.' });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}

/** DELETE /api/admin/login — logout. */
export async function DELETE(request: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

/** GET /api/admin/login — session probe used by the dashboard. */
export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, authenticated: isAdminRequest(request) });
}
