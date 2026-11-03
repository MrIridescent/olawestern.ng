# Architecture Decision Record — Campaign Website and Content Platform

**Document:** 03-ARCHITECTURE-DECISIONS.md
**Version:** 1.0
**Recorded:** 3 November 2026
**Owner:** i2sltd.tech
**Scope:** the decisions that shaped `ola-western-web`, in the order they were forced. Each entry records what was believed at the time, what was chosen, what was rejected and why, and what it cost.

> **A note on dates.** The build was not run as a formal ADR process, so this log does not invent per-decision calendar dates. It records the *sequence and era* of each decision — a real ordering that is recoverable from the build history — with all entries recorded on 3 November 2026. From the next change onward, a new ADR is written at the moment of decision and dated at the top, per rule 2 of `00-DOCUMENT-INDEX.md`.
>
> **Eras:** **P1** scaffold · **P2** functional completion (no stubs) · **P3** mobile and readability pass · **P4** press-media and CMS era · **P5** Live Desk era · **P6** deployment and documentation era.

---

## ADR-001 — Server-rendered Next.js App Router, not a static site generator

**Era P1 · Status: accepted**

**Context.** The site must change content without a rebuild, be crawlable and shareable into WhatsApp preview cards, and hold data a resident submits. A generated static site cannot do the first or the last without a separate backend, and that split is exactly how campaign sites end up with content nobody can update.

**Decision.** Next.js 14 App Router with server components rendering public pages from the store on every request window, and route handlers for every mutation.

**Alternatives rejected.** *Static export plus a headless CMS* — two systems, two failure modes, and a publishing path the desk would not use. *Client-side React (SPA)* — poor first paint on a mid-range Android over 3G, and fragile metadata for share cards. *WordPress* — the campaign inherits an attack surface and a plugin economy it cannot audit.

**Consequences.** A Node runtime must run in production (this single fact drives the whole of `DEPLOYMENT-GUIDE.md`). The team takes on ISR windows as an editorial policy question rather than an implementation detail. Static export remains possible as a *preview artefact*, not the product (ADR-030).

**Evidence.** `src/app/**` (12 page routes), `next.config.mjs`, 34 handlers in `src/app/api/**`.

---

## ADR-002 — One store interface over two interchangeable backends

**Era P2 · Status: accepted**

**Context.** The requirement was "fully functional, no stub, no demo, no placeholder", and the same build had to run on a pitch laptop with no cloud account and on a host with a real database. Making the database a precondition would have made the product undemonstrable; making it optional would have made the demo a lie.

**Decision.** `src/lib/store.ts` is a single interface with two implementations selected at runtime by the presence of Supabase credentials: a file store persisting `data/db.json` (atomic tmp+rename writes with an in-process read cache) and Supabase Postgres with RLS. Same behaviour, same handlers, same APIs. `DATA_DIR` relocates the file store to a mounted volume.

**Alternatives rejected.** *SQLite* — genuinely better on concurrency, but requires a driver and a volume that survives a redeploy; deferred to the VPS/container paths where it becomes attractive. *Postgres as the only backend* — blocked the demo. *An in-memory store for demos* — a stub wearing a trench coat.

**Consequences.** Every handler must work with both backends, which is a tax on clever queries and a gift to portability. The trade is accepted deliberately: campaign data volume is tiny (the live file is 52 KB) and the write rate is a person pressing Save. `public/` is 13 MB; `node_modules` 287 MB; the state that must survive is one file and one image folder. The deployment guide lists persistence as the first porting prerequisite.

**Evidence.** `src/lib/store.ts`; `db.json` size verified 3 Nov 2026; the `/admin` header prints which store it is saving to and warns when writes are not possible.

---

## ADR-003 — Reads and writes use different credentials, on purpose

**Era P4 · Status: accepted**

**Context.** Pages must not be able to read unpublished rows, and a CMS save must not half-succeed.

