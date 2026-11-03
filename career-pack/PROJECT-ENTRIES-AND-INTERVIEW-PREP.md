# Project entries, online copy and interview prep

**Compiled:** 3 November 2026 · Anonymised by default (`README.md` §1) · All numbers measured 3 November 2026 and recorded in `../ola-western-web/docs/09-QA-AND-TEST-EVIDENCE.md`

Four uses: a bullet bank you can paste from, three lengths of the same project write-up, the copy for LinkedIn/GitHub/portfolio, and the questions that will actually be asked — including the hostile ones, answered honestly.

---

## 1. Bullet bank

Grouped by what a reviewer is testing. Paste any 3–5; do not paste all. Every bullet is a claim plus its number.

### Systems thinking and product design
- Reframed a "public relations and reputation management" brief into a verifiable public record system, and implemented the reframing in the server rather than the style guide.
- Designed a content-management model in which the public page *is* the editing surface: a 25-field declarative contract drives annotation, in-place editing, validation and the admin fallback.
- Built a server-side publish gate that refuses to create any claim-bearing record without an evidence link, permits replacement but never emptying, and treats deletion as the only takedown.
- Implemented a self-audit subsystem that computes the site's own trust score from weighted findings and blocks public sharing until it passes (current score: 40/100, 6 findings, 4 `block`).
- Chose to leave 4 evidence links unfilled and 4 image frames empty rather than fabricate either, and documented the refusals as design decisions.

### Implementation depth
- Owned 11,932 lines of TypeScript across 12 page routes and 34 API route handlers, with a dual storage backend (atomic flat-file store with tmp+rename and EPERM/EBUSY retry handling; Supabase Postgres with two migrations) behind one interface.
- Shipped a signed-cookie admin session (HMAC-SHA256, 12-hour TTL, `httpOnly`/`sameSite=lax`/`secure`, constant-time compare behind a length check, fail-closed when the production secret is unset) with no auth service and no middleware.
- Kept shared first-load JavaScript at 87.2 kB with four runtime dependencies, no ORM, no UI kit and no image-processing service — substituting a byte-level image header probe (WEBP RIFF chunk walking, HEIC refused) for `sharp`.
- Built an aspect-ratio media gate across 20 declared frames using a crop-loss score (`r > 1 ? 1 − 1/r : 1 − r`, capped at 34%), filling 16 frames with 27 provenance-credited press photographs.
- Verified 7 embedded video clips against oEmbed before listing, so an item in the media library is an item that exists.
- Replaced conventional unit tests with 12 behavioural gate assertions in `scripts/check-cms-gates.mjs` covering the publish gate, the annotation contract and the media frames — 12/12 passing.

### Ownership, quality and operations
- Authored a 13-document dated suite: PRD (34 functional + 15 non-functional requirements with enforcement, code location and status), 32 architecture decision records, technical manual, operations runbook with 10 incident playbooks, use-case dossier (22 abstract, 9 fictional, 28 cited real-world events), 34 user stories across 8 personas, developer workflow with 14 documented landmines, QA evidence, security and compliance analysis, hardware/environment spec, and five-phase release checklists.
- Recorded QA as commands, timestamps and verbatim output rather than conclusions — including two of my own errors: a wrong prerender claim (all 14 routes immutable; the manifest shows 8 ISR + 6 immutable) and an invalid first verification caused by browser caching.
- Analysed hosting end to end against a verified build: five deployment paths with a reasoned rejection of full serverless (disk-writing upload route pinned to the Node runtime, no CDN purge API, cookie sessions), three production tiers, and a peak-day traffic model with every assumption labelled.
- Mapped the system against Nigeria's Data Protection Act 2023 obligation by obligation, including section 30 treatment of political opinions as sensitive personal data, with `toPublic()` PII stripping mirrored in Postgres row-level security.
- Named the outstanding liabilities rather than hiding them: no version control, unrotated development secrets, no CSP, no full WCAG 2.2 audit, no lawyer review of the privacy text, and an endpoint that can hang because a "fire-and-forget" `Promise.allSettled` has no timeout.

