# Product Requirements Document — Campaign Website and Content Platform

**Document:** 01-PRD.md
**Version:** 1.0
**Written:** 3 November 2026
**Owner:** i2sltd.tech (engineering and operations)
**Approver:** campaign headquarters (communications desk) — see §14 open questions
**Subject system:** official campaign website and content platform for a 2027 Lagos State House of Assembly candidacy (Amuwo-Odofin Constituency I)
**Evidence base:** every requirement below is traced to code that exists in `ola-western-web` as built on 3 November 2026 (Next.js 14.2.15 App Router, TypeScript 5.5, Tailwind 3.4; 11,932 lines of TS/TSX in `src/`, 34 API route handlers, 12 page routes, 1,097 lines of content-operations scripts). Nothing in §7 is a future intention presented as a delivered feature.
**Naming:** per `00-DOCUMENT-INDEX.md`, the candidate, the party and the ward team are referred to by role. Code identifiers are left verbatim because they are the artefacts a reviewer inspects.

---

## 1. Problem statement

A candidate for a state legislature in Lagos is not competing for attention against a rival pamphlet. He is competing against a phone that is being handed a rumour, a cropped screenshot, and an audio clip in a WhatsApp group within minutes of it starting. Two things follow, and the whole product is a response to them.

First, the campaign has no authoritative, immediately updatable public record. The material that exists — a dossier of dated service work, press links from Nigerian outlets, broadcast clips, photographs — was being circulated as documents and chat messages. It cannot be cited by a journalist, indexed by a search engine, or corrected by the campaign in one place. When a false claim lands, there is nowhere for the answer to live.

Second, the people who can answer — the candidate and a small communications desk — are not web publishers. They are on foot, in traffic, and on the phone. A CMS that requires a laptop, a form about a website, and a deploy to change a sentence will not be used at 11 p.m., which is exactly when the sentence needs changing.

The conventional answer is a brochure site plus a social-media operation. That fails here on both counts: a brochure site is not defensible (its claims are unaudited and unlinked), and a social operation is not durable (it is deleted by a platform policy change). What is needed is one surface that is simultaneously a public record and an instrument the campaign can operate at speed.

## 2. Product thesis

**Build the campaign's public record as a self-auditing document, and make the record itself the editing surface.**

Two commitments make that concrete, and they are the reason this product is not a template.

**The publish gate.** A claim about a public office, a road, or a person cannot be created on this system without the report or document that evidences it, and the evidence link can be replaced but never emptied. The rule lives server-side (`EVIDENCE_RULE` in `src/lib/cms.ts`), is one sentence everywhere, and is enforced on `POST /api/admin/record` and `POST /api/admin/fact-checks`. This makes "unsourced" a state the software refuses rather than a standard people are reminded of. Its consequence is visible today: four published lines are graded `block` by the site's own audit because no report in the reference library states them, and the site will not describe itself as defensible while they stand. That is the intended behaviour — an honest number of findings beats a clean-looking one.

**The Live Desk.** Any public page, opened while signed in, becomes the CMS. One attribute per editable element (`data-ow="settings.hero_title"`, `media.gfx-mandate.caption`, `slot.hq-office`), one delegated capture-phase listener on `document`, and a registry (`src/lib/liveDesk/contract.ts`, 25 field specifications) that maps a tapped attribute to the route that already validates it. There is no second admin UI to keep in sync, because the sheet POSTs to the same endpoint the tabs do and gets the same 400. A visitor's markup contains none of it: the overlay first probes `GET /api/admin/login`, and a cookie-less probe renders nothing at all — no dock, no listeners, no DOM.

Everything else in this document is in service of those two commitments or of the environment they operate in: a low-data, phone-first electorate, a legal regime that just came into force, and a rival campaign with an incentive to quote the site back at it.

## 3. Objectives and how they would be judged

| # | Objective | Success measure | Measured how | State at v1.0 |
|---|---|---|---|---|
| O1 | Give the campaign one citable public record | Every published service claim and Truth Room ruling carries a report or document link | `/api/admin/health` → `block` findings for unsourced rows | Not met — 4 lines `block`, awaiting HQ evidence or withdrawal |
| O2 | Let the desk publish without an engineer | A copy change, a new photo, or a new clip goes live with no build and no deploy | Live Desk edit → `revalidatePath` → page shows new value (browser-verified 3 Nov 2026) | Met |
| O3 | Be usable on the phones the constituency actually has | No horizontal overflow at 360 px; tap targets ≥ 44 px; no third-party payload before a tap | scripted 360×740 browser pass; click-to-play video facade | Met |
| O4 | Survive being attacked as a document | Nothing on the site that the campaign cannot source; no AI imagery of the candidate; no automated posting path | code review + `scripts/check-cms-gates.mjs` | Met architecturally; the 4 `block` lines are the residual exposure |
| O5 | Answer a rumour faster than it circulates | A new ruling drafted, approved, and live in minutes, from a phone | `/truth-room` CRUD through Live Desk; `POST /api/truth-room/sync` from the War Room with human approval | Met mechanically; no editorial SLA is yet committed by HQ |
| O6 | Be lawful on personal data | NDPA-shaped consent capture, data minimisation, PII stripped server-side before any public response | `toPublic()` on `/api/issues`, `volunteers.consent_at`, CSV export carries the timestamp | Met in code; `/privacy` wording still needs a lawyer **[gap]** |
| O7 | Read as calm and official, not as a poster | Palette passes a contrast audit; no placeholder text on any public route | scripted WCAG contrast pass (gradient/pattern backgrounds excluded); string sweep for "placeholder"/"coming soon" | Met, with the exclusion disclosed |

