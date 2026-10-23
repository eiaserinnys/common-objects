import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {instanceBounds,supportSurfaces} from '../renderer/metric-state.js';
import {svgScene} from '../renderer/svg.js';
const catalog=JSON.parse(await readFile(new URL('../assets/catalog.json',import.meta.url)));
const list=await Promise.all(catalog.assets.filter(p=>p.startsWith('kitchen-')).map(async p=>JSON.parse(await readFile(new URL('../assets/'+p,import.meta.url)))));
const assets=new Map(list.map(a=>[a.id,a]));
test('ten different metric kitchen objects have valid exact bounds and support metadata',()=>{
 assert.equal(list.length,10);assert.equal(new Set(list.map(a=>a.name)).size,10);
 for(const a of list){validate(a);assert.equal(a.measurement.status,'estimated');
 for(const p of a.parts)for(const [k,v] of Object.entries(p.visibleWhen||{})){assert.equal(typeof a.state[k],'boolean');assert.equal(typeof v,'boolean');}
 for(const s of a.supportSurfaces){assert.ok(s.height>=0&&s.height<=a.bounds.max[1]);assert.deepEqual(s.normal,[0,1,0]);for(const [x,z] of s.polygon){assert.ok(x>=a.bounds.min[0]&&x<=a.bounds.max[0]);assert.ok(z>=a.bounds.min[2]&&z<=a.bounds.max[2]);}}
 }
});
test('every meaningful state changes drawing independently and survives mixed scene restore',()=>{
 const instances=[];for(const a of list){const x=createInstance(a,a.id),y=createInstance(a,a.id+'-copy',[.4,.75,.2]);
 const camera={yaw:.4,pitch:.6,distance:1,target:[0,.1,0]},before=svgScene(a,[x],camera,400,300);act(a,x,'toggle');assert.notEqual(svgScene(a,[x],camera,400,300),before);assert.deepEqual(y.state,a.state);
 y.rotation[1]=Math.PI/2;instances.push(x,y);
 const b=instanceBounds(a,y);assert.ok(Math.abs(b.min[1]-.75)<1e-8);assert.ok(Math.abs(b.max[0]-b.min[0]-a.dimensions[2])<1e-8);
 for(const s of supportSurfaces(a,y))assert.ok(s.vertices.every(v=>v[1]>=.75));
 }
 assert.deepEqual(loadScene(saveScene(instances),assets),instances);
});
test('support availability follows lid state and object fits on bread box lid at scale one',()=>{
 const a=assets.get('kitchen-bread-box'),i=createInstance(a,'box');assert.deepEqual(supportSurfaces(a,i).map(s=>s.id),['closed-lid']);act(a,i,'toggle');assert.deepEqual(supportSurfaces(a,i).map(s=>s.id),['interior']);
 const salt=assets.get('kitchen-salt-cellar'),s=createInstance(salt,'salt',[0,.192,0]),b=instanceBounds(salt,s);assert.equal(b.min[1],.192);assert.ok(b.min[0]>=-.16&&b.max[0]<=.16&&b.min[2]>=-.105&&b.max[2]<=.105);
});
test('global scene painter orders near object over farther geometry regardless of instance order',()=>{
 const a=assets.get('kitchen-bread-box'),far=createInstance(a,'far',[0,0,-.4]),near=createInstance(a,'near',[0,0,.4]);
 const c={yaw:0,pitch:0,distance:2,target:[0,.1,0],grid:false};assert.equal(svgScene(assets,[far,near],c,500,400),svgScene(assets,[near,far],c,500,400));
});
