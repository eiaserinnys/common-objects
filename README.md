# Common Objects

A growing collection of metric household props, kept separate from their renderer and UI. First asset: an interactive **study lamp**, estimated **0.24 m wide × 0.48 m high × 0.26 m deep**. Geometry stays at scale (1,1,1); Y is up and the origin is at the circular base's ground-contact center.

## Run
Requires Node.js 20+ for checks and Python 3 for the local server. No npm dependencies or install step.

```sh
npm run validate
npm test
npm run build
npm run dev
```

Open http://localhost:8000/preview/ (not file://). Build output is `dist/`; `python3 -m http.server 8000 --directory dist` serves the same `/preview/` path.

Drag to orbit; scroll or use the slider to zoom. Switch the selected lamp on/off, rotate it, duplicate it, select another copy, and save/restore the arrangement in browser local storage. Keyboard controls are available for buttons and sliders. A 10 cm ground grid and metric dimensions expose the real size. The switch changes bulb and shade appearance, not physically simulated room illumination.

## Layout

- `assets/catalog.json`: asset index.
- `assets/desk-lamp/asset.json`: original reusable geometry, dimensions, materials, parts and state.
- `renderer/geometry.js`: procedural triangle generation and metric transforms.
- `renderer/webgl.js`: shared depth-tested renderer and ink-like edge lines.
- `renderer/model.js`: independent instances, actions and scene serialization.
- `preview/`: browser interface, separate from assets.
- `scripts/`: source validation and dependency-free static build.
- `tests/`: contract, transforms, persistence and independent-state checks.
- `docs/asset-spec.md`: authoring contract and known limits.

Muted colors and ink contours are inspired by [Colorfigures](https://april-zhu.com/colorfigures). No Colorfigures source or assets are embedded. Code is MIT; the lamp's original procedural asset is CC0-1.0 as recorded in its metadata. The collection is prepared for additional assets; today's implementation contains one type only. Scheduling future production is separate from this repository.
