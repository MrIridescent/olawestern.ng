/**
 * admin.ts — real session authentication for the campaign CMS.
 *
 * Stateless signed cookie (HMAC-SHA256). Set ADMIN_PASSWORD in .env.local;
 * without it a clearly-warned local development password is used so the
 * dashboard is immediately usable on a pitch laptop.
 */
import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'ow_admin_session';
const TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export function adminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && pw.length >= 8) return pw;
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[admin] ADMIN_PASSWORD not set — using local development password "ola-admin-2026". Set ADMIN_PASSWORD (≥8 chars) before deploying.');
    return 'ola-admin-2026';
  }
  return '';
}

function secret(): string {
  return process.env.ADMIN_SECRET ?? adminPassword() ?? 'ola-western-cms-dev-secret';
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(req: NextRequest): boolean {
  return verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ success: false, error: 'Admin session required.' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
