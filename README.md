# Common Objects

Reusable household props and a Colorfigures SVG player. The default preview is the published **Lo-fi night room r2**, with its orbit camera, zoom up to 400%, Night/Light theme, lamp poses, turntable, room ambiance, drawer, see-through wiring and labels.

## Run

Node.js 20+ and Python 3. No npm dependencies or install step.

```sh
npm run validate
npm test
npm run build
npm run dev
```

Open http://localhost:8000/preview/ for the room. Choose **Study lamp ↗** to open the original collection lamp, now drawn with SVG. Its estimated 24 × 48 × 26 cm geometry, on/off state, rotation, independent duplicates and browser-local arrangement storage are preserved. Existing saved v1 arrangements remain supported.

Build output is dist/; serve it with `python3 -m http.server 8000 --directory dist`. Both players use relative local sources, including when served under a subdirectory.

## Assets

`assets/catalog.json` registers 90 entries: ten tabletop game props, ten indoor gardening props, ten cleaning/laundry props, ten stationery props, ten bathroom props, ten kitchen props, ten sewing props, the metric study lamp, the complete room and its 18 component groups (16 scene blocks, floor/rug, and see-through mechanisms). Original compound groups such as windowsill/cat and shelf/pothos are kept together to preserve the published geometry and animation.

All placeable entries use **1 unit = 1 metre**, Y-up and default scale [1,1,1].

- `metric-svg`: metre-based JSON geometry rendered by `renderer/svg.js`. Study lamp v2 retains its v1 parts and dimensions; the immutable v1 source is `assets/desk-lamp/versions/1.json`.
- `procedural-svg`: original SVG-generating functions in `assets/lofi-night-room/`, with metre placement dimensions/bounds and a shared calibration. Raw Z-up drawing coordinates are preserved under sourceCoordinates; they are converted to right-handed Y-up metres using one uniform 0.75/28 scale. Each component's metadata points to its defining source and shared library. Load the room library's ordered `sourceFiles`, then call its entry function with the published state, palette and lamp geometry as applicable. The UI lifecycle is separate in `preview/room.js`.
- `renderer/colorfigures/`: shared projection, SVG primitives, page shell, labels and see-through support.
- `sources/colorfigures/`: byte-preserved published HTML, source URL/hash and script-to-file mapping. The executable source is split into files; the snapshot is an audit reference.
- `preview/desk-lamp.html`: the original lamp interface using the SVG renderer. Version 1 JSON remains readable through the scene loader.

See [Metric placement](docs/metric-placement.md) for calibration assumptions, dimensions, reversible coordinate helpers and the original assembly placements. The published player still renders the original drawing coordinates; display zoom never changes the metric data.

## Rendering and credits

The players use SVG painter sorting; they do not provide WebGL depth testing, general intersection handling or physics. The lamp switch changes bulb/shade appearance. The room's drawn light pools, rain and mechanisms are illustrative.

Imported Colorfigures code is MIT by April Zhu, based on ISO-GLOW and Tolga Cohce's iso-figure. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the upstream notice. The original metric lamp geometry remains CC0-1.0; repository code is MIT.

### Kitchen rituals · 2026-10-23

[Open the kitchen set](preview/kitchen.html): ten original metric props in sage, wood and cream, with independent functional states. Includes cutting board, serving tray, butter dish, bread box, salt cellar, oil cruet, utensil crock, napkin holder, kitchen scale and pepper mill. All dimensions are estimates; source geometry stays at scale `[1,1,1]`. Select **Inspect selected** for four-side inspection, or **Whole set** for shared placement. Sources and SVG thumbnails are catalogued under `assets/kitchen-*/`; [batch verification](docs/kitchen-2026-10-23.md) records scope and limits.

### Mending afternoon · 2026-10-25 KST

[Open the sewing set](preview/sewing.html): thread spool, pincushion, scissors, thimble, seam ripper, retractable tape measure, needle case, sewing box, embroidery hoop and travel iron. Ten distinct original metric SVG props, with independent discrete states and saved mixed scenes. [Production record and visual evidence](docs/sewing-2026-10-25.md). These are projected 3D-coordinate SVG drawings, not delivered GLB meshes.

### Quiet morning · 2026-10-26 KST

[Open the bathroom set](preview/bathroom.html): slatted vanity riser, draining soap dish, pump dispenser, toothbrush tumbler, manual toothbrush, toothpaste tube, tissue box, cotton pad jar, wide tooth comb and hand mirror. Ten original metric SVG props with removable covers/contents, independent duplicate states, and saved arrangements. Dimensions are estimates at scale `[1,1,1]`. [Verification and visual evidence](docs/bathroom-2026-10-26.md).

### Paperwork afternoon · 2026-10-27 KST

[Open the stationery set](preview/stationery.html): desktop letter tray, stapler, two hole punch, tape dispenser, pencil sharpener, drawing pencil, twenty centimetre ruler, paper wrapped eraser, steel bookend and desktop waste bin. Ten distinct metric SVG props in sage, wood and cream, with independent removable-part states and saved arrangements. Dimensions are estimates, scale remains `[1,1,1]`. [Verification and visual evidence](docs/stationery-2026-10-27.md).

### Utility cupboard · 2026-10-27 19:00 UTC

[Open the cleaning and laundry set](preview/cleaning.html): lidded bucket, dustpan, hand brush, trigger spray bottle, scouring sponge, window squeegee, lint roller, slatted laundry basket, wooden clothespin and washboard. Ten original metric SVG props with removable components, independent states and saved arrangements. Dimensions are estimates; scale stays `[1,1,1]`. [Verification and visual evidence](docs/cleaning-2026-10-27.md).

### Windowsill tending · 2026-10-28 19:00 UTC

[Open the indoor gardening set](preview/gardening.html): watering can, trowel, three tine cultivator, seed dibber, six cell seedling tray, plant label, pruning shears, potting sieve, analog moisture meter and rolling plant caddy. Ten distinct original metric props with removable components and independent saved states. Estimated dimensions, Y-up, contact-centered origins and scale `[1,1,1]`. [Verification, dimensions and visual evidence](docs/gardening-2026-10-28.md).

### Tabletop evening · 2026-10-29 19:00 UTC

[Open the tabletop set](preview/games.html): pipped die, double-six domino, chess rook, draughts stack, felt-lined dice cup, letter tile rack, dealing shoe, sand timer, scoring peg board and lidded game box. Ten original metric SVG props with independent removable parts and saved arrangements. All dimensions are estimates at scale `[1,1,1]`. [Verification and visual evidence](docs/games-2026-10-29.md).
