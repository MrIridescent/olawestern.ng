# Pre- and Post-Programming Checklists

**Document:** 12-PRE-POST-PROGRAMMING-CHECKLISTS.md
**Version:** 1.0
**Written:** 3 November 2026
**Use:** these are gates, not advice. A phase is complete when its list is complete, and every item names the evidence that closes it. Where an item cannot be closed by the engineering side, it names the human who can.

**Legend:** ☐ open · ☑ closed with evidence · ⊘ not applicable to this engagement · **[owner]** who can tick it.

---

## Phase 0 — Before any code was written (pre-programming)

Retained as the list that *should* be run for the next campaign, with this project's actual state marked. It is honest that three of these were done after code rather than before; that ordering is a finding, not a footnote.

| # | Gate | Status | Evidence / note |
|---|---|---|---|
| 0.1 | Written brief and objectives, in the client's own words | ☑ | Seven source documents received before code; recorded in `02-…DISCOVERY.md` §1 with what each established |
| 0.2 | Named decision-maker for content, with a phone number | ☐ | **Still open** — PRD §14 Q1. Blocking for incident response |
| 0.3 | Hard constraints captured as constraints, not preferences | ☑ | PRD §4 — no AI imagery, no invented claims, human-in-the-loop, no astroturfing, secret rotation, no wholesale data deletion |
| 0.4 | Audience and device reality researched | ☑ | `02` §2 (NCC industry statistics, A4AI affordability target, Lighthouse throttling conditions) |
| 0.5 | Legal regime identified before feature design | ☑ *partially* | NDPA 2023 s.30 (political opinions = sensitive data) was mapped in `10` §5 after the forms were built. The forms happen to be compliant in shape — **run this gate first next time** |
| 0.6 | Data inventory: what will we hold, why, for how long | ☑ | `10` §1 and §5 |
| 0.7 | Retention and post-project disposition decided | ☐ | **Still open** — runbook §9 forces it; needs a date from HQ |
| 0.8 | Source material supplied *with* its evidence links | ☐ *partially* | The dossier supplied 21 references; four claims arrived without one. **This is the gate that should have blocked those four from going live** |
| 0.9 | Brand, tone and colour direction agreed | ☑ | "Not too bright, ease of reading, PR and reputation management" → `15` palette pass, `02` §3.1 credibility research |
| 0.10 | Hosting decision, budget and owner named | ☐ | **Still open** — no production host assigned; `DEPLOYMENT-GUIDE.md` §4 decision matrix and §17 cost shapes exist for this purpose |
| 0.11 | Repository initialised with history and a `.gitignore` that protects state and secrets | ☐ | `.gitignore` is correct (`/data`, `.env*.local`); **there is still no `.git`** — `08` §1 |
| 0.12 | Definition of "done" written down before the first feature | ☑ | Now `08` §9; written after the fact |
| 0.13 | Accessibility target chosen and *scoped* | ☑ *revised* | WCAG 2.2 as a voluntary benchmark, with the audit boundary stated (`10` §8) — sharpened by the research pass, which found the SC 2.2.2 miss |
| 0.14 | Non-goals written down so refusals are documented, not improvised | ☑ | PRD §12, `06` Part E |

**Lesson for the next engagement, in one line:** run 0.8 and 0.10 before 0.11. This project built a publish gate that then had to grade its own founding content — which is defensible, but it is not the same as never having published it.

## Phase 1 — Before each release (development gate)

Run in order. This is the §3 regression set of `09-QA-AND-TEST-EVIDENCE.md` expressed as gates with pass conditions.

