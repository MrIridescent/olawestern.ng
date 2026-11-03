# Hardware, Environment and Deployment-Target Specification

**Document:** 11-HARDWARE-AND-ENVIRONMENT-SPEC.md
**Version:** 1.0
**Written:** 3 November 2026
**Purpose:** answer, with numbers, the question "what machine and what network does this need, and what should we actually buy?"
**Method:** every measured figure below came from the built application on 3 November 2026. Every estimate is labelled *assumption* and carries the arithmetic, so a reader can substitute their own number and redo it. No vendor price here is a quote.

---

## 1. What is actually being run

Measured on the verified production build:

| Component | Measured | Notes |
|---|---|---|
| Application source | 11,932 lines TS/TSX in `src/` | 12 page routes, 34 handlers, 33 component files |
| Runtime dependencies | 4 packages | `next` 14.2.15, `react`/`react-dom` 18.3.1, `@supabase/supabase-js` ^2.45 |
| `node_modules` | **287 MB** | install-time and build-time only; a standalone build ships far less |
| `.next` build output | **100 MB** | the artefact that actually deploys, plus `public/` |
| `public/` assets | **13 MB** | 83 press photographs, 3 generated graphics, 0 desk uploads at time of measurement |
| `data/db.json` | **52 KB** | the entire live state: ledger, record, newsroom, media, videos, sources, settings, leads, issues, tombstones |
| Shared first-load JS | **87.2 kB** | before page-specific code |
| Per-page JS | **87–102 kB** | App Router, server components |
| Route shape | 34 handlers, all `force-dynamic`; 1 declares `runtime='nodejs'` (`media/upload`); 14 prerendered entries — 8 with ISR (300/900/3600 s), 6 immutable | from `.next/prerender-manifest.json` and route metadata |
| Middleware | **none** | deliberate; it constrains which hosts are possible (see §4.3) |
| Native binaries | **none** | no `sharp`, no SQLite driver, no image toolchain |
| Node version | 20 LTS used for the verified build; ≥18.17 required | |

**The shape of the workload, in one sentence:** a small, mostly-read, bursty, mobile-heavy public site with a tiny writable state and an image folder that grows. That is a *storage and bandwidth* problem, not a compute problem — and it is the reason the cheapest sensible option in this project is also the one that gives you the most control.

## 2. Development environment (the machine someone actually types on)

The build was performed on Windows with Git Bash, and one real defect (`EPERM`/`errno -4091` on atomic rename during file-store writes) exists only because of that environment — so the Windows case is a requirement here, not an afterthought. ADR-029 exists because of it.

**Minimum (works, slowly)**
- 4 CPU cores, 8 GB RAM, 256 GB SSD, Node 20.x.
- Expect: `npm install` 2–6 min; `npm run build` 3–5 min; dev server first compile 10–30 s per route.

**Recommended**
- 8 cores (modern mobile silicon or Ryzen 7 class), 16 GB RAM, 512 GB NVMe SSD.
- OS: Windows 11 + Git Bash, or macOS, or Ubuntu 22.04+. Any is fine; the project is portable and `store.ts` handles Windows file-locking.
- Node 20 LTS, npm pinned by `package-lock.json`.
- ~2 GB free disk per checkout for `node_modules` + `.next`. Two branches in worktrees means 4 GB.

**Environment conditions that cause real failures, and the fix**
| Condition | Symptom | Fix |
|---|---|---|
| Project inside a OneDrive/Dropbox-synced folder | random `EPERM`, writes failing mid-save, editor lock contention | Move the project to an unsynced path, or exclude `node_modules`, `.next`, `data/` from sync |
| Antivirus scanning file writes | `save()` retries in the log, occasional write failure | Exclude the project directory; never disable AV on the production box |
| A second `next start` on the same port | `EADDRINUSE`, exit 1 | One server per port; `netstat -ano \| grep :<port>` then kill |
| A text editor holding `db.json` | atomic-rename failure | The store retries and falls back in place; close the file |
| 8 GB RAM during a concurrent build + browser + emulator | build OOM or a 5-minute build | 16 GB; close the emulator during builds |

