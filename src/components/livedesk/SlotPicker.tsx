'use client';

/**
 * livedesk/SlotPicker.tsx — tap a frame on the page, choose the photograph.
 *
 * The frame the desk is standing next to is the context, so the library is shown
 * as it will actually render: each candidate drawn inside a live 16:9 / 4:5 / 1:1
 * crop of itself, with the percentage the frame throws away. That is the same
 * maths `object-cover` performs and the same gate the harvest scripts apply, so a
 * photo that would chop the candidate out of his own picture is labelled as one
 * instead of quietly going live.
 */
import { useEffect, useRef, useState } from 'react';
import { Sheet } from './chrome';
import { api, postForm } from '../admin/cms';
import { fitFor, MAX_CROP, ratioValue } from '@/lib/liveDesk/contract';
import type { MediaAsset } from '@/types';

export interface SlotPickerProps {
  slot: string;
  label: string;
  ratio: string;
  /** A frame that names a place or person refuses the shape fallback. */
  exact: boolean;
  boundId: string | null;
  anchor: DOMRect | null;
  onClose: () => void;
  onSaved: (msg: string, undo: { label: string; run: () => Promise<void> } | null) => void;
}

type Stage = 'choose' | 'upload';

export default function SlotPicker({ slot, label, ratio, exact, anchor, onClose, onSaved }: SlotPickerProps) {
  const [rows, setRows] = useState<MediaAsset[] | null>(null);
  const [stage, setStage] = useState<Stage>('choose');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ src: string; width: number | null; height: number | null; orientation: string; alt: string; caption: string; credit: string } | null>(null);
  const fileBox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    api<{ data: MediaAsset[] }>('/api/admin/media')
      .then((r) => live && setRows(r.data))
      .catch((e) => live && setErr(e instanceof Error ? e.message : 'The library would not load.'));
    return () => { live = false; };
  }, []);

  const frame = ratioValue(ratio);
  const ranked = (rows ?? [])
    .map((m) => ({ m, fit: fitFor(m, ratio) }))
    .sort((a, b) => Number(b.m.slot === slot) - Number(a.m.slot === slot) || a.fit.crop - b.fit.crop);

  async function place(id: string, name: string) {
    if (busy) return;
    setBusy(id);
    setErr(null);
    const previous = (rows ?? []).find((m) => m.slot === slot && m.id !== id) ?? null;
    try {
      if (previous) await api(`/api/admin/media/${previous.id}`, { method: 'PATCH', body: JSON.stringify({ slot: '' }) });
      await api(`/api/admin/media/${id}`, { method: 'PATCH', body: JSON.stringify({ slot, published: true }) });
      onSaved(`${name} now fills “${label}”.`, {
        label: `frame ${slot}`,
        run: async () => {
          await api(`/api/admin/media/${id}`, { method: 'PATCH', body: JSON.stringify({ slot: '' }) });
          if (previous) await api(`/api/admin/media/${previous.id}`, { method: 'PATCH', body: JSON.stringify({ slot }) });
        },
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'That placement was refused.');
    } finally {
      setBusy(null);
    }
  }

  async function release(id: string) {
    if (busy) return;
    setBusy(id);
    setErr(null);
    const was = (rows ?? []).find((m) => m.id === id);
    try {
      await api(`/api/admin/media/${id}`, { method: 'PATCH', body: JSON.stringify({ slot: '' }) });
      onSaved(`Frame “${label}” released back to the branded panel.`, {
        label: `frame ${slot}`,
        run: async () => { if (was) await api(`/api/admin/media/${was.id}`, { method: 'PATCH', body: JSON.stringify({ slot }) }); },
      });
      setRows((rs) => (rs ?? []).map((m) => (m.id === id ? { ...m, slot: null } : m)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not release that frame.');
    } finally {
      setBusy(null);
    }
  }

  async function upload(file: File) {
    setBusy('upload');
    setErr(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await postForm<{ data: { src: string; width: number | null; height: number | null; orientation: string; suggested_alt: string } }>('/api/admin/media/upload', form);
      setDraft({ ...res.data, alt: res.data.suggested_alt ?? '', caption: '', credit: '' });
      setStage('upload');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'The upload was refused.');
    } finally {
      setBusy(null);
    }
  }

  async function fileToLibrary() {
    if (!draft || busy) return;
    setBusy('file');
    setErr(null);
    try {
      await api('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          src: draft.src,
          alt: draft.alt || label,
          caption: draft.caption || null,
          credit: draft.credit || null,
          width: draft.width,
          height: draft.height,
          orientation: draft.orientation,
          slot,
          published: true,
        }),
      });
      onSaved(`New photograph filed under “${label}”.`, null);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not file that photograph.');
    } finally {
      setBusy(null);
    }
  }

  /**
   * One library row, drawn inside a live crop of itself. `here` marks the row that
   * already fills this frame, which is the only row an exact frame is allowed to show.
   */
  function pickerCard(m: MediaAsset, fit: ReturnType<typeof fitFor>, here: boolean) {
    const unplaced = !m.slot;
    return (
      <div key={m.id} className={`rounded-xl border p-2 transition ${here ? 'border-brand-green bg-brand-light' : 'border-gray-200 bg-white'}`}>
        <div className="flex gap-3">
          <div className="relative shrink-0 overflow-hidden rounded-lg bg-gray-100" style={{ width: 84, aspectRatio: String(frame) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-brand-dark">{m.caption || m.alt}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {m.width && m.height ? `${m.width}×${m.height}` : 'size unknown'}
              {' · '}
              <span className={fit.fits ? 'font-bold text-brand-green' : 'font-bold text-brick'}>
                {Math.round(fit.crop * 100)}% crop{fit.crop > MAX_CROP ? ' — too far' : ''}
              </span>
              {fit.soft ? <span className="font-bold text-amber-700"> · soft at this size</span> : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {here ? (
                <button type="button" onClick={() => release(m.id)} disabled={busy !== null} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50">
                  {busy === m.id ? 'Working…' : 'Release this frame'}
                </button>
              ) : (
                <button type="button" onClick={() => place(m.id, m.caption || m.alt)} disabled={busy !== null} className="rounded-lg bg-brand-dark px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-brand-green disabled:opacity-40">
                  {busy === m.id ? 'Placing…' : unplaced ? 'Place here' : 'Move here'}
                </button>
              )}
              {m.published ? null : (
                <span className="rounded bg-gray-100 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">draft</span>
              )}
              {m.slot && !here ? <span className="rounded bg-gray-100 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">{m.slot}</span> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sheet
      title={`Frame · ${label}`}
      context={`${slot} — ${ratio} · ${rows?.length ?? '…'} photos in the library`}
      anchor={anchor}
      width={460}
      onClose={onClose}
    >
      {exact ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-snug text-amber-900">
          This frame names a real place, event or person — it only takes a photograph filed for it.
        </p>
      ) : null}

      {stage === 'upload' && draft ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={draft.src} alt="" className="w-full rounded-lg object-cover" style={{ aspectRatio: String(frame) }} />
          <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Alt text *
            <input value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-900" />
          </label>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Caption
            <input value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-900" placeholder="What the report says this shows" />
          </label>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Credit
            <input value={draft.credit} onChange={(e) => setDraft({ ...draft, credit: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-900" placeholder="Photo: outlet / campaign photographer" />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={fileToLibrary} disabled={busy !== null} className="flex-1 rounded-lg bg-brand-green px-3 py-2 text-xs font-black text-white transition hover:bg-brand-green-dark disabled:opacity-40">
              {busy === 'file' ? 'Filing…' : `File it under “${label}”`}
            </button>
            <button type="button" onClick={() => { setDraft(null); setStage('choose'); }} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">
              Back
            </button>
          </div>
          <p className="text-[11px] leading-snug text-gray-500">
            Say only what you know happened in this picture. An invented caption is a defamation problem waiting to happen.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileBox.current?.click()}
            disabled={busy !== null}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 px-3 py-3 text-xs font-bold text-gray-600 transition hover:border-brand-green hover:text-brand-green disabled:opacity-40"
          >
            {busy === 'upload' ? 'Uploading…' : '+ Upload a photograph from this device'}
          </button>
          <input
            ref={fileBox}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }}
          />

          {err ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{err}</p> : null}
          {!rows && !err ? <p className="py-8 text-center text-xs font-semibold text-gray-500">Loading the library…</p> : null}

          {/* An exact frame does not browse the library. A photograph of the rally
              placed in the frame labelled “Campaign HQ — 32 Road” claims the rally
              was at 32 Road, which is the kind of sentence this site exists to avoid.
              What it already holds can still be released; what fills it is uploaded. */}
          {exact ? (
            <>
              {ranked.filter(({ m }) => m.slot === slot).map(({ m, fit }) => pickerCard(m, fit, true))}
              <p className="rounded-lg bg-brand-light px-3 py-3 text-[11px] leading-relaxed text-gray-700">
                The library is deliberately not offered here. A frame that names a real place, event or person only
                takes a photograph filed for it — upload the campaign’s own above and the frame fills the moment it is
                saved. Until then the branded panel holds the space, which is the honest answer.
              </p>
            </>
          ) : (
            ranked.map(({ m, fit }) => pickerCard(m, fit, false))
          )}
        </div>
      )}
    </Sheet>
  );
}
