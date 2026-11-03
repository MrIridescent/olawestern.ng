# Case study — a campaign website that audits its own trustworthiness

**Type:** client project (anonymised) · **Role:** product design, architecture, full-stack implementation, documentation, operations design · **Stack:** Next.js 14.2.15 (App Router), TypeScript 5.5, Tailwind 3.4, React 18.3.1, dual storage (flat-file + Supabase Postgres) · **Status at compilation:** production build verified locally; no host assigned; self-audit score 40/100, deliberately not yet shared publicly
**Compiled:** 3 November 2026 · **All measurements below were taken against the codebase on this date** and are recorded, with the commands that produced them, in `../ola-western-web/docs/09-QA-AND-TEST-EVIDENCE.md`

---

## 1. The brief, in the client's own terms

A candidate for a 2027 Lagos State House of Assembly seat (Amuwo-Odofin Constituency I) needed a public website. The people commissioning it described the job three ways, and all three came from them rather than from me:

> *"this website is for 'Public relations', and 'reputation management.'"*
> *"make it the greatest ever in its class for functionalities … fully functional, no stub login, demo, placeholder … we want to showcase the good he had done even before coming to office."*
> *"Nigerians are mostly on their phones — mobile first … make website colours not too bright, we need ease of reading."*

Plus a CMS requirement that was unusual in the way most CMS requirements are: *"seamless, intuitive, SOTA, novel, a method of CMS never conceived but will work with what we have built here already."*

And, separately, an infrastructure question: what hosting actually holds this, can PaaS work, can it be serverless.

### The problem under the brief

The constituency's information environment is not neutral. Between February 2023 and October 2026, documented events in Nigeria and elsewhere included a polling-day results-transmission collapse that turned a contested count into a national legitimacy dispute (Rivers State, February 2023, cited in `docs/02-RESEARCH-AND-DISCOVERY.md` §4); a political party's own website being hacked and defaced (APC, January 2019); a fake "INEC information" site impersonating the electoral body; fabricated result graphics during an off-year state election (Osun, August 2026); an arrest over a synthetic audio clip of the head of state (June 2026); a regulator taking down misleading campaign content (FEC, October 2026); and Meta's withdrawal of third-party fact-checking in part of the world (January 2025), after which a claim posted on a campaign's own page is more likely to be the only place a voter ever sees it.

A site built for "public relations and reputation management" in that environment has one product to ship, and it is not a brochure: **a public record that can withstand the question "how do you know?"**

That reframing is the whole project. Everything below follows from it.

---

## 2. The two ideas that define the system

### 2.1 The publish gate — evidence or no record

Two content types make claims about the world: track-record entries ("what he did") and Truth Room rulings ("this rumour is false, here is the fact"). Both are the kind of content that gets fabricated under deadline pressure by well-meaning volunteers.

So the rule is not policy; it is code. `EVIDENCE_RULE` in `src/lib/cms.ts`:

- A **POST** creating a track-record entry or a Truth Room ruling is refused by the server unless an evidence reference is supplied with it. The client cannot talk its way past this, and neither can I.
- A **PATCH** may replace an evidence link with a different one. It may never empty it. "Remove the source, keep the claim" is structurally unavailable.
- **DELETE** is the only takedown. Withdrawing a claim is an action with a trace, not an edit to history.

The practical consequence: the four published lines the audit considers unsubstantiated stay flagged, and the person who could most easily have fixed the score by inventing a plausible-looking URL chose not to. The honest score is 40 out of 100 and the site's own status line reads *not ready to share*.

Why this is the interesting part: a "reputation management" tool that cannot be used to publish an unattested claim is a different product from the one the client asked for, and closer to the one the situation required. The gate protects the client from the failure mode that ends reputations — one unprovable claim found by someone with time.

### 2.2 Live Desk — the public page is the CMS

The client wanted a CMS "never conceived". The constraint that produced the answer was not technical: campaign staff do not learn admin panels, and they will not log into a second interface to check whether the headline on the site they are reading is right.

So the editing surface became the site itself.

