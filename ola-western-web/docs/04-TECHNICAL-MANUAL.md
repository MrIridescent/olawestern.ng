# Technical Manual — Setup, Operation and Troubleshooting

**Document:** 04-TECHNICAL-MANUAL.md
**Version:** 1.0
**Written:** 3 November 2026
**Audience:** an engineer setting the project up cold; a campaign desk member who has been told they are now responsible for the website
**Companion:** `DEPLOYMENT-GUIDE.md` covers hosting choices; this file covers *doing things*.

> **Style.** Numbered steps, exact commands, expected output, and what to do when the output is not what was expected. Where a step is Windows-specific it says so — the primary machine for this project is Windows with Git Bash, and at least one failure mode below exists only because of that.

---

## Part 0 — Five minutes to understand the system

Read this before touching anything; it prevents most of the confusion in Part 5.

There is **one app**. It serves eleven public pages, one dashboard, and thirty-four API endpoints from a single Next.js process.

There is **one store**. Either `data/db.json` on disk (default, needs no account) or Supabase Postgres (needs three env vars). You do not choose per feature; the app chooses by looking for credentials, and tells you which one it picked on the `/admin` header.

There is **one write path**. Every change — from the dashboard, from the Live Desk overlay, from a script — goes through the same `/api/admin/**` route, which validates, saves, and invalidates the affected page cache. There is no second way to change content, which is why the validation cannot be worked around by using a cleverer UI.

There are **two editing surfaces**: `/admin` (nine tabs, good for bulk) and the public pages themselves (Live Desk, good for one sentence at 11 p.m.). They are the same tool wearing different clothes.

There is **one gate**: no service-record entry and no Truth Room ruling can be created without the link to the report that evidences it. You can fix the link, you cannot delete it. To remove a claim you delete the row.

Two things do **not** exist and are not hidden: a donation path, and any automated posting or account tooling.

```
Browser ──GET /impact──▶ Next.js server component ──reads──▶ store (db.json | Supabase)
Desk     ──⌘E, tap, Save─▶ /api/admin/record [id]  ──validates──▶ store
                                   └── revalidatePath('/impact') ──▶ router.refresh() redraws the page
```

---

## Part 1 — Prerequisites

| Need | Version | Check | Notes |
|---|---|---|---|
| Node.js | 18.17 or newer (20 LTS recommended) | `node -v` | Next 14 App Router will not build on 16.x |
| npm | ships with Node | `npm -v` | The lockfile is `package-lock.json`; use npm, not pnpm/yarn, or you will fight the lock |
| Git | any recent | `git --version` | **This project is not currently a git repository** — there is no `.git`. See Part 6, step 1 |
| Disk | ~600 MB free | — | `node_modules` 287 MB + `.next` 100 MB + `public/` 13 MB, with working room |
| A browser you can resize | Chrome/Edge/Firefox | — | Verification at 360×740 is part of the routine, not optional |
| Optionally | a Supabase project | — | Only if leaving the file store |

No database server, no Docker, no image library, no native toolchain. That is deliberate (ADR-002, ADR-017).

---

## Part 2 — Install and run

### 2.1 Fresh setup

1. `cd ola-western-web`
2. `npm install`
   Expected: ends with `added NNN packages`. If it fails on a Windows OneDrive-synced Desktop path with `EPERM`, move the project out of the synced folder — this is an environment problem, not a project one.
3. `cp .env.example .env.local` (Git Bash) or `copy .env.example .env.local` (cmd).
4. Open `.env.local` and set **only** this line for now:
   ```
   ADMIN_PASSWORD=<at least 8 characters, yours>
   ```
   Leave Supabase blank. The app runs on the file store.
5. `npm run dev`
6. Open `http://localhost:3000`. Expected: the home page with hero copy, a stat strip, the photo carousel, a Truth Room preview, a newsroom preview, and a footer reading "developed by @i2sltd.tech".
7. Open `http://localhost:3000/admin`. Expected: a login card. Sign in with the `ADMIN_PASSWORD` you set.

### 2.2 Running the way production runs

`npm run dev` is not representative: it has no route cache, no prerender manifest, and different performance. Do this before concluding anything works or is slow.

