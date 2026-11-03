# User Stories and Journeys

**Document:** 07-USER-STORIES-AND-JOURNEYS.md
**Version:** 1.0
**Written:** 3 November 2026
**Basis:** the eleven public routes, the nine CMS tabs and the Live Desk as they exist in the 3 Nov 2026 build. Stories marked **verified** were exercised in a browser during this project; stories marked **[gap]** describe intended behaviour that has not been tested and must not be presented as done.
**Names:** personas are composites invented for this document. The candidate, party and constituency are referred to by role, per `00-DOCUMENT-INDEX.md`.

---

## 1. Personas

### P1 · The voter — "Tunde, 38, Festac"
Works in Lagos mainland, commutes, reads WhatsApp before he reads anything else. Post-paid data bundle, mid-range Android, Chrome, one hand, often in traffic. Has heard the candidate's name at least twice — once favourably in a group, once not. Judges a website in under a second, mostly by whether it loads and whether it looks official. **Cares about:** is this real, has he actually done anything, how do I reach a human. **Against him:** a heavy page, a bright palette, anything that looks like a template, and any claim with no source behind it.

### P2 · The resident with a problem — "Mrs Adeyemi, 61, Mile 2"
Not comparing candidates; she has a blocked drain and has been told about the open-door office. Type size matters more than typography. May be on someone else's phone. **Cares about:** does this actually reach somebody, and will I be blamed for using it. **Against her:** a form that eats the submission, a confirmation number that implies a system nobody staffed, and any risk of her name appearing publicly.

### P3 · The journalist / blogger — "Chinedu, 29, covers Lagos politics"
Writes on deadline from a group broadcast, not from an interview. Wants to quote something and be able to defend the quote. **Cares about:** dates, sources, who wrote it, when it changed, and whether the site is honest about what it cannot evidence. **Against him:** a site that hides its sourcing behind a PDF, or that shows stock imagery it passes off as reportage.

### P4 · The opponent's digital team — "the campaign on the other side"
Not a user to serve, but the most careful reader of the site. Screenshots the weakest sentence, looks for stand-in photographs, checks whether an AI image was used, and tests whether a form leaks. **Cares about:** anything the campaign cannot source. **The product's posture:** the publish gate and the integrity rail exist to make this job produce nothing.

### P5 · The communications lead — "Ada, 34, two other jobs"
Writes the sentences and decides what goes live. Uses a laptop in the evening and a phone in the day. Is not a web person and is right not to be. **Cares about:** change something now, see the result, and not break the site. **Against her:** a CMS that describes the website back to her instead of showing it.

### P6 · The candidate — the principal
Dictates sentences; does not type them. Reads the site as his own public record. **Cares about:** accuracy, dignity of the imagery, and whether the site can keep up with a day.

### P7 · The ward agent / desk volunteer
Files resident reports, receives volunteer leads, forwards the Truth Room link into groups. Low device quality, high volume of WhatsApp. **Cares about:** that a thing he sent is genuinely recorded.

### P8 · Operations / the vendor engineer — one person, i2sltd.tech
Deploy, back up, respond at night. Is also the bus factor of 1, which the PRD names as a risk and the documentation set is meant to mitigate.

## 2. Core stories

Format: story → acceptance criteria → status. **verified** = exercised in this project and recorded in `09-QA-AND-TEST-EVIDENCE.md`; **[gap]** = intended, not tested.

### Voter

**V1** — As a voter on a phone, I want the page to load without spending much of my bundle, so I actually read it.
· Per-page JS 87–102 kB; no third-party payload before a tap; no horizontal overflow at 360×740.
· JS budget **verified** on the local build; **no field measurement over a real Nigerian mobile network [gap]**.

**V2** — As a voter, I want to know this is the real site and not a fake.
· Canonical URL and confirmed official channels are CMS-managed; `/privacy` states the basis; footer names the developer.
· **verified** as present. A published "what we will never ask for" statement is **recommended and not built [gap]** (see `06-USE-CASES.md` C7 and runbook §7.7).

**V3** — As a voter, I want to see whether he has done anything, not just what he promises.
· `/impact` is dated, category-filterable, and every verified entry links to the report that evidences it; `#sources` is a filterable library of 21 dated press links.
· **verified** (rendering, filters, deep link below the sticky header).

**V4** — As a voter, I want to check a claim my group sent me.
· `/truth-room` server-rendered ledger with instant client search and verdict chips; `GET /api/fact-check?q=&verdict=` for other systems.
· **verified**.

