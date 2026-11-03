# Use-Case Dossier — Abstract, Fictional, and Reported

**Document:** 06-USE-CASES.md
**Version:** 1.0
**Written:** 3 November 2026
**Audience:** the campaign (what this thing does on a bad day), a reviewer (whether the claims are grounded), an engineer inheriting it (what behaviour is intended), and a future client (whether the pattern transfers).
**Method:** four classes of use case, kept separate on purpose. **Abstract** cases describe capability interactions without pretending to be a story. **Fictional** cases are named, labelled as invented, and written to a plausible campaign hour. **Reported** cases are real events, cited with dates and sources, each mapped against how this system would actually have behaved — including where it would not have helped. **Rejected** cases are the requests this product deliberately refuses.

> **Honesty note.** Nothing below was executed as a load or penetration test unless it says it was. Where a reported event is used, the claim is "here is the system's documented behaviour against that pattern", not "we survived it". Real verification evidence lives in `09-QA-AND-TEST-EVIDENCE.md`, and the gaps there are visible.

---

# Part A — Abstract use cases

Each is a capability interaction: precondition → action → system response → state. These are the unit-level facts that the fictional narratives in Part B are built from.

### A1. Publish a claim that has a source
**Pre** signed-in desk; a track-record entry exists in the dossier with a published report.
**Act** `⌘E` → tap the position on `/impact` → fill title, date, category, evidence URL → Save.
**System** validates length, ISO date, real `http(s)` URL, category from the app's own union → stores → `revalidatePath('/impact')` → `router.refresh()` redraws the page the desk is standing on.
**State** claim live, with its report attached; the integrity rail's `block` count unchanged.

### A2. Publish a claim that has no source
**Act** as A1, without the evidence URL.
**System** **refuses**, server-side, with `EVIDENCE_RULE`'s one sentence. Identical refusal whether it came from the Live Desk or the Track Record tab — because it is the same route.
**State** nothing stored. This is the product's central behaviour: "unsourced" is a state the software declines rather than a standard people are reminded of.

### A3. Empty the evidence field of a live claim
**Act** `PATCH` a record row with `verification_source_url: ""`.
**System** refuses. A link may be **replaced**, never **removed** — because softening a claim in place is not the same decision as taking it down.
**State** the claim is unchanged. To remove it: A4.

### A4. Retract a published claim
**Act** unpublish or `DELETE`.
**System** removes it from the public read, revalidates, and (for seed-owned rows) records a tombstone in `removed` so the next content bundle cannot resurrect it.
**State** gone, and staying gone. The takedown is one action and one person.

### A5. Attach a real photograph to a frame that names a place
**Act** tap the `hq-office` frame.
**System** the picker refuses to browse the library. `exact` frames take an upload or keep the branded panel — a photograph of a different room cannot stand in for "the campaign's office", because that is a factual claim wearing an image.
**State** the frame renders the panel until HQ uploads the actual photograph.

