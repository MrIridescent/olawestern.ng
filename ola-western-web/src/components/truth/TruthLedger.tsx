'use client';

import { useMemo, useState } from 'react';
import FactCard from './FactCard';
import type { FactCheck, FactVerdict } from '@/types';

const FILTERS: Array<'ALL' | FactVerdict> = ['ALL', 'VERIFIED FACT', 'FALSE CLAIM', 'MISLEADING'];

/**
 * TruthLedger — the live-search front door of the Truth Engine.
 * The full ledger is server-rendered for SEO and first paint; search and
 * verdict filters run instantly on the client. The same query engine is
 * available over HTTP at GET /api/fact-check?q=&verdict= for the AI widget.
 */
export default function TruthLedger({ facts }: { facts: FactCheck[] }) {
  const [q, setQ] = useState('');
  const [verdict, setVerdict] = useState<(typeof FILTERS)[number]>('ALL');

  const results = useMemo(() => {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return facts.filter((f) => {
      if (verdict !== 'ALL' && f.verdict !== verdict) return false;
      if (!tokens.length) return true;
      const hay = [f.claim_summary, f.detailed_explanation, f.verdict].join(' ').toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [q, verdict, facts]);

  return (
    <div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.47l2.79 2.79a1 1 0 0 1-1.42 1.42l-2.79-2.79A7 7 0 0 1 2 9Z" clipRule="evenodd" /></svg>
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the ledger — try “road”, “primary”, “security”"
            aria-label="Search fact-checks"
            className="min-h-[52px] w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-base shadow-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green sm:text-sm"
          />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by verdict">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setVerdict(f)}
              aria-pressed={verdict === f}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition min-h-[44px] ${
                verdict === f
                  ? 'bg-brand-green text-white'
                  : 'border border-gray-300 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green'
              }`}
            >
              {f === 'ALL' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-600" aria-live="polite">
        {results.length} of {facts.length} ledger {facts.length === 1 ? 'entry' : 'entries'} shown
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {results.map((f) => <FactCard key={f.id} fact={f} />)}
      </div>

      {results.length === 0 && (
        <p className="mt-6 rounded-xl bg-white px-5 py-10 text-center text-sm text-brand-gray shadow-sm">
          No ledger entry matches that search. Heard something circulating? Submit it through{' '}
          <strong>Ask Ola</strong> below and the media desk will rule on it.
        </p>
      )}
    </div>
  );
}
