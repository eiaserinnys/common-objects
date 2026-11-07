import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {instanceBounds,supportSurfaces,matches} from '../renderer/metric-state.js';
import {mesh,point,worldParts} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const scene=read('assets/bedroom-interior/assembly.json');
const assets=new Map(scene.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')]));
const fresh=[...assets.values()].filter(a=>a.id.startsWith('bedroom-'));
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,msg??`${a} != ${b}`);
const vertices=(a,p)=>{const m=worldParts(a).get(p.id),v=mesh(p.geometry).triangles,qs=[];for(let k=0;k<v.length;k+=3)qs.push(point(m,v.slice(k,k+3)));return qs;};
const live=(a,state)=>a.parts.filter(p=>matches(p.visibleWhen,state));
test('ten bedroom sources: metric bounds, defaults, ground contact, all operating states',()=>{
 assert.equal(fresh.length,10);
 for(const a of fresh){validate(a);assert.deepEqual(a.defaultScale,[1,1,1]);
 const contacts=live(a,a.state).flatMap(p=>vertices(a,p)).filter(q=>Math.abs(q[1])<1e-8);
 for(const k of [0,2])near(Math.max(...contacts.map(p=>p[k]))+Math.min(...contacts.map(p=>p[k])),0,a.id+' origin');
 const i=createInstance(a,'test'),keys=Object.keys(a.state);for(let n=0;n<2**keys.length;n++){keys.forEach((k,j)=>i.state[k]=!!(n&(1<<j)));const b=instanceBounds(a,i);near(b.min[1],0);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}}
 }
});
const placements=[['object-11','object-2','top'],['object-12','object-4','top'],['object-13','object-5','top'],['object-14','object-5','top']];
test('Reused bedroom props contact and fit supported surfaces; all endpoint envelopes clear',()=>{
 for(const [childId,parentId,surfaceId] of placements){const child=scene.instances.find(i=>i.id===childId),parent=scene.instances.find(i=>i.id===parentId),b=instanceBounds(assets.get(child.assetId),child),s=supportSurfaces(assets.get(parent.assetId),parent).find(s=>s.id===surfaceId);
 near(b.min[1],s.vertices[0][1],childId+' contact');for(const k of [0,2]){assert.ok(b.min[k]>=Math.min(...s.vertices.map(p=>p[k]))-1e-8,childId+' min');assert.ok(b.max[k]<=Math.max(...s.vertices.map(p=>p[k]))+1e-8,childId+' max');}}
 const ground=scene.instances.filter(i=>i.position[1]===0);
 const envelopes=ground.map(i=>{const a=assets.get(i.assetId),q=structuredClone(i),states=[instanceBounds(a,q)];if(a.actions.length){act(a,q,'toggle');states.push(instanceBounds(a,q));}return {min:[0,1,2].map(k=>Math.min(...states.map(b=>b.min[k]))),max:[0,1,2].map(k=>Math.max(...states.map(b=>b.max[k])))};});
 for(let j=0;j<ground.length;j++)for(let k=j+1;k<ground.length;k++)assert.ok([0,2].some(axis=>envelopes[j].max[axis]<=envelopes[k].min[axis]||envelopes[k].max[axis]<=envelopes[j].min[axis]),ground[j].assetId+' overlaps '+ground[k].assetId);
 for(let j=0;j<placements.length;j++)for(let k=j+1;k<placements.length;k++)if(placements[j][1]===placements[k][1]){const b=[placements[j][0],placements[k][0]].map(id=>{const i=scene.instances.find(i=>i.id===id);return instanceBounds(assets.get(i.assetId),i);});assert.ok([0,2].some(k=>b[0].max[k]<=b[1].min[k]||b[1].max[k]<=b[0].min[k]));}
});
test('eight operating bedroom assets keep independent state and round-trip all placements',()=>{
 assert.equal(fresh.filter(a=>a.actions.length).length,8);
 const instances=structuredClone(scene.instances);
 for(const a of assets.values()){const original=instances.find(i=>i.assetId===a.id),copy=structuredClone(original);copy.id+='-copy';copy.position[0]+=.3;if(a.actions.length){act(a,copy,'toggle');assert.notDeepEqual(original.state,copy.state);}instances.push(copy);}
 assert.equal(instances.length,30);assert.deepEqual(loadScene(saveScene(instances),assets),instances);
});
test('every operation changes live geometry; actions and duplicate states are independent',()=>{
 for(const a of fresh){const i=createInstance(a,'source'),copy=createInstance(a,'copy');
 for(const action of a.actions){const before=live(a,copy.state).map(p=>p.id),prior=structuredClone(copy.state);act(a,copy,action.id);assert.notDeepEqual(live(a,copy.state).map(p=>p.id),before,a.id+' '+action.id);for(const k of Object.keys(prior))assert.equal(copy.state[k],k===action.stateKey?!prior[k]:prior[k]);assert.deepEqual(i.state,a.state);act(a,copy,action.id);assert.deepEqual(copy.state,prior);}
 }
});
test('all independent endpoint states serialize without changing defaults or other state keys',()=>{
 const instances=[];
 for(const a of fresh){const keys=Object.keys(a.state);for(let mask=0;mask<2**keys.length;mask++){const i=createInstance(a,a.id+'-'+mask,[mask*.2,0,0]);keys.forEach((k,n)=>i.state[k]=!!(mask&(1<<n)));instances.push(i);near(instanceBounds(a,i).min[1],0);}}
 assert.equal(instances.length,26);assert.deepEqual(loadScene(saveScene(instances),assets),instances);
});
test('bedroom drawers move complete open boxes and stay below their fixed tops',()=>{
 for(const [id,prefix,travel,top] of [['nightstand','drawer',.24,.56],['chest','top-drawer',.30,1.10],['dressing-desk','cosmetic',.22,.76]]){
 const a=assets.get('bedroom-'+id);for(const suffix of ['front','floor','rear','side-0','side-1','pull']){const c=a.parts.find(p=>p.id===prefix+'-in-'+suffix),o=a.parts.find(p=>p.id===prefix+'-out-'+suffix);near(o.position[2]-c.position[2],travel);assert.deepEqual(c.geometry,o.geometry);assert.ok(Math.max(...vertices(a,o).map(q=>q[1]))<top-.025);}
 }
});
test('wardrobe doors, suitcase lid and mirror tilt retain parent axes and whole geometry',()=>{
 const a=assets.get('bedroom-wardrobe');
 for(const [side,key,angle] of [['left','open',-Math.PI/2],['right','rightOpen',Math.PI/2]]){
 const c=a.parts.find(p=>p.id===side+'-closed-hinge'),o=a.parts.find(p=>p.id===side+'-open-hinge');assert.deepEqual(c.position,o.position);near(o.rotation[1],angle);assert.deepEqual(o.rotationAxis,[0,1,0]);const i=createInstance(a,'one');act(a,i,key==='open'?'toggle':key);assert.equal(i.state[key],true);assert.equal(i.state[key==='open'?'rightOpen':'open'],false);
 }
 const s=assets.get('bedroom-suitcase');near(s.parts.find(p=>p.id==='open-hinge').rotation[1],-Math.PI/2);near(s.parts.find(p=>p.id==='extended-grip').position[1]-s.parts.find(p=>p.id==='retracted-grip').position[1],.39);
 const m=assets.get('bedroom-mirror');near(m.parts.find(p=>p.id==='tilted-pivot').rotation[0],-.16);assert.deepEqual(m.parts.find(p=>p.id==='tilted-pivot').rotationAxis,[1,0,0]);
});
test('fan yaw carries rotor, motor and cage; power changes blade phase without removing parts',()=>{
 const a=assets.get('bedroom-fan');for(const turned of [false,true]){const p=turned?'turned':'forward';const rest=live(a,{on:false,turned}),on=live(a,{on:true,turned});assert.equal(rest.filter(p=>p.id.includes('-blade-')).length,3);assert.equal(on.filter(p=>p.id.includes('-blade-')).length,3);assert.equal(rest.filter(p=>p.id.includes('-cage-')).length,16);for(const q of on.filter(q=>q.id.includes('-blade-')||q.id.includes('-cage-')||q.id.includes('-motor')))assert.equal(q.parent,p+'-yaw');near(a.parts.find(q=>q.id===p+'-true-blade-0').rotation[2],-.55);}
 const air=assets.get('bedroom-air-purifier');assert.equal(live(air,{on:true,service:false}).filter(p=>p.id.startsWith('air-')).length,3);near(air.parts.find(p=>p.id==='service-filter').position[2]-air.parts.find(p=>p.id==='closed-filter').position[2],.20);
});
test('luggage rack exposes actual narrow straps, no unsupported solid deck or fake folding action',()=>{
 const a=assets.get('bedroom-luggage-rack');assert.equal(a.actions.length,0);assert.equal(a.supportSurfaces.length,3);for(const s of a.supportSurfaces){near(s.height,.52);const width=Math.max(...s.polygon.map(p=>p[0]))-Math.min(...s.polygon.map(p=>p[0]));near(width,.085);assert.ok(width<.09);}
 assert.equal(assets.get('bedroom-bed').actions.length,0);assert.equal(assets.get('bedroom-bed').supportSurfaces.length,0);
});
test('conservative all-state clearance envelopes of every floor item remain disjoint',()=>{
 const floor=scene.instances.filter(i=>i.position[1]===0);for(let j=0;j<floor.length;j++)for(let k=j+1;k<floor.length;k++){const i=floor[j],v=floor[k],a=assets.get(i.assetId),b=assets.get(v.assetId);assert.ok([0,2].some(t=>a.bounds.max[t]+i.position[t]<=b.bounds.min[t]+v.position[t]||b.bounds.max[t]+v.position[t]<=a.bounds.min[t]+i.position[t]),i.assetId+' overlaps '+v.assetId);}
});
