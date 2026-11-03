# Operations Runbook

**Document:** 05-OPERATIONS-RUNBOOK.md
**Version:** 1.0
**Written:** 3 November 2026
**Owner:** i2sltd.tech, on behalf of the campaign desk
**Read with:** `DEPLOYMENT-GUIDE.md` (where the hosting lives) and `04-TECHNICAL-MANUAL.md` (how to operate the software). This file answers: **what happens on a Tuesday, and what do I do at 21:40 when something goes wrong.**

> **One rule above the rest.** Nothing in this runbook publishes, retracts, or responds to the public on its own. Every playbook ends at a human decision. If a procedure here could be automated, that is a reason to stop and re-read the constraint in the PRD: no autonomous publication, no astroturfing, no unreviewed content.

---

## 1. Roles, access, and who is allowed to do what

| Role | Count | Has | Must not |
|---|---|---|---|
| **Content owner** (communications lead) | 1 | CMS credentials, Live Desk, the authority to publish copy | Change the store backend or the environment |
| **Deputy editors** | up to 3 | Same credentials | Publish a Truth Room ruling without the lead's sign-off |
| **Operations** (vendor engineer, i2sltd.tech) | 1 | Hosting console, server, backups, secrets | Write campaign content |
| **Legal/compliance contact** | 1 | Read access to exports | Edit anything |
| **Ward desk** | many | `/help-desk` submission only | CMS credentials |

**Access hygiene, enforced manually until it is enforced in code.**
- One account per person. The cookie is not named, so attribution comes from who was told; keep a written log of who holds credentials and when they were issued (PRD open question 9).
- Sessions last 12 hours and cannot be individually revoked. Revocation is rotation: changing `ADMIN_SECRET` invalidates every session at once.
- When a desk member leaves the campaign, rotate `ADMIN_PASSWORD` and `ADMIN_SECRET` the same day. Write it into the leaver checklist.
- Credentials are never shared over WhatsApp or SMS. This is a campaign whose subject matter is intercepted audio.

---

## 2. Daily rhythm (5 minutes, twice a day)

**Morning, before anything is sent to a group.**
1. Open `/` in a browser. If it takes more than about two seconds on a normal connection, note it and check §6.
2. Open the Live Desk on `/impact` (`⌘E`) and read the **integrity rail**. Score and findings are the campaign's own risk report.
3. `/admin` → Leads Inbox: count new volunteers and inquiries. Anything angry goes to the content owner immediately, not into a queue.
4. `/admin` → Help Desk: any resident reports waiting? Publishing a report is a decision with the resident's name attached — status changes and progress notes are the desk's, publication is the lead's.
5. Confirm the store badge in the `/admin` header is what you expect (`file store` or `supabase`). A silent switch is how a day's leads end up in the wrong place.

**Evening.** Repeat 3 and 4. Then, if anything was published during the day, open the public page in a private window with no cookies and read it the way a voter will — this is the voter test from `DEPLOYMENT-GUIDE.md` §16.4, and it takes ninety seconds.

**What to look at and what it means**

| Signal | Normal | Act |
|---|---|---|
| Integrity score | whatever it was yesterday | Any **new** `block` finding = something was published without evidence. Stop and fix today |
| `GET /api/admin/login` from a cookie-less browser | `{"success":true,"authenticated":false}` | Anything else is a security incident (§7.6) |
| `/admin` store badge | matches the configured backend | Mismatch = env vars lost in a deploy |
| A page shows an old sentence after a Save | within the ISR window (5–60 min depending on page) | Beyond it, follow §7.3 |
| Console errors on a public page | none | Any = check before blaming the browser cache (§7.9) |

---

## 3. Weekly

- **Backup, verified, not just taken.** Copy `data/db.json` and `public/images/uploads/` off the machine, then *restore one file into a scratch directory and open it.* An unverified backup is a rumour about a backup. (Commands: `04-TECHNICAL-MANUAL.md` §8.1.)
- **Gate check against production:** `BASE=https://<live-domain> node scripts/check-cms-gates.mjs` → 12/12. This writes a throwaway row and deletes it; run it when the desk is not mid-edit.
- **Queue hygiene:** drafts older than 7 days are either finished or deleted. A sitting draft is a claim nobody decided.
- **Media audit:** disk usage, uploads count, and any photo the rail flags as under 700 px on the long edge. A campaign photographs faster than it deletes.
- **Secrets check:** confirm no `.env.local` in any artefact, no service-role key in a `NEXT_PUBLIC_*` name, and no dev password in the running environment (`DEPLOYMENT-GUIDE.md` §14).
- **Lead retention review:** volunteers and resident reports you no longer need are liability, not asset. Decide with the compliance contact, and record the decision.

