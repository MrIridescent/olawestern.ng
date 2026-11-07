import Image from 'next/image';
import Link from 'next/link';

import { PRESS_ARCHIVE, type ArchivePhoto } from '@/lib/pressArchive';

/**
 * PressArchive — the photographic record, uncropped and attributed.
 *
 * Each frame keeps its own aspect ratio (a masonry column, not a fixed crop), so
 * a portrait is never sliced through the head to fit a grid. The caption says
 * only what the outlet published, and the credit links to the report itself.
 */

function Card({ photo }: { photo: ArchivePhoto }) {
  return (
    <figure className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-sm">
      <div className="relative w-full">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="h-auto w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand-navy/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur">
          {photo.year}
        </span>
      </div>
      <figcaption className="px-4 py-4">
        <p className="text-xs leading-relaxed text-brand-dark/85">{photo.caption}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-brand-navy/5 pt-2.5">
          <a
            href={photo.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-brand-electric underline decoration-brand-electric/30 underline-offset-2 hover:text-brand-navy"
          >
            {photo.credit} · {photo.date} ↗
          </a>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-gray/70">
            {photo.outlet}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

export default function PressArchive({
  photos = PRESS_ARCHIVE,
  heading,
  intro,
  id,
}: {
  photos?: ArchivePhoto[];
  heading: string;
  intro?: string;
  id?: string;
}) {
  const years = Array.from(new Set(photos.map((p) => p.year))).sort((a, b) => b - a);

  return (
    <section className="bg-brand-light py-14" id={id}>
      <div className="container-site">
        <p className="section-kicker">The photographic record</p>
        <h2 className="section-title text-2xl sm:text-3xl">{heading}</h2>
        {intro && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-gray">{intro}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-brand-gray">
          <span className="rounded-full bg-white px-3 py-1">{photos.length} frames</span>
          <span className="rounded-full bg-white px-3 py-1">
            {years[years.length - 1]}–{years[0]}
          </span>
          <span className="rounded-full bg-white px-3 py-1">Every frame credited and linked</span>
        </div>

        <div className="mt-7 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {photos.map((photo) => (
            <Card key={photo.id} photo={photo} />
          ))}
        </div>

        <p className="mt-6 max-w-3xl text-[11px] leading-relaxed text-brand-gray">
          These are press photographs, reproduced with the outlet&apos;s credit and linked to the
          report they ran in. Nothing here is AI-generated. Where a caption names Ola Western, the
          source report places him at that event; where it does not, the frame documents the work or
          the community without claiming he is in the picture.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/gallery"
            className="rounded-full bg-brand-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-electric"
          >
            Open the full gallery
          </Link>
          <Link
            href="/impact"
            className="rounded-full border border-brand-navy/20 px-4 py-2.5 text-xs font-bold text-brand-navy transition hover:border-brand-electric hover:text-brand-electric"
          >
            The dated record behind the photographs
          </Link>
        </div>
      </div>
    </section>
  );
}
