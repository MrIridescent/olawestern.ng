'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  PROMISE_LEDGER,
  PROMISE_STATUS_LABEL,
  type PromiseStatus,
  type PublicPromise,
} from '@/lib/hq';

type Filter = 'all' | PromiseStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All commitments' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'pledged', label: 'Pledged' },
];

const STATUS_STYLE: Record<PromiseStatus, string> = {
  delivered: 'bg-brand-emerald-light text-brand-emerald-dark ring-brand-emerald/30',
  in_progress: 'bg-brand-orange-light text-brand-orange-dark ring-brand-orange/30',
  pledged: 'bg-brand-navy-light text-brand-navy ring-brand-navy/15',
};

export default function PromiseLedger() {
  const [filter, setFilter] = useState<Filter>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: PROMISE_LEDGER.length,
      delivered: PROMISE_LEDGER.filter((p) => p.status === 'delivered').length,
      in_progress: PROMISE_LEDGER.filter((p) => p.status === 'in_progress').length,
      pledged: PROMISE_LEDGER.filter((p) => p.status === 'pledged').length,
    }),
    [],
  );

  const visible = filter === 'all' ? PROMISE_LEDGER : PROMISE_LEDGER.filter((p) => p.status === filter);
  const deliveredShare = Math.round((counts.delivered / counts.all) * 100);

  async function sharePromise(p: PublicPromise) {
    const url = `${window.location.origin}/hq#promise-${p.id}`;
    const text = `${p.title} — ${PROMISE_STATUS_LABEL[p.status]} on the OlaWestern promise ledger.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: p.title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(p.id);
        window.setTimeout(() => setCopied(null), 1800);
      }
    } catch {
      // A dismissed share sheet is not an error worth shouting about.
    }
  }

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange-dark">
            The public ledger
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
            Every promise, with its receipts.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-gray sm:text-base">
            Four commitments already have evidence behind them. The rest are written down before the
            election, so no one has to guess what was promised. A promise is only marked delivered
            when there is a report a resident can open.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-navy/10 bg-white p-4 shadow-sm lg:min-w-[16rem]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gray">Evidence on file</span>
            <span className="font-display text-2xl font-extrabold text-brand-navy">
              {counts.delivered}/{counts.all}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-navy/10">
            <div
              className="h-full rounded-full bg-brand-emerald"
              style={{ width: `${deliveredShare}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-brand-gray">
            {counts.in_progress} in progress · {counts.pledged} still to be won
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Filter commitments by status">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              aria-label={`${f.label}: ${counts[f.id]} ${counts[f.id] === 1 ? 'commitment' : 'commitments'}`}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                active
                  ? 'border-brand-navy bg-brand-navy text-white'
                  : 'border-brand-navy/15 bg-white text-brand-navy hover:border-brand-orange/60'
              }`}
            >
              {f.label}
              <span className={`ml-2 text-[10px] ${active ? 'text-white/70' : 'text-brand-gray'}`}>{counts[f.id]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visible.map((p) => (
          <article
            key={p.id}
            id={`promise-${p.id}`}
            className="group relative flex flex-col rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-xl hover:shadow-brand-navy/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ${STATUS_STYLE[p.status]}`}
              >
                {p.status === 'delivered' && <span aria-hidden>✓</span>}
                {PROMISE_STATUS_LABEL[p.status]}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gray">{p.ward}</span>
            </div>
            <h3 className="mt-3 font-display text-lg font-extrabold leading-snug text-brand-navy">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-gray">{p.summary}</p>
            <p className="mt-3 rounded-lg border border-brand-navy/10 bg-brand-navy-light/60 px-3 py-2 text-[12px] leading-relaxed text-brand-navy">
              <span className="font-bold">Receipt: </span>
              {p.evidence}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-brand-navy/10 pt-3">
              <Link href={p.href} className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-orange-dark hover:text-brand-orange">
                Open the record <span aria-hidden>→</span>
              </Link>
              <button
                type="button"
                onClick={() => sharePromise(p)}
                className="rounded-full border border-brand-navy/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-navy transition-colors hover:border-brand-orange/60 hover:text-brand-orange-dark"
              >
                {copied === p.id ? 'Copied' : 'Hold this promise'}
              </button>
            </div>
            <span aria-live="polite" className="sr-only">
              {copied === p.id ? `${p.title} link copied` : ''}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
