'use client';

/**
 * MediaTab — the photo library the whole site reads from.
 *
 * Upload a picture, give it alt text and a caption, bind it to a named position
 * and it replaces the branded placeholder in that frame everywhere the site uses
 * it. Dimensions and shape are read from the file itself, so the frame chosen
 * always matches the photo — a portrait never lands in a 16:9 band and gets its
 * head cropped.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, postForm, btnCls, btnDanger, btnGhost, cardCls, inputCls, labelCls, type Status } from './cms';
import { Field } from './Ui';

export interface MediaPosition {
  slot: string;
  label: string;
  ratio: string;
}

interface MediaRow {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
  credit: string | null;
  source_url: string | null;
  width: number | null;
  height: number | null;
  orientation: 'portrait' | 'landscape' | 'square';
  slot: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
}

const empty = {
  src: '',
  alt: '',
  caption: '',
  credit: '',
  source_url: '',
  slot: '',
  width: null as number | null,
  height: null as number | null,
  orientation: '' as '' | 'portrait' | 'landscape' | 'square',
  published: true,
  featured: false,
};

interface UploadResult {
  src: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | 'square';
  type: string;
  bytes: number;
  suggested_alt: string | null;
}

export default function MediaTab({ positions }: { positions: MediaPosition[] }) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [st, setSt] = useState<Status>({ kind: 'idle' });
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const j = await api<{ data: MediaRow[] }>('/api/admin/media');
    setRows(j.data);
  }, []);

  useEffect(() => {
    refresh().catch(() => setSt({ kind: 'err', msg: 'Could not load the library.' }));
  }, [refresh]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSt({ kind: 'busy' });
    setUploadPct(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const j = await postForm<{ data: UploadResult }>('/api/admin/media/upload', fd);
      setForm((f) => ({
        ...f,
        src: j.data.src,
        width: j.data.width,
        height: j.data.height,
        orientation: j.data.orientation,
        alt: f.alt || j.data.suggested_alt || '',
        credit: f.credit || 'Photo: campaign',
      }));
      setUploadPct(`${j.data.width}×${j.data.height}px · ${j.data.orientation} · ${(j.data.bytes / 1048576).toFixed(2)} MB`);
      setSt({ kind: 'ok', msg: 'Image received — add alt text and pick the position it fills, then save.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Upload failed.' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          src: form.src,
          alt: form.alt,
          caption: form.caption,
          credit: form.credit,
          source_url: form.source_url,
          slot: form.slot,
          width: form.width,
          height: form.height,
          orientation: form.orientation,
          published: form.published,
          featured: form.featured,
        }),
      });
      setForm({ ...empty });
      setUploadPct(null);
      await refresh();
      setSt({ kind: 'ok', msg: 'Photo added to the library and live in its frame.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setSt({ kind: 'busy' });
    try {
      await api(`/api/admin/media/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      await refresh();
      setSt({ kind: 'ok', msg: 'Saved.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this photo from the library? The frame falls back to the branded panel.')) return;
    try {
      await api(`/api/admin/media/${id}`, { method: 'DELETE' });
      await refresh();
      setSt({ kind: 'ok', msg: 'Photo removed.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  const openSlots = positions.filter((p) => !rows.some((r) => r.published && r.slot === p.slot));

  return (
    <div className="space-y-6">
      {/* positions still empty */}
      {openSlots.length > 0 && (
        <div className={`${cardCls} !bg-amber-50 !border-amber-200`}>
          <p className="text-sm font-bold text-amber-900">{openSlots.length} frame{openSlots.length === 1 ? '' : 's'} still show the branded panel</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
            Upload a photo for any of these positions and it appears on the site immediately — no redeploy.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {openSlots.map((p) => (
              <li key={p.slot}>
                <button type="button" className={btnGhost} onClick={() => setForm((f) => ({ ...f, slot: p.slot }))}>
                  {p.label} · {p.ratio}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* add photo */}
      <form onSubmit={save} className={cardCls}>
        <h2 className="mb-1 text-lg font-extrabold text-brand-dark">Add a photograph</h2>
        <p className="mb-4 text-sm text-gray-500">
          PNG, JPEG, GIF, WEBP or AVIF up to 10 MB. Real pixel dimensions are read from the file, so the
          picture always matches the shape of the frame it is assigned to.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className={labelCls}>File</span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                id="media-file"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
                onChange={onPick}
                className="min-h-[44px] w-full rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-green file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white sm:w-auto"
              />
              <button type="button" className={btnGhost} onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Choose image'}
              </button>
            </div>
            {form.src && (
              <p className="mt-2 break-all font-mono text-[11px] text-gray-600">
                {form.src}
                {uploadPct ? ` — ${uploadPct}` : form.width ? ` — ${form.width}×${form.height}px · ${form.orientation}` : ''}
              </p>
            )}
          </div>

          <Field label="Position on the site" hint="Where this photo will appear. Leave blank to keep it unpublished in the library.">
            <select className={inputCls} value={form.slot} onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}>
              <option value="">— not assigned —</option>
              {positions.map((p) => (
                <option key={p.slot} value={p.slot}>
                  {p.label} ({p.ratio})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Shape" hint="Taken from the file automatically.">
            <input className={inputCls} value={form.orientation || '—'} readOnly placeholder="Upload a file" />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Alt text (required)" hint="Describes the photo for screen readers and search. Name what is actually happening.">
              <textarea className={inputCls} rows={2} required value={form.alt} onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))} placeholder="Ola Western addressing residents at the Food Fest distribution in FESTAC Town" />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Caption" hint="Shown under the photo. Describe the documented event only.">
              <input className={inputCls} value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} placeholder="Food Fest, March 2024 — palliatives distributed to more than 1,000 households." />
            </Field>
          </div>

          <Field label="Credit" hint="Who took the picture, e.g. Photo: PM Express.">
            <input className={inputCls} value={form.credit} onChange={(e) => setForm((f) => ({ ...f, credit: e.target.value }))} placeholder="Photo: Festac Online" />
          </Field>

          <Field label="Source article URL" hint="Optional http(s) link to the report the photo ran in — the credit becomes clickable.">
            <input className={inputCls} type="url" value={form.source_url} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://…" />
          </Field>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" className="h-5 w-5" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
            Publish now
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" className="h-5 w-5" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
            Feature first (carousel and gallery lead)
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className={btnCls} disabled={!form.src || !form.alt || !form.orientation || st.kind === 'busy'}>
            Save to library
          </button>
          <button type="button" className={btnGhost} onClick={() => { setForm({ ...empty }); setUploadPct(null); }}>
            Clear
          </button>
          <span className="text-sm font-semibold text-gray-600">{st.kind === 'busy' ? 'Working…' : ''}</span>
        </div>
        {st.kind === 'err' && <p className="mt-3 text-sm font-semibold text-red-600">{st.msg}</p>}
        {st.kind === 'ok' && <p className="mt-3 text-sm font-semibold text-green-700">{st.msg}</p>}
      </form>

      {/* library */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-brand-dark">Library — {rows.length} photo{rows.length === 1 ? '' : 's'}</h2>
        {rows.map((r) => (
          <MediaCard key={r.id} row={r} positions={positions} onPatch={patch} onRemove={remove} />
        ))}
        {!rows.length && <p className={`${cardCls} text-sm text-gray-500`}>No photos yet. Upload the first one above.</p>}
      </div>
    </div>
  );
}

function MediaCard({
  row,
  positions,
  onPatch,
  onRemove,
}: {
  row: MediaRow;
  positions: MediaPosition[];
  onPatch: (id: string, body: Record<string, unknown>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState({
    alt: row.alt,
    caption: row.caption ?? '',
    credit: row.credit ?? '',
    source_url: row.source_url ?? '',
    slot: row.slot ?? '',
  });
  const [busy, setBusy] = useState(false);
  const dirty =
    draft.alt !== row.alt ||
    draft.caption !== (row.caption ?? '') ||
    draft.credit !== (row.credit ?? '') ||
    draft.source_url !== (row.source_url ?? '') ||
    draft.slot !== (row.slot ?? '');

  async function run(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await onPatch(row.id, body);
    } finally {
      setBusy(false);
    }
  }

  const src = row.src;

  return (
    <div className={`${cardCls} grid gap-4 sm:grid-cols-[160px_1fr]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={row.alt}
        loading="lazy"
        className="h-28 w-full rounded-lg object-cover ring-1 ring-gray-200 sm:h-full sm:max-h-40"
      />
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
          <span className={`rounded-full px-2.5 py-1 ${row.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {row.published ? 'Live' : 'Draft'}
          </span>
          {row.featured && <span className="rounded-full bg-brand-green-light px-2.5 py-1 text-brand-green">Featured</span>}
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{row.orientation}</span>
          {row.width && row.height ? <span className="text-gray-500">{row.width}×{row.height}px</span> : null}
          {row.slot && <span className="text-brand-blue-dark">{positions.find((p) => p.slot === row.slot)?.label ?? row.slot}</span>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelCls}>Alt text</span>
            <input className={inputCls} value={draft.alt} onChange={(e) => setDraft((d) => ({ ...d, alt: e.target.value }))} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelCls}>Caption</span>
            <input className={inputCls} value={draft.caption} onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))} />
          </label>
          <label>
            <span className={labelCls}>Credit</span>
            <input className={inputCls} value={draft.credit} onChange={(e) => setDraft((d) => ({ ...d, credit: e.target.value }))} />
          </label>
          <label>
            <span className={labelCls}>Source URL</span>
            <input className={inputCls} type="url" value={draft.source_url} onChange={(e) => setDraft((d) => ({ ...d, source_url: e.target.value }))} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelCls}>Position</span>
            <select className={inputCls} value={draft.slot} onChange={(e) => setDraft((d) => ({ ...d, slot: e.target.value }))}>
              <option value="">— unassigned —</option>
              {positions.map((p) => (
                <option key={p.slot} value={p.slot}>{p.label} ({p.ratio})</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" className={btnCls} disabled={!dirty || busy} onClick={() => run({ ...draft, slot: draft.slot || null })}>
            Save changes
          </button>
          <button type="button" className={btnGhost} disabled={busy} onClick={() => run({ published: !row.published })}>
            {row.published ? 'Unpublish' : 'Publish'}
          </button>
          <button type="button" className={btnGhost} disabled={busy} onClick={() => run({ featured: !row.featured })}>
            {row.featured ? 'Unfeature' : 'Feature'}
          </button>
          <button type="button" className={btnDanger} disabled={busy} onClick={() => onRemove(row.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