### User and accessibility craft
- Turned "colours not too bright, we need ease of reading" into a measured low-glare palette with verified text contrast, mobile-first layouts, and tap targets sized against WCAG 2.2 SC 2.5.8.
- Reduced the operational training burden to a 30-minute desk walkthrough, because campaign volunteers do not learn admin panels and will not log into a second interface.
- Ensured an anonymous visitor receives zero editable DOM — the editing surface costs the public nothing in payload, discovery or attack surface.

---

## 2. Three lengths of the same story

**30 words** (a CV project line)
> Campaign platform for a 2027 Lagos State legislative candidacy. Next.js/TypeScript, 12 routes, 34 handlers, dual storage; a CMS that is the public page, and a publish gate that refuses unattested claims. Self-audit score 40/100, published.

**120 words** (a portfolio entry, a LinkedIn post, an application field limit)
> A candidate for a 2027 Lagos State House of Assembly seat asked for a website "for public relations and reputation management". The information environment says something narrower: a public record must survive *how do you know?* So the system enforces that in code. No claim-bearing record — a track-record entry or a rumour ruling — can be created without an evidence link; the link can be replaced, never emptied; deletion is the only takedown. The site grades its own trustworthiness from weighted findings and refuses to be shared until it passes; it currently reads 40/100 with four lines flagged, and I left them unfilled rather than invent sources. Editing happens on the live page itself (⌘E, 38 annotated regions, ⌘K command deck, ⌘Z undo). Built on Next.js 14 and TypeScript with 12 routes, 34 handlers, 87.2 kB shared JS, dual storage backends, and a 13-document dated suite including a 10-playbook runbook and an NDPA 2023 mapping.

**400 words** (an interview answer to "tell me about a project you owned")
> Use `PORTFOLIO-CASE-STUDY.md` §1–§4 as the spine. Deliver it in this order, and stop talking after each of the four beats so the interviewer can interrupt:
>
> 1. **The brief and the reframe** (45 s). Client asked for reputation management, mobile-first, no stubs or placeholders, and "a CMS never conceived". The context: a documented environment in which a party's own site was hacked (2019), a fake electoral-body site appeared (2026), fabricated result graphics circulated in an off-year state election (2026), and an arrest followed a synthetic clip of the head of state (2026). So the product became a record that can prove itself.
> 2. **The interesting decision** (90 s). The publish gate is server-side, not policy-side. POST without evidence is refused; PATCH may replace a link but never empty it; DELETE is the only takedown. Then the integrity rail computes a weighted score from its own findings and gates shareability on it. Then the honest punchline: it says 40/100 and four lines are blocked, and I could have fixed that in fifteen minutes by writing plausible-looking URLs. I didn't, and the number is the reason a reviewer should trust the rest of the sentence.
> 3. **The hard technical part** (75 s). The Live Desk: one contract file with 25 field specs across 5 kinds drives annotation on the public page, in-place editing, validation and the admin fallback. 38 `data-ow` sites, rings from `getBoundingClientRect()` deduplicated with a `seen` Set, `router.refresh()` plus `revalidatePath` on write, and zero editable DOM for anonymous visitors. On the media side, I refused to add `sharp` and wrote a byte-level header probe that walks WEBP RIFF chunks and refuses HEIC, then gated photographs against 20 declared frames by crop loss at 34%.
> 4. **What I'd fix** (45 s). There's no `.git` — that's indefensible for this much surface and the technical manual makes `git init` the first step for whoever picks it up. Development secrets are unrotated. There's no CSP. One endpoint awaits two external calls with no timeout under a comment claiming fire-and-forget, so it can hang. My QA file records a verification I ran that was invalid because the browser served a cached asset, and a documentation error about the prerender manifest that I corrected. Nobody gets a project of this size right on the first pass; the difference is whether the record says so.

---

## 3. Online copy

### LinkedIn headline (pick one, ≤ 220 chars total profile)
- `Full-stack TypeScript / Next.js engineer · campaign & civic technology · I build public records that can prove themselves`
- `I build systems where the constraint is the feature — publish gates, self-auditing records, CMSs that are the page itself`

