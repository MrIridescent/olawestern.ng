'use client';

import { useMemo, useState } from 'react';
import type { ReferenceLink } from '@/lib/content';

/**
 * External reference library — every press report behind the record.
 * Sorted newest-first, filterable by outlet and by year, each row is a
 * direct link to the published source so any resident can verify for
 * themselves. Mobile-first: big tap targets, one column on phones.
 */
export default function ReferenceLibrary({ links }: { links: ReferenceLink[] }) {
  const [outlet, setOutlet] = useState<string>('All outlets');
  const [year, setYear] = useState<string>('All years');

  const years = useMemo(() => Array.from(new Set(links.map((l) => l.year))).sort((a, b) => b - a), [links]);

  const filtered = useMemo(
    () =>
      links
        .filter((l) => (outlet === 'All outlets' ? true : l.outlet === outlet))
        .filter((l) => (year === 'All years' ? true : String(l.year) === year))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [links, outlet, year],
  );

  const grouped = useMemo(() => {
    const map = new Map<number, ReferenceLink[]>();
    for (const l of filtered) {
      const bucket = map.get(l.year) ?? [];
      bucket.push(l);
      map.set(l.year, bucket);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  const knownOutlets = useMemo(() => Array.from(new Set(links.map((l) => l.outlet))).sort(), [links]);
  const chips = ['All outlets', ...knownOutlets];

  const chipCls = (active: boolean) =>
    `min-h-[44px] rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
      active
        ? 'border-brand-green bg-brand-green text-white'
        : 'border-gray-300 bg-white text-brand-gray hover:border-brand-green hover:text-brand-green'
    }`;

  return (
    <div>
      <p className="mt-2 max-w-2xl text-sm text-brand-gray">
        Independent reports that document the record. Tap any headline to open the published source.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter sources by outlet">
        {chips.map((c) => (
          <button key={c} type="button" onClick={() => setOutlet(c)} aria-pressed={outlet === c} className={chipCls(outlet === c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-gray">Year</span>
        <button type="button" onClick={() => setYear('All years')} aria-pressed={year === 'All years'} className={chipCls(year === 'All years')}>
          All years
        </button>
        {years.map((y) => (
          <button key={y} type="button" onClick={() => setYear(String(y))} aria-pressed={year === String(y)} className={chipCls(year === String(y))}>
            {y}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm font-semibold text-brand-dark" aria-live="polite">
        {filtered.length} of {links.length} sources shown
      </p>

      {/* Grouped list */}
      {grouped.map(([y, items]) => (
        <div key={y} className="mt-8">
          <h3 className="flex items-center gap-3 font-display text-xl font-bold text-brand-dark">
            {y}
            <span className="h-px flex-1 bg-gray-200" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-gray">{items.length} reports</span>
          </h3>
          <ul className="mt-4 space-y-3">
            {items.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex min-h-[64px] items-start justify-between gap-4 !p-4 sm:!p-5"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-green-light px-3 py-0.5 text-xs font-bold text-brand-green">{l.outlet}</span>
                      <span className="text-xs text-brand-gray">{l.date}</span>
                    </span>
                    <span className="mt-1.5 block text-sm font-semibold leading-snug text-brand-dark sm:text-base">{l.headline}</span>
                  </span>
                  <span className="shrink-0 text-brand-green" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
                      <path d="M15 3l6 6" />
                      <path d="M18 3h3v3" />
                      <path d="M14 15l7 7" />
                      <path d="M21 15v7h-7" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="mt-8 rounded-xl bg-brand-light p-6 text-center text-sm text-brand-gray">
          No sources match this filter — the media desk can attach more coverage through the campaign CMS.
        </p>
      )}
    </div>
  );
}