**Decision.** Public reads use the anon key so RLS excludes unpublished rows from public HTML. Every mutation goes through `getWriteClient()`, which prefers `SUPABASE_SERVICE_ROLE_KEY`. The campaign tables have no anonymous INSERT/UPDATE/DELETE policy by design, so a Supabase deployment without the service-role key *fails loudly* rather than writing part of a row.

**Alternatives rejected.** *One key for everything* — either the public can write, or RLS is decorative. *Row-level permission tricks per role* — more moving parts than the campaign has people.

**Consequences.** `SUPABASE_SERVICE_ROLE_KEY` is a production requirement, not a nice-to-have, and it is called out in both go-live checklists. The failure mode is a visible warning in `/admin` rather than silent data loss.

**Evidence.** `src/lib/supabase.ts`, `getWriteClient()`, `supabase/migrations/0001_init.sql` policies.

---

## ADR-004 — Readable text primary keys instead of UUIDs

**Era P2 · Status: accepted**

**Context.** Seed rows must be importable verbatim into a database and still be recognisable, referenceable in `data-ow` attributes, and stable across re-syncs.

**Decision.** Ids are `TEXT`: `gfx-mandate`, `vid-tvc-flagbearer`, `soc-x`, `a12`, `fc-3`, `site`. Migrations use `TEXT` primary keys for the same reason.

**Alternatives rejected.** UUIDs — a tombstone list and a seed resync become unreadable, and the `data-ow="record.a12.title"` contract becomes a foreign key lookup at every tap.

**Consequences.** Ids must be minted carefully (collision is now a real risk), and a desk-created row must never reuse a bundle id — which is exactly what `resyncSeeds()` respects.

---

## ADR-005 — Content upgrades a live database without touching collected data, and deletions are remembered

**Era P4 · Status: accepted**

**Context.** The bundle carries seed content. The production store carries real volunteers, resident reports, and desk edits. A new build must refresh the first without destroying the second — and a photo the desk deliberately withdrew must not return with the next drop.

**Decision.** `SEED_VERSION` is the bundle marker. When it changes, `resyncSeeds()` refreshes only rows the bundle owns, keeps every desk-created row, and never touches volunteers or inquiries. `data/db.json` keeps a `removed` tombstone list of seed-owned ids so a withdrawal is durable. CMS-created rows need no tombstone because nothing would resurrect them, which is why the list stays short.

**Alternatives rejected.** *Reseed-on-boot* — deletes real data. *No reseed* — the campaign ships a build and the site still shows October's content. *Soft-delete flags in the bundle* — no way to distinguish "the bundle dropped this" from "the desk withdrew this".

**Consequences.** An undo of a withdrawal needs an explicit un-tombstone, and that is correct behaviour for a reputation site: taking something down is a decision, and putting it back is a decision.

---

## ADR-006 — Stateless HMAC-signed session cookie, written by hand

**Era P2 · Status: accepted**

**Context.** The CMS must have real authentication (a stub login was explicitly forbidden), with no session store to persist and no dependency to audit, on a deployment target that may be ephemeral.

**Decision.** A signed cookie — `payload.signature` where the payload is `{exp}` and the signature is HMAC-SHA256 over `ADMIN_SECRET` (falling back to `ADMIN_PASSWORD`) — carried as `ow_admin_session`, `httpOnly`, `sameSite: 'lax'`, `secure` in production, 12-hour TTL, compared with `crypto.timingSafeEqual`. Stateless verification in every handler via `isAdminRequest()`.

**Alternatives rejected.** *next-auth* — a provider model and a database table for an app with exactly one credential. *JWT library* — signing a bearer token whose only claim is expiry, at the cost of a dependency. *Server-side session table* — cannot work on a filesystem-ephemeral PaaS, which is the whole ADR-002 tension again.

**Consequences.** No revocation before expiry: a leaked cookie lives up to 12 hours unless `ADMIN_SECRET` is rotated, which is why rotation is also the revocation mechanism and appears in the runbook as an incident response. `sig.length !== expected.length` is checked before `timingSafeEqual` because that function throws on unequal lengths — a bug found and fixed during the security pass, not at design time.