### LinkedIn "About"
> I design and build full-stack TypeScript systems, and I write the documentation that lets other people operate them.
>
> The work I'm known for is the unglamorous half: the constraint that stops a system doing something it shouldn't. My most recent project is a campaign platform for a 2027 Lagos State legislative candidacy. It has a publish gate that refuses to create a claim without an evidence link, an integrity rail that grades the site's own trustworthiness and blocks it from being shared until it earns it, and a CMS where the editing surface is the live public page.
>
> The score is currently 40 out of 100 with four published lines flagged as unproven. I left them unfilled rather than inventing sources, and I published the number. That is the part of this project I'd want a reviewer to judge me on.
>
> Stack: Next.js (App Router), TypeScript, React, Tailwind, Postgres/Supabase, Node 20. Practice: architecture decision records, threat modelling, WCAG 2.2, NDPA 2023 data-protection mapping, incident runbooks. Based in [[CITY]]. Available for [[ROLE TYPES]].
>
> Case study and a 5-minute infographic: [[PORTFOLIO URL]]

### GitHub profile README (pin 2 repos, not 20)
```
I build public-facing systems with the honesty machinery inside the code.

Currently public: [[sanitised extract repo — see career-pack/CHANNELS.md §6.1]]
Working on: campaign record infrastructure, self-auditing content systems.

How I work: I write down the constraint before the feature, and I report the
state of the thing including what's broken. My last project ships 13 dated
documents, 32 ADRs, and a trust score of 40/100 that it refuses to hide.
```
**Do not push the client repository.** It contains 83 press photographs with third-party provenance and a JSON store with supporters' names and phone numbers. Publish only the rights-checked, sanitised extraction (`CHANNELS.md` §6.1), and only after confirming you may.

### Portfolio site copy for this project (three panels)
1. **The problem** — one paragraph from §1 of the case study. No stock photography, no candidate face.
2. **The mechanism** — a GIF-free interactive demo of the publish gate refusing a claim, and the integrity rail's findings list. Real strings from real code.
3. **The state** — the honest table from §3 of the case study, with `[gap]` markers, the date of measurement, and the six things not yet done.

---

## 4. Interview prep — the questions that will actually come

**"Walk me through the architecture."**
Browser → Next.js App Router (8 ISR routes, 6 immutable prerenders, 34 handlers all `force-dynamic`) → route handlers → `store.ts`, one interface over two backends (flat file with atomic tmp+rename and Windows errno retries; Supabase Postgres with a service-role write client) → `EVIDENCE_RULE` sitting between the mutation route and the store → `revalidatePath` back to the cache. Admin is gated by a stateless HMAC-signed cookie; the Live Desk session probe renders nothing anonymously. Say it in thirty seconds, then ask which layer they want to go deep on.

**"Why not Sanity / Contentful / a headless CMS?"**
Because the requirement was that a claim cannot be published without evidence, and that rule has to live in code you own. A hosted CMS gives you an editorial workflow, not an invariant. Also: a four-dependency footprint with 87 kB shared JS on a market where the typical device is a mid-range Android on an unreliable connection. If the client later wants a hosted CMS, the contract file is the seam where that plugs in.

**"Why two storage backends?"**
One is the honest answer: the flat-file store made the system demonstrable end to end on a machine with no database, and the Postgres path is the configured production route with migrations and RLS. The design constraint was that neither can be visible to the caller — `store.ts` presents one interface, so the choice is a deployment concern. The tradeoff I'd flag: a JSON file is not the right ceiling for concurrent writers, and I said so rather than pretending otherwise.

**"No tests? Really?"**
No unit-test framework — deliberately replaced with 12 behavioural gate assertions that check the load-bearing contracts: the publish gate, the annotation contract, the media frames. That is what I would defend as sufficient for the invariants, and insufficient for everything else. If I joined a team with a test culture, the first thing I'd add is a harness for `store.ts` and the crop-loss maths, because those two are pure and regression-prone. I would not pretend the current state is good.

**"Why no git?"**
There is no version-control history for this repo and it is the least defensible thing about it. It happened because the project grew from a scaffold into a system across working sessions without the discipline being re-established. `git init` is step one of the technical manual's handover section, and `.gitignore` is already correct — `/data`, `.env.local`, `node_modules`, `.next` — so the first commit is safe. I'd fix it today, and I'd tell a hiring manager before they found it.

