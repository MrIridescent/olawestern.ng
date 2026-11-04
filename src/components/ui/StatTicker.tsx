'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat { value: string; label: string }

/**
 * Animated accomplishment ticker — counts up numeric stats when scrolled
 * into view. Falls back to the plain string (e.g. "100%") when unparseable.
 */
export default function StatTicker({ stats }: { stats: readonly Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((s, i) => (
        <div key={s.label} className="rounded-2xl bg-white/5 p-5 text-center ring-1 ring-white/10 backdrop-blur">
          <p
            className="font-display text-3xl font-bold text-white sm:text-4xl"
            data-ow={`settings.stats.${i}.value`}
            data-ow-label="Stat figure"
            /* The visible text is a counting animation, so the desk is handed the
               stored figure itself rather than whatever frame it was caught on. */
            data-ow-value={s.value}
          >
            <AnimatedValue value={s.value} active={visible} />
          </p>
          <p
            className="mt-1 text-xs font-semibold uppercase tracking-widest text-brand-green-light"
            data-ow={`settings.stats.${i}.label`}
            data-ow-label="Stat label"
          >
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function AnimatedValue({ value, active }: { value: string; active: boolean }) {
  const target = Number(value.replace(/[^0-9]/g, ''));
  const hasNumber = !Number.isNaN(target) && target > 0;
  const suffix = value.replace(/[0-9,]/g, '');
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active || !hasNumber) return;
    const duration = 1400;
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, hasNumber, target]);

  if (!hasNumber) return <>{value}</>;
  return <>{n.toLocaleString('en-US')}{suffix}</>;
}