Objectives O1 and O7's exclusions are the two places where the honest answer is "partly". They are stated that way deliberately: a PRD that reports all-green on a system whose own audit reports 40/100 is a PRD that has stopped being read.

## 4. Hard constraints imposed by the campaign

These are not requirements the engineering team proposed. They were given, they bound every design decision, and several cost measurable scope.

1. **No AI-generated imagery of the candidate.** Anywhere, in any form, including "restored" or "enhanced" versions. Consequence: four frames that name a place, a person, or an event stay on a branded placeholder panel until HQ supplies a real photograph, because no harvested press photo documents those subjects. The `exact` flag on a slot (`pick(slot, { exact: true })`) exists solely to enforce this.
2. **No invented rumours, verdicts, or statistics.** The Truth Room describes claims the campaign has actually encountered and can cite; the ledger states only what a dated report states. Consequence: the reference library's 21 links gate the content, and the harvesters refuse to caption a photo as showing the candidate unless the article puts him in it.
3. **Human-in-the-loop for every publication.** No route publishes on a timer, on an inbound webhook alone, or on a model's judgement. Consequence: the War Room sync endpoint requires an executive-approved draft plus a bearer secret, and the Live Desk holds no model at all — ⌘K parses a pasted link into an intent, it does not generate one.
4. **No astroturfing.** No bot posting, no fake engagement, no forum-penetration tooling. Consequence: an entire category of "campaign tech" feature is absent from this product by decision, and is listed in §12 as a non-goal rather than a backlog item.
5. **Rotating secrets before any public deployment.** `ola-admin-2026`, `warroom-dev`, and the fallback `ADMIN_SECRET` are development-only. They are still the values in the local `.env.local`, so this constraint is currently *unmet* and gates release (§11).
6. **Never commit `.env` secrets; never delete user data wholesale.** `.env.local` is gitignored; cleanup scripts may only remove records they created themselves.
7. **Attribution.** The footer carries "developed by @i2sltd.tech" linking to `https://linktr.ee/i2sltd.tech`.

## 5. Users and roles

| Role | Who | What they must be able to do | Where |
|---|---|---|---|
| Voter | Resident of the constituency, mostly on a post-paid phone on a mobile network | Read the record, search the Truth Room, report an issue, book the open door, volunteer, share a page into a WhatsApp group | All 11 public routes |
| Journalist / opponent / fact-checker | Someone hostile or indifferent | Find a dated source for any claim, see the credit and outlet behind any photo, find the correction policy | `/impact#sources`, `/news`, `/truth-room`, `/privacy` |
| Communications desk (2–5 people) | Non-engineers who write the sentences and choose the photographs | Change any copy, caption, verdict, photo binding or clip without a deploy, from a phone, and see the site's own report of what is not yet defensible | Live Desk on public pages; `/admin` (9 tabs) for bulk work |
| Candidate | The principal | Dictate a sentence to a desk member and have it on the site; see his own record as the public sees it | Live Desk, on a phone |
| Ward agent | Local organiser | File a resident issue and see its published status | `/help-desk` |
| Operations / on-call | Whoever keeps it up during the campaign | Log in, see the store state, run the gate check, restore a backup, take a page down | `/api/admin/health`, `scripts/`, `data/db.json` |
| AI Campaign War Room | Separate system that drafts and monitors | Push an approved ruling into the ledger; query the ledger over HTTP | `POST /api/truth-room/sync`, `GET /api/fact-check` |

The design tension worth naming: the desk and the candidate are the same audience as the voter, on the same URL, on the same device. Most CMSs solve this with two apps. This solves it with one attribute, a session probe, and zero DOM for the unauthenticated.

## 6. Product surface

**Public pages (11):** `/` (hero, animated stat strip, pillars, gallery carousel, Truth Room preview, newsroom preview, social strip) · `/about` (candidate file — confirmed rows only — timeline, values, endorsements) · `/impact` (service record, ward cards, category filter, `#sources` reference library) · `/help-desk` (progress dashboard, issue report, open-door booking, ward coverage) · `/blueprint` (four legislative deliverables) · `/truth-room` (searchable ledger + Ask Ola) · `/news` · `/gallery` · `/contact` · `/join` · `/privacy`. Plus a custom 404, `robots.ts`, `sitemap.ts`, an SVG favicon, and an OG share image.

