'use client';

/**
 * livedesk/CommandDeck.tsx — ⌘K for the campaign desk.
 *
 * Not an assistant and not a chatbot: there is no model in this file and nothing
 * it accepts is generated. It parses what the desk pastes — a YouTube link, a
 * published article — and hands it to the route that already validates it, then
 * shows that route's answer. The reason is the campaign, not the tech: an AI that
 * writes a headline for a real candidate is exactly the thing this site exists to
 * avoid, while a keystroke that gets a verified clip onto the page is exactly the
 * thing the desk needs at 11pm.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from './chrome';
import { api } from '../admin/cms';
import { extractYoutubeId } from '@/lib/youtubeId';

export interface DeckProps {
  onClose: () => void;
  onToggleArm: () => void;
  armed: boolean;
  onUndo: () => void;
  canUndo: boolean;
  onIntegrity: () => void;
  onToast: (kind: 'ok' | 'err' | 'info', msg: string) => void;
}

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: 'paste' | 'page' | 'desk';
  run: () => void | Promise<void>;
}

/** Subsequence scoring — good enough to make `hro` find "hero". */
function score(hay: string, needle: string): number {
  const h = hay.toLowerCase();
  const n = needle.toLowerCase().replace(/\s+/g, '');
  if (!n) return 1;
  let at = 0;
  let hits = 0;
  for (let i = 0; i < h.length && at < n.length; i++) {
    if (h[i] === n[at]) { hits++; at++; }
  }
  if (at < n.length) return 0;
  return hits * 10 - h.length / 100 + (h.startsWith(n) ? 40 : 0);
}

