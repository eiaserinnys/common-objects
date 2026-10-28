# Windowsill tending — 2026-10-28 19:00 UTC

Ten original indoor gardening tools accepted; catalog total 80. Baseline remote main: `070737ca3a2c76e6c16b8bdb4e7457fc51128379`. The checkout was clean before this batch; no repository-local .agents skills were present. Existing catalog objects were reviewed before selecting the theme. The wheeled plant caddy differs from the existing fixed vanity riser; the pruners use solid grips and bypass-style blades rather than the sewing scissors' finger rings. No color-only duplicates.

## Sources and physical contract

Reproducible source: [batch generator](../scripts/batches/gardening-2026-10-28.mjs). Each `assets/gardening-*/asset.json` includes its estimated dimensions, exact rest bounds, conservative footprint, support surfaces, stable part IDs, pivots, reference axes, fixed joints, per-part state, and instance actions. Thumbnails are beside the source. Original geometry is CC0-1.0.

One unit is one metre; Y-up, XZ ground, origin at the center of the union of ground contacts. Default scale is `[1,1,1]`. All sizes are fictional household estimates from everyday proportions, not measured products. Camera fit changes only the camera. Dimensions below are X × Y × Z in centimetres, including removable parts.

| Object | Estimated cm | Independent action | Result |
| --- | --- | --- | --- |
| Indoor watering can | 30.88 × 17.01 × 17.00 | Remove / replace filling lid | PASS |
| Hand potting trowel | 7.80 × 2.50 × 29.00 | Remove / replace blade sheath | PASS |
| Three tine hand cultivator | 8.40 × 3.00 × 27.75 | Remove / replace tine guard | PASS |
| Wooden seed dibber | 8.00 × 4.10 × 21.85 | Remove / replace point cap | PASS |
| Six cell seedling tray | 24.00 × 4.20 × 16.00 | Remove / replace soil plugs | PASS |
| Reusable plant label | 7.50 × 1.05 × 17.75 | Remove / replace name insert | PASS |
| Compact pruning shears | 8.75 × 2.25 × 17.13 | Remove / replace safety strap | PASS |
| Potting soil sieve | 19.80 × 3.50 × 19.80 | Remove / replace pebble sample | PASS |
| Analog soil moisture meter | 5.50 × 2.40 × 22.70 | Remove / replace probe sleeve | PASS |
| Rolling plant caddy | 25.00 × 10.60 × 25.00 | Remove / replace cork mat | PASS |

## Verification

- `npm run validate`: all 80 catalog entries pass schema, metric and geometry checks.
- `npm test`: 39 tests pass, including exact gardening bounds, support containment, alternate-state drawing, independent duplicates and mixed save/restore.
- `npm run build`: passes; generated dist remains untracked.
- `node scripts/gardening-check.mjs`: [10 objects and both states](gardening-validation-result.json), including active bounds/support metadata.
- `python3 scripts/gardening-browser-check.py`: [Chromium results](gardening-browser-result.json); 1280×900 desktop, 390×844 narrow viewport, every object at 0/90/180/270 degrees and alternate state, 20 independently toggled instances, saved transforms and state restored after reload, mobile orbit/selection/focus/action, and camera zoom. No page errors or HTTP failures.
- `npm run browser-check`: [existing room/lamp regression](gardening-regression-result.json), including source identity, room controls, lamp copies, persistence and mobile layout. No page/console errors or HTTP failures; an optional favicon request returns 404.

## Visual review

[Desktop](screenshots/gardening-2026-10-28/set-desktop.png) · [Mobile](screenshots/gardening-2026-10-28/set-mobile.png) · [50-view inspection sheet](screenshots/gardening-2026-10-28/inspection-contact-sheet.jpg) · [Support placement](screenshots/gardening-2026-10-28/support-placement.png) · [Shared occlusion](screenshots/gardening-2026-10-28/multi-occlusion.png).

The inspection sheet was visually reviewed for all ten silhouettes, four orientations and alternate states. Watering-can handle connections and pruner shanks were corrected during review. The sieve seats on the caddy mat at Y=0.106 m with its 0.198 m footprint inside the 0.20 m certified support patch. Removing the mat removes that certified support. Object rotation, camera fitting and duplicate creation preserve unit scale. Narrow-screen detail mode makes small tools inspectable; the overview intentionally preserves their real relative size.

## Limits

These are 3D-coordinate procedural drawings projected into SVG, using the shared metric geometry and BSP painter renderer. They are not delivered GLB files or an exported mesh collection. Primitive geometry can generate triangle buffers but the previews remain SVG. No growth, fluid flow, sensing, cutting, caster rolling, articulated hinges, physics, shadows or collision prevention is simulated. Actions remove/replace components discretely; they do not animate mechanical operation. The watering spout is a solid stylized frustum, soil is block-shaped, and the moisture dial is illustrative. Only recorded support patches are certified; unlisted tops and exposed slats are not. Browser checks used headless desktop Chromium and mobile viewport emulation, not physical touch hardware. No deployment was performed.
