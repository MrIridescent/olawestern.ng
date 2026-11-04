'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MediaTab from './MediaTab';
import VideoTab from './VideoTab';
import SourceTab from './SourceTab';
import SiteTab from './SiteTab';

/* ── tiny fetch helpers ─────────────────────────────────────── */

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({ success: false }));
  if (!res.ok || json.success === false) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}

const inputCls =
  'min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green';
const btnCls =
  'min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-50';
const btnGhost =
  'min-h-[40px] inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50';
const cardCls = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm';
const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500';

type Status = { kind: 'idle' | 'busy' | 'ok' | 'err'; msg?: string };

/* ── login ──────────────────────────────────────────────────── */

function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [st, setSt] = useState<Status>({ kind: 'idle' });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: pw }) });
      setSt({ kind: 'ok' });
      onDone();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Login failed.' });
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <div className={cardCls}>
        <h1 className="mb-1 text-xl font-extrabold text-brand-dark">Campaign CMS</h1>
        <p className="mb-6 text-sm text-gray-500">
          Sign in to edit the Truth Room ledger, publish newsroom releases, manage the track record and its
          press sources, upload campaign photography, publish broadcast video, change the homepage copy, work
          the Constituent Help Desk queue and review constituent leads.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="admin-pw">Admin password</label>
            <input id="admin-pw" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} autoComplete="current-password" />
          </div>
          <button type="submit" className={btnCls} disabled={st.kind === 'busy'}>
            {st.kind === 'busy' ? 'Signing in…' : 'Sign in'}
          </button>
          {st.kind === 'err' && <p className="text-sm font-semibold text-red-600">{st.msg}</p>}
        </form>
        <p className="mt-6 text-xs text-gray-600">
          Sessions last 12 hours. Set <code className="font-mono">ADMIN_PASSWORD</code> in the server environment for production use.
        </p>
      </div>
    </div>
  );
}

/* ── Truth Room tab ─────────────────────────────────────────── */

const VERDICTS = ['VERIFIED FACT', 'FALSE CLAIM', 'MISLEADING'] as const;

interface FactRow {
  id: string;
  claim_summary: string;
  verdict: string;
  detailed_explanation: string;
  official_document_url?: string | null;
  is_featured: boolean;
}

const emptyFact = { claim_summary: '', verdict: 'VERIFIED FACT' as string, detailed_explanation: '', official_document_url: '', is_featured: false };

