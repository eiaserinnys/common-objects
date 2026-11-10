# Installed study corner · 2026-11-10

Accepted **10 distinct reusable sources**, with no shortfall. Base: `deaa69e32daaaa1b13bd10cc79cec8b749bf1d8a`. The latest remote, clean worktree, full catalog, dimensions, previous production records and preview montage were reviewed before selection. [Pre-model brief](architecture-brief-2026-11-10.md) and [updated balance](catalog-balance.md) explain the choice: furniture was plentiful, but independent architectural openings and installation contracts were missing. This set makes existing work furniture usable in a spatially defined interior instead of adding another small-prop or machine batch.

## Accepted sources

All dimensions below are **estimated maximum authored endpoint envelopes**, X × Y × Z in metres; not manufacturer measurements. Source JSON, version, footprint, bounds, support/install regions, anchors, stable part IDs, state and motion metadata, plus SVG thumbnails, are stored under each `assets/architecture-*/` directory. Geometry stays at scale `[1,1,1]`, Y-up, with bottom/contact-center rest origins. Camera distance alone frames the views. The raised blind retains its original root; its active bottom moves upward.

| Source | Envelope (m) | Supported behavior |
| --- | --- | --- |
| architecture-wall | 2.4 × 2.4 × 0.135 | Fixed wall with front mounting region |
| architecture-doorway | 1.2 × 2.4 × 0.955 | Door leaf and attached handle hinge about Y |
| architecture-window | 2.4 × 2.4 × 0.18 | Complete left sash slides 0.8 m |
| architecture-beam-bay | 2.9 × 2.55 × 0.212 | Fixed posts, beam and downward soffit |
| architecture-shelf | 0.85 × 0.3 × 0.28 | Fixed brackets and load surface |
| architecture-sconce | 0.2 × 0.4 × 0.24 | Diffuser appearance on/off |
| architecture-pendant | 0.4 × 0.885 × 0.4 | Shade/diffuser appearance on/off |
| architecture-radiator | 0.989 × 0.6 × 0.118 | Thermostat and witness mark rotate |
| architecture-blind | 1.82 × 1.4 × 0.14 | Cloth retracts and bottom bar rises 1.14 m |
| architecture-switch | 0.085 × 0.09 × 0.0309 | Rocker rotates between two positions |

The ten sources add **2 small / 3 medium / 5 large** roles. Independent sources rise 176 → 186; small share falls 58.0% → 55.9%. Registrations rise 195 → 205, including the unchanged original room and 18 imported compound groups. [Full inventory](catalog-inventory-2026-11-10.md), [machine-readable audit](architecture-catalog-audit.json). Components and the example assembly are not counted as extra objects.

## Spatial example and mounting

[Interactive preview](../preview/architecture.html), [representative image](screenshots/architecture-2026-11-10/representative-interior.png), [operating view](screenshots/architecture-2026-11-10/interior-operating.png), [reverse occlusion view](screenshots/architecture-2026-11-10/interior-reverse.png), [mobile](screenshots/architecture-2026-11-10/set-mobile.png).

The 15-instance assembly reuses workplace desk, chair, terminal, original lamp and teapot. Six explicit mount bindings install shelf/sconce/radiator on the wall, switch on the doorway jamb, blind above the window and pendant below the beam. Three horizontal bindings place terminal and lamp on the desk, and teapot on the mounted shelf. Wall translation/yaw carries fixtures and nested teapot; beam height carries the pendant. The workplace desk still raises its children to 1.10 m. Detaching retains the current pose; duplicating creates a detached copy while preserving original descendants. Bindings, transforms, versions and independent states survive save/reload/restore.

The new optional `mount` contract shares dependency resolution with existing supports. Opposing normals, matching wall/soffit kinds, convex anchor envelopes, available states and plane penetration are checked; invalid/cyclic bindings reject atomically. Region corners and centers are tested against actual host geometry. See [asset specification](asset-spec.md#wall-and-downward-soffit-installation-2026-11-10).

Clearance review widened the original proposed 2.4 m beam bay to 2.9 m and shifted the desk 5 cm, removing blind/track/post interference. Every cross-asset pair is checked at all combinations of its endpoint states with bindings resolved together. The only allowed intersection is the explicitly bounded rear-wall/side-wall corner lap (≤6.1 cm X and ≤6.8 cm Z). This is a simple authored corner, not an automatic join system. Doorway and window have actual geometry apertures. Front/reverse views show the rear wall occluding interior contents rather than drawing through them.

## Validation evidence

- `npm run validate`: all 205 registrations accepted.
- `npm test`: 131 tests pass, including 13 new architecture tests and prior support/BSP regression tests.
- `npm run build`: succeeds; source versions and preview workflows retained.
- [Source checks](architecture-validation-result.json): 10 sources, 17 endpoint poses; dimensions, bounds, footprints and installation metadata preserved.
- [Browser checks](architecture-browser-result.json): 18 checks, no errors; 68 individual four-direction screenshots, seven independent visible actions, 30 mixed-instance exact restore, pointer orbit/focus and 390 px layout.
- [Regression checks](architecture-regression-result.json): 23 checks, no errors, covering all 19 prior metric preview pages, old horizontal attachment rollback, new mounting rollback and detached duplicates.
- [Rest contact sheet](screenshots/architecture-2026-11-10/rest-contact-sheet.jpg), [alternate contact sheet](screenshots/architecture-2026-11-10/alternate-contact-sheet.jpg), [moved wall with fixtures](screenshots/architecture-2026-11-10/wall-moved-with-fixtures.png). Multi-angle source sheets and mixed desktop/mobile/reverse views were visually reviewed.

Reproduction: run `node scripts/architecture-check.mjs`, `python3 scripts/architecture-inventory.py`, then the standard commands above. After building, with existing Playwright/Chromium and Pillow dependencies, run `python3 scripts/architecture-browser-check.py` and `python3 scripts/architecture-regression.py`; both scripts start their own ephemeral local server. The authored generator is `scripts/batches/architecture-2026-11-10.mjs`.

## Limits

SVG/BSP projected geometry is authoritative; no GLB or mesh export is claimed. Glass is opaque blue. Light actions change appearance without cast illumination; radiator action adjusts a thermostat without heating/fluid simulation; switch has no circuit linkage; blind has no cloth/cord dynamics. Door/window are discrete endpoints, without swept collision, locks or safety ratings. Three rigid assets intentionally have no action.

Mounting is authored JSON, unit-scale/yaw-only, on wall or downward-soffit planes. Contact-envelope containment permits a pendant shade to overhang its canopy's beam. No general tilted planes, moving-part parenting, interactive binding authoring, automatic module joins, structural/load checks or collision prevention on arbitrary user edits. The example has an open roof/front and is not a complete or accessibility-certified building. Guarded/timed equipment operation remains a future priority. Public CI availability is checked after push and reported separately; local checks do not imply hosted CI exists.