## 4. Monthly

- Restore drill on a scratch box, timed, with the result written down. The number you get is the recovery time you will actually quote during an incident.
- Rotate `ADMIN_SECRET` if no incident forced it (session hygiene).
- Re-read the privacy notice and `/privacy` against what the forms actually collect. When a field is added, the notice has to move with it — that is a data-processing obligation, not a copy task.
- Review ISR windows and `s-maxage` against reality: has anyone complained about a stale page? Has the desk been waiting on a purge?
- Renewal check: domain, DNS, certificates, Cloudflare plan, hosting invoice. Domain expiry during a campaign is a self-inflicted outage.

## 5. Around the election calendar

| Window | Posture |
|---|---|
| **T-6 to T-2 weeks** | Normal ops plus the `DEPLOYMENT-GUIDE.md` §16 checklist. This is when content gaps get closed, because after T-1 you are not making changes |
| **T-1 week: freeze** | No deploys except security fixes. Content changes only, through the CMS |
| **Campaign period** | Two-person desk coverage across waking hours. Run the daily rhythm at 08:00 and 20:00. Rumour response (§7.1) is the reason the site exists in this window |
| **Polling day** | Read-only fallback armed (§7.4), operations on call, no deploys. The site's job today is to be there |
| **Result period** | Highest traffic, highest attack interest, highest chance someone quotes you out of context. Only publish copy the lead has read twice |
| **Post-election, within 30 days** | The data-retention decision: hand over, archive, or delete. Do not let it drift — every retained phone number is a live obligation under NDPA 2023, and the campaign's purpose has changed |

---

## 6. Monitoring

What to watch, from cheapest to most valuable. All of these need no code change.

| Check | How | Alert threshold |
|---|---|---|
| Is the site up | Synthetic `GET /robots.txt` every 60 s from ≥2 regions, **including a West African vantage** | Any 5xx, or two consecutive timeouts |
| Is it slow | Same probe recording TTFB | p95 > 2 s sustained 5 min |
| Are the security headers still there | `curl -sI https://<domain> \| grep -i strict-transport-security` in a scheduled job | Missing = a proxy stripped them (§7.8) |
| Did the site become less defensible | Poll `GET /api/admin/health` with a stored session; track `score` and `block` count | Any new `block`, or score below the agreed launch threshold |
| Is the store still working | Watch for `save()` retry messages in the logs | Any retry = file contention; more than a few = find the second writer |
| Is the disk filling | `df` on the volume, daily | >75% |
| Are the third parties alive | Watch `/api/volunteer` latency specifically | A slow volunteer submission is a lost volunteer (§7.5) |
| Are we being impersonated | Search the domain name and the candidate's name weekly for lookalike sites; Nigeria saw a fake INEC registration portal in Oct 2026 | Any hit → §7.7 |

Logs: JSON to stdout, drained with 30-day retention. If a host gives you no log drain, that is a reason to add one before launch, not after.

---

## 7. Incident playbooks

Each: **symptom → immediate action → diagnosis → fix → what to tell the campaign → how it ends.**

### 7.1 A rumour about the candidate is spreading (the expected incident)

**Immediate (0–10 min).** Do not publish anything yet. Copy the claim, its first appearance, and a screenshot with a timestamp into a note. Screenshots first — the post may be deleted.
**Assess (10–30 min).** Is it verifiable? Is it about the record, the person, or something we have no document for? The answer determines whether the site is the response or the evidence for a response made elsewhere.
**Draft (30–60 min).** `/admin` → Truth Room (or `⌘E` on `/truth-room`). Verdict from the three allowed values. Attach the report or document that *states* the point. **The publish gate will refuse an unsourced ruling, and it should** — if you have no document in 60 minutes, the honest response is not a ruling; it is a press statement, or silence, or a "we are verifying" line the lead approves.
**Publish.** A named human presses Save. Confirm on the live page in a private window. Then run the voter test (`DEPLOYMENT-GUIDE.md` §16.4).
**Distribute.** The link goes to the ward groups and to anyone who asked, by people, not by a tool. There is no automated posting path in this product and none should be improvised.
**If the origin is dying.** Purge the CDN so the ruling is served immediately rather than at the end of the ISR window; if the origin itself is the problem, cut over to the read-only snapshot (§7.4) with the rebuttal baked in.
**End state.** A dated ruling with a document, a score that did not fall, and a written note of the timeline for the next one.

### 7.2 A published claim turns out to be wrong

