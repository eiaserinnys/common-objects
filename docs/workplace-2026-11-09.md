# Office work and collaboration — 2026-11-09

**Ten accepted new sources; zero shortfall against the selected ten-source set.** Nine have explicit discrete operations; the meeting table is fixed. Five existing sources appear in six reused instances. Terminal monitor/keyboard/mouse is one authored equipment assembly, not three newly counted objects. No website deployment.

## Why this set

Fetched base `117d9f7fb2096d36af7a09a3d878ed931ad69de1` matched remote main with clean worktree, one checkout, no other remote branches or open PRs. Read the complete 185-source baseline, actual dimensions/states, AGENTS, asset-spec, production-policy, cumulative balance and recent bakery/bedroom reports. Inspected the original room and all seventeen preceding batch previews. [Pre-model brief](workplace-brief-2026-11-09.md) records the candidate decisions and nominal estimated dimensions.

The collection had office printing/sorting, but independent desk adjustment, task seating, computing, collaboration surfaces and personal/flat-plan storage were missing. Original desk/chair groups remain imported composition components. Dressing desks and standing sorting benches are not adjustable computer workstations. Long two-pedestal meeting furniture differs in construction and shared-work role from the café pedestal table. Shredder and dispenser add specific everyday office processes without repeating bakery machines. New geometry is original, not recolored prior sources.

This addresses two current priorities together: office workstation coverage and explicit supported-child binding. Architectural wall/ceiling installation remains a separate unmet foundation; this is an unenclosed furniture arrangement. Current SVG/BSP is retained, with the older metric/WebGL path untouched. Source, shared geometry/rendering, state/placement behavior and preview remain separated. No old asset source/version was rewritten.

## Accepted source dimensions and functions

Dimensions are generated all-endpoint union envelopes, **estimated**, not measured products or intermediate swept extents. All sources: metres, Y-up, contact-centered origin, unit scale, part IDs/parents/pivots/reference axes/state, footprint and support metadata. `motionRanges` documents applicable discrete axes and endpoint ranges; it does not turn fixed geometry into continuous joints. Thumbnails and generator are retained.

| Asset | Union W × H × D (m) | State | Result |
| --- | --- | --- | --- |
| [Telescoping sit-stand workstation](../assets/workplace-desk/asset.json) | 1.6 × 1.1 × 0.805 | high | PASS |
| [Height-adjustable five-star task chair](../assets/workplace-task-chair/asset.json) | 0.64 × 1.115 × 0.6127 | raised | PASS |
| [Desktop monitor keyboard and mouse terminal](../assets/workplace-terminal/asset.json) | 0.62 × 0.53 × 0.507 | on | PASS |
| [Desktop computer tower](../assets/workplace-tower/asset.json) | 0.253 × 0.48 × 0.47 | on | PASS |
| [Reversible mobile collaboration whiteboard](../assets/workplace-whiteboard/asset.json) | 1.3 × 1.775 × 0.6 | flipped | PASS |
| [Four-compartment personal locker bank](../assets/workplace-lockers/asset.json) | 0.912 × 1.8 × 0.913 | open | PASS |
| [Office strip-cut paper shredder](../assets/workplace-shredder/asset.json) | 0.38 × 0.835 × 0.3 | shredded | PASS |
| [Bottle-fed office water dispenser](../assets/workplace-water-dispenser/asset.json) | 0.36 × 1.375 × 0.36 | filled | PASS |
| [Six-person two-pedestal meeting table](../assets/workplace-meeting-table/asset.json) | 2.2 × 0.745 × 1 | fixed | PASS |
| [Five-drawer flat plan cabinet](../assets/workplace-flat-file/asset.json) | 1.1 × 0.75 × 1.35 | open | PASS |

Desk top/crossbar/cable tray rise .35 m on telescoping legs (.75 to 1.10 m worktop). Chair upper seat/back/arms rise .10 m on a stationary five-star base. Terminal power displays an illustrative chart with keyboard/mouse retained; no software/input simulation. Tower power changes LED and fan phase .5 rad; no computation or continuous fan. Whiteboard panel with its frame and marks flips 180° about X; opposite face is blank. Locker lower-left door opens 90° carrying its pull/label/vents; three other doors stay fixed. Flat-file top drawer carries a complete shallow box and plan .50 m outward; four lower drawers stay fixed. Shredder feed sheet becomes fourteen strips resting in the inspection bin. Water dispenser retains bottle/cup while stream and cup level show filling; no cooling, heating or filtration. Meeting table is intentionally fixed, its support excludes the cable hatch. All machinery operations are discrete illustrations, not measured physical performance.

## Support binding and spatial arrangement