### A6. A photograph's shape fights the frame's shape
**Act** a 4:5 campaign portrait is bound into a 16:9 carousel frame.
**System** the frame stays landscape (a strip that changes height per slide jumps under the reader's thumb) and the **fit follows the photograph**: portrait/square are contained over a blurred, dimmed copy of themselves, with bottom padding computed against the caption band so the subject's feet clear it. Landscape still covers.
**State** head and feet visible. Before this rule existed, `object-cover` cut roughly two-thirds of a portrait's height, and the head went first. (Real defect, found and fixed 3 Nov 2026 — see Part E of `09-…EVIDENCE.md`.)

### A7. Bind a photo that the frame would destroy
**Act** choose a 1:1 photograph for a 16:9 hero.
**System** the crop is computed (`cropLoss = r>1 ? 1−1/r : 1−r`) and displayed as a percentage in the picker; the batch publisher refuses above 34%.
**State** the desk sees the cost before committing. A square photo goes to the gallery wall instead.

### A8. Add a video by pasting a link
**Act** `⌘K`, paste `https://youtu.be/xxxxxxxxxxx`.
**System** parses it to an 11-character id and offers "publish this clip to the shelf"; on save the **server** asks YouTube's oEmbed whether the video exists and permits embedding (401/403 → embedding disabled by the owner; 404/400/410 → wrong link), with a 6-second abort so an outage cannot hang the desk.
**State** only verified, embeddable clips can be stored. Nothing is invented — the title and outlet come from YouTube, and a human edits them before saving.

### A9. A voter opens the page
**Act** an anonymous browser requests `/impact`.
**System** the Live Desk probes `GET /api/admin/login`, gets `authenticated: false`, and **renders nothing**: no dock, no listeners, no overlay DOM, and none of it in the server HTML. `data-ow-missing` hints are `display:none` for everyone and appear only while the desk is armed.
**State** `curl -s https://<site>/impact | grep -c 'data-ow'` — for the ring markup, zero. An unfinished sentence is never advertised to the other side.

### A10. Save a copy change at 23:00 on a phone-connected laptop
**Act** `⌘E`, edit the hero headline, Save.
**System** route → validate → store → revalidate → in-place refresh; the counter in the sheet was the route's real maximum, and the refusal wording is the route's own sentence, not a reworded one.
**State** live within the page's ISR window or immediately where revalidation reaches the edge. No engineer, no deploy, no form about a website.

### A11. Undo
**Act** `⌘Z`.
**System** replays the same route with the previous value.
**State limit, stated:** the stack is in-memory and per-session. It does not survive a reload — durable recovery is the backup. A version database is deferred (ADR-032), not forgotten.

### A12. The site asks itself whether it is defensible
**Act** `GET /api/admin/health`.
**System** recomputes from the live store: unsourced claims, rulings with no document, frames on the panel, photos below size or cropped past a third, unconfirmed candidate-file rows, sitting drafts. Score = `100 − Σ min(W×ceil(n/3), W×3)`, W = block 18 / warn 7 / info 2.
**State** today: **40 / not ready**, 6 findings, **4 published lines `block`**. The grouping and the cap mean thirty unsourced claims cost the same as three, and deleting the ugliest line buys nothing. As of this writing, it is failing honestly.

### A13. A resident reports a problem
**Act** `/help-desk` form: ward, category, detail, optional name/number, explicit consent.
**System** stored **unpublished**. `GET /api/issues` returns published rows only, and `toPublic()` strips `reporter_name`, `reporter_phone` and `consent` server-side; the Supabase RLS policy mirrors the same rule, so the guarantee does not depend on the handler remembering.
**State** nothing a resident writes reaches the public dashboard until a person at the desk publishes it.

### A14. A volunteer signs up
**Act** `/join` with the consent checkbox ticked.
**System** validates → stores with `consent_at` → then `await`s the War Room webhook and the WhatsApp welcome via `Promise.allSettled` — **with no timeout** (documented defect, §7.5 of the runbook).
**State** the lead is captured; delivery to the CRM may be slow. The consent timestamp is what lets an erasure request be answered with a date, and it is included in the CSV export.

### A15. The War Room pushes an approved ruling
**Act** `POST /api/truth-room/sync` with the bearer secret.
**System** authenticates, writes into the ledger for desk review. **No route in this application publishes on a timer or on an inbound webhook alone.**
**State** human-in-the-loop is a property of the request graph, not an instruction in a handbook.

### A16. A page goes stale during a live rumour
**Act** publish a ruling; the CDN still serves a cached copy.
**System** `revalidatePath` invalidates the Next.js server cache; **the edge keeps serving until `s-maxage` expires** — Next's own CDN-caching guide states this in terms, and HTTP (RFC 9111) defines no invalidation method at all, so purging is always a vendor extension. On self-hosted multi-instance, revalidation reaches only the instance that received the call.
**State** the ISR window (300/900/3600 s) is a **worst-case staleness bound**, and is therefore an editorial number — a Truth Room that lags an hour during a rumour is a political problem. Operationally: purge the URL (HTML and RSC variants) at the edge.

### A17. A desk member leaves the campaign
**Act** rotate `ADMIN_PASSWORD` and `ADMIN_SECRET`.
**System** the session is a stateless signed cookie; changing the signing secret invalidates every desk session instantly. No revocation list exists or is needed.
**State limit:** a stolen cookie cannot be individually revoked before its 12-hour expiry, so rotation is the revocation mechanism.

### A18. Something is edited that should not have been
**Act** suspected defacement or leaked credentials.
**System** rotate secrets (§A17), block `/admin` and `/api/admin/**` at the edge while the public keeps reading, diff live content against the last backup and the deploy against the pipeline commit, check the tombstone list for rows that should be gone.
**State** the app has no middleware, so the edge block is a hosting action, not a code change — and that must be prepared before it is needed.

### A19. The deployment target has no disk
**Act** deploy to a pure serverless host with the file store enabled.
**System** writes succeed into an ephemeral filesystem and vanish on the next cold start or invocation elsewhere.
**State** this is the reason Path A requires Postgres plus object storage before it is honest, and the first item in the porting work order. Not hypothetical: it is the answer to "can we put it on Netlify with all features?"

### A20. The store is upgraded without losing what people gave us
**Act** deploy a new content bundle with a different `SEED_VERSION`.
**System** `resyncSeeds()` refreshes bundle-owned rows, keeps every desk-created row, and never touches volunteers or inquiries. Tombstones keep withdrawn items withdrawn.
**State** an older store file is migrated on first read. A redeploy is not a data-loss event — which is the property that made the file store acceptable in the first place.

### A21. Traffic arrives in a burst
**Act** the site is shared into a large ward group.
**System** 8 of the 14 prerendered entries carry timed ISR, so the origin renders a handful of times per minute rather than per hit; the public JS budget is 87–102 kB; images are the real bandwidth.
**State** compute is not the constraint. Edge egress and disk for photographs are (§5 of the hardware spec).

### A22. A journalist wants to check the site's own sourcing
**Act** open `/impact#sources`.
**System** 21 dated press links, filterable by outlet and year, maintained from the CMS; each ledger entry links to the report that evidences it; each photo credit is a link to the outlet that took the picture. `scroll-margin-top` makes the deep link land below the sticky header.
**State** the site is auditable by someone with no access to it. That is the point of a *record*, as opposed to a poster.

# Part B — Fictional scenarios

Invented, named, and labelled as fiction. Each is written to a realistic hour and ends with what the system did and what it could not do.

### B1 — "The voice note at 21:40" *(fictional)*
A 47-second audio clip is circulating in Festac groups by dinner: the candidate, apparently, promising to relocate a market. The ward agent forwards it to the desk. Communications lead Ada opens the site on a laptop at 21:47, presses `⌘E` on `/truth-room`, and drafts a ruling with the verdict `MISLEADING`. She has no document. **The route refuses.** She spends eleven minutes finding the published report of the actual town-hall consultation, attaches it, and this time the ruling saves. She checks the live page in a private window. A volunteer asks her to post it into six groups; the site has no such capability, and she does not have one either — she sends the link, from her own number, to the group she is in. The ruling is live at 22:04.

*What the system did:* refused an unsourced rebuttal at the exact moment it was most tempting, then made the sourced one take ninety seconds. *What it could not do:* verify the audio. That is a person with a phone and a memory of the day.

### B2 — "The head that was cut off" *(fictional, but this defect was real)*
A desk member uploads the campaign's official portrait. On desktop the carousel shows the candidate from the ears to the chin. Their reaction, accurate, is that the site is broken.

*What happened in this project:* the carousel had one fixed landscape frame and `object-cover` for every slide. The fix was not CSS trickery; it was telling the slide model what shape the photograph is (`GallerySlide.orientation`), letting the resolver emit it, and letting the renderer choose the fit per slide — contained over a blurred backdrop for portrait and square, cover for landscape, with bottom padding measured against the absolutely positioned caption band (233 px of a 339 px frame on desktop). Verified in the browser: a 145×203 figure at preserved aspect, feet clear of the caption. The first verification attempt read a *cached* document and reported the old classes, which is why `09-…EVIDENCE.md` records the cache-busting step as part of the method.

### B3 — "Nobody has a photograph of the office" *(fictional)*
HQ wants the Contact page to look complete. The only image available is a wide shot of a rally. In most CMSs the desk uploads it, and the site now asserts that this crowd is the campaign office.

*Here:* `hq-office` is `exact`. The picker refuses the library; the frame renders the branded panel. The go-live checklist carries the line "photograph and upload the four frames that are deliberately empty" — the emptiness is a task for a person with a camera, not a defect to paper over. A reputation site that shows an honest empty frame is worth more than one that shows a plausible wrong photograph, and this scenario is why.

### B4 — "The candidate dictates a sentence" *(fictional)*
In a car, on a call, the candidate says: change the closing line to X. The desk member opens `/`, taps the closing band, dictates into the phone's keyboard, saves, screenshots the result, and sends it back for approval. Total: two minutes, one device, no engineer.

*Why this matters commercially:* the cost of a website in a campaign is not the build, it is the twenty-six small changes between the build and the election. The Live Desk exists to make each of them cost about ninety seconds.

### B5 — "Two editors, one laptop, one file" *(fictional)*
Both desk members have the Live Desk open on the same machine. One saves a caption, the other saves a headline thirty seconds later. On the file store there is no cross-process lock, and the in-process cache means the second write can be built on a stale read.

*What the system gives you:* atomic writes with retry, so nothing is half-written, and a tombstone list, so deletions stick. *What it does not give you:* multi-writer concurrency. The hardware spec is explicit — one writer until you are on Postgres, and Postgres at campaign #2 rather than campaign #5. Pretending a 52 KB JSON file is a collaborative database is how a campaign loses a day of captions.

### B6 — "The spreadsheet person" *(fictional)*
A well-meaning adviser opens `data/db.json` in an editor because they want to fix one date, saves it, and the desk saves a headline ten minutes later.

*Outcome:* the cache does not know about the hand edit, so the manual fix may be overwritten; and if the `removed` list was mangled, a photo the desk withdrew comes back. This is why `04-TECHNICAL-MANUAL.md` Part 8 says plainly: **do not hand-edit the store.** A CMS with no escape hatch is annoying for exactly one kind of person and essential for every other.

### B7 — "It is polling day and the host is down" *(fictional)*
07:20. The container provider is having a bad morning. The site is unreachable while people ask where the record is.

*Prepared answer:* the read-only Path D snapshot — `NEXT_OUTPUT=export` to a CDN bucket, with the rebuttal page baked in. Forms stop working; the record stays readable and citable. *Why the fallback has to be pre-decided:* in Feb 2023 the unavailability of an authoritative results portal for hours was itself the story, and the vacuum filled with old videos. A campaign that disappears during a rumour has answered the question for the other side. Trigger authority and the snapshot cadence belong in the runbook §7.4 and must be named before T-1 week.

### B8 — "The regulator asks about the list" *(fictional)*
A supporter's son leaves the campaign and asks, on WhatsApp, for his number to be removed. HQ forwards it to the desk, who has 48 hours before it becomes a story about the campaign instead.

*What exists:* the row in the Leads Inbox; `consent_at` proving when consent was captured; a delete path that removes it and purges any orphaned upload; a CSV export for the record of what was deleted and when. *What does not exist:* a self-service erasure endpoint, an automated DSR workflow, or a signed data-processing agreement between the vendor and the campaign. That last gap is a real one and is named in `10-SECURITY-AND-COMPLIANCE.md` §5 — under NDPA 2023, political opinions are sensitive personal data (s.30), and a vendor holding a supporter list without written terms is exposure, not a minor administrative omission.

### B9 — "The second campaign" *(fictional)*
Six months later, a different candidate in a different state wants the same thing.

*What transfers:* the slot system, the publish gate, the Live Desk contract, the integrity rail, the dual store, the harvesters, the runbook. *What must change before reuse:* separate database or schema per campaign (a supporter of A must never appear in B's export — a data-protection question first, an architecture question second), a fresh `SEED_VERSION`, rotated secrets, and a hard rule that no candidate image from campaign A can be bound to a frame in campaign B. *What must not be done:* run both campaigns on one shared file store.

# Part C — Reported real-world events, mapped against this system

Each event is real and cited. The right-hand column is this system's documented behaviour, with the honest limit stated. Where the answer is "this would not have helped", it says so.

| # | Reported event (date, source) | What it demonstrates | How this system behaves against it | Honest limit |
|---|---|---|---|---|
| C1 | **INEC IReV portal unreachable for hours on 25–28 Feb 2023 election day;** a wave of old videos and false "INEC was hacked / results already declared" claims followed, which INEC denied. [BBC](https://www.bbc.com/news/world-africa-64797274) · [Brand Defense](https://brandefense.io/knowledge-hub/incidents/inec-irev-cyberattack-claims-2023/) | An unavailable authoritative system is the *precondition* for a rumour | Read-only snapshot fallback (B7); ISR + CDN keep pages up when the origin is the problem; the Truth Room gives the rumour somewhere to be answered | Availability was never formally target-set (NFR-11 is a gap). A snapshot with an outdated rebuttal is also a vacuum |
| C2 | **Post-poll violence in Lagos, Rivers, Kano, Imo, documented 27 Feb 2023** by Amnesty International as fuelled by online rigging claims. [Amnesty NG](https://www.amnesty.org.ng/2023-02-27/nigeria-election-violence-must-be-investigated/) | The cost of a slow truth desk is not metaphorical | The publish path is minutes: draft → gate → save → refresh, from a phone (B1) | The system cannot shorten the *verification*, only the publication. And a rebuttal nobody shares changes nothing |
| C3 | **"Russian boy hacked INEC and released authentic results,"** debunked 9 Apr 2023. [Legit/Africa Check](https://www.legit.ng/politics/1528385-russian-boy-hacked-inecs-website-released-authentic-2023-election-results-fact-emerges/) | Fabricated technical claims travel because they sound technical | `/truth-room` searchable verdicts with evidence links; `/api/fact-check` gives other systems the same data | No defence against a story with no interest in evidence |
| C4 | **DUBAWA's 31 Dec 2023 West Africa review:** fake terrorist attacks, fake candidate-attack videos, false result claims. [DUBAWA](https://dubawa.org/viral-election-related-disinformation-across-west-africa-in-2023/) | Fake *video* of candidates is a recurring Nigerian pattern, not an American import | Click-to-play facade means the site's own pages carry no autoplaying video a screenshot can misrepresent; credits name outlets | This product cannot detect a deepfake. It can only make the record authoritative enough that a correction lands somewhere |
| C5 | **Nigeria Fact-Checkers' Coalition situation rooms for Edo (19 Sep 2024) and Ondo (15 Nov 2024).** [Africa Check](https://africacheck.org/fact-checks/blog/press-release-nigeria-fact-checkers-coalition-sets-situation-rooms-fight-false) · [CIR](https://www.icirnigeria.org/nigeria-fact-checkers-coalition-reopens-situation-ahead-of-ondo-election/) | Verification in Nigeria is coalition work with a real workflow | The design mirrors it: a ledger, dated rulings, evidence, and a webhook *into* human review rather than out of it | A candidate's desk is not neutral. Its rulings will be read as advocacy, correctly |
| C6 | **Osun governorship poll, 15–19 Aug 2026:** fake "town-hall result" graphics and duplicated result sheets on IReV. [Guardian](https://guardian.ng/news/osun-poll-same-result-sheets-uploaded-multiple-times-on-irev-paaca-alleges/) · [Premium Times](https://www.premiumtimesng.com/news/top-news/902500-analysis-osundecides2026-whats-moving-in-the-digital-information-space.html) | A fabricated **graphic** is a design problem; the defence is a citable record | Every image carries a credit and a source link; `exact` frames refuse stand-ins; the reference library is public and filterable | No tamper-evident provenance (no C2PA, no cryptographic watermark). A better-made fake graphic beats this system's design |
| C7 | **3 Oct 2026 — INEC disowned a fake "online voter registration" site** and urged Nigerians not to submit personal data; debunk republished 13 Oct. [Vanguard](https://www.vanguardngr.com/2026/10/inec-warns-nigerians-against-fake-voter-registration-website/) · [Africa Check](https://africacheck.org/fact-checks/meta-programme-fact-checks/ignore-posts-claiming-nigerias-electoral-body-announced) | Impersonation harvesting personal data is current in Nigeria | Canonical URL, `NEXT_PUBLIC_SITE_URL`, a CMS-managed official channel list, `noindex` on `/admin` | **The campaign cannot prove which site is real.** Recommended, not yet built: a published "what we will never ask for" statement (runbook §7.7, research finding 8) |
| C8 | **12 Jan 2019 — APC's own site (apc.com.ng) was hacked** and carried a document the party then disowned. [TheBoss](https://thebossnewspapers.com/headline/apc-publishes-plagiarized-document-on-it-website-blames-hackers/) | A Nigerian party's official site publishing something it must deny | Every write needs a signed session; no anonymous write path exists by design (reads/writes use separate keys); fail-closed production auth; rotate-to-revoke (§A17) | No second-person approval on publish, no immutable audit trail, no CSP yet. A stolen 12-hour cookie is a legitimate session |
| C9 | **28 Oct 2020 — Trump campaign site defaced/redirected** in a cryptolocker scam. [BBC](https://www.bbc.com/news/technology-54718865) | Campaign infrastructure is targeted for embarrassment and ransom | Edge-level block of `/admin` paths keeps the public readable while it is fixed; deployment is from a pinned artefact so a diff is meaningful | The app has no middleware, so the block is a hosting action that must be pre-scripted |
| C10 | **Aug–Sep 2024 — Iran-linked APT42/Storm-1516 breached Trump campaign email,** leaked via press, and pushed a fabricated "Harris hit-and-run" story; a deepfake Biden Ukraine video was logged separately. [NYT](https://www.nytimes.com/2024-08-11/us/politics/trump-campaign-hacking-iran.html) · [Microsoft DSTA](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/final/en-us/microsoft-brand/documents/5bc57431-a7a9-49ad-944d-b93b7d35d0fc.pdf) | The site is the least interesting target; the *communications* around it are the target | Out of scope, and said so: the site stores what a volunteer gives it, not the campaign's correspondence | **This system offers nothing against email compromise.** A campaign that needs it needs separate advice |
| C11 | **22–30 Jul 2026 — WhoisXML found 62,000+ US-2026-election domains,** including ~270 fake Georgia campaign/merch sites harvesting donor data. [AJC](https://www.ajc.com/politics/2026/07/donor-beware-that-campaign-website-could-be-a-fake/) · [Quartz](https://qz.com/fake-campaign-websites-georgia-donors-2026-midterms-073026) | A donation feature is a fraud surface, not a revenue feature | **No payment path exists in the codebase** — PRD §12, and it is an architectural absence rather than a disabled flag | None. This is the clearest case where the *missing* feature is the correct response |
| C12 | **27–28 Oct 2026 — a cyberattack forced the US FEC offline ~41 hours before midterms,** blocking mandatory 24/48-hour ad-spend disclosures. [Reuters](https://www.reuters.com/technology/hacker-trying-breach-us-federal-election-commission-system-email-shows-2026-10-27/) · [Nextgov](https://www.nextgov.com/cybersecurity/2026/10/fec-takes-down-electronic-filing-platform-after-attempted-hack/416866/) | The incumbent authority's system failed in the window that needed it most | Snapshot fallback; state that must survive is one file and one folder, so restore is minutes | A small site is not a DDoS magnet until it is interesting. The snapshot cadence is not yet automated |
| C13 | **29 Oct–1 Nov 2023 — Slovakia:** AI audio of candidate Šimečka apparently discussing vote rigging, two days before the vote; investigated three times. [CEDMOH](https://cedmohub.eu/how-ai-generated-content-influenced-parliamentary-elections-in-slovakia-the-slovak-police-will-investigate-the-recording-for-a-third-time/) | Synthetic audio can arrive inside the final 72 hours | The site's own discipline is the asset: no AI imagery, credits name outlets, rulings cite documents. A record with provenance is the only credible answer | Detection is not in scope. The response window is a person, and the gate may refuse your fastest rebuttal |
| C14 | **8 Feb 2024 — the FCC ruled AI-cloned robocall voices illegal** after the fake-Biden New Hampshire call; $6m/$1m proposed against the operative and carrier in May 2024. [NPR](https://www.npr.org/2024-05-23/nx-s1-4977582/fcc-ai-deepfake-robocall-biden-new-hampshire-political-operative) · [FCC](https://www.fcc.gov/document/fcc-settles-spoofed-ai-generated-robocalls-case) | Cloned voice is a prosecutable act, not a hypothetical | WhatsApp links are clicked by the supporter, never sent by the campaign (PRD §12) — the product cannot be used to broadcast | None of this protects against a call the campaign did not make |
| C15 | **DUBAWA (Jan 2026, covering 2025) — six AI deepfakes that deceived Nigerians,** incl. Kanu "prison" videos, a Gumi bandit-welfare clip, a fabricated Tinubu–Trump clash. [DUBAWA](https://dubawa.org/six-ai-generated-deepfakes-that-deceived-nigerians-in-2025/) | Nigerian synthetic-media cases are numerous and recent | Same as C13/C4 — the record, not the detection | **Directly local, directly unsolved.** The site's contribution is credibility of the answer, not its speed |
| C16 | **5 Jun 2026 — the Nigerian Presidency confirmed a suspect's arrest** over an AI-cloned Tinubu "State of the Nation" audio. [BBC Pidgin](https://www.bbc.com/pidgin/articles/ckgpged5k4lo) | Nigerian enforcement on synthetic political audio now exists | Nothing to build; a fact that reframes the constraint. "No AI imagery of the candidate" is aligned with a prosecutable norm, and with **EU AI Act Art. 50 (applicable 2 Aug 2026), which has no campaign carve-out** | Applicability of a European duty to a Nigerian campaign is jurisdictional, but the *professional standard* is not |
| C17 | **13 Oct 2026 — Meta and 14 firms removed 3.7m accounts/pages/groups** in a West Africa (Nigeria, Ghana) operation. [Meta](https://about.fb.com/news/2026/10/meta-tech-companies-law-enforcement-crackdown-global-scam-networks/) | Platform enforcement in this region is active and indiscriminate | No bot, no fake-engagement, no automated posting capability exists (PRD §12), so the product carries no account-loss risk | A campaign's own volunteers can still be swept up in a mass takedown. The site cannot help |
| C18 | **15 Oct 2026 — X suspended 13,000+ accounts** across three influence operations targeting US politics. [Al Jazeera](https://www.aljazeera.com/news/2026-10-15/x-suspends-13000-accounts-alleging-foreign-influence-ahead-of-us-midterms) | Coordinated behaviour is detectable at scale | As C17 | As C17 |
| C19 | **7 Jan 2025 — Meta ended third-party fact-checking** for "community notes" and dropped AI labels. [Reuters](https://www.reuters.com/technology/meta-ends-third-party-fact-checking-program-adopts-x-like-community-notes-model-2025-01-07/) | The external debunking layer a campaign could enlist was largely removed | This is the strongest evidence for the product's premise: a campaign's own citable record moved from *nice* to *primary defence* | Also means: no platform will label a fake of your candidate for you. Your record is the only instrument left |
| C20 | **22 Aug 2024 — NDPC fined Fidelity Bank ₦555.8m; 7 Jul 2025 — ₦766m on MultiChoice Nigeria;** compliance notices and a 1,368-organisation defaulter list in Aug 2025. [Reuters 1](https://www.reuters.com/business/finance/nigerian-data-agency-fines-fidelity-bank-breaches-2024-08-22/) · [Reuters 2](https://www.reuters.com/sustainability/boards-policy-regulation/nigerian-agency-fines-multichoice-766-million-naira-data-privacy-breaches-2025-07-07/) · [Legal 500](https://www.legal500.com/intelligence/nigeria/privacy/the-ndpc-compliance-notice-a-new-era-of-accountability-for-data-controllers-and-processors-in-nigeria) | Nigerian data enforcement is real, recent, and large-scale | Consent captured with a stored timestamp and exported with it; reporter PII stripped server-side *and* in RLS; data minimised by design; no voter files | **No signed data-processing agreement between vendor and campaign. `/privacy` has not been read by a lawyer.** Both are named gaps |
| C21 | **Meta's ₦32.8m-equivalent NDPC action over unlawful processing of Nigerians' data was settled/annulled by Oct 2025.** [Africanews](https://www.africanews.com/2025-10-07/meta-agrees-to-328-million-data-privacy-settlement-with-nigeria/) | The *scraping-based complaint* is a live template | Press imagery is harvested with credit and source link, from the article, and the caption states only what the report states | Consent for the *candidate's* image is an HQ/dossier matter this code cannot resolve |
| C22 | **Spanish AEPD fines on parties (PP, Podemos)** over voter scraping and publishing officials' personal data (recorded Aug 2021). [Newtral](https://www.newtral.es/multas-partidos-politicos-proteccion-datos/20210806/) | Regulators do sanction parties | No voter-roll import exists; visitors may only insert data about themselves; reading the list requires the admin session or the service role | A Nigerian equivalent is foreseeable, not present. Designing for it now is cheap |
| C23 | **Cambridge Analytica / ICO £500,000 penalty, paid 30 Oct 2019** after Facebook withdrew its appeal. [Guardian](https://www.theguardian.com/technology/2019/oct/30/facebook-agrees-to-pay-fine-over-cambridge-analytica-scandal) | The canonical case for what a supporter list becomes in the wrong hands | The list exists only because a person volunteered; it is exportable once and timestamped; it is not joinable to any voter file | Data retention after the election is undecided — runbook §9 forces the question |
| C24 | **"The Long Fuse" (2 Mar 2021) — the Election Integrity Partnership's** coordinated rumour-response model. [EIP](https://www.eipartnership.net/report) · **26 Oct 2026 — UW CIP's live 2026 election-rumour tracker.** [UW](https://www.washington.edu/news/2026-10-26/the-center-for-an-informed-public-is-tracking-rumors-that-put-elections-at-risk/) | Rumour response works as a *pipeline* with a written stage definition | The playbook in runbook §7.1 is that pipeline at campaign scale: capture → timestamp → assess → draft → gate → publish → distribute by hand | Our pipeline has no logging of who did what and when inside the CMS. An audit trail is the obvious next build |
| C25 | **Aug 2026 — "Manufactured Doubt,"** Brain Builders + FactCheckHub pre-election threat assessment for Nigeria 2027 (AI and misinformation patterns). [PDF](https://thebrainbuilders.org/wp-content/uploads/2026/08/Manufactured-Doubt-Pre-Election-Digital-Threat-Assessment.pdf) | The nearest available spec for what this site will be attacked by | Not yet read against the requirements — recorded as research finding 3 with an action, not a claim of alignment | **This document was not in the input set when requirements were frozen.** It should re-open them |
| C26 | **Prebunking evidence:** Biddlestone et al. (2026), video inoculation across 12 EU countries voting in June 2024. [Nature Comms Psychology](https://www.nature.com/articles/s44271-025-00379-3) · van der Linden et al. (2026), Instagram field study — treated users ~21 points better at spotting manipulation. [HKS Misinformation Review](https://misinforeview.hks.harvard.edu/article/prebunking-misinformation-techniques-in-social-media-feeds-results-from-an-instagram-field-study/) | Prevention measurably works, and works before exposure | Not built. The site is purely responsive today | A "how we verify / how a fake is made / what we will never post" page is content, not code — the highest-value unsolicited improvement in this dossier |
| C27 | **Madrid-Morales et al. (2026)** on civil-society coalition-building and information integrity in four African elections. [ICS](https://www.tandfonline.com/doi/full/10.1080/1369118X.2026.2647360) · [CINIA companion (13 May 2025)](https://cinia.africa/tackling-disinformation-in-four-african-elections/) | Effect depends on coalitions, not on a single artefact | `/api/fact-check` is an open read surface so other systems can query the record; the ledger's data is exportable | The candidate's desk cannot be a neutral coalition member. Publishing into that network is a relationships problem |
| C28 | **MyNeta (India), continuous since 2003,** candidate affidavit and record pages; live for Tamil Nadu 2026. [myneta.info](https://www.myneta.info/) | A "verified public record page" can become an institution | The design intent of `/impact` and `/impact#sources` is exactly this: dated, linked, filterable, maintainable without a deploy | Longevity is the whole lesson, and it is an organisational one. Sites die when the volunteer who ran them leaves |

# Part D — Disparate and adjacent uses

Recorded because the pattern transfers further than the campaign, and because a reader will ask.

**In-politics, adjacent:** a municipal or ward-level candidate with the same budget shape (this is the natural repeat market); a party's multi-candidate slate, one deployment per campaign with separate stores; an incumbent converting campaign-mode into office-mode — which keeps the publish gate and changes the lawful basis for volunteer consent; a political *opponent's* fact desk, which is the same software pointed at claims from the other direction and is worth saying plainly, because it is the honest test of whether the gate is real.

**Outside politics, same shape:** any organisation whose public claims must be sourced and whose communications team is not technical — an NGO under donor audit, a hospital or university communications office, a regulated industry with advertising rules, a professional association, a family business in a reputational dispute. The transferable core is three things: the frame system, the evidence gate, and the self-grading rail. The rest is content.

**Smaller:** a church, school, or traditional-council site run by volunteers who will never open a dashboard — the Live Desk is genuinely the right answer there, and the gate is harmless. A memorial page, where "no stand-in photographs" is a moral rather than a political rule.

**Hostile or uncomfortable uses to name before someone else does.** The gate can be a weapon of delay: a rule that requires evidence to publish lets whoever holds the CMS decide that nothing is evidence. That is a governance problem — which is why the runbook assigns publish authority to a named person and why the rail's findings are inspectable by a second one. The `display:none` worklist hints are invisible to voters, which is honest only if the rail itself stays honest; a team that learns to enjoy a low score is in trouble. And "anonymised case study" can become "the next campaign can tell who this was": `00-DOCUMENT-INDEX.md`'s convention exists precisely because the constituency is small enough that a screenshot identifies the client.

# Part E — Rejected use cases (requests this product says no to)

| Requested by the category | Refused because |
|---|---|
| Bulk posting / scheduling to WhatsApp, X, Facebook | Astroturfing and platform-coordination risk; the removals in C17/C18 are recent and regional. Also PRD §12: no such route exists |
| Donations / payment page | C11 (~270 fake campaign sites harvesting donor data in one US state) plus unresolved Nigerian law on contributions for this office |
| Voter-roll import, name-matching, psychographic scoring | NDPA s.30 makes political opinions sensitive data; C22/C23 are what that ends in |
| AI-written captions, headlines, or rulings | ADR-013; Gillespie & Pomerantz (2020) on automation as a scale compromise; and a generated sentence about a real candidate is the one liability this site exists to avoid |
| AI-generated or "restored" imagery of the candidate | Constraint 1; EU AI Act Art. 50(4) deepfake disclosure (from 2 Aug 2026); C13–C16 including a Nigerian prosecution |
| Auto-publishing from the War Room on a schedule | PRD §12; human-in-the-loop as a property of the request graph (§A15) |
| Scraping a rival's site into "opposition research" | Data-protection and platform-terms exposure; also the sort of thing that becomes the story about you |
| A single "god mode" shared login | The 12-hour cookie is not named; shared credentials make an incident unattributable (runbook §1) |
| A generic page builder with drag-and-drop layout | It would make `exact` frames, the crop gate, and the ring contract decorative. The layout is code because the layout is the argument |
| Deleting `data/` to "reset" during a demo | Real leads die. `04-TECHNICAL-MANUAL.md` Part 8 says so explicitly |

# Part F — Coverage check

| PRD objective | Use cases that exercise it |
|---|---|
| O1 citable record | A1, A2, A3, A4, A22, B1, C5, C6, C28 |
| O2 publish without an engineer | A10, B1, B4, C8 |
| O3 usable on real phones | A9, A21, B2, §5 hardware |
| O4 survives being attacked as a document | A2, A5, A12, A22, B3, C1–C7, C11, C13, C19 |
| O5 answer a rumour quickly | A16, B1, B7, C1, C2, C24 |
| O6 lawful on personal data | A13, A14, B8, C20–C23 |
| O7 reads as calm and official | A6, A7, B2, B3 |
| Editing surface invisible to voters | A9, A17, C8 |
| Data survives deploys | A20, B5, B6 |
| Multi-campaign reuse | B9, Part D |

Unexercised by any use case above, and therefore unverified: keyboard-only operation of the Live Desk, screen-reader behaviour, load at 500+ concurrent readers, and the volunteer route under a hanging third party (known defect, A14). These are the honest edges; `09-QA-AND-TEST-EVIDENCE.md` keeps the list.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0: 22 abstract cases, 9 fictional scenarios, 28 cited real-world events mapped against documented behaviour, adjacent-use analysis, 10 refusals, coverage matrix | i2sltd.tech |