**Admin (1):** `/admin` — nine tabs (Truth Room, Newsroom, Track Record, Sources, Photo Library, Video, Site Copy, Help Desk, Leads Inbox). `noindex`, excluded from the sitemap.

**API (34 handlers):** 7 public read/write endpoints (volunteer, inquiry, issues, fact-check, media, videos, truth-room sync) and 27 `/api/admin/**` endpoints. Every handler is `force-dynamic`; every `/api/admin/**` handler returns 401 without a valid session cookie. The full table is in `README.md` and Appendix A of `DEPLOYMENT-GUIDE.md`; it is not duplicated here.

**Editing surfaces (2):** the tabbed dashboard, and the Live Desk overlay on the public pages. Both drive the same routes.

**Content-operations scripts (7):** press-photo harvesters (two passes, plus `--offline` manifest repair), the photo publisher with its crop-fit gate, the broadcast-clip registrar, the CMS gate checker, the static-export bundle for a pitch preview, and the press-graphic generator.

## 7. Functional requirements

Format: **FR-n** — requirement · enforcement · code · status. "Delivered" means it is in the build and was exercised; "partial" states what is missing.

### 7.1 Public record and truthfulness

**FR-1 — A service claim cannot exist without its evidence.** `POST /api/admin/record` and `POST /api/admin/fact-checks` refuse a row whose `verification_source_url` (or official-document link) is absent or invalid; `PATCH` may replace the link but never blank it; removal is `DELETE`. A row published before the gate existed stays editable — refusing a typo fix would keep a wrong sentence live — but is graded `block` until it carries a report. · `src/lib/cms.ts`, the record and fact-check routes. · **Delivered**, and the gate is the reason 3 of 12 track-record lines and 1 Truth Room ruling remain visibly flagged.

**FR-2 — The site grades its own defensibility.** `GET /api/admin/health` recomputes the live store into a 0–100 score, a `ready` boolean, and findings weighted `block 18 / warn 7 / info 2`, with the offending sentence's page and `data-ow` key attached. Score = `100 − Σ min(WEIGHT[sev] × ceil(count/3), WEIGHT[sev] × 3)`, so a hundred unsourced claims cost the same 54 points as three — the metric is designed to be hard to satisfy and impossible to grind to 100 by deleting the worst offender. · `src/lib/liveDesk/integrity.ts`. · **Delivered.** Currently **40 / not ready**.

**FR-3 — A finding is actionable, not merely described.** Each finding expands to its individual lines, and "Show me on the page" navigates and outlines the exact sentence. Findings with no public sentence (a Help Desk queue, an unconfirmed handle) deep-link to `?tab=`. · `IntegrityPanel.tsx`, `chrome.tsx`. · **Delivered.**

**FR-4 — Every photograph names the outlet that took it.** Harvested press images keep `credit` and `source_url`; the credit renders as a verifiable link, not a caption. · `PhotoSlot.tsx`. · **Delivered** for the 27 published photographs.

**FR-5 — No AI-generated imagery of the candidate anywhere.** `exact` frames refuse the orientation fallback and refuse a library browse; they take an upload or keep the branded panel. Generated brand graphics in the gallery are explicitly non-portrait (mandate card, pillars, slogan) and are labelled. · `src/lib/slots.ts`, `content.ts`. · **Delivered** as an architectural property, not a policy note.

**FR-6 — Corrections do not silently rewrite history.** Withdrawal is an explicit act (`DELETE`, or unpublish), tombstoned in `db.removed` so a seed re-sync cannot resurrect a withdrawn photo, retracted citation, or unpublished clip. · `src/lib/store.ts`. · **Delivered.**

### 7.2 Editing at the speed of a campaign

**FR-7 — Any rendered value can be edited where it is rendered.** A field becomes editable the moment its element carries `data-ow`; the registry supplies label, input kind, length ceiling, and the exact route and body. 38 annotated sites across the pages, 25 field specs, 5 input kinds (`text`, `area`, `url`, `choice`, `boolean`), plus array members (the stat strip) editable without inventing a per-item route. · `contract.ts`, `chrome.tsx`, `EditorSheet.tsx`. · **Delivered.**

**FR-8 — The edit is the same request the tab would make.** Prefilled from the value already on the page (or `data-ow-value` where the visible text is an animation or a badge), the counter is the route's real maximum, and saving calls the same admin route. The same validation, the same `revalidatePath`, the same refusal wording. · `EditorSheet.tsx`. · **Delivered.**

**FR-9 — Saving re-renders in place.** `router.refresh()` redraws the page the desk is standing on from the server: no reload, no lost scroll position, no "open the site in another tab to check". · `LiveDesk.tsx`. · **Delivered**, browser-verified 3 Nov 2026.

**FR-10 — One tap reverses a mistake.** An in-memory undo stack replays the same route with the previous value. · `CommandDeck.tsx`, `LiveDesk.tsx`. · **Delivered.** (Scope limit, stated plainly: the stack is per-session and in-memory, so it does not survive a reload — `data/db.json` is the durable history, and §12 records the deliberate choice not to build a version database in v1.)