**Screen and device requirements for the desk (not the engineer):** the Live Desk and the mobile verification pass are both *device-sensitive*. Any desk member who edits the site needs (a) an Android or iPhone they actually use — the layout is judged there — and (b) a laptop or tablet with a browser that can sign in to `/admin`. The Live Desk is deliberately unusable as a touch-first experience on a phone below ~400 px of usable width, and the rings assume a pointer. **This is a stated environment limit, not a bug.**

## 3. Build environment (CI or a person shipping a release)

- 2 vCPU, 4–8 GB RAM, 10–20 GB scratch disk is ample. The build touches ~400 MB of files and produces a 100 MB `.next`.
- Node 20 LTS pinned; `npm ci` rather than `npm install` so the lockfile is authoritative.
- Cold `npm ci` + `tsc --noEmit` + `npm run build` on hosted CI: roughly 3–6 minutes for this codebase. No image toolchain, no headless browser is required by the build itself.
- **The build must run the gate against the built artefact, not against source.** `DEPLOYMENT-GUIDE.md` §15.2 shows the shape: build → `next start` → `check-cms-gates.mjs` against `127.0.0.1` → deploy → gate again against the live URL. The gate script writes and deletes one throwaway row, so it needs a store that accepts writes and a valid `ADMIN_PASSWORD`/`ADMIN_SECRET` in the build environment. Budget for that, or the gate silently cannot run.
- Secrets needed at build time: only the `NEXT_PUBLIC_*` values and whatever the gate run needs. The service-role key is a **runtime** secret and must not be a build-time secret on a shared runner.

## 4. Production targets, sized

### 4.1 Traffic model — read the assumptions first

No field analytics exist for this site yet, so this is a model. Substituting a real number here replaces every conclusion below it, which is why the arithmetic is shown rather than hidden.