1. `npx tsc --noEmit` → expect silence. Any output is a type error and must be fixed before continuing.
2. `npm run build` → expect the route table printed. Look for the two facts that matter: pages listed as `○` (prerendered/ISR) and handlers as `ƒ` (dynamic).
3. `npx next start -p 3100` → serve the built app on 3100.
4. `Invoke-RestMethod http://localhost:3100/api/admin/login` (PowerShell) or `curl -s http://localhost:3100/api/admin/login` → expect `{"success":true,"authenticated":false}`. That single response proves the server, the store, and the auth probe are all alive.

**One server per port.** On Windows, a second `next start` on the same port dies with `errno -4091` / `EADDRINUSE`. Before starting, find and stop the listener:
```bash
netstat -ano | grep :3100 | grep LISTEN     # note the last column = PID
taskkill //PID <pid> //F                    # Git Bash needs the double slash
```
Then start exactly one background server and leave it alone.

### 2.3 Verify the install is genuinely functional

1. `node scripts/check-cms-gates.mjs`
   Expected: **12/12 passing**, ending with a statement that nothing was left behind. The script reads `ADMIN_PASSWORD` from `.env.local`, never prints it, logs in, checks that an anonymous caller cannot read the audit or write, checks the publish gate refuses a sourceless row and a `javascript:` URL and accepts a sourced one, then deletes the throwaway row it made.
2. If any check fails, stop and read Part 5 before changing code. The script is the closest thing this project has to a test suite, and it is also the release gate in `12-…CHECKLISTS.md`.

---

## Part 3 — Configuration reference

Set in `.env.local` (dev) or the hosting environment (prod). `.env.example` carries the same comments.

| Variable | Required | Default if unset | Effect |
|---|---|---|---|
| `ADMIN_PASSWORD` | **Yes in production** | Dev: `ola-admin-2026` with a console warning. Prod: empty ⇒ **every login fails** | The CMS credential. ≥8 chars is enforced by the code, not by advice |
| `ADMIN_SECRET` | Yes in production | Falls back to `ADMIN_PASSWORD`, then to a literal dev secret | Signs the session cookie. Set a long random string so sessions survive a password rotation |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Both unset ⇒ file store | Switch the whole app to Postgres. Reads use these |
| `SUPABASE_SERVICE_ROLE_KEY` | Required once Supabase is configured | — | All writes. Without it, `/admin` saves fail rather than half-write. **Never in a `NEXT_PUBLIC_*` name** |
| `DATA_DIR` | No | `./data` | Where `db.json` lives. Point at a mounted volume on any container/VPS host |
| `WAR_ROOM_SECRET_KEY` | Only if the War Room syncs | Dev: `warroom-dev` | Bearer secret for `POST /api/truth-room/sync` |
| `WAR_ROOM_WEBHOOK_URL` | No | unset ⇒ the lead push is skipped | Where `/join` leads go |
| `WHATSAPP_CLOUD_API_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` | No | unset ⇒ welcome message silently skipped, logged | Volunteer welcome |
| `NEXT_PUBLIC_SITE_URL` | Yes | — | Canonical URLs, `sitemap.xml`, OG tags |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes | — | Every "Chat on WhatsApp" link |
| `NEXT_OUTPUT=export` | Build-time only | — | Static preview bundle (Part 7) |
| `NEXT_PUBLIC_SITES_DEMO=1` | Preview builds only | — | Honest "preview build" notice on capture forms |

Generate secrets with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Rotate before public deployment: `ola-admin-2026` and `warroom-dev` must not exist in a production process.

---

## Part 4 — Operating the content

### 4.1 The three ways to edit, and which one to use

| Task | Use | Why |
|---|---|---|
| Change one sentence, caption or headline | **Live Desk** | You see the result in the layout |
| Attach/replace/remove a photo in a named frame | **Live Desk**, tap the frame | The picker shows the crop each candidate would suffer |
| Paste a YouTube link onto the shelf | **⌘K** | It resolves the id and prefills title/outlet from YouTube |
| Paste an article link to cite it | **⌘K** | Becomes "cite this as a source" |
| Bulk photo import, many captions, triage 40 leads | `/admin` | Tables, filters, CSV export |
| Anything structural (a new frame, a new page) | `src/lib/content.ts` + a deploy | Not editorial |

