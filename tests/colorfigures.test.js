import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
test('catalog includes published room and every scene layer', async () => {
 const catalog = await json('assets/catalog.json');
 const assets = await Promise.all(catalog.assets.map(p => json('assets/' + p)));
 const room = assets.find(a => a.id === 'lofi-night-room');
 assert.ok(room, 'published room must be registered');
 assert.equal(room.components.length, 18);
 for (const id of room.components) assert.ok(assets.some(a => a.id === id), id);
});
test('published source scripts reconstruct the imported source byte for byte', async () => {
 const source = await readFile(new URL('sources/colorfigures/lofi-night-room-r2.html', root), 'utf8');
 const manifest = await json('sources/colorfigures/import.json');
 for (const group of manifest.scripts) {
  const parts = await Promise.all(group.files.map(p => readFile(new URL(p, root), 'utf8')));
  assert.equal(parts.join(''), [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)][group.index][1]);
 }
});
test('desk lamp keeps immutable v1 source and gains an SVG renderer', async () => {
 const lamp = await json('assets/desk-lamp/asset.json');
 assert.equal(lamp.version, 2);
 assert.equal(lamp.format, 'metric-svg');
 const original = await json('assets/desk-lamp/versions/1.json');
 assert.equal(original.version, 1);
 assert.deepEqual(lamp.parts, original.parts);
 assert.deepEqual(lamp.dimensions, original.dimensions);
 assert.match(await readFile(new URL('preview/app.js', root), 'utf8'), /renderer\/svg.js/);
});
import {svgScene} from '../renderer/svg.js';
import {createInstance} from '../renderer/model.js';
import {validateProcedural} from '../scripts/validate-svg.mjs';
test('SVG lamp responds to independent state, rotation and zoom', async () => {
 const lamp = await json('assets/desk-lamp/asset.json');
 const x = createInstance(lamp, 'a'), y = createInstance(lamp, 'b', [.32, 0, .04]);
 const camera = {yaw:-.45, pitch:.25, distance:1.25};
 const draw = () => svgScene(lamp, [x,y], camera, 900, 630);
 const baseline = draw();
 assert.match(baseline, /<path/); assert.doesNotMatch(baseline, /NaN|undefined|Infinity/);
 x.state.on = true; assert.notEqual(draw(), baseline); assert.equal(y.state.on, false);
 const lit = draw(); x.rotation[1] = Math.PI / 3; assert.notEqual(draw(), lit);
 const turned = draw(); camera.distance = 1.6; assert.notEqual(draw(), turned);
});
test('SVG validator rejects missing definitions, metric claims and absent components', async () => {
 const catalog = await json('assets/catalog.json');
 const assets = new Map(await Promise.all(catalog.assets.map(async p => { const a=await json('assets/'+p); return [a.id,a]; })));
 const room = assets.get('lofi-night-room');
 await validateProcedural(room, assets);
 for (const mutate of [a => a.entry='missingFunction', a => a.units='m', a => a.components.push('missing-object'), a => a.source='assets/missing.js']) {
  const a=structuredClone(room); mutate(a); await assert.rejects(validateProcedural(a, assets));
 }
});
import {saveScene, loadScene} from '../renderer/model.js';
test('SVG lamp opens existing version 1 arrangements without losing state', async () => {
 const lamp = await json('assets/desk-lamp/asset.json');
 const original = await json('assets/desk-lamp/versions/1.json');
 const x = createInstance(original, 'saved-lamp', [.3,0,.4]); x.state.on=true;
 assert.deepEqual(loadScene(saveScene([x]),new Map([[lamp.id,lamp]])),[x]);
});
