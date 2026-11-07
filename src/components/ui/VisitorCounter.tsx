'use client';

import { useEffect, useState } from 'react';
import { useCountUp } from 'use-count-up';

/**
 * The homepage visitor count.
 *
 * The number comes from /api/visits, which persists it (Netlify Blobs in
 * production, a JSON file locally). VisitBeacon records the visit; this
 * component reads the total and polls every 15 seconds while the tab is
 * visible, so the figure moves as other people arrive. When storage is
 * unavailable it says so instead of inventing a number.
 */

type Status = 'loading' | 'live' | 'error';

interface VisitPayload {
  success?: boolean;
  count?: unknown;
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    const apply = (value: unknown) => {
      if (cancelled) return;
      if (typeof value === 'number' && Number.isFinite(value)) {
        setCount(Math.max(0, Math.floor(value)));
        setStatus('live');
      }
    };

    const read = async () => {
      try {
        const res = await fetch('/api/visits', { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as VisitPayload;
        if (json.success === true) apply(json.count);
      } catch {
        // A failed poll does not erase a count already on screen.
        if (!cancelled) setStatus((current) => (current === 'live' ? current : 'error'));
      }
    };

    // VisitBeacon records the visit and broadcasts the fresh total; show it
    // immediately instead of waiting for the next poll.
    const onVisit = (event: Event) => {
      apply((event as CustomEvent<number>).detail);
    };

    window.addEventListener('ow:visits', onVisit);
    void read();

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void read();
    }, 15_000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void read();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('ow:visits', onVisit);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const { value } = useCountUp({
    isCounting: count !== null,
    end: count ?? 0,
    duration: 1.2,
    thousandsSeparator: ',',
  });

  const label =
    status === 'error'
      ? 'Live count unavailable'
      : status === 'loading'
        ? 'Connecting to the live count'
        : 'Live total';

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2" aria-hidden>
          {status === 'live' && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              status === 'live'
                ? 'bg-emerald-400'
                : status === 'error'
                  ? 'bg-amber-400'
                  : 'bg-white/40'
            }`}
          />
        </span>
        <h3 className="text-lg font-medium text-gray-400">Visitors</h3>
      </div>
      <p className="text-4xl font-bold tabular-nums text-white" aria-hidden="true">
        {count === null ? '—' : value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      <span className="sr-only" aria-live="polite">
        {count === null ? 'Visitor count loading' : `${count.toLocaleString('en-US')} visitors`}
      </span>
    </div>
  );
}