**Live Desk, step by step.**
1. Sign in at `/admin`, then go to any public page.
2. Press `⌘E` (or `Ctrl+E`). Expected: thin rings appear around every editable element on the page. Nothing changes for a visitor — the overlay only exists for your signed-in tab.
3. Click a headline. Expected: a sheet opens with the field's real label, the current text already in the box, and a counter showing the route's actual maximum.
4. Edit, then **Save**. Expected: the page redraws in place with your text, scroll position kept, no reload.
5. Made a mistake? `⌘Z`. Expected: the previous value is sent back through the same route. Undo is for this session only — durable recovery is the backup (Part 8).
6. `Esc` closes a field; `⌘E` again disarms the desk; `⌘K` opens the command deck.

**Rules you will hit and should not be surprised by.**
- Saving a headline empty is refused. The counter is the truth; there is no hidden longer limit.
- A link field refuses anything that is not real `http(s)`. A `javascript:` URL produces the route's own one-sentence refusal, in the sheet, verbatim.
- A photo caption on a *frame that names a place or person* cannot be filled from the library. The picker tells you it needs an upload. That is the `exact` rule (no stand-in photographs of a real office or a real road).
- The gate: a new track-record entry or Truth Room ruling needs its evidence link. The refusal is identical whether you come from the tab or the page, because it is the same route.

**`/admin`, tab by tab.** Truth Room · Newsroom · Track Record · Sources · Photo Library · Video · Site Copy (homepage message / candidate file / official channels) · Help Desk · Leads Inbox. Every tab's save revalidates the public page it feeds; you do not rebuild anything. The Leads Inbox exports CSV; volunteer CSV includes the consent timestamp.

### 4.2 Photos — filling a frame by hand

1. `/admin` → Photo Library → Upload. JPEG/PNG/WebP/GIF, at least 40 px per side, no more than 10 MB. The type is decided from the file's bytes, not its extension.
2. Expected response: the stored path plus measured `width × height` and a derived `orientation`, and a suggested alt string.
3. Bind it to a frame. The frame list is the 20 names the site actually renders; an unknown slot is a validation error, not an orphan.
4. Check the crop the frame will make. Below ~34% loss is fine. Above it, the photo belongs on the gallery wall, not in that frame.
5. Set caption, credit (the outlet that took it), source link, published and featured. Publish.

### 4.3 Photos — filling many frames from the press archive

These scripts are how the current 27 photographs were filed. They are optional for daily operation and mandatory for a bulk refresh.

```bash
node scripts/harvest-press-media.mjs            # pass 1: the og:image of each article in the dossier
node scripts/harvest-press-extra.mjs            # pass 2: every content image in every article
node scripts/harvest-press-extra.mjs --offline  # re-probe files already on disk; rewrites sizes, no network
node scripts/harvest-press-extra.mjs --only <outlet-a>,<outlet-b>   # specific outlets, merged into the manifest
node scripts/publish-press-photos.mjs           # DRY RUN: what would go where, and the crop each frame makes
node scripts/publish-press-photos.mjs --apply   # file them through the real CMS API
node scripts/publish-broadcast-videos.mjs       # register verified TV/blog clips through /admin/videos
```

Order that actually works, with the reasons:

1. **Dry run first, always.** It prints the destination frame and the crop percentage for each candidate and refuses anything above 34%. Read it before you apply.
2. `--apply` writes through `/api/admin/media` using the same HMAC cookie the dashboard uses. It does not touch `db.json` directly, which is why slot validation, tombstones and `revalidateMedia()` still apply. If someone ever hands you a script that edits `data/db.json`, do not run it: you will lose the tombstone list and a withdrawn photo will come back.
3. Re-runs are idempotent and leave desk edits alone unless `--refresh`.
4. Panoramic strips (long side more than 6× the short side) are dropped as banners. If a photo you expected is missing, that is usually why.
5. **If dimensions look insane** — 682×11582, or a portrait that behaves like a banner — run `harvest-press-extra.mjs --offline`. Nigerian press sites on WordPress/Jetpack serve WEBP bytes under `.jpeg` names, and anything reading fixed offsets returns garbage. `--offline` re-probes what is already on disk and repairs the manifest in place, without re-downloading from the outlets.
6. **Captions state only what the report states.** Never write "at the ward rally with residents" because the photo looks like it. If the article does not put the candidate in the picture, the caption does not either.

### 4.4 Videos