export default function CommandDeck({ onClose, onToggleArm, armed, onUndo, canUndo, onIntegrity, onToast }: DeckProps) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [yt, setYt] = useState<{ id: string; title: string; outlet: string } | null>(null);
  const [cite, setCite] = useState<{ url: string; outlet: string; headline: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { const t = setTimeout(() => input.current?.focus(), 60); return () => clearTimeout(t); }, []);

  const maybeYoutube = useMemo(() => extractYoutubeId(q), [q]);
  const maybeArticle = useMemo(() => {
    try {
      const u = new URL(q.trim());
      return /^https?:$/.test(u.protocol) && !/youtube\.com|youtu\.be/i.test(u.hostname) ? u : null;
    } catch { return null; }
  }, [q]);

  async function resolveClip() {
    if (!maybeYoutube || busy) return;
    setBusy('yt');
    setErr(null);
    try {
      const res = await api<{ data: { title: string | null; outlet: string | null } }>(`/api/admin/videos/lookup?u=${encodeURIComponent(maybeYoutube)}`);
      setYt({ id: maybeYoutube, title: res.data.title ?? '', outlet: res.data.outlet ?? '' });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'YouTube says no to that link.');
    } finally {
      setBusy(null);
    }
  }

  async function publishClip() {
    if (!yt || busy) return;
    setBusy('publish');
    setErr(null);
    try {
      const res = await api<{ note?: string }>('/api/admin/videos', {
        method: 'POST',
        body: JSON.stringify({ youtube: yt.id, title: yt.title, outlet: yt.outlet || null }),
      });
      setBusy(null);
      onToast('ok', res.note ?? 'Clip published to the shelf.');
      onClose();
    } catch (e) {
      setBusy(null);
      setErr(e instanceof Error ? e.message : 'That clip could not be published.');
    }
  }

  async function saveCite() {
    if (!cite || busy) return;
    setBusy('cite');
    setErr(null);
    try {
      await api('/api/admin/references', {
        method: 'POST',
        body: JSON.stringify({ url: cite.url, outlet: cite.outlet, headline: cite.headline, date: new Date().toISOString().slice(0, 10) }),
      });
      setBusy(null);
      router.push('/impact#sources');
      router.refresh();
      onClose();
    } catch (e) {
      setBusy(null);
      setErr(e instanceof Error ? e.message : 'That source was refused.');
    }
  }

  const go = (href: string) => () => { router.push(href); onClose(); };

  const commands: Command[] = useMemo(() => ([
    ...(maybeYoutube
      ? [{ id: 'yt', group: 'paste' as const, label: busy === 'yt' ? 'Checking YouTube…' : 'Publish this clip to the shelf', hint: maybeYoutube, run: resolveClip }]
      : []),
    ...(maybeArticle
      ? [{ id: 'cite', group: 'paste' as const, label: 'Cite this article as a source', hint: maybeArticle.hostname, run: () => setCite({ url: maybeArticle.href, outlet: maybeArticle.hostname.replace(/^www\./, ''), headline: '' }) }]
      : []),

    { id: 'arm', group: 'desk', label: armed ? 'See the page as a voter' : 'Reveal everything I can edit', hint: '⌘E', run: onToggleArm },
    { id: 'integrity', group: 'desk', label: 'Run the integrity report', hint: 'is this defensible?', run: onIntegrity },
    ...(canUndo ? [{ id: 'undo', group: 'desk' as const, label: 'Undo my last change', run: onUndo }] : []),
    { id: 'refresh', group: 'desk', label: 'Reload this page from the server', run: () => { router.refresh(); onClose(); } },

    { id: 'home', group: 'page', label: 'Home — hero, pillars, clips', run: go('/') },
    { id: 'about', group: 'page', label: 'About — candidate file', run: go('/about') },
    { id: 'impact', group: 'page', label: 'Impact — the service record and its sources', run: go('/impact') },
    { id: 'sources', group: 'page', label: 'Reference library — every press link', run: go('/impact#sources') },
    { id: 'gallery', group: 'page', label: 'Gallery — photo wall', run: go('/gallery') },
    { id: 'news', group: 'page', label: 'Newsroom feed', run: go('/news') },
    { id: 'truth', group: 'page', label: 'Truth Room ledger', run: go('/truth-room') },
    { id: 'help', group: 'page', label: 'Help Desk — resident progress', run: go('/help-desk') },
    { id: 'contact', group: 'page', label: 'Contact — HQ and ward desks', run: go('/contact') },
    { id: 'tab-truth', group: 'page', label: 'Open the tab CMS · Truth Room ledger', run: go('/admin?tab=truth') },
    { id: 'tab-news', group: 'page', label: 'Open the tab CMS · Newsroom', run: go('/admin?tab=news') },
    { id: 'tab-record', group: 'page', label: 'Open the tab CMS · Track Record', run: go('/admin?tab=record') },
    { id: 'tab-sources', group: 'page', label: 'Open the tab CMS · Sources', run: go('/admin?tab=sources') },
    { id: 'tab-media', group: 'page', label: 'Open the tab CMS · Photo Library', run: go('/admin?tab=media') },
    { id: 'tab-video', group: 'page', label: 'Open the tab CMS · Video', run: go('/admin?tab=video') },
    { id: 'tab-copy', group: 'page', label: 'Open the tab CMS · Site Copy and channels', run: go('/admin?tab=site') },
    { id: 'tab-desk', group: 'page', label: 'Open the tab CMS · Help Desk queue', run: go('/admin?tab=helpdesk') },
    { id: 'tab-leads', group: 'page', label: 'Open the tab CMS · Leads inbox', run: go('/admin?tab=leads') },
  ]), [armed, busy, canUndo, maybeArticle, maybeYoutube, onIntegrity, onToggleArm, onUndo, router]);

  const ranked = useMemo(() => {
    if (!q.trim()) return commands;
    const recognised = commands.filter((c) => c.group === 'paste');
    const scored = commands
      .filter((c) => c.group !== 'paste')
      .map((c) => ({ c, s: score(`${c.label} ${c.hint ?? ''} ${c.group}`, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
    // A pasted link is not a search term, it is the command: fuzzy-matching its
    // characters against a label would throw the one thing the desk asked for away.
    return [...recognised, ...scored];
  }, [commands, q]);

  const shown = yt ? null : cite ? null : ranked;

  return (
    <Sheet title="Command deck" context="paste a link, or say what you want to do" anchor={null} width={520} onClose={onClose}>
      <input
        ref={input}
        value={q}
        onChange={(e) => { setQ(e.target.value); setErr(null); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && shown?.[0]) void shown[0].run();
          if (e.key === 'Enter' && yt) void publishClip();
        }}
        placeholder="hero · undo · publish this clip · cite https://… "
        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
      />
      {err ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{err}</p> : null}

      {yt ? (
        <div className="mt-4 space-y-3 rounded-xl border border-brand-green bg-brand-light p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-green-dark">Verified on YouTube — publish it as</p>
          <input value={yt.title} onChange={(e) => setYt({ ...yt, title: e.target.value })} placeholder="Title the desk will see" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input value={yt.outlet} onChange={(e) => setYt({ ...yt, outlet: e.target.value })} placeholder="Outlet / channel" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={publishClip} disabled={busy !== null || !yt.title.trim()} className="flex-1 rounded-lg bg-brand-green px-3 py-2 text-xs font-black text-white disabled:opacity-40">
              {busy === 'publish' ? 'Publishing…' : 'Publish clip'}
            </button>
            <button type="button" onClick={() => setYt(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">Back</button>
          </div>
          <p className="text-[11px] text-gray-600">The route confirms it is embeddable before it saves, so a dead player cannot reach the page.</p>
        </div>
      ) : cite ? (
        <div className="mt-4 space-y-3 rounded-xl border border-brand-blue bg-white p-3">
          <p className="break-all text-[11px] font-bold uppercase tracking-wide text-brand-blue-dark">{cite.url}</p>
          <input value={cite.outlet} onChange={(e) => setCite({ ...cite, outlet: e.target.value })} placeholder="Outlet — e.g. Vanguard" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input value={cite.headline} onChange={(e) => setCite({ ...cite, headline: e.target.value })} placeholder="Headline exactly as it published" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={saveCite} disabled={busy !== null || !cite.headline.trim() || !cite.outlet.trim()} className="flex-1 rounded-lg bg-brand-green px-3 py-2 text-xs font-black text-white disabled:opacity-40">
              {busy === 'cite' ? 'Citing…' : 'Add to the reference library'}
            </button>
            <button type="button" onClick={() => setCite(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">Back</button>
          </div>
          <p className="text-[11px] text-gray-600">Type the headline the story actually carries — a paraphrase in a citation is how a record gets contested.</p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100">
          {shown?.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => void c.run()}
                className="flex w-full items-baseline justify-between gap-3 py-2.5 text-left transition hover:text-brand-green"
              >
                <span className="text-sm font-semibold text-brand-dark">{c.label}</span>
                {c.hint ? <span className="shrink-0 text-[11px] text-gray-500">{c.hint}</span> : null}
              </button>
            </li>
          ))}
          {!shown?.length ? <li className="py-6 text-center text-xs font-semibold text-gray-500">Nothing matches “{q}”. Paste a link, or press Esc.</li> : null}
        </ul>
      )}

      <p className="mt-4 border-t border-gray-100 pt-3 text-[11px] leading-snug text-gray-500">
        Frames, captions and copy are edited where they appear on the page — tap them with <span className="font-bold">⌘E</span> on.
        <button type="button" className="ml-1 font-bold text-brand-green underline" onClick={() => { onToggleArm(); onClose(); }}>
          {armed ? 'Hide the editing layer' : 'Reveal it now'}
        </button>
      </p>
    </Sheet>
  );
}
