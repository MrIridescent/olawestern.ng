import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { getSettings, updateSettings } from '@/lib/store';
import type { SiteStat, SiteSettings } from '@/types';
import { badRequest, serverError, text } from '@/lib/cms';
import { revalidateCopy } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

const KEYS = ['hero_kicker', 'hero_title', 'hero_slogan', 'hero_body', 'cta_title', 'cta_body'] as const;
const MAXLEN: Record<(typeof KEYS)[number], number> = {
  hero_kicker: 90,
  hero_title: 80,
  hero_slogan: 90,
  hero_body: 600,
  cta_title: 90,
  cta_body: 600,
};

/** GET /api/admin/settings — the editable homepage copy. */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ success: true, data: await getSettings() });
}

/**
 * PATCH /api/admin/settings — change headline, slogan or the headline stats.
 *
 * Copy is the one thing a campaign needs to move fast on, so it is editable
 * without a redeploy — but every field keeps the wording honest: the numbers in
 * `stats` are the dossier's own figures, and the form refuses an empty title.
 */
export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const b = await request.json();
    const patch: Partial<SiteSettings> = {};
    for (const key of KEYS) {
      if (b[key] !== undefined) {
        const value = text(b[key], MAXLEN[key]);
        if (!value && key === 'hero_title') return badRequest('The headline cannot be empty.');
        (patch as Record<string, unknown>)[key] = value ?? '';
      }
    }
    if (b.stats !== undefined) {
      const rows = Array.isArray(b.stats) ? b.stats.slice(0, 6) : [];
      const stats: SiteStat[] = [];
      for (const s of rows) {
        const value = text(s?.value, 24);
        const label = text(s?.label, 90);
        if (value && label) stats.push({ value, label });
      }
      if (rows.length && stats.length === 0) return badRequest('Each stat needs both a value and a label.');
      patch.stats = stats;
    }
    if (Object.keys(patch).length === 0) return badRequest('Nothing to update.');
    const next = await updateSettings(patch);
    revalidateCopy();
    return NextResponse.json({ success: true, data: next });
  } catch (err) {
    return serverError(err);
  }
}
