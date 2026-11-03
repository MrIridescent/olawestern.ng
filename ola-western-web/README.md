# Ola Western Campaign Web

Official campaign website **and content platform** for **Hon. Engr. Folorunsho Olaitan Segun (Ola Western)** — APC candidate for the Lagos State House of Assembly, **Amuwo-Odofin Constituency I** (Festac I, II, III & Mile 2).

> “… towards responsible representation”

Next.js 14 (App Router, TypeScript) · Tailwind CSS · mobile-first, phone-tested layout · dual-backend data layer (Supabase PostgreSQL **or** the bundled persistent file store) · nine-tab campaign CMS at `/admin` (ledger, newsroom, record, sources, photo library, video library, site copy, Help Desk, leads) · Constituent Help Desk at `/help-desk` · Meta WhatsApp Cloud API · AI Campaign War Room webhook sync.

## Run it

```bash
npm install
cp .env.example .env.local   # set at least ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

A `.env.local` is already provisioned on the pitch machine (dev passwords only — change all three values before any real deployment; it is gitignored).

## Data backend — zero-config, fully persistent

The whole platform works with **no external services**:

- `src/lib/store.ts` is one interface over **two interchangeable backends**. With no Supabase credentials it persists everything to `data/db.json` on the server (atomic writes with an EPERM retry + in-place fallback, real storage — volunteers, inquiries, Truth Room ledger, newsroom, track record, Help Desk issues, media library, video library, profile facts, social channels, press references, site copy). With `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, every function transparently switches to Postgres. Same behaviour, same APIs.
- **Reads and writes use different keys, on purpose.** Pages read with the anon key so RLS can keep unpublished rows out of the public HTML. Every mutation goes through `getWriteClient()`, which prefers `SUPABASE_SERVICE_ROLE_KEY` — the campaign tables have no anonymous INSERT/UPDATE/DELETE policy by design, so a CMS save on a Supabase site without the service-role key fails instead of half-writing. The `/admin` header prints which store it is saving to and warns when writes are not yet possible.
- `src/lib/content.ts` holds the seed content. `SEED_VERSION` is the bundle marker: when it changes, `resyncSeeds()` refreshes the bundled ledger rows over a stored database **without touching collected data** — volunteers and inquiries always survive, and any CMS-created row whose id the bundle does not own is kept. A store written by an older build is upgraded on first read.
- **A row the desk deletes stays deleted.** `data/db.json` keeps a `removed` list of tombstones for seed-owned ids, so a withdrawn photo, retracted citation or unpublished clip cannot come back on the next content drop. CMS-created rows need no tombstone (nothing would resurrect them), so the list stays short.
- `DATA_DIR` can point the file store at a mounted volume.
- `supabase/migrations/0001_init.sql` + `0002_cms_content_tables.sql` are the schema. `0002` adds the CMS-era tables (`media`, `videos`, `profile_facts`, `socials`, `press_references`, `site_settings`), aligns `constituent_inquiries.status` with the app's `new → reviewed → answered` triage, and records `volunteers.consent_at`. Ids are `TEXT`, not `UUID`, because the bundled seed rows carry readable slugs (`gfx-mandate`, `vid-tvc-flagbearer`, `soc-x`, `site`) that must be importable verbatim.

## Campaign CMS — `/admin`

Real session auth (HMAC-SHA256 signed httpOnly cookie, 12-hour TTL, `ADMIN_PASSWORD` + `ADMIN_SECRET`), nine tabs, every write revalidates the public page it feeds:

| Tab | Does |
|---|---|
| **Truth Room** | create / edit / delete fact-checks; verdict, evidence, document link, feature flag |
| **Newsroom** | write, **edit**, publish / take offline and delete dated press releases (headline, standfirst, body, source, PDF link) → `/news` and the home preview |
| **Track Record** | add / **edit** / remove service-record entries with category, verification link **and a photo chosen from the media library** (live thumbnail preview in the picker) |
| **Sources** | cite, correct and withdraw the press links behind `/impact#sources` — outlet, headline, date/year, URL |
| **Photo Library** | upload photography (or bind a harvested press URL), crop-fit metadata, caption, credit, source link, **bind it to a named image position**, publish/feature, delete |
| **Video** | paste any YouTube link / watch URL / bare id — verified against YouTube's oEmbed before it can be saved; title and outlet are prefilled from the lookup; publish, feature, edit, delete |
| **Site Copy** | three sections: homepage message (hero kicker/title/slogan/body + closing CTA + the animated stat strip), the candidate file shown on About, and the official channels (social handles) |
| **Help Desk** | resident reports + desk-authored entries in one queue: set status, write the plain-language progress note, publish or unpublish, log an issue directly, delete |
| **Leads Inbox** | live volunteer + Ask-Ola tables, inquiry triage (new → reviewed → answered), spam/duplicate **delete** on both lists, one-click **CSV export** (volunteers include the NDPA consent timestamp) |

