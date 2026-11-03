# Elebute Abiodun — APC LGA Chairman, Amuwo-Odofin (Party Chairman, not an elective aspirant)

## Profile & strategic context
- **Role:** LGA party chairman — **manages ward distribution and the campaign machinery itself** (directory): nomination enforcement, ward-executive deployment, polling-unit monitoring.
- **What he buys:** not votes — *control and visibility over the machine*. His KPI is that every ward and PU reports to him before election day.
- **Strategic value to us:** he is the **distribution choke-point**. One deployment here touches every APC candidate in the LGA (including the flagship Ola Western project). Sell him the operating system; candidates inherit compatible clients.

## Matched packages
| Priority | Package | Rationale |
|---|---|---|
| P1 | **Party machinery operations console** | Ward-executive registry, PU-monitor map, meeting attendance, tasking/tracking ("ward manager coordination" + "membership tracking" are the directory's verbatim needs for this tier). |
| P1 | **Rapid communication tree** | Broadcast to chairmen→wards→PUs with read-receipts; escalation paths; scheduled congruence notices. |
| P2 | **4 — Social Listening desk (party variant)** | The chairman defends the *brand* across all wards — shared early-warning dashboard with the War Room stack. |
| P3 | Primaries/nomination record module | Transparent internal process log — reduces post-primary litigation/infighting, his biggest headache class. |

## Tailored technical plan
- RBAC console on the existing stack: roles `lga_chair`, `lga_sec`, `ward_chair(×11)`, `pu_monitor(×N)`; tables `ward_execs`, `pu_monitors`, `taskings`, `meetings`, `broadcasts` (all already compatible with the consolidated Supabase schema family).
- PU coverage map = the ward-map component from `ola-western-web`'s impact page, extended to every PU in the LGA with agent-status coloring.
- Integrates (same DB family) with any candidate's supporter CRM — candidate data never flows upward without consent; party sees aggregate coverage only.

## Contract phasing
1. Registry + comms tree before ward conferences.
2. PU monitoring through canvassing season.
3. Election-day collation support (aggregated from candidate PVT feeds that opted in).

## Risks/notes
- Party-funding reality: price as machinery operations (annual), not software; offer ward-tier free accounts to lock adoption. Keep membership data strictly internal-NDPA: members get privacy notices, and nothing built here auto-enrolls anyone.
