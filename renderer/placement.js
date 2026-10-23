import {point, transform} from './geometry.js';

// Native Colorfigures coordinates are right-handed Z-up. Gameplay is Y-up,
// in metres. One shared calibration preserves the relative size of every prop.
export function sourceToMetric(asset, calibration, sourcePoint) {
  const d = sourcePoint.map((v, k) => (v - asset.sourceCoordinates.origin[k]) * calibration.metresPerSourceUnit);
  return [d[0], d[2], -d[1]];
}

export function metricToSource(asset, calibration, metricPoint) {
  const [x, y, z] = metricPoint.map(v => v / calibration.metresPerSourceUnit);
  const o = asset.sourceCoordinates.origin;
  return [o[0] + x, o[1] - z, o[2] + y];
}

export function metricGeometry(asset, calibration) {
  const source = asset.sourceCoordinates.bounds, corners = [];
  for (const x of [source.min[0], source.max[0]])
    for (const y of [source.min[1], source.max[1]])
      for (const z of [source.min[2], source.max[2]])
        corners.push(sourceToMetric(asset, calibration, [x,y,z]));
  const min = [0,1,2].map(k => Math.min(...corners.map(p => p[k])));
  const max = [0,1,2].map(k => Math.max(...corners.map(p => p[k])));
  const clearance = asset.sourceCoordinates.clearanceBounds || source;
  const ends = [clearance.min, clearance.max].map(p => sourceToMetric(asset, calibration, p));
  const x0 = Math.min(...ends.map(p => p[0])), x1 = Math.max(...ends.map(p => p[0]));
  const z0 = Math.min(...ends.map(p => p[2])), z1 = Math.max(...ends.map(p => p[2]));
  return {
    bounds: {min, max}, dimensions: max.map((v,k) => v - min[k]),
    footprint: [[x0,z0],[x1,z0],[x1,z1],[x0,z1]]
  };
}

export function assemblyPosition(asset, room, calibration) {
  return sourceToMetric(room, calibration, asset.sourceCoordinates.origin);
}

export function worldPoint(asset, calibration, sourcePoint, placement) {
  return point(transform(placement.position, placement.rotation, placement.scale),
    sourceToMetric(asset, calibration, sourcePoint));
}