| # | Gate | Pass condition | Blocking? |
|---|---|---|---|
| 1.1 | Type check | `npx tsc --noEmit` silent | Yes |
| 1.2 | Production build | `npm run build` succeeds; shared JS and per-page JS compared to the 87.2 kB / 87–102 kB baseline; any rise explained in the PR | Yes |
| 1.3 | Runtime parity | Tested on `next start`, not dev-only, for anything touching caching, revalidation, images or headers | Yes |
| 1.4 | Gate script | `node scripts/check-cms-gates.mjs` → **12/12** and "0 leftover" | Yes |
| 1.5 | New handler audited | Any new `/api/admin/**` route starts with `isAdminRequest` and has a **new assertion in the gate script** | Yes |
| 1.6 | No bypassed write path | Any new script mutates through `/api/admin/**`, never by editing `data/db.json` | Yes |
| 1.7 | Content safety | No change lets a claim save without evidence, an `exact` frame accept a stand-in, or a resident's name/phone/consent reach a public response | Yes |
| 1.8 | Voter invisibility | Anonymous HTML contains no ring markup, no dock, no listeners; `grep -c 'data-ow-missing'` = 0 | Yes |
| 1.9 | Third-party bytes | Nothing from Google/others downloads before a tap; YouTube still loads after a click only | Yes |
| 1.10 | Revalidation coverage | Every page that renders the changed value is in `src/lib/revalidate.ts`, and the change is visible on the live page in a **private window** | Yes |
| 1.11 | Mobile sweep | 360×740, no horizontal overflow, targets ≥44 px, inputs 16 px | Yes |
| 1.12 | Contrast pass | No new AA failure for body text; gradient/pattern exclusion stated with the claim | No, but a failure needs a written reason |
| 1.13 | Integrity score | Score did not fall, or the fall is explained in the release note | No |
| 1.14 | Secrets | No secret in any tracked file; nothing sensitive behind a `NEXT_PUBLIC_*` name; `.env.example` updated with a comment for any new variable | Yes |
| 1.15 | Docs updated | `README.md` (behaviour), `03` ADR (decision), `04` Part 5 (new failure mode), `01` PRD (requirement), `05` runbook (operator action), `00` change log (date) | Yes |
| 1.16 | Rollback exists | One `git revert` or a previous artefact identified | Yes — **currently impossible, see 0.11** |
| 1.17 | Dependency change justified | New runtime dep ships with a bundle number and a reason the four-package ceiling moved | Yes |

## Phase 2 — Before the first public deployment (go-live gate)

Split by owner, because half of these are not engineering tasks and the list fails when that is not visible.

### 2.A — Engineering, blocking

| # | Gate | Evidence that closes it |
|---|---|---|
| 2.A.1 | All three dev secrets rotated in the hosting environment (`ola-admin-2026`, `warroom-dev`, the `ADMIN_SECRET` fallback) | `DEPLOYMENT-GUIDE.md` §14; a paste of the env var names (not values) from the host |
| 2.A.2 | `ADMIN_SECRET` is a long random string independent of the password | `10` §2 — otherwise password rotation silently ends all sessions |
| 2.A.3 | Persistent write path proven: mounted `DATA_DIR` volume **or** Supabase with `0001` then `0002` applied and `SUPABASE_SERVICE_ROLE_KEY` set | A save from each of the nine tabs, then a redeploy, then the row still exists |
| 2.A.4 | Both DNS names resolve, redirect, and carry valid certificates (`olawestern.ng` + `www`) | `curl -sI` on both |
| 2.A.5 | Security headers present on the live host | `curl -sI https://… \| grep -i strict-transport-security` — a proxy can strip them silently |
| 2.A.6 | Edge rate limiting on `/api/admin/login` and the public capture forms | Cloudflare rule or Caddy `rate_limit` config, quoted |
| 2.A.7 | `/admin` allowlist or WAF rule configured | Same |
| 2.A.8 | CSP shipped at least reporting-only | `10` §4 |
| 2.A.9 | Backup job running off-box, with **one timed restore drill** | Restore measured in minutes, written into `09` §4 |
| 2.A.10 | Log drain with retention | The `/admin` store badge and the `save()` retry messages are visible somewhere central |
| 2.A.11 | Synthetic monitoring from ≥2 regions **including a West African vantage** | Alert rule and a test fire |
| 2.A.12 | Gate script run against the production URL | `BASE=https://… node scripts/check-cms-gates.mjs` → 12/12 |
| 2.A.13 | Voter test executed on the live URL | `08` §8 step 9 / `DEPLOYMENT-GUIDE.md` §16.4, with the four checks recorded |
| 2.A.14 | Real-network performance measured on a Lagos mobile connection, two times of day | Numbers against NFR-8: TTFB p75 <600 ms cached / <1.2 s uncached, LCP <2.5 s, INP <200 ms, <500 kB to first useful interaction |
| 2.A.15 | Path D read-only snapshot built, deployed and rehearsed | Who can trigger the cutover, by name, and a timed drill |
| 2.A.16 | `/api/volunteer` outbound calls have a timeout | Closes the known defect (`09` §4, `10` §9 item 7). Not yet done |
| 2.A.17 | Repository initialised; baseline commit from the artefact that shipped | `git log` shows it |

