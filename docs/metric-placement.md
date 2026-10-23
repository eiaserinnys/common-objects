# Metric placement

All catalog assets use **1 unit = 1 metre**, Y-up, XZ ground and default scale [1,1,1]. This applies to future daily props too. Camera zoom only changes display magnification.

## Shared estimate and source preservation

The original room has no surveyed dimensions. We assume a study-desk worktop height of 0.75 m above the finished floor, a reasonable nominal estimate for this scene. The source floor surface is z=5 (RM_FH) and the desktop top is z=33 (drawDeskTop). Their difference is 28 drawing units. Therefore **s = 0.75 / 28 = 0.026785714285714284 metres per source unit**. This is a physical reference estimate, not a fit to the screen.

The same scale is used for the room and every component, retaining their authored proportions. The room's placement envelope is approximately 3.080 × 2.357 × 3.214 m, including the floor slab and exterior wall allowance. Finished-floor-to-wall-top height is about 2.223 m. The illustrated articulated lamp is taller than the original 0.48 m study lamp; these are different objects at one common scale, not equal-size thumbnails.

Raw source bounds and support-center origins remain in each asset's sourceCoordinates. The complete HTML and the previous uncalibrated descriptors are preserved unchanged. Envelope dimensions are estimates: most begin from the author's sorting/framing boxes, the mug envelope excludes steam, and the desk drawer has extra clearance for its open position. They are not a claim of exact mesh extents, surveyed sizes or collision geometry. The shared calibration file records the assumption and axis mapping.

## Reversible conversion

For native point (x,y,z), local source origin (ox,oy,oz), and shared scale s:

```js
metric = [s*(x-ox), s*(z-oz), -s*(y-oy)];
source = [ox+metric[0]/s, oy-metric[2]/s, oz+metric[1]/s];
```

The axis permutation preserves handedness. No camera term is involved.

```js
import {sourceToMetric, metricToSource, worldPoint} from '../renderer/placement.js';
const calibration = await fetch('../assets/lofi-night-room/calibration.json').then(r => r.json());
const asset = await fetch('../assets/lofi-mug/asset.json').then(r => r.json());
const sourcePoint = [48.5, 38, 33];
const localMetres = sourceToMetric(asset, calibration, sourcePoint);
const original = metricToSource(asset, calibration, localMetres);
const inGame = worldPoint(asset, calibration, sourcePoint, {
  position: [1, 0, 2], rotation: [0, Math.PI/2, 0], scale: [1,1,1]
});
```

Use assemblyPosition(asset, room, calibration) to retain the original room arrangement. The same metre positions are precomputed in assets/lofi-night-room/assembly.json, where every placement has scale [1,1,1]. The renderer helpers operate on source 3D points; they do not convert projected SVG paths back into a mesh or provide a decorating-game UI.

## Estimated placement envelopes

Dimensions are X width × Y height × Z depth, in metres. Compound groups remain compound groups.

| Asset | Dimensions (m) |
| :--- | :--- |
| Study lamp | 0.240 × 0.480 × 0.260 |
| Lo-fi night room | 3.080 × 2.357 × 3.214 |
| Floor, rug and shadows | 3.000 × 0.134 × 3.214 |
| Corner pillar | 0.161 × 2.223 × 0.161 |
| Window wall and city skyline | 0.241 × 2.223 × 3.054 |
| Right wall, clock and acoustic panels | 2.839 × 2.223 × 0.161 |
| Windowsill, succulent and cat | 0.220 × 0.343 × 1.607 |
| Shelf, books and pothos | 0.220 × 0.804 × 0.964 |
| Fairy string lights | 2.839 × 0.161 × 3.054 |
| Vinyl crate and paper lantern | 1.018 × 0.723 × 0.370 |
| Desk cabinet, drawer and legs | 1.085 × 0.670 × 2.196 |
| Timber desktop | 1.098 × 0.080 × 2.196 |
| Belt-drive turntable | 0.643 × 0.321 × 0.643 |
| Cocoa mug and coaster | 0.214 × 0.169 × 0.254 |
| Notebook and fountain pen | 0.616 × 0.161 × 0.750 |
| Articulated desk lamp | 0.509 × 1.098 × 0.482 |
| Over-ear headphones | 0.402 × 0.188 × 0.455 |
| Swivel study chair | 0.643 × 1.259 × 0.643 |
| Monstera planter | 0.589 × 1.045 × 0.589 |
| Room wiring and mechanisms | 3.080 × 2.223 × 3.214 |