Admin API routes (`/api/admin/...`) are all bearer-cookie guarded; unauthenticated calls get 401. `sitemap.xml`/robots exclude `/admin`, and its metadata is `noindex`.

Every field is validated server-side before it can be stored (`src/lib/cms.ts`): lengths are capped, dates must be ISO, years must be plausible, links must be real `http(s)` (a `javascript:` URL is refused), verdicts/categories/sources/platforms must be one of the app's own unions, and an image position must be a frame the site actually renders — an unknown `slot` is rejected rather than silently creating a photo nothing displays. A blank profile-fact value is kept but stays off the public site, because the About page shows only what HQ has confirmed in writing.

## Live Desk — the public site is the CMS

The tabs above work, and they are still where bulk work belongs. But a campaign does not edit a website in a form about a website — it edits the sentence a voter is reading. So the site is also its own editor: open any page signed in, and the page becomes the editing surface.

```
⌘E / Ctrl+E   arm or disarm the desk on this page
tap anything  edit that headline, caption, claim, verdict or photo frame, in place
⌘K            command deck — paste a link, or jump anywhere
⌘Z            undo the last change the desk accepted
Esc           leave the field alone
```

- **No second UI to keep in sync.** The pages stay server components with one extra attribute each (`data-ow="settings.hero_title"`, `record.a12.verification_source_url`, `media.gfx-mandate.caption`, `slot.hq-office`). One capture-phase listener on `document` reads whichever attribute was tapped and resolves it through the field registry in `src/lib/liveDesk/contract.ts` — label, input kind, length cap, and the exact route + body that saves it. There is no per-page handler, no duplicated form, and nothing to forget to update when a field moves.
- **The value you edit is the value on the page.** The sheet is prefilled from the text already rendered (or from `data-ow-value` where the visible text is an animation or a badge), the counter is the route's real maximum, and saving calls the same `/api/admin/...` route the tabs call. The same validation runs, the same `revalidatePath` fires, and `router.refresh()` redraws the page the desk is standing on from the server — no reload, no lost scroll position. A refusal shows the route's own sentence, never a reworded one.
- **A frame is not a field.** Tapping a photo frame opens the library for that frame only, each candidate drawn inside a live crop of itself with the percentage the frame throws away (`fitFor`, the same 34% gate the harvesters use), plus the soft-at-this-size warning. Placing a photo demotes whatever held the frame first, and an `exact` frame — one that names a place, event or person — does not browse the library at all: it takes an upload or it stays on the branded panel.
- **⌘K parses, it does not generate.** A pasted YouTube/watch/youtu.be/shorts link becomes "Publish this clip to the shelf", the server's oEmbed lookup fills the title and outlet, and a human edits them before it saves. A pasted article link becomes "Cite this article as a source". Everything else is a keystroke away: the tabs, the queues, the nine pages, disarm, undo. There is no model in this layer and nothing it accepts is invented — an AI writing a claim about a real candidate is precisely the liability this site exists to avoid.
- **The integrity rail grades the site, not the editor.** `GET /api/admin/health` recomputes the store's own rows (`src/lib/liveDesk/integrity.ts`) into a 0–100 defensibility score, a `ready` flag and findings weighted `block 18 / warn 7 / info 2`: unsourced service claims, rulings with no document, frames still on the panel, photos too small or cropped past a third, candidate-file rows HQ has not confirmed, drafts and queues left sitting. Each finding expands to the individual lines, and **"Show me on the page" navigates and outlines the offending sentence** instead of describing it. Findings with no public sentence (the Help Desk queue, an unconfirmed handle) open the CMS tab that holds them — `?tab=` deep-links into the dashboard.
- **Voters see none of it.** The desk asks `GET /api/admin/login` first; a cookie-less probe gets `authenticated: false` and the component renders nothing — no dock, no listeners, no overlay DOM, and none of it is in the server HTML. Worklist hints (`data-ow-missing`, e.g. "Add the report that proves this") are `display: none` for everyone and appear only while the desk is armed, so an unfinished sentence is never advertised to the other side.
- **Nothing writes on its own.** Every save is a human pressing Save; the undo stack replays the same routes with the previous value.