### 2.B — Campaign (HQ), blocking

| # | Gate | Who |
|---|---|---|
| 2.B.1 | **Resolve the four `block` lines**: supply a report or document that *states* each claim, or withdraw it — indigent healthcare relief, youth tournament sponsorship, community vigilante/estate security, and the `/truth-room` accessibility ruling | **[HQ]** — no engineer can close this. The bar is the flagbearer precedent: the report names the party, the office and the constituency, not merely the candidate |
| 2.B.2 | Lawyer has read `/privacy` and approved the wording, including the lawful basis and how a supporter withdraws consent | **[HQ + counsel]** |
| 2.B.3 | Data-processing agreement signed between campaign and vendor | **[HQ + vendor]** |
| 2.B.4 | Response-time commitment for a rumour (2 h / 12 h / next morning) — O5 is mechanically capable; HQ must set the number | **[HQ]** |
| 2.B.5 | Four empty `exact` frames photographed and uploaded, **or** HQ has signed off on those pages showing the branded panel | **[HQ]** — `family-portrait`, `hq-office`, `23-road-inspection`, `community-security` |
| 2.B.6 | Reconcile the outstanding-work Help Desk entry with the broadcast report of completed work, and rule on whether the clip publishes | **[HQ]** |
| 2.B.7 | Confirm the campaign's own YouTube handle before it is listed (`socials.youtube` is currently `null`) | **[HQ]** |
| 2.B.8 | Confirm every social handle in Site Copy → Official channels; a confirmed row becomes a live link at once | **[HQ]** |
| 2.B.9 | Written confirmation for the remaining candidate-file facts; a blank value stays off About | **[HQ]** |
| 2.B.10 | Name ward desk officers on `/contact` | **[HQ]** |
| 2.B.11 | Three to five named CMS credential holders, a written issuance log, and a leaver procedure that rotates secrets the same day | **[HQ]** |
| 2.B.12 | NDPC/`/privacy` disclosure that the campaign will never ask for money, a BVN, or voter-card details — published, because impersonation harvesting personal data happened in Nigeria in Oct 2026 | **[HQ]** |
| 2.B.13 | Decide whether to submit to the HSTS preload list, deliberately, knowing it is hard to undo | **[engineering + HQ]** |
| 2.B.14 | WhatsApp Cloud API template approved; `WAR_ROOM_WEBHOOK_URL` pointed at the real War Room | **[HQ + vendor]** |
| 2.B.15 | If political advertising will be bought: Meta identity verification and "paid for by" disclaimers understood as HQ's obligations, not the site's | **[HQ]** |
| 2.B.16 | Retention and post-election disposition date set for volunteers, inquiries and Help Desk reports | **[HQ]** |
| 2.B.17 | Domain and hosting renewals calendared with an owner | **[HQ]** |

### 2.C — Desk readiness (blocking; the launch fails without it even when the software is correct)

| # | Gate | How it is proven |
|---|---|---|
| 2.C.1 | Every credential holder has completed the 30-minute training (`07` §5) | They change a caption on a preview, undo it, and read a rail finding aloud |
| 2.C.2 | One full rumour-response rehearsal, **timed**, end to end | `05` §7.1: capture → draft → refused → evidenced → published → private-window check → hand distribution |
| 2.C.3 | Every desk member has opened the site on the cheapest phone and network they can find | A screenshot they took themselves, from a cell, not from the office Wi-Fi |
| 2.C.4 | The `/admin` store badge is understood: everyone can say which store they are saving to | Ask one of them |
| 2.C.5 | Incident escalation ladder printed or pinned, with names and numbers | `05` §8 |
| 2.C.6 | Deploy freeze understood: after T-1, only security fixes and CMS edits | Confirm the desk knows the site is still editable during a freeze — that is the point of the design |

## Phase 3 — In the first 72 hours after launch