**Evidence.** `src/lib/admin.ts`, `src/app/api/admin/login/route.ts`, gate check 1–2 of `scripts/check-cms-gates.mjs`.

---

## ADR-007 — Secrets fail closed in production and fail loudly in development

**Era P2 · Status: accepted, currently unmet in operation**

**Context.** The demo must work with nothing configured; the production site must not be reachable with a known dev password.

**Decision.** `adminPassword()` returns the dev fallback with a printed warning when `NODE_ENV !== 'production'`, and the empty string in production — which makes every login attempt fail, because `password !== expected` when `expected` is unset.

**Alternatives rejected.** *A default admin password in production* — the failure mode is a campaign CMS that anyone can open. *Refusing to boot* — arguably better; would have blocked the pitch laptop. Revisit if the product is ever handed to another vendor.

**Consequences.** The dev strings `ola-admin-2026` and `warroom-dev` are in the repository's documentation and in the local env file. They are the first release-blocking checklist item. This ADR is the reason "unmet" in §4.5 of the PRD is an operational gap rather than a design gap.

---

## ADR-008 — The publish gate is enforced in mutation routes, not in the interface

**Era P5 · Status: accepted**

**Context.** "Everything should be functional logic end to end." A validation that lives only in a form is a hint. A claim published without evidence is the single most expensive failure this product can have, because it is the one an opponent can quote.

**Decision.** `POST /api/admin/record` and `POST /api/admin/fact-checks` refuse a row without its evidence link. `PATCH` may replace the link but never empty it. `DELETE` is the only takedown. All input rules — length ceilings, ISO dates, plausible years, real `http(s)` schemes, closed unions for verdicts/categories/platforms, and the requirement that a `slot` names a frame the site actually renders — live in `src/lib/cms.ts` and run server-side.

**Alternatives rejected.** *Client-side validation only* — a `javascript:` URL in a caption is then a live XSS payload on a public page. *A moderation queue* — adds a step a five-person desk will start skipping, and defers the refusal instead of preventing it. *Publish anyway and flag it* — that is the integrity rail (ADR-015), which is a *measurement* of this rule, not a substitute for it.

**Consequences.** Rows published before the gate existed remain editable — refusing a typo fix would keep a wrong sentence live — but are graded `block` until they carry a report. Today that is four lines. The gate is therefore provably working, and visibly inconvenient, which is the correct combination. The one rule is stated once (`EVIDENCE_RULE`) so the desk learns a single sentence rather than one per endpoint.

**Evidence.** `node scripts/check-cms-gates.mjs` — 12/12, twice.

---

## ADR-009 — Server components plus one attribute; the overlay is one delegated listener

**Era P5 · Status: accepted**

**Context.** The brief was a CMS method that is novel and "works with what we have built here already" — meaning it must not require rewriting eleven pages as client components, and it must not become a second UI that drifts from the first.

**Decision.** Pages stay server components and gain one attribute per editable element (`data-ow="settings.hero_title"`, `media.gfx-mandate.caption`, `slot.hq-office`). A single capture-phase `click` and `keydown` listener on `document` reads the attribute off whatever was tapped and resolves it through the field registry. Rings are drawn from `getBoundingClientRect()` of the matched elements, deduplicated by `data-ow` so a value rendered twice in one page yields one ring, and recomputed on scroll with a passive capture listener.

**Alternatives rejected.** *A client wrapper component around every editable region* — eleven pages become client components, the payload grows, and the server HTML the crawler sees is no longer the HTML the desk sees. *contentEditable in place* — the desk can then produce markup that never passes the route's validator, and undo becomes browser editing history rather than a replay of the route. *A headless CMS's visual editor* — requires their render model, their field schema, and their runtime; this campaign's fields live in code.

**Consequences.** A new editable field is one attribute plus one registry entry — the integration is finished by construction, and there is nothing to forget to update. The overlay's knowledge of the page is bounded by what the attribute says, which is what makes ADR-016's invisibility guarantee cheap. Deduplication was added after testing showed a hero clip rendered both in the carousel and in the grid producing two rings and a duplicate React key.