### The publish gate

`POST /api/admin/record` and `POST /api/admin/fact-checks` refuse a row without its evidence link, and a `PATCH` can replace that link but never empty it — taking a claim down is a different decision and lives in `DELETE`. The wording is one sentence everywhere (`EVIDENCE_RULE` in `src/lib/cms.ts`) so the desk learns one rule rather than one per endpoint. Rows published before the gate existed stay correctable — refusing a typo fix would keep a wrong sentence live — and the rail grades each of them `block` until it carries a report. Today that is four lines: the healthcare-relief, youth-tournament and community-security entries on `/impact`, and the "lawmakers are removed from the people" ruling on `/truth-room`. None of the 21 links in the reference library says those sentences, so they stay unsourced until the campaign supplies a report or a document or HQ withdraws them. The ballot ruling that used to sit alongside them now carries the FestacOnline flagbearer story, which names the party, the office and the constituency — that is the bar: the report has to state the claim, not merely mention the candidate.

```bash
node scripts/check-cms-gates.mjs        # 12 checks: session, audit, gate, cleanup
```

It logs in with `ADMIN_PASSWORD` from `.env.local` (the password is never printed), confirms an anonymous caller cannot read the audit or write, confirms the gate refuses a sourceless and a `javascript:` row and accepts a sourced one, then deletes the throwaway entry it created and reports that nothing was left behind.

## Photography that fills every frame

The media library is the single source of truth for every image on the site (`src/lib/slots.ts`):

- `MEDIA_POSITIONS` in `src/lib/content.ts` declares the ~20 named frames the site renders, each with its aspect ratio (`candidate-portrait` 4:5, `town-hall-festac` 16:9, `sanitation` 1:1…). `SlotMap.pick(slot)` chooses the photo **bound to that frame**, and if none is bound yet it falls back to any published photo whose orientation fits, so an uploaded picture is used sensibly instead of sitting unused. `PhotoSlot` renders the frame at the right ratio; the branded panel only appears where the desk genuinely has nothing.
- **A frame that names a place or a person is `exact`.** `pick(slot, { exact: true })` / `<SlotImage exact>` turn the orientation fallback off, so a picture of some other event can never stand in for the campaign HQ (`/contact`), the family portrait, or a named road. Those frames show the clean branded panel until HQ supplies the real photograph — for a reputation site an honest empty frame beats a plausible wrong one.
- Uploads (`/api/admin/media/upload`) are parsed with a dependency-free header probe (`src/lib/imageMeta.ts`): JPEG/PNG/WebP/GIF only, ≥40px per side, ≤10MB, and the stored `width × height` decides `orientation` automatically. Files land in `public/images/uploads/<slug>-<stamp>.<ext>`.
- **Replacing or deleting a photo removes the orphaned file from disk** (`purgeUpload`), with a `path.resolve` + prefix check so a crafted `src` cannot escape the upload folder. Uploaded files are kept if any other row still references them.
- Press imagery harvested from the reporting outlets keeps its `credit` and `source_url`, and only images large enough for the frame are published — the ones that are too small stay in the library unpublished with the reason in the caption.
- `next/image` remote patterns allow only the campaign's own Supabase bucket and Cloudinary, so a third-party press URL renders as a plain `<img>` with `loading="lazy"` rather than a 500 from the image optimiser.

## Press media toolchain (`scripts/`)

The desk does not need these to run the site — everything below is reproducible with uploads in `/admin` — but they are how the current photo library was filled, and they are the safe way to add more.

