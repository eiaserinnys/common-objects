import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {reachableStates} from '../scripts/retail-states.mjs';import {validate} from '../scripts/validate.mjs';import {loadScene,saveScene,createInstance,act} from '../renderer/model.js';import {resolveAttachments} from '../renderer/attachments.js';import {instanceBounds,matches} from '../renderer/metric-state.js';import {mesh,worldParts,mul,transform,point} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url))),raw=read('assets/wellness-interior/assembly.json'),assets=new Map(raw.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')])),scene=loadScene(JSON.stringify(raw),assets),fresh=[...assets.values()].filter(a=>a.id.startsWith('wellness-')),a=id=>assets.get('wellness-'+id),near=(x,y,msg)=>assert.ok(Math.abs(x-y)<1e-8,msg||`${x} != ${y}`);
function partBounds(asset,i){const matrices=worldParts(asset),root=transform(i.position,i.rotation,i.scale);return asset.parts.filter(p=>matches(p.visibleWhen,i.state)).map(p=>{const m=mul(root,matrices.get(p.id)),v=mesh(p.geometry).triangles,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],points=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));points.push(q);q.forEach((x,j)=>{min[j]=Math.min(x,min[j]);max[j]=Math.max(x,max[j]);});}return {id:p.id,min,max,points};});}
const overlap=(a,b)=>[0,1,2].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-7);
test('ten wellness sources retain real units, centered contact origins and 22 reachable poses',()=>{
 assert.equal(fresh.length,10);let count=0;for(const aa of fresh){validate(aa);const i=createInstance(aa,aa.id),contact=partBounds(aa,i).flatMap(p=>p.points).filter(p=>Math.abs(p[1])<1e-8);for(const k of [0,2])near(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])),0,aa.id);for(const pose of reachableStates(aa)){i.state=pose.state;const b=instanceBounds(aa,i);assert.ok(b.min[1]>=-1e-8);for(const k of [0,1,2]){assert.ok(b.min[k]>=aa.bounds.min[k]-1e-8);assert.ok(b.max[k]<=aa.bounds.max[k]+1e-8);}count++;}}assert.equal(count,22);
});

test('all mixed scene endpoint pairs clear with supports and mounts resolved together',()=>{
 for(let j=0;j<scene.length;j++)for(let k=j+1;k<scene.length;k++)for(const sj of reachableStates(assets.get(scene[j].assetId)))for(const sk of reachableStates(assets.get(scene[k].assetId))){const proposed=structuredClone(scene);proposed[j].state=sj.state;proposed[k].state=sk.state;const s=resolveAttachments(proposed,assets);for(const p of partBounds(assets.get(s[j].assetId),s[j]))for(const q of partBounds(assets.get(s[k].assetId),s[k]))assert.ok(!overlap(p,q),`${s[j].id}/${p.id} intersects ${s[k].id}/${q.id}`);}
});

test('actual flat decks underpin all available support regions in every pose',()=>{
 for(const aa of fresh)for(const pose of reachableStates(aa)){const i=createInstance(aa,aa.id);i.state=pose.state;for(const surface of aa.supportSurfaces.filter(s=>matches(s.availableWhen,i.state))){const boxes=partBounds(aa,i);for(const [x,z] of surface.polygon)assert.ok(boxes.some(b=>Math.abs(b.max[1]-surface.height)<1e-8&&x>=b.min[0]-1e-8&&x<=b.max[0]+1e-8&&z>=b.min[2]-1e-8&&z<=b.max[2]+1e-8),aa.id+' phantom support');}}
});

test('guarded exercise step and hoist refuse invalid operations without mutation',()=>{
 const cycle=a('cycle'),i=createInstance(cycle,'c');assert.throws(()=>act(cycle,i,'toggle'),/Enable/);assert.deepEqual(i.state,cycle.state);act(cycle,i,'power');act(cycle,i,'toggle');assert.equal(i.state.stepped,true);assert.throws(()=>act(cycle,i,'toggle'));act(cycle,i,'reset');assert.equal(i.state.stepped,false);
 const h=a('transfer-hoist'),j=createInstance(h,'h');assert.throws(()=>act(h,j,'toggle'),/Set brake/);act(h,j,'brake');act(h,j,'toggle');const before=structuredClone(j);assert.throws(()=>act(h,j,'brake'),/Lower/);assert.deepEqual(j,before);act(h,j,'lower');act(h,j,'brake');assert.deepEqual(j.state,h.state);
 j.state={braked:false,raised:true};assert.throws(()=>loadScene(saveScene([j]),assets),/requires/);
});
test('all accepted action states load and all guard refusals preserve instance exactly',()=>{
 for(const aa of fresh)for(const pose of reachableStates(aa))for(const action of aa.actions){const i=createInstance(aa,'probe');i.state=structuredClone(pose.state);const before=structuredClone(i);let rejected=false;try{act(aa,i,action.id);}catch{rejected=true;}if(rejected)assert.deepEqual(i,before);else assert.deepEqual(loadScene(saveScene([i]),assets),[i]);}
});
test('three supported props follow height/rotation and duplicate states restore independently',()=>{
 assert.equal(scene.filter(i=>i.attachment).length,3);let s=structuredClone(scene);act(a('overbed-table'),s[7],'toggle');s[7].position[0]+=.3;s[7].rotation[1]=.4;s=resolveAttachments(s,assets);near(s[14].position[1],1);near(s[14].rotation[1],.4);assert.notDeepEqual(s[14].position,scene[14].position);assert.deepEqual(loadScene(saveScene(s),assets),s);
 for(const original of scene){const copy=structuredClone(original),aa=assets.get(copy.assetId);copy.id+='-copy';delete copy.attachment;delete copy.mount;copy.position[0]+=.2;const states=reachableStates(aa);copy.state=structuredClone(states.at(-1).state);if(states.length>1)assert.notDeepEqual(copy.state,original.state);s.push(copy);}assert.equal(s.length,34);assert.deepEqual(loadScene(saveScene(s),assets),s);
});
test('complete crank, backrest and hoist rotation uses declared pivots; supports are state-aware',()=>{
 const c=a('cycle');near(c.parts.find(p=>p.id==='quarter-axle').rotation[0],Math.PI/2);for(const aa of fresh)for(const m of aa.motionRanges){assert.equal(m.mode,'discrete-endpoints');for(const id of m.parts)assert.ok(aa.parts.some(p=>p.id===id),aa.id+id);}
 const couch=a('couch');near(couch.parts.find(p=>p.id==='back-raised').pivot[2],.37);assert.equal(a('overbed-table').supportSurfaces.filter(s=>s.id==='tabletop').length,2);
 const wheel=a('shoulder-wheel');assert.equal(wheel.parts.filter(p=>p.parent==='rest-hub').length,wheel.parts.filter(p=>p.parent==='turned-hub').length);
});

test('all new wellness assets form connected structural assemblies',()=>{
 for(const aa of fresh)for(const state of reachableStates(aa)){const i=createInstance(aa,'t');i.state=state.state;const parts=partBounds(aa,i),connected=new Set([0]);let changed=true;while(changed){changed=false;parts.forEach((p,n)=>{if(connected.has(n))return;for(const m of connected)if([0,1,2].every(k=>Math.min(p.max[k],parts[m].max[k])-Math.max(p.min[k],parts[m].min[k])>=-1e-8)){connected.add(n);changed=true;break;}});}assert.equal(connected.size,parts.length,aa.id+' floating parts: '+parts.filter((_,n)=>!connected.has(n)).map(p=>p.id).join(','));}
});
