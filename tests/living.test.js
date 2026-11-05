import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {instanceBounds,supportSurfaces,matches} from '../renderer/metric-state.js';
import {mesh,point,worldParts} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const scene=read('assets/living-interior/assembly.json');
const assets=new Map(scene.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')]));
const fresh=[...assets.values()].filter(a=>a.id.startsWith('living-'));
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,msg??`${a} != ${b}`);
const vertices=(a,p)=>{const m=worldParts(a).get(p.id),v=mesh(p.geometry).triangles,qs=[];for(let k=0;k<v.length;k+=3)qs.push(point(m,v.slice(k,k+3)));return qs;};
const live=(a,state)=>a.parts.filter(p=>matches(p.visibleWhen,state));
test('ten lounge sources: metric bounds, defaults, ground contact, all operating states',()=>{
 assert.equal(fresh.length,10);
 for(const a of fresh){validate(a);assert.deepEqual(a.defaultScale,[1,1,1]);
 const contacts=live(a,a.state).flatMap(p=>vertices(a,p)).filter(q=>Math.abs(q[1])<1e-8);
 for(const k of [0,2])near(Math.max(...contacts.map(p=>p[k]))+Math.min(...contacts.map(p=>p[k])),0,a.id+' origin');
 const i=createInstance(a,'test');for(let n=0;n<2;n++){const b=instanceBounds(a,i);near(b.min[1],0);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}if(a.actions.length)act(a,i,'toggle');}
 }
});
const placements=[['object-7','object-5','top'],['object-11','object-3','top'],['object-12','object-3','top'],['object-13','object-10','outer-top'],['object-14','object-3','top']];
test('TV and reused small props contact and fit supported surfaces; all endpoint envelopes clear',()=>{
 for(const [childId,parentId,surfaceId] of placements){const child=scene.instances.find(i=>i.id===childId),parent=scene.instances.find(i=>i.id===parentId),b=instanceBounds(assets.get(child.assetId),child),s=supportSurfaces(assets.get(parent.assetId),parent).find(s=>s.id===surfaceId);
 near(b.min[1],s.vertices[0][1],childId+' contact');for(const k of [0,2]){assert.ok(b.min[k]>=Math.min(...s.vertices.map(p=>p[k]))-1e-8,childId+' min');assert.ok(b.max[k]<=Math.max(...s.vertices.map(p=>p[k]))+1e-8,childId+' max');}}
 const ground=scene.instances.filter(i=>i.position[1]===0);
 const envelopes=ground.map(i=>{const a=assets.get(i.assetId),q=structuredClone(i),states=[instanceBounds(a,q)];if(a.actions.length){act(a,q,'toggle');states.push(instanceBounds(a,q));}return {min:[0,1,2].map(k=>Math.min(...states.map(b=>b.min[k]))),max:[0,1,2].map(k=>Math.max(...states.map(b=>b.max[k])))};});
 for(let j=0;j<ground.length;j++)for(let k=j+1;k<ground.length;k++)assert.ok([0,2].some(axis=>envelopes[j].max[axis]<=envelopes[k].min[axis]||envelopes[k].max[axis]<=envelopes[j].min[axis]),ground[j].assetId+' overlaps '+ground[k].assetId);
 for(let j=0;j<placements.length;j++)for(let k=j+1;k<placements.length;k++)if(placements[j][1]===placements[k][1]){const b=[placements[j][0],placements[k][0]].map(id=>{const i=scene.instances.find(i=>i.id===id);return instanceBounds(assets.get(i.assetId),i);});assert.ok([0,2].some(k=>b[0].max[k]<=b[1].min[k]||b[1].max[k]<=b[0].min[k]));}
});
test('seven operating lounge assets keep independent state and round-trip all placements',()=>{
 assert.equal(fresh.filter(a=>a.actions.length).length,7);
 const instances=structuredClone(scene.instances);
 for(const a of assets.values()){const original=instances.find(i=>i.assetId===a.id),copy=structuredClone(original);copy.id+='-copy';copy.position[0]+=.3;if(a.actions.length){act(a,copy,'toggle');assert.notDeepEqual(original.state,copy.state);}instances.push(copy);}
 assert.equal(instances.length,28);assert.deepEqual(loadScene(saveScene(instances),assets),instances);
});
test('recliner retains seat and feet while back and footrest rotate around X hinges',()=>{
 const a=assets.get('living-recliner');for(const suffix of ['back','footrest']){const c=a.parts.find(p=>p.id==='upright-'+suffix),o=a.parts.find(p=>p.id==='extended-'+suffix);assert.deepEqual(c.geometry,o.geometry);assert.deepEqual(c.position,o.position);}
 for(const label of ['back','foot']){const c=a.parts.find(p=>p.id==='upright-'+label+'-hinge'),o=a.parts.find(p=>p.id==='extended-'+label+'-hinge');assert.deepEqual(c.position,o.position);assert.deepEqual(o.rotationAxis,[1,0,0]);assert.notEqual(c.rotation[0],o.rotation[0]);}
 const i=createInstance(a,'chair'),before=instanceBounds(a,i);act(a,i,'toggle');const after=instanceBounds(a,i);assert.ok(after.min[2]<before.min[2]-.15);assert.ok(after.max[2]>before.max[2]+.15);assert.ok(live(a,i.state).some(p=>p.id==='seat'));
});
test('ottoman opens storage by rotating intact lid; console exposes only uncovered bay',()=>{
 const a=assets.get('living-storage-ottoman'),i=createInstance(a,'box');assert.equal(supportSurfaces(a,i).length,0);act(a,i,'toggle');near(supportSurfaces(a,i)[0].vertices[0][1],.085);near(a.parts.find(p=>p.id==='open-hinge').rotation[0],-Math.PI/2);
 const lid=a.parts.find(p=>p.id==='open-lid');assert.equal(lid.parent,'open-hinge');assert.deepEqual(lid.geometry,a.parts.find(p=>p.id==='closed-lid').geometry);
 const c=assets.get('living-media-console'),j=createInstance(c,'console');assert.deepEqual(supportSurfaces(c,j).map(s=>s.id),['top','right-bay']);act(c,j,'toggle');assert.deepEqual(supportSurfaces(c,j).map(s=>s.id),['top','left-bay']);near(c.parts.find(p=>p.id==='right-door').position[0]-c.parts.find(p=>p.id==='left-door').position[0],.78);
});
test('nesting action moves entire smaller table and enables matching surface without moving outer table',()=>{
 const a=assets.get('living-nesting-tables'),i=createInstance(a,'tables');assert.equal(supportSurfaces(a,i).length,1);
 for(const p of a.parts.filter(p=>p.id.startsWith('in-'))){const q=a.parts.find(q=>q.id===p.id.replace('in-','out-'));assert.deepEqual(p.geometry,q.geometry);near(q.position[0]-p.position[0],.56);near(q.position[1],p.position[1]);}
 act(a,i,'toggle');assert.equal(supportSurfaces(a,i).length,2);near(supportSurfaces(a,i)[1].vertices[0][1],.47);
});
test('screen folds a connected hinge chain while stand stays; display and lamp have meaningful power indication',()=>{
 const a=assets.get('living-privacy-screen');for(const n of [1,2]){const p=a.parts.find(p=>p.id==='folded-'+n+'-hinge');assert.equal(p.parent,'folded-'+(n-1)+'-hinge');assert.equal(p.rotationAxis[1],1);assert.ok(Math.abs(p.rotation[1])>2);}
 const i=createInstance(a,'screen'),b=instanceBounds(a,i);act(a,i,'toggle');assert.ok(instanceBounds(a,i).max[0]-instanceBounds(a,i).min[0]<b.max[0]-b.min[0]);assert.ok(live(a,i.state).some(p=>p.id==='base'));
 const tv=assets.get('living-television'),j=createInstance(tv,'tv');assert.ok(live(tv,j.state).some(p=>p.id==='screen-off'));act(tv,j,'toggle');assert.ok(live(tv,j.state).some(p=>p.id==='test-horizon'));assert.ok(!live(tv,j.state).some(p=>p.id==='screen-off'));
 const lamp=assets.get('living-floor-lamp');assert.ok(lamp.materials.glow.emissionWhenOn>0);
});