```bash
node scripts/harvest-press-media.mjs                 # pass 1: the og:image of each dossier article
node scripts/harvest-press-extra.mjs                 # pass 2: every content image in every article
node scripts/harvest-press-extra.mjs --offline       # re-probe the files already on disk, no network
node scripts/harvest-press-extra.mjs --only a,b      # harvest specific outlets, merged into the manifest
node scripts/publish-press-photos.mjs                # dry run: what would go where, and the crop each frame makes
node scripts/publish-press-photos.mjs --apply        # file them through the real CMS API
node scripts/publish-broadcast-videos.mjs            # register the verified TV/blog clips through /admin/videos
```

- **Dimensions are measured, not guessed.** `scripts/lib/press-media.mjs` holds one header probe shared by both harvesters. WEBP is a RIFF list of fourcc chunks, so it is *walked* (VP8X / VP8L / VP8, and into `ANMF` for animated files) rather than read at fixed offsets — Nigerian press sites on WordPress/Jetpack serve WEBP bytes under `.jpeg` names, and a fixed-offset read returns sizes like 682×11582. PNG/GIF/JPEG-SOF/AVIF-`ispe` are handled too, with HEIC refused as not web-safe.
- **`--offline` repairs a manifest in place** — it re-probes each file on disk and rewrites `bytes/width/height/orientation`, so a past bug in the probe can be corrected without re-downloading anything from the outlets.
- **Crop-fit gate.** Before a photo is bound to a frame, the publisher computes the `object-cover` crop (`cropLoss = r > 1 ? 1 − 1/r : 1 − r`, `r = photo ratio ÷ frame ratio`), prints it, and refuses anything above 34% — a 1:1 photo in a 16:9 banner would lose the people, so it goes to the gallery wall instead of the frame. Panoramic strips (long side > 6× short side) are dropped as banners, not photographs.
- **Writes go through the CMS, never around it.** Both publishers mint the same HMAC session cookie the `/admin` UI uses (`ADMIN_SECRET` from `.env.local`) and POST/PATCH `/api/admin/media` and `/api/admin/videos`, so slot validation, the `removed` tombstone list and `revalidateMedia()` all still apply. Video ids are confirmed against YouTube's oEmbed by the server before they save, and `publish-press-photos.mjs` demotes a rival photo from a curated slot rather than leaving two rows fighting for one frame. Re-runs are idempotent and leave desk edits alone unless `--refresh`.
- **Captions state only what the report states.** No photo is described as showing the candidate unless the article puts him in it, and nothing is bound to a frame whose subject the dossier does not document.


## Broadcast video

`VideoShelf` appears on the home page, `/gallery` and `/news`. It is a **click-to-play facade**: the shelf shows the YouTube `hqdefault` thumbnail and only injects the `youtube-nocookie.com` iframe after a tap, so a phone on a data plan never downloads anything from Google it did not ask for, and the page keeps third-party cookies off the campaign. The CMS confirms each id is live and embeddable before saving (401/403 → embedding is off; 404/400/410 → wrong link), and a YouTube outage does not block the desk.

## Truth Engine

- `GET /api/fact-check?q=&verdict=` — tokenised full-text search across claims + evidence, verdict filter (`VERIFIED FACT | FALSE CLAIM | MISLEADING`). Consumed by the AI widget and the War Room verifier.
- `/truth-room` — server-rendered ledger with instant client-side search + verdict chips (`TruthLedger`).
- `POST /api/truth-room/sync` — War Room publishes executive-approved drafts into the ledger via the `WAR_ROOM_SECRET_KEY` bearer secret. No autonomous publishing path exists (human-in-the-loop by architecture).

## Constituent Help Desk — `/help-desk`

The service office, online. Three working pieces, all human-moderated:

- **Report an issue** (`/api/issues`, POST) — ward, category, detail, optional name/number, explicit NDPA consent. Submissions are stored **unpublished**; nothing a resident writes can reach the public dashboard until the desk publishes it from `/admin`.
- **Public progress dashboard** (`IssueBoard`) — live counters (received / under review / action scheduled / resolved) plus status and ward filters. `GET /api/issues` returns published rows only and strips `reporter_name`, `reporter_phone` and `consent` server-side (`toPublic()`); the Supabase RLS policy in `supabase/migrations/0001_init.sql` mirrors that rule.
- **Open-door booking** (`MeetingRequestForm`) — in-person at 32 Road or a WhatsApp call, with date and time-window preference. It files an `Office Hours Booking` inquiry into the CMS inbox and deliberately shows no confirmation number — a human from the ward team calls back.

