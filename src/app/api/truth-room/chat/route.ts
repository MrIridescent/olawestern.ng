import { NextRequest, NextResponse } from 'next/server';
import {
  askTruthDesk,
  TruthAIError,
  truthAIStatus,
  type ChatTurn,
} from '@/lib/truth-ai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_QUESTION = 1_000;
const MAX_HISTORY_TURNS = 8;
const MAX_TURN_CHARS = 1_500;
const MAX_HISTORY_CHARS = 9_000;

/* ── best-effort per-instance rate limit ─────────────────────
 * A real guard against a single tab hammering the model. Serverless
 * instances do not share this map, so a distributed deployment should add a
 * shared limiter (e.g. Upstash) in front of the route; the behaviour here is
 * still a genuine limit per running instance, not a placeholder.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const buckets = new Map<string, number[]>();

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function rateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  if (buckets.size > 5_000) {
    for (const [k, times] of buckets) {
      if (!times.length || now - times[times.length - 1]! > WINDOW_MS) buckets.delete(k);
    }
  }
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0]!)) / 1000));
    buckets.set(key, recent);
    return { allowed: false, retryAfter };
  }
  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true, retryAfter: 0 };
}

/** GET /api/truth-room/chat — is a provider configured, and which one? */
export async function GET() {
  const status = truthAIStatus();
  return NextResponse.json({
    success: true,
    ...status,
    limits: {
      maxQuestionChars: MAX_QUESTION,
      maxHistoryTurns: MAX_HISTORY_TURNS,
      requestsPerMinute: MAX_REQUESTS,
    },
  });
}

interface ChatBody {
  question?: unknown;
  history?: unknown;
}

function badRequest(error: string) {
  return NextResponse.json({ success: false, code: 'BAD_REQUEST', error }, { status: 400 });
}

/** POST /api/truth-room/chat — one evidence-bound turn. */
export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        code: 'RATE_LIMITED',
        error: `Too many questions from this connection. Try again in ${limit.retryAfter} seconds.`,
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return badRequest('The request body must be JSON.');
  }

  if (typeof body.question !== 'string') {
    return badRequest('A question is required.');
  }
  const question = body.question.trim();
  if (question.length < 3) {
    return badRequest('Please ask a complete question (at least 3 characters).');
  }
  if (question.length > MAX_QUESTION) {
    return badRequest(`Questions are limited to ${MAX_QUESTION} characters.`);
  }

  const history: ChatTurn[] = [];
  if (body.history !== undefined) {
    if (!Array.isArray(body.history)) {
      return badRequest('history must be an array of previous turns.');
    }
    for (const raw of body.history.slice(-MAX_HISTORY_TURNS)) {
      if (!raw || typeof raw !== 'object') continue;
      const turn = raw as { role?: unknown; content?: unknown };
      if (turn.role !== 'user' && turn.role !== 'assistant') continue;
      if (typeof turn.content !== 'string') continue;
      const content = turn.content.trim();
      if (!content) continue;
      history.push({ role: turn.role, content: content.slice(0, MAX_TURN_CHARS) });
    }
    const total = history.reduce((sum, turn) => sum + turn.content.length, 0);
    if (total > MAX_HISTORY_CHARS) {
      return badRequest('The conversation history is too long. Start a new question.');
    }
  }

  try {
    const result = await askTruthDesk({ question, history });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    if (err instanceof TruthAIError) {
      if (err.code !== 'AI_NOT_CONFIGURED') {
        console.error(`[truth-room/chat] ${err.code}:`, err.detail ?? err.message);
      }
      const status = truthAIStatus();
      return NextResponse.json(
        {
          success: false,
          code: err.code,
          error: err.message,
          ...(err.code === 'AI_NOT_CONFIGURED'
            ? {
                configured: false,
                setup: [
                  'Set OPENAI_API_KEY or GEMINI_API_KEY on the server. Add _2 and _3 for extra keys (e.g. GEMINI_API_KEY_2); the desk rotates across them automatically.',
                  'Optionally choose the desk with TRUTH_AI_PROVIDER=openai or TRUTH_AI_PROVIDER=gemini.',
                  'Restart the app so the new environment is loaded.',
                ],
                providers: status.providers,
              }
            : {}),
        },
        { status: err.status },
      );
    }

    console.error('[truth-room/chat] unexpected:', err);
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL',
        error: 'The Truth Desk hit an unexpected error. No answer was generated.',
      },
      { status: 500 },
    );
  }
}
