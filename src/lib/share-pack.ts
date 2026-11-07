export interface ShareAsset {
  id: string;
  title: string;
  kind: 'Banner sticker' | 'Badge' | 'Sticker';
  file: string;
  thumb: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * The 22 approved sticker/badge designs supplied for the 2027 campaign.
 * Originals live in /public/images/share-pack; thumbs are WebP for the grid.
 * The same set is bundled as /downloads/ola-western-share-pack.zip.
 */
export const SHARE_PACK: ShareAsset[] = [
  { id: '01', title: 'Sticker 01', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-01.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-01.webp', width: 790, height: 314, bytes: 247540 },
  { id: '02', title: 'Sticker 02', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-02.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-02.webp', width: 705, height: 315, bytes: 256270 },
  { id: '03', title: 'Sticker 03', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-03.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-03.webp', width: 731, height: 322, bytes: 264442 },
  { id: '04', title: 'Sticker 04', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-04.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-04.webp', width: 558, height: 328, bytes: 213794 },
  { id: '05', title: 'Sticker 05', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-05.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-05.webp', width: 624, height: 333, bytes: 217053 },
  { id: '06', title: 'Sticker 06', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-06.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-06.webp', width: 632, height: 306, bytes: 208629 },
  { id: '07', title: 'Sticker 07', kind: 'Badge', file: '/images/share-pack/ola-western-sticker-07.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-07.webp', width: 327, height: 322, bytes: 141562 },
  { id: '08', title: 'Sticker 08', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-08.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-08.webp', width: 804, height: 346, bytes: 312733 },
  { id: '09', title: 'Sticker 09', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-09.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-09.webp', width: 716, height: 321, bytes: 275849 },
  { id: '10', title: 'Sticker 10', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-10.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-10.webp', width: 817, height: 307, bytes: 272804 },
  { id: '11', title: 'Sticker 11', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-11.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-11.webp', width: 721, height: 331, bytes: 280866 },
  { id: '12', title: 'Sticker 12', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-12.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-12.webp', width: 762, height: 337, bytes: 287685 },
  { id: '13', title: 'Sticker 13', kind: 'Badge', file: '/images/share-pack/ola-western-sticker-13.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-13.webp', width: 399, height: 352, bytes: 175688 },
  { id: '14', title: 'Sticker 14', kind: 'Badge', file: '/images/share-pack/ola-western-sticker-14.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-14.webp', width: 381, height: 406, bytes: 208250 },
  { id: '15', title: 'Sticker 15', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-15.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-15.webp', width: 494, height: 278, bytes: 161900 },
  { id: '16', title: 'Sticker 16', kind: 'Badge', file: '/images/share-pack/ola-western-sticker-16.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-16.webp', width: 389, height: 353, bytes: 165132 },
  { id: '17', title: 'Sticker 17', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-17.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-17.webp', width: 630, height: 322, bytes: 256112 },
  { id: '18', title: 'Sticker 18', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-18.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-18.webp', width: 584, height: 163, bytes: 125431 },
  { id: '19', title: 'Sticker 19', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-19.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-19.webp', width: 1084, height: 176, bytes: 213178 },
  { id: '20', title: 'Sticker 20', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-20.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-20.webp', width: 802, height: 271, bytes: 255511 },
  { id: '21', title: 'Sticker 21', kind: 'Banner sticker', file: '/images/share-pack/ola-western-sticker-21.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-21.webp', width: 536, height: 282, bytes: 196964 },
  { id: '22', title: 'Sticker 22', kind: 'Badge', file: '/images/share-pack/ola-western-sticker-22.png', thumb: '/images/share-pack/thumbs/ola-western-sticker-22.webp', width: 320, height: 316, bytes: 149635 },
];

export const SHARE_PACK_ZIP = '/downloads/ola-western-share-pack.zip';