- `⌘E` reveals every editable region on the live page: **38 annotated sites**, marked with `data-ow` attributes, rings drawn from `getBoundingClientRect()` and deduplicated with a `seen` Set.
- Tap a region, edit in place. **25 field specs** in one contract file (`src/lib/liveDesk/contract.ts`) across **5 kinds** — `text`, `area`, `url`, `choice`, `boolean` — with `inArray` handling the repeated stat strip and an `attested` flag that marks whether a value is honest to publish.
- `⌘K` opens a command deck that parses intent and calls the existing endpoints. `⌘Z` undoes. `Esc` leaves.
- On write: `router.refresh()` plus `revalidatePath`, so the next visitor sees the change and the editor sees their own change, without a build.
- For everyone else: the session probe renders **zero DOM**. An anonymous visitor's page contains no editable markup at all, so the feature is undetectable from the outside and adds nothing to their payload.

Adding a field to it is a two-line change to the contract. That is what makes it a system rather than a set of hacks: one declarative source of truth drives the annotation, the overlay, the validation and the admin tabbed fallback at `/admin`, which still exists because some operations belong in a table.

### 2.3 The integrity rail — the site grades its own trustworthiness

A third idea, and the one nobody asks for: the site computes its own credibility score and shows it, with the findings, on the admin surface.

`score = 100 − Σ min(WEIGHTS[sev] × ⌈count/3⌉, WEIGHTS[sev] × 3)` with `WEIGHTS = { block: 18, warn: 7, info: 2 }`, per-severity penalty capped so a pile of minor issues cannot drive the score to zero, and `min(100, …)`/`max(0, …)` bounds applied. Current output: **40 / 100, 6 findings, 4 published lines graded `block`** — three track-record entries (`a6`, `a11`, `a12`) and one Truth Room ruling (`fc-accessible`), each flagged because its evidence link is missing or weak.

The score is not vanity telemetry. It decides whether the site is shareable, it names the specific lines that must be fixed, and it can only be moved by adding evidence or removing claims — both of which are the correct responses.

---

## 3. The system, sized honestly

| Aspect | Measured 3 Nov 2026 |
|---|---|
| Routes | 12 page routes — 11 public (home, about, impact, gallery, news, truth-room, help-desk, contact, join, privacy, blueprint) + `/admin` |
| API | 34 route handlers, all `force-dynamic`; every `/api/admin/**` handler session-gated; only `/api/admin/media/upload` declares `runtime='nodejs'` |
| Source size | 11,932 LOC in `src/` (app 3,192 · lib 2,979 · components 5,540 · types 221) plus 1,097 in `scripts/` |
| Payload | 87.2 kB shared first-load JS; 87–102 kB per page |
| Caching | 14 prerender entries: 8 with ISR (300–3600 s) + 6 immutable |
| Content | 27 published photographs filling 16 of 20 declared frames; 7 oEmbed-verified video clips; 21 cited press references; 83 press files in `public/` |
| Data | Flat-file store `data/db.json` (52 KB) as live default, Supabase Postgres as configured path with migrations `0001`/`0002` |
| Dependencies | 4 runtime dependencies; no ORM, no middleware, no UI kit, no image service |
| Auth | Stateless HMAC-SHA256 signed cookie, 12 h TTL, `httpOnly`, `sameSite=lax`, `secure` in production, `timingSafeEqual` behind a length check, fail-closed when `ADMIN_PASSWORD` is unset in production |
| Self-audit | 12 of 12 CMS gates passing; integrity score 40/100 with 6 findings |
| Version control | **Absent — no `.git`.** Recorded as a blocking release item |

The deliberate absences are as informative as the presences. No `sharp`: a dependency-free header probe (`imageMeta.ts`) reads dimensions out of file bytes instead, walking RIFF chunks for WEBP including `ANMF`, and **refuses HEIC** rather than guessing at it. No test framework: instead a gates script (`scripts/check-cms-gates.mjs`) that asserts the load-bearing behaviours — the publish gate, the annotation contract, the media frames — so the "tests" are behavioural contracts rather than unit coverage.

One defect found while measuring and left in place, documented: `/api/volunteer` does `await Promise.allSettled([pushLeadToWarRoom, sendWhatsAppWelcome])` with **no timeout**, under a comment that says "fire-and-forget". A slow external call can hang the request. Severity `warn`, fix is one line.

---

## 4. Craft decisions worth describing

**Media binding by aspect ratio, not hope.** Twenty frames declare target dimensions. A candidate photograph is scored by crop loss, `r > 1 ? 1 − 1/r : 1 − r`, and refused above 34%. Four frames — `family-portrait`, `hq-office`, `23-road-inspection`, `community-security` — are **deliberately empty** because no real image fits them and the alternative was a stand-in. That is the same instinct as the publish gate: an honest hole is better than a filled one.

