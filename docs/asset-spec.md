# Asset contract v1

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

The catalog also accepts `format: procedural-svg`, schemaVersion 1. This format preserves published SVG-generating JavaScript instead of converting it to metric primitives. It declares `units: drawing-units`, `upAxis: Z`, and `measurement.status: illustrative`. No metre dimensions, exact physical bounds or contact footprint are inferred from drawing coordinates.

Each entry has a stable id/version/name, source (repository-relative JavaScript file), entry (function name) and provenance source/license. Component entries name their library; the room library has ordered sourceFiles, framingSize and components. Groups keep their original dependencies and compound contents. The sourceFiles define geometry; loading preview/room.js additionally mounts the published UI and animation lifecycle. Per-frame palette and state arguments follow the original function signatures.

The room contains 16 painter-sorted blocks plus the floor/rug and mechanisms layers. Painter-sort envelopes in the source are drawing hints, not exact geometry bounds. The room framing size 112 × 120 × 88 uses drawing units. A consumer needing metric placement must calibrate a separate new version.

The study lamp uses `format: metric-svg`, version 2. Its geometry/material contract above is unchanged; renderer/svg.js replaces the display backend. The immutable version 1 source is versions/1.json. Scene loading explicitly accepts that version for the desk lamp and retains its version when re-saving.