The [16-instance assembly](../assets/workplace-interior/assembly.json) includes desk, task chair, terminal and tower; rear storage/whiteboard/water station; meeting table and two reused café chairs; flat-file cabinet. Reused lamp attaches to the desk beside the terminal, letter tray to cabinet top, stapler and teapot to meeting surface. **Five attachments** preserve parent-local offset/yaw and support ID. Existing six reused instances are five distinct source IDs and are not counted again.

[Attachment contract](asset-spec.md#opt-in-horizontal-support-attachments-2026-11-09): parent translation/yaw and active surface height update children. Resolution follows dependency order and rejects cycles, missing/ambiguous/unavailable supports, unsupported tilt/scale and conservative child overflow without partial mutation. Attached child fields are disabled in the shared preview; explicit detach preserves world pose. Duplication creates an independent detached copy; duplicating a parent does not clone children. Relations survive save/reload. Existing scenes without attachment metadata keep their prior independent-placement behavior. New bindings are authored in JSON; no click-to-bind editor.

Active child bounds contact and fit supports, and this scene's siblings do not overlap. All floor endpoint envelopes are disjoint, including open locker/flat-file and raised chair. Parent movement is geometric and does not prevent collision with unrelated floor objects. No swept collision, load ratings, electrical/plumbing connections or certified circulation. Six-person is design intent; only two reused chairs are shown, not six new chairs.

## Validation and evidence

- `npm run validate`: **195 registered sources** pass.
- `npm test`: **118 passed, zero failed**. Thirteen new tests cover nineteen source states, bottom-contact centers, finite bounds, floor clearance, support/sibling fit, parent raise/yaw/translation, nested dependencies, atomic rejection, detach, independent actions and **32-instance exact save/restore**. Existing tests, including BSP occlusion regressions, continue to pass.
- `npm run build`: passed; dist and dependencies are not committed.
- `node scripts/workplace-check.mjs`: [per-source geometry, bounds and support state results](workplace-validation-result.json).
- `python3 scripts/workplace-browser-check.py`: [19 Chromium check records](workplace-browser-result.json), no page/resource errors. **76 individual four-view captures** (19 discrete poses). Desktop 1440×1000, narrow 390×844 with no horizontal overflow. Selection, focus, actions, object rotation, camera zoom/orbit, independent duplicates and 32 mixed-instance save/reload/restore. Dedicated test raises desk children .35 m, rotates/translates parent, restores bindings exactly, verifies disabled attached fields and detach.
- `python3 scripts/workplace-regression.py`: [existing-preview and failure-handling regression evidence](workplace-regression-result.json). All seventeen prior batch previews plus the study lamp (18 pages, 20 check records total) exercise action, independent duplication and exact save/reload/restore. A browser-only unavailable support fixture proves the desk action rolls back parent state, child poses and bindings; original attached terminal remains bound when its duplicate is detached.
- Local source/schema review caught a missing piston coordinate before acceptance. Visual refinement added whiteboard casters, aligned dispenser spout to stream, grounded shredder strips and excluded the cable hatch from certified table surface. Final generation, validate/tests/build and browser captures were rerun after these corrections.

[Representative](screenshots/workplace-2026-11-09/representative-interior.png) · [Operating](screenshots/workplace-2026-11-09/interior-operating.png) · [Reverse](screenshots/workplace-2026-11-09/interior-reverse.png) · [Attached raised/rotated desk](screenshots/workplace-2026-11-09/attached-desk-raised-rotated.png) · [Rest four-view sheet](screenshots/workplace-2026-11-09/rest-contact-sheet.jpg) · [Alternate sheet](screenshots/workplace-2026-11-09/alternate-contact-sheet.jpg) · [Mobile](screenshots/workplace-2026-11-09/set-mobile.png) · [Local interactive preview](../preview/workplace.html)

## Coverage and remaining limits

[195-row inventory](catalog-inventory-2026-11-09.md), [machine-readable audit](workplace-catalog-audit.json): **176 independent objects (102 S / 22 M / 52 L)**, 18 imported compound groups and one original room. New sources **1 S / 2 M / 7 L**; small share **60.8% → 58.0%**. Tower is S by its .48 m maximum dimension, despite its equipment role. Last ten cycles beverage–workplace: 95 sources, 21 S / 22 M / 52 L. H/O/C candidate tags 159/87/176 overlap and are not complete room totals.

Attachments support convex horizontal planes and unit-scale yaw-only metric roots. Bounds containment is conservative and sibling collision is not automatic. Older external scene consumers may ignore optional binding metadata. No general part/hinge parenting, architectural installation, continuous motion, physical fluids/paper cutting/computation, reflection, transparent sorting, load/security certification or GLB exporter. SVG rendering remains an illustration. Real mobile hardware and other browser engines untested. No workflow definition is present in this checkout; remote CI status is checked separately at delivery rather than treating absent CI as a passing run.
