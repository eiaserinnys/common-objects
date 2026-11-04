import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {instanceBounds,supportSurfaces,matches} from '../renderer/metric-state.js';
import {mesh,point,worldParts} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const scene=read('assets/utility-interior/assembly.json');
const assets=new Map(scene.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')]));
const fresh=[...assets.values()].filter(a=>a.id.startsWith('utility-'));
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,msg??`${a} != ${b}`);
const partBounds=(a,p)=>{const m=worldParts(a).get(p.id),v=mesh(p.geometry).triangles,qs=[];for(let k=0;k<v.length;k+=3)qs.push(point(m,v.slice(k,k+3)));return {min:[0,1,2].map(k=>Math.min(...qs.map(q=>q[k]))),max:[0,1,2].map(k=>Math.max(...qs.map(q=>q[k])))};};
test('ten utility anchors retain metre scale, all-state bounds and centered ground contact',()=>{
 assert.equal(fresh.length,10);
 for(const a of fresh){validate(a);assert.deepEqual(a.defaultScale,[1,1,1]);const matrices=worldParts(a),contacts=[];
 for(const p of a.parts){if(!matches(p.visibleWhen,a.state))continue;const vertices=mesh(p.geometry).triangles;for(let n=0;n<vertices.length;n+=3){const q=point(matrices.get(p.id),vertices.slice(n,n+3));if(Math.abs(q[1])<1e-8)contacts.push(q);}}
 for(const axis of [0,2])near(Math.max(...contacts.map(p=>p[axis]))+Math.min(...contacts.map(p=>p[axis])),0,a.id+' contact origin');
 const i=createInstance(a,'test');for(let n=0;n<2;n++){const b=instanceBounds(a,i);near(b.min[1],0);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}if(a.actions.length)act(a,i,'toggle');}
 }
});
const placements=[['object-12','object-4','worktop'],['object-13','object-4','worktop'],['object-14','object-4','worktop'],['object-15','object-6','basket-floor'],['object-16','object-5','pressing-area']];
test('mixed utility has supported placements and reserved door/footprint clearance',()=>{
 for(const [childId,parentId,surfaceId] of placements){
 const child=scene.instances.find(i=>i.id===childId),parent=scene.instances.find(i=>i.id===parentId),b=instanceBounds(assets.get(child.assetId),child),s=supportSurfaces(assets.get(parent.assetId),parent).find(s=>s.id===surfaceId);
 near(b.min[1],s.vertices[0][1],childId+' supported contact');
 for(const k of [0,2]){assert.ok(b.min[k]>=Math.min(...s.vertices.map(p=>p[k]))-1e-8,childId+' min containment');assert.ok(b.max[k]<=Math.max(...s.vertices.map(p=>p[k]))+1e-8,childId+' max containment');}
 }
 const ground=scene.instances.filter(i=>i.position[1]===0);
 for(let j=0;j<ground.length;j++)for(let k=j+1;k<ground.length;k++){
 const bounds=[ground[j],ground[k]].map(i=>{const a=assets.get(i.assetId),copy=structuredClone(i);if(a.actions.some(x=>x.stateKey==='open'))copy.state.open=true;return instanceBounds(a,copy);});
 assert.ok([0,2].some(k=>bounds[0].max[k]<=bounds[1].min[k]||bounds[1].max[k]<=bounds[0].min[k]),ground[j].assetId+' overlaps '+ground[k].assetId);
 }
 // On each support, children do not occupy overlapping volumes.
 for(let j=0;j<placements.length;j++)for(let k=j+1;k<placements.length;k++)if(placements[j][1]===placements[k][1]&&placements[j][2]===placements[k][2]){
 const b=[placements[j][0],placements[k][0]].map(id=>{const i=scene.instances.find(i=>i.id===id);return instanceBounds(assets.get(i.assetId),i);});assert.ok([0,2].some(k=>b[0].max[k]<=b[1].min[k]||b[1].max[k]<=b[0].min[k]));
 }
});
test('both access operations are instance independent and entire mixed layout round-trips',()=>{
 const instances=structuredClone(scene.instances);
 for(const a of fresh){const original=instances.find(i=>i.assetId===a.id),copy=structuredClone(original);copy.id+='-copy';copy.position[0]+=.3;if(a.actions.length){act(a,copy,'toggle');assert.notDeepEqual(original.state,copy.state);}instances.push(copy);}
 assert.deepEqual(loadScene(saveScene(instances),assets),instances);assert.equal(fresh.filter(a=>a.actions.length).length,2);assert.equal(instances.length,26);
});
test('washer door preserves common Y hinge and opens loading access without mutating drum',()=>{
 const a=assets.get('utility-washer');
 const closed=a.parts.find(p=>p.id==='closed-hinge'),open=a.parts.find(p=>p.id==='open-hinge');
 assert.deepEqual(closed.position,open.position);assert.deepEqual(closed.pivot,[0,0,0]);near(open.rotation[1],-Math.PI/2);
 for(const suffix of ['rim','window','handle']){const c=a.parts.find(p=>p.id==='closed-'+suffix),o=a.parts.find(p=>p.id==='open-'+suffix);assert.deepEqual(c.geometry,o.geometry);assert.deepEqual(c.position,o.position);assert.equal(o.parent,'open-hinge');}
 for(const state of [false,true]){const live=a.parts.filter(p=>matches(p.visibleWhen,{open:state}));assert.equal(live.filter(p=>p.id.endsWith('-window')).length,1);assert.equal(live.filter(p=>p.id==='drum-shell').length,1);}
 const i=createInstance(a,'washer'),initial=instanceBounds(a,i);act(a,i,'toggle');assert.ok(instanceBounds(a,i).max[2]>initial.max[2]+.3);
 const shell=a.parts.find(p=>p.id==='drum-shell');assert.equal(shell.geometry.openTop,true);assert.equal(shell.geometry.openBottom,true);
});
test('cabinet sliding door translates as one unit and exposes bounded shelf supports',()=>{
 const a=assets.get('utility-cleaning-cabinet'),i=createInstance(a,'cabinet');assert.equal(supportSurfaces(a,i).length,0);
 for(const suffix of ['door','pull']){const c=a.parts.find(p=>p.id==='closed-'+suffix),o=a.parts.find(p=>p.id==='open-'+suffix);near(o.position[0]-c.position[0],-.76);assert.deepEqual(c.geometry,o.geometry);}
 act(a,i,'toggle');assert.equal(supportSurfaces(a,i).length,3);
 for(const s of a.supportSurfaces){const shelf=partBounds(a,a.parts.find(p=>p.id===s.id));near(s.height,shelf.max[1]);for(const [x,z] of s.polygon){assert.ok(x>=shelf.min[0]&&x<=shelf.max[0]);assert.ok(z>=shelf.min[2]&&z<=shelf.max[2]);}}
});
