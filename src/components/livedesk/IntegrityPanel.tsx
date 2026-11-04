'use client';

/**
 * livedesk/IntegrityPanel.tsx — the site's own answer to "is this defensible?"
 *
 * Every number here comes from GET /api/admin/health, which computes from the rows
 * the public pages render, so the panel cannot drift from what a voter sees. The
 * interaction that matters is the button on each line: it does not open a form, it
 * walks you to the sentence on the live page that is the problem and outlines it.
 */
import { useEffect, useState } from 'react';
import { Sheet } from './chrome';
import { api } from '../admin/cms';
import type { Finding, HealthReport, Severity } from '@/lib/liveDesk/integrity';

export interface IntegrityProps {
  anchor: DOMRect | null;
  onClose: () => void;
  /** Navigate if needed, then outline and open the offending element. */
  onJump: (page: string, selector: string, ow: string) => void;
}

const SEV_DOT: Record<Severity, string> = { block: 'bg-brick', warn: 'bg-[#B8860B]', info: 'bg-brand-blue' };
const SEV_WORD: Record<Severity, string> = { block: 'Must fix', warn: 'Should fix', info: 'Worth knowing' };

export default function IntegrityPanel({ anchor, onClose, onJump }: IntegrityProps) {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let live = true;
    api<{ data: HealthReport }>('/api/admin/health')
      .then((r) => live && setReport(r.data))
      .catch((e) => live && setErr(e instanceof Error ? e.message : 'The report could not be built.'));
    return () => { live = false; };
  }, [reload]);

  const pct = report ? Math.max(0, Math.min(100, report.score)) : 0;
  const ring = report
    ? report.ready ? '#00794A' : pct >= 65 ? '#B8860B' : '#B72329'
    : '#d1d5db';

  return (
    <Sheet
      title="Integrity report"
      context={report ? `${report.counts.photos} photos · ${report.counts.frames_bound}/${report.counts.frames_total} frames · ${report.counts.clips} clips · ${report.counts.sources} cited sources` : 'Reading the live store…'}
      anchor={anchor}
      width={520}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-gray-500">{report ? `Scored ${new Date(report.generated_at).toLocaleTimeString('en-NG')}` : ''}</span>
          <button type="button" onClick={() => { setReport(null); setReload((n) => n + 1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
            Re-check after my edits
          </button>
        </div>
      }
    >
      {err ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{err}</p> : null}
      {!report && !err ? <p className="py-10 text-center text-xs font-semibold text-gray-500">Auditing the record…</p> : null}

      {report ? (
        <>
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="relative h-[74px] w-[74px] shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EDF2F0" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={ring} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-black" style={{ color: ring }}>{pct}</span>
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-brand-dark">
                {report.ready ? 'Ready to hand a journalist the link' : 'Not ready to send out yet'}
              </p>
              <p className="mt-1 text-xs leading-snug text-gray-600">
                {(() => {
                  if (report.ready) {
                    return 'Nothing at must-fix level: every published claim on the site carries its source, and the frames the campaign promised are filled.';
                  }
                  const lines = report.findings.filter((f) => f.severity === 'block').reduce((n, f) => n + f.count, 0);
                  return `${lines} published ${lines === 1 ? 'line reads as' : 'lines read as'} indefensible until the report behind ${lines === 1 ? 'it' : 'them'} is linked.`;
                })()}
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {order(report.findings).map((f) => (
              <FindingRow key={f.id} f={f} open={open === f.id} onToggle={() => setOpen((o) => (o === f.id ? null : f.id))} onJump={onJump} />
            ))}
            {!report.findings.length ? (
              <li className="rounded-xl border border-brand-green bg-brand-light px-4 py-6 text-center text-sm font-bold text-brand-green-dark">
                Nothing outstanding. The record is sourced, the frames are filled, the queue is clear.
              </li>
            ) : null}
          </ul>
        </>
      ) : null}
    </Sheet>
  );
}

const RANK: Record<Severity, number> = { block: 0, warn: 1, info: 2 };
const order = (fs: Finding[]) => [...fs].sort((a, b) => RANK[a.severity] - RANK[b.severity] || b.count - a.count);

function FindingRow({ f, open, onToggle, onJump }: { f: Finding; open: boolean; onToggle: () => void; onJump: IntegrityProps['onJump'] }) {
  return (
    <li className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-gray-50">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${SEV_DOT[f.severity]}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-brand-dark">{f.label}</span>
          <span className="block text-[11px] text-gray-500">{SEV_WORD[f.severity]} · {f.count}</span>
        </span>
        <span className="shrink-0 text-xs text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open ? (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-3">
          <p className="text-[11px] italic leading-snug text-gray-600">{f.why}</p>
          <ul className="mt-3 space-y-2">
            {f.items.slice(0, 10).map((it, i) => {
              const ow = it.selector.match(/data-ow="([^"]+)"/)?.[1] ?? '';
              return (
                <li key={`${it.label}-${i}`} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-xs font-semibold leading-snug text-brand-dark">{it.label}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">{it.fix} · {it.page}</p>
                  <button
                    type="button"
                    onClick={() => onJump(it.page, it.selector, ow)}
                    className="mt-2 rounded-lg bg-brand-dark px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-brand-green"
                  >
                    {ow ? 'Show me on the page' : 'Open it in the CMS'}
                  </button>
                </li>
              );
            })}
            {f.items.length > 10 ? <li className="text-[11px] text-gray-500">…and {f.items.length - 10} more.</li> : null}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
