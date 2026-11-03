# Developer Workflow

**Document:** 08-DEVELOPER-WORKFLOW.md
**Version:** 1.0
**Written:** 3 November 2026
**For:** whoever writes the next line of this codebase — including, soon, the person who inherits it.
**Assumption:** you can already run the project. If not, `04-TECHNICAL-MANUAL.md` Parts 1–2 first.

---

## 1. The first thing to know: there is no version control yet

`ola-western-web` has no `.git` directory. Everything in this document is written assuming you will fix that in the next ten minutes, because no other workflow rule is enforceable without it.

```bash
cd ola-western-web && git init
git status --ignored          # confirm .env.local AND /data are ignored — both already are
git add . && git commit -m "baseline: campaign platform as verified 3 Nov 2026"
git branch -M main
```

Consequences of the missing history that are worth feeling before you dismiss them: no bisect, no revert, no diff review, and a documentation set that maintains its own change logs because the code cannot. Three defects fixed during this project (the ring duplication, the carousel fit, the `slides()` return shape) are known only from this set's prose. `.gitignore` already excludes `/node_modules`, `/.next`, `/out`, `/data` and `.env*.local`, which is why committing a resident's phone number has not happened — that line doing the work, not a conversation anyone had.

**One exception to "commit everything":** `/data` stays out of the repository in every environment. The file store is *state*, not configuration. Seeded content lives in `src/lib/content.ts`; the live store with real leads does not belong in git history, ever.

## 2. Environments and parity

| Env | How | Store | What it is valid for |
|---|---|---|---|
| `dev` | `npm run dev` | `data/db.json` | Writing and thinking |
| `verify` | `npx tsc --noEmit` → `npm run build` → `npx next start -p 3100` | `data/db.json` | **Anything you intend to claim works** |
| `preview` | per-PR host build | throwaway | Visual review; must be `noindex` |
| `production` | chosen host | Supabase (recommended) or file store | The campaign |

**The parity rule, and it is not pedantry:** `npm run dev` has no route cache, no prerender manifest, and a different performance profile. Behaviour you observed only in dev is not observed. A change touching ISR, `revalidatePath`, image optimisation, caching headers, or anything about "when does the page update" is **invalid until tested on `next start`**. This rule exists because a verification pass in this project read a browser-cached document and reported classes that were no longer in the build — the finding was wrong, the confidence was real, and the cache-busting step in §8 is the scar tissue.

## 3. Branches, commits, and the shape of a change

Until there is a team, this is a solo discipline; after there is a team, it is the only thing that keeps a campaign site reviewable at 2 a.m.

```
main                     ← always deployable; deploys on merge
  feat/<what>            ← one behaviour, one PR
  fix/<what>             ← one defect, with the reproduction in the description
  chore/<what>           ← no behaviour change; say which
docs/<what>              ← documentation only; yes, it is a change
```