function TruthRoomTab() {
  const [rows, setRows] = useState<FactRow[]>([]);
  const [form, setForm] = useState({ ...emptyFact });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [st, setSt] = useState<Status>({ kind: 'idle' });

  async function fetchUrlContent() {
    if (!form.official_document_url) return;
    setSt({ kind: 'busy' });
    try {
      const res = await api(`/api/admin/scrape?url=${encodeURIComponent(form.official_document_url)}`);
      setForm({ ...form, claim_summary: res.content.title, detailed_explanation: res.content.markdown });
      setSt({ kind: 'ok', msg: 'Content fetched successfully.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Failed to fetch content.' });
    }
  }

  const refresh = useCallback(async () => {
    const j = await api('/api/admin/fact-checks');
    setRows(j.data);
  }, []);
  useEffect(() => {
    refresh().catch(() => setSt({ kind: 'err', msg: 'Could not load the ledger.' }));
  }, [refresh]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    try {
      const payload: Record<string, unknown> = {
        claim_summary: form.claim_summary,
        verdict: form.verdict,
        detailed_explanation: form.detailed_explanation,
        is_featured: form.is_featured,
      };
      // Send the evidence link only when there is one: a new ruling without it is
      // refused by the publish gate, and on an edit an omitted key means "leave the
      // citation as it stands" — a ruling can gain a source, never lose one.
      const docUrl = form.official_document_url.trim();
      if (docUrl) payload.official_document_url = docUrl;
      if (editingId) await api(`/api/admin/fact-checks/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else await api('/api/admin/fact-checks', { method: 'POST', body: JSON.stringify(payload) });
      setForm({ ...emptyFact });
      setEditingId(null);
      await refresh();
      setSt({ kind: 'ok', msg: editingId ? 'Entry updated.' : 'Entry published to the Truth Room.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this Truth Room entry permanently?')) return;
    try {
      await api(`/api/admin/fact-checks/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  const verdictBadge: Record<string, string> = {
    'VERIFIED FACT': 'bg-brand-green-light text-brand-green-dark',
    'FALSE CLAIM': 'bg-red-50 text-red-700',
    MISLEADING: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={save} className={cardCls}>
        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-brand-dark">
          {editingId ? 'Edit entry' : 'New fact-check'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Claim summary</label>
            <textarea required rows={2} value={form.claim_summary} onChange={(e) => setForm({ ...form, claim_summary: e.target.value })} className={inputCls} placeholder="The claim circulating in the ward…" />
          </div>
          <div>
            <label className={labelCls}>Verdict</label>
            <select value={form.verdict} onChange={(e) => setForm({ ...form, verdict: e.target.value })} className={inputCls}>
              {VERDICTS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Detailed explanation (the evidence)</label>
            <textarea required rows={4} value={form.detailed_explanation} onChange={(e) => setForm({ ...form, detailed_explanation: e.target.value })} className={inputCls} placeholder="What the documents and receipts actually show…" />
          </div>
          <div>
            <div>
            <label className={labelCls}>Evidence document URL (required to publish)</label>
            <div className="flex gap-2">
              <input value={form.official_document_url} onChange={(e) => setForm({ ...form, official_document_url: e.target.value })} className={inputCls} placeholder="https://… the notice, receipt or report this ruling rests on" />
              <button type="button" onClick={fetchUrlContent} className={btnCls} disabled={st.kind === 'busy'}>Fetch</button>
            </div>
            <p className="mt-1 text-xs text-gray-600">A ruling with no source is just another claim. Nothing reaches the Truth Room until this link is filled.</p>
          </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4 accent-brand-green" />
            Feature on the Truth Room homepage
          </label>
          <div className="flex gap-2">
            <button type="submit" className={btnCls} disabled={st.kind === 'busy'}>
              {editingId ? 'Save changes' : 'Publish to Truth Room'}
            </button>
            {editingId && (
              <button type="button" className={btnGhost} onClick={() => { setEditingId(null); setForm({ ...emptyFact }); }}>
                Cancel edit
              </button>
            )}
          </div>
          {st.kind === 'ok' && <p className="text-sm font-semibold text-brand-green-dark">{st.msg}</p>}
          {st.kind === 'err' && <p className="text-sm font-semibold text-red-600">{st.msg}</p>}
        </div>
      </form>

      <div className={cardCls}>
        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-brand-dark">Ledger ({rows.length})</h3>
        <ul className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-brand-dark">{r.claim_summary}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${verdictBadge[r.verdict] ?? 'bg-gray-100 text-gray-600'}`}>{r.verdict}</span>
              </div>
              <p className="mb-2 line-clamp-2 text-xs text-gray-500">{r.detailed_explanation}</p>
              <div className="flex items-center gap-2">
                {r.is_featured && <span className="rounded bg-brand-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">FEATURED</span>}
                <button className={btnGhost} onClick={() => { setEditingId(r.id); setForm({ claim_summary: r.claim_summary, verdict: r.verdict, detailed_explanation: r.detailed_explanation, official_document_url: r.official_document_url ?? '', is_featured: r.is_featured }); }}>Edit</button>
                <button className={`${btnGhost} !text-red-600 hover:!bg-red-50`} onClick={() => remove(r.id)}>Delete</button>
              </div>
            </li>
          ))}
          {!rows.length && <li className="text-sm text-gray-600">No entries yet.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ── Newsroom tab ───────────────────────────────────────────── */

interface PressRow { id: string; published_at: string | null; title: string; summary: string; source: string; body: string; pdf_url?: string | null }

const emptyPress = { title: '', summary: '', body: '', source: 'campaign_hq', pdf_url: '' };

function NewsroomTab() {
  const [rows, setRows] = useState<PressRow[]>([]);
  const [form, setForm] = useState({ ...emptyPress });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [st, setSt] = useState<Status>({ kind: 'idle' });

  const refresh = useCallback(async () => {
    const j = await api('/api/admin/press');
    setRows(j.data);
  }, []);
  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    try {
      const payload = { ...form, pdf_url: form.pdf_url.trim() || null };
      if (editingId) await api(`/api/admin/press/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else await api('/api/admin/press', { method: 'POST', body: JSON.stringify(payload) });
      setForm({ ...emptyPress });
      setEditingId(null);
      await refresh();
      setSt({ kind: 'ok', msg: editingId ? 'Release updated on /news.' : 'Release published to /news.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Publish failed.' });
    }
  }

  /** Take a release off the newsfeed without losing the text, or put it back. */
  async function toggle(r: PressRow) {
    setSt({ kind: 'busy' });
    try {
      await api(`/api/admin/press/${r.id}`, { method: 'PATCH', body: JSON.stringify({ publish: !r.published_at }) });
      await refresh();
      setSt({ kind: 'ok', msg: r.published_at ? 'Release taken offline.' : 'Release back on the newsfeed.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Could not change the release.' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this release permanently?')) return;
    try {
      await api(`/api/admin/press/${id}`, { method: 'DELETE' });
      if (editingId === id) { setEditingId(null); setForm({ ...emptyPress }); }
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  const SOURCE_LABEL: Record<string, string> = { campaign_hq: 'Campaign HQ', festaconline: 'FestaOnline', partner_press: 'Partner press' };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={save} className={cardCls}>
        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-brand-dark">
          {editingId ? 'Correct this release' : 'New release'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Headline</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Summary (optional — auto-filled from the body if left blank)</label>
            <textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Body</label>
            <textarea required rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputCls}>
                {Object.keys(SOURCE_LABEL).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>PDF link (optional)</label>
              <input value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} className={inputCls} placeholder="https://…" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={btnCls} disabled={st.kind === 'busy'}>
              {editingId ? 'Save changes' : 'Publish release'}
            </button>
            {editingId && (
              <button type="button" className={btnGhost} onClick={() => { setEditingId(null); setForm({ ...emptyPress }); }}>
                Cancel edit
              </button>
            )}
          </div>
          {st.kind === 'ok' && <p className="text-sm font-semibold text-brand-green-dark">{st.msg}</p>}
          {st.kind === 'err' && <p className="text-sm font-semibold text-red-600">{st.msg}</p>}
        </div>
      </form>

      <div className={cardCls}>
        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-brand-dark">Published ({rows.length})</h3>
        <ul className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-brand-dark">{r.title}</p>
                <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">{SOURCE_LABEL[r.source] ?? r.source}</span>
              </div>
              <p className="mb-2 line-clamp-2 text-xs text-gray-500">{r.summary}</p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                <span>{r.published_at ? new Date(r.published_at).toLocaleString() : 'unpublished'}</span>
                <button className={`${btnGhost} ml-auto`} onClick={() => { setEditingId(r.id); setForm({ title: r.title, summary: r.summary, body: r.body, source: r.source, pdf_url: r.pdf_url ?? '' }); }}>Edit</button>
                <button className={btnGhost} onClick={() => toggle(r)}>{r.published_at ? 'Take offline' : 'Publish'}</button>
                <button className={`${btnGhost} !text-red-600 hover:!bg-red-50`} onClick={() => remove(r.id)}>Delete</button>
              </div>
            </li>
          ))}
          {!rows.length && <li className="text-sm text-gray-600">No releases yet.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ── Track record tab ───────────────────────────────────────── */

const CATEGORIES = ['Infrastructure', 'Youth & Sports', 'Security', 'Philanthropy', 'Legislative'] as const;

interface RecordRow { id: string; title: string; category: string; ward_impact: string; description: string; image_url?: string | null; verification_source_url?: string | null }

const emptyRec = { title: '', category: 'Infrastructure' as string, ward_impact: 'Amuwo-Odofin Constituency I', description: '', image_url: '', verification_source_url: '' };

function RecordTab() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [photos, setPhotos] = useState<{ src: string; alt: string }[]>([]);
  const [form, setForm] = useState({ ...emptyRec });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [st, setSt] = useState<Status>({ kind: 'idle' });

  const refresh = useCallback(async () => {
    const [record, media] = await Promise.all([api('/api/admin/record'), api('/api/admin/media')]);
    setRows(record.data);
    // Only library photos the site already publishes can be attached, so a
    // record entry can never point at a draft or a withdrawn image.
    setPhotos((media.data as { src: string; alt: string; published?: boolean }[])
      .filter((m) => m.published !== false)
      .map((m) => ({ src: m.src, alt: m.alt })));
  }, []);
  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    try {
      const payload: Record<string, unknown> = {
        ...form,
        image_url: form.image_url.trim() || null,
      };
      // Same rule as the Truth Room: a new record entry is refused without its
      // report, and an edit that leaves the box blank keeps the citation already on
      // the entry rather than stripping it.
      const srcUrl = form.verification_source_url.trim();
      if (srcUrl) payload.verification_source_url = srcUrl;
      if (editingId) await api(`/api/admin/record/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else await api('/api/admin/record', { method: 'POST', body: JSON.stringify(payload) });
      setForm({ ...emptyRec });
      setEditingId(null);
      await refresh();
      setSt({ kind: 'ok', msg: editingId ? 'Record entry updated.' : 'Entry added to the service record.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this record entry?')) return;
    try {
      await api(`/api/admin/record/${id}`, { method: 'DELETE' });
      if (editingId === id) { setEditingId(null); setForm({ ...emptyRec }); }
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={save} className={cardCls}>
        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-brand-dark">
          {editingId ? 'Correct this entry' : 'New service-record entry'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Ward impact</label>
              <input value={form.ward_impact} onChange={(e) => setForm({ ...form, ward_impact: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Photo from the media library (optional)</label>
            <select value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls}>
              <option value="">No photo</option>
              {photos.map((p) => <option key={p.src} value={p.src}>{p.alt.slice(0, 70)}</option>)}
            </select>
            {form.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image_url} alt="" className="mt-3 h-24 w-full rounded-lg object-cover ring-1 ring-gray-200" />
            )}
          </div>
          <div>
            <label className={labelCls}>Report that proves this (required to publish)</label>
            <input value={form.verification_source_url} onChange={(e) => setForm({ ...form, verification_source_url: e.target.value })} className={inputCls} placeholder="https://… the newspaper, INEC page or government notice" />
            <p className="mt-1 text-xs text-gray-600">Every line of the track record is published against a source. Without this link the entry stays on the desk.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={btnCls} disabled={st.kind === 'busy'}>
              {editingId ? 'Save changes' : 'Add to record'}
            </button>
            {editingId && (
              <button type="button" className={btnGhost} onClick={() => { setEditingId(null); setForm({ ...emptyRec }); }}>
                Cancel edit
              </button>
            )}
          </div>
          {st.kind === 'ok' && <p className="text-sm font-semibold text-brand-green-dark">{st.msg}</p>}
          {st.kind === 'err' && <p className="text-sm font-semibold text-red-600">{st.msg}</p>}
        </div>
      </form>

      <div className={cardCls}>
        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-brand-dark">Record ({rows.length})</h3>
        <ul className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-brand-dark">{r.title}</p>
                <span className="shrink-0 rounded bg-brand-green-light px-1.5 py-0.5 text-[10px] font-bold text-brand-green-dark">{r.category}</span>
              </div>
              <p className="mb-2 line-clamp-2 text-xs text-gray-500">{r.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-gray-600">{r.ward_impact}</span>
                <button className={`${btnGhost} ml-auto`} onClick={() => { setEditingId(r.id); setForm({ title: r.title, category: r.category, ward_impact: r.ward_impact, description: r.description, image_url: r.image_url ?? '', verification_source_url: r.verification_source_url ?? '' }); }}>Edit</button>
                <button className={`${btnGhost} !text-red-600 hover:!bg-red-50`} onClick={() => remove(r.id)}>Delete</button>
              </div>
            </li>
          ))}
          {!rows.length && <li className="text-sm text-gray-600">No entries yet.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ── Leads tab ──────────────────────────────────────────────── */

interface LeadRow { id: string; created_at: string; full_name: string; phone_number: string; ward_location?: string; ward?: string; primary_concern?: string; message_type?: string; message_body?: string; status: string; email?: string | null; address_street?: string | null; polling_unit_code?: string | null }

function LeadsTab() {
  const [volunteers, setVolunteers] = useState<LeadRow[]>([]);
  const [inquiries, setInquiries] = useState<LeadRow[]>([]);
  const [st, setSt] = useState<Status>({ kind: 'idle' });

  const refresh = useCallback(async () => {
    const j = await api('/api/admin/leads');
    setVolunteers(j.data.volunteers);
    setInquiries(j.data.inquiries);
  }, []);
  useEffect(() => {
    refresh().catch(() => setSt({ kind: 'err', msg: 'Could not load leads.' }));
  }, [refresh]);

  async function setStatus(id: string, status: string) {
    try {
      await api(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Update failed.' });
    }
  }

  /** Spam and duplicate rows are the only reason to delete a lead — export first. */
  async function discard(kind: 'inquiries' | 'volunteers', id: string) {
    if (!confirm('Delete this lead permanently? Export the CSV first if you may need it later.')) return;
    try {
      await api(`/api/admin/${kind}/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  const th = 'px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500';
  const td = 'px-3 py-2 text-xs text-gray-700 align-top';

  return (
    <div className="space-y-6">
      {st.kind === 'err' && <p className="text-sm font-semibold text-red-600">{st.msg}</p>}

      <div className={cardCls}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand-dark">Volunteer sign-ups ({volunteers.length})</h3>
          <a href="/api/admin/leads/export?type=volunteers" className={btnGhost}>Export CSV</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr><th className={th}>When</th><th className={th}>Name</th><th className={th}>Phone</th><th className={th}>Ward</th><th className={th}>Concern</th><th className={th}>Status</th><th className={th}>Clean up</th></tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id} className="border-b border-gray-100">
                  <td className={td}>{new Date(v.created_at).toLocaleString()}</td>
                  <td className={`${td} font-semibold`}>{v.full_name}</td>
                  <td className={td}>
                    <a href={`tel:${v.phone_number}`} className="font-semibold text-brand-blue underline decoration-brand-blue/30 underline-offset-2">
                      {v.phone_number}
                    </a>
                  </td>
                  <td className={td}>{v.ward_location}</td>
                  <td className={td}>{v.primary_concern}</td>
                  <td className={td}>{v.status}</td>
                  <td className={td}>
                    <button className={`${btnGhost} !text-red-600 hover:!bg-red-50`} onClick={() => discard('volunteers', v.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!volunteers.length && <tr><td className={`${td} italic text-gray-600`} colSpan={7}>No sign-ups yet — submissions from the Join page land here instantly.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cardCls}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand-dark">Ask-Ola inquiries ({inquiries.length})</h3>
          <a href="/api/admin/leads/export?type=inquiries" className={btnGhost}>Export CSV</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr><th className={th}>When</th><th className={th}>Name</th><th className={th}>Phone</th><th className={th}>Ward</th><th className={th}>Type</th><th className={th}>Message</th><th className={th}>Status</th><th className={th}>Clean up</th></tr>
            </thead>
            <tbody>
              {inquiries.map((q) => (
                <tr key={q.id} className="border-b border-gray-100">
                  <td className={td}>{new Date(q.created_at).toLocaleString()}</td>
                  <td className={`${td} font-semibold`}>{q.full_name}</td>
                  <td className={td}>
                    <a href={`tel:${q.phone_number}`} className="font-semibold text-brand-blue underline decoration-brand-blue/30 underline-offset-2">
                      {q.phone_number}
                    </a>
                  </td>
                  <td className={td}>{q.ward}</td>
                  <td className={td}>{q.message_type}</td>
                  <td className={`${td} max-w-xs`}>{q.message_body}</td>
                  <td className={td}>
                    <select value={q.status} onChange={(e) => setStatus(q.id, e.target.value)} className="min-h-[44px] rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
                      <option value="new">new</option>
                      <option value="reviewed">reviewed</option>
                      <option value="answered">answered</option>
                    </select>
                  </td>
                  <td className={td}>
                    <button className={`${btnGhost} !text-red-600 hover:!bg-red-50`} onClick={() => discard('inquiries', q.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!inquiries.length && <tr><td className={`${td} italic text-gray-600`} colSpan={8}>No inquiries yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Help Desk tab (constituent issue tracker) ──────────────── */

interface IssueRow {
  id: string;
  created_at: string;
  title: string;
  ward: string;
  category: string;
  detail: string | null;
  reporter_name: string | null;
  reporter_phone: string | null;
  published: boolean;
  status: 'submitted' | 'under_review' | 'action_scheduled' | 'resolved';
  update_note: string | null;
}

const ISSUE_STATUS_LABEL: Record<IssueRow['status'], string> = {
  submitted: 'Received',
  under_review: 'Under review',
  action_scheduled: 'Action scheduled',
  resolved: 'Resolved',
};

function HelpDeskTab() {
  const [rows, setRows] = useState<IssueRow[]>([]);
  const [note, setNote] = useState<Record<string, string>>({});
  const [st, setSt] = useState<Status>({ kind: 'idle' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', ward: 'Festac I', category: 'Drainage & Flooding', detail: '', update_note: '', published: true, status: 'under_review' });

  const refresh = useCallback(async () => {
    const j = await api('/api/admin/issues');
    setRows(j.data as IssueRow[]);
  }, []);

  useEffect(() => {
    refresh().catch(() => setSt({ kind: 'err', msg: 'Could not load the help-desk ledger.' }));
  }, [refresh]);

  async function patch(id: string, body: Record<string, unknown>) {
    setSt({ kind: 'busy' });
    try {
      await api(`/api/admin/issues/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      await refresh();
      setSt({ kind: 'ok', msg: 'Saved.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Update failed.' });
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this report permanently? Resident contact details go with it.')) return;
    try {
      await api(`/api/admin/issues/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  async function logIssue(e: React.FormEvent) {
    e.preventDefault();
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/issues', { method: 'POST', body: JSON.stringify(form) });
      setForm({ ...form, title: '', detail: '', update_note: '' });
      setShowForm(false);
      await refresh();
      setSt({ kind: 'ok', msg: 'Issue logged.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Could not log the issue.' });
    }
  }

  const pending = rows.filter((r) => !r.published).length;

  return (
    <div className="space-y-5">
      {st.kind === 'ok' && <p className="text-sm font-semibold text-brand-green">{st.msg}</p>}
      {st.kind === 'err' && <p className="text-sm font-semibold text-red-600">{st.msg}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          <strong className="text-brand-dark">{rows.length}</strong> reports on the desk ·{' '}
          <strong className="text-brand-dark">{pending}</strong> awaiting publication.
          Reporter names and numbers stay here — the public dashboard never shows them.
        </p>
        <button className={btnCls} onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'Log an issue'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={logIssue} className={cardCls}>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-brand-dark">New desk entry</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="iss-title">Title</label>
              <input id="iss-title" required minLength={8} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Street light failure on 4th Avenue" />
            </div>
            <div>
              <label className={labelCls} htmlFor="iss-ward">Ward</label>
              <input id="iss-ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="iss-cat">Category</label>
              <select id="iss-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {['Drainage & Flooding', 'Roads & Streetlighting', 'Water & Boreholes', 'Community Security', 'Waste & Sanitation', 'Market & SME'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="iss-status">Status</label>
              <select id="iss-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                {(['submitted', 'under_review', 'action_scheduled', 'resolved'] as const).map((s) => <option key={s} value={s}>{ISSUE_STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="iss-pub">Publication</label>
              <select id="iss-pub" value={form.published ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, published: e.target.value === 'yes' })} className={inputCls}>
                <option value="yes">Publish to the public dashboard</option>
                <option value="no">Keep internal</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="iss-detail">What the residents reported</label>
              <textarea id="iss-detail" rows={2} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="iss-note">Public progress note (plain language)</label>
              <textarea id="iss-note" rows={2} value={form.update_note} onChange={(e) => setForm({ ...form, update_note: e.target.value })} className={inputCls} />
            </div>
          </div>
          <button type="submit" className={`${btnCls} mt-4`} disabled={st.kind === 'busy'}>Save entry</button>
        </form>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className={cardCls}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${r.published ? 'bg-brand-green-light text-brand-green' : 'bg-gray-100 text-gray-600'}`}>
                {r.published ? 'Published' : 'Internal only'}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-gray-600">{r.category}</span>
              <span className="text-xs text-gray-500">{r.ward} · {new Date(r.created_at).toLocaleDateString('en-NG')}</span>
              {r.reporter_phone && (
                <a href={`tel:${r.reporter_phone}`} className="ml-auto text-xs font-bold text-brand-green underline">{r.reporter_name ?? 'Reporter'} · {r.reporter_phone}</a>
              )}
            </div>
            <p className="mt-2 text-sm font-bold text-brand-dark">{r.title}</p>
            {r.detail && <p className="mt-1 text-xs text-gray-600">{r.detail}</p>}

            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,200px)_1fr]">
              <select
                value={r.status}
                onChange={(e) => patch(r.id, { status: e.target.value })}
                className="min-h-[44px] rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                aria-label={`Status for ${r.title}`}
              >
                {(['submitted', 'under_review', 'action_scheduled', 'resolved'] as const).map((s) => <option key={s} value={s}>{ISSUE_STATUS_LABEL[s]}</option>)}
              </select>
              <input
                value={note[r.id] ?? r.update_note ?? ''}
                onChange={(e) => setNote({ ...note, [r.id]: e.target.value })}
                placeholder="Public progress note"
                aria-label={`Progress note for ${r.title}`}
                className="min-h-[44px] rounded-lg border border-gray-300 px-3 py-1.5 text-xs"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button className={btnGhost} onClick={() => patch(r.id, { update_note: note[r.id] ?? '' })}>Save note</button>
              <button className={btnGhost} onClick={() => patch(r.id, { published: !r.published })}>{r.published ? 'Unpublish' : 'Publish'}</button>
              <button className={`${btnGhost} !text-red-600 hover:!bg-red-50`} onClick={() => remove(r.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!rows.length && <p className={cardCls}>The desk is empty — resident reports from the Help Desk page land here instantly.</p>}
      </div>
    </div>
  );
}

/* ── dashboard shell ────────────────────────────────────────── */

const TABS = [
  { key: 'truth', label: 'Truth Room' },
  { key: 'news', label: 'Newsroom' },
  { key: 'record', label: 'Track Record' },
  { key: 'sources', label: 'Sources' },
  { key: 'media', label: 'Photo Library' },
  { key: 'video', label: 'Video' },
  { key: 'site', label: 'Site Copy' },
  { key: 'helpdesk', label: 'Help Desk' },
  { key: 'leads', label: 'Leads Inbox' },
] as const;

export default function AdminDashboard({
  positions,
  storage = { backend: 'file', writable: true },
}: {
  positions: { slot: string; label: string; ratio: string }[];
  storage?: { backend: 'supabase' | 'file'; writable: boolean };
}) {
  const [auth, setAuth] = useState<'checking' | 'out' | 'in'>('checking');
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('truth');

  useEffect(() => {
    api('/api/admin/login')
      .then((j) => setAuth(j.authenticated ? 'in' : 'out'))
      .catch(() => setAuth('out'));
    // The Live Desk deep-links: ⌘K and the integrity report both send the desk to a
    // queue by name, so ?tab= picks the tab when there is one to pick.
    const want = new URLSearchParams(window.location.search).get('tab');
    if (want && TABS.some((t) => t.key === want)) setTab(want as (typeof TABS)[number]['key']);
  }, []);

  async function logout() {
    try { await api('/api/admin/login', { method: 'DELETE' }); } catch { /* ignore */ }
    setAuth('out');
  }

  const content = useMemo(() => {
    switch (tab) {
      case 'truth': return <TruthRoomTab />;
      case 'news': return <NewsroomTab />;
      case 'record': return <RecordTab />;
      case 'helpdesk': return <HelpDeskTab />;
      case 'leads': return <LeadsTab />;
      case 'sources': return <SourceTab />;
      case 'media': return <MediaTab positions={positions} />;
      case 'video': return <VideoTab />;
      case 'site': return <SiteTab />;
    }
  }, [tab, positions]);

  if (auth === 'checking') return <p className="py-16 text-center text-sm text-gray-600">Checking session…</p>;
  if (auth === 'out') return <Login onDone={() => setAuth('in')} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Ola Western Campaign CMS</h1>
          <p className="text-sm text-gray-500">Everything you publish here is live on the public site immediately.</p>
          <p className="mt-1 text-xs text-gray-500">
            Saving to{' '}
            <span className="font-semibold text-brand-dark">
              {storage.backend === 'supabase' ? 'Supabase' : 'the campaign data file'}
            </span>
            {storage.backend === 'supabase' && !storage.writable && (
              <span className="ml-1 font-semibold text-amber-700">
                — set SUPABASE_SERVICE_ROLE_KEY or writes will fail.
              </span>
            )}
          </p>
        </div>
        <button onClick={logout} className={btnGhost}>Sign out</button>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? 'border-brand-green text-brand-green-dark' : 'border-transparent text-gray-500 hover:text-brand-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {content}
    </div>
  );
}