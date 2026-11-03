# 08 — Compliance and risk

**Compiled:** 3 November 2026
This file exists because a 75-day sprint with 40 posts a week produces exactly two kinds of failure: the post that is true but stupid, and the post that is effective and unlawful. Everything here is either an obligation, an exposure, or a check you must complete with someone qualified. Where I am not certain of the current Nigerian rule I say so and tell you who to ask — a confident wrong legal statement in a campaign file is how a candidate ends up answering a petition.

**This is not legal advice.** Commission a one-page note from a Nigerian election-law practitioner before Day 7 and keep it in this folder. Budget for it.

---

## 1. The campaign's own binding rules (already in its documents)

| Rule | Source | Consequence for social |
|---|---|---|
| Nothing about the candidate's record is published without an evidence link; the link may be replaced, never emptied; deletion is the only takedown | Publish gate, `../ola-western-web/src/lib/cms.ts`, recorded in `docs/00` | The same claim cannot go out on Facebook before it can go out on the site. Social is not the workaround |
| No Truth Room ruling without executive approval and evidence on file | Campaign policy, store record `news-truthroom` | Counter-rumours about opponents are prohibited by the campaign's own rule, not just by mine |
| The AI never posts independently; a human approves every dispatch | Campaign strategy documents | No auto-scheduled "AI-generated" post goes out unreviewed. Drafts yes, dispatch no |
| Content in English, Nigerian Pidgin and Yoruba, with tone "authoritative yet approachable, empathetic, transparent, results-driven" | Campaign brief and intake documents | `10` §4 language rules |
| Targeting strictly inside Constituency I wards | Campaign strategy documents | `06` §4 |
| Four claims currently HOLD (hospital-bills fund; Penalty King sponsorship; vigilante funding; lives-and-worships-in-FESTAC) | The site's own integrity audit, score 40/100, 3 Nov 2026 | `00` §4 — no template asserts them, and neither may a reply |

## 2. Election law and the INEC process — items to have a lawyer confirm

Marked **[CONFIRM]** = ask before the relevant date, in writing, and paste the answer in this file with a date.

