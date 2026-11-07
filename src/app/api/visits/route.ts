/**
 * GET  /api/visits — the current aggregate count (polled by the homepage).
 * POST /api/visits — records one visitor, at most once per browser per day.
 *
 * The count is real and durable: Netlify Blobs in production, a JSON file for
 * local or self-hosted runs. Nothing here fabricates a number when storage is
 * unavailable — the route returns 503 and the UI says so.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getVisitStats, recordVisit } from '@/lib/visits';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COOKIE = 'ow_visit';
const VISIT_TTL_SECONDS = 60 * 60 * 24;
const IP_WINDOW_MS = 5 * 60_000;

/** Best-effort per-instance guard; the cookie is the primary de-duplicator. */
const recent = new Map<string, number>();

const BOT = /bot|crawler|spider|slurp|facebookexternalhit|preview|monitor/i;

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function payload(stats: { count: number; updatedAt: string | null }) {
  return NextResponse.json(
    { success: true, count: stats.count, updatedAt: stats.updatedAt },
    { headers: NO_STORE },
  );
}

function unavailable() {
  return NextResponse.json(
    {
      success: false,
      error: 'The live visitor count is temporarily unavailable.',
    },
    { status: 503, headers: NO_STORE },
  );
}

export async function GET() {
  try {
    return payload(await getVisitStats());
  } catch (err) {
    console.error('[visits] read failed:', err);
    return unavailable();
  }
}

export async function POST(request: NextRequest) {
  try {
    // A returning browser already contributed today: report the current count
    // without inflating it.
    if (request.cookies.get(COOKIE)?.value) {
      return payload(await getVisitStats());
    }

    // Social previews and crawlers are not visitors.
    if (BOT.test(request.headers.get('user-agent') ?? '')) {
      return payload(await getVisitStats());
    }

    const ip = clientKey(request);
    const now = Date.now();
    const last = recent.get(ip) ?? 0;
    if (now - last < IP_WINDOW_MS) {
      return payload(await getVisitStats());
    }

    const stats = await recordVisit();

    if (recent.size > 5_000) {
      for (const [key, at] of recent) {
        if (now - at > IP_WINDOW_MS) recent.delete(key);
      }
    }
    recent.set(ip, now);

    const res = payload(stats);
    res.cookies.set(COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: VISIT_TTL_SECONDS,
    });
    return res;
  } catch (err) {
    console.error('[visits] write failed:', err);
    return unavailable();
  }
}
