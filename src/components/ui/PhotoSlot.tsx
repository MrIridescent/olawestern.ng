/**
 * PhotoSlot — the site-wide image frame system.
 *
 * Every image position on the campaign site goes through this component.
 * With `src` it renders the photo; without it, it renders a clean branded
 * panel (never a broken image or an instruction to the media team — the file
 * mapping lives in public/images/README.md).
 */
import Image from 'next/image';

export type SlotRatio = 'portrait' | 'tall' | 'wide' | 'square' | 'video';

const RATIOS: Record<SlotRatio, string> = {
  portrait: 'aspect-[4/5]',
  tall: 'aspect-[3/4]',
  wide: 'aspect-[16/9]',
  square: 'aspect-square',
  video: 'aspect-video',
};

interface PhotoSlotProps {
  src?: string | null;
  alt: string;
  /** File name under public/images/ — documented in public/images/README.md. */
  slot: string;
  caption?: string | null;
  credit?: string | null;
  /** Article the press photo ran in — the credit becomes a verifiable link. */
  href?: string | null;
  ratio?: SlotRatio;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /**
   * Live Desk hooks (see components/livedesk). The frame advertises itself as an
   * editing target with its declared ratio, the library row filling it, and
   * whether a borrowed photograph is allowed to stand in — nothing else about the
   * render changes, and a visitor's markup is the same element either way.
   */
  ratioText?: string;
  mediaId?: string | null;
  label?: string;
  exact?: boolean;
  /** False for decorative repeats of a photo (carousel slides) so one tap = one frame. */
  editable?: boolean;
}

export default function PhotoSlot({
  src,
  alt,
  slot,
  caption,
  credit,
  href,
  ratio = 'wide',
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 600px',
  ratioText,
  mediaId,
  label,
  exact = false,
  editable = true,
}: PhotoSlotProps) {
  const desk = editable
    ? {
        'data-ow': `slot.${slot}`,
        ...(label ? { 'data-ow-label': label } : null),
        ...(ratioText ? { 'data-ow-ratio': ratioText } : null),
        ...(mediaId ? { 'data-ow-media': mediaId } : null),
        ...(exact ? { 'data-ow-exact': '1' } : null),
      }
    : {};
  return (
    <figure className={`group overflow-hidden rounded-2xl ${className}`} {...desk}>
      <div className={`${RATIOS[ratio]} relative w-full overflow-hidden rounded-2xl`}>
        {src ? (
          /^https?:\/\//.test(src) ? (
            // An off-site URL (the CMS can point at a hosted image): a plain
            // <img> avoids the Next optimizer, which only serves configured hosts.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              loading={priority ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes={sizes}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          )
        ) : (
          <div
            role="img"
            aria-label={alt}
            data-slot={slot}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-brand-green via-brand-green-dark to-brand-dark p-6 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 font-display text-2xl font-extrabold text-white">
              OW
            </span>
            <p className="font-display text-sm font-bold tracking-wide text-white/95">Ola Western</p>
            <p className="max-w-[30ch] text-[11px] leading-snug text-white/60">
              … towards responsible representation
            </p>
          </div>
        )}
      </div>
      {(caption || credit) && (
        <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
          {caption && (
            <p
              className="text-xs leading-snug text-brand-gray"
              {...(mediaId ? { 'data-ow': `media.${mediaId}.caption`, 'data-ow-label': 'Photo caption' } : null)}
            >
              {caption}
            </p>
          )}
          {credit &&
            (href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-[10px] uppercase tracking-wider text-brand-blue underline decoration-brand-blue/30 underline-offset-2 hover:decoration-brand-blue"
              >
                {credit}
              </a>
            ) : (
              <p
                className="text-[10px] uppercase tracking-wider text-gray-600"
                {...(mediaId ? { 'data-ow': `media.${mediaId}.credit`, 'data-ow-label': 'Photo credit' } : null)}
              >
                {credit}
              </p>
            ))}
        </figcaption>
      )}
    </figure>
  );
}
