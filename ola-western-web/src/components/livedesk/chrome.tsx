'use client';

/**
 * livedesk/chrome.tsx — the three pieces of furniture the Live Desk draws over
 * the public site: the reveal layer, the editor sheet and the dock.
 *
 * None of this lives inside the page tree. The pages stay server components with
 * one extra attribute each; this is a fixed overlay that measures them. That is
 * what keeps the whole feature zero-cost for a voter: the layer is not mounted
 * unless the session probe says admin, and the rings are computed from
 * getBoundingClientRect rather than styled into the document, so a dark hero and
 * a white card get the same readable affordance.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/* ── Reveal layer ─────────────────────────────────────────────────────────── */

export interface Ring {
  ow: string;
  label: string;
  /** Viewport coordinates, refreshed on scroll and resize. */
  top: number;
  left: number;
  width: number;
  height: number;
  kind: 'text' | 'frame' | 'array';
}

/**
 * Outlines every editable region on the page the desk is standing on.
 *
 * Pointer-events are off, so a tap goes through the ring to the real element and
 * the root's delegated handler opens the editor — the ring is information, not a
 * second copy of the UI.
 */
export function RevealLayer({ armed, focus }: { armed: boolean; focus: string | null }) {
  const [rings, setRings] = useState<Ring[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const frame = useRef(0);

  const measure = useCallback(() => {
    const out: Ring[] = [];
    // One ring per field. The same value can render twice on a page — a hero clip
    // in the carousel and again in the grid — and a tap on either opens the same
    // editor. Lighting both from one hover would look like a bug, and duplicate
    // keys would warn in the console, so the first visible instance wins. That also
    // means the ring follows whichever copy is actually on screen.
    const seen = new Set<string>();
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-ow]'))) {
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > window.innerHeight) continue;
      const ow = el.dataset.ow ?? '';
      if (seen.has(ow)) continue;
      seen.add(ow);
      out.push({
        ow,
        label: el.dataset.owLabel || ow,
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        kind: ow.startsWith('slot.') ? 'frame' : ow.includes('.stats.') ? 'array' : 'text',
      });
    }
    setRings(out);
  }, []);

  useEffect(() => {
    if (!armed) {
      setRings([]);
      return;
    }
    measure();
    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    };
    // Capture, not just window: this site keeps horizontal overflow off the body, so
    // whether the scroll lands on the document or on an element depends on the page.
    // A capture listener on window hears both, and passive keeps it off the critical
    // path while the reveal layer is redrawing rings.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll);
    const observer = new MutationObserver(onScroll);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', onScroll);
      observer.disconnect();
    };
  }, [armed, measure]);

  // A finding the desk clicked from the integrity panel: find it, scroll to it, hold the ring.
  useEffect(() => {
    if (!armed || !focus) return;
    const el = document.querySelector<HTMLElement>(`[data-ow="${focus}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHover(focus);
    const t = setTimeout(() => setHover((h) => (h === focus ? null : h)), 4200);
    return () => clearTimeout(t);
  }, [armed, focus, rings.length]);

  if (!armed || !rings.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[115]" aria-hidden>
      {rings.map((r) => {
        const hot = hover === r.ow;
        const isFrame = r.kind === 'frame';
        return (
          <div
            key={r.ow}
            data-ow-ring={r.ow}
            onPointerEnter={() => setHover(r.ow)}
            onPointerLeave={() => setHover((h) => (h === r.ow ? null : h))}
            className={[
              'pointer-events-auto absolute rounded-lg transition-colors duration-150',
              hot ? 'ring-2 ring-[#00A3E0] bg-[#00A3E0]/10' : isFrame ? 'ring-2 ring-[#00A3E0]/50' : 'ring-1 ring-[#00A3E0]/45',
            ].join(' ')}
            style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
          >
            {hot && r.label ? (
              <span className="absolute -top-[9px] left-2 rounded bg-[#0F4C5C] px-1.5 py-[1px] text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                {r.label}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ── Sheet: one panel shape for the editor, the picker and the deck ────────── */

interface SheetProps {
  title: string;
  /** Small line under the title: which page, which frame, which row. */
  context?: string;
  onClose: () => void;
  /** Anchored to the tapped element on desktop; a bottom sheet on a phone. */
  anchor?: DOMRect | null;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ title, context, onClose, anchor, width = 400, children, footer }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const place = () => {
      setMobile(window.innerWidth < 900);
      if (!anchor || window.innerWidth < 900) return setPos(null);
      const h = ref.current?.offsetHeight ?? 320;
      const left = Math.max(12, Math.min(anchor.right - width, window.innerWidth - width - 12));
      const top = anchor.bottom + h + 16 > window.innerHeight - 12
        ? Math.max(12, anchor.top - h - 12)
        : anchor.bottom + 10;
      setPos({ top, left });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [anchor, width]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const style = mobile || !pos ? undefined : { top: pos.top, left: pos.left, width };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      className={[
        'fixed z-[130] flex max-h-[78vh] flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl',
        mobile ? 'inset-x-2 bottom-2 rounded-2xl sm:inset-x-4' : 'rounded-2xl',
      ].join(' ')}
      style={style}
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-brand-dark px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-sm font-bold text-white">{title}</h2>
          {context ? <p className="mt-0.5 truncate text-[11px] text-white/60">{context}</p> : null}
        </div>
        <button type="button" onClick={onClose} className="-mr-1 shrink-0 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Close">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l10 10M15 5L5 15" /></svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      {footer ? <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">{footer}</div> : null}
    </div>
  );
}

/* ── Dock ─────────────────────────────────────────────────────────────────── */

export interface DockProps {
  armed: boolean;
  onToggleArm: () => void;
  onCommands: () => void;
  onIntegrity: () => void;
  score: number | null;
  ready: boolean;
  openFindings: number;
  toast: { kind: 'ok' | 'err' | 'info'; msg: string } | null;
  onUndo: () => void;
  canUndo: boolean;
}

export function Dock({ armed, onToggleArm, onCommands, onIntegrity, score, ready, openFindings, toast, onUndo, canUndo }: DockProps) {
  const tone = score === null ? 'bg-gray-300' : score >= 85 ? 'bg-brand-green' : score >= 65 ? 'bg-[#B8860B]' : 'bg-brick';
  return (
    <>
      {toast ? (
        <div className="pointer-events-none fixed inset-x-3 bottom-[92px] z-[140] flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end">
          <div
            className={[
              'pointer-events-auto max-w-[min(92vw,26rem)] rounded-xl px-4 py-3 text-sm font-semibold shadow-xl',
              toast.kind === 'err' ? 'bg-brick text-white' : toast.kind === 'info' ? 'bg-brand-dark text-white' : 'bg-brand-green text-white',
            ].join(' ')}
          >
            {toast.msg}
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-[72px] right-3 z-[125] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {canUndo ? (
          <button type="button" onClick={onUndo} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-lg transition hover:bg-gray-50">
            ↶ Undo last change
          </button>
        ) : null}

        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/95 p-1 shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={onCommands}
            className="rounded-full px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
            title="Command deck (⌘K)"
          >
            ⌘K
          </button>
          <button
            type="button"
            onClick={onIntegrity}
            className="relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
            title="Integrity report"
          >
            <span className={`h-2 w-2 rounded-full ${tone}`} />
            {score === null ? '—' : score}
            {openFindings ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brick px-1 text-[10px] font-black text-white">{openFindings}</span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onToggleArm}
            className={[
              'rounded-full px-3.5 py-1.5 text-xs font-black transition',
              armed ? 'bg-[#0F4C5C] text-white' : 'bg-brand-green text-white hover:bg-brand-green-dark',
            ].join(' ')}
            title="Edit this page in place (Ctrl/⌘ + E)"
          >
            {armed ? 'Editing' : 'Edit page'}
          </button>
        </div>
        {armed ? (
          <p className="max-w-[16rem] rounded-lg bg-brand-dark/90 px-2.5 py-1.5 text-right text-[10px] font-semibold leading-snug text-white/85 shadow">
            <span className="block">{ready ? 'Tap anything on the page to change it.' : 'Tap anything — the integrity score needs attention.'}</span>
            <span className="block text-white/55">Visitors see none of this.</span>
          </p>
        ) : null}
      </div>
    </>
  );
}
