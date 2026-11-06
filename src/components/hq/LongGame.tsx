'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LONG_GAME } from '@/lib/hq';

gsap.registerPlugin(ScrollTrigger);

/**
 * The long game, as a scroll-spy timeline.
 *
 * The sticky year rail and the vertical progress line are decoration. The
 * chapter content is ordinary text that is fully readable with JavaScript off,
 * reduced motion on, or the trigger never firing.
 */
export default function LongGame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>('[data-chapter]', wrapRef.current);
    if (!cards.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = cards.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        });
      },
      { rootMargin: '-38% 0px -42% 0px', threshold: 0 },
    );
    cards.forEach((card) => observer.observe(card));

    let ctx: gsap.Context | undefined;
    if (!reduced && lineRef.current) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: wrapRef.current,
              start: 'top 65%',
              end: 'bottom 75%',
              scrub: 0.6,
            },
          },
        );
      }, wrapRef);
    }

    return () => {
      observer.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="grid gap-8 lg:grid-cols-[0.62fr_1fr] lg:gap-14">
        {/* Sticky year rail */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-orange-bright">
            The ten-year view
          </p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-[4.6rem] font-extrabold leading-none tracking-tighter text-white sm:text-[6rem]">
              {LONG_GAME[active].year}
            </span>
            <span className="mb-2 rounded-full border border-brand-emerald/40 bg-brand-emerald/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-emerald">
              Chapter {active + 1} / {LONG_GAME.length}
            </span>
          </div>
          <p className="mt-3 max-w-sm font-display text-2xl font-bold leading-tight text-white">
            {LONG_GAME[active].title}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
            A campaign that ends on election day is a transaction. This is the governing plan the
            constituency can keep measuring long after the posters come down.
          </p>

          <ol className="mt-7 hidden gap-1 lg:grid" aria-label="Timeline chapters">
            {LONG_GAME.map((chapter, i) => (
              <li key={`${chapter.year}-${chapter.title}`}>
                <span
                  className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                    i === active ? 'bg-white/10 text-white' : 'text-white/55'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      i === active ? 'bg-brand-electric' : 'bg-white/25'
                    }`}
                  />
                  <span className="tabular-nums text-white/60">{chapter.year}</span>
                  <span className="truncate">{chapter.title}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-6 max-w-sm rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] leading-relaxed text-white/60">
            These are commitments, not claims. The election has not been held, so every chapter is
            written as work to be judged on — with the ledger as the scorecard.
          </p>
        </div>

        {/* Chapters */}
        <div className="relative pl-7 sm:pl-9">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/15 sm:left-[9px]" aria-hidden>
            <div
              ref={lineRef}
              className="h-full w-full origin-top bg-gradient-to-b from-brand-electric via-brand-orange-bright to-brand-emerald"
            />
          </div>

          <ol className="space-y-5">
            {LONG_GAME.map((chapter, i) => {
              const current = i === active;
              return (
                <li
                  key={`${chapter.year}-${chapter.title}`}
                  data-chapter
                  className={`relative rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${
                    current
                      ? 'border-brand-electric/45 bg-white/[0.09] shadow-[0_16px_50px_rgba(3,7,18,0.35)]'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`absolute -left-7 top-6 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 sm:-left-9 ${
                      current
                        ? 'border-brand-electric bg-brand-electric shadow-[0_0_0_4px_rgba(255,87,34,0.18)]'
                        : 'border-white/30 bg-brand-navy'
                    }`}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-brand-orange-bright">
                      {chapter.year}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-xl font-extrabold leading-snug text-white">
                    {chapter.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/70">{chapter.body}</p>
                  <ul className="mt-4 grid gap-1.5">
                    {chapter.checks.map((check) => (
                      <li key={check} className="flex items-start gap-2 text-[12px] leading-relaxed text-white/65">
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            current ? 'bg-brand-emerald' : 'bg-white/30'
                          }`}
                          aria-hidden
                        />
                        {check}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
