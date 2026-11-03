# Pitch kit — selling campaign technology to a political principal

**Compiled:** 3 November 2026 · Anonymised by default (`README.md` §1)
Audience for this file: you, before a meeting. It is written for a candidate, a campaign director, a party organising secretary or a political appointee — people who evaluate **risk, cost and who looks foolish**, not architecture. Do not send this file to anyone. Use it.

The one sentence that opens every conversation in this market:

> **Anyone can publish a claim about you. Very few campaigns can prove one.**

---

## 1. Timing — why now is a real answer, not a sales tactic

Verified against public reporting and re-checked 3 November 2026; where a figure could not be confirmed it is marked.

- **INEC's published timetable puts the 2027 presidential and National Assembly elections at 16 January 2027**, with gubernatorial elections 6 February 2027. At the date this pack was compiled that is **~74 days to the presidential poll** and roughly five months to a 2027 state-cycle campaign build if a principal starts after the party primaries settle. *(Compute the current number yourself before a meeting; do not quote 74.)*
- **Campaign spending ceilings under the Electoral Act 2026 have been reported at ₦10bn for presidential candidates** — with the widely noted caveat that enforcement is weak. **[unverified as to current gazetted figures — confirm before quoting a number in a meeting.]** Treat it as a framing device ("the law now names a ceiling, so documentation of spend and activity is a live question") rather than a fact to stake a proposal on.
- **The information environment degraded measurably, and it is documented.** A political party's own website was hacked and defaced (APC, January 2019). A fake site impersonated the electoral body (October 2026). Fabricated result graphics circulated during an off-year state election (Osun, August 2026). An arrest was announced over a synthetic audio clip of the head of state (June 2026). A polling-day transmission collapse turned a count into a legitimacy dispute (Rivers State, February 2023). Meta scaled back third-party fact-checking in part of the world (January 2025) — which means the claim on your page is increasingly the only version a voter meets. Full dated list with sources in `../ola-western-web/docs/06-USE-CASES.md` Part C.
- **Regulators have started to bite in Nigeria.** Data-protection fines announced against a bank (₦555.8m, August 2024) and a pay-TV operator (₦766m, July 2025), and a reported settlement with Meta (October 2025). The Nigeria Data Protection Act 2023 treats **political opinions as sensitive personal data under section 30** — so a campaign that collects supporter data is holding the highest-category data in the statute. A principal who has ever been told "your website is a liability" will listen to this sentence.

**How to use this:** name one event, not ten. "You remember what happened to [X party]'s website in 2019" does more work than a slide of global disinformation statistics.

---

## 2. The 4-line WhatsApp (this market runs on WhatsApp)

Send to a warm or semi-warm contact only. Nothing longer; the point is to earn a call, not to describe a product.

> Good evening sir/madam. I build campaign technology — websites, supporter records and the proof layer that stops a rumour sticking.
> I've just completed a full platform for a 2027 Lagos State House of Assembly campaign: 12 pages, 34 endpoints, a CMS the volunteers can actually use, and a publish gate that refuses to post any claim without an evidence link.
> Mine is the only campaign site I know of that publishes its own trust score and blocks itself from being shared until it passes. It currently says 40/100 — I'd rather show you that than a screenshot of a nice design.
> Fifteen minutes this week? I'll bring the one-page and the audit findings.

Variants by who you're messaging:

- **To a candidate's son/daughter/aide (the usual gatekeeper):** lead with *"so nobody can fake what your father said"* and *"so the WhatsApp rumours about him stop having an answer-free life."*
- **To a campaign director / media aide:** lead with *"your volunteers can't publish an unprovable claim, even if they want to"* and *"one admin surface, no developer needed to change the headline."*
- **To a party organising secretary (multi-constituency):** lead with *"one system, many candidates, same evidence discipline, and the cost comes down per seat"* (see §7).
- **To a sitting official worried about legacy:** lead with *"a public record of what you actually did, with the source attached to every line."*