| # | Check | Cadence |
|---|---|---|
| 3.1 | Home page loads from a cold cache; LCP feels right on a phone | Immediately, then hourly for 24 h |
| 3.2 | `check-cms-gates.mjs` against the live URL | Once after DNS flips, then weekly (runbook §3) |
| 3.3 | One real volunteer submission: row appears, CSV contains `consent_at`, WhatsApp welcome delivered or its absence explained | Within 2 h — **watch the latency here; the no-timeout defect lives in this path** |
| 3.4 | One real inquiry and one Help Desk report: both appear unpublished, neither appears publicly | Within 2 h |
| 3.5 | One Truth Room ruling edited through the Live Desk and verified in a private window | Day 1 |
| 3.6 | Integrity score and finding count recorded as the launch baseline | Day 1, then weekly |
| 3.7 | Error log scanned; 5xx rate; TTFB p95 | Continuous |
| 3.8 | Search for lookalike domains and pages using the campaign's name and imagery | Day 1, then weekly (`05` §6) |
| 3.9 | Analytics: which pages, which devices, which network. **This replaces the assumptions in `11` §4.1 with numbers — do the substitution and re-issue that section** | Week 1 |
| 3.10 | Confirm `/admin` is absent from search results and `sitemap.xml` | Day 1 |
| 3.11 | Confirm the footer attribution and the link target resolve | Day 1 |
| 3.12 | One shared link opened inside WhatsApp on a Nigerian Android, checking the preview card | Day 1 |

## Phase 4 — Post-programming, ongoing and closing

**Weekly (runbook §3):** verified backup, gate against production, queue hygiene, media and disk audit, secrets spot-check, lead-retention review.
**Monthly (runbook §4):** timed restore drill, `ADMIN_SECRET` rotation if nothing forced it, privacy notice re-read against what the forms actually collect, ISR/`s-maxage` review against complaints, renewal check.
**Per-incident:** written timeline, cause, what was published in the gap, what monitoring caught and what it missed, and a change to this document set if a gate was missing.

**Closeout, at the end of the campaign (all of these need a date, not an intention):**
| # | Item | Why it is a gate |
|---|---|---|
| 4.1 | Data disposition executed: hand over, archive, or delete volunteers, inquiries and Help Desk reports — with the decision recorded | NDPA: purpose has ended. Every retained phone number is a live obligation |
| 4.2 | Signed handover of store, media library, credentials and hosting to the named owner | The vendor must not become the accidental custodian of a supporter list |
| 4.3 | Credential revocation: every desk account closed, secrets rotated one final time | Post-campaign volunteer churn is when nobody notices a stale session |
| 4.4 | Domain and certificate renewal decision — renew, park deliberately, or transfer | An expired campaign domain pointing somewhere else is a documented kind of accident |
| 4.5 | Final integrity report exported: score, findings, every `block` line and how each was resolved | This is the campaign's compliance artefact and the next client's reference |
| 4.6 | Document set updated with what actually happened: incidents, traffic numbers, what the desk used and what it ignored | Turns `06`/`07` from design into evidence |
| 4.7 | Anonymised case-study permission obtained in writing before any external use | NIPR's ethics code binds practitioners in Nigeria to safeguard client confidence; AAPC's code does the same professionally. Anonymising is the fallback when consent is not given, and it is the convention chosen in `00-DOCUMENT-INDEX.md` |
| 4.8 | Platform-reuse decision: does a second campaign get this codebase, and if so does it move to Postgres and object storage first? | `11` §10 — separate store per campaign, because a supporter of candidate A must never appear in candidate B's export |
| 4.9 | If the office is won: re-base the lawful basis for holding volunteer data (campaign → public office) before continuing to publish | The publish gate stays; the consent story changes |

## Phase 5 — Standing refusals (a checklist item that only ever gets ticked "no")

Requested routinely by campaigns; permanently excluded here, and re-listed so a new engineer does not read them as backlog (`06` Part E, `PRD §12`):

☐ donation or payment page · ☐ voter-roll import or name-matching · ☐ automated/scheduled posting to any platform · ☐ bulk WhatsApp sending initiated by the campaign · ☐ AI-generated or AI-"restored" imagery of the candidate · ☐ generative drafting of captions, claims or verdicts · ☐ auto-publish from the War Room without a human pressing Save · ☐ scraping a rival's site into opposition research · ☐ fake testimonials or incentivised reviews · ☐ a shared "god mode" login · ☐ hand-editing the live store · ☐ wholesale deletion of a user data directory.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0: six phases, ~100 gated items with owners and closing evidence; Phase 0 annotated with what this project actually did in order, including the three gates run late | i2sltd.tech |