**Evidence.** `src/components/livedesk/chrome.tsx`, `src/lib/liveDesk/contract.ts`, 38 annotated sites, 25 field specs.

---

## ADR-010 — Editing means the same request the dashboard would make

**Era P5 · Status: accepted**

**Context.** Two editing surfaces over one dataset is where forks are born. If the overlay posts to a different endpoint than the tab, they diverge within a month.

**Decision.** The editor sheet sends the body the existing `/api/admin/**` route already validates. Same validation, same `revalidatePath`, and the refusal shown is the route's own sentence, never a reworded one. The counter in the sheet is the route's real maximum.

**Consequences.** The Live Desk is not a feature that could break the CMS; it is a different surface on the same mutation. This is also the honest answer to "novel CMS": the novelty is in *where* the input is taken, not in a new write path, and that is exactly what makes it safe enough to put on a public page.

---

## ADR-011 — `router.refresh()` after save; optimistic UI explicitly rejected

**Era P5 · Status: accepted**

**Context.** After a save the desk must see the real page, because the layout *is* the thing being judged — a sentence that now wraps to four lines is a reason to change it back.

**Decision.** Save → route → `revalidatePath` → `router.refresh()`, which redraws the current page from the server without a reload and without losing scroll position.

**Alternatives rejected.** *Optimistic local state* — fast, and it would show the desk a value the server may have refused. On a system whose entire purpose is that what is published is what is true, a UI that can disagree with the server is not acceptable.

**Consequences.** Each save costs one server round trip. Accepted: this is a person pressing Save, not a stream of keystrokes.

---

## ADR-012 — A frame is not a field: two modalities, and `exact` frames refuse browsing

**Era P5 · Status: accepted**

**Context.** A caption is text; a photograph is a choice among 27 assets with geometry and provenance. Rendering both as "tap to edit" would produce a text box about a picture. Separately, some frames assert facts — the campaign HQ, a named road, a family portrait.

**Decision.** Tapping a frame opens a picker scoped to that frame, drawing each candidate inside a live crop of itself with the discard percentage shown, plus a soft-at-this-size warning; placing a photo demotes the previous occupant. Frames flagged `exact` do not browse the library at all — they take an upload or keep the branded panel — and `pick(slot, { exact: true })` turns the orientation fallback off for them.

**Consequences.** Four frames stay empty, and that emptiness is a documented feature of the go-live checklist rather than a bug report. For a site whose stated purpose is reputation management, an honest empty frame beats a plausible wrong photograph, and a stand-in image of "the office" is a claim.

---

## ADR-013 — ⌘K parses input; no model in the editing layer

**Era P5 · Status: accepted**

**Context.** A command palette feels SOTA until it suggests text. A generated sentence about a real candidate is precisely the liability this site exists to avoid, and a model that ranks fields is a second authority in a system that has decided the only authority is an attested source.

**Decision.** ⌘K turns a pasted YouTube/watch/youtu.be/shorts link into "publish this clip", resolves it through the server's oEmbed lookup so the title and outlet come from YouTube rather than from typing, and turns an article link into "cite this source". Everything else is a keystroke away: tabs, queues, pages, disarm, undo. No model. Nothing accepted is invented.

**Consequences.** The palette is less magical than the version of this feature a 2026 product deck would promise. That is the point, and the trade is recorded here so a future maintainer does not "improve" it by adding generation.

---

## ADR-014 — The integrity rail grades the store, and its score saturates

**Era P5 · Status: accepted**

**Context.** "Is this defensible yet?" has to be answered by something other than the person who wrote the sentence. But a metric that can be farmed will be farmed, and a metric that gets worse as a campaign grows is useless.

**Decision.** `GET /api/admin/health` recomputes findings from the live store — unsourced claims, rulings with no document, frames on the panel, photos too small or cropped past a third, unconfirmed candidate-file rows, sitting drafts — weighted `block 18 / warn 7 / info 2`. The score is `100 − Σ min(WEIGHT × ceil(count/3), WEIGHT × 3)`: grouped and capped, so a hundred unsourced claims cost the same as three and no one reaches 100 by deleting the ugliest offender. Each finding carries the page and `data-ow` of the offending sentence, and "Show me on the page" outlines it.

