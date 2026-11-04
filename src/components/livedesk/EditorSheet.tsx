'use client';

/**
 * livedesk/EditorSheet.tsx — the editor that opens where the desk tapped.
 *
 * It prefills from the element's own rendered text, which is the point: the desk
 * is editing the sentence the voter reads, not a copy of it in a form. The body it
 * sends is whatever the field registry says the existing admin route expects, and
 * the error it shows is that route's own wording — so this sheet can never accept
 * something the tab-based CMS would refuse.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet } from './chrome';
import { api } from '../admin/cms';
import type { Target } from '@/lib/liveDesk/contract';

type FieldTarget = Extract<Target, { kind: 'field' }>;

export interface EditorProps {
  target: FieldTarget;
  /** What the page currently shows for this field. */
  current: string;
  /** Row context rendered next to the attribute (e.g. the profile row's label). */
  ctx?: Record<string, string>;
  anchor: DOMRect | null;
  page: string;
  onClose: () => void;
  onSaved: (msg: string, undo: { label: string; run: () => Promise<void> }) => void;
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green';

export default function EditorSheet({ target, current, ctx, anchor, page, onClose, onSaved }: EditorProps) {
  const { spec, id, index } = target;
  const [value, setValue] = useState(current);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const box = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => box.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [target.ow]);

  const over = value.length > spec.max;
  const empty = spec.kind !== 'boolean' && !value.trim();

  async function save() {
    if (busy || over || empty) return;
    setBusy(true);
    setErr(null);
    const before = current;
    try {
      if (spec.inArray === 'stats') {
        const res = await api<{ data: { stats: { value: string; label: string }[] } }>('/api/admin/settings');
        const stats = [...res.data.stats];
        const i = index ?? 0;
        const row = stats[i] ?? { value: '', label: '' };
        stats[i] = target.field.endsWith('.value') ? { ...row, value } : { ...row, label: value };
        await api('/api/admin/settings', { method: 'PATCH', body: JSON.stringify({ stats }) });
        onSaved(`${spec.label} updated on the live page.`, {
          label: spec.label,
          run: async () => {
            const back = [...stats];
            back[i] = target.field.endsWith('.value') ? { ...back[i], value: before } : { ...back[i], label: before };
            await api('/api/admin/settings', { method: 'PATCH', body: JSON.stringify({ stats: back }) });
          },
        });
      } else {
        const sent = spec.send({ id, index, value });
        await api(sent.path, { method: sent.method, body: JSON.stringify({ ...ctx, ...sent.body }) });
        onSaved(`${spec.label} saved — the page re-rendered from the server.`, {
          label: spec.label,
          run: async () => {
            const prev = spec.send({ id, index, value: before || ' ' });
            await api(prev.path, { method: prev.method, body: JSON.stringify({ ...ctx, ...prev.body }) });
          },
        });
      }
      onClose();
    } catch (e) {
      // The route's own validation message, verbatim.
      setErr(e instanceof Error ? e.message : 'The server refused that change.');
    } finally {
      setBusy(false);
    }
  }

  const host = useMemo(() => {
    if (spec.kind !== 'url') return null;
    try { return new URL(value.trim()).hostname.replace(/^www\./, ''); } catch { return null; }
  }, [spec.kind, value]);

  return (
    <Sheet
      title={spec.label}
      context={`${page} · ${target.ow}`}
      anchor={anchor}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[11px] font-semibold ${over ? 'text-red-600' : 'text-gray-500'}`}>
            {value.length}/{spec.max}
            {empty ? ' · nothing to publish' : ''}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy || over || empty}
              className="rounded-lg bg-brand-green px-4 py-2 text-xs font-black text-white transition hover:bg-brand-green-dark disabled:opacity-40"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      }
    >
      {spec.attested ? (
        <p className="mb-3 rounded-lg bg-brand-light px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-brand-green-dark">
          This line is public and about a real person
        </p>
      ) : null}

      {spec.kind === 'choice' ? (
        <div className="flex flex-wrap gap-2">
          {(spec.options ?? []).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setValue(o)}
              className={[
                'rounded-full px-3.5 py-2 text-xs font-bold transition',
                value === o ? 'bg-brand-dark text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {o}
            </button>
          ))}
        </div>
      ) : spec.kind === 'area' ? (
        <textarea
          ref={box as React.RefObject<HTMLTextAreaElement>}
          rows={Math.min(14, Math.max(4, Math.ceil(value.length / 68)))}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); void save(); }
          }}
          className={inputCls}
        />
      ) : (
        <input
          ref={box as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); void save(); }
          }}
          className={inputCls}
        />
      )}

      {spec.kind === 'url' && value.trim() ? (
        <p className="mt-2 text-[11px] text-gray-600">
          {host ? (
            <>
              Links to <span className="font-bold text-brand-dark">{host}</span> — it renders as a clickable source, so it must be the real report.
            </>
          ) : (
            <span className="font-semibold text-red-600">Not a valid http(s) link yet — the route will refuse it.</span>
          )}
        </p>
      ) : null}

      {spec.hint ? <p className="mt-3 text-xs leading-relaxed text-gray-600">{spec.hint}</p> : null}
      {err ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{err}</p> : null}
      <p className="mt-3 text-[11px] text-gray-400">⌘/Ctrl + Enter to save · Esc to leave it alone</p>
    </Sheet>
  );
}