A concrete case: the official portrait in the homepage carousel was visibly not fitted to its space. Fixed, and the final measured geometry — 145×203 rendered inside a 339 px frame with a 233 px caption band — was recorded, together with the fact that my first verification attempt was invalid because the browser served a cached copy. Writing down a failed verification is what makes the surviving one worth reading.

**Image harvesting with provenance.** 83 press photographs were gathered from public reporting, each stored with its source credit and reference, and 21 press references made citable on-page. No image is desk-uploaded yet (`0` uploads), and no image is synthetic. The rule "dimensions must meet the space" became the ratio gate above.

**Video without a backend.** Embedded channel videos are verified through oEmbed before they can be listed, so a clip in the library is a clip that exists (7 verified).

**Palette and mobile as accessibility, not taste.** The client's "colours not too bright, ease of reading" was implemented as a calm ground with measured contrast, 24 px-plus tap targets against WCAG 2.2 SC 2.5.8, mobile-first layouts, reduced-motion honoured in the carousel (`prefers-reduced-motion`, verified in code). The outstanding item is stated: a full WCAG 2.2 audit has not been performed.

**Caching honesty.** The prerender manifest shows 8 routes carrying ISR and 6 immutable. My own earlier draft of the deployment guide claimed all fourteen were immutable, which made the staleness argument in §6.4 of that guide wrong. The corrected version is what ships, and the error is recorded in the index change log rather than quietly replaced.

---

## 5. Infrastructure analysis as part of the deliverable

The hosting question got a real answer instead of a shrug: **`DEPLOYMENT-GUIDE.md`**, written against a verified build, analyses five paths and says which ones do not work and why.

Full serverless on a PaaS is insufficient, and the reason is architectural rather than preferential: the admin surface writes photographs to disk (`/api/admin/media/upload` is pinned to the Node runtime), the flat-file store needs a persistent writable volume with atomic tmp+rename, the signed-cookie session has no edge equivalent, and there is no CDN purge API available to this build — `revalidatePath` is the only invalidation path, which changes how stale content behaves after a desk edit. Four paths survive: managed Node hosting with a volume; self-hosted VPS with `next start` behind Caddy; containerised behind a CDN; and static-plus-replica as a degraded fallback for the pages that do not write.

**`docs/11-HARDWARE-AND-ENVIRONMENT-SPEC.md`** sizes it with the arithmetic shown: three production tiers (entry 1 vCPU/1 GB/20 GB; recommended 2 vCPU/4 GB/80 GB with object storage or Supabase and a CDN in front; surge 4 vCPU/8 GB for the election window), a peak-day traffic model of roughly 70 GB egress uncached versus 5–15 GB at origin behind a CDN, growth driven by photographs rather than rows, Node 20 LTS pinned, and a list of things not to buy. Every assumption in that model is labelled as an assumption, which is the only reason the model is useful.

**`docs/05-OPERATIONS-RUNBOOK.md`** covers what happens after launch: cadences, a monitoring matrix including a West African vantage, ten incident playbooks (rumour response, wrong claim, stale page, downtime or attack, a hanging volunteer route, credential leak, impersonation, vanished headers, broken page, a data-subject request), an L0–L3 escalation ladder, and a handover procedure with three post-election decisions.

---

## 6. The documentation set

Thirteen dated documents in `../ola-western-web/docs/`, ordered along the real lifecycle rather than the README-and-API convention:

