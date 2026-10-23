import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
export async function validateProcedural(asset, assets) {
  assert.equal(asset.schemaVersion, 1);
  assert.equal(asset.format, 'procedural-svg');
  assert.equal(asset.units, 'drawing-units');
  assert.equal(asset.upAxis, 'Z');
  assert.equal(asset.measurement.status, 'illustrative');
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
