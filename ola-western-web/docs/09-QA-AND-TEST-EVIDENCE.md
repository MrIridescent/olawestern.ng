# QA and Test Evidence

**Document:** 09-QA-AND-TEST-EVIDENCE.md
**Version:** 1.0
**Written:** 3 November 2026 (last evidence run 3 Nov 2026, 13:49 UTC)
**Against:** `ola-western-web`, Next.js 14.2.15 production build served by `next start` on `127.0.0.1:3100`
**Principle:** this file records the **command, the date and the observed output**, not a conclusion. A claim here that is not backed by a line of output is a plan, and is labelled as one.

---

## 1. Testing strategy — what this project actually uses

There is **no unit-test framework and no end-to-end test runner in the repository**, and no test files. That is a stated condition, not an omission from this document. It is the correct trade for a one-engineer, one-campaign, deadline-bound build, and it is also a real risk; the mitigations are:

| Layer | What replaces tests | Coverage |
|---|---|---|
| Types | `npx tsc --noEmit`, run as a gate step | Whole `src/` |
| Build | `npm run build` — App Router fails on invalid route/config usage | Whole app |
| Behaviour | `scripts/check-cms-gates.mjs` — 12 executable assertions against a **running server** | Auth, audit gating, publish gate, evidence immutability, cleanup |
| Rendering | Manual browser protocol (`08-DEVELOPER-WORKFLOW.md` §8), with measurements rather than impressions | Pages, overlay, frames |
| Self-audit | `GET /api/admin/health` — the product audits its own content | Store-wide |
| Docs | Change logs and dated evidence (this file) | — |

The gate script is the closest thing to a test suite, and its design is deliberate: it asserts the *safety* properties (anonymous cannot read; unsourced cannot write; evidence cannot be emptied) rather than the happy path, because those are the properties whose failure is a political event. Its one weakness is coverage: 12 checks against 34 handlers.

## 2. Evidence log

### E1 — Type check · 3 Nov 2026, 13:48 UTC
```
$ npx tsc --noEmit
(no output; exit 0)
```
**Proves:** the whole `src/` tree, including the `GallerySlide.orientation` field added on 3 Nov and the `slots.ts` resolver change that emits it, type-checks against `src/types/index.ts`.
**Does not prove:** runtime behaviour.

### E2 — CMS gate checks · 3 Nov 2026, 13:49 UTC
```
$ node scripts/check-cms-gates.mjs
Checking http://127.0.0.1:3100

PASS  integrity audit refuses an anonymous request — HTTP 401
PASS  wrong password is refused — HTTP 401
PASS  campaign session opens — signed cookie issued
PASS  integrity audit returns a score — score 40 · not yet defensible · 6 finding(s)
      block: Service claims with no published report linked (3) → /impact [data-ow="record.a12.verification_source_url"]
      block: Truth Room rulings with no document attached (1) → /truth-room [data-ow="fact.fc-accessible.official_document_url"]
PASS  record entry without a report is refused — HTTP 400 · A public claim about a real person needs its evidence: paste the link to the published report or document that proves it.
PASS  non-http evidence is refused — HTTP 400
PASS  record entry with a report is published — HTTP 200 · 0ee31a6e-8447-49b1-b53c-3227bcf89ced
PASS  evidence link cannot be emptied — HTTP 400 · The evidence link cannot be emptied. Replace it with another report, or take the entry down from the ledger.
PASS  a published entry stays correctable — HTTP 200
PASS  the throwaway entry is removed again — HTTP 200
PASS  Truth Room ruling without a document is refused — HTTP 400
PASS  no test rows left behind — 0 leftover

12/12 checks passed.
```
**Proves:** session auth (accept and refuse), the integrity endpoint is not anonymously readable, the integrity score is real and computed from the live store, the publish gate refuses unsourced and non-`http` evidence, a sourced entry saves, the evidence link cannot be emptied, pre-gate rows remain correctable, and cleanup is complete.
**Also proves, incidentally:** the refusal strings are the route's own, so the Live Desk shows the same sentence (ADR-010). And the gate is currently failing its own campaign honestly: **4 `block` lines** — 3 record entries and 1 ruling — listed with their exact `data-ow` targets.
**Does not prove:** the other 27 admin handlers' auth guards (they follow the same `isAdminRequest` pattern and were reviewed, not asserted by script), Supabase-backed writes, or any production-host behaviour.
**History:** this is the third recorded pass — earlier runs on 3 Nov 2026 were also 12/12, one before and one after the carousel fix, so the change did not disturb the gate.

### E3 — Production build and route shape · 3 Nov 2026
```
$ npm run build        → success, route table emitted
$ npx next start -p 3100
```
Measured from the build output and `.next/prerender-manifest.json`:
- Shared first-load JS **87.2 kB**; per-page **87–102 kB**.
- **14 prerendered routes: 8 carry timed ISR** — `/` 3600, `/gallery` 3600, `/impact` 3600, `/about` 3600, `/contact` 3600, `/truth-room` 900, `/news` 900, `/help-desk` 300 — and **6 are immutable** — `/blueprint`, `/privacy`, `/join`, `/robots.txt`, `/sitemap.xml`, `/icon.svg`.
- 34 route handlers, all `force-dynamic`; only `/api/admin/media/upload` declares `runtime = 'nodejs'`.