| Assumption | Value used | Basis |
|---|---|---|
| Addressable audience | 100,000–400,000 residents in the constituency area | *assumption* — replace with INE registered-voter figures for the LGA when HQ supplies them |
| Share who ever visit the site | 5–20% over the campaign | *assumption*; a state-level race is a fraction of a presidential one |
| Peak day | polling day, or the day after a rumour | observed pattern in Nigerian elections: the authoritative site is visited when something is disputed (INEC's IReV portal being unreachable on 25–28 Feb 2023 is the documented case of the vacuum being filled) |
| Peak concurrent readers | 50–500 | *assumption*, derived: 20,000 unique visitors in a peak day ≈ 1–3 requests/second average, with a 20–50× burst factor at a single moment |
| Requests per visitor session | 3–6 pages | mobile browsing pattern |
| Page weight served | 300 kB–1.2 MB depending on photography (JS alone is 87–102 kB) | measured JS + typical `next/image` output |

**Bandwidth arithmetic, peak day:** 20,000 sessions × 5 pages × 0.7 MB average ≈ **70 GB** in the day; with a CDN caching HTML for the ISR window and images indefinitely, origin egress falls to roughly **5–15 GB**, the rest served from the edge. That is the number to buy against — and it is why Cloudflare in front of anything is worth more than a bigger box.

**Compute arithmetic:** with 8 of 14 routes carrying ISR and all content pages cacheable, the origin performs a full React render a handful of times per minute, not per request. Writes are a person pressing Save and a resident submitting a form — call it **1–5 writes/second at peak**, on a store that is a 52 KB JSON file. A single small Node process handles this with very large margins. The genuine limits are (a) one-writer concurrency on the file store and (b) image disk, not CPU.

### 4.2 Sized options, all viable

**Tier 1 — Minimum viable (a campaign that cannot pay monthly)**
- 1 vCPU / 1 GB RAM / 20 GB SSD VPS, `next start` under systemd or Docker, Caddy for TLS, Cloudflare free in front.
- Handles: ~10 concurrent SSR renders at 80–150 ms each; comfortably more once ISR is warm.
- Cost shape: lowest, flat (`DEPLOYMENT-GUIDE.md` §17, Path C). The real cost is your evenings.
- **Do not** run more than one instance of this. Two writers on `data/db.json` lose leads silently.

**Tier 2 — Recommended standard**
- 2 vCPU / 4 GB RAM / 80 GB SSD, in a **European region close to Nigeria** (London is the practical default on latency and cost; a Lagos/IS1 region if the provider has one).
- Node 20, one app process, Caddy, Cloudflare (paid tier if you want WAF rules and image resize).
- Supabase Postgres (free/entry tier is ample — the whole dataset is 52 KB) **and** object storage for uploads (Supabase Storage or Cloudinary, both already in `next.config.mjs` remote patterns).
- Why this is the recommendation: it removes the ephemeral-filesystem risk of a pure serverless deployment, keeps the file store as a fallback, gives real backups, and the four-runtime-dependency app runs anywhere.
- RAM headroom: Next's SSR is not memory-hungry at this traffic; 4 GB is about giving `sharp`-free image serving, Node's heap, and the TLS proxy room to breathe without OOM during a burst.

**Tier 3 — Surge (polling week, or a national rollout of the same platform)**
- 4 vCPU / 8 GB / 160 GB SSD, **or** Path A (Netlify/Vercel) with Postgres + object storage so the platform absorbs the burst.
- Multiple app instances behind a load balancer **only once the backend is Postgres** — the file store cannot be shared across instances, and the deployment guide's own warning applies: revalidation only invalidates the instance that receives the call, so multi-instance without a shared cache and a purge path is a staleness machine.
- CDN purge wired to `revalidatePath` (the Next.js CDN-caching guide is explicit that the edge keeps serving until `s-maxage` expires).
- Rate limiting and an IP allowlist on `/admin` and `/api/admin/**` at the edge, since the app has no middleware to do it in.

### 4.3 What each hosting shape demands of the machine

| Shape | Can it run this app as-is? | Requirement |
|---|---|---|
| **Container / VPS (Path B, C)** | ✅ yes, zero porting | A mounted, persistent volume for `DATA_DIR` + `public/images/uploads`; outbound 443; a reverse proxy for TLS |
| **Serverless Next.js (Path A: Netlify, Vercel)** | ⚠️ **only with Postgres** | The file store needs a persistent disk that serverless functions do not have. Also respect payload ceilings (Vercel ~4.5 MB per function bundle; Netlify ~6 MB sync payload), which is why 13 MB of `public/` must be an asset/CDN path rather than function code |
| **PaaS with a disk (Render, Fly.io, Koyeb)** | ✅ yes with a volume | One instance, one writer, volume mounted; check the ephemeral-storage policy before launch day |
| **Static host / bucket (Path D, Qoder Sites)** | ❌ as a full product | No handlers, no headers, no image optimiser; forms are disabled by design. Correct as an election-day fallback, never as the campaign's only presence |
| **Shared PHP/cPanel hosting** | ❌ | No Node runtime, no long-lived process, and the atomic-write pattern assumes a filesystem you control |

That table is the entire answer to "can we deploy it with all features serverless to Netlify": **yes, once the data layer is Postgres and uploads are object storage, with the eight-item porting list from `DEPLOYMENT-GUIDE.md` §6 done first.** Netlify's Next.js Runtime v5 supplies the cache control and on-demand revalidation that make it behave; without the porting, the CMS has nowhere to write.

## 5. Storage

| Item | Today | 12-month projection | Buy |
|---|---|---|---|
| `data/db.json` | 52 KB | < 1 MB even with 30,000 volunteer rows | irrelevant; the row count is the compliance concern, not the byte count |
| `public/images/uploads` | 0 files | 500–2,000 desk photographs at 1–4 MB each → **1–8 GB** | **20 GB minimum** on disk, or move to object storage at the first 200 uploads |
| Bundled press imagery | 13 MB (83 files) | grows only with harvest runs | include in the deploy artefact |
| `.next` | 100 MB | stable | rebuild in place; keep one previous artefact for rollback (so 2×) |
| Backups | — | daily snapshot × 14 days + weekly × 8 | ~**15–25 GB** off-box |

**The growth axis that surprises people is photographs, not data.** The upload cap is 10 MB per file and the header probe accepts JPEG/PNG/WebP/GIF. A desk that photographs a rally on a phone produces 3–4 MB per frame and will fill a 20 GB disk in a busy month. Two mitigations, in order of preference: object storage (Supabase/Cloudinary, both already permitted hosts for `next/image`) or a resize step, which today does not exist because `sharp` was deliberately excluded (ADR-017). If the desk uploads daily, that exclusion becomes a real cost and the resize decision belongs at the edge (Cloudflare Images / an optimiser host), not back in the app.

**Log volume:** JSON to stdout, 30-day retention. At this traffic, a few hundred MB. Ship it off-box; a full log volume is how a disk-full incident turns into a store-write failure.

## 6. Network

- **Region.** Users are in Lagos. Anysub domain resolution and TLS handshake are dominated by RTT, and a West African audience gets better latency from London/European regions than from US coasts, while genuine in-country hosting is scarce and expensive. Practical answer: **edge in front (Cloudflare has the largest network and West African PoPs), origin in London**, and don't pretend the origin region matters once ISR and edge caching are doing their jobs.
- **TLS.** Managed by Caddy or the edge. HSTS is already set at `max-age=63072000; includeSubDomains` with `preload` requested — decide deliberately whether to submit to the preload list, because it is hard to undo.
- **Certificates and expiry** are an operational risk, not a technical one: a campaign domain with an expired certificate on polling day is a story.
- **Outbound.** The app makes three outbound calls: YouTube oEmbed (6 s abort), the War Room webhook, and the WhatsApp Cloud API. The last two have **no timeout today** (§7.5 of the runbook) — that is a network-configuration risk you can mitigate by not setting the credentials until the fix lands.
- **Ports.** One HTTPS listener. `3100` is the local verification port; production should be 443 behind a proxy, with the Node process never exposed.
- **Bandwidth billing.** Choose flat-rate with overage tolerance over per-GB billing for a bursty campaign site. A viral week on per-GB pricing is an invoice you discover after the fact.
- **Egress path for images:** if press photography is served from third-party outlet URLs (`PhotoSlot` renders those as plain `<img>`), their bandwidth is your page weight but not your bill — and their outage is your broken image. That trade-off is recorded in ADR-020.

## 7. Runtime and software baseline

| Layer | Pin | Why |
|---|---|---|
| OS | Ubuntu 22.04 LTS or Debian 12 | Long support window through the 2027 cycle |
| Node.js | **20 LTS** | Next 14 requires ≥18.17; 20 is what the verified build used |
| Process manager | systemd or Docker (no PM2 needed) | One process; `restart: always` is the whole strategy |
| Reverse proxy / TLS | Caddy | Automatic certificates, and it restates the six security headers if the app's get stripped |
| Edge/CDN | Cloudflare | West African presence, HTML caching, WAF on the paid tier, purge API for the staleness problem in §4.3 |
| Database | none required (file store) → Supabase Postgres when persistent writes are needed | Two migrations, `0001` then `0002`, applied in order |
| Image storage | local `public/images/uploads` → Supabase Storage or Cloudinary | `next.config.mjs` already allows both hosts |
| Backup transport | `rsync`/`scp` off-box, or the provider's snapshot API | An on-box backup is not a backup |

Environment variables at runtime: `ADMIN_PASSWORD`, `ADMIN_SECRET`, `DATA_DIR`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, and — only when those backends are in use — the three Supabase keys, `WAR_ROOM_SECRET_KEY`, `WAR_ROOM_WEBHOOK_URL`, and the two WhatsApp values. `.env.example` documents all of them; the full table and the rotation rules are in `DEPLOYMENT-GUIDE.md` §14 and `10-SECURITY-AND-COMPLIANCE.md`.

**The one non-negotiable in this section:** the three dev fallback values — `ola-admin-2026`, `warroom-dev`, and the `ADMIN_SECRET` fallback — must not appear in a production process. In production with `ADMIN_PASSWORD` unset the app fails closed and nobody can log in, which is correct behaviour (ADR-007) and looks like an outage if you did not read this line.

## 8. Environment matrix (what to run where)

| Environment | Purpose | Store | Indexable? | Data |
|---|---|---|---|---|
| `dev` | laptop work | file store | no | none or copy |
| `preview` (per-PR) | visual check, the Live Desk rehearsal | throwaway Supabase branch or file store | **`noindex` mandatory** | fake content only |
| `production` | the campaign | Supabase Postgres recommended; file store acceptable at ≤4 editors | yes | the only real data |
| `surge snapshot` (Path D) | election-day read-only fallback | static, baked-in | yes | frozen copy |

A preview environment that is indexable, or that holds real lead data, is the most common way a campaign site leaks a draft. Keep `/data` and the uploads directory out of source control in every environment — the file store is state, not configuration.

## 9. Procurement summary — what to actually buy

For a single-constituency 2027 campaign, in order:

1. **A domain and DNS with Cloudflare in front.** Cheapest, highest impact: caching, TLS, WAF options, and it is what makes a 1 vCPU origin look like a fast site.
2. **One 2 vCPU / 4 GB / 80 GB VPS in a London (or Lagos, if available) region** with a mounted volume for `DATA_DIR`. Runs the app exactly as built, no porting, real backups, lowest total cost of ownership including the vendor's evenings.
3. **A Supabase project** (free/entry tier) applied with both migrations, plus `SUPABASE_SERVICE_ROLE_KEY`, so writes are durable and a future multi-instance deployment is possible at all.
4. **Object storage** (Supabase Storage or Cloudinary) the moment desk uploads exceed a couple of hundred files.
5. **Synthetic monitoring** with a West African vantage, plus a log drain. Cheap, and it is the difference between knowing and being told by a supporter.
6. **Off-box backups**: daily, 14-day retention, weekly × 8, plus one verified restore drill before launch.

**What not to buy.** A bigger server instead of a CDN. Multiple app instances while still on the file store. Managed "WordPress-Next" hosting that cannot run a Node process. A serverless-only plan with nowhere persistent to write. A separate image-resize service when the honest fix is a resize step or edge optimisation. A vendor dashboard that adds a second editing surface — the whole Live Desk argument is that a second UI is a thing to keep in sync, and it will drift.

## 10. Sizing for the platform, not just this campaign

The same product, reused for a second and third constituency, changes the arithmetic in exactly three places:
- **Writes per second** scale with desks, not voters. Six concurrent editors on one JSON file is a corruption waiting to happen; the file store has no cross-process lock. **Postgres at campaign #2, not campaign #5.**
- **Media** scales linearly and quickly. Object storage from day one on any multi-campaign deployment.
- **Isolation.** Separate databases or separate schemas per campaign; a supporter of candidate A must never appear in candidate B's export. That is an NDPA question (political opinions are sensitive personal data under s.30 of the Act) before it is an architecture one, and it is why the store abstraction was kept narrow rather than clever.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0: measured inventory, traffic and storage arithmetic with assumptions exposed, three production tiers, environment matrix, procurement list and anti-list | i2sltd.tech |