`00` index (with a precedence ladder and a system-status table that lists its own gaps) · `01` PRD — FR-1…FR-34 and NFR-1…NFR-15, each with the enforcement mechanism, the code location and an honest status, plus non-goals, risks and open questions · `02` research and discovery — standards, statutes and reported events with dates and URLs, nine unresolved conflicts, eight findings that changed the product · `03` architecture decisions — ADR-001…ADR-032, dated by build era rather than calendar and saying so, with a deferral table whose prohibited items are distinguished from merely deferred ones · `04` technical manual — Parts 0–10, from mental model and ASCII data flow to photo harvesting, a 20-row troubleshooting table and the port-kill recipe, written for a desk trainee · `05` runbook · `06` use cases — 22 abstract, 9 fully fictional scenarios, **28 cited real-world reported events each mapped to documented behaviour with an "honest limit" column**, plus 10 refused uses · `07` user stories and journeys — 8 personas, 34 stories with acceptance criteria marked verified or `[gap]`, 7 journey maps, a 30-minute training plan · `08` developer workflow — conventions, six recipes, review checklist, a ten-step verification protocol, 14 landmines · `09` QA evidence — E1–E8 with commands run, timestamps and observed output · `10` security and compliance — T1–T15 threat model, four stated limits of the auth design, NDPA 2023 mapped obligation by obligation (s.25(1) bases, s.26 consent, s.27 notice, s.28 DPIA, **s.30 political opinions as sensitive data**, s.34 rights, GAID 20 Mar 2025) with enforcement precedent (Fidelity Bank ₦555.8m, August 2024; MultiChoice ₦766m, July 2025; a Meta settlement reported October 2025), EU AI Act Art. 50 applicable 2 Aug 2026, and platform political-ad rules · `11` hardware and environment spec · `12` pre- and post-programming checklists, five phases including the gate lists run late and therefore marked as such.

Plus `docs/infographic.html` — a single self-contained, print-friendly broadsheet that synthesises all thirteen for a five-minute read. Zero external requests, zero images, real `@media print` rules.

Two rules govern the set, and they are the reason it is worth more than the usual `docs/` folder: **gaps stay visible** — a closed gap gets a date and the evidence that closed it, it is never deleted; and **a claim contradicted by the gates script or the health endpoint is treated as a documentation bug**, not as a discrepancy in reality.

---

## 7. Decisions I would make again, and one I would not

**Would make again.** Put the honesty machinery in the server rather than in the style guide. Make the public page the editing surface. Let an audit score gate shareability. Refuse to fabricate the four evidence links even though fabricating them was a fifteen-minute job that would have produced a screenshot reading 100. Size the hosting question with arithmetic a non-specialist can check. Document the failure of my own verification attempts.

**Would not make again.** Ship this much surface area with no version control. The absence of `.git` is the least defensible item in the whole project and it is the first thing the technical manual tells a new engineer (`git init` is step 1 of Part 6, and the manual notes that `.gitignore` already excludes `/data` and `.env.local`, which is exactly why the backups are the only copy of the content). Also: the CI workflow still references an archived action (`amondnet/vercel-action@v25`) and passes only the two public Supabase variables; the dev fallback secrets are still live locally and must be rotated before any public deployment. All three are in the risk register with owners, which is not the same as fixed.

**The uncomfortable one.** The most valuable artefact in this project is the set of things it refuses to do. No synthetic portrait of the real person. No invented rumour or verdict in the Truth Room — only documented claims get rulings. No astroturfing, no engagement that a person did not intend. No auto-publication: a human is in the loop for every publish. No deletion of the client's data directories. A campaign-tech portfolio that leads with capability and hides refusals is selling the next client the same liability that could destroy the current one.

---

## 8. How to use this case study

- **For a software role:** lead with §2.1 and §2.2, then §3's measured table, then §5. The argument is "designs systems where the constraint is the interesting part, and proves the state of the thing with commands".
- **For a campaign or civic-tech role:** lead with §1 and §4 of `docs/06` (the reported events), then §2.1, then §6's compliance mapping. The argument is "understands both the information environment and the regulator".
- **For a political principal:** skip this file and use `PITCH-KIT.md`. This document is written for people who evaluate work; a principal evaluates risk and cost.
- Keep every number with its date. If you re-measure, update it and say when.

**Sources.** External claims above are drawn from `../ola-western-web/docs/02-RESEARCH-AND-DISCOVERY.md` (standards, statutes and reported events, each with a URL and a check date of 3 November 2026) and `../ola-western-web/docs/06-USE-CASES.md` Part C (28 cited events). Where a claim could not be confirmed as current it is marked `[unverified]` rather than softened. W3C WCAG 2.2; web.dev Core Web Vitals (INP replaced FID on 12 Mar 2024); Nigeria Data Protection Act 2023 and NDPC's Global Advocacy, Innovation and Data-protection declaration of 20 Mar 2025; EU AI Act transparency provisions applicable 2 Aug 2026; HTTP caching per RFC 9111; Next.js ISR and self-hosting documentation; HTTP Archive Web Almanac page-weight medians (global, labelled as such).
