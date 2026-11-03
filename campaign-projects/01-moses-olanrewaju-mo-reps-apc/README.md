# MO "Working Spreadsheet" — Prototype & Pitch Runbook

**File:** `mo-tracker-prototype.html` — open it in any browser. Zero install, zero network needed
(works on a laptop at the campaign office with the Wi-Fi off; pitch-day resilience is a feature).

## What it demonstrates
The exact thing MO publicly promised: a living ward-by-ward ledger of constituent needs with public
status movement — plus his 1,000-youth AI-training pledge rendered as a counter that *moves when
work moves*. Everything is watermarked **PROTOTYPE · SAMPLE DATA · NOT AN OFFICIAL RECORD**.

Features wired:
- 12 realistic sample pledges across Festac, Satellite Town, Trade Fair, Ibassa/riverine and constituency-wide rows
- Status pipeline: Received → Triaged → In Progress → Delivered (and *publicly Deferred* — the credibility trick)
- Live "Log a constituent need" modal — this is what voters will do on the real site
- Search + ward/issue/status filters, sortable columns, evidence links per row
- KPI cards + segmented delivery-pipeline meter that recompute on every change
- **CSV & JSON export** — "any journalist can audit the same file you publish"
- Status advance buttons (demo-only) so you can *watch a cell change* during the meeting
- localStorage persistence + one-click "Reset demo data"

## The 15-minute pitch choreography
1. **Open cold** → let the KPIs and the 300/1,000 cohort bar be seen first (60 seconds, no talking).
2. **Hand them the mouse:** "Log something your team actually heard this week." They type the need —
   it enters as *Received* and the meters tick. This is the deal-closing moment; the spreadsheet is now *theirs*.
3. Click **→ advance** twice on their row; narrate: "On the live system your ward captains do this from
   their phones; every change timestamps into the public log."
4. Hit **Export CSV** — the transparency argument in one file download.
5. Open the **deferral row** (maternal kits, Deferred, with budget memo cited): "The opposition can't
   attack a ledger that publishes its own misses. That's the only campaign asset immune to its own claims."
6. Close on scope: this prototype = Phase 1 (public tracker). Phase 2 = canvasser capture app feeding
   it; Phase 3 = GOTV module. Production schema already drafted in `PROPOSAL.md` (`pledge_tracker`,
   `ai_training_applications`).

## Handover checklist (if they engage)
- [ ] Replace sample rows with their real, verified ward data before any public launch.
- [ ] Confirm MO's exact wording of the "working spreadsheet" commitment and mirror it in the header tagline.
- [ ] Production: build as `/scorecard` on the `ola-western-web` stack (Supabase `pledge_tracker` + `/api/needs` POST + public CSV endpoint) — 2-week sprint per PROPOSAL.md.
- [ ] Every published "Delivered" row requires source evidence at ingest (media team sign-off queue).
