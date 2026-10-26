# Paperwork afternoon · 2026-10-27 KST

Ten accepted original desk stationery objects. Baseline: `9b30e7eda5664174ee1bc28326f7c01189fa83db`, confirmed against origin/main before production. Existing 50 sources, renderer and WebGL implementation are preserved; catalog now contains 60 entries.

| Object | Estimated X × Y × Z (cm) | State |
|---|---|---|
| Desktop letter tray | 25.00 × 4.50 × 34.00 | loaded |
| Desktop stapler | 4.20 × 6.98 × 14.00 | loaded |
| Two hole punch | 13.00 × 6.50 × 11.00 | loaded |
| Weighted tape dispenser | 6.00 × 9.02 × 13.50 | loaded |
| Pencil sharpener | 4.50 × 4.40 × 5.10 | closed |
| Drawing pencil | 1.20 × 1.20 × 20.20 | capped |
| Twenty centimetre ruler | 22.00 × 0.70 × 3.60 | sleeved |
| Paper wrapped eraser | 5.50 × 2.15 × 2.60 | wrapped |
| Steel bookend | 12.00 × 16.40 × 12.00 | padded |
| Desktop waste bin | 14.00 × 17.00 × 14.00 | lined |

All dimensions are design estimates, not manufacturer measurements. Metres, Y-up, ground-contact-center origin, default scale [1,1,1], exact all-part geometry bounds, conservative footprints, part IDs, fixed joints, pivots, axes and support metadata are in each source. Original geometry is CC0-1.0. State transitions remove parts from the scene; they do not animate mechanisms. The standalone drawing pencil has new geometry and an independent cap action; it is not an extracted/recolored copy of the existing compound notebook/pen scene block.

The letter tray paper stack supports an eraser at Y=0.018 m within a 21 × 29.7 cm patch. Removing the paper disables this support. The bookend pad also declares a conservative horizontal patch. Other objects declare no certified supports. These hints describe geometry, not loading/stability or collision physics. The sharpener entry is a dark inset marking, not a boolean-cut bore; its drawer action removes the front and grip, without exposing modeled internal blades. Pencil barrel is 24-sided, not hexagonal.

## Deliverables

- Reproducible generator: `scripts/batches/stationery-2026-10-27.mjs`.
- Ten `assets/stationery-*/asset.json` sources and SVG thumbnails; catalog and README updated.
- Separate [interactive preview](../preview/stationery.html) and `preview/stationery.js`, using the existing shared SVG/BSP renderer.
- [Geometry and state results](stationery-validation-result.json), [browser checks](stationery-browser-result.json), [room/lamp regression](stationery-regression-result.json), and `tests/stationery.test.js`.
- [Representative desktop image](screenshots/stationery-2026-10-27/set-desktop.png), [mobile](screenshots/stationery-2026-10-27/set-mobile.png), [support](screenshots/stationery-2026-10-27/support-placement.png), [occlusion](screenshots/stationery-2026-10-27/multi-occlusion.png), [50-view sheet](screenshots/stationery-2026-10-27/inspection-contact-sheet.jpg). Individual four-side and alternate-state captures are retained in table order.

## Verification

- `npm run validate`: 60 catalog entries pass, including exact new bounds.
- `npm test`: 33/33 pass, covering distinct sources, independent meaningful state changes, rotated bounds, scale, mixed scene persistence and support fit/availability.
- `npm run build`: passes; generated dist is not committed.
- `node scripts/stationery-check.mjs`: ten objects and both states recorded.
- `python3 scripts/stationery-browser-check.py`: built preview, Chromium at 1280 × 900 and 390 × 844; four sides and alternate state per object; camera zoom, pointer orbit, selection, XYZ placement, independent duplicates and exact 20-instance reload/save restoration. No application/HTTP errors.
- `npm run browser-check`: existing room/lamp checks pass with no application/HTTP failure; optional favicon returns 404.
- Visually inspected desktop, mobile, 50-view sheet and support/occlusion images. Small stationery retains its relative physical size; isolated inspection uses camera fitting only. Narrow-screen overview camera distance was increased to keep the full set visible. The support review separates the punch from the bin and seats the eraser on the paper stack.

## Limits

10 accepted; zero unfinished items counted. Projected metric SVG drawings, not GLB deliveries. No spring action, cutting, sharpening, reflection, shadow or collision simulation. Some tiny state details require isolated inspection. Other browsers, physical mobile hardware and low-end performance are untested. Existing rendering limitations and source formats remain unchanged. No separate website deployment.
