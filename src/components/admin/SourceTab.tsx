'use client';

/**
 * SourceTab — the press reference library behind the Track Record page.
 *
 * This is the credibility layer of the site, so the form is strict: a real
 * link, the outlet that published it and the headline as printed. Paraphrases
 * and rumours do not belong in a public record.
 */
import { useCallback, useEffect, useState } from 'react';
import { api, btnCls, btnDanger, cardCls, inputCls, labelCls, type Status } from './cms';
import { Field, StatusLine } from './Ui';

interface SourceRow {
  id: string;
  year: number;
  date: string;
  outlet: string;
  headline: string;
  url: string;
}

const empty = { url: '', outlet: '', headline: '', date: '', year: '' };

export default function SourceTab() {
  const [rows, setRows] = useState<SourceRow[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [st, setSt] = useState<Status>({ kind: 'idle' });
  const [filter, setFilter] = useState('');

  const refresh = useCallback(async () => {
    const j = await api<{ data: SourceRow[] }>('/api/admin/references');
    setRows(j.data);
  }, []);

  useEffect(() => {
    refresh().catch(() => setSt({ kind: 'err', msg: 'Could not load the source library.' }));
  }, [refresh]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/references', { method: 'POST', body: JSON.stringify(form) });
      setForm({ ...empty });
      await refresh();
      setSt({ kind: 'ok', msg: 'Source added to the public record.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setSt({ kind: 'busy' });
    try {
      await api(`/api/admin/references/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      await refresh();
      setSt({ kind: 'ok', msg: 'Saved.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Withdraw this citation from the public record?')) return;
    try {
      await api(`/api/admin/references/${id}`, { method: 'DELETE' });
      await refresh();
      setSt({ kind: 'ok', msg: 'Citation removed.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  const q = filter.trim().toLowerCase();
  const shown = q ? rows.filter((r) => `${r.outlet} ${r.headline} ${r.url} ${r.year}`.toLowerCase().includes(q)) : rows;

  return (
    <div className="space-y-6">
      <form onSubmit={add} className={cardCls}>
        <h2 className="mb-1 text-lg font-extrabold text-brand-dark">Cite a published report</h2>
        <p className="mb-4 text-sm text-gray-500">
          One row per story. The headline should be what the outlet printed, so a resident who clicks it sees
          the same thing the campaign is claiming.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Article URL" required hint="http(s) link to the published story.">
            <input className={inputCls} type="url" required value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://festaconline.com.ng/…" />
          </Field>
          <Field label="Outlet" required>
            <input className={inputCls} required value={form.outlet} onChange={(e) => setForm((f) => ({ ...f, outlet: e.target.value }))} placeholder="Festac Online" />
          </Field>
          <Field label="Headline as printed" required>
            <input className={inputCls} required value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} placeholder="Ola Western wins Amuwo House of Assembly primaries" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" hint="Optional; the year is taken from it.">
              <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </Field>
            <Field label="Year" required>
              <input className={inputCls} type="number" min={1990} max={2100} required value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="2026" />
            </Field>
          </div>
        </div>
        <div className="mt-5">
          <button type="submit" className={btnCls} disabled={!form.url || !form.outlet || !form.headline || st.kind === 'busy'}>
            Add to the record
          </button>
        </div>
        <StatusLine st={st} />
      </form>

      <div className={cardCls}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-brand-dark">Public record — {rows.length} source{rows.length === 1 ? '' : 's'}</h2>
          <input className={`${inputCls} sm:max-w-xs`} value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by outlet, headline or year" aria-label="Filter sources" />
        </div>

        <ul className="space-y-4">
          {shown.map((r) => (
            <SourceCard key={r.id} row={r} onPatch={patch} onRemove={remove} />
          ))}
          {!shown.length && <li className="text-sm text-gray-500">No sources match this filter.</li>}
        </ul>
      </div>
    </div>
  );
}

function SourceCard({ row, onPatch, onRemove }: { row: SourceRow; onPatch: (id: string, body: Record<string, unknown>) => Promise<void>; onRemove: (id: string) => Promise<void> }) {
  const [draft, setDraft] = useState({ outlet: row.outlet, headline: row.headline, url: row.url, date: row.date });
  const [busy, setBusy] = useState(false);
  const dirty = draft.outlet !== row.outlet || draft.headline !== row.headline || draft.url !== row.url || draft.date !== row.date;

  return (
    <li className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
        <span className="rounded-full bg-brand-green-light px-2.5 py-1 text-brand-green">{row.year}</span>
        <span className="text-gray-600">{row.date}</span>
        <a href={row.url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-blue underline">
          open source
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className={labelCls}>Outlet</span>
          <input className={inputCls} value={draft.outlet} onChange={(e) => setDraft((d) => ({ ...d, outlet: e.target.value }))} />
        </label>
        <label>
          <span className={labelCls}>Date</span>
          <input className={inputCls} value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>Headline</span>
          <input className={inputCls} value={draft.headline} onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelCls}>URL</span>
          <input className={inputCls} type="url" value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={btnCls}
          disabled={!dirty || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onPatch(row.id, { ...draft });
            } finally {
              setBusy(false);
            }
          }}
        >
          Save
        </button>
        <button
          type="button"
          className={btnDanger}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onRemove(row.id);
            } finally {
              setBusy(false);
            }
          }}
        >
          Withdraw
        </button>
      </div>
    </li>
  );
}