**FR-11 — A frame is not a field.** Tapping a photo frame opens the library filtered to that frame, each candidate drawn inside a live crop of itself with the percentage the frame throws away, plus a soft-at-this-size warning. Placing a photo demotes whatever held the frame first. · `SlotPicker.tsx`, `fitFor`. · **Delivered.**

**FR-12 — Pasted links become intents, without generating content.** ⌘K resolves a YouTube/watch/youtu.be/shorts URL to "publish this clip", runs the server's oEmbed lookup to prefill title and outlet, and lets a human edit before saving; an article URL becomes "cite this article as a source"; anything else is a jump. No model in this layer. · `CommandDeck.tsx`, `/api/admin/videos/lookup`. · **Delivered.**

**FR-13 — The editing surface is invisible to the public.** The overlay probes the session before rendering anything; worklist hints are `display:none` until armed, so an unfinished sentence is never advertised to the other side. · `LiveDesk.tsx`, `data-ow-missing`. · **Delivered.**

**FR-14 — Bulk work keeps a proper dashboard.** Nine tabs, every write revalidating the public page it feeds; CSV export of leads with the consent timestamp; spam/duplicate deletion on both lists. · `components/admin/*`. · **Delivered.**

### 7.3 Media

**FR-15 — Every declared frame is filled by a bound photo, a fitting fallback, or an honest panel.** `MEDIA_POSITIONS` declares 20 named frames with their aspect ratios; `SlotMap.pick(slot)` takes the bound photo, else any published photo whose orientation fits, else the branded panel. · `src/lib/slots.ts`. · **Delivered** — 16 of 20 frames filled; the 4 remaining are `exact` frames that `exactly` refuse a stand-in.

**FR-16 — An image's real dimensions are measured, never guessed.** A dependency-free header probe (`src/lib/imageMeta.ts`) reads JPEG/PNG/WebP/GIF/AVIF and refuses HEIC; `orientation` is derived from stored width × height. WEBP is walked as a RIFF list of chunks — including into `ANMF` for animated files — because Nigerian press sites on WordPress/Jetpack serve WEBP bytes under `.jpeg` names and a fixed-offset read returns nonsense like 682×11582. · `scripts/lib/press-media.mjs` shares the same probe. · **Delivered.**

**FR-17 — A photograph is not bound to a frame that destroys it.** Crop loss is computed (`cropLoss = r > 1 ? 1 − 1/r : 1 − r`) and anything above 34% is refused; panoramic strips (long side > 6× short) are dropped as banners. The carousel applies the same principle at render time: the frame stays landscape and the *fit* follows the photograph, so a 4:5 portrait is contained over a blurred copy of itself instead of `object-cover`ed through the candidate's head. · publisher scripts, `GalleryCarousel.tsx`. · **Delivered.** (The render-side rule was a defect found and fixed on 3 Nov 2026; see `09-QA-AND-TEST-EVIDENCE.md`.)

**FR-18 — Uploads cannot wedge the site or escape their directory.** Multipart, ≤10 MB, ≥40 px per side, extension-sniffed from bytes rather than the filename; replaced or deleted files are purged from disk behind a `path.resolve` + prefix check; a file still referenced by another row is kept. · `/api/admin/media/upload`, `uploads.ts`, `purgeUpload`. · **Delivered.**

**FR-19 — Video loads nothing until asked.** A click-to-play facade shows `hqdefault`, and the `youtube-nocookie` iframe is injected only after a tap. Every id is confirmed embeddable against YouTube's oEmbed before it can be saved (401/403 → embedding is off; 404/400/410 → wrong link); a YouTube outage does not block the desk. · `VideoEmbed.tsx`, `VideoShelf.tsx`, `youtube.ts`. · **Delivered** for 7 clips.

**FR-20 — An unknown image position is refused.** `slot` must name a frame the site actually renders; an unknown slot is a 400, not an orphan row. · `cms.ts` validation. · **Delivered.**

### 7.4 Constituent Help Desk

**FR-21 — A resident report is not a publication.** `/api/issues` POST stores the row unpublished; nothing reaches the public dashboard until the desk publishes it from `/admin`. · `issues` route. · **Delivered.**

**FR-22 — Reporter contact details never leave the server.** `toPublic()` strips `reporter_name`, `reporter_phone` and `consent` from every public response, and the Supabase RLS policy mirrors the same rule so the guarantee does not depend on the handler. · `src/lib/store.ts`, `supabase/migrations/0001_init.sql`. · **Delivered.**

**FR-23 — Progress is visible.** Live counters (received / under review / action scheduled / resolved) plus status and ward filters, seeded with six dated desk entries so the page is never empty on first load. · `IssueBoard.tsx`. · **Delivered.**

**FR-24 — The open door books a human, not a bot.** In-person or WhatsApp call, with a date and window preference, filed as an `Office Hours Booking` inquiry. It deliberately shows no confirmation number, because a confirmation number would imply a system that does not exist; the ward team calls back. · `MeetingRequestForm.tsx`. · **Delivered.**

