'use client';

import { useMemo, useState } from 'react';
import type { Accomplishment, AccomplishmentCategory } from '@/types';

const CATEGORIES: AccomplishmentCategory[] = [
  'Infrastructure',
  'Youth & Sports',
  'Security',
  'Philanthropy',
  'Legislative',
];

/** RecordLedger — the service record with instant category filtering. */
export default function RecordLedger({ items }: { items: Accomplishment[] }) {
  const [cat, setCat] = useState<'ALL' | AccomplishmentCategory>('ALL');

  const shown = useMemo(
    () => (cat === 'ALL' ? items : items.filter((a) => a.category === cat)),
    [cat, items],
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter service record by category">
        <button
          onClick={() => setCat('ALL')}
          aria-pressed={cat === 'ALL'}
          className={`min-h-[44px] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
            cat === 'ALL' ? 'bg-brand-green text-white' : 'border border-gray-300 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green'
          }`}
        >
          All ({items.length})
        </button>
        {CATEGORIES.map((c) => {
          const n = items.filter((a) => a.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              disabled={n === 0}
              className={`min-h-[44px] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 ${
                cat === c ? 'bg-brand-green text-white' : 'border border-gray-300 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green'
              }`}
            >
              {c} ({n})
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a) => (
          <article key={a.id} className="card">
            <div className="flex items-center justify-between gap-2">
              <span
                className="rounded-full bg-brand-green-light px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-green"
                data-ow={`record.${a.id}.category`}
                data-ow-label="Category"
              >
                {a.category}
              </span>
              <span className="text-xs font-semibold text-brand-gray">{fmtDate(a.created_at)}</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold leading-snug" data-ow={`record.${a.id}.title`} data-ow-label="Record entry">
              {a.title}
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-green-dark" data-ow={`record.${a.id}.ward_impact`} data-ow-label="Ward / constituency">
              {a.ward_impact}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-gray" data-ow={`record.${a.id}.description`} data-ow-label="What happened">
              {a.description}
            </p>
            {/* An entry with no report behind it stays invisible to a voter; the desk
                sees a red chip here once the editing layer is on (globals.css), so the
                integrity report always has something to point at and something to fix. */}
            <a
              href={a.verification_source_url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              data-ow={`record.${a.id}.verification_source_url`}
              data-ow-label="Source link"
              data-ow-value={a.verification_source_url ?? ''}
              {...(a.verification_source_url ? {} : { 'data-ow-missing': '1' })}
              className={`mt-3 inline-block min-h-[44px] text-xs font-bold underline underline-offset-2 ${
                a.verification_source_url ? 'text-brand-green' : 'text-white'
              }`}
            >
              {a.verification_source_url ? 'Verified in the press →' : 'Add the report that proves this'}
            </a>
          </article>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-8 rounded-xl bg-white px-5 py-10 text-center text-sm text-brand-gray shadow-sm">
          No entries in this category yet.
        </p>
      )}
    </div>
  );
}
