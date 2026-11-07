'use client';

/**
 * VideoTab — the broadcast library.
 *
 * Paste any YouTube link; the dashboard asks YouTube what it is before it lets
 * the clip be published, so a private video or an embed that has been switched
 * off never reaches a voter as a black rectangle.
 */
import { useCallback, useEffect, useState } from 'react';
import { api, btnCls, btnDanger, btnGhost, cardCls, inputCls, labelCls, type Status } from './cms';
import { Field, StatusLine } from './Ui';

interface VideoRow {
  id: string;
  youtube_id: string;
  title: string;
  outlet: string | null;
  published_at: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
}

interface Lookup {
  youtube_id: string;
  title: string | null;
  outlet: string | null;
  thumbnail: string | null;
}

const empty = { u: '', title: '', outlet: '', published_at: '', featured: false, published: true };

export default function VideoTab() {
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [found, setFound] = useState<Lookup | null>(null);
  const [st, setSt] = useState<Status>({ kind: 'idle' });

  const refresh = useCallback(async () => {
    const j = await api<{ data: VideoRow[] }>('/api/admin/videos');
    setRows(j.data);
  }, []);

  useEffect(() => {
    refresh().catch(() => setSt({ kind: 'err', msg: 'Could not load the video library.' }));
  }, [refresh]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    setFound(null);
    try {
      const j = await api<{ data: Lookup }>(`/api/admin/videos/lookup?u=${encodeURIComponent(form.u)}`);
      setFound(j.data);
      setForm((f) => ({
        ...f,
        title: f.title || j.data.title || '',
        outlet: f.outlet || j.data.outlet || '',
      }));
      setSt({ kind: 'ok', msg: 'Found on YouTube — ready to publish.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Lookup failed.' });
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/videos', { method: 'POST', body: JSON.stringify({ youtube: form.u, title: form.title, outlet: form.outlet, published_at: form.published_at, featured: form.featured, published: form.published }) });
      setForm({ ...empty });
      setFound(null);
      await refresh();
      setSt({ kind: 'ok', msg: 'Clip published to the video shelf.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setSt({ kind: 'busy' });
    try {
      await api(`/api/admin/videos/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      await refresh();
      setSt({ kind: 'ok', msg: 'Saved.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this clip from the video shelf?')) return;
    try {
      await api(`/api/admin/videos/${id}`, { method: 'DELETE' });
      setSt({ kind: 'ok', msg: 'Clip removed.' });
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className={cardCls}>
        <h2 className="mb-1 text-lg font-extrabold text-brand-dark">Add a broadcast clip</h2>
        <p className="mb-4 text-sm text-gray-500">
          Paste the YouTube link from the channel that filmed it. The dashboard checks the link with YouTube
          first — private, unlisted or non-embeddable videos are refused.
        </p>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field label="YouTube link or video id" required hint="watch?v=…, youtu.be/…, /shorts/… or the bare 11-character id.">
            <input className={inputCls} required value={form.u} onChange={(e) => setForm((f) => ({ ...f, u: e.target.value }))} placeholder="https://www.youtube.com/watch?v=…" />
          </Field>
          <div className="flex items-end">
            <button type="button" className={btnGhost} onClick={lookup} disabled={!form.u.trim() || st.kind === 'busy'}>
              Check the link
            </button>
          </div>
        </div>

        {found && (
          <div className="mt-4 flex gap-3 rounded-lg bg-brand-light p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={found.thumbnail ?? ''} alt="" className="h-16 w-28 shrink-0 rounded object-cover" loading="lazy" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brand-dark">{found.title ?? 'Untitled'}</p>
              <p className="text-xs text-gray-600">Channel: {found.outlet ?? 'unknown'}</p>
              <p className="mt-1 font-mono text-[11px] text-gray-600">{found.youtube_id}</p>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Headline shown on the site" required hint="Write it the way the campaign wants it read; the YouTube title is only a starting point.">
            <input className={inputCls} required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ola Western wins APC primary in Amuwo-Odofin" />
          </Field>
          <Field label="Outlet / channel">
            <input className={inputCls} value={form.outlet} onChange={(e) => setForm((f) => ({ ...f, outlet: e.target.value }))} placeholder="TVC News Nigeria" />
          </Field>
          <Field label="Broadcast date" hint="Optional — helps the newsroom order the shelf.">
            <input className={inputCls} type="date" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} />
          </Field>
          <div className="flex flex-wrap items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" className="h-5 w-5" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
              Publish
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" className="h-5 w-5" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
              Lead clip
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className={btnCls} disabled={!form.u.trim() || !form.title.trim() || st.kind === 'busy'}>
            Publish clip
          </button>
          <button type="button" className={btnGhost} onClick={() => { setForm({ ...empty }); setFound(null); }}>Clear</button>
        </div>
        <StatusLine st={st} />
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-brand-dark">Video shelf — {rows.length} clip{rows.length === 1 ? '' : 's'}</h2>
        {rows.map((r) => (
          <VideoCard key={r.id} row={r} onPatch={patch} onRemove={remove} />
        ))}
        {!rows.length && <p className={`${cardCls} text-sm text-gray-500`}>No clips yet. Paste a YouTube link above.</p>}
      </div>
    </div>
  );
}

function VideoCard({ row, onPatch, onRemove }: { row: VideoRow; onPatch: (id: string, body: Record<string, unknown>) => Promise<void>; onRemove: (id: string) => Promise<void> }) {
  const [draft, setDraft] = useState({ title: row.title, outlet: row.outlet ?? '', published_at: row.published_at ?? '' });
  const [busy, setBusy] = useState(false);
  const dirty = draft.title !== row.title || draft.outlet !== (row.outlet ?? '') || draft.published_at !== (row.published_at ?? '');

  async function run(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await onPatch(row.id, body);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${cardCls} grid gap-4 sm:grid-cols-[160px_1fr]`}>
      <a href={`https://www.youtube.com/watch?v=${row.youtube_id}`} target="_blank" rel="noopener noreferrer nofollow" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${row.youtube_id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="aspect-video w-full rounded-lg object-cover ring-1 ring-gray-200"
        />
      </a>
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
          <span className={`rounded-full px-2.5 py-1 ${row.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {row.published ? 'Live' : 'Draft'}
          </span>
          {row.featured && <span className="rounded-full bg-brand-green-light px-2.5 py-1 text-brand-green">Lead clip</span>}
          <span className="font-mono text-gray-500">{row.youtube_id}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelCls}>Headline</span>
            <input className={inputCls} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </label>
          <label>
            <span className={labelCls}>Outlet / channel</span>
            <input className={inputCls} value={draft.outlet} onChange={(e) => setDraft((d) => ({ ...d, outlet: e.target.value }))} />
          </label>
          <label>
            <span className={labelCls}>Broadcast date</span>
            <input className={inputCls} type="date" value={draft.published_at} onChange={(e) => setDraft((d) => ({ ...d, published_at: e.target.value }))} />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" className={btnCls} disabled={!dirty || busy} onClick={() => run({ ...draft })}>Save changes</button>
          <button type="button" className={btnGhost} disabled={busy} onClick={() => run({ published: !row.published })}>{row.published ? 'Unpublish' : 'Publish'}</button>
          <button type="button" className={btnGhost} disabled={busy} onClick={() => run({ featured: !row.featured })}>{row.featured ? 'Unfeature' : 'Make lead'}</button>
          <button type="button" className={btnDanger} disabled={busy} onClick={() => onRemove(row.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
