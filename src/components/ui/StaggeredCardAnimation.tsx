'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function StaggeredCardAnimation({ children }: { children: React.ReactNode }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = gsap.utils.toArray('.card', container);

    // Slide only. Never start from opacity 0 — content must be readable even
    // when the trigger has not fired (fast scroll, print, full-page capture).
    gsap.fromTo(
      cards,
      { y: 44 },
      {
        y: 0,
        stagger: 0.16,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          once: true,
        },
      }
    );
  }, []);

  return <div ref={containerRef}>{children}</div>;
}