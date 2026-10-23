# Common metric placement and source contracts

All placeable assets, including new daily props, use 1 unit = 1 metre, Y-up, XZ ground and default scale [1,1,1]. Imported drawing coordinates are archived separately and converted through an explicit physical estimate, never a camera/viewport fit.

`assets/catalog.json` enumerates reusable `asset.json` sources. Renderer-specific HTML is never an asset source. The current executable validation contract is `scripts/validate.mjs`; run it after every addition.

- Units: metres, right-handed coordinates; +X right, +Y up, +Z toward the front reference direction. Ground is Y=0. Rotation arrays are radians applied X, then Y, then Z. Camera transforms never change geometry.
- Root origin: center of the ground-contact surface. Base contact need not equal the clearance bounds center. Default scale is exactly [1,1,1].
- `dimensions`: X width, Y height, Z depth. `bounds.min/max`: exact axis-aligned rest-pose geometry extents. `footprint`: conservative XZ clearance rectangle in winding order; this is not a physics collider. Recompute rotated world bounds for placement checks. No collision solver ships in v1.
- `id` is stable, `version` a positive integer; `schemaVersion` is 1. Record estimated vs measured sizes in `measurement`. Include provenance and license; this lamp is original procedural geometry under CC0-1.0.
- Parts contain stable `id`, `parent` (null or part ID), metre `position`, radian `rotation`, local `pivot`, unit `rotationAxis`, `joint`, per-part `state`, geometry and material ID. Position is relative to the parent. Transform order: parent × translation × pivot × rotation × inverse pivot. v1 supports fixed joints only; axis metadata describes the reference axis, not an articulated joint implementation.
- Supported geometry: centered box (`size`) and Y-aligned cylinder/frustum (`radiusBottom`, `radiusTop`, `height`, `segments`, optional `openBottom`). Segments must be a multiple of four, from 8 to 128. All geometry is actual triangle data generated in metres, suitable for a shared 3D world.
- Materials have RGB [0,1] colors and optional `emissionWhenOn`. v1 switches bulb and shade appearance; it does not calculate cast light or shadows. Open-bottom shade is a two-sided single surface, not a thickness model.
- Asset `state` defines instance defaults; toggle actions name boolean state keys. Runtime instances deep-copy state. Never mutate shared asset data for interactions.
- Scene JSON contains schemaVersion and instances: id, assetId, assetVersion, position, rotation, scale and state. Unknown versions fail explicitly. Current preview storage is browser-local. Per-part animated state and migrations are future extensions.

## Adding a batch
Create one directory per asset, author metric source and provenance, append catalog paths, then validate and inspect each. Build copies all catalog sources. The default preview loads the complete published room; preview/desk-lamp.html loads the metric lamp explicitly. The renderer currently shares geometry across copies of one asset. No daily scheduler is included in this repository.

## Rendering constraints
The active previews use SVG painter sorting. Intersecting geometry can show ordering artifacts; there is no shared WebGL depth buffer. The earlier WebGL renderer remains available for metric consumers. No transparent sorting, shadows, physics, GLB exporter or performance guarantees are included. Geometry buffers are cached; rendering is event-driven. Test representative low-end devices before choosing scene budgets. Do not use per-object camera scaling to make differently sized objects appear equal.

## Procedural SVG imports

`format: procedural-svg` version 2 preserves the published SVG functions while exposing **metre-based** dimensions, bounds, footprint and Y-up placement. The original native source remains Z-up/drawing-units in `sourceCoordinates`, with its original bounds and local support origin. Previous uncalibrated version 1 descriptors remain under each asset's versions/1.json for provenance and are not catalog placement entries.

Every imported asset references the same assets/lofi-night-room/calibration.json. The assumed study-desk worktop is 0.75 m above the finished floor. In the source the floor is z=5 and the desktop top z=33, so one source unit is 0.75/28 m. This shared uniform scale preserves every relative proportion. Right-handed axis conversion is [x,z,-y]. Source origins are subtracted before conversion; renderer/placement.js supplies the inverse and world-placement helpers. No viewport, thumbnail or camera term enters that conversion.

Dimensions and bounds are **estimated placement envelopes**, not measured manufacturer dimensions or exact mesh extents. The source grouping/framing envelopes are used as estimates. Mug steam and other visual effects are excluded from physical dimensions where identified. The drawer footprint includes the open extension. Record assumptions and improve the shared calibration or an asset's source envelope in a new version if better dimensions become available; do not rescale each prop to equal screen size.

Each entry has stable id/version/name, source (repository-relative JavaScript), entry (function name), calibrationFile and provenance source/license. Component entries name their library. The room has ordered sourceFiles and components. The raw framing size is preserved in sourceCoordinates.framingSize. Definitions load separately from preview/room.js, which owns the published UI lifecycle. The SVG itself is still a projected drawing, not a metric mesh export.

assets/lofi-night-room/assembly.json gives metre positions and unit scales for all 18 components, relative to the room's ground-centered origin. renderer/placement.js maps component source points to the same room world coordinates. This placement list is separate from the original lamp player's saved interactive scene format.

The study lamp uses `format: metric-svg`, version 2, and remains 0.24 × 0.48 × 0.26 m. Its geometry/material contract above is unchanged. Version 1 is immutable at versions/1.json; saved v1 arrangements are explicitly compatible and retain their version when re-saved.