Six dated desk entries seed the board from the attested record (drainage, boreholes, 1st Avenue, 23 Road, Mile 2 jetty youth), so the page is never empty on first load.

## API surface

| Route | Method | Purpose |
|---|---|---|
| `/api/volunteer` | POST | Validate lead (+ NDPA consent) → store → War Room CRM webhook → WhatsApp welcome |
| `/api/inquiry` | POST | “Ask Ola” + open-door booking submissions → inquiries inbox |
| `/api/issues` | GET/POST | Public published-issue feed (PII-stripped) / resident report (stored unpublished) |
| `/api/fact-check` | GET | Truth Engine query surface (search + verdict filter) |
| `/api/media` | GET | Published photo library (gallery) |
| `/api/videos` | GET | Published video library |
| `/api/truth-room/sync` | POST | Bearer-secret webhook: War Room → Truth Room |
| `/api/admin/login` | POST/GET/DELETE | Session auth, probe, logout |
| `/api/admin/health` | GET | Integrity audit of the live store — score, `ready`, findings with the page + `data-ow` target of each one (feeds the Live Desk rail) |
| `/api/admin/fact-checks[/id]` | GET/POST/PATCH/DELETE | Truth Room ledger CRUD (`[id]`: PATCH/DELETE) |
| `/api/admin/press[/id]` | GET/POST/PATCH/DELETE | Newsroom CRUD + publish / take-offline toggle (`[id]`: PATCH/DELETE) |
| `/api/admin/record[/id]` | GET/POST/PATCH/DELETE | Track record CRUD incl. media-library photo (`[id]`: PATCH/DELETE) |
| `/api/admin/references[/id]` | GET/POST/PATCH/DELETE | Press source citations for `/impact#sources` (`[id]`: PATCH/DELETE) |
| `/api/admin/media` | GET/POST | Photo library (drafts included) / register a photo, slot validated against `MEDIA_POSITIONS` |
| `/api/admin/media/[id]` | PATCH/DELETE | Re-caption, re-slot, publish/feature toggle, swap file / withdraw and purge the orphaned upload |
| `/api/admin/media/upload` | POST | Multipart upload → header probe → `public/images/uploads/…` + `{src,width,height,orientation,suggested_alt}` |
| `/api/admin/videos` | GET/POST | Video library / publish a clip (YouTube oEmbed verified first) |
| `/api/admin/videos/[id]` | PATCH/DELETE | Edit title/outlet/date, feature, publish / withdraw |
| `/api/admin/videos/lookup` | GET | Resolve a pasted link to its YouTube id + live title/outlet for the desk |
| `/api/admin/settings` | GET/PATCH | Editable hero / CTA copy and the stat strip |
| `/api/admin/profile[/id]` | GET/PUT, DELETE | Candidate-file fact rows (upsert by readable id) / delete |
| `/api/admin/socials[/id]` | GET/PUT, DELETE | Social channel rows (upsert per platform) / delete |
| `/api/admin/issues[/id]` | GET/POST, PATCH/DELETE | Full Help Desk queue incl. reporter contacts / status, note, publish, delete |
| `/api/admin/leads` | GET | Volunteers + inquiries inbox |
| `/api/admin/leads/export` | GET | CSV download (`?type=volunteers|inquiries`; volunteers include the consent timestamp) |
| `/api/admin/inquiries/[id]` | PATCH/DELETE | Inquiry triage status / discard |
| `/api/admin/volunteers/[id]` | DELETE | Remove a spam or duplicate volunteer lead |

## Pages

