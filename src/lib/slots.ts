/**
 * slots.ts — turns the CMS media library into the frames the site renders.
 *
 * Every image position on the campaign site is a named slot (see
 * MEDIA_POSITIONS). The resolver picks the published photo bound to that slot,
 * falling back to any published photo whose shape fits the frame, so the
 * branded placeholder panels only appear where the media desk genuinely has no
 * picture yet. Captions and outlet credits travel with the photo.
 */
import { listMedia } from './store';
import { MEDIA_POSITIONS } from './content';

import type { GallerySlide, MediaAsset } from '@/types';
import type { SlotRatio } from '@/components/ui/PhotoSlot';

/** Frame shape declared for each position, translated to PhotoSlot ratios. */
const RATIO_TEXT: Record<string, SlotRatio> = {
  '4:5': 'portrait',
  '16:9': 'wide',
  '1:1': 'square',
  '3:4': 'tall',
};

/**
 * Build the slot → frame lookup from the single declaration in
 * `MEDIA_POSITIONS`. These maps used to be left empty, which made every
 * unknown slot fall back to 16:9 — a portrait was cropped through the head
 * on the home hero.
 */
export const SLOT_RATIOS: Record<string, SlotRatio> = {};
export const SLOT_LABELS: Record<string, string> = {};
const SLOT_RATIO_TEXT: Record<string, string> = {};

for (const position of MEDIA_POSITIONS) {
  SLOT_RATIOS[position.slot] = RATIO_TEXT[position.ratio] ?? 'wide';
  SLOT_LABELS[position.slot] = position.label;
  SLOT_RATIO_TEXT[position.slot] = position.ratio;
}

export function ratioFor(slot: string): SlotRatio {
  return SLOT_RATIOS[slot] ?? 'wide';
}

/** Shape a photo needs to fill a frame without a crop that fights the subject. */
function shapeFor(ratio: SlotRatio): MediaAsset['orientation'] {
  return ratio === 'wide' ? 'landscape' : ratio === 'square' ? 'square' : 'portrait';
}

export interface SlotFrame {
  slot: string;
  src: string | null;
  alt: string;
  caption: string | null;
  credit: string | null;
  source_url: string | null;
  ratio: SlotRatio;
  /** Declared ratio string (16:9 / 4:5 / 1:1) for the crop-fit maths in the desk overlay. */
  ratio_text: string;
  /** Which library row is filling it — lets the desk edit or release that photo in place. */
  media_id: string | null;
  /** True when the frame is showing the branded panel instead of a photo. */
  empty: boolean;
}

export class SlotMap {
  private used = new Set<string>();

  constructor(readonly all: MediaAsset[]) {}

  /**
   * Best photo for a position: the one slotted for it, else one that fits the shape.
   *
   * `exact` stops the shape fallback. A gallery tile can show any campaign
   * photograph, but a frame that names a place or a person — the HQ photo on
   * /contact — must not be filled by a picture of something else, so those call
   * sites ask for exact and take the branded panel until the desk files the shot.
   */
  pick(slot: string, opts: { reuse?: boolean; exact?: boolean } = {}): MediaAsset | null {
    const mine = this.all.filter((m) => m.slot === slot && (opts.reuse || !this.used.has(m.id)));
    if (mine.length) return this.take(mine[0], opts);
    if (opts.exact) return null;
    const shape = shapeFor(ratioFor(slot));
    const fits = this.all.filter((m) => m.orientation === shape && (opts.reuse || !this.used.has(m.id)));
    return fits.length ? this.take(fits[0], opts) : null;
  }

  private take(asset: MediaAsset, opts: { reuse?: boolean }): MediaAsset {
    if (!opts.reuse) this.used.add(asset.id);
    return asset;
  }

  frame(slot: string, fallbackAlt?: string, opts: { reuse?: boolean; exact?: boolean } = {}): SlotFrame {
    const asset = this.pick(slot, opts);
    const ratio = ratioFor(slot);
    const ratioText = SLOT_RATIO_TEXT[slot] ?? '16:9';
    if (!asset) {
      return {
        slot,
        src: null,
        alt: fallbackAlt ?? SLOT_LABELS[slot] ?? slot,
        caption: null,
        credit: null,
        source_url: null,
        ratio,
        ratio_text: ratioText,
        media_id: null,
        empty: true,
      };
    }
    return {
      slot,
      src: asset.src,
      alt: asset.alt,
      caption: asset.caption,
      credit: asset.credit,
      source_url: asset.source_url,
      ratio,
      ratio_text: ratioText,
      media_id: asset.id,
      empty: false,
    };
  }

  /** Carousel / gallery feed: every published photo, featured first. */
  slides(limit?: number): GallerySlide[] {
    const rows = [...this.all].sort((a, b) => Number(b.featured) - Number(a.featured));
    return (limit ? rows.slice(0, limit) : rows).map<GallerySlide>((m) => ({
      id: m.id,
      slot: m.slot ?? 'graphic',
      src: m.src,
      alt: m.alt,
      caption: m.caption ?? SLOT_LABELS[m.slot ?? ''] ?? '',
      credit: m.credit ?? undefined,
      href: m.source_url,
      // The carousel frame is landscape; this photograph may not be. The slide has
      // to carry its own shape or a 4:5 portrait gets cropped through the head.
      orientation: m.orientation,
    }));
  }

  /** Positions the campaign still wants a picture for, as branded frames. */
  openSlots(): GallerySlide[] {
    return [];
  }
}

/** Load the published library once per page render. */
export async function slots(): Promise<SlotMap> {
  return new SlotMap(await listMedia({ publishedOnly: true }));
}