1. Press `⌘K` on any page and paste a link — `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…`, or a bare 11-character id.
2. Expected: the deck offers "publish this clip to the shelf" with the resolved id.
3. On save, **the server asks YouTube's oEmbed whether the video exists and allows embedding**, and only then stores it. Meanings: 401/403 → embedding is disabled by the owner; 404/400/410 → wrong link. The desk is told which.
4. The shelf renders a `hqdefault` thumbnail and injects the `youtube-nocookie` iframe **only after a tap**. Nothing is downloaded from Google until a supporter asks for it.
5. YouTube being down does not block you: the lookup has a 6-second abort, and failure is an error message rather than a hung request.
6. A channel's worth of clips is registered by `publish-broadcast-videos.mjs`, which uses individually verified ids — the campaign's own channel handle is still unconfirmed, and the site deliberately lists no channel until HQ confirms it.

### 4.5 Truth Room and the record

1. A new ruling: `/admin` → Truth Room, or tap the ruling's position on `/truth-room`. Verdict is one of `VERIFIED FACT`, `FALSE CLAIM`, `MISLEADING`.
2. **Evidence link is mandatory.** Paste the report or document that states the claim. "Mentions the candidate" is not the bar; the report has to state the claim. (A ballot-emergence story qualified for a flagbearer ruling because it names the party, the office and the constituency.)
3. `/impact#sources` is the public reference library, maintained from the Sources tab: outlet, headline, date/year, URL. 21 links today, filterable by outlet and year.
4. To retract: unpublish or delete. **Do not clear the evidence field to soften a claim** — the route will refuse it, and it should.

### 4.6 The integrity rail

1. On any signed-in page, open the rail (or `GET /api/admin/health`).
2. Read the score. `100 − Σ min(WEIGHT × ceil(count/3), WEIGHT × 3)` with `block 18 / warn 7 / info 2`. Grouped and capped on purpose: three unsourced claims and thirty cost the same, and deleting one ugly line does not buy you points.
3. Expand a finding → it lists the individual lines. Press **"Show me on the page"** → the browser navigates and outlines the offending sentence. Findings with no public sentence open the CMS tab that holds them.
4. Current real state (3 Nov 2026): **40 / not ready**, 6 findings, **4 published lines graded `block`** — three track-record entries and one Truth Room ruling. That is the site telling the truth about itself. The fix is evidence or withdrawal, not a code change.

---

## Part 5 — Troubleshooting, by symptom