**Proves:** the staleness claims in `02-…DISCOVERY.md` §3.5 and `11-HARDWARE…SPEC.md` §4 are per-route facts, not estimates — notably that the Truth Room is the most aggressively refreshed content page (900 s), which is the correct editorial priority, and that `/help-desk` is 300 s.
**Correction recorded:** an earlier draft of `DEPLOYMENT-GUIDE.md` described all fourteen prerendered routes as immutable. That was wrong, it changed the argument in §6.4, and the fix is logged in `00-DOCUMENT-INDEX.md`. This is the kind of error a manifest reading catches and an assumption does not.

### E4 — Live Desk end-to-end, in a browser · 3 Nov 2026
Protocol run on `http://127.0.0.1:3100`, signed in, then re-run in a private window.
| Step | Observed |
|---|---|
| Anonymous `/` | No dock, no rings, no overlay DOM, no listeners in the served HTML |
| `⌘E` on a public page | Rings appear around editable elements; one ring per `data-ow` after the dedupe fix |
| Tap a headline | Sheet opens prefilled with the rendered text; counter equals the route's max |
| Edit → Save | Page redraws in place via `router.refresh()`; scroll position preserved; no reload |
| `⌘Z` | Previous value restored through the same route; page updates again |
| Tap a photo frame | Library picker scoped to that frame; each candidate drawn in a live crop of itself with the discard %; `exact` frames refuse the browse |
| `⌘K` with a YouTube link | Intent offered; title/outlet resolved by the server's oEmbed lookup |
| `⌘K` with an article link | Intent offered: cite as a source |
| Deep link `/admin?tab=site` | Dashboard opens on the requested tab |
| Console | No errors, no warnings (`error` + `warn` types queried) |
| Integrity rail → "Show me on the page" | Navigates and outlines the offending sentence |

**Two things this could not be made to prove, disclosed rather than glossed:**
1. **Scroll-following of the rings.** The test surface could not be scrolled, so the passive capture-phase scroll listener is verified by reading, not by observation.
2. **Screenshots.** The capture path failed on hidden visibility in the test environment. Every visual claim in this set is therefore a **measurement** (`getBoundingClientRect()`, served-HTML string checks), not an image.

### E5 — Carousel portrait fit · 3 Nov 2026 (the defect and its verification)
**Reported:** the official campaign portrait in the home carousel was "not fitted to space" — a 4:5 portrait in a 16:9 frame with `object-cover`, losing the subject's head.

**Fix, three layers:** `GallerySlide` gained `orientation` (`src/types/index.ts`) → `SlotMap.slides()` emits it (`src/lib/slots.ts`) → `GalleryCarousel.tsx` chooses the fit per slide: portrait/square `object-contain` over a blurred, dimmed cover backdrop; landscape unchanged `object-cover`; bottom padding against the absolutely positioned caption band.

**A verification failure worth recording, because it is the reason §8 of the workflow file exists:** the first browser measurement reported the *old* classes (`object-contain p-0 sm:p-4`). The build was correct and the browser was stale. Proved by fetching with a cache-buster and string-checking the served HTML for `sm:pb-20`, then re-navigating to the cache-busted URL and re-measuring. **A cached document had nearly been shipped as a fix.**

**Final measured state:**
- Frame 339 px wide; caption band occupying **233 px** of a 339 px frame on desktop.
- Rendered figure **145 × 203** — aspect ratio preserved (4:5), fully contained, head and feet inside the frame and clear of the caption band.
- Landscape slides continue to cover edge to edge.

**Also fixed en route:** an intermediate edit to `slots.ts` produced invalid syntax (a malformed `return` and a swallowed doc comment on `openSlots`), and the `GalleryCarousel.tsx` map callback needed its closing changed from `))}` to `);})}` when the arrow body became a block. Both caught by `tsc`/build before any browser was involved — which is the argument for the parity rule, not for the reviewer.

### E6 — Content and store state · 3 Nov 2026, via the running server
| Fact | Value | Source |
|---|---|---|
| Published photographs | 27, filling 16 of 20 declared frames | media library via `/api/admin/media` |
| Frames deliberately empty | 4, all `exact` (`family-portrait`, `hq-office`, `23-road-inspection`, `community-security`) | `MEDIA_POSITIONS`, `public/images/README.md` |
| Video clips | 7, each id oEmbed-verified | video library |
| Cited press references | 21 | sources library |
| `data/db.json` | 52 KB | filesystem, 3 Nov 2026 |
| `public/` | 13 MB (83 press, 3 generated, 0 uploads) | filesystem, 3 Nov 2026 |
| Integrity | score **40**, `ready: false`, 6 findings, 4 `block` lines | E2 output |
| Evidence attached during this pass | 1 — `fc-ballot.official_document_url` → the FestacOnline flagbearer report | PATCH through the CMS API, verified by fetching the article and confirming it names the party, the office and the constituency |
| Evidence deliberately **not** invented | 4 lines | `a6` indigent healthcare relief, `a11` youth tournament sponsorship, `a12` community vigilante/estate security, `fc-accessible` — none of the 21 references states them; HQ must supply a report or withdraw them |

