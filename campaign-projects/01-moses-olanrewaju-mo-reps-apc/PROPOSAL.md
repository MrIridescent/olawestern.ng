# Moses Olanrewaju (MO) — APC Nominee, Federal House of Representatives, Amuwo-Odofin

## Profile & strategic context
- **Office targeted:** House of Representatives (Federal) — primary winner, centerpiece race of the constituency.
- **Public positioning:** rejects conventional rhetoric for a **"working spreadsheet" methodology** — a digitized pledge tracker logging constituent needs ward-by-ward with post-election delivery transparency; has publicly committed to training **1,000+ youths in AI/digital skills**; already uses online supporter-registration portals.
- **Zone:** whole federal constituency (Festac estates + commercial corridors + riverine).
- **Why he is the #1 B2B target in this directory:** his two signature public promises are *software deliverables*. Most candidates need tech; MO has already *promised* it publicly — non-delivery is a credibility risk you are uniquely positioned to close.

## Matched packages
| Priority | Package | What it concretely delivers |
|---|---|---|
| P1 | **3 — Digital Scorecard & Interactive Governance Portal** | Public "working spreadsheet": live promise tracker (status: committed → in-progress → delivered per ward), constituent need-submission forms, open data tables exportable to CSV |
| P1 | **1 — Constituent CRM & Micro-Targeting** | Ward-by-ward voter profiling feeding the same database; canvasser mobile view |
| P2 | Youth AI-training cohort module | Application portal, cohort selection pipeline, completion certificates (doubles as his flagship policy proof-of-work) |

## Tailored technical plan (reuse `ola-western-web` base)
**New pages beyond the flagship template:**
- `/scorecard` — interactive tracker. Schema:
```sql
CREATE TABLE pledge_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward TEXT NOT NULL,                -- Festac, Satellite Town, Trade Fair, Ibassa…
  category TEXT NOT NULL,            -- Infrastructure / Youth-AI / Trade / Riverine
  need_summary TEXT NOT NULL,        -- logged constituent request
  logged_by TEXT,                    -- canvasser/ward captain initials (accountability)
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received','triaged','in_progress','delivered','deferred')),
  evidence_url TEXT,                 -- photo/press link when delivered
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE ai_training_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, ward TEXT,
  skill_level TEXT CHECK (skill_level IN ('beginner','intermediate','advanced')),
  track TEXT CHECK (track IN ('AI-basics','data-analysis','web-dev','digital-marketing')),
  status TEXT DEFAULT 'waitlisted'
);
```
- `/register` — supporter onboarding (port the `/join` form; federal-scale ward list Wards A–K).
- `/youth-ai` — program landing + application form + cohort counter ("312 of 1,000 trained").
- Public CSV/JSON export endpoint for the spreadsheet ethos — transparency *is* the brand.

**Media plan emphasis:** policy-focused digital for middle-class estates; the tracker itself is the ad creative ("watch every promise get ticked").

## Contract phasing (electoral-milestone SLAs)
1. **Primary Consolidation & Voter Mapping:** tracker + registration portal live (2 weeks from signing).
2. **Main Canvassing:** ward-level data dashboards; canvasser app feeds `pledge_tracker`.
3. **Election Day:** turnout tracking; tracker freezes into a post-election governance mode (retainer opportunity — this tool is *more* valuable after winning).

## Risks/notes
- The tracker must ship with real content at launch — an empty spreadsheet is worse than none. Prep data-entry workflow with his strategy team in week 1.