**FR-25 — Capture forms state the law they operate under.** NDPA disclosure on every form; the `/join` consent checkbox is required and its timestamp is stored in `volunteers.consent_at` and exported in the CSV, so an erasure or withdrawal request can be answered with the date consent was captured. · `VolunteerForm.tsx`, migrations `0002`. · **Delivered** in code.

### 7.5 Data, serving and integration

**FR-26 — The platform works with zero external services.** `src/lib/store.ts` is one interface over two interchangeable backends: a file store (`data/db.json`, atomic tmp+rename writes with EPERM/EBUSY/EACCES retries and an in-process read cache) or Supabase Postgres. Same behaviour, same APIs, `DATA_DIR` for a mounted volume. · **Delivered**; the file store is the live backend and `/admin` prints which store it is saving to.

**FR-27 — Reads and writes use different keys, deliberately.** Pages read with the anon key so RLS keeps unpublished rows out of public HTML; every mutation goes through `getWriteClient()`, preferring `SUPABASE_SERVICE_ROLE_KEY`, so a CMS save without it fails instead of half-writing. · **Delivered.**

**FR-28 — Seed content upgrades a stored database without destroying collected data.** `SEED_VERSION` triggers `resyncSeeds()`, which refreshes bundle-owned rows and never touches volunteers, inquiries, or desk-created rows. · **Delivered.**

**FR-29 — Every public page reflects a CMS write without a rebuild.** Each mutation route calls the matching `revalidatePath`; ISR windows on the content pages are 300–3600 s. · `src/lib/revalidate.ts`. · **Delivered.**

**FR-30 — The War Room can publish into the record, only through a human.** `POST /api/truth-room/sync` requires the `WAR_ROOM_SECRET_KEY` bearer and writes executive-approved drafts; there is no autonomous publishing path. · **Delivered**, against a demo War Room; the production webhook URL is not yet pointed at the real system **[open]**.

**FR-31 — The Truth Engine is queryable by other systems, not just rendered.** `GET /api/fact-check?q=&verdict=` does tokenised full-text search across claims and evidence with a verdict filter. · **Delivered.**

### 7.6 Findability and shareability

**FR-32 — A shared page looks like a page.** Per-route metadata and an OG share image, because in this electorate the page's first audience is a WhatsApp preview card. · `layout.tsx`, per-page metadata. · **Delivered.**

**FR-33 — The admin area cannot be found by searching.** `/admin` metadata is `noindex` and it is excluded from `sitemap.xml` and `robots.ts`. · **Delivered.**

**FR-34 — A deep link lands where it says.** Anchor targets carry `scroll-margin-top`, so `/impact#sources` arrives below the sticky header rather than under it. · **Delivered.**

## 8. Non-functional requirements

