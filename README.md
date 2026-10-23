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

`assets/catalog.json` registers 20 entries: the metric study lamp, the complete room and its 18 component groups (16 scene blocks, floor/rug, and see-through mechanisms). Original compound groups such as windowsill/cat and shelf/pothos are kept together to preserve the published geometry and animation.

- `metric-svg`: metre-based JSON geometry rendered by `renderer/svg.js`. Study lamp v2 retains its v1 parts and dimensions; the immutable v1 source is `assets/desk-lamp/versions/1.json`.
- `procedural-svg`: original SVG-generating functions in `assets/lofi-night-room/`, using drawing units and Z-up. These are illustrative coordinates, with no claimed metre conversion. Each component's metadata points to its defining source and shared library. Load the room library's ordered `sourceFiles`, then call its entry function with the published state, palette and lamp geometry as applicable. The UI lifecycle is separate in `preview/room.js`.
- `renderer/colorfigures/`: shared projection, SVG primitives, page shell, labels and see-through support.
- `sources/colorfigures/`: byte-preserved published HTML, source URL/hash and script-to-file mapping. The executable source is split into files; the snapshot is an audit reference.
- `preview/desk-lamp.html`: the original lamp interface using the SVG renderer. Version 1 JSON remains readable through the scene loader.

## Rendering and credits

The players use SVG painter sorting; they do not provide WebGL depth testing, general intersection handling, physics or metric conversion of the room. The lamp switch changes bulb/shade appearance. The room's drawn light pools, rain and mechanisms are illustrative.

Imported Colorfigures code is MIT by April Zhu, based on ISO-GLOW and Tolga Cohce's iso-figure. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the upstream notice. The original metric lamp geometry remains CC0-1.0; repository code is MIT.