| Symptom | Cause | Fix |
|---|---|---|
| `/admin` login says invalid credentials, password is right | The server was started before `.env.local` was edited, or `ADMIN_PASSWORD` is shorter than 8 chars and the dev fallback is in use | Restart the server; env vars are read at boot. Check the console for the `[admin] ADMIN_PASSWORD not set` warning |
| Cannot log in at all in production, no error | `ADMIN_PASSWORD` unset ⇒ `adminPassword()` returns `''` ⇒ fail closed by design | Set the variable. This is the intended behaviour (ADR-007), not a bug |
| Every CMS save returns 401 after a while | 12-hour cookie TTL expired | Log in again. Rotate `ADMIN_SECRET` to end all sessions at once |
| `/admin` header says writes are not possible | Supabase configured without `SUPABASE_SERVICE_ROLE_KEY` | Set it, or unset all Supabase vars to return to the file store |
| `npm run build` fails: *"use of `next/cache` in a client component"* or similar | `revalidatePath` imported into a `*.tsx` with `"use client"` | Revalidation happens in the route handler (`src/lib/revalidate.ts`). Move the call server-side |
| Save succeeds but the page still shows the old text | Browser cache, not the build. This has happened and cost real debugging time | Hard-reload, or fetch with a cache-buster (`/?cb=123`) and grep the HTML for the new class/text before concluding the code is wrong |
| A photo appears with the subject cropped out | The frame's ratio and the photo's orientation disagree and `object-cover` is doing it | In the carousel this is already handled per-slide by `orientation`. Elsewhere, choose a frame with a matching ratio or bind a differently-shaped photo |
| An off-site press image renders as a broken image | A third-party URL given to `next/image` while `remotePatterns` allows only the campaign's own bucket and Cloudinary | `PhotoSlot` renders remote URLs as a plain `<img>` — check the URL starts with `http` and that the field is `src`, not a local path |
| `errno -4091`, `EPERM` on a write (Windows) | Antivirus, OneDrive sync, or an editor holding `db.json`. The store retries and falls back in place; a total failure means something is holding the file | Close the file in every editor and shell; move the project out of the synced Desktop if it repeats |
| `EADDRINUSE` / `errno -4091` on `next start` | Another server on that port | `netstat -ano \| grep :3100` then `taskkill //PID <pid> //F`; start exactly one |
| `/api/volunteer` hangs, or a submission takes many seconds | The handler `await`s War Room + WhatsApp with **no timeout**, despite the comment calling it fire-and-forget | Known defect (see `05-OPERATIONS-RUNBOOK.md` §7). Workaround: unset `WAR_ROOM_WEBHOOK_URL` and the WhatsApp credentials — both skip silently — until the timeout is added |
| An image "too small" warning on a frame | Real: the library holds press photos below 700 px on the long edge, and the rail reports 4 of them | Move them to the gallery wall or upload a larger file. Do not override the warning by hand |
| A withdrawn photo came back after a deploy | The `removed` tombstone list was lost — usually a hand-edited `db.json`, or `DATA_DIR` pointing somewhere new | Restore the store file that has the tombstones. Never hand-edit `db.json` (Part 8) |
| A form says "preview build" and does nothing | `NEXT_PUBLIC_SITES_DEMO=1` — you are on the static export, which has no server | Expected. Use the SSR build for anything real |
| Static export renders huge unoptimised images | `unoptimized: true` is forced in export mode because a static host cannot run the optimiser | Expected; do not "fix" it by removing the flag |
| Live Desk rings are missing on a value that should be editable | The element carries no `data-ow`, or the registry has no entry for that field | Add one attribute to the element and one spec to `src/lib/liveDesk/contract.ts`. Nothing else |
| Two rings around the same field | Known-then-fixed: one ring per `data-ow`, first visible instance wins. If you see it again, the dedupe broke | Check `chrome.tsx`'s `seen` set |
| Health score dropped but nothing looks different | A new finding landed in an existing `block`/`warn` group, or a photo fell under a size threshold | Expand the findings; the rail lists lines, not just counts |

---

## Part 6 — Working on the code

**Step 1, before anything else: make it a repository.**
`ola-western-web` has no `.git`. That is the single largest operational risk in this project — no history, no bisect, no revert, and a documentation set that keeps its own change log because the code cannot.

```bash
cd ola-western-web
git init
git add .gitignore            # present and already correct: /node_modules, /.next, /out, /data, .env.local
git add .
git commit -m "baseline: campaign platform as verified 3 Nov 2026"
git branch -M main
```
`.env.local` is ignored by the existing `.gitignore`, and so is `/data` — verified on 3 Nov 2026. **That second line is what keeps residents' phone numbers out of the repository, and it is also why the backups in Part 8 are the only copy of that data.** Confirm both with `git status --ignored` before the first push, and never add `data/db.json` "so the team can see it".

**Where things go.**
- New page → `src/app/<name>/page.tsx` (server component) + add it to the relevant array in `src/lib/revalidate.ts` so CMS writes refresh it.
- New editable field → one `data-ow` attribute on the element + one entry in `src/lib/liveDesk/contract.ts`. That is the whole change (ADR-009).
- New image frame → `MEDIA_POSITIONS` in `src/lib/content.ts` (name + ratio + label) → the CMS and the picker learn it automatically, and the slot validator accepts it.
- New admin endpoint → guard with `isAdminRequest(req)` and return `unauthorized()` otherwise. There is no global middleware on purpose, so the check is per-route and forgetting it is possible — which is why the gate script tests it.
- Validation of anything a human can type → `src/lib/cms.ts`. Never in the component.

**Conventions that are load-bearing** (full list in `08-DEVELOPER-WORKFLOW.md`): server components by default; no client component that reads the store; comments explain *why* and are written as if to a person inheriting the project; every user-visible refusal comes from the route; no dependency added without measuring the bundle.

---

## Part 7 — Builds and artefacts

```bash
npm run build                 # the SSR production build (the product)
NEXT_OUTPUT=export npm run build   # the frozen static preview bundle → out/
node scripts/sites-export.mjs      # post-process the export for the pitch host
```

Read the build output for the numbers that matter: shared first-load JS (87.2 kB) and per-page (87–102 kB). If either jumps, look at what was imported into a client component.

