'use client';

/**
 * VideoEmbed — click-to-play YouTube frame.
 *
 * Nothing is downloaded from Google until a visitor actually plays the clip, so
 * the page stays 3G-fast and the candidate's supporters are not tracked while
 * they read. The poster is YouTube's own frame grab, and the embed runs from
 * youtube-nocookie.com.
 */
import { useState } from 'react';

interface Props {
  youtubeId: string;
  title: string;
  outlet?: string | null;
  /** Rendered as the large hero clip on the homepage. */
  priority?: boolean;
  className?: string;
}

export default function VideoEmbed({ youtubeId, title, outlet, priority = false, className = '' }: Props) {
  const [playing, setPlaying] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  if (playing) {
    return (
      <div className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-black ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-2xl ${className}`}>
      {!posterFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
          alt=""
          aria-hidden="true"
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setPosterFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-brand-green via-brand-green-dark to-brand-dark" />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25" />
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play video: ${title}`}
        className="group absolute inset-0 flex min-h-[48px] flex-col items-center justify-center gap-3 p-4 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition group-hover:scale-105 group-active:scale-95">
          <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-brand-green-dark" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="max-w-[46ch] font-display text-sm font-bold leading-snug text-white drop-shadow sm:text-base">{title}</span>
        {outlet ? <span className="text-[11px] uppercase tracking-wider text-white/80">{outlet}</span> : null}
      </button>
    </div>
  );
}
