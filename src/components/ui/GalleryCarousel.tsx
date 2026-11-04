'use client';

/**
 * GalleryCarousel — accessible, dependency-free (3G-fast) slideshow for the
 * campaign photo slots. Placeholder frames render until real photos are set
 * in GALLERY (src/lib/content.ts). Autoplay respects prefers-reduced-motion
 * and can be paused; navigation works via buttons, dots, arrow keys and swipe.
 */
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GallerySlide } from '@/types';

interface CarouselProps {
  slides: GallerySlide[];
  intervalMs?: number;
  className?: string;
}

export default function GalleryCarousel({ slides, intervalMs = 5000, className = '' }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const regionRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;
  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing || count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(t);
  }, [playing, count, intervalMs]);

  return (
    <div
      ref={regionRef}
      className={`relative overflow-hidden rounded-3xl bg-brand-dark ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Campaign photo gallery"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) (dx > 0 ? prev : next)();
        touchStartX.current = null;
      }}
    >
      {/* Track */}
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => {
          /**
           * One frame shape for the whole strip — a slideshow that changed height
           * per slide would jump under the reader's thumb. So the frame stays
           * landscape and the FIT follows the photograph: a landscape press shot
           * covers, and a portrait or square one is shown whole over a blurred
           * copy of itself. Forcing `object-cover` on a 4:5 campaign portrait cuts
           * roughly two-thirds of its height away, and the first thing to go is the
           * candidate's head — which is the whole point of the photograph.
           */
          const contained = s.orientation === 'portrait' || s.orientation === 'square';
          /* The contained image's bottom padding is not decoration: the caption
             band is absolutely positioned over the frame (pt-12 + text + pb-10),
             so the figure has to stop above where its first line begins —
             measured at 233px of a 339px frame on desktop, ~157px of ~237px on a
             phone. pb-20/sm:pb-28 is what keeps a candidate's feet out of the
             caption. */
          return (
          <div key={s.id} className="relative aspect-[16/10] w-full shrink-0 sm:aspect-[16/9]" aria-hidden={i !== index}>
            {s.src ? (
              contained ? (
                <>
                  <Image
                    src={s.src}
                    alt=""
                    aria-hidden
                    fill
                    sizes="100vw"
                    priority={i === 0}
                    className="scale-110 object-cover blur-2xl brightness-[.72] saturate-75"
                  />
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="100vw"
                    priority={i === 0}
                    className="object-contain p-2 pb-20 sm:p-6 sm:pb-28"
                  />
                </>
              ) : (
                <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
              )
            ) : (
              <div role="img" aria-label={s.alt} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-green via-brand-green-dark to-brand-dark p-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/10 font-display text-3xl font-extrabold text-white">
                  OW
                </span>
                <p className="font-display text-base font-bold tracking-wide text-white/95">Ola Western</p>
                <p className="text-[11px] uppercase tracking-widest text-white/50">… towards responsible representation</p>
              </div>
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-10 pt-12">
              <p
                className="text-sm font-semibold text-white sm:text-base"
                /* A carousel tile is a library row, so its caption is editable here —
                   unless it is an empty frame awaiting photography (no row to edit). */
                {...(s.src && !s.id.startsWith('open-')
                  ? { 'data-ow': `media.${s.id}.caption`, 'data-ow-label': 'Photo caption' }
                  : null)}
              >
                {s.caption}
              </p>
              {s.credit && <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/50">{s.credit}</p>}
            </figcaption>
          </div>
          );
        })}
      </div>

      {/* Controls */}
      <button type="button" onClick={prev} aria-label="Previous photo"
        className="absolute left-3 top-1/2 flex h-11 w-11 items-center justify-center -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button type="button" onClick={next} aria-label="Next photo"
        className="absolute right-3 top-1/2 flex h-11 w-11 items-center justify-center -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Dots + pause */}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Show photo ${i + 1}: ${s.caption}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`flex h-11 w-6 items-center justify-center rounded-full ${i === index ? 'bg-transparent' : 'bg-transparent'}`}
          >
            <span className={`block h-2 rounded-full transition-all ${i === index ? 'w-6 bg-brand-green-light' : 'w-2 bg-white/40 hover:bg-white/70'}`} />
          </button>
        ))}
        {count > 1 && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
            className="ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
          >
            {playing ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
