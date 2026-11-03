'use client';

import { useMemo, useState } from 'react';
import type { PublicIssue } from '@/types';

const STATUS_META: Record<PublicIssue['status'], { label: string; cls: string }> = {
  submitted: { label: 'Received', cls: 'bg-gray-100 text-gray-700' },
  under_review: { label: 'Under review', cls: 'bg-brand-green-light text-brand-green-dark' },
  action_scheduled: { label: 'Action scheduled', cls: 'bg-amber-50 text-amber-800' },
  resolved: { label: 'Resolved', cls: 'bg-brand-green text-white' },
};

const FILTERS: Array<'ALL' | PublicIssue['status']> = ['ALL', 'submitted', 'under_review', 'action_scheduled', 'resolved'];

/**
 * IssueBoard — the public progress dashboard of the Constituent Help Desk.
 * Only HQ-published rows reach this component; reporter contacts are stripped
 * server-side. Filters run instantly on the client (3G-friendly, no refetch).
 */
export default function IssueBoard({ issues }: { issues: PublicIssue[] }) {
  const [status, setStatus] = useState<(typeof FILTERS)[number]>('ALL');
  const [ward, setWard] = useState('ALL');

  const wards = useMemo(() => Array.from(new Set(issues.map((i) => i.ward))).sort(), [issues]);

  const shown = useMemo(
    () =>
      issues
        .filter((i) => (status === 'ALL' ? true : i.status === status))
        .filter((i) => (ward === 'ALL' ? true : i.ward === ward)),
    [issues, status, ward],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: issues.length };
    for (const s of FILTERS) if (s !== 'ALL') c[s] = issues.filter((i) => i.status === s).length;
    return c;
  }, [issues]);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition min-h-[44px] ${
      active ? 'bg-brand-green text-white' : 'border border-gray-300 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green'
    }`;

  return (
    <div>
      {/* Live counters */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['resolved', 'action_scheduled', 'under_review', 'submitted'] as const).map((s) => (
          <div key={s} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">{STATUS_META[s].label}</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-brand-dark">{counts[s]}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 space-y-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter issues by status">
          {FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => setStatus(f)} aria-pressed={status === f} className={chip(status === f)}>
              {f === 'ALL' ? `All (${counts.ALL})` : `${STATUS_META[f].label} (${counts[f]})`}
            </button>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter issues by ward">
          <button type="button" onClick={() => setWard('ALL')} aria-pressed={ward === 'ALL'} className={chip(ward === 'ALL')}>
            All wards
          </button>
          {wards.map((w) => (
            <button key={w} type="button" onClick={() => setWard(w)} aria-pressed={ward === w} className={chip(ward === w)}>
              {w}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-brand-dark" aria-live="polite">
        {shown.length} of {issues.length} published {issues.length === 1 ? 'issue' : 'issues'} shown
      </p>

      <ol className="mt-4 space-y-4">
        {shown.map((i) => (
          <li key={i.id} className="card">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_META[i.status].cls}`}>
                {STATUS_META[i.status].label}
              </span>
              <span className="rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-gray">{i.category}</span>
              <span className="ml-auto text-xs text-brand-gray">
                {i.ward} · {new Date(i.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold leading-snug text-brand-dark sm:text-lg">{i.title}</h3>
            {i.detail && <p className="mt-2 text-sm leading-relaxed text-brand-gray">{i.detail}</p>}
            {i.update_note && (
              <p className="mt-3 rounded-xl bg-brand-light px-4 py-3 text-sm leading-relaxed text-brand-dark">
                <span className="font-bold text-brand-green">Desk update: </span>
                {i.update_note}
              </p>
            )}
          </li>
        ))}
      </ol>

      {shown.length === 0 && (
        <p className="mt-6 rounded-xl border border-gray-100 bg-white px-5 py-10 text-center text-sm text-brand-gray shadow-sm">
          Nothing published in this view yet. Verified reports appear here as the ward desk works through them.
        </p>
      )}
    </div>
  );
}