**Commit message convention** (the repository's existing history is empty, so this is a founding rule, not a style import):

```
<area>: <what changed, imperative, ≤72 chars>

<why — one paragraph. A future reader knows what; they do not know
 whether it was deliberate.>

Refs: <ADR / PRD FR / issue>
```

Example, real for this project:

```
ui(carousel): fit follows the photograph, not the frame

A 4:5 campaign portrait forced into the 16:9 slide with object-cover
lost roughly two-thirds of its height and the head went first. The strip
keeps one frame shape so it cannot jump under the reader's thumb; the
fit is now chosen per slide from GallerySlide.orientation, and contained
images get bottom padding measured against the caption band (233px of a
339px frame on desktop).

Refs: ADR-019, FR-17
```

**A change is one coherent thing.** Three rules that have already been broken usefully in this project, and should be broken knowingly:

1. Do not mix a data mutation with a code change in one commit. Attaching a source URL to a Truth Room row through the API is an editorial act with its own record; it belongs in the content log (`00-DOCUMENT-INDEX.md` change log), not in a diff.
2. Do not "while I'm here" a validation change into a layout change. A validation change can refuse content the desk has already published; that is a different conversation.
3. A new editable field is exactly two lines: one `data-ow` attribute and one registry entry. If it is more than two, something is wrong (§5.1).

## 4. Conventions that are load-bearing in this codebase

These were observed in the existing code, not invented here. Deviating from them is allowed; doing it silently is not.

**Comments explain *why*, in prose, and are written to a person who inherits the project.** The codebase's comment style is unusually disclosive — `GalleryCarousel.tsx` justifies its padding numerically against a measured caption band; `store.ts` explains why reads and writes use different keys; `PhotoSlot.tsx` says why a broken image is worse than a branded panel. Match it. A comment that restates the code is noise; a comment that records the tradeoff is the only place the tradeoff survives.

**Server components by default.** A page becomes a client component only when it must own interactivity. `src/lib/revalidate.ts` is kept out of client bundles on purpose — importing `next/cache` into a client component throws.

**No client component reads the store.** Data access is server-side (`src/lib/store.ts`), so the RLS and `toPublic()` rules cannot be bypassed by a clever component.

**Every refusal sentence belongs to the route.** `src/lib/cms.ts` is the single home of input rules and `EVIDENCE_RULE` is one string. The Live Desk shows the route's own wording, never a reworded one (ADR-010). If a message appears twice in two places, one of them is about to drift.

**Validation before storage, always server-side.** Lengths capped, dates ISO, years plausible, links real `http(s)` (a `javascript:` URL is refused), unions closed (verdicts, categories, sources, platforms), and `slot` must name a frame the site actually renders. Never validate in the component and trust it.

**Handlers:** all `/api/**` declare `dynamic = 'force-dynamic'`; every `/api/admin/**` handler starts with `isAdminRequest(req)` and returns `unauthorized()` — there is **no middleware**, so this check is per-route and forgetting it is possible. The gate script exists because that forgetting is the highest-severity bug available here. Only `media/upload` declares `runtime = 'nodejs'`.

**Ids are readable text, kebab-case** (`gfx-mandate`, `vid-tvc-flagbearer`, `soc-x`, `a12`, `fc-3`, `site`), because they appear verbatim in `data-ow` attributes, in tombstones, and in a journalist's URL. Minting a duplicate id is a real risk here, not a theoretical one.

**Frames are kebab-case and semantic** (`hq-office`, `town-hall-festac`, `23-road-inspection`). A frame that names a place, person or event carries `exact: true` (ADR-012).

**Types live in one place:** `src/types/index.ts`. A new stored shape gets a type there and, on Supabase, a migration — both, or the two backends diverge (ADR-002).

**No new runtime dependency without a number.** Bundle impact goes in the PR description: `npm run build` before/after, the shared-JS and per-page lines. Four runtime dependencies is the current position (ADR-028), and the reason is a phone on a data plan, not elegance.

**Never hand-edit `data/db.json`** (see manual Part 8), and **never write a script that mutates the store by editing the file.** `scripts/publish-press-photos.mjs` and `publish-broadcast-videos.mjs` mint the same session cookie the dashboard uses and POST through `/api/admin/**`, so slot validation, tombstones and revalidation all still apply. That is a deliberate design choice — the gate is bypassable the moment a script touches the file — and a new script must follow it.

**The prohibited capabilities stay prohibited.** Donations, voter-roll import, automated posting, scheduled publishing, generative claims, AI imagery of the candidate: absent from the codebase by decision (ADR-026, PRD §12). A PR reintroducing any of them is not a feature review; it needs a written decision from HQ and, for donations, counsel.

## 5. Recipes

### 5.1 Add an editable field (2 lines)
1. Put `data-ow="settings.hero_title"` (or `record.<id>.<field>`, `media.<id>.caption`, `press.<id>.<field>`, `fact.<id>.<field>`) on the element that renders the value. If the visible text is an animation or a badge, also emit `data-ow-value` with the real value.
2. Add one entry to `FIELDS` in `src/lib/liveDesk/contract.ts`: `label`, `kind` (`text|area|url|choice|boolean`), `max` (**the route's real ceiling**), `options` for `choice`, `hint`, `attested: true` if the value is a public statement about a real person, and `send()` returning `{path, method, body}`.
3. If the value lives inside a stored array (the stat strip), set `inArray` and make `send()` patch the whole array.
4. Confirm the route validates and calls the right `revalidatePath`. That is the change. **There is no step 4 for a new UI** — that is the whole design (ADR-009).

### 5.2 Add a photo frame
`MEDIA_POSITIONS` in `src/lib/content.ts` → `{ slot, label, ratio }` (+ `exact: true` if it names a place/person/event). The picker, the CMS, the slot validator and `public/images/README.md` all learn it from that registry. Then render it with `<SlotImage slot="…" exact …>` or `PhotoSlot` so the desk can reach it.

### 5.3 Add a public page
`src/app/<name>/page.tsx` (server component) → add the route to `COPY_PAGES` / `MEDIA_PAGES` in `src/lib/revalidate.ts` or CMS writes will not refresh it → metadata + OG → confirm it is in `sitemap.ts` and reachable from the nav → verify at 360×740 → check the contrast pass → add it to `07-USER-STORIES-AND-JOURNEYS.md`.

### 5.4 Add an admin endpoint
Guard first (`isAdminRequest` → `unauthorized`), validate in `cms.ts`, write through `store.ts` (never the file directly), revalidate, and return the route's own refusal wording. Then: document it in the README API table and in `DEPLOYMENT-GUIDE.md` Appendix A, and **add an assertion to `scripts/check-cms-gates.mjs`** proving an anonymous caller cannot use it.

### 5.5 Change a validation rule
Ask which already-published rows the new rule refuses. The publish gate's precedent: rows created before the gate stay editable (refusing a typo fix keeps a wrong sentence live) but are graded `block` until compliant. **A stricter rule must come with a plan for the existing data**, or the desk discovers it in production.

### 5.6 Add a stored field
`src/types/index.ts` → file-store default in `content.ts` (with the same `SEED_VERSION` bump so a live store receives it) → migration in `supabase/migrations/` → the route's validation → the type on the response. Missing any one of these is how the two backends quietly disagree.

## 6. Reviewing a change — the checklist that actually catches things

**Before reading a line of logic:**
- [ ] Does an `/api/admin/**` handler exist without `isAdminRequest`? (Highest severity available here.)
- [ ] Did anything get imported into a client component that reads the store or `next/cache`?
- [ ] New `runtime` dependency? Bundle numbers in the description?
- [ ] Does the change touch `/data`? It must not.
- [ ] Any secret, password or token literal added to a tracked file?
- [ ] `NEXT_PUBLIC_*` prefix on something that should never reach a browser? (Service-role key: no.)

**Then, the domain questions:**
- [ ] Can a claim be published without its evidence through this path? If yes, reject.
- [ ] Can a stand-in photograph land in an `exact` frame? If yes, reject.
- [ ] Does the public HTML change for an unauthenticated visitor? Rings, dock, listeners, `data-ow-missing` visibility: none of it may appear (ADR-015).
- [ ] Does a resident's name, phone or consent reach any public response? `toPublic()` and RLS both.
- [ ] Does a photo or video load third-party bytes before a tap?
- [ ] Does a save revalidate every page that renders the value? Check `revalidate.ts` arrays, not the handler's intention.
- [ ] Does the refusal wording come from the route?
- [ ] On a Supabase store, does the write path have a service-role key, or will it half-write?

**And the two that only this project asks:**
- [ ] Does the change make the integrity score easier to farm, or the gate easier to bypass? Both are the product.
- [ ] Does the diff contain a comment explaining *why*? If a non-obvious decision has no comment, it has no future maintainer.

## 7. Pipeline

`.github/workflows/deploy.yml` as committed is **not fit to ship on**: it uses the archived `amondnet/vercel-action@v25` and passes only the two public Supabase secrets — so a build through it has no `ADMIN_PASSWORD`, no `ADMIN_SECRET`, no `WAR_ROOM_SECRET_KEY` and no WhatsApp credentials. `DEPLOYMENT-GUIDE.md` §15.2 has the replacement shape. The two non-negotiables in it:

1. **Gate the artefact, not the source.** Build → `next start` → `BASE=127.0.0.1:3000 node scripts/check-cms-gates.mjs` → deploy → gate again against the live URL.
2. **Pass every production secret**, scoped to a protected environment with a required reviewer.

The gate script writes and deletes one throwaway row, so CI needs a writable store and real credentials, or the check silently cannot run. Add `npx tsc --noEmit` before `npm run build` — the current workflow folds types into the build, which is fine, and a separate step is faster to read.

## 8. Verification protocol

Not "it worked for me". The sequence that has actually found things in this project.

1. `npx tsc --noEmit` → silent.
2. `npm run build` → read the route table; note the shared/per-page JS numbers and compare them to §4's expectation.
3. Kill anything on the port (`netstat -ano | grep :3100`, `taskkill //PID <pid> //F`); start **one** `npx next start -p 3100`.
4. `node scripts/check-cms-gates.mjs` → 12/12.
5. Browser, signed in, then **in a private window with no cookies** for everything that concerns a voter. The private window is not optional — the last time we skipped it we reported a fix that was not in the document being read.
6. For "the page did not update": fetch with a cache-buster and grep the served HTML for the new string **before** touching code — `fetch('/?cb=' + Date.now(), {cache:'reload'})`. Distinguish browser cache / Next route cache / CDN edge, in that order (manual §7.3).
7. For layout: resize to 360×740 and confirm no horizontal overflow; measure the element in question with `getBoundingClientRect()` when a claim about fit or clearance is being made. The carousel fix was verified by a 145×203 figure inside a 339px frame with a 233px caption band, not by a screenshot.
8. For the overlay: `⌘E`, edit, save, `⌘Z`, restore, and confirm zero console errors (`list_console_messages`, types error+warn).
9. **Voter test** (`DEPLOYMENT-GUIDE.md` §16.4): private window shows the new value; no ring markup; `GET /api/admin/login` cookie-less returns `authenticated:false`; `GET /api/admin/health` returns 401. If the markup check fails, treat it as a security incident, not a cosmetic one.
10. Record what was run, on what date, with what observed output — in `09-QA-AND-TEST-EVIDENCE.md`, not in your head or in a commit message.

## 9. Definition of done

A change is done when all of these are true:

- Steps 1–9 above have been run on the production build, and the results are written down.
- No unsourced claim, stand-in `exact` frame, or third-party byte-before-tap was introduced.
- Every new public refusal comes from a route and is testable.
- Docs updated, in this order of obligation: `README.md` if behaviour changed; an **ADR** in `03-ARCHITECTURE-DECISIONS.md` if a decision was made (never overwrite a superseded one); `04-TECHNICAL-MANUAL.md` Part 5 if a new failure mode exists; `01-PRD.md` if a requirement changed; `05-OPERATIONS-RUNBOOK.md` if an operator action changed; `00-DOCUMENT-INDEX.md` change log with a date.
- The integrity score moved in the right direction, or the reason it did not is written down.
- New secrets are in `.env.example` with a comment; **never** in a committed file.
- A rollback exists: one `git revert`, or a previous artefact. With no version control, it does not — see §1.

## 10. Known landmines

| Landmine | How it bites |
|---|---|
| Browser cache during verification | Reports the old build as broken/fixed. Bust it, then conclude |
| `next/cache` imported into a client component | Build-time throw |
| Two `next start` processes on one port | `EADDRINUSE`/`errno -4091`, exit 1, and a confusing "server failed" |
| Project under OneDrive/AV file locking | `EPERM` on atomic rename; the store retries, then falls back in place |
| `timingSafeEqual` with unequal lengths | Throws instead of returning false — length is compared first, do not "simplify" it |
| Arbitrary third-party URL handed to `next/image` | 500 from the optimiser; `remotePatterns` allows only the campaign's bucket and Cloudinary, so `PhotoSlot` renders remote as plain `<img>` |
| Fixed-offset image dimension reads | Nigerian press serves WEBP under `.jpeg` names; a naive read returns 682×11582 and poisons orientation. WEBP must be walked as RIFF chunks |
| `force-dynamic` missing on a handler | A cached response to a session-aware endpoint |
| New page absent from `revalidate.ts` | Saves "succeed"; the page never changes |
| Unknown `slot` accepted | An orphan photo bound to nothing. The route refuses it; keep refusing it |
| Duplicated `data-ow` rings | One ring per field, first visible instance wins (`chrome.tsx`'s `seen` set) — found by testing, not review |
| Multi-instance on the file store | Silent lead loss; and revalidation only invalidates the instance that received the call |
| Awaiting third parties in `/api/volunteer` | Known open defect, no timeout. Do not add another inline await to a public capture path |
| A pretty "clear the evidence field" convenience | Deletes the campaign's defence. The route refuses it; UI must not offer it |

## 11. Handover

A new engineer is productive from: `00-DOCUMENT-INDEX.md` (precedence) → this file → `04-TECHNICAL-MANUAL.md` → `03-ARCHITECTURE-DECISIONS.md` → `DEPLOYMENT-GUIDE.md` → `05-OPERATIONS-RUNBOOK.md`, plus credentials and hosting access. If any of those is missing, the handover is a conversation, and conversations do not survive campaigns.

Their first three tasks, in order: (1) `git init` and the baseline commit, (2) run §8 end to end and write the results into `09-QA-AND-TEST-EVIDENCE.md`, (3) add the missing timeout to `/api/volunteer` — small, real, and it touches the campaign's most valuable moment.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0: repo-state warning, parity rule, branching and commit founding conventions, 8 load-bearing codebase conventions, 6 recipes, review checklist, pipeline defects, 10-step verification protocol, definition of done, 14 landmines, handover | i2sltd.tech |
