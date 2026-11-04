import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { listSocials, upsertSocial } from '@/lib/store';
import type { SocialRow } from '@/types';
import { badRequest, cleanHref, serverError, text } from '@/lib/cms';
import { revalidateCopy } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

const PLATFORMS: SocialRow['platform'][] = ['x', 'facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp'];

/** GET /api/admin/socials */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await listSocials() });
}

/**
 * PUT /api/admin/socials — add or correct a channel used in the footer,
 * the sticky mobile bar and the About page.
 */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const platform = String(b.platform ?? '') as SocialRow['platform'];
    if (!PLATFORMS.includes(platform)) return badRequest(`platform must be one of: ${PLATFORMS.join(', ')}.`);
    const handle = text(b.handle, 120);
    if (!handle) return badRequest('A handle or channel name is required.');
    const url = b.url === '' || b.url === null || b.url === undefined ? null : cleanHref(b.url);
    if (b.url && !url) return badRequest('Link must be a valid http(s) or mailto: address.');
    const row: SocialRow = {
      id: text(b.id, 60) ?? `soc-${platform}`,
      platform,
      label: text(b.label, 80) ?? handle,
      handle,
      url,
      sort: Number.isFinite(Number(b.sort)) ? Math.trunc(Number(b.sort)) : 0,
    };
    const rec = await upsertSocial(row);
    revalidateCopy();
    return NextResponse.json({ success: true, data: rec });
  } catch (err) {
    return serverError(err);
  }
}