**"How would you scale it?"**
Nothing in the read path prevents scaling: pages are cached and the handlers are stateless except for the store. The real axis is the store. Step one: Postgres as the single backend, which is already written. Step two: media off disk to object storage with the upload route writing there — currently blocked only by the fact that a PaaS filesystem is not the right place for photographs. Step three: if two campaigns share the system, add a tenant dimension to the store and the contract, which is a migration, not a rewrite. I would not reach for Kubernetes before any of those.

**"What's the security posture?"**
Signed HMAC cookie sessions, no server-side session state, fail-closed on unset secrets in production, constant-time compare behind a length check, every `/api/admin/**` handler gated, PII stripped by `toPublic()` mirrored in RLS. Four limitations I documented rather than let anyone discover: no per-cookie revocation, no login rate limiting, no CSRF token (mitigated by `sameSite=lax` plus no state-changing GETs), no MFA. Plus the one that actually matters at the moment: development fallback secrets are still live locally and must be rotated before deployment.

**"Tell me about a mistake."**
Two real ones. I wrote in a deployment guide that all fourteen prerendered routes were immutable; the manifest shows eight carrying ISR, which invalidated the staleness argument built on it — I corrected the document and recorded the correction in the index change log instead of quietly replacing it. And I verified a layout fix in a browser, saw it correct, and then realised the browser had served me a cached asset, so the verification proved nothing; I re-ran it and wrote down both attempts. I choose these over a safe mistake because the interesting claim isn't "I made an error", it's "my record contains the error".

**"Would you cut the honesty features to ship faster?"**
No, and I'd ask what specifically is at risk before agreeing to remove anything else. The gate and the rail are the reason the rest of the system is trustworthy; they're also cheap — a validation rule and a scoring function. What I *would* cut for time is the media pipeline's polish and the documentation set's later phases. I'd be suspicious of a project where the integrity machinery is the thing on the chopping block, and I'd say so in the room.

**"Why did you leave four image frames empty?"**
Because there is no real photograph of those moments and the alternative was a stand-in or an AI generation. One of the frames is a family portrait. Refusing to generate an image of a real person, or of their family, is not a scope reduction — it's the reason the campaign trusts the system to publish anything at all.

**"What would you do differently if starting again?"**
Establish version control and a build gate in week one; put a timeout on every external call from a request path; write CSP from the start; get the privacy text reviewed by a lawyer before launch instead of after; treat the full accessibility audit as a release criterion rather than a backlog item; and collect evidence from the campaign as a first-class deliverable with a named owner and a deadline, because four blocked lines is a content-supply problem I can design against but not solve alone.

**"Do you have a client reference?"**
Not yet publishable — the engagement's confidentiality posture is that the client isn't named externally without written consent. What I can offer instead is the artefact: the running system, the build output, the 12/12 gate run, and 13 dated documents. Ask me to walk you through the four failing findings.

### Questions you should ask them
1. How does this team decide something is done — is there a written definition, and where does it live?
2. What's the last thing that broke in production, and what did the incident record look like afterwards?
3. Who owns accessibility and data-protection compliance here, in practice?
4. If I joined, what would the first 30 days of work actually be?
5. How is technical writing treated — required, optional, or discouraged?

---

## 5. Rate and seniority framing

- External anchor you can cite: Lemon.io's published band for accepted countries including Nigeria is roughly **$34–54/hr** (checked 3 November 2026). Use it as a floor signal, not as your rate.
- Set your own number from your costs and the market, and state it as a range with a reason attached to each end ("the lower bound is a fixed-scope build; the upper includes the runbook, training and the first month of operations").
- Seniority signals that cost nothing and work in writing: measured numbers with dates, stated limitations, an owned tradeoff explained from both sides, and a documented mistake. If you say those four things unprompted in a screening call, you are being read as senior regardless of your title.
- **Never** claim a title, employer, metric or client outcome that is not in your records. `README.md` §3 exists because the placeholders are yours to fill, not mine to invent.

## 6. Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | Bullet bank, three-length narrative, online copy, hostile-question prep and rate framing created from the measured record in `docs/09` and `docs/10` | i2sltd.tech |
