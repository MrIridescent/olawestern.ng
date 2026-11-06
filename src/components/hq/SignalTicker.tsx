'use client';

import { useEffect, useState } from 'react';

/**
 * The campaign's public signal line. A slow marquee with a real pause control,
 * because an endlessly moving strip is not accessible just because it looks alive.
 */
export default function SignalTicker({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) setPaused(true);
    const onChange = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
      if (e.matches) setPaused(true);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-brand-navy-deep/80">
      <div className="flex items-center gap-3 py-2.5">
        <span className="ml-4 flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-emerald">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-emerald" />
          </span>
          Desk signal
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            className={`hq-marquee flex w-max items-center gap-8 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 ${
              paused ? '[animation-play-state:paused]' : ''
            }`}
            aria-hidden
          >
            {loop.map((item, i) => (
              <span key={`${item}-${i}`} className="flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-brand-electric" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className="mr-3 shrink-0 rounded-full border border-white/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-brand-electric/60 hover:text-white"
          aria-pressed={paused}
        >
          {paused ? (reduced ? 'Motion off' : 'Play') : 'Pause'}
        </button>
      </div>
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