1. **Campaign period and the pre-poll silence.** The rule usually cited in Nigerian elections is that political rallies, processions and campaigning by broadcast stop within a set window before polling day (commonly described as 24 hours before, beginning 6pm on the eve). **[CONFIRM the exact provision and window for January 2027.]** Practical effect: T-40 and T-41 must be *service* content (where is your unit, what to bring) rather than advocacy, and the jingle/motorcade schedule in `05` must respect it.
2. **Broadcast and airtime.** Political advertising on broadcast media has its own regime (timing, party access, regulatory clearance). **[CONFIRM with the National Broadcasting Council's current rules if any radio/TV spend is planned.]**
3. **Abusive and hate speech during campaigns.** Electoral-law provisions and general criminal law both bite on defamatory, abusive or threatening campaign speech, and on incitement along ethnic or religious lines. This is why `03` §7 excludes ethno-religious framing: not a preference — an exposure that can reach the candidate personally.
4. **Corruption offences: money, goods, transport for votes or attendance.** Buying votes, inducing attendance, and treating are criminal. Voluntary assistance that is not conditioned on a vote is a different question and a fine line. **[CONFIRM with counsel exactly what the campaign may lawfully do on transport for elderly and disabled supporters]** — `05` §8 writes it as a red line until you have the answer.
5. **Campaign spending limits and returns.** The 2026 Electoral Act framework has been reported as setting a ₦10bn ceiling for presidential candidates, with enforcement historically weak. **[UNVERIFIED as to the current gazetted figures and as to state-assembly limits.]** Regardless of enforcement: keep a dated spend log from Day 1 for every print job, media buy, jingle, generator and fuel receipt. Petitions are won on paperwork, and the campaign that cannot produce its own accounts is the one that loses the argument.
6. **Result handling.** Photographing or transmitting materials from a polling unit has specific lawful limits (what a party agent may lawfully record; what belongs to INEC). **[CONFIRM before publishing any results-style content.]** Never post a "result" that is not from the declared official process — that is the fastest route to a sanction, and it is exactly the behaviour the 2023 and 2026 disinformation incidents taught everyone to distrust.
7. **The INEC code of conduct for political parties**, which parties sign, binds the candidate through the party. Get a copy and read it to the ward coordinators once, in November.

## 3. Platform rules (Meta specifically — the page can die faster than the campaign can)

- **Political and issue-ad disclosure and identity verification.** Meta requires advertisers running political or social-issue ads to verify identity and location, with disclosure labels ("Paid for by") and constraints on targeting. **[CONFIRM the current flow, documents required for a Nigerian advertiser, and whether the ad account can be set up in time.]** Start the verification now — it takes days and it always lands in the worst week.
- **Implied endorsement.** Do not run content that suggests INEC, the police, a foreign government or a news brand endorses the candidate. The Truth Room post on ballot legitimacy (T-05) is fine; "#INECVerified" is not.
- **Synthetic and manipulated media.** Undeclared AI-generated video/audio of real people is removal-grade content under platform policy, and the EU AI Act's transparency obligations for AI-generated content became applicable 2 August 2026 — relevant if the campaign's content is visible in that market. The campaign's own guardrail is stricter: no synthetic media of the candidate at all.
- **Coordination and inauthentic behaviour.** Multiple accounts posting coordinated content, fake engagement, bought followers — the pattern Meta removes pages for, often the whole estate of pages at once. This is the operational reason `03` §7 refuses astroturfing: a banned page on Day 60 has no replacement, and there is no appeal window in a 75-day race.
- **Fact-checking context.** Meta scaled back its third-party fact-checking programme in part of the world in January 2025, which cuts both ways: fewer external labels on claims, and less external cleanup when a rival's fabrication spreads. It makes the campaign's own documented record the only defence available, not a nicety.
- **Group and page impersonation:** report it, publish the official handle list (T-39), and do not create "supporter" pages that are campaign assets wearing a mask.

## 4. Data protection — supporter lists are sensitive data

Under the Nigeria Data Protection Act 2023, **political opinions are sensitive personal data (s.30)**. The campaign's door-knock notebooks, WhatsApp lists, volunteer records and the website's join/enquiry forms are therefore the highest-category processing the statute contemplates, done by volunteers with notebooks. Obligations and the practical form each takes:

| Obligation | What it looks like on the street and online |
|---|---|
| Lawful basis and explicit consent | Say the purpose at the door: "your name and number go on the [[WARD]] campaign list for street notices and polling-day information". Tick, not assumed |
| Notice | One sentence, every collection point, in the language spoken |
| Purpose limitation | The list is not for a candidate's business, not for a party's other race, not for sale, not for a future project |
| Data minimisation | Name, street, ward, phone. **Never** BVN, NIN, voter-card number, religion, ethnicity, or household income |
| Security | Named custodian per ward; no shared spreadsheets in open groups; passwords on devices; no photographs of the register on WhatsApp |
| Rights (s.34) — access, objection, deletion | "REMOVE" must work the same day. Keep a deletion log with dates |
| Breach response | The runbook playbook for a credential or data leak applies to a lost register. Report it; do not quietly re-collect |
| Profiling / DPIA thinking (s.28) | Any "targeting model" built on supporter data is a decision worth writing down before you make it |

The website already does part of this (`toPublic()` strips PII from every view that doesn't need it, mirrored in the database's row-level security) and its privacy page exists but has **not been reviewed by a lawyer — a documented `[gap]`** (`docs/10`). Closing that gap is a Day 1–14 task, not a February task.

**On collecting data at all:** the campaign's own line is the strongest available — "we will never ask you for money, your BVN or your voter-card details" (T-39). Keep it true.

## 5. Defamation and the "one more post" trap

Rules of thumb that keep this campaign out of court and out of the news cycle:

- Describe **documents**, not **characters**. "The report of January 2023 records an approval for six roads" is safe. "He stole the road money" is a lawsuit and a scandal you cannot unpost.
- Never repeat a rumour to deny it without attributing it as a rumour, and never repeat it at all without the denial in the same post.
- Quote a newspaper headline and link it; do not paraphrase a headline into an accusation.
- If a claim about another person cannot survive being asked "what is your source?", it does not go out. This is the publish gate applied to other people — and it is the only reason the campaign's standard is credible.
- Screenshot everything hostile; save, don't reply in anger.

## 6. Safety and dignity risks (the non-legal section that matters most)

| Risk | Control |
|---|---|
| Motorcades and crowds: injuries, children on vehicles, traffic accidents | `05` §6: no minors on vehicles, helmets, route notified, first-aid at the tail, speed capped, insurance, one sweep per ward not three |
| Retaliation at market stalls after a bold post | Street captains are briefed on what to say and when to withdraw; no trader is left holding a campaign argument alone |
| Agent intimidation at units | Pair agents, lawful documentation only, escalate to the war room, never answer force with force |
| Volunteer burnout in week 6 | Rotation, Sunday quiet, no more than three posts a day, and the rota in `09` §6 has named people not eager students |
| Data loss: the notebook is a single copy of the ward's trust | Photograph each register page nightly to the ward chat (redact numbers), one backup custodian per ward |
| A fabricated claim found in the campaign's own archive | The four HOLD lines stay out of every asset until a document exists. Whoever posts one is off the team — write this into the volunteer brief |
| Page compromise | 2-step verification, named admins, the runbook's credential-leak playbook printed and pinned in the office |

## 7. Pre-flight check (run before Day 1, and again on Day 45)

1. ☐ Election-law note from counsel, filed here with a date
2. ☐ Written consent from the campaign for anything this folder publishes in its name
3. ☐ Meta ad-account identity verification submitted and cleared **[CONFIRM]**
4. ☐ Polling-hours and unit rules from INEC's published guidance, written into T-40/T-41
5. ☐ Spend log created; every bucket owner named
6. ☐ Data-consent sentence agreed and used at every collection point; deletion custodian named per ward
7. ☐ Official handle list published and pinned; impersonation reporting route live
8. ☐ All `[[SLOTS]]` in `02` filled with real values before the first post
9. ☐ The four HOLD lines confirmed absent from every template, reply, jingle and poster
10. ☐ Volunteer brief signed: no money collection, no fabricated claims, no fake accounts, no synthetic media, nothing posted without approval

## 8. Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | Compliance file created; NDPA 2023 mapping consistent with `docs/10`, EU AI Act and platform-policy items dated, all uncertain Nigerian electoral provisions marked [CONFIRM] rather than stated | i2sltd.tech |