The static export is a **preview artefact only**: no handlers, no headers, no image optimisation, forms honestly disabled (ADR-030). Never present it as the deployed site.

---

## Part 8 — Data operations

### 8.1 Backup (the whole procedure)

Everything that must survive is two paths:

```bash
cp data/db.json "backups/db-$(date +%Y%m%d-%H%M).json"
tar -czf "backups/public-$(date +%Y%m%d-%H%M).tar.gz" public/    # or just public/images/uploads
```
On a host with `DATA_DIR=/data`, back up `/data`. Take the copy off the machine. On the file store, **one JSON file and one folder is the entire blast radius** — that is a genuine advantage of ADR-002 and the reason restore time is minutes rather than an exercise.

### 8.2 Restore

1. Stop the server (the file store caches in-process and writes on save).
2. Replace `data/db.json` and/or `public/images/uploads/` from the chosen snapshot.
3. Start the server, sign in to `/admin`, confirm the header reports the store it expects, and check a known row.

### 8.3 Things not to do

- **Do not hand-edit `db.json`.** The in-process cache does not know, so the next save can overwrite your edit, and the `removed` tombstone list is load-bearing in ways that are not visible.
- **Do not delete the `data/` directory** to "reset" the app. `resyncSeeds()` will rebuild bundle rows; it will not rebuild real leads. To reset a demo, delete `db.json` *and* say so in writing to whoever owns that store.
- **Do not point `DATA_DIR` at a new location mid-campaign** without moving `db.json` with it, or you silently start a fresh store with seed content and tombstones missing.

---

## Part 9 — Deploying

`DEPLOYMENT-GUIDE.md` is the decision document (four paths, a decision matrix, an eight-item porting work order, and why "fully serverless" needs Supabase because the file store needs a disk). Short version, by situation:

| Situation | Do |
|---|---|
| You have one afternoon and no budget | Netlify with the Next.js runtime + a persistent data path (mounted `DATA_DIR` or Supabase). `DEPLOY-netlify.md` |
| You want the least work for an SSR Next app | Vercel, **with Supabase credentials** — the JSON store cannot live on a serverless filesystem |
| You want the campaign to own the machine | Container or VPS with Caddy: `DEPLOYMENT-GUIDE.md` §9–§10, including the Caddyfile that restates the six security headers |
| You are pitching, not launching | `NEXT_OUTPUT=export`, the static bundle, and the honest demo ribbon |

After any deploy, in this order: `GET /api/admin/login` → 401-ish probe response is correct for a cookie-less caller; log in at `/admin`; check the store badge; make one real edit through the Live Desk and see it on the page; run `node scripts/check-cms-gates.mjs` against the live URL; confirm the six security headers are present (a proxy can strip them silently); then rotate nothing and confirm the secrets you set are the ones in the process environment.

---

## Part 10 — Known issues, stated plainly

1. **No version control.** Highest-severity item; Part 6 step 1 is the fix and has not been done.
2. **`/api/volunteer` awaits two third-party calls with no timeout.** A real hang risk at the worst possible moment. Fix is a few lines plus a test.
3. **Four published lines are unsourced** and the rail will not clear them. Evidence or withdrawal — an HQ decision, not an engineering one.
4. **Dev secrets are still in use locally.** Release-blocking.
5. **No CSP yet.** Defensible today, not after the site is named publicly.
6. **No field performance measurement on a real Nigerian mobile network.** The budgets in `DEPLOYMENT-GUIDE.md` §13 are targets, not results.
7. **No full WCAG 2.2 audit**, and research found a specific gap: SC 2.2.2 wants an explicit pause/stop control for the auto-advancing carousel and the animated stat strip, not only `prefers-reduced-motion`.
8. **The file store has no cross-process lock.** Two simultaneous editors on one file can interleave. Fine for a desk of one to four people; a reason to move to Postgres at five.
9. **Screenshots cannot be captured in the current test surface** (hidden visibility) and scroll-follow of the Live Desk rings could not be exercised there. Both are disclosed in `09-QA-AND-TEST-EVIDENCE.md` rather than claimed as verified.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0 written against the verified 3 Nov build; includes the browser-cache, `EPERM`, WEBP-dimension and port-in-use failure modes actually encountered during this project | i2sltd.tech |
