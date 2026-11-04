'use client';

/**
 * livedesk/LiveDesk.tsx — the campaign site as its own CMS.
 *
 * How it works, end to end:
 *
 *   1. On mount it asks the existing session probe who is looking
 *      (GET /api/admin/login → { authenticated }). A voter gets nothing — not a
 *      dock, not a listener, not a byte of extra DOM.
 *   2. "Edit page" (or ⌘E) arms it. The reveal layer draws a thin ring around every
 *      element carrying data-ow, and a delegated click listener goes live on the
 *      document. No page component has a handler; the pages are still server
 *      components rendering HTML.
 *   3. A tap resolves through the field registry (lib/liveDesk/contract.ts) into
 *      either a text editor or, on a photo frame, the library picker. The value it
 *      starts with is the text already on the page — what the desk edits is the
 *      sentence the voter reads.
 *   4. Save calls the same admin route the tab CMS calls, so the same validation
 *      applies and the same revalidatePath() runs. The sheet then asks Next to
 *      re-render the route from the server, so the page the desk is standing on
 *      redraws with the new copy without a reload. A failure surfaces the route's
 *      own message, nothing invented.
 *   5. Every accepted change pushes an undo entry; ⌘Z or the pill restores the
 *      previous value through the same routes.
 *   6. ⌘K opens the command deck (paste a YouTube link to publish a clip, paste an
 *      article to cite it, jump anywhere) and the integrity gauge opens the audit of
 *      what is live — which walks to and outlines the offending sentence rather
 *      than describing it.
 *
 * Deliberately absent: no model, no generation, no autonomous publish. A campaign
 * site that can write its own claims is a liability; this layer only moves what a
 * human typed into routes that already check it.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CommandDeck from './CommandDeck';
import EditorSheet from './EditorSheet';
import IntegrityPanel from './IntegrityPanel';
import SlotPicker from './SlotPicker';
import { Dock, RevealLayer } from './chrome';
import { api } from '../admin/cms';
import { parseTarget, type Target } from '@/lib/liveDesk/contract';

type Undo = { label: string; run: () => Promise<void> };
type Toast = { kind: 'ok' | 'err' | 'info'; msg: string };
type Open =
  | { pane: 'editor'; t: Extract<Target, { kind: 'field' }>; el: HTMLElement; rect: DOMRect }
  | { pane: 'picker'; slot: string; label: string; ratio: string; exact: boolean; boundId: string | null; rect: DOMRect }
  | { pane: 'deck' }
  | { pane: 'integrity' }
  | null;

export default function LiveDesk() {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [armed, setArmed] = useState(false);
  const [open, setOpen] = useState<Open>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [ready, setReady] = useState(true);
  const [findings, setFindings] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);
  const dismiss = useRef<number | null>(null);

  /* 1 — who is looking? */
  useEffect(() => {
    if (pathname.startsWith('/admin')) return setAuthed(false);
    let live = true;
    api<{ authenticated: boolean }>('/api/admin/login')
      .then((r) => live && setAuthed(!!r.authenticated))
      .catch(() => live && setAuthed(false));
    return () => { live = false; };
  }, [pathname]);

  const say = useCallback((kind: Toast['kind'], msg: string) => {
    setToast({ kind, msg });
    if (dismiss.current) window.clearTimeout(dismiss.current);
    dismiss.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  const audit = useCallback(() => {
    api<{ data: { score: number; ready: boolean; findings: unknown[] } }>('/api/admin/health')
      .then((r) => { setScore(r.data.score); setReady(r.data.ready); setFindings(r.data.findings.length); })
      .catch(() => setScore(null));
  }, []);

  useEffect(() => { if (authed) audit(); }, [authed, audit]);
  useEffect(() => () => { if (dismiss.current) window.clearTimeout(dismiss.current); }, []);

  /* Arming is a document-level state: globals.css shows the desk's worklist
     chips only while it is on, and hides them from every visitor. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('ow-armed', armed && !!authed);
    return () => root.classList.remove('ow-armed');
  }, [armed, authed]);

  /* 5 — every accepted change is one keystroke from being un-done.
     The stack is a ref, not state, so the keyboard listener can hold one stable
     closure and still never undo against a stale snapshot of the list. */
  const undo = useRef<Undo[]>([]);
  const [undoDepth, setUndoDepth] = useState(0);

  const runUndo = useCallback(async () => {
    const last = undo.current[undo.current.length - 1];
    if (!last) return;
    undo.current = undo.current.slice(0, -1);
    setUndoDepth(undo.current.length);
    try {
      await last.run();
      router.refresh();
      say('info', `Reverted: ${last.label}`);
    } catch (e) {
      say('err', e instanceof Error ? e.message : 'The revert was refused.');
    }
  }, [router, say]);

  /* 3 — one delegated listener for the whole page. */

  /* Keys are always live for the desk, including ⌘E, which is how it arms itself in
     the first place: a listener that only existed once armed could never be armed. */
  useEffect(() => {
    if (!authed) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => (o?.pane === 'deck' ? null : { pane: 'deck' })); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') { e.preventDefault(); setArmed((a) => !a); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !isTyping(e.target)) {
        e.preventDefault();
        void runUndo();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [authed, runUndo]);

  /* Taps only intercept the page while the desk is armed — an unarmed desk must not
     steal a link or a button from the person editing the campaign site. */
  useEffect(() => {
    if (!armed || !authed) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || t.closest('[data-ow-ui]')) return;
      const el = t.closest<HTMLElement>('[data-ow]');
      if (!el?.dataset.ow) return;
      e.preventDefault();
      e.stopPropagation();
      const parsed = parseTarget(el.dataset.ow);
      if (!parsed) return;
      const rect = el.getBoundingClientRect();
      if (parsed.kind === 'slot') {
        setOpen({
          pane: 'picker',
          slot: parsed.slot,
          label: el.dataset.owLabel ?? parsed.slot,
          ratio: el.dataset.owRatio ?? '16:9',
          exact: el.dataset.owExact === '1',
          boundId: el.dataset.owMedia ?? null,
          rect,
        });
      } else {
        setOpen({ pane: 'editor', t: parsed, el, rect });
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [armed, authed]);

  const onSaved = useCallback((msg: string, u: Undo | null) => {
    if (u) { undo.current = [...undo.current, u]; setUndoDepth(undo.current.length); }
    say('ok', msg);
    setOpen(null);
    router.refresh();
    setTimeout(audit, 600);
  }, [audit, router, say]);

  /* 6 — a finding the desk clicked: take them there and light it up. */
  const jump = useCallback((page: string, _selector: string, ow: string) => {
    setOpen(null);
    const leaving = page !== pathname;
    if (leaving) router.push(page);
    // No data-ow target means the fix is not a sentence on a public page — a Help
    // Desk queue, a leads inbox, an unconfirmed handle. Navigate, and say so.
    if (!ow) {
      say('info', leaving ? `Opened ${page}.` : `You are already on ${page}.`);
      return;
    }
    if (!armed) setArmed(true);
    setTimeout(() => setFocus(ow), leaving ? 900 : 60);
    setTimeout(() => setFocus(null), 5200);
  }, [armed, pathname, router, say]);

  if (!authed) return null;

  const current = open?.pane === 'editor'
    ? (open.el.dataset.owValue ?? open.el.textContent ?? '').trim()
    : '';

  return (
    <div data-ow-ui>
      <RevealLayer armed={armed && open?.pane !== 'integrity'} focus={focus} />

      {open?.pane === 'editor' ? (
        <EditorSheet
          target={open.t}
          current={current}
          ctx={readCtx(open.el)}
          anchor={open.rect}
          page={pathname}
          onClose={() => setOpen(null)}
          onSaved={onSaved}
        />
      ) : null}

      {open?.pane === 'picker' ? (
        <SlotPicker
          slot={open.slot}
          label={open.label}
          ratio={open.ratio}
          exact={open.exact}
          boundId={open.boundId}
          anchor={open.rect}
          onClose={() => setOpen(null)}
          onSaved={onSaved}
        />
      ) : null}

      {open?.pane === 'deck' ? (
        <CommandDeck
          onClose={() => setOpen(null)}
          armed={armed}
          onToggleArm={() => setArmed((a) => !a)}
          onUndo={() => void runUndo()}
          canUndo={undoDepth > 0}
          onIntegrity={() => setOpen({ pane: 'integrity' })}
          onToast={say}
        />
      ) : null}

      {open?.pane === 'integrity' ? (
        <IntegrityPanel anchor={null} onClose={() => setOpen(null)} onJump={jump} />
      ) : null}

      <Dock
        armed={armed}
        onToggleArm={() => setArmed((a) => !a)}
        onCommands={() => setOpen({ pane: 'deck' })}
        onIntegrity={() => setOpen((o) => (o?.pane === 'integrity' ? null : { pane: 'integrity' }))}
        score={score}
        ready={ready}
        openFindings={findings}
        toast={toast}
        onUndo={() => void runUndo()}
        canUndo={undoDepth > 0}
      />
    </div>
  );
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

/** Row context the route needs but the field spec cannot know (e.g. a profile row's key). */
function readCtx(el: HTMLElement): Record<string, string> | undefined {
  const raw = el.dataset.owCtx;
  if (!raw) return undefined;
  try { return JSON.parse(raw) as Record<string, string>; } catch { return undefined; }
}