That last row is a test result as much as anything: a system whose gate can be satisfied by any link would have gone to 100 today. It went up by one line's worth, and the rail still calls the site not defensible.

### E7 — Negative and security probes performed
| Probe | Result |
|---|---|
| `GET /api/admin/health` with no cookie | **401** |
| `POST /api/admin/login` with the wrong password | **401**, no cookie issued |
| `PATCH` emptying an evidence link on a live row | **400**, row unchanged |
| `POST` a record with a `javascript:` evidence URL | **400** |
| `POST` a record with no evidence | **400** |
| Anonymous read of the audit / anonymous write to any admin path | refused (E2) |
| `/admin` in `sitemap.xml` / `robots.txt` | excluded; `noindex` metadata |
| Residual test rows after the gate script | **0 leftover** |

### E8 — Mobile, layout and colour
- **360×740 on every route:** no page-level horizontal overflow; chip rows scroll horizontally instead of wrapping. Verified in a resized browser, route by route.
- **Tap targets:** 44–48 px on nav rows, chips, form fields (`min-h-[44px]`), carousel arrows, social icons, CMS inputs. Inputs 16 px on phones so iOS Safari does not zoom on focus.
- **Sticky thumb bar:** `env(safe-area-inset-bottom)` respected; hidden inside `/admin`; a spacer after the footer keeps it off the footer links.
- **Contrast:** a scripted pass over every page (gradient/pattern backgrounds excluded) reports **no remaining AA failures for body text** after the palette was calmed and `text-gray-400` was retired from light surfaces. **Scope of that claim is limited and must be quoted with the exclusion.**

## 3. Regression set for the next change

Run in this order; total under ten minutes.

1. `npx tsc --noEmit`
2. `npm run build` — compare shared/per-page JS to E3; a jump means something entered a client bundle
3. Kill the port, `npx next start -p 3100`
4. `node scripts/check-cms-gates.mjs` → 12/12
5. E4's Live Desk sequence, in a **fresh** browser context
6. `curl -s http://127.0.0.1:3100/impact | grep -c 'data-ow-missing'` → 0 for a voter (the A9 guarantee)
7. E7's five gate refusals if any validation changed
8. 360×740 sweep if any layout changed
9. Append the dated output to this file

## 4. Not tested — the honest list

| Gap | Why it matters | Cost to close |
|---|---|---|
| **No production-host testing at all** | Every result above is `127.0.0.1`. CDN staleness, header stripping, ephemeral filesystems and TLS are unexercised | One deploy and §3 again |
| **No Supabase-backed run in this pass** | The dual backend is the product's core bet; the file store was the live path here | A project, both migrations, a service-role key, and a save from all nine tabs |
| **No load test** | The burst model in `11-…SPEC.md` §4.1 is arithmetic, not measurement | k6/Artillery against a preview; 500 concurrent readers |
| **No real-network measurement** | TTFB/LCP/INP targets have never been sampled from a Nigerian mobile connection | One afternoon on a phone with throttling plus a Lagos vantage |
| **No penetration or abuse-path review** | 27 admin handlers reviewed against one pattern; only a few are asserted by script | A guard-per-route sweep plus 20 new gate assertions |
| **No WCAG 2.2 audit** — keyboard-only, screen reader, focus order | And a specific known miss: SC 2.2.2 wants an explicit pause/stop for the auto-advancing carousel and animated stat strip (PRD NFR-7, `02-…DISCOVERY.md` §3.1) | A device, an assistive tech, and a week |
| **No WhatsApp-preview check on a Nigerian device** | The site's main acquisition channel is a forwarded link (J1, step 1) | Fifteen minutes and one phone |
| **Scroll-follow of Live Desk rings** | Reported as verified-by-reading only (E4) | A surface that can scroll |
| **Screenshots of any state** | Capture failed on hidden visibility; no visual record exists | Fix the capture path or accept measurements only |
| **`/api/volunteer` under a hanging third party** | The known no-timeout defect (A14, runbook §7.5). Unexercised because it needs a stub server | A local endpoint that never answers; twenty minutes |
| **Concurrent writers on the file store** | The documented scaling limit (B5); unquantified | Two processes, a loop, and a diff |

**Recommendation, priced honestly:** the next testing investment should not be unit coverage. It should be (1) auth assertions for the 27 handlers the script does not cover, (2) the hanging-third-party test, because that defect sits in the campaign's most valuable moment, and (3) one production deploy followed by §3. All three are hours, not weeks.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0 with eight evidence entries; E1/E2/E3 re-run at 13:48–13:49 UTC for this document and quoted verbatim; the browser-cache verification failure and the prerender-manifest correction are recorded as findings, not omitted | i2sltd.tech |
