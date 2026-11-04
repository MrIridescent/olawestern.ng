/**
 * SlotImage — renders one named image position from the CMS media library.
 *
 * Pages ask for a slot by name; the resolver supplies the photo, its caption,
 * the outlet credit and the frame shape that matches the space. When the media
 * desk has nothing for that position yet, PhotoSlot draws the branded panel —
 * never a broken image.
 */
import PhotoSlot from './PhotoSlot';
import { SLOT_LABELS, type SlotMap } from '@/lib/slots';

interface Props {
  slots: SlotMap;
  slot: string;
  fallbackAlt?: string;
  className?: string;
  priority?: boolean;
  /** Allow a photo already used elsewhere on the page to appear again. */
  reuse?: boolean;
  /** Only a photo filed for this exact position — no shape fallback, no borrowed scene. */
  exact?: boolean;
  sizes?: string;
  /** Set false on a decorative repeat so the Live Desk advertises one frame per position. */
  editable?: boolean;
}

export default function SlotImage({ slots, slot, fallbackAlt, className, priority = false, reuse = false, exact = false, sizes, editable = true }: Props) {
  const frame = slots.frame(slot, fallbackAlt, { reuse, exact });
  return (
    <PhotoSlot
      src={frame.src}
      alt={frame.alt}
      slot={frame.slot}
      caption={frame.caption ?? undefined}
      credit={frame.credit ?? undefined}
      href={frame.source_url}
      ratio={frame.ratio}
      className={className}
      priority={priority}
      sizes={sizes}
      editable={editable}
      ratioText={frame.ratio_text}
      mediaId={frame.media_id}
      label={SLOT_LABELS[frame.slot] ?? frame.slot}
      exact={exact}
    />
  );
}
