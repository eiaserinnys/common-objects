import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {instanceBounds,supportSurfaces,matches} from '../renderer/metric-state.js';
import {mesh,point,worldParts} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const scene=read('assets/cafe-service-interior/assembly.json');
const assets=new Map(scene.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')]));
const fresh=[...assets.values()].filter(a=>a.id.startsWith('cafe-'));
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,msg??`${a} != ${b}`);
const partBounds=(a,p)=>{const m=worldParts(a).get(p.id),v=mesh(p.geometry).triangles,qs=[];for(let k=0;k<v.length;k+=3)qs.push(point(m,v.slice(k,k+3)));return {min:[0,1,2].map(k=>Math.min(...qs.map(q=>q[k]))),max:[0,1,2].map(k=>Math.max(...qs.map(q=>q[k])))};};
test('ten café anchors retain metre scale, all-state bounds and centered ground contact',()=>{
 assert.equal(fresh.length,10);
 for(const a of fresh){validate(a);assert.deepEqual(a.defaultScale,[1,1,1]);const matrices=worldParts(a),contacts=[];
 for(const p of a.parts){if(!matches(p.visibleWhen,a.state))continue;const vertices=mesh(p.geometry).triangles;for(let n=0;n<vertices.length;n+=3){const q=point(matrices.get(p.id),vertices.slice(n,n+3));if(Math.abs(q[1])<1e-8)contacts.push(q);}}
 for(const axis of [0,2])near(Math.max(...contacts.map(p=>p[axis]))+Math.min(...contacts.map(p=>p[axis])),0,a.id+' contact origin');
 const i=createInstance(a,'test');for(let n=0;n<2;n++){const b=instanceBounds(a,i);near(b.min[1],0);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}if(a.actions.length)act(a,i,'toggle');}
 }
});
test('fridge door remains intact at common hinge, interior shelf availability follows state',()=>{
 const a=assets.get('cafe-refrigerator');
 for(const closed of a.parts.filter(p=>p.id.startsWith('closed-'))){const open=a.parts.find(p=>p.id===closed.id.replace('closed-','open-'));assert.deepEqual(open.geometry,closed.geometry);assert.deepEqual(open.position,closed.position);assert.deepEqual(open.pivot,closed.pivot);near(open.position[0]+open.pivot[0],-.275);near(open.position[2]+open.pivot[2],.2925);near(open.rotation[1],-Math.PI/2);}
 const i=createInstance(a,'fridge');assert.equal(supportSurfaces(a,i).length,0);act(a,i,'toggle');assert.equal(supportSurfaces(a,i).length,3);
 for(const open of [false,true])assert.equal(a.parts.filter(p=>matches(p.visibleWhen,{open})&&/^(open|closed)-/.test(p.id)).length,3);
 const b=instanceBounds(a,i);near(b.max[2],.8425);assert.ok(b.min[0]<-.3,'handle projects outward with door');
});
test('espresso pour enters retained cup; sink flow ends in basin with lever motion',()=>{
 const a=assets.get('cafe-espresso-machine');const get=id=>partBounds(a,a.parts.find(p=>p.id===id));
 const stream=get('pour-stream'),spout=get('spout'),coffee=get('coffee-surface'),cup=get('demo-cup-wall'),grid=get('drip-grid-0');
 near(stream.max[1],spout.min[1]);assert.ok(stream.min[1]>=coffee.min[1]&&stream.min[1]<=coffee.max[1]);near(cup.min[1],grid.max[1]);
 for(const k of [0,2])assert.ok(stream.min[k]>cup.min[k]&&stream.max[k]<cup.max[k]);
 for(const brewing of [false,true]){const active=a.parts.filter(p=>matches(p.visibleWhen,{brewing}));assert.equal(active.filter(p=>p.id==='demo-cup-wall').length,1);assert.equal(active.filter(p=>p.id==='pour-stream').length,brewing?1:0);}
 const s=assets.get('cafe-service-sink'),water=partBounds(s,s.parts.find(p=>p.id==='water-stream')),bottom=partBounds(s,s.parts.find(p=>p.id==='basin-bottom'));
 assert.ok(water.min[1]>=bottom.max[1]&&water.min[1]<bottom.max[1]+.005);near(water.max[1],partBounds(s,s.parts.find(p=>p.id==='tap-spout')).min[1]);
 assert.notDeepEqual(s.parts.find(p=>p.id==='tap-lever-on').rotation,s.parts.find(p=>p.id==='tap-lever-off').rotation);
});
const placements=[['object-3','object-1','worktop'],['object-4','object-1','worktop'],['object-11','object-1','worktop'],['object-12','object-4','lower-deck'],['object-13','object-4','lower-deck'],['object-14','object-4','upper-deck'],['object-15','object-5','tabletop']];
test('mixed café has supported placements and reserved door/footprint clearance',()=>{
 for(const [childId,parentId,surfaceId] of placements){
 const child=scene.instances.find(i=>i.id===childId),parent=scene.instances.find(i=>i.id===parentId),b=instanceBounds(assets.get(child.assetId),child),s=supportSurfaces(assets.get(parent.assetId),parent).find(s=>s.id===surfaceId);
 near(b.min[1],s.vertices[0][1],childId+' supported contact');
 for(const k of [0,2]){assert.ok(b.min[k]>=Math.min(...s.vertices.map(p=>p[k]))-1e-8,childId+' min containment');assert.ok(b.max[k]<=Math.max(...s.vertices.map(p=>p[k]))+1e-8,childId+' max containment');}
 }
 const ground=scene.instances.filter(i=>i.position[1]===0);
 for(let j=0;j<ground.length;j++)for(let k=j+1;k<ground.length;k++){
 const bounds=[ground[j],ground[k]].map(i=>{const a=assets.get(i.assetId),copy=structuredClone(i);if(a.id==='cafe-refrigerator')copy.state.open=true;return instanceBounds(a,copy);});
 assert.ok([0,2].some(k=>bounds[0].max[k]<=bounds[1].min[k]||bounds[1].max[k]<=bounds[0].min[k]),ground[j].assetId+' overlaps '+ground[k].assetId);
 }
 // On each support, children do not occupy overlapping volumes.
 for(let j=0;j<placements.length;j++)for(let k=j+1;k<placements.length;k++)if(placements[j][1]===placements[k][1]&&placements[j][2]===placements[k][2]){
 const b=[placements[j][0],placements[k][0]].map(id=>{const i=scene.instances.find(i=>i.id===id);return instanceBounds(assets.get(i.assetId),i);});assert.ok([0,2].some(k=>b[0].max[k]<=b[1].min[k]||b[1].max[k]<=b[0].min[k]));
 }
});
test('all three operations are instance independent and entire mixed layout round-trips',()=>{
 const instances=structuredClone(scene.instances);
 for(const a of fresh){const original=instances.find(i=>i.assetId===a.id),copy=structuredClone(original);copy.id+='-copy';copy.position[0]+=.3;if(a.actions.length){act(a,copy,'toggle');assert.notDeepEqual(original.state,copy.state);}instances.push(copy);}
 assert.deepEqual(loadScene(saveScene(instances),assets),instances);assert.equal(fresh.filter(a=>a.actions.length).length,3);assert.equal(instances.length,25);
});