| # | Requirement | Standard this project holds itself to | State |
|---|---|---|---|
| NFR-1 | Mobile-first | Layout verified at 360×740 with no page-level horizontal overflow on any route; chip rows scroll instead of wrapping into a wall | Met |
| NFR-2 | Touch targets | 44–48 px on nav, chips, fields (`min-h-[44px]`), carousel arrows, social icons. WCAG 2.2 SC 2.5.8 (AA) asks for 24×24 CSS px as a floor (W3C, https://www.w3.org/TR/WCAG22/); this product treats 44 px as the working minimum because the floor is not the point on a phone in sunlight | Met |
| NFR-3 | Input zoom | Form inputs render at 16 px on phones so iOS Safari does not zoom on focus | Met |
| NFR-4 | Thumb reach | Sticky action bar (record / join / WhatsApp) with `env(safe-area-inset-bottom)` padding, suppressed inside `/admin`, followed by a spacer so it never covers footer links | Met |
| NFR-5 | Contrast | Calmed palette (`#00794A`, petrol `#17607F`, brick `#B72329`, antiqued gold `#7E6310`); a scripted contrast pass over every page reports no remaining AA failures for body text, with gradient/pattern backgrounds explicitly excluded from that claim | Met, with the exclusion disclosed |
| NFR-6 | Motion | `prefers-reduced-motion` honoured in the carousel and stat animation | Met in code |
| NFR-7 | Full accessibility audit | A complete WCAG 2.2 pass — keyboard-only traversal of the Live Desk, screen-reader labelling of the overlay, focus order — has **not** been performed | **[gap]**, tracked in `10-SECURITY-AND-COMPLIANCE.md` and `12-…CHECKLISTS.md` |
| NFR-8 | Performance on a Nigerian mobile connection | Targets: TTFB p75 < 600 ms cached / < 1.2 s uncached, LCP < 2.5 s, INP < 200 ms, < 500 kB to first useful interaction (thresholds follow Google's published Core Web Vitals definitions, https://web.dev/articles/vitals). Measured budget so far: shared first-load JS 87.2 kB, per-page 87–102 kB; no third-party payload before a tap | Budget met on the local build; **no field measurement over a real mobile network has been taken** |
| NFR-9 | Dependency discipline | Four runtime dependencies (`next`, `react`, `react-dom`, `@supabase/supabase-js`); animations and icons are CSS and inline SVG rather than Framer Motion / lucide-react | Met |
| NFR-10 | Server control | 34 handlers, all `force-dynamic`, one Node-only (`media/upload`); six hard security headers on every path via `next.config.mjs`; `poweredByHeader: false` | Met |
| NFR-11 | Availability during the campaign window | No formal SLA yet. The operating assumption in `DEPLOYMENT-GUIDE.md` §16 is that the site is more likely to be attacked in the 72 hours before a poll than during the build | **[gap]** — needs an HQ-agreed target |
| NFR-12 | Recoverability | The whole state is one JSON file plus an image folder; a backup is a file copy. Restore time is therefore minutes, and the runbook states the cadence | Met on the file store; needs a scheduled cron in production |
| NFR-13 | Lawfulness | NDPA 2023 shape (data minimisation, stored consent, PII stripping, audit-dated export); `/privacy` drafted | Code met; **legal review of the wording outstanding** |
| NFR-14 | Verifiability of claims | Reference library of 21 dated press links, filterable by outlet and year, maintained from the CMS | Met |
| NFR-15 | Static-export parity | `NEXT_OUTPUT=export` produces a frozen pitch-preview bundle with forms disabled and a demo ribbon; SSR features are knowingly absent from it | Delivered; publication of that bundle is blocked vendor-side |

## 9. Priority

Nothing here was sequenced by taste; this is the order the constraints forced.

**P0 — refusal, not polish.** FR-1, FR-5, FR-13, FR-18, FR-21, FR-22, FR-26, NFR-1. These are the requirements whose failure mode is political or legal rather than cosmetic: an unsourced claim published, a fake portrait shipped, the editor visible to voters, a resident's phone number in public HTML, the site down on polling day because it could not write to disk.

**P1 — the speed that justifies the product.** FR-7 through FR-12, FR-29, FR-2. Without these the system is a brochure with a login, and the desk goes back to WhatsApp.

**P2 — the quality of the record.** FR-15 through FR-19, FR-14, FR-3, FR-32. These decide whether the site reads as an institution or as a template.

**P3 — reach and integration.** FR-30, FR-31, FR-23, FR-24, FR-25. Real features, but they gain value only once the campaign is running the record well.

## 10. Acceptance criteria

A release candidate is accepted when every item below is demonstrable, not asserted.

1. `npx tsc --noEmit` and `npm run build` both succeed clean, and `npm start` serves the built app.
2. `node scripts/check-cms-gates.mjs` reports 12/12: an anonymous caller cannot read the audit or write; a sourceless row is refused; a `javascript:` URL is refused; a sourced row is accepted; the throwaway entry is deleted afterwards and nothing is left behind.
3. An anonymous browser session loads `/` with zero Live Desk DOM — no dock, no overlay, no listener markup, nothing in the server HTML.
4. A signed-in session on `/`: ⌘E reveals rings; tapping a headline opens a sheet prefilled with the rendered text; saving re-renders that page in place with the new value and no reload; ⌘Z restores the old value; Esc leaves the field.
5. Tapping a photo frame opens a picker whose candidates are cropped previews of themselves with the crop percentage shown; placing one demotes the previous occupant of that frame.
6. ⌘K on a fresh YouTube link offers the clip intent, and the title/outlet come from the server lookup, not from the desk's typing.
7. `GET /api/admin/health` returns a score, `ready`, and findings whose page/`data-ow` targets actually navigate and outline.
8. `/api/issues` GET returns no `reporter_name`, `reporter_phone`, or consent fields, and a freshly POSTed issue is absent until published.
9. A 4:5 portrait in the home carousel is fully visible — head and feet — and clears the caption band; a landscape photo in the same frame still covers edge to edge.
10. At 360×740 no route scrolls horizontally; every interactive element is ≥44 px; iOS zoom does not trigger on field focus.
11. `/impact#sources` lands below the header; `/news` shows a release created minutes earlier; `/admin` is absent from `sitemap.xml`.
12. Deleting an uploaded photo removes its file; keeping a second reference to the same file keeps the file.

## 11. Release criteria (go / no-go)

These gate a public deployment. They are deliberately outside §10: an accepted build is not yet a shippable one.

**Blocking.**
- Rotate all three dev secrets in the hosting environment; `ola-admin-2026` and `warroom-dev` must not exist in any production process.
- Resolve the four `block` findings: HQ supplies a report or document for each, or withdraws the line. The rail will not report `ready` while they stand, and launching a site that reports itself as not ready is a gift to the opponent who finds `/api/admin/health`'s existence, even though the endpoint is gated.
- Persistent write path on the chosen host: either a mounted `DATA_DIR` volume that survives redeploys, or Supabase with both migrations applied and `SUPABASE_SERVICE_ROLE_KEY` set.
- A lawyer has read `/privacy` for NDPA 2023 wording.
- A field performance measurement over a real Nigerian mobile connection on the production host, against the NFR-8 targets.
- A written incident owner and a backup/restore drill executed once, in production, and timed.

**Required before the first broadcast mention of the URL.**
- The four `exact` frames carry real campaign photography or the pages are reviewed with their panels intact and HQ has signed off on that appearance.
- The campaign's own YouTube handle is confirmed before it is listed; `socials.youtube` is currently `null` and the clip shelf is fed by individually verified ids.
- HQ rules on the contradiction between the live Help Desk entry ("road rehabilitation still outstanding") and the broadcast report of the same work having been flagged off. The clip is deliberately unpublished until the two are reconciled and dated.
- Ward desk officers named on `/contact` once confirmed.
- One end-to-end rehearsal: submit a test volunteer, publish a test release from `/admin`, confirm the row, the WhatsApp welcome, and the War Room webhook.

**Deferred by agreement, not forgotten.**
- Full WCAG 2.2 audit (keyboard + assistive tech) — scheduled for the week after launch unless HQ moves it up.
- Media storage off the app disk (Supabase Storage or Cloudinary) — required at the point the desk starts uploading daily.

## 12. Non-goals

Explicit exclusions. Each is a decision, and each will be re-asked by someone who knows the category.

**No donations or payment processing.** Not a scope oversight: online political contributions of this kind are legally constrained in Nigeria, and a payment page invites a reputational failure the site cannot recover from in one election cycle. If HQ later clears it with counsel, it is a new product with its own PRD.

**No voter-roll import or voter files.** No registration data, no name-matching, no psychographic scoring. The site accepts data a person volunteers about themselves and nothing more.

**No automated posting, no bot or bulk-account tooling, no engagement farming.** The absence is architectural (no such route exists) as well as policy, which is what makes it a promise rather than a posture.

**No AI-generated imagery of a real person.** Includes "upscales", "restorations", and background faces.

**No autonomous or scheduled publishing.** Nothing in this system goes live on a timer or on an inbound webhook alone. A War Room draft needs a person to press the button.

**No model in the editing layer.** ⌘K parses; it does not draft. A generated sentence about a real candidate is the liability this site exists to avoid.

**No multi-tenant agency platform.** This is one campaign's site with a store designed to be portable to the next one, which is not the same thing as a SaaS product, and it is not being sold as one.

**No native app, no SMS blast system, no WhatsApp broadcast list.** Reach today is a URL shared in groups that already exist; the sticky bar opens WhatsApp with a prefilled message, which is a click the supporter chooses to make, not a message the campaign sends unasked.

**No version database / editorial history UI in v1.** Undo is session-scoped; durable recovery is the backup. A revision table is the first thing to add if the desk grows past five people.

## 13. Risks

| Risk | Why it is credible here | Mitigation in the product | Residual |
|---|---|---|---|
| A published claim turns out to be unsupportable | Four lines are already `block`-flagged by the site's own audit | Publish gate refuses new ones; `DELETE` is an immediate takedown; tombstones stop resurrection | Medium — the existing four depend on HQ |
| The site is quoted out of context | A rival's fastest weapon is your own sentence | `exact` frames refuse stand-ins; every claim links to its report; the credit is a link to the outlet | Low |
| The desk does not use it | Every prior campaign CMS died of a form about a website | Live Desk removes the form; the tabbed CMS stays for bulk | Medium — unproven under real campaign load |
| Secrets leak into a deployed dev default | The fallbacks are real strings in the repo's env handling | Fail-closed when `ADMIN_PASSWORD` is unset in production; release criterion blocks the deploy | Medium until rotation happens |
| Upload fills the disk or a redeploy wipes `data/db.json` | The file store is the live backend and PaaS filesystems are ephemeral | 10 MB cap; `DATA_DIR`; `DEPLOYMENT-GUIDE.md` §6 makes persistence a porting prerequisite | Low once a host is chosen |
| Third-party content disappears (press article, clip) | Harvested rows point at outlet URLs | Credits are links, not copies; a YouTube outage cannot block the desk | Low |
| A platform outage takes the video shelf | One provider for all broadcast clips | Click-to-play facade keeps the page alive without the iframe; text record is independent | Low |
| Legal exposure on captured data | NDPA obligations on consent, minimisation, erasure | Stored consent timestamp, PII stripped server-side, mirrored in RLS, audit-dated export | Medium pending legal review |
| Traffic spike on a scandal day | A campaign site is bursty in exactly the worst way | ISR windows 300–3600 s; CDN strategy in `DEPLOYMENT-GUIDE.md`; 87–102 kB first loads | Medium — untested under load |
| Vendor concentration on one engineer | i2sltd.tech is the bus factor of 1 | This document set, the ADR log, the runbook, and the gate script are the mitigation | High — acknowledged |

## 14. Open questions for campaign headquarters

Blocking answers for the next release gate; the rest for planning.

1. Who signs off a Truth Room ruling, in one name and one phone number?
2. What is the committed response window when a claim about the candidate goes wide — 2 hours, 12 hours, next morning? O5 is mechanically capable; HQ must set the SLA.
3. Which of the four `block` lines does HQ evidence, and which does it withdraw?
4. Does HQ reconcile the outstanding-work Help Desk entry against the broadcast report of completed work, and by when?
5. Is there a real campaign YouTube channel, and who controls its handle?
6. Who owns `/privacy` wording review, and is outside counsel budgeted?
7. Is a production hosting budget approved, and at which tier in `DEPLOYMENT-GUIDE.md` §17?
8. Are donations genuinely off the table, or deferred pending counsel?
9. Which three people get CMS credentials at launch, and who revokes them when they leave?
10. Is the WhatsApp Cloud API template approved, and is the War Room webhook URL real yet?

## 15. Traceability: what the dossier asked for, what shipped

| Source instruction | Delivered against it | Evidence |
|---|---|---|
| "Embedded YouTube player to play videos from the channel" | `VideoShelf` on `/`, `/gallery`, `/news`; click-to-play, `youtube-nocookie`; per-id oEmbed verification | FR-19; 7 clips live |
| "Get images from the internet and populate everywhere there is a blank placeholder; image dimensions must meet/match space" | Two-pass press harvesters, measured dimensions, 34% crop-fit gate, 20 declared frames, slot fallback, Live Desk frame picker | FR-15–FR-17, FR-11; 16 of 20 frames, 27 photos |
| "For the CMS everything should be functional logic end to end" | 27 admin handlers, all writes revalidating, `check-cms-gates.mjs` 12/12 | FR-7–FR-14, §10.2 |
| "Nigerians are mostly on their phones — mobile responsive, mobile first" | 360×740 verified, 44 px targets, safe-area thumb bar, no third-party payload before tap | NFR-1–4 |
| "Make website colors not too bright; ease of reading; this website is for public relations and reputation management" | Calmed palette, scripted contrast pass, calm hero wash | NFR-5 |
| "Greatest ever in its class for functionalities — fully functional, no stub login, demo, placeholder" | Real HMAC session auth, fail-closed production, no `[SAMPLE]` strings on public routes, honest branded panels instead of fake photos | FR-13, §7, `README.md` sweep note |
| "For the truth engine make it working fully — showcase the good he had done even before coming to office" | `/api/fact-check` search + verdict filter, `/truth-room` ledger, `/impact` "Before He Sought Office" ledger with per-entry press link | FR-1, FR-31; 21 references |
| "Footer should read developed by @i2sltd.tech and load our link" | `Footer.tsx` → `https://linktr.ee/i2sltd.tech` | §4.7 |
| "SOTA, novel, never-conceived CMS method that works with what we built" | Live Desk: the rendered page as the editing surface, one attribute, one registry, zero extra UI; plus the site self-grading its defensibility and outlining its own weak sentences | FR-2, FR-7–FR-13 |
| "Deployment roadmap / hosting architecture / can PaaS and serverless work" | `DEPLOYMENT-GUIDE.md`: verified inventory, five host-deciding constraints, four paths + decision matrix, serverless payload limits, porting work order | Not a code requirement; a delivery one |

## 16. Glossary for non-engineers

**ISR** — Incremental Static Regeneration: a page is pre-rendered once and reused for a set window, then rebuilt. Here the windows are 300–3600 s, which means "how stale may a Truth Room page get" is a policy number, not an accident.
**Live Desk** — the overlay that makes any public page editable while signed in.
**Publish gate** — the server-side refusal to store a claim without its evidence.
**Frame / slot** — a named image position on the site (`hq-office`, `candidate-portrait`) declared in code, which is what lets the CMS bind a photo to a place rather than to a URL someone remembers.
**`exact` frame** — a frame that names a real place, person, or event, and therefore refuses a stand-in photograph.
**Integrity score / rail** — the site's own 0–100 report of how defensible its published content currently is.
**Tombstone** — a record that something was deliberately deleted, so a content update cannot resurrect it.
**oEmbed** — the small API call that confirms a YouTube id is real and embeddable before the desk can save it.

---

### External references used in this document

Normative thresholds are named above; their full verification (date checked, exact wording, and scholarly or regulatory context) is recorded in `02-RESEARCH-AND-DISCOVERY.md`, which is the citation-bearing document in this set.

- W3C, *Web Content Accessibility Guidelines 2.2*, SC 2.5.8 Target Size (Minimum), Level AA — https://www.w3.org/TR/WCAG22/
- Google, *Core Web Vitals* and *Web Vitals* field thresholds (LCP, INP, CLS definitions) — https://web.dev/articles/vitals
- Nigeria Data Protection Act 2023 (consent, minimisation, data-subject rights) — cited in full with its commencement details in `02` and mapped requirement-by-requirement in `10-SECURITY-AND-COMPLIANCE.md`
- Next.js 14 App Router cache segments and `revalidatePath` semantics; Netlify Next.js Runtime; Vercel and Netlify serverless function payload ceilings — analysed in `DEPLOYMENT-GUIDE.md` §3–§8 with source links

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | PRD v1.0 written against the 3 Nov production build: 34 handlers, 12 routes, 16 of 20 frames filled, integrity score 40 with 4 `block` lines, publish gate 12/12 | i2sltd.tech |