**Immediate.** `DELETE` the row, or unpublish it. This is the only correct takedown path — do not empty the evidence field (the route refuses it, deliberately: softening a claim is not the same decision as removing one).
**Then.** Check whether anything quoted it — the site's own `/impact#sources`, a newsroom release, a social post. Take those down in the same hour, or annotate them.
**Tell the campaign.** One sentence: what was said, what is true, when it was live. The lead decides whether to correct publicly; that is a communications decision, not a technical one.
**Record it.** A dated note in the change log of `00-DOCUMENT-INDEX.md`. A retracted claim is tombstoned so a content update cannot resurrect it (ADR-005) — verify it stayed down after the next deploy.

### 7.3 Content saved but the page will not update

**Diagnose in this order, because the cheap answer is usually the real one.**
1. **Browser cache.** Hard reload, or fetch with `?cb=<timestamp>` and grep the HTML for the new text. This has personally wasted debugging time on this project. If the new string is in the HTML, your problem is not the server.
2. **Route cache / ISR.** `revalidatePath` fires on save, but on Path B/C the invalidation reaches only the instance that received the call, and behind a CDN the edge keeps serving until `s-maxage` expires. Purge the affected URL at the edge (both HTML and RSC variants) — this is documented in the Next.js CDN-caching guide and is the single most common production surprise.
3. **A different backend.** Is the write going to the file store while the page reads Postgres? Check the `/admin` store badge.
4. **The page is not in the revalidate list.** `src/lib/revalidate.ts` holds the arrays; a newly added route must be added there.
**Escalate** only after 1–3 are ruled out; a genuine cache bug is a deploy decision, not a panic.

### 7.4 The site is down, or under attack

**Immediate.** Declare it in one line to the content owner with a time. Do not start fixing before the incident has a name.
**Triage.** `curl -sI` the home page; check the host's status page; check DNS and certificates; check disk; check process liveness.
**Fallback, in order of speed.**
- **Path D snapshot:** deploy the static export to a CDN bucket. Forms stop working; the record stays readable. This is the pre-decided election-day posture, and it is why the export script exists.
- **Restart the container/service:** acceptable when the cause is a hung process, not a resource exhaustion.
**Never.** Take the site down to stop an attack without deciding where the rebuttal page lives. A missing authoritative site during a rumour is precisely the Feb 2023 IReV pattern: the vacuum gets filled.
**Post-incident.** Write down cause, duration, what was published in the gap, and what the monitoring did or did not catch. If the cause was capacity, read `11-HARDWARE-AND-ENVIRONMENT-SPEC.md` §5.

### 7.5 A volunteer submission hangs, or leads are missing

**Symptom.** The `/join` form takes many seconds, or the thank-you never appears; leads are absent from the inbox.
**Cause, known and documented.** `/api/volunteer` stores the row, then `await`s `Promise.allSettled([pushLeadToWarRoom, sendWhatsAppWelcome])` with **no timeout**, despite a comment calling it fire-and-forget. A slow Meta endpoint or an unresponsive War Room URL stalls the response after the write.
**Immediate.** Unset `WAR_ROOM_WEBHOOK_URL` (the push is skipped when absent) and, if needed, the WhatsApp credentials — both skip silently. Lead capture resumes immediately; delivery to the CRM is a backlog you can flush later.
**Permanent fix.** Add a timeout around both calls and return success on the store write alone (`DEPLOYMENT-GUIDE.md` §6.5). Scheduled, not yet done.
**If leads are genuinely missing** and you are on a multi-instance deployment, read the next line of §7 of the deployment guide: more than one writer on the file store loses data silently. One writer, always, until you are on Postgres.

### 7.6 Someone may have CMS credentials, or the site looks edited by another hand

**Immediate.** Rotate `ADMIN_PASSWORD` **and** `ADMIN_SECRET`. Because the session is a stateless signed cookie, this invalidates every desk session instantly — no revocation list needed. That is the design's one real advantage, and the reason `ADMIN_SECRET` must be a real secret and not the password fallback.
**Second.** Take the CMS path down at the edge (`/admin` and `/api/admin/**` return 403/404) so the public keeps reading while you work. There is no middleware in this app, so do it at Cloudflare/Caddy, not in code you will have to deploy under pressure.
**Third.** Diff the live content against the last known-good backup; diff the deploy against the pipeline commit. Check the tombstone list for rows that should be gone.
**Fourth.** Assume every lead and resident report you hold is now known to be exposed. Read §7.10 and make the notification decision with the compliance contact — NDPA obligations are not optional because the incident is awkward.
**Note.** A Nigerian party's own website publishing a document the party then disowned (Jan 2019) is the precedent. A defacement that produces a sentence the campaign must deny is worse than an hour offline.

### 7.7 A fake site is impersonating the campaign

