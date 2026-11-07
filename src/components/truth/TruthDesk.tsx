'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

interface SourceRef {
  id: string;
  label: string;
  url: string | null;
  kind: string;
}

interface DeskMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceRef[];
  failed?: boolean;
}

interface DeskStatus {
  configured: boolean;
  preferred: string;
  activeProvider: 'openai' | 'gemini' | null;
  model: string | null;
  providers: Array<{ id: 'openai' | 'gemini'; configured: boolean; model: string; keys: number }>;
  reason?: string;
}

const MAX_QUESTION = 1_000;

/** The question the whole room exists to answer — kept first and rendered large. */
export const HEADLINE_QUESTION = 'Why should I vote Ola Western over anyone else?';

const SUGGESTIONS = [
  'What seat and party is Ola Western contesting?',
  'What does a Lagos State lawmaker actually control?',
  'Which APC candidates are from Amuwo-Odofin?',
  'What has the campaign actually delivered in Amuwo-Odofin?',
  'What should I check before I vote?',
  'How should I compare the candidates?',
  'Pidgin: wetin Ola Western don deliver for Amuwo?',
  'Answer in Yoruba: what has Ola Western done for this constituency?',
  'Why was FESTAC Town built, and who maintains it?',
];

const PROVIDER_LABEL: Record<string, string> = {
  openai: 'OpenAI',
  gemini: 'Google Gemini',
};

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function TruthDesk({ factCount }: { factCount: number }) {
  const [status, setStatus] = useState<DeskStatus | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const [messages, setMessages] = useState<DeskMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/truth-room/chat', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: DeskStatus & { success?: boolean }) => {
        if (!alive) return;
        setStatus(data);
      })
      .catch(() => {
        if (alive) setStatusFailed(true);
      });
    return () => {
      alive = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (busy) return;
    if (question.length < 3) {
      setNotice('Please ask a complete question.');
      inputRef.current?.focus();
      return;
    }
    if (question.length > MAX_QUESTION) {
      setNotice(`Questions are limited to ${MAX_QUESTION} characters.`);
      return;
    }

    setNotice(null);
    const userMessage: DeskMessage = { id: newId(), role: 'user', content: question };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput('');
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    // A provider outage must not leave the desk saying "Checking…" forever.
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 45_000);

    try {
      const history = conversation
        .slice(0, -1)
        .filter((m) => !m.failed)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/truth-room/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => null)) as
        | {
            success?: boolean;
            answer?: string;
            sources?: SourceRef[];
            provider?: string;
            model?: string;
            error?: string;
            code?: string;
          }
        | null;

      if (!res.ok || !data?.success || !data.answer) {
        const failure =
          data?.code === 'AI_NOT_CONFIGURED'
            ? 'The desk has no model key yet, so this question was not answered. Follow the setup note above — nothing was invented in its place.'
            : data?.error ?? `The desk could not answer that question (HTTP ${res.status}).`;
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: 'assistant', content: failure, failed: true },
        ]);
        if (data?.code === 'AI_NOT_CONFIGURED') {
          setStatus((prev) =>
            prev
              ? { ...prev, configured: false, reason: failure }
              : prev,
          );
        }
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: data.answer!,
          sources: data.sources ?? [],
        },
      ]);
    } catch (err) {
      const aborted = (err as Error)?.name === 'AbortError';
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: timedOut
            ? 'The desk did not answer within 45 seconds, so the request was stopped. Nothing was filled in. Try again in a moment, or send the question through Ask Ola.'
            : aborted
              ? 'Answer stopped before it completed. Nothing was filled in.'
              : 'The connection to the Truth Desk failed. No answer was generated.',
          failed: true,
        },
      ]);
    } finally {
      clearTimeout(timer);
      setBusy(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  const configured = status?.configured ?? false;
  const statusKnown = status !== null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-navy-deep via-brand-navy to-brand-navy-deep shadow-2xl">
      <div className="border-b border-white/10 px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-electric-bright">
              Truth Desk · live AI
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              Ask the record.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
              A conversational fact-check and civic desk — grounded in the {factCount} published{' '}
              {factCount === 1 ? 'ruling' : 'rulings'} below, the track record, the newsroom, the
              published profile and a sourced Amuwo-Odofin political brief. Ask about Constituency I,
              the Lagos State House of Assembly, Amuwo-Odofin politics or any claim about Ola Western —
              in English, Pidgin, Yoruba, Igbo, Hausa or another language. It answers the question, not
              the tone.
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wide sm:text-[11px] ${
              !statusKnown
                ? 'border-white/15 bg-white/5 text-white/60'
                : configured
                  ? 'border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald'
                  : 'border-brand-electric/40 bg-brand-electric/10 text-brand-electric-bright'
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${
                !statusKnown
                  ? 'bg-white/40'
                  : configured
                    ? 'bg-brand-emerald'
                    : 'bg-brand-electric'
              }`}
            />
            {!statusKnown
              ? 'Checking'
              : configured
                ? 'Live · Feedback About Ola Western and Amuwo Odofin'
                : 'Setup required'}
          </span>
        </div>

        {statusFailed && (
          <p className="mt-4 rounded-xl border border-brand-electric/30 bg-brand-electric/10 px-4 py-3 text-sm text-white/80">
            The desk could not confirm its provider status. Questions will still be sent; if no key is
            configured the server returns an honest error instead of an invented answer.
          </p>
        )}

        {statusKnown && !configured && (
          <div className="mt-5 rounded-xl border border-brand-electric/30 bg-brand-electric/10 px-4 py-4 text-sm text-white/80">
            <p className="font-display text-sm font-bold text-white">
              The desk needs one server key.
            </p>
            <p className="mt-1.5 leading-relaxed">
              Add <code className="rounded bg-black/30 px-1.5 py-0.5 text-[12px] text-brand-electric-bright">OPENAI_API_KEY</code>{' '}
              or <code className="rounded bg-black/30 px-1.5 py-0.5 text-[12px] text-brand-electric-bright">GEMINI_API_KEY</code>{' '}
              to the server environment and restart. Until then every question returns a real
              &ldquo;not configured&rdquo; error — the desk will not substitute a canned answer.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(status?.providers ?? []).map((p) => (
                <span
                  key={p.id}
                  className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-white/60"
                >
                  {PROVIDER_LABEL[p.id]}:{' '}
                  {p.configured
                    ? `${p.keys} key${p.keys === 1 ? '' : 's'} present`
                    : 'no key'}
                </span>
              ))}
            </div>
            {status?.reason?.includes('TRUTH_AI_PROVIDER') && (
              <p className="mt-3 text-xs leading-relaxed text-white/50">{status.reason}</p>
            )}
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-4 sm:px-8 sm:pb-7">
        {messages.length > 0 && (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setNotice(null);
                inputRef.current?.focus();
              }}
              className="text-[11px] font-semibold text-brand-electric-bright underline underline-offset-2 hover:text-white"
            >
              New conversation
            </button>
          </div>
        )}
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-busy={busy}
          className={`min-h-[190px] space-y-4 pr-1 ${
            messages.length > 0 ? 'max-h-[430px] overflow-y-auto' : ''
          }`}
        >
          {messages.length === 0 && (
            <div className="space-y-4">
              {/* The one question the room is built around. Larger than every other
                  starter so it reads as the obvious first click, on a phone too. */}
              <button
                type="button"
                onClick={() => void send(HEADLINE_QUESTION)}
                disabled={busy}
                className="group relative w-full overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-br from-brand-electric via-brand-electric to-brand-navy px-5 py-6 text-left shadow-[0_18px_50px_-18px_rgba(37,99,235,0.75)] ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-18px_rgba(37,99,235,0.9)] focus:outline-none focus:ring-2 focus:ring-white/70 disabled:opacity-60 sm:px-8 sm:py-9"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
                />
                <span className="relative block">
                  <span className="mb-3 inline-flex flex-none items-center gap-2 rounded-full border border-white/30 bg-black/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                    Start here
                  </span>
                  <span className="flex items-start gap-3 sm:gap-5">
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[26px] font-black leading-[1.08] tracking-tight text-white sm:text-4xl">
                        {HEADLINE_QUESTION}
                      </span>
                      <span className="mt-3 block max-w-xl text-[13px] font-medium leading-relaxed text-white/85 sm:text-sm">
                        The case, the record and the office — answered with sources, without attacking
                        anybody. Ask it in English, Pidgin, Yoruba, Igbo or Hausa.
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-brand-electric transition group-hover:translate-x-0.5 sm:h-12 sm:w-12"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 sm:h-6 sm:w-6">
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </span>
                </span>
              </button>

              <div className="rounded-xl border border-dashed border-white/15 px-5 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                  Or start with one of these
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      disabled={busy}
                      className="min-h-[40px] rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-left text-xs font-semibold text-white/75 transition hover:border-brand-electric/60 hover:text-white disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) =>
            message.role === 'user' ? (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-electric px-4 py-3 text-sm leading-relaxed text-white shadow-lg">
                  {message.content}
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex justify-start">
                <div
                  className={`max-w-[92%] rounded-2xl rounded-bl-sm border px-4 py-3 text-sm leading-relaxed shadow-lg ${
                    message.failed
                      ? 'border-brand-electric/40 bg-brand-electric/10 text-white/80'
                      : 'border-white/10 bg-white/[0.06] text-white/90'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {!message.failed && message.sources && message.sources.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                      {message.sources.map((source) => (
                        <li key={source.id}>
                          {source.url ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-brand-electric-bright underline decoration-white/20 underline-offset-2 hover:border-brand-electric/60"
                            >
                              {source.id} · {source.label} ↗
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-white/55">
                              {source.id} · {source.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ),
          )}

          {busy && (
            <div className="flex justify-start" aria-label="The Truth Desk is composing an answer">
              <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-4 py-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-electric-bright" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-electric-bright [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-electric-bright [animation-delay:300ms]" />
                  <span className="ml-2 text-xs text-white/50">Checking the published record…</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <label htmlFor="truth-desk-question" className="sr-only">
            Ask the Truth Desk a question
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <textarea
              id="truth-desk-question"
              ref={inputRef}
              rows={2}
              value={input}
              maxLength={MAX_QUESTION}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about Constituency I, the Assembly, Amuwo politics or any claim — in English, Pidgin, Yoruba, Igbo or Hausa…"
              className="min-h-[64px] w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-brand-electric focus:ring-1 focus:ring-brand-electric"
              aria-describedby="truth-desk-hint"
            />
            {busy ? (
              <button
                type="button"
                onClick={stop}
                className="min-h-[48px] shrink-0 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void send()}
                className="min-h-[48px] shrink-0 rounded-xl bg-brand-electric px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-electric-bright focus:outline-none focus:ring-2 focus:ring-brand-electric-bright focus:ring-offset-2 focus:ring-offset-brand-navy"
              >
                Ask the record
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/40">
            <p id="truth-desk-hint">
              Enter to send · Shift + Enter for a new line
              {input.length > 850 ? ` · ${input.length}/${MAX_QUESTION}` : ''}
            </p>
            <p>AI-generated from the published record and civic brief. Formal responses: Ask Ola.</p>
          </div>

          {notice && (
            <p role="alert" className="mt-2 text-xs font-semibold text-brand-electric-bright">
              {notice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
