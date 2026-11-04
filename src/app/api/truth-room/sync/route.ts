import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { addFactCheck } from '@/lib/store';

export const dynamic = 'force-dynamic';

const VERDICTS = ['VERIFIED FACT', 'FALSE CLAIM', 'MISLEADING'] as const;

interface WarRoomPayload {
  claimSummary: string;
  verdict: (typeof VERDICTS)[number];
  detailedExplanation: string;
  verificationUrl?: string | null;
  featured?: boolean;
}

function warRoomSecret(): string {
  const s = process.env.WAR_ROOM_SECRET_KEY;
  if (s) return s;
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[truth-room/sync] WAR_ROOM_SECRET_KEY not set — using local development secret "warroom-dev".');
    return 'warroom-dev';
  }
  return '';
}

/**
 * POST /api/truth-room/sync
 * Authenticated webhook: the AI Campaign War Room posts a drafted fact-check
 * here after executive approval, and it is published into the Truth Engine.
 * Protected by a shared bearer secret (WAR_ROOM_SECRET_KEY).
 */
export async function POST(request: NextRequest) {
  try {
    const secret = warRoomSecret();
    if (!secret) {
      return NextResponse.json({ success: false, error: 'WAR_ROOM_SECRET_KEY not configured.' }, { status: 501 });
    }
    if (request.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as WarRoomPayload;
    if (!body.claimSummary || !body.detailedExplanation || !VERDICTS.includes(body.verdict)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: claimSummary, verdict (VERIFIED FACT | FALSE CLAIM | MISLEADING) and detailedExplanation are required.' },
        { status: 400 },
      );
    }

    const rec = await addFactCheck({
      claim_summary: body.claimSummary,
      verdict: body.verdict,
      detailed_explanation: body.detailedExplanation,
      official_document_url: body.verificationUrl ?? null,
      is_featured: body.featured ?? true,
    });

    revalidatePath('/truth-room');
    return NextResponse.json({ success: true, message: 'Truth Room updated from War Room.', id: rec.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
