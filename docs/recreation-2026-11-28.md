# Community game lounge — 2026-11-29 04:00 KST

One cycle only, UTC file date 2026-11-28. Clean fetched base `7e57b4784388093b4d521f081a737b05d857a185`, one worktree, main only remotely, no open PRs. No skipped-cycle catch-up. Read all 296 prior identities, dimensions, functions and states, reconciled against current sources; reviewed original room plus 29 batch overviews. [Brief](recreation-brief-2026-11-28.md).

## Selection, scale and limits

Existing tabletop games supply many small pieces but no large social game furnishings. Six distinct anchors add billiards, table football, half-fold table tennis, joystick arcade, pinball and shuffleboard roles for community/commercial lounges, large homes and office recreation rooms. Existing café seating/table, sofa, floor lamp and game props are reused. No extra dice, cue, puck, plain storage cabinet or recolor fills the count. Six sources are four below the aspirational ten; quality and distinct roles take priority. No partially completed source is counted.

These are original 3D-coordinate SVG projections, not delivered GLB/mesh exports. All use metre units, Y-up/XZ ground, +Z front, contact-center origins and scale `[1,1,1]`; camera-only fitting. Physical sizes are fictional proportion estimates, not measurements, manufacturer references or regulation certifications. Source JSON records part IDs, hierarchy, pivots, axes, states, endpoint bounds, clearance footprints, support regions/heights and explicit limitations. Source, shared runtime and preview remain separate; no renderer/runtime contract changed.

| Source | Estimated endpoint envelope X × Y × Z (m) | Depiction |
| --- | --- | --- |
| [Billiards](../assets/recreation-billiards/asset.json) | 1.4132 × .829 × 2.4 | Fixed recessed pocket mouths, segmented cushions, retained sample balls; honestly static |
| [Table football](../assets/recreation-foosball/asset.json) | 1.48 × .92 × 1.48 | 24 figures rotate .65 rad about eight rod-height X axes |
| [Table tennis](../assets/recreation-table-tennis/asset.json) | 1.605 × 2.11 × 2.74 | Complete right half and markings pivot 90°; occupied right support blocks folding |
| [Arcade](../assets/recreation-arcade/asset.json) | .72 × 1.74 × .765 | Power screen, tilt joystick and move cursor; reset before power-off |
| [Pinball](../assets/recreation-pinball/asset.json) | .70 × 1.525 × 1.4 | Open inspection playfield, powered display and paired hinged flippers |
| [Shuffleboard](../assets/recreation-shuffleboard/asset.json) | .65 × .91 × 3 | Retained puck moves 2.03 m into marked bands |

Five operating sources plus one fixed source, **13 total reachable poses**. Player figures, buttons, balls, flippers and puck are internal parts, not new counts. No full playable games, scoring, payment, ball physics, rolling, continuous animation or real electrical simulation. Pinball intentionally has no transparent glass. Pockets are shallow geometry recesses, not a ball-return system. Motion ranges describe authored endpoints, not continuous swept collision.

## Mixed interior and meaningful counterexample

[Assembly](../assets/recreation-interior/assembly.json) contains **12 instances: six new, six reused source IDs**. Existing game box rests on the café table at .74 m; existing dice cup rests temporarily on the flat table-tennis right half at .76 m. This temporary tabletop use deliberately tests a disappearing support; remove it for table-tennis setup. Seating, lamp and café tabletop establish mixed human scale. No joined room enclosure or regulation playing-clearance certification is claimed.

The same actual UI that users open at `/preview/recreation.html` exercises:

1. All 13 reachable poses, using recorded action paths and four camera directions each. For folded inspection, detach the cup first. In the operating mixed capture, the detached cup is placed on the floor before folding.
2. Two machines: play while unpowered rejects; power-off at active play endpoint rejects. Folding the occupied table also rejects. Each of five refusals must preserve the entire saved scene exactly, not merely the selected Boolean.
3. Duplicate all 12 objects and independently operate detached copies. All 24 instances keep unit scale; originals and attached children remain unchanged. Save, reload and restore exact transforms/states/relations.
4. Move table-tennis host 3 and café-table host 7 by X +.12 m and yaw 20°. Operate football, powered arcade/pinball endpoints and shuffle puck together. Check child heights .76/.74 and inherited cup yaw 20°. Save/reload/restore every field.
5. After restoration, try folding host 3: it must still reject because the cup remains attached. Detach cup 11 and verify no world-position jump, then explicitly set its Y to 0. Fold host 3 and move its X to 3.2: cup must stay at its new floor position. Duplicate active arcade 4, reset and power off only the copy. Save/reload/restore again exactly.
6. At 390 px width test overflow, selection, isolated focus, drag orbit, zoom and football operation.

