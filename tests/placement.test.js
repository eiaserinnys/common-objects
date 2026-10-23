import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sourceToMetric, metricToSource, metricGeometry, assemblyPosition, worldPoint} from '../renderer/placement.js';
const json=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
const room=await json('assets/lofi-night-room/asset.json');
const calibration=await json('assets/lofi-night-room/calibration.json');
const near=(a,b)=>a.forEach((v,k)=>assert.ok(Math.abs(v-b[k])<1e-9, `${a} != ${b}`));
test('shared calibration makes the authored desktop height 0.75 m above the floor',()=>{
 const floor=sourceToMetric(room,calibration,[22,40,5]);
 const desk=sourceToMetric(room,calibration,[22,40,33]);
 near([desk[0]-floor[0],desk[1]-floor[1],desk[2]-floor[2]],[0,.75,0]);
 assert.equal(room.units,'m');assert.equal(room.upAxis,'Y');assert.deepEqual(room.defaultScale,[1,1,1]);
});
test('source axes map to right-handed Y-up metres and round trip without normalization',()=>{
 const o=room.sourceCoordinates.origin, s=calibration.metresPerSourceUnit;
 near(sourceToMetric(room,calibration,o),[0,0,0]);
 near(sourceToMetric(room,calibration,[o[0]+1,o[1],o[2]]),[s,0,0]);
 near(sourceToMetric(room,calibration,[o[0],o[1]+1,o[2]]),[0,0,-s]);
 near(sourceToMetric(room,calibration,[o[0],o[1],o[2]+1]),[0,s,0]);
 const p=[45,70,33];near(metricToSource(room,calibration,sourceToMetric(room,calibration,p)),p);
});
test('every imported group has estimated metric bounds and assembles at the source location',async()=>{
 const paths=(await json('assets/catalog.json')).assets;
 for(const path of paths){const asset=await json('assets/'+path);if(asset.format!=='procedural-svg')continue;
  assert.equal(asset.units,'m');assert.equal(asset.upAxis,'Y');assert.equal(asset.measurement.status,'estimated');
  const g=metricGeometry(asset,calibration);near(g.dimensions,asset.dimensions);near(g.bounds.min,asset.bounds.min);near(g.bounds.max,asset.bounds.max);
  g.footprint.forEach((p,k)=>near(p,asset.footprint[k]));
  const position=assemblyPosition(asset,room,calibration);
  near(worldPoint(asset,calibration,asset.sourceCoordinates.bounds.min,{position,rotation:[0,0,0],scale:[1,1,1]}),sourceToMetric(room,calibration,asset.sourceCoordinates.bounds.min));
 }
});
test('stored assembly places every original group at metre positions with scale 1',async()=>{
 const assembly=await json('assets/lofi-night-room/assembly.json');
 assert.equal(assembly.units,'m');assert.equal(assembly.upAxis,'Y');
 assert.deepEqual(assembly.placements.map(p=>p.assetId).sort(),[...room.components].sort());
 for(const placement of assembly.placements){
  const asset=await json('assets/'+placement.assetId+'/asset.json');
  near(placement.position,assemblyPosition(asset,room,calibration));
  assert.deepEqual(placement.scale,[1,1,1]);assert.equal(placement.assetVersion,asset.version);
 }
});
test('the existing lamp keeps its 0.48 m height beside calibrated props, independent of camera',async()=>{
 const lamp=await json('assets/desk-lamp/asset.json');assert.equal(lamp.dimensions[1],.48);
 const chair=await json('assets/lofi-study-chair/asset.json');
 const g=metricGeometry(chair,calibration);assert.ok(g.dimensions[1]>1 && g.dimensions[1]<1.4);
 const p=chair.sourceCoordinates.origin;
 near(worldPoint(chair,calibration,p,{position:[1,0,2],rotation:[0,Math.PI/2,0],scale:[1,1,1]}),[1,0,2]);
});
