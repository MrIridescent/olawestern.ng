'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * A deliberately restrained entrance: translate only, never opacity.
 * If the trigger never fires — fast scroll, print, reduced motion — the
 * content is still fully readable.
 */
export default function Reveal({
  children,
  className = '',
  selector,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = selector ? gsap.utils.toArray<HTMLElement>(selector, el) : [el];
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y: 38 },
        {
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: selector ? 0.1 : 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [selector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