`/` home (hero portrait, animated stats, pillars, gallery carousel with live campaign graphics, Truth Room preview, newsfeed preview, social strip) · `/about` (Candidate File — confirmed rows only — timeline, values, endorsements) · `/impact` (“Before He Sought Office” — ward cards + category-filterable service ledger, every verified entry linked to its press report, and `#sources` — the public reference library of dated press links, filterable by outlet and year, maintained from the CMS Sources tab) · `/help-desk` (Constituent Help Desk: progress dashboard, issue report, open-door booking, ward coverage) · `/blueprint` (four legislative deliverables) · `/truth-room` (searchable fact-check engine + Ask Ola) · `/news` (newsroom fed by the CMS) · `/gallery` (carousel + photo grid + press desk) · `/contact` (HQ, desk lines, ward desk cards, socials) · `/join` (volunteer onboarding, NDPA consent) · `/privacy` (NDPA 2023 policy) · `/admin` (noindex) · custom 404 · robots · sitemap · SVG favicon · OG share image.

## Built for phones, calibrated for reading

- **Mobile-first at 360px.** Verified in a real browser at 360×740: no page-level horizontal overflow on any route, hero copy fits, and every chip row scrolls horizontally instead of wrapping into a wall.
- **44–48px targets throughout** — nav rows, filter chips, form fields (`min-h-[44px]`), carousel arrows, social icons, CMS inputs. Inputs render at 16px on phones so iOS Safari does not zoom on focus.
- **Sticky thumb-reach bar** (`His Record / Join Us / WhatsApp`) with `env(safe-area-inset-bottom)` padding, hidden inside `/admin` and followed by a spacer after the footer so it never covers the footer links.
- **Calm, AA-checked palette.** APC green deepened to `#00794A`, broadcast blue `#00A3E0` → petrol `#17607F`, red `#E30613` → brick `#B72329`, gold `#D4A017` → antiqued `#7E6310`; hero gradient reduced to a low-glare wash. A scripted WCAG pass over every page (gradient/pattern backgrounds excluded) reports **no remaining AA failures** for body text, and `text-gray-400` was retired on light surfaces in favour of `gray-600`.
- Anchor targets get `scroll-margin-top`, so deep links like `/impact#sources` land below the sticky header.

Public pages never show “placeholder”, “[SAMPLE]” or “coming soon” text: unconfirmed socials are hidden, unconfirmed profile facts stay off the site, and a photo frame with nothing bound to it falls back to any published image that fits its ratio before it renders the clean branded panel — except the `exact` frames that name a place or a person, which stay on the branded panel until HQ supplies that photograph (`public/images/README.md` lists all 20 frames, what fills each one today, and the four that are deliberately open).

## Editing content

1. **On the page itself** — ⌘E on any public route and tap the sentence, caption or frame. This is the path for a copy change at 11pm and the only one that shows what the edit does to the layout. ⌘K for a clip, a citation or a jump; the integrity rail for "is this defensible yet".
2. **In the browser** — `/admin`, the nine tabs above. The day-to-day path for bulk work: photography, video, site copy, the record and its press sources, all editable without a deploy or a rebuild.
3. **In `src/lib/content.ts`** — `SITE` (HQ/phone/email), `MEDIA_POSITIONS` (add a frame the site should render), `GALLERY`, `SOCIALS`, `PROFILE_FACTS` and the seed content a fresh store starts from. Use this for anything structural; use the CMS for anything editorial. A new editable field needs one `data-ow` attribute in the page and one entry in `src/lib/liveDesk/contract.ts`.

Three generated brand graphics (`public/images/generated/*.jpg` — mandate card, pillars, slogan) are live gallery content today; real event photography replaces them through the Media tab as it is supplied. **No AI-generated images of the candidate are used anywhere.**

## Deployment

- **Netlify (recommended):** [DEPLOY-netlify.md](DEPLOY-netlify.md) — native Next.js runtime keeps SSR, the CMS and the file store live. Set `ADMIN_PASSWORD`, `ADMIN_SECRET`, `WAR_ROOM_SECRET_KEY` in the site env; use a mounted `DATA_DIR` (or Supabase) so writes survive redeploys.
- **Vercel:** push to GitHub; `.github/workflows/deploy.yml` builds on merge to `main`. Serverless deploys need Supabase credentials (the JSON store needs persistent disk).
- **Qoder Sites pitch preview:** frozen `out/` static bundle (`npm run export:sites`) — demo-mode ribbon, forms disabled by design. Publication is currently blocked vendor-side (`sites_upload_unavailable`); actionId preserved for retry.
- Point `www.olawestern.ng` at the chosen host via Cloudflare DNS; before go-live submit a test volunteer, publish a test release from `/admin`, and confirm rows + WhatsApp + War Room webhook.