**Alternatives rejected.** *A linear penalty* — a big campaign looks permanently broken. *A binary gate* — hides partial progress. *Counting every line individually* — the score becomes a function of how much content exists, which is absurd as a quality signal.

**Consequences.** The score is currently **40** with 6 findings, and it will not reach `ready` while four unsourced lines stand. The rail measures content, not the editor, so it cannot be gamed by using the tool well.

---

## ADR-015 — The overlay is invisible to the public, at the DOM level

**Era P5 · Status: accepted**

**Context.** A voter discovering that the site is its own editor is a security story; a voter seeing "Add the report that proves this" under a claim is a political story.

**Decision.** The component asks `GET /api/admin/login` before rendering. A cookie-less probe gets `authenticated: false` and the component renders nothing — no dock, no listeners, no overlay DOM, and none of it present in the server HTML. Worklist hints ride on `data-ow-missing` with `display: none` for everyone and become visible only while the desk is armed.

**Consequences.** Public HTML is byte-identical to a non-editing site except for one attribute per editable element. That attribute is not a secret (it names a field, not a credential) but it is not an invitation either, and it is why the overlay's client payload can stay near zero for unauthenticated visitors.

---

## ADR-016 — Named media positions as the CMS's unit of layout

**Era P4 · Status: accepted**

**Decision.** Every image position on the site is a named frame declared in `MEDIA_POSITIONS` with its aspect ratio — 20 of them. The resolver picks the published photo bound to the frame, else any published photo whose orientation fits, else the branded panel. The CMS, the picker, the harvesters, and the validation all speak `slot`.

**Why.** "Put the picture where the picture goes" is not a sentence a desk can operate. Binding by frame name makes the layout a first-class editable object, makes a 400 on an unknown slot meaningful, makes "16 of 20 frames filled" a countable status, and makes the crop cost computable before a photo is placed rather than after a voter notices the head is missing.

**Evidence.** `src/lib/slots.ts`, `MEDIA_POSITIONS` in `src/lib/content.ts`, `public/images/README.md` (all 20 frames and the 4 deliberately open).

---

## ADR-017 — A dependency-free image header probe instead of `sharp`

**Era P4 · Status: accepted, with a known ceiling**

**Context.** The CMS needs real pixel dimensions to match a photo to a frame. `sharp` is the normal answer and brings a native binary — into a build that must run on a Windows pitch laptop, in CI, and inside a 4.5 MB serverless payload ceiling.

**Decision.** `src/lib/imageMeta.ts` reads dimensions from file headers: PNG, GIF, JPEG-SOF, AVIF/HEIF `ispe`, and WEBP walked as a RIFF list of fourcc chunks (VP8X / VP8L / VP8, descending into `ANMF` for animated files). HEIC is refused as not web-safe. Both harvesters and the upload route share the probe through `scripts/lib/press-media.mjs`.

**Why the WEBP chunk walk matters specifically.** Nigerian press sites on WordPress/Jetpack serve WEBP bytes under `.jpeg` filenames. A fixed-offset read returns sizes like 682×11582, which then poison the orientation metadata and the crop gate. `harvest-press-extra.mjs --offline` exists to repair a manifest written before that bug was fixed, re-probing files already on disk without re-downloading from the outlets.

**Alternatives rejected.** *`sharp`* — native binaries, and the deployment paths narrow. *`image-size`* — a dependency for ~120 lines of parsing. *Trusting the filename* — that is the bug. *Server-side `<img onload>` measurement* — the desk needs the number before placement decides.