**V5** — As a voter, I want a photo of the candidate to show his face, not a crop of his chin.
· Frame ratios declared per position; per-slide fit in the carousel; 34% crop gate before a photo is bound.
· **verified** in-browser on 3 Nov 2026 (145×203 contained figure, feet clearing the caption band) after the defect was found.

**V6** — As a voter, I want the page not to scream at me.
· Calmed palette; a scripted contrast pass reports no remaining AA failures for body text (gradients and pattern backgrounds excluded from that claim).
· **verified** as scripted; a full human audit is **[gap]**.

**V7** — As a voter with motion sensitivity, I want the carousel and the numbers not to move.
· `prefers-reduced-motion` is honoured in code.
· **verified** in code only. **WCAG 2.2 SC 2.2.2 wants an explicit pause/stop control for auto-updating content, and the carousel has no visible one [gap]** — found by the research pass, scheduled in `12-…CHECKLISTS.md`.

**V8** — As a voter who shares the site, I want the link to look like something when it lands in a group.
· Per-route metadata, OG share image, `NEXT_PUBLIC_SITE_URL` for canonicals.
· **verified** as emitted; rendering in a WhatsApp preview on a Nigerian device is **[gap]**.

**V9** — As a voter, I want to reach a person, not a form that lies to me.
· Sticky thumb-reach bar opens WhatsApp with a prefilled message; the footer and `/contact` carry desk lines.
· **verified** for the links and the safe-area inset.

### Resident

**R1** — As a resident, I want to report a problem in my ward in two minutes.
· Ward, category, detail, optional name/number, explicit NDPA consent; 44 px fields; 16 px input text so iOS does not zoom.
· **verified**.

**R2** — As a resident, I want my phone number to stay private.
· Stored unpublished; `toPublic()` strips name, phone and consent server-side; the RLS policy mirrors it.
· **verified** by code review and endpoint response; a hostile probe of the public feed **[gap]** was not attempted on a live host.

**R3** — As a resident, I want to see whether anyone actually did anything.
· `/help-desk` progress dashboard with live counters and status/ward filters; six dated desk entries seed it so it is never empty.
· **verified**.

**R4** — As a resident, I want to book the open door.
· In-person or WhatsApp call, date and window preference, filed as an inquiry; **deliberately shows no confirmation number** because a human calls back.
· **verified**. The honesty choice is a story in itself: a fake confirmation number would be the one lie this page could tell.

### Journalist

**J1** — As a journalist, I want the source behind any claim in one click.
· Evidence link per ledger row; credit-per-photo as a link to the outlet.
· **verified** — and it is the mechanism by which the four `block` lines are discoverable.

**J2** — As a journalist, I want to know what the site thinks of itself.
· The integrity rail's numbers are quoted in the project's own documentation: **40 / not ready, 4 unsourced published lines.**
· **verified** as computed. The endpoint itself is session-gated; the *disclosure* is in the docs rather than in the public HTML.

**J3** — As a journalist, I want to know if something was corrected.
· Withdrawal is explicit (`DELETE`/unpublish) and tombstoned against resurrection.
· **verified** for tombstones. There is **no public correction log or revision history [gap]** — a stated limitation, not an oversight (ADR-032).

### Desk

**D1** — As the communications lead, I want to change one sentence where I can see it.
· `⌘E` reveals rings; tap the sentence; edit; Save; the page redraws in place with scroll preserved.
· **verified end to end in a browser on 3 Nov 2026**, including undo and restore.

**D2** — As the desk, I want to be told no before I embarrass the campaign.
· The gate refuses an unsourced row and a `javascript:` URL, with the route's own wording, from either surface.
· **verified** — `scripts/check-cms-gates.mjs` 12/12, run twice.

**D3** — As the desk, I want to put a clip on the site from a link.
· `⌘K` parses the URL, resolves the id, and the server's oEmbed fills title and outlet; a human edits and saves.
· **verified**.

**D4** — As the desk, I want a photo to fill the right frame without guessing.
· Tap the frame → picker scoped to that frame, each candidate drawn in a live crop of itself with the discard percentage.
· **verified**.

**D5** — As the desk, I want to know what is wrong with the site before someone else tells me.
· The rail lists findings and "Show me on the page" navigates and outlines the offending sentence; queue-only findings deep-link to `?tab=`.
· **verified** for navigation and outlining. **Scroll-following of the rings could not be exercised in the test surface [gap]**, and screenshots could not be captured there (hidden visibility) — both disclosed rather than glossed.

**D6** — As the desk, I want to undo.
· `⌘Z` replays the route with the previous value.
· **verified**. Session-scoped and in memory — durable recovery is the backup, and that limit is written into the story rather than discovered later.

