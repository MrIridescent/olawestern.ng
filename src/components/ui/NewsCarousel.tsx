'use client';

import Link from 'next/link';
import { EmblaCarousel } from '@/components/ui/EmblaCarousel';
import type { PressItem } from '@/types';

export default function NewsCarousel({ news }: { news: PressItem[] }) {
  return (
    <EmblaCarousel>
      {news.map((n) => (
        <div key={n.id} className="embla__slide">
          <article className="card">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue-dark">
              {n.source === 'campaign_hq' ? 'Campaign HQ · 32 Road' : n.source === 'festaconline' ? 'Community Press' : 'Partner Statement'}
              {' — '}
              {new Date(n.published_at ?? n.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold leading-snug" data-ow={`press.${n.id}.title`} data-ow-label="Release headline">
              <Link href={`/news/${n.slug}`} className="transition-colors hover:text-brand-green">
                {n.title}
              </Link>
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-brand-gray" data-ow={`press.${n.id}.summary`} data-ow-label="Standfirst">{n.summary}</p>
            <Link
              href={`/news/${n.slug}`}
              className="mt-3 inline-flex min-h-[44px] items-center text-xs font-bold text-brand-green underline underline-offset-2"
            >
              Read the full release →
            </Link>
          </article>
        </div>
      ))}
    </EmblaCarousel>
  );
}