**Consequences.** No resizing, no format conversion, no EXIF stripping in the upload path. Accepted: originals are served, sizes are capped at 10 MB, and the resize decision moved to `next/image` at render time. If the desk starts uploading daily, off-disk media storage (ADR-022's second half) becomes the next change.

---

## ADR-018 — The crop-fit threshold is one number, shared by the tool that files and the tool that previews

**Era P4–P5 · Status: accepted**

**Decision.** `cropLoss = r > 1 ? 1 − 1/r : 1 − r`, with `r` = photo ratio ÷ frame ratio; refuse above 34%. The same `fitFor` computation gates the batch publisher, is printed in the publisher's dry run, and is displayed as a percentage in the Live Desk picker.

**Why one number in one place.** If the harvester's idea of "acceptable" differs from the picker's, the desk is shown a photo as valid that the tooling says destroys the subject — and the disagreement is invisible. A 1:1 photo in a 16:9 banner loses the people; it goes to the gallery wall instead of the frame. Panoramic strips (long side > 6× short) are dropped as banners, not photographs.

---

## ADR-019 — One fixed carousel frame; the fit follows the photograph

**Era P6 · Status: accepted (defect-driven)**

**Context.** The home carousel showed the campaign portrait cropped through the candidate's head. The strip had a single landscape frame with `object-cover`, which is correct for a press shot and destroys a 4:5 portrait — roughly two-thirds of its height, and the head is the first thing to go.

**Decision.** The frame stays one shape for the whole strip (a slideshow that changed height per slide would jump under the reader's thumb), and the *fit* becomes per-slide: landscape covers; portrait or square is `object-contain` over a blurred, dimmed copy of itself. The contained image's bottom padding is not decoration — the caption band is absolutely positioned over the frame, measured at 233 px of a 339 px frame on desktop, so padding keeps a candidate's feet out of the caption. `orientation` travels to the slide model so the render decision can be made (`GallerySlide.orientation`).

**Consequences.** One more field on the slide contract and two `<Image>` layers per contained slide. Verified in the browser on 3 Nov 2026: a 145×203 figure at preserved aspect, clearing the caption band. Also a lesson recorded for the ADR process: three separate fixes were needed (the data field, the resolver emitting it, the renderer consuming it), and a first verification pass read a cached document rather than the built one — see `09-QA-AND-TEST-EVIDENCE.md`.

---

## ADR-020 — Local originals for next/image; plain `<img>` for third-party URLs

**Era P4 · Status: accepted**

**Decision.** `next/image` remote patterns allow only the campaign's own Supabase bucket and Cloudinary. A third-party press URL renders as a plain `<img loading="lazy">`.

**Why.** The Next optimiser only serves configured hosts; pointing it at an arbitrary outlet URL returns a 500, which on a campaign site looks like a broken page rather than a configuration gap. Routing press images through our own optimiser would also mean proxying an outlet's content as if it were ours — and the credit line is the point of showing it.

**Consequences.** Off-site images are unoptimised and their origin does the bandwidth. Accepted for provenance reasons; the media library prefers filed local copies from the harvest, which are optimised and measured.

---

## ADR-021 — Click-to-play video facade on `youtube-nocookie`

**Era P4 · Status: accepted**

**Decision.** The shelf renders YouTube's `hqdefault` thumbnail and injects the iframe only after a tap. Every id is confirmed live and embeddable against oEmbed before it can be saved (401/403 → embedding is off; 404/400/410 → wrong link), with a 6-second abort timeout so a YouTube outage cannot block the desk.

**Why.** A phone on a prepaid data plan should not download anything from Google it did not ask for; the campaign should not seed a third-party cookie into a voter's session before consent; and an empty black player makes the site look broken to the one audience that matters. The `nocookie` host is a preference, not a claim of full privacy.

**Alternatives rejected.** *Self-hosted video* — no storage and no transcode pipeline on this stack. *An embedded channel player* — requires a verified campaign channel, which HQ has not confirmed, so the shelf is fed by individually verified ids.

---

## ADR-022 — Uploads are their own directory, with their own garbage collection

**Era P4 · Status: accepted**

**Decision.** Desk uploads land in `public/images/uploads/<slug>-<stamp>.<ext>`; bundled press harvests and generated artwork live under `/images/press` and `/images/generated` and belong to the repository, so the housekeeping module never touches them. Replacing or deleting a photo purges the orphaned file, but only if no other row still references it, and only behind a `path.resolve` + prefix check so a crafted `src` cannot escape the upload folder.

**Why the split matters.** A general "delete files that no longer appear in the store" sweep would delete the bundled press library the moment a seed resync left a row unpublished. Scope is what keeps a convenient feature from becoming an act of vandalism.

---

## ADR-023 — Every handler is `force-dynamic`; content pages still carry ISR windows

**Era P6 · Status: accepted**

**Decision.** All 34 route handlers declare `dynamic = 'force-dynamic'`. Eleven public pages plus admin are server-rendered; the prerender manifest shows **8 content pages carrying `revalidate` (300/900/3600 s) and 6 marked immutable** — a distinction this document set states explicitly because an earlier draft of the deployment guide wrongly described all fourteen as immutable.

**Why.** A handler that reads a session cookie or writes a file cannot be cached at build time, and a stale handler response on a campaign site is a stale public statement. Meanwhile the *pages* benefit from being regenerated rather than re-rendered per hit, because the constituency's traffic arrives in bursts through a CDN.

**Consequences.** Cache staleness is an editorial budget, not an implementation detail: a Truth Room that lags an hour during a rumour is a political problem. `DEPLOYMENT-GUIDE.md` §6.4 frames it that way and asks HQ to set the budget; every CMS write calls `revalidatePath` so an intentional edit is never the thing that has to wait.

---

## ADR-024 — Security headers at the framework edge, restated at the reverse proxy

**Era P4 · Status: accepted**

**Decision.** `next.config.mjs` sets HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`, DNS prefetch on, and `poweredByHeader: false`. The Caddyfile in `DEPLOYMENT-GUIDE.md` §10 restates the same six headers for the container/VPS path.

**Why twice.** Header sets are dropped by proxies and by static-export hosts; a path that loses them must lose them visibly. The static export cannot carry them at all, which is why `scripts/sites-export.mjs` and the host's edge cache are documented as the substitute.

**Consequence and a known gap.** No Content-Security-Policy yet. It is deferrable while the pages are wholly server-rendered with no injected markup, but it should ship before the site is a target — logged in `10-SECURITY-AND-COMPLIANCE.md`.

---

## ADR-025 — Personal data is stripped in code and in the database

**Era P2 · Status: accepted**

**Decision.** `toPublic()` removes `reporter_name`, `reporter_phone` and `consent` from every public issue response, and the Supabase RLS policy mirrors the same rule so the guarantee survives a handler that forgets to call it. `/api/admin/issues` is the only place contacts are visible, behind the session.

**Why.** One enforcement point is one bug away from a resident's phone number in a public JSON response, and a campaign that publishes a supporter's number once will not be forgiven in that constituency. Redundancy is not paranoia at this data volume.

---

## ADR-026 — Prohibited capabilities are absent from the codebase, not disabled

**Era P2 · Status: accepted (policy)**

**Decision.** There is no donation route, no voter-roll import, no automated posting path, no scheduled publish, no generation of claims, and no AI imagery of the candidate. These are not feature flags set to off; no such module exists.

**Why.** A disabled capability is a liability with a config option attached. An architecture review — by a journalist, an opposing campaign, or a regulator — can read this repository and confirm the absence, which is a materially different claim from "we turned it off".

**Consequence.** Feature requests in these categories are not backlog items; they are PRD §12 non-goals and require a new document with counsel in the loop.

---

## ADR-027 — The War Room writes through a bearer secret into a human-reviewed ledger

**Era P2 · Status: accepted**

**Decision.** `POST /api/truth-room/sync` authenticates with `WAR_ROOM_SECRET_KEY` and lands rows in the ledger for desk review; the CMS requires an authenticated session; there is no route that publishes on a timer or on an inbound webhook alone.

**Consequences.** Human-in-the-loop is a property of the request graph rather than an editorial instruction — which is the only version of that promise worth making. The production webhook URL is not yet pointed at a live War Room.

---

## ADR-028 — CSS animations and inline SVG instead of animation and icon libraries

**Era P1 · Status: accepted**

**Decision.** `requestAnimationFrame`/CSS for the stat ticker and carousel motion; hand-authored inline SVG for icons. No Framer Motion, no lucide-react.

**Why.** Four runtime dependencies in total. On the target network, a bundle saved is a page load saved, and the motion here is three patterns rather than a choreography engine.

**Consequence.** Motion is not free to change; the `prefers-reduced-motion` handling is written per pattern rather than provided, which is more code and more control.

---

## ADR-029 — Atomic file writes with a Windows-specific retry

**Era P2 · Status: accepted**

**Decision.** The file store writes a temp file and renames it, with retries and an in-place fallback for `EPERM` / `EBUSY` / `EACCES`.

**Why it is an ADR at all.** `errno -4091` (`EPERM` on rename) is a Windows reality — antivirus, OneDrive-synced Desktop folders, and an editor holding the file. A campaign desk runs on a Windows laptop, and a store that throws on the third save of the day is a store the desk stops trusting. The development environment's quirks were treated as requirements rather than as environment noise.

**Consequence.** No cross-process locking: two concurrent writers on the same file can still interleave. At this volume, accepted, and stated in the hardware spec as a scaling limit.

---

## ADR-030 — Static export as a preview artefact, not a product mode

**Era P6 · Status: accepted**

**Decision.** `NEXT_OUTPUT=export` produces the frozen `out/` bundle for the pitch preview, with `unoptimized` images, `trailingSlash`, no headers or handlers, `NEXT_PUBLIC_SITES_DEMO=1` showing an honest "preview build" notice on capture forms instead of pretending a submission was recorded.

**Why.** A preview that fakes a successful form submission is the exact "demo, not functional" thing the brief forbade. Better to show the ribbon and say the server is absent.

---

## ADR-031 — Portability is designed in, and the deployment guide is the test of it

**Era P6 · Status: accepted**

**Decision.** The hosting analysis in `DEPLOYMENT-GUIDE.md` was written against the verified build (prerender manifest, route metadata, disk measurements) rather than from provider marketing, and it names the five constraints that decide the host — Node runtime needed for 34 handlers, persistent writes for the file store, a Node-only upload handler, 13 MB of public assets, and bursty traffic.

**Consequence for the architecture.** `DATA_DIR`, the dual backend, and the absence of middleware/native deps are what make four of the four documented paths honest. The porting work order (eight items) is the price list of this decision.

---

## ADR-032 — Deliberately deferred, recorded so it is not mistaken for an oversight

**Era P6 · Status: open**

| Deferred | Why deferred | Trigger to do it |
|---|---|---|
| Content-Security-Policy | No injected markup today; risk of breaking `next/image` and the YouTube facade without a staging host | Before the site is publicly named |
| Full WCAG 2.2 audit (keyboard + assistive tech) | Needs a device and a week the launch runway did not have | Week after launch, or earlier by HQ decision |
| Off-disk media storage | File store works; migration is mechanical | When the desk uploads daily |
| Revision history / version database | Undo covers the session; backups cover the file | Desk grows past ~5 people, or one bad overwrite |
| SQLite backend | File store adequate at 52 KB; SQLite needs a surviving volume anyway | Concurrent editors or >1 MB of JSON |
| Mapbox ward map | A card UI is honest and dependency-free | A token and a routing dataset |
| Donations | Legally unresolved for this office | Written counsel opinion, new PRD |
| Voter-file integration | Prohibited, not deferred — listed here to be unambiguous | Never on this product |

---

## How to add an ADR

Append a numbered entry with: era, status (accepted / superseded / open), context as it was actually known, the decision, alternatives with the reason each was rejected, consequences including the ones that hurt, and the file that proves it. Superseded ADRs are marked and left in place — the value of this log is the reasoning at the time, and deleting it destroys the only record of why the site is shaped this way.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | 32 ADRs recorded retroactively from the build; sequencing given by era rather than false calendar precision; deferred list added | i2sltd.tech |