**Counterexample:** a partial implementation that saves only world positions or hides an occupied tabletop would let the restored cup float when folding. This check requires preserved attachment semantics, atomic rejection and deliberate relocation before folding. A copy sharing state fails original equality. The machine guards also reject corrupt saved Boolean combinations.

All mixed source endpoint pairs receive conservative part-bound clearance checks. For folded-table comparisons, the unavailable-support cup is moved outside the test scene; a separate test explicitly requires occupied folding failure. Combined translated/yawed state also receives clearance checks in a common inverse-yaw frame. These checks are not an exact mesh/swept collider and do not prevent arbitrary later user collisions. Every declared support corner rests on solid geometry, and each structural part connects to ground through the model in every pose. Small end-cushion and arcade screen gaps found by contact checks were repaired. Four-side inspection then revealed that folding exposed disconnected front legs: transverse underframe beams now connect both leg pairs to the longitudinal frame. The structural test was strengthened to flood from a single ground-contact part, so separate grounded pieces no longer pass as one connected structure. Final tests and browser captures were rerun after this correction.

## Reproduction and evidence

```sh
node scripts/batches/recreation-2026-11-28.mjs
node scripts/recreation-scene.mjs
node scripts/recreation-check.mjs
python3 scripts/recreation-inventory.py
npm run validate
npm test
npm run build
python3 scripts/recreation-browser-check.py
```

[Preview](../preview/recreation.html), [state/dimension validation](recreation-validation-result.json), [browser results](recreation-browser-result.json), [verification hashes](recreation-verification.json), [302-row inventory](catalog-inventory-2026-11-28.md), [audit](recreation-catalog-audit.json).

Final verification: **229/229 tests**, including **9/9 recreation tests**, **302 catalog entries validated**, build passed and final asset/assembly/preview bytes match dist. Actual Chromium passed **14 checks**, **52 four-direction captures** of **13 poses**, all **7 alternate poses** visibly changed, five atomic refusals, 24 independent duplicates and exact combined save/reload/restore, with **zero browser errors**. Three contact sheets, mixed views and mobile were visually reviewed.

[Representative](screenshots/recreation-2026-11-28/representative-interior.png), [operating](screenshots/recreation-2026-11-28/interior-operating.png), [reverse](screenshots/recreation-2026-11-28/interior-reverse.png), [combined state](screenshots/recreation-2026-11-28/combined-state.png), [mobile](screenshots/recreation-2026-11-28/set-mobile.png), [rest sheet](screenshots/recreation-2026-11-28/pose-0-contact-sheet.jpg), [pose 1](screenshots/recreation-2026-11-28/pose-1-contact-sheet.jpg), [pose 2](screenshots/recreation-2026-11-28/pose-2-contact-sheet.jpg).

## Counts and verification boundaries

**6/6 produced sources accepted**: six new large sources. Total **283 independent objects (112 S / 50 M / 121 L)**; 18 original compound groups and original room counted separately: **302 registrations**. Small share 40.4% → 39.6%. Last ten actual wellness–recreation batches: 87 sources, 8 S / 21 M / 58 L. Thirty production batches contribute 282 plus original lamp. Overlapping H/O/C candidates 250/131/283 are not furnished-room counts. [Updated priorities](catalog-balance.md).

No full game logic, physical dynamics, continuous articulation, automatic collision prevention, general attachment-authoring UI or joined enclosure. SVG painter has no general transparency, shadows or GLB exporter. Low-end hardware performance is unverified. No deployment, purchases or permission changes. No repository workflow definition; commit-status and first-page PR-triggered workflow lookup are checked after push; absent CI is not passing CI.
