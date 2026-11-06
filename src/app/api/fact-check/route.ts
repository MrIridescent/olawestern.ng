import { NextRequest, NextResponse } from 'next/server';
import { listFactChecks } from '@/lib/store';

export const dynamic = 'force-dynamic';

const VERDICTS = ['VERIFIED FACT', 'FALSE CLAIM', 'MISLEADING'] as const;

/**
 * GET /api/fact-check — the Truth Engine query surface.
 * ?q=         full-text search across claim + explanation (tokens AND-ed)
 * ?verdict=   VERIFIED FACT | FALSE CLAIM | MISLEADING
 * Consumed by the Truth Room page and the War Room sync verification.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') ?? '').trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    const verdict = searchParams.get('verdict') ?? '';
    if (verdict && !VERDICTS.includes(verdict as (typeof VERDICTS)[number])) {
      return NextResponse.json({ success: false, error: 'Unknown verdict filter.' }, { status: 400 });
    }

    let data = await listFactChecks();
    if (verdict) data = data.filter((f) => f.verdict === verdict);
    if (tokens.length) {
      data = data.filter((f) => {
        const hay = [f.claim_summary, f.detailed_explanation, f.verdict].join(' ').toLowerCase();
        return tokens.every((t) => hay.includes(t));
      });
    }
    return NextResponse.json({ success: true, data, count: data.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