**D7** — As the desk, I want bulk work to still have a proper dashboard.
· Nine tabs; CSV export with the consent timestamp; spam/duplicate deletion on both lists.
· **verified**.

**D8** — As the desk, I want nothing to publish without me.
· No timer, no webhook-only path, no model in the editing layer.
· **verified** by code review — this is an architectural absence, which is the strongest form of the claim.

### Candidate

**C1** — As the principal, I want to dictate a sentence and have it on the site within minutes.
· Story P6 → D1. `06-USE-CASES.md` B4 is that scene end to end (two minutes, one device).
· **verified** as a path; not yet rehearsed under a real deadline **[gap]**.

**C2** — As the principal, I want no fake picture of me anywhere.
· Constraint, enforced by `exact` frames and by refusing AI imagery outright.
· **verified**: no AI-generated imagery of the candidate exists in the library; three generated graphics are non-portrait and labelled.

### Operations

**O1** — As ops, I want to deploy without an engineer between the CMS and the data.
· Every write revalidates the page it feeds; ISR windows 300–3600 s.
· **verified** locally on the production build; **no production host assigned [gap]**.

**O2** — As ops, I want one file to back up.
· `data/db.json` + `public/images/uploads`; restore is a copy and a restart.
· **verified** as a mechanism; a timed restore drill on a scratch box is **[gap]** and is a monthly runbook item.

**O3** — As ops, I want to revoke access instantly.
· Rotate `ADMIN_PASSWORD` + `ADMIN_SECRET`; stateless cookie means every session dies at once.
· **verified** in the auth code; the operational runbook makes rotation the leaver procedure.

## 3. Journeys

Narrative maps, per persona, at the moment they actually happen. The right-hand column is not a UI note; it is the requirement this step places on the system.

### J1 · Voter — the WhatsApp forward (highest-volume journey, and the one that decides the election outcome of this site)

| Step | What happens | What the system must do |
|---|---|---|
| 1 | Tunde sees a forwarded card with the site link in a residents' group, alongside two contradictory claims | The preview card must look official — OG image, clean title (V8) |
| 2 | He taps, on 4G, one hand | First meaningful paint under a second on the ISR path; no third-party download before he asks (V1) |
| 3 | 500 ms of glance. He decides whether this is serious | Calm palette, real photographs, no template debris. This is a research finding, not taste — Fogg et al. (2001) put ~46% of credibility judgements on look-and-feel first; Selejan et al. (2016) on ~500 ms exposure (`02-…DISCOVERY.md` §3.1) |
| 4 | He scrolls to the record. Does he believe it? | Every entry dated and linked to a report (V3) |
| 5 | Someone in the group says the road photo is old | The photo's credit names the outlet and links to the article (V3, D4) |
| 6 | He searches the claim he came to check | `/truth-room` instant search + verdict chips (V4) |
| 7 | He wants to ask something | `/truth-room` "Ask Ola" or `/help-desk`; the sticky bar for WhatsApp (V9) |
| 8 | He forwards the link, or he doesn't | The URL must survive being the only context. Deep links land below the header (V3) |
| Exit | **He did not log in, fill a form, or need data he did not have.** The site's job at step 3 is over if it fails | |

*Failure mode to design against:* at step 4 he finds a claim with no source. He will not conclude "four of them are sourced" — he will conclude the site is campaign material. **Today four lines are exactly that**, and the honest answer is the go-live checklist, not a defence.

### J2 · Resident — the blocked drain (the highest-trust journey per visitor)

Mrs Adeyemi hears about the office from a neighbour → opens `/help-desk` on her son's phone → reads the progress dashboard and sees a ward like hers marked resolved → taps Report an issue → fills ward, category, detail, her number, ticks consent → submits → sees that it is *received and reviewed by a person*, not published → the desk sees it in Help Desk that evening → status and a plain-language progress note are set → the desk publishes the row, and only the row, with the contact fields stripped → she looks again a week later and finds her issue with a date on it.

*The whole journey rests on one asymmetry:* she must be able to see other people's problems before she is asked for her own data. Six dated desk entries seed the board so the page is never empty, and the counters make progress legible without a single name. *System requirements:* R1, R2, R3, and `toPublic()` with RLS behind it (ADR-025).

### J3 · Desk — the 21:40 rebuttal (where the product's design is actually tested)

`06-USE-CASES.md` B1 narrates it. The structural beats: capture and timestamp the claim → open the page she will edit → draft → **be refused** because there is no document → find the report → attach → save → see it live in place → check in a private window → send the link herself.

