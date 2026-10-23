import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {metricGeometry} from '../renderer/placement.js';

const root = new URL('../', import.meta.url);
export async function validateProcedural(asset, assets) {
  assert.equal(asset.schemaVersion, 1);
  assert.equal(asset.format, 'procedural-svg');
  assert.equal(asset.units, 'm');
  assert.equal(asset.upAxis, 'Y');
  assert.equal(asset.measurement.status, 'estimated');
  assert.equal(asset.sourceCoordinates.units, 'drawing-units');
  assert.equal(asset.sourceCoordinates.upAxis, 'Z');
  assert.deepEqual(asset.defaultScale, [1,1,1]);
  assert.equal(asset.origin, 'ground-contact-center');
  const calibration = JSON.parse(await readFile(new URL(asset.calibrationFile, root), 'utf8'));
  assert.deepEqual(calibration.axisMapping, ['x','z','-y']);
  assert.ok(calibration.metresPerSourceUnit > 0 && Number.isFinite(calibration.metresPerSourceUnit));
  const ref = calibration.reference;
  assert.ok(Math.abs((ref.sourceDesktopZ-ref.sourceFloorZ)*calibration.metresPerSourceUnit-ref.estimatedDesktopHeightMetres)<1e-9);
  const geometry = metricGeometry(asset, calibration);
  for (const key of ['min','max']) for (let k=0;k<3;k++)
    assert.ok(Math.abs(asset.bounds[key][k]-geometry.bounds[key][k])<1e-8, 'Metric bounds mismatch');
  for (let k=0;k<3;k++) assert.ok(asset.dimensions[k]>0 && Math.abs(asset.dimensions[k]-geometry.dimensions[k])<1e-8);
  assert.equal(asset.bounds.min[1], 0);
  assert.equal(asset.footprint.length, 4);
  for (let i=0;i<4;i++) for (let k=0;k<2;k++)
    assert.ok(Math.abs(asset.footprint[i][k]-geometry.footprint[i][k])<1e-8, 'Metric footprint mismatch');
  assert.ok(asset.measurement.note && asset.boundsKind === 'estimated-placement-envelope');
  assert.ok(asset.provenance.source && asset.provenance.license);
  assert.match(asset.id, /^[a-z][a-z0-9-]*$/);
  assert.ok(Number.isInteger(asset.version) && asset.version > 0);
  assert.match(asset.entry, /^[a-zA-Z][a-zA-Z0-9]*$/);
  assert.ok(asset.source.startsWith('assets/') && !asset.source.includes('..'));
  const source = await readFile(new URL(asset.source, root), 'utf8');
  assert.match(source, new RegExp('function ' + asset.entry + '\\('), 'Missing entry definition');
  if (asset.library) assert.ok(assets.has(asset.library), 'Missing source library');
  for (const path of asset.sourceFiles || []) await readFile(new URL(path, root));
  for (const id of asset.components || []) assert.ok(assets.has(id), 'Missing scene component');
  return {id: asset.id, entry: asset.entry};
}