## Checklist before go-live (campaign side)

- [ ] Change the three dev secrets in `.env.local` / hosting env (`ola-admin-2026` / `warroom-dev` are dev-only and must not survive into production).
- [ ] Photograph and upload the **four frames that are deliberately empty** from the **Photo Library** tab — `family-portrait` (About), `hq-office` (Contact), `23-road-inspection` and `community-security` (Impact). No press photo on the internet documents those subjects, so they render the branded panel rather than a stand-in; an upload bound to one appears on the site immediately. The other 16 frames are filled from the press harvest.
- [ ] Confirm the campaign's own YouTube handle before it is listed — `socials.youtube` is currently `null`, and the clip shelf is fed by ids verified individually against YouTube, not by a channel we have been given.
- [ ] Have HQ rule on the Channels TV report “Amuwo-Odofin LG Flags Off Construction Of Road 23, Others In FESTAC Town” before the site says anything about 23 Road: the live Help Desk entry reads “23 Road rehabilitation still outstanding”, and the clip (youtube.com/watch?v=pDmaV280GIY) is deliberately not published until the two can be reconciled and dated.
- [ ] Confirm social handles in **Site Copy → Official channels**; a confirmed row becomes a live link immediately.
- [ ] Supply written confirmation for the remaining candidate-file facts (**Site Copy → Candidate file**); a blank value stays off the About page.
- [ ] Name ward desk officers on `/contact` once HQ confirms them.
- [ ] Attach `verification_source_url` documents to record entries and Truth Room rulings via the CMS — four lines are still unsourced (three in the track record, one in the Truth Room) and the integrity rail will not call the site defensible until they carry a link, or HQ takes them down. `node scripts/check-cms-gates.mjs` proves the gate is holding.
- [ ] Decide what the rail's remaining findings are worth before launch: 4 photos below 700px on their long edge, 4 frames still on the branded panel, and the candidate-file rows HQ has not confirmed in writing.
- [ ] Legal review of `/privacy` wording (NDPA 2023).
- [ ] If moving off the file store: Supabase credentials, **both** migrations applied (`0001` then `0002`), `SUPABASE_SERVICE_ROLE_KEY` set so the CMS can write, then a test save from every tab.
- [ ] WhatsApp Cloud API template approval, and `WAR_ROOM_WEBHOOK_URL` pointed at the real War Room.

## Compliance guardrails (baked into the architecture)

- **100% Human-in-the-Loop:** War Room drafts only publish after executive approval through the bearer-secret webhook; the CMS requires an authenticated session; the Live Desk is the same CMS with a different surface — it only moves what a person typed into a route that already checks it, holds no model, and saves nothing until Save is pressed; resident Help Desk reports stay invisible until the desk publishes them. There is no route that publishes on a timer or on an inbound webhook alone.
- **Sourced claims only:** profile facts, the dated service ledger and the press links in `/impact#sources` are transcribed from the campaign dossier; each ledger entry carries the published report that evidences it, and every photo credit names the outlet that took it. Undocumented personal details stay `null` and off the site. No invented rumours, verdicts or statistics — and no AI-generated imagery of the candidate.
- **No dark patterns:** no automated forum/bot posting tooling exists in this codebase, and no astroturfing path is provided.
- **Data minimisation and provable consent:** visitors can only insert leads; reading voter data requires the admin session (or the service role). NDPA disclosure appears on every capture form, the `/join` consent checkbox is required **and its timestamp is stored** (`volunteers.consent_at`, exported in the volunteer CSV) so a withdrawal or erasure request can be answered with the date consent was captured, reporter contacts on Help Desk issues are stripped server-side before any public response, and the leads export is audit-dated.
- **Third-party code stays out until asked:** the YouTube shelf loads nothing from Google until a tap, and press photography is referenced with its credit rather than scraped into an anonymous pile.

## Documented deviations from the original spec

- CSS/`requestAnimationFrame` animations and inline SVGs instead of Framer Motion / lucide-react — fewer dependencies, faster 3G loads.
- Ward “map” is a data-driven card UI; Mapbox GL can be swapped in with one component once a token exists.
- The JSON file store is the zero-config default; Supabase remains the production-grade path with identical interfaces.