**Never send:** a brochure PDF, an unsolicited proposal, or a link to a site with the current dev credentials. Nothing in §8 of this file is optional.

---

## 3. Cold email (when WhatsApp is not the relationship)

> **Subject:** campaign record system — 15 minutes?
>
> Dear [[NAME]],
>
> I build the technology layer for campaigns: the public site, the supporter record, and the proof mechanism that makes a claim about your candidate defensible.
>
> I recently completed one end to end for a 2027 Lagos State House of Assembly campaign in Amuwo-Odofin. It runs 12 public pages and 34 API endpoints on deliberately small JavaScript (87 kB shared), works properly on a mid-range Android phone on 3G, and has a CMS where the volunteers edit the live page itself — no admin panel to be trained on.
>
> The part that matters to you: nothing can be published on it without an evidence link. Not by a volunteer, not by me. The site also grades its own trustworthiness and refuses to be shared until that grade earns it. When the opposition's WhatsApp broadcast arrives at 9pm on polling eve, the campaign that can produce a sourced record is the one that isn't chasing its own story.
>
> I can show you the working build and its own audit findings, including the four things it currently fails on. That's more useful than a pitch deck.
>
> Are you free [[DAY]] or [[DAY]]? I can come to the office, or send the 5-minute one-page first.
>
> [[NAME]] · i2sltd.tech · [[PHONE]] · [[PORTFOLIO URL]]

---

## 4. The meeting — 25-minute shape

Bring: a laptop with the app running locally, the printed infographic (`docs/infographic.html` → print to PDF, A4), and a one-page scope sheet (§5). Do not bring a deck about artificial intelligence.

| Min | What happens | Why |
|---|---|---|
| 0–3 | Ask their question first: *"What's the thing about your online presence that worries you most?"* Then be quiet. | They will tell you what to sell. In this market it is usually (a) a rumour they can't kill, (b) a fake account, (c) a photos/video backlog nobody can find, (d) "my son says our website is embarrassing". |
| 3–8 | Show the live site on their phone, not your screen. Scroll the record page, then the Truth Room. | They must touch it. A campaign principal who has seen a demo on your laptop has learned nothing. |
| 8–14 | Show the publish gate: try to create a claim without a source. Watch it refuse. Say: *"That is your candidate protected from your own enthusiastic volunteers."* | This is the single most persuasive ninety seconds available to you. Practise it until it is smooth. |
| 14–18 | Show the Live Desk: press ⌘E, tap a headline, change it, undo it. Say *"this is what your media aide uses. There is no other login."* | Solves the "who updates it" objection before it's raised. |
| 18–21 | Show the audit panel and the 40/100. Say *"here is what isn't ready, here is who fixes it, here is the date by which."* | Credibility. Every other vendor in the room promises 100. |
| 21–25 | Money, scope, dates, next step. Write their name on it. | Never leave without a dated next action with a named owner. |

**One rule:** the campaign's own data goes into the demo only after they give it to you. Do not pre-fill a prototype with their rumours and their records — it reads as surveillance and it breaches the confidentiality posture in §8.

---

## 5. One-page scope sheet (the thing you hand over)

**Campaign record platform — what you get**

1. **Public site**, mobile-first, calm palette for reading in daylight, small enough to load on 3G: profile, record of work with evidence attached to each line, gallery with dimension-matched press photographs, video (embedded from your own channel), news, a Truth Room that answers specific rumours with sourced facts, a help desk for supporters, contact and join forms, privacy page, and a public blueprint page that explains how the site itself is run.
2. **Editing without an admin panel.** Your media aide presses a key on the live page, taps the headline, types, saves. Undo works. Nobody needs me to change a word.
3. **The publish gate.** No claim about the candidate — and no Truth Room ruling about anyone else — can be created without an evidence link. A link can be replaced, never emptied. Removing a claim is a deliberate action, not a silent edit.
4. **The integrity rail.** The site grades its own trustworthiness daily and tells you what's missing. It will not let itself be shared as "campaign official record" until the grade passes.
5. **Media library.** Twenty declared image frames, each with a required shape. A photograph either fits or it doesn't — no stretched heads. Video verified against the platform before it can be listed.
6. **Supporter records.** Volunteer sign-ups and enquiries, with personal data stripped from every view that doesn't need it, and a documented process for a person asking you to delete them.
7. **Operations.** A runbook with a playbook for each of: a rumour, a wrong published claim, a stale page, an outage or attack, a leaked credential, an impersonation account, a data-deletion request. A named person on call, escalation ladder, and a weekly cadence.
8. **Documentation you own.** Thirteen dated documents: requirements, architecture decisions, step-by-step technical manual a trainee can follow, runbook, use cases, user stories, developer workflow, QA evidence, security and data-protection mapping, hardware/environment spec, and the launch checklists.
9. **Handover.** The code, the data, the credentials and the training are yours. If you want to take it to another engineer in 2028, they can start without me. That is a feature I advertise.

