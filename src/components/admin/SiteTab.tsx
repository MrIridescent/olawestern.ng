'use client';

/**
 * SiteTab — homepage headline, the stat ticker, the candidate file and the
 * campaign's social channels.
 *
 * These are the fields a campaign changes under pressure — after a primary
 * result, a endorsement, an attack that needs an answer — so they are editable
 * here instead of in code. The candidate file keeps the confirmation rule: a
 * row with no value stays hidden from voters, which is how the site avoids
 * publishing a date of birth or an education the campaign has not confirmed.
 */
import { useCallback, useEffect, useState } from 'react';
import { api, btnCls, btnDanger, btnGhost, cardCls, inputCls, labelCls, type Status } from './cms';
import { Field, StatusLine } from './Ui';

interface Stat { value: string; label: string }
interface Settings {
  hero_kicker: string;
  hero_title: string;
  hero_slogan: string;
  hero_body: string;
  cta_title: string;
  cta_body: string;
  stats: Stat[];
}
interface FactRow { id: string; key: string; value: string | null; note: string | null; sort: number }
interface SocialRow { id: string; platform: string; label: string; handle: string; url: string | null; sort: number }

const PLATFORMS = ['x', 'facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp'] as const;

export default function SiteTab() {
  const [st, setSt] = useState<Status>({ kind: 'idle' });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [facts, setFacts] = useState<FactRow[]>([]);
  const [socials, setSocials] = useState<SocialRow[]>([]);

  const refresh = useCallback(async () => {
    const [s, f, soc] = await Promise.all([
      api<{ data: Settings }>('/api/admin/settings'),
      api<{ data: FactRow[] }>('/api/admin/profile'),
      api<{ data: SocialRow[] }>('/api/admin/socials'),
    ]);
    setSettings(s.data);
    setFacts(f.data);
    setSocials(soc.data);
  }, []);

  useEffect(() => {
    refresh().catch(() => setSt({ kind: 'err', msg: 'Could not load the site settings.' }));
  }, [refresh]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(settings) });
      await refresh();
      setSt({ kind: 'ok', msg: 'Homepage copy updated — the public page now shows it.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  if (!settings) return <p className="py-10 text-center text-sm text-gray-600">Loading site settings…</p>;

  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s!, ...patch }));

  return (
    <div className="space-y-6">
      {/* ── homepage copy ─────────────────────────────────────── */}
      <form onSubmit={saveSettings} className={cardCls}>
        <h2 className="mb-1 text-lg font-extrabold text-brand-dark">Homepage message</h2>
        <p className="mb-4 text-sm text-gray-500">
          The hero band and the closing call to action. Keep the wording to what the dossier supports — this is
          the page a journalist will screenshot.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kicker" hint="The small line above the headline, e.g. “APC · Amuwo-Odofin Constituency I”.">
            <input className={inputCls} value={settings.hero_kicker} onChange={(e) => set({ hero_kicker: e.target.value })} />
          </Field>
          <Field label="Headline" required>
            <input className={inputCls} required value={settings.hero_title} onChange={(e) => set({ hero_title: e.target.value })} />
          </Field>
          <Field label="Slogan">
            <input className={inputCls} value={settings.hero_slogan} onChange={(e) => set({ hero_slogan: e.target.value })} />
          </Field>
          <Field label="Hero paragraph">
            <textarea className={inputCls} rows={4} value={settings.hero_body} onChange={(e) => set({ hero_body: e.target.value })} />
          </Field>
          <div className="space-y-4">
            <Field label="Closing headline">
              <input className={inputCls} value={settings.cta_title} onChange={(e) => set({ cta_title: e.target.value })} />
            </Field>
            <Field label="Closing paragraph" hint="This is where the WhatsApp keyword belongs — keep it one clear instruction.">
              <textarea className={inputCls} rows={4} value={settings.cta_body} onChange={(e) => set({ cta_body: e.target.value })} />
            </Field>
          </div>
        </div>

        {/* stats */}
        <div className="mt-6">
          <p className={labelCls}>Headline numbers (max 6)</p>
          <div className="space-y-2">
            {settings.stats.map((s, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[140px_1fr_auto]">
                <input
                  className={inputCls}
                  value={s.value}
                  aria-label="Stat value"
                  onChange={(e) => set({ stats: settings.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })}
                />
                <input
                  className={inputCls}
                  value={s.label}
                  aria-label="Stat label"
                  onChange={(e) => set({ stats: settings.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                />
                <button type="button" className={btnDanger} onClick={() => set({ stats: settings.stats.filter((_, j) => j !== i) })}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          {settings.stats.length < 6 && (
            <button type="button" className={btnGhost} onClick={() => set({ stats: [...settings.stats, { value: '', label: '' }] })}>
              Add a number
            </button>
          )}
          <p className="mt-2 text-[11px] leading-snug text-gray-600">
            Every figure here has to be traceable to the campaign dossier or a published report — the Track
            Record page links each one to its source.
          </p>
        </div>

        <div className="mt-5">
          <button type="submit" className={btnCls} disabled={st.kind === 'busy'}>Save homepage copy</button>
        </div>
        <StatusLine st={st} />
      </form>

      {/* ── candidate file ────────────────────────────────────── */}
      <section className={cardCls}>
        <h2 className="mb-1 text-lg font-extrabold text-brand-dark">Candidate file (About page)</h2>
        <p className="mb-4 text-sm text-gray-500">
          A row only shows on the site once it has a value. Leave the value blank for anything HQ has not
          confirmed in writing — the frame stays hidden rather than guessing.
        </p>
        <FactEditor refresh={refresh} rows={facts} setSt={setSt} />
      </section>

      {/* ── channels ──────────────────────────────────────────── */}
      <section className={cardCls}>
        <h2 className="mb-1 text-lg font-extrabold text-brand-dark">Official channels</h2>
        <p className="mb-4 text-sm text-gray-500">
          Footer, mobile bar and About page all read this list. Only rows with a working link are rendered.
        </p>
        <SocialEditor refresh={refresh} rows={socials} setSt={setSt} />
      </section>
    </div>
  );
}

function FactEditor({ rows, refresh, setSt }: { rows: FactRow[]; refresh: () => Promise<void>; setSt: (s: Status) => void }) {
  const [draft, setDraft] = useState({ key: '', value: '', note: '' });

  async function save(row?: FactRow) {
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({ id: row?.id, key: row?.key ?? draft.key, value: row ? row.value : draft.value, note: row ? row.note : draft.note, sort: row?.sort ?? rows.length }),
      });
      if (!row) setDraft({ key: '', value: '', note: '' });
      await refresh();
      setSt({ kind: 'ok', msg: 'Candidate file updated.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function edit(id: string, body: { key?: string; value?: string | null; note?: string | null }) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/profile', { method: 'PUT', body: JSON.stringify({ ...row, ...body }) });
      await refresh();
      setSt({ kind: 'ok', msg: 'Saved.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this row from the candidate file?')) return;
    try {
      await api(`/api/admin/profile/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="grid gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[170px_1fr_1fr_auto]">
            <input
              className={inputCls}
              defaultValue={r.key}
              aria-label="Field name"
              onBlur={(e) => { if (e.target.value !== r.key && e.target.value.trim()) edit(r.id, { key: e.target.value }); }}
            />
            <input
              className={inputCls}
              defaultValue={r.value ?? ''}
              placeholder="unconfirmed — hidden on the site"
              aria-label="Value"
              onBlur={(e) => { if (e.target.value !== (r.value ?? '')) edit(r.id, { value: e.target.value || null }); }}
            />
            <input
              className={inputCls}
              defaultValue={r.note ?? ''}
              placeholder="Note / caveat"
              aria-label="Note"
              onBlur={(e) => { if (e.target.value !== (r.note ?? '')) edit(r.id, { note: e.target.value || null }); }}
            />
            <button type="button" className={btnDanger} onClick={() => remove(r.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div className="grid gap-2 sm:grid-cols-[170px_1fr_1fr_auto]">
        <input className={inputCls} value={draft.key} placeholder="Field name" onChange={(e) => setDraft((d) => ({ ...d, key: e.target.value }))} />
        <input className={inputCls} value={draft.value} placeholder="Value (blank stays hidden)" onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} />
        <input className={inputCls} value={draft.note} placeholder="Note" onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} />
        <button type="button" className={btnCls} disabled={!draft.key.trim()} onClick={() => save()}>Add row</button>
      </div>
    </div>
  );
}

function SocialEditor({ rows, refresh, setSt }: { rows: SocialRow[]; refresh: () => Promise<void>; setSt: (s: Status) => void }) {
  const [draft, setDraft] = useState({ platform: 'x' as string, label: '', handle: '', url: '' });

  async function save(row?: SocialRow, override?: Record<string, unknown>) {
    setSt({ kind: 'busy' });
    try {
      await api('/api/admin/socials', {
        method: 'PUT',
        body: JSON.stringify(row ? { ...row, ...override } : { ...draft, sort: rows.length }),
      });
      if (!row) setDraft({ platform: 'x', label: '', handle: '', url: '' });
      await refresh();
      setSt({ kind: 'ok', msg: 'Channels updated.' });
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Save failed.' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this channel from the site?')) return;
    try {
      await api(`/api/admin/socials/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setSt({ kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed.' });
    }
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="grid items-end gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[140px_1fr_1fr_1fr_auto]">
            <select
              className={inputCls}
              value={r.platform}
              aria-label="Platform"
              onChange={(e) => save(r, { platform: e.target.value })}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              className={inputCls}
              defaultValue={r.handle}
              aria-label="Handle"
              onBlur={(e) => { if (e.target.value !== r.handle) save(r, { handle: e.target.value }); }}
            />
            <input
              className={inputCls}
              defaultValue={r.label}
              aria-label="Label"
              onBlur={(e) => { if (e.target.value !== r.label) save(r, { label: e.target.value }); }}
            />
            <input
              className={inputCls}
              defaultValue={r.url ?? ''}
              placeholder="https://… (blank hides the chip)"
              aria-label="Link"
              onBlur={(e) => { if (e.target.value !== (r.url ?? '')) save(r, { url: e.target.value }); }}
            />
            <button type="button" className={btnDanger} onClick={() => remove(r.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div className="grid items-end gap-2 sm:grid-cols-[140px_1fr_1fr_1fr_auto]">
        <select className={inputCls} value={draft.platform} onChange={(e) => setDraft((d) => ({ ...d, platform: e.target.value }))} aria-label="New platform">
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input className={inputCls} value={draft.handle} placeholder="@handle" onChange={(e) => setDraft((d) => ({ ...d, handle: e.target.value }))} />
        <input className={inputCls} value={draft.label} placeholder="Label" onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} />
        <input className={inputCls} value={draft.url} placeholder="https://…" onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} />
        <button type="button" className={btnCls} disabled={!draft.handle.trim()} onClick={() => save()}>Add channel</button>
      </div>
    </div>
  );
}
