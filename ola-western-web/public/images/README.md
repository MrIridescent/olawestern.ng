# Image slots — how a photo gets onto the site

Every image position on the site is declared in `src/lib/content.ts`
(`MEDIA_POSITIONS`, 20 frames). The **photo library in the CMS is the single source
of truth** for what fills them, so the day-to-day route for a new photograph is:

1. **Standing on the page that has the frame** — ⌘E, tap the frame. The picker lists the
   library in the order it would actually render, each one drawn inside a live crop of
   itself with the percentage the frame throws away and a *soft at this size* warning
   under 700px. Upload from there and it files straight into that frame.
2. Or `/admin` → **Photo Library** → upload the file (JPG/PNG/WebP/GIF, ≤10 MB), type the
   caption and credit exactly as the event happened, name the photographer, pick the frame
   under **Position**, tick *Published* (and *Featured* for a lead), save.

Either way the page it feeds refreshes immediately — no rebuild, no redeploy.

Dropping a file in this folder by hand is only for the initial build; the CMS keeps
its own record of size, orientation and slot, and a manual file has no record, so it
will not appear anywhere.

## The 20 frames and what is in them today

| Slot | Ratio | Filled by |
|---|---|---|
| `candidate-portrait` | 4:5 | Festac Online — 2023 primaries win (771×1080) |
| `rally-address` | 16:9 | P.M. Express — APC Amuwo-Odofin rally for 2027 (2560×1440) |
| `primary-victory` | 16:9 | Festac Online — flagbearer emergence (860×530) |
| `food-fest` | 4:5 | P.M. Express — palliatives distribution (810×1080) |
| `drainage-work` | 16:9 | Festac Online — 7th Avenue drainage clearing (1040×780) |
| `boreholes-water` | 16:9 | Festac Online — Western Concrete boreholes (1050×750) |
| `form-pickup` | 16:9 | Festac Online — 2022 form pickup (1024×768) |
| `candidate-profile` | 4:5 | Festac Online — #AmuwoDecides23 candidate feature (629×702) |
| `youth-niwa` | 4:5 | P.M. Express — Sterling Youth feature (495×619) |
| `sanitation` | 1:1 | Lagos Panorama — monthly sanitation (350×350) |
| `primary-night` | 16:9 | P.M. Express — 2026 primaries sweep (869×486) |
| `consensus` | 16:9 | Festac Online — APC consensus reveal (480×314) |
| `graphic` | 16:9 | `generated/` — mandate, pillars, slogan cards (typographic, no faces) |
| `town-hall-festac` | 16:9 | ARBR — interactive candidates session (1440×810) |
| `agboju-market` | 16:9 | Festac Online — Agboju traders' engagement (1200×801) |
| `youth-tournament` | 16:9 | Festac Online — Penalty King youth tournament (1024×682) |
| `23-road-inspection` | 16:9 | **Open — needs campaign photography** |
| `community-security` | 16:9 | **Open — needs campaign photography** |
| `family-portrait` | 4:5 | **Open — needs campaign photography (and family approval)** |
| `hq-office` | 16:9 | **Open — needs a photo of 32 Road, FESTAC Town** |

Press photographs are re-published with the outlet's credit and the link to the
article they came from. Where a photo is smaller than its frame, HQ should replace
it with the campaign's own photography from the same tab — the library keeps the
original file and the attribution.

## Why four frames are empty

A frame that names a place, an event or a person is marked `exact`
(`src/lib/slots.ts`), which turns off the "use any photo whose shape fits"
fallback. No report on the internet documents a 23 Road street inspection, an
estate security meeting, the candidate's family, or the HQ building, so those four
frames render the clean branded panel instead of a plausible stand-in. Filling them
is a photography job, not a scraping job.

## Rules

Real campaign photography only — **no AI-generated images of the candidate**, and no
photo captioned as showing him unless the report it came from says he was there.
Empty frames show a branded panel with no visible "placeholder" labelling; each frame
carries `data-slot="<slot>"` so anyone can check which position a picture feeds.
Anything bound to a frame is cropped to that frame's ratio (`object-cover`), and the
publishing scripts refuse a photo that would lose more than a third of the shorter
dimension, so supply landscape shots for 16:9 and vertical for 4:5.