**Not included** (say this out loud; it prevents a bad project): voter files, targeting data, bulk SMS, bot or paid-comment activity, synthetic media of any real person, automated posting without a human, astroturfing, opposition dirt harvesting. See §8.

---

## 6. Discovery questions (their answers become your scope)

1. Who publishes to your platforms today, and how many of them have your phone number saved?
2. What is the worst thing currently being said about you that you cannot disprove with a document?
3. Of the work you've done — appointments, projects, interventions, legislation, constituency interventions — how much is written down anywhere, with a date and a witness?
4. Do you have photographs and video of that work? Who holds them? *(If the answer is "somebody's WhatsApp", that is a real finding, and it is your first deliverable.)*
5. Who owns the domain and the social accounts right now? *(Frequently the last vendor's cousin. Get it in writing.)*
6. What happens on polling day if your results page is slow or taken down?
7. Who collects supporter phone numbers today, and where do those numbers live?
8. Which three people must be able to use this without training?
9. What did you pay last time, and what did you get for it? *(Useful, and it sets your floor.)*
10. Who has the final say on publishing a claim about you — you personally, or your director?

---

## 7. Commercials

**This is a framework, not a price list.** The numbers in the brackets are yours to set from your real costs and market; I have deliberately not invented them, because quoting a fabricated rate in a meeting is how a small vendor loses a big contract.

- **Model 1 — single campaign build.** Fixed fee for §5 items 1–9 + a monthly operations retainer. Structure: [[DEPOSIT]%] before work starts, [[%]] at demo of the working build, [[%]] at handover, with the runbook and training included. State the payment schedule and what stops if a milestone isn't paid.
- **Model 2 — party or multi-seat package.** One platform, N candidates, per-seat content configuration. This is the version that scales: the architecture is already multi-tenant-able through configuration, and per-seat documentation is cheap once the template exists. Price as base + per-seat, with a defined number of seats included.
- **Model 3 — audit-and-fix an existing site.** Many principals already have an abandoned site. Charge for: a security and data-protection review, credential recovery, ownership transfer, a mobile and accessibility pass, and the evidence layer bolted on. Low trust cost, fast win, and it converts to Model 1.
- **Model 4 — paid advisory for the primary cycle** (short engagements, low build, high urgency).

**Non-negotiables in every agreement:** the principal owns the domain, the accounts, the code and the data; the campaign gives written consent before anything about them is used in your marketing (which is exactly why `README.md` §1 exists); a named decision-maker signs off each publication category; a takedown route with an SLA; and no payment terms that make you the hostage of a campaign's cash flow.

**What to concede cheaply and happily:** training sessions, the second revision round, the printed one-pager, the runbook walkthrough for their media aide. **What never to concede:** the publish gate, the human-in-the-loop rule, and your right to leave a project where the client wants fabricated evidence.

---

## 8. The ethics line, and how to say it in a room that may not want to hear it

Say it early, in one breath, as a commercial point rather than a moral one:

> *"I don't build the things that get a campaign into trouble. No fake accounts, no paid comments pretending to be organic, no bots, no AI video or audio of a real person, no fabricated rumours about opponents and no publishing about them without proof, no automatic posting without a human deciding, no voter data I can't say where it came from. If any of that is on your list, I'm the wrong vendor — and I'll tell you who'd take the money and what it costs you later."*

Three reasons this works in this market rather than costing you the job:

1. **It is a risk transfer, and principals understand risk transfer.** An AI-generated video of a candidate, or a fabricated rumour about a rival, is not a tactic — it is an indictment waiting for a reporter. The EU AI Act's transparency obligations for AI-generated content became applicable on 2 August 2026, and platform political-content rules bite far faster than statutes; a principal whose campaign is globally visible can be removed from platforms by someone else's compliance team.
2. **It is verifiable in your product.** The publish gate is code, not a promise. No other vendor in Nigeria can put a laptop on the table and demonstrate a system that refuses to lie for them.
3. **It is what makes the referral come back.** Political technology in Lagos is a small room. The vendors who did whatever the client asked are not recommended; they are warned about.

The refusal list, in full, with the reason for each: `../ola-western-web/docs/06-USE-CASES.md` Part E, and §13 of the infographic.

---

## 9. Objection handling

| They say | You say |
|---|---|
| *"My nephew does websites."* | "Good — he should keep doing the graphics. What I sell is the part that keeps your candidate out of trouble: an evidence gate on every claim, an owner for every incident, and a record your volunteers can't accidentally falsify. When the first problem comes at 9pm on polling eve, which number do they call?" |
| *"How much?"* | "Between [[X]] and [[Y]] depending on whether you want the operations runbook and the audit rail. The cheaper version exists and I'll tell you what's not in it — but the thing that usually goes wrong isn't the website, it's nobody being responsible for it in week nine." |
| *"Can we post fast when the rumour drops?"* | "You can publish a ruling in ninety seconds — with a source. That's the design. What you can't do is publish without one, and I built it that way on purpose, because an unproven rebuttal is the second-worst version of the rumour." |
| *"Can we show him at events he wasn't at?"* | "No. And that's the whole argument for the system: if the record has to be flexible, it isn't a record." |
| *"We need it in two weeks."* | "The platform exists. Two weeks is content and photos — which is your bottleneck, not mine. Give me the evidence for your twelve strongest achievements and I'll show you a gated record in that window." |
| *"Is my data safe?"* | "It's the highest category of personal data under Nigerian law — political opinions are sensitive data under section 30. Here's exactly how it's held, who can see it, and the process when someone asks you to delete them. Here's also what isn't done yet: a lawyer hasn't read the privacy wording." |
| *"Why is your own score 40?"* | "Because four published claims still lack a source and I refused to fake them. When your campaign hands me the letters, photographs and reports for those four, it moves. A vendor who shows you 100 either has no evidence rule or invented the evidence." |
| *"Send me a proposal."* | "I'll send a one-page scope and a date for a fifteen-minute call. Proposals you read alone are how campaigns buy the wrong thing." |

---

## 10. Follow-up, referrals, and the pipeline

- **Same day after any meeting:** one WhatsApp, three lines — what you agreed, what you need from them, the date you'll next speak. No attachment.
- **Day 3 if silent:** send one thing of value with no ask (a screenshot of a fake site impersonating a public figure, a note that their competitor launched a record page, a specific finding about their current domain ownership).
- **Weekly, indefinitely:** one line to every warm contact. This market converts on the sixth message, not the first.
- **The referral ask, phrased for this market:** *"Who else is preparing for 2027 that you'd trust me with?"* — never "do you know anyone who needs a website".
- **Track it.** `CHANNELS.md` §7 has a log format. Political principals remember who followed up and who didn't; the CRM is a text file you actually keep.
- **Case-study hygiene:** each new named client requires their written consent before it appears in material (`README.md` §1). Build the consent line into the contract from the first engagement so the question never comes up awkwardly later.

## 11. Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | Pitch kit created; market timing, threat and enforcement events taken from `docs/02` §4 and `docs/06` Part C with their check date | i2sltd.tech |