**Immediate.** Screenshot it, capture URL, registrant data, and what it asks for. Do not contact them.
**Short.** Publish the canonical position on the real site — the canonical URL plus the official channel list, both already CMS-managed — and state plainly what the campaign will never ask for: money, BVN, voter-card details, or a code. This is the cheapest control available and it needs no new feature. Nigeria's electoral body had to do exactly this in Oct 2026 after a fake registration portal collected personal data.
**Then.** Report to the host and registrar; report to Meta if it is a page; log it for the compliance contact, because an impersonation site harvesting personal data makes you a data subject's problem too.

### 7.8 Security headers vanished

**Diagnose.** `curl -sI https://<domain>`. If `strict-transport-security` is gone but the app is fine, a proxy or the static host stripped them — the framework sets six on every path, so absence means something in front decided otherwise. Note that the static export cannot carry them at all; that is expected, and is why the Caddyfile restates them.
**Fix.** Re-add at the edge (Caddy/Cloudflare transform rules). Verify with the same `curl` after the change, not before.
**Judge severity honestly.** Missing headers are not a breach, but a campaign site is a phishing surface for its supporters, and it will be reported as one.

### 7.9 A page looks broken, and the console has errors

**Order.** (1) Reproduce in a private window — most "server bugs" are a cached document, and this project has been bitten by exactly that during verification. (2) Is it every visitor or just this device? (3) Did a deploy land since the last good load? (4) Read the error; check `04-TECHNICAL-MANUAL.md` Part 5 for the known set (`next/cache` in a client component, remote images through the optimiser, missing `data-ow`, slot validation).
**If it is an image frame:** the carousel and PhotoSlot choose the fit from the photo's `orientation`. A head cropped out of a portrait means `orientation` is missing from the slide contract, not that the photographer is wrong.

### 7.10 Personal data has to be surrendered, corrected, or deleted

**A request arrives.** From a volunteer or a resident: confirm identity through the channel they already used, log the date, and note which right they are invoking (access, rectification, erasure, objection, restriction).
**Find the data.** `/admin` → Leads Inbox, and `data/db.json` (or the Postgres tables `volunteers`, `constituent_inquiries`, `issues`). Volunteer rows carry `consent_at`, so you can answer *when* consent was captured and *whether* it was withdrawn — that column exists for precisely this question.
**Act.** Rectify or delete through the CMS so the cache revalidates and the tombstone list records the removal. Deleting a row does not delete its uploaded photograph from disk unless you use the media delete path, which purges orphans safely behind a prefix check.
**Timeframe.** NDPA does not give you a comfortable window and the regulator has fined banks and broadcasters; answer within one week and record it.
**Never.** Export the whole table "to look". The CSV export exists for triage, not for copying a supporter list onto a laptop.

---

## 8. Escalation and communication

| Level | Situation | Who decides | Response time target |
|---|---|---|---|
| L0 | Cosmetic, one page, no claim affected | Desk | Next working day |
| L1 | A published claim is wrong or unsourced; a form is failing | Content owner | Same day |
| L2 | Site down; defacement; suspected credential leak | Operations + content owner, together | 30 minutes |
| L3 | Personal-data exposure; legal demand; impersonation collecting data | Compliance contact + campaign leadership | 1 hour, and notify as required |

**Status line format** (send it, then do the work): *"olawestern.ng is [state] since [time]. Cause: [known/unknown]. Voter impact: [X]. Next update: [time]."* Nothing else. A campaign's internal channel does not need diagnosis in real time; it needs to know when the next update lands.

**What never goes in a status line:** a claim about the opponent, a verdict, or anything the site has not sourced.

## 9. Handover, and the post-election question

Handover is a document set, not a conversation. A new engineer should be able to take this over from: `00-DOCUMENT-INDEX.md` → `08-DEVELOPER-WORKFLOW.md` → `04-TECHNICAL-MANUAL.md` → `03-ARCHITECTURE-DECISIONS.md` → `DEPLOYMENT-GUIDE.md`, plus this file, plus a working credential and the hosting console.

**Three things to decide before the campaign ends, not after:**
1. **Who owns the data.** Volunteers and resident reports belong to the campaign; a vendor holding them indefinitely is a data-processing arrangement nobody has signed. Hand over, archive, or delete — with a date.
2. **Who owns the site.** If the candidate takes office, this becomes a public office site with different obligations. The publish gate stays; the consent basis changes.
3. **What the domain does.** An expired campaign domain pointing at someone else's page is a real event, and in 2026 it is a documented one. Renew it or park it deliberately.

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0: cadences, monitoring matrix, ten playbooks, escalation ladder, post-election decisions | i2sltd.tech |