*The story's meaning:* the two moments that make it credible are the refusal and the private-window check. A tool that let her publish an unsourced rebuttal in eleven minutes would have been faster and would have cost the campaign more.

### J4 · Candidate — the dictation

In a car, on a call → tells Ada the sentence → she opens `/`, taps, dictates, saves, screenshots, sends it back for approval → he approves or amends → she `⌘Z`-s if needed. Two minutes, one device, no engineer (B4). *Why it justifies the whole CMS decision:* the cost of a campaign website is not the build; it is the twenty-six small changes after it.

### J5 · Journalist — the ninety-second audit

Chinedu needs to quote one line under deadline → opens the page → finds the claim → clicks the evidence link → the report states it, with a date and an outlet → he quotes it → he also checks whether anything on the site is *not* sourced, because that is the story. **In this project that check would find four lines**, documented in the project's own README and PRD.

*The design bet, stated:* a site that publishes its own weaknesses is more usable to a hostile reader — and therefore more credible to a neutral one — than a site that hides them. If that bet is wrong, nothing here is, because the alternative is the campaign discovering the gaps in a headline instead.

### J6 · Ward agent — the lead that must count

Files a volunteer at a doorstep → the form asks for consent and states why → the row lands with `consent_at` → the agent sees nothing, which is correct → Ada exports the ward's CSV that evening → the volunteer gets a WhatsApp welcome — **or does not, if the outbound call is slow, because the handler awaits it without a timeout** (A14, runbook §7.5).

*Honest note:* this journey contains the project's clearest known defect, and it sits in the campaign's most valuable moment: a person who has just agreed to help, waiting on a spinner.

### J7 · New engineer — the takeover (a journey nobody plans for and every project needs)

Receives a URL and a password → `00-DOCUMENT-INDEX.md` for precedence → `08-DEVELOPER-WORKFLOW.md` for conventions → `04-TECHNICAL-MANUAL.md` Part 2 for the install → `npx tsc --noEmit` → `npm run build` → `next start` → `check-cms-gates.mjs` 12/12 → opens `/impact` with `⌘E` and reads the rail → knows more about the site's health than about its git history, **because there is no git history** — no `.git` in this repository, which the manual's Part 6 step 1 makes the first thing they do.

## 4. Story-to-requirement index

| Story | PRD requirement | ADR |
|---|---|---|
| V1, V2, V3, V4, V8 | FR-15, FR-32, NFR-1, NFR-8 | ADR-001, ADR-016, ADR-021 |
| V5 | FR-16, FR-17 | ADR-017, ADR-018, ADR-019 |
| V6, V7 | NFR-5, NFR-6, NFR-7 | — (audit gap: ADR-032) |
| V9 | NFR-4 | ADR-001 |
| R1–R4 | FR-21…FR-25 | ADR-025, ADR-002 |
| J1–J3 (desk) | FR-7…FR-14 | ADR-009, ADR-010, ADR-011, ADR-012, ADR-013 |
| D2 | FR-1 | ADR-008 |
| D5 | FR-2, FR-3 | ADR-014 |
| D6 | FR-10 | ADR-032 (deferred version DB) |
| C2 | constraint 1, FR-5 | ADR-012, ADR-026 |
| O1–O3 | FR-29, FR-26, release criteria | ADR-002, ADR-006, ADR-029 |

## 5. Training the desk (what actually gets used)

Three screens, thirty minutes, one rehearsal. Anything more and it will not be used under pressure.

1. **Thirty seconds on `⌘E`.** Open `/impact`, arm the desk, change one word in a caption, save, see it change, `⌘Z` it back. Do this twice. The learning is that the page is the editor and that nothing is broken when the ring appears.
2. **Thirty seconds on the rail.** Open it, read the score, press "Show me on the page" on one finding, and see a sentence outlined. This is the moment a desk member understands what "unsourced" costs, and it is worth more than a written policy.
3. **Ninety seconds on `⌘K`.** Paste a real YouTube link; watch it become an intent; let the server fill the title. Then paste an article link and cite it.
4. **One full rehearsal, timed, on a preview environment:** a fabricated rumour, drafted, refused, evidenced, published, checked in a private window, distributed by hand. Runbook §16 in the deployment guide sets this at T-4 weeks; it is the single highest-value hour in the plan.
5. **What to tell them not to do:** do not hand-edit `data/db.json`; do not try to empty an evidence link; do not caption a photograph beyond what the article says; do not expect undo after a reload; do not ask for a feature that posts automatically, because it does not exist and will not.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0: 8 personas, 34 stories with explicit verified/gap status, 7 journey maps, story-to-requirement index, 30-minute training plan | i2sltd.tech |
