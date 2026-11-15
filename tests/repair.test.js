import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {reachableStates} from '../scripts/retail-states.mjs';import {validate} from '../scripts/validate.mjs';import {loadScene,saveScene,createInstance,act} from '../renderer/model.js';import {resolveAttachments} from '../renderer/attachments.js';import {instanceBounds,matches} from '../renderer/metric-state.js';import {mesh,worldParts,mul,transform,point} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url))),raw=read('assets/repair-interior/assembly.json'),assets=new Map(raw.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')])),scene=loadScene(JSON.stringify(raw),assets),fresh=[...assets.values()].filter(a=>a.id.startsWith('repair-')),a=id=>assets.get('repair-'+id),near=(x,y,msg)=>assert.ok(Math.abs(x-y)<1e-8,msg||`${x} != ${y}`);
function partBounds(asset,i){const matrices=worldParts(asset),root=transform(i.position,i.rotation,i.scale);return asset.parts.filter(p=>matches(p.visibleWhen,i.state)).map(p=>{const m=mul(root,matrices.get(p.id)),v=mesh(p.geometry).triangles,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],points=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));points.push(q);q.forEach((x,j)=>{min[j]=Math.min(x,min[j]);max[j]=Math.max(x,max[j]);});}return {id:p.id,min,max,points};});}
const overlap=(a,b)=>[0,1,2].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-7);
test('eleven repair sources retain real units, centered contact origins and 26 reachable poses',()=>{
 assert.equal(fresh.length,11);let count=0;for(const aa of fresh){validate(aa);const i=createInstance(aa,aa.id),contact=partBounds(aa,i).flatMap(p=>p.points).filter(p=>Math.abs(p[1])<1e-8);for(const k of [0,2])near(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])),0,aa.id);for(const pose of reachableStates(aa)){i.state=pose.state;const b=instanceBounds(aa,i);assert.ok(b.min[1]>=-1e-8);for(const k of [0,1,2]){assert.ok(b.min[k]>=aa.bounds.min[k]-1e-8);assert.ok(b.max[k]<=aa.bounds.max[k]+1e-8);}count++;}}assert.equal(count,26);
});

test('all mixed scene endpoint pairs clear with supports and mounts resolved together',()=>{
 for(let j=0;j<scene.length;j++)for(let k=j+1;k<scene.length;k++)for(const sj of reachableStates(assets.get(scene[j].assetId)))for(const sk of reachableStates(assets.get(scene[k].assetId))){const proposed=structuredClone(scene);proposed[j].state=sj.state;proposed[k].state=sk.state;const s=resolveAttachments(proposed,assets);for(const p of partBounds(assets.get(s[j].assetId),s[j]))for(const q of partBounds(assets.get(s[k].assetId),s[k]))assert.ok(!overlap(p,q),`${s[j].id}/${p.id} intersects ${s[k].id}/${q.id}`);}
});

test('actual flat decks underpin all available support regions in every pose',()=>{
 for(const aa of fresh)for(const pose of reachableStates(aa)){const i=createInstance(aa,aa.id);i.state=pose.state;for(const surface of aa.supportSurfaces.filter(s=>matches(s.availableWhen,i.state))){const boxes=partBounds(aa,i);for(const [x,z] of surface.polygon)assert.ok(boxes.some(b=>Math.abs(b.max[1]-surface.height)<1e-8&&x>=b.min[0]-1e-8&&x<=b.max[0]+1e-8&&z>=b.min[2]-1e-8&&z<=b.max[2]+1e-8),aa.id+' phantom support');}}
});


test('all accepted action states load and all guard refusals preserve instance exactly',()=>{
 for(const aa of fresh)for(const pose of reachableStates(aa))for(const action of aa.actions){const i=createInstance(aa,'probe');i.state=structuredClone(pose.state);const before=structuredClone(i);let rejected=false;try{act(aa,i,action.id);}catch{rejected=true;}if(rejected)assert.deepEqual(i,before);else assert.deepEqual(loadScene(saveScene([i]),assets),[i]);}
});

test('all new repair assets form connected structural assemblies',()=>{
 for(const aa of fresh)for(const state of reachableStates(aa)){const i=createInstance(aa,'t');i.state=state.state;const parts=partBounds(aa,i),connected=new Set([0]);let changed=true;while(changed){changed=false;parts.forEach((p,n)=>{if(connected.has(n))return;for(const m of connected)if([0,1,2].every(k=>Math.min(p.max[k],parts[m].max[k])-Math.max(p.min[k],parts[m].min[k])>=-1e-8)){connected.add(n);changed=true;break;}});}assert.equal(connected.size,parts.length,aa.id+' floating parts: '+parts.filter((_,n)=>!connected.has(n)).map(p=>p.id).join(','));}
});

test('drill feed, compressor drain and washer hood enforce their own ordinary operations',()=>{
 const aa=a('drill-press'),i=createInstance(aa,'drill');assert.throws(()=>act(aa,i,'toggle'),/Enable/);act(aa,i,'power');act(aa,i,'toggle');const fed=structuredClone(i);assert.throws(()=>act(aa,i,'power'),/Return/);assert.deepEqual(i,fed);act(aa,i,'return');act(aa,i,'power');assert.deepEqual(i.state,aa.state);
 const c=a('compressor'),j=createInstance(c,'air');act(c,j,'toggle');act(c,j,'vent');assert.deepEqual(j.state,{charged:false,drainOpen:true});const vented=structuredClone(j);assert.throws(()=>act(c,j,'toggle'));assert.deepEqual(j,vented);act(c,j,'close');act(c,j,'toggle');assert.equal(j.state.charged,true);
 const w=a('parts-washer'),k=createInstance(w,'washer');assert.throws(()=>act(w,k,'wash'));act(w,k,'toggle');act(w,k,'wash');const washed=structuredClone(k);assert.throws(()=>act(w,k,'toggle'));assert.deepEqual(k,washed);act(w,k,'reset');act(w,k,'toggle');assert.deepEqual(k.state,w.state);
 for(const [aa,state] of [[w,{open:false,washed:true}],[c,{charged:true,drainOpen:true}]]){const i=createInstance(aa,'bad');i.state=state;assert.throws(()=>loadScene(saveScene([i]),assets));}
});
test('vacuum collection requires closed latch and emptying requires released latch',()=>{
 const aa=a('shop-vacuum'),i=createInstance(aa,'v');assert.throws(()=>act(aa,i,'empty'));act(aa,i,'latch');const before=structuredClone(i);assert.throws(()=>act(aa,i,'toggle'));assert.deepEqual(i,before);act(aa,i,'latch');act(aa,i,'toggle');assert.equal(i.state.collected,true);act(aa,i,'latch');act(aa,i,'empty');assert.equal(i.state.collected,false);
});
test('five supported objects and mounted tool board follow hosts and detach duplicates independently',()=>{
 assert.equal(scene.filter(i=>i.attachment).length,5);assert.equal(scene.filter(i=>i.mount).length,1);let s=structuredClone(scene);s[11].position[0]+=.4;s[11].rotation[1]=.3;s[14].position[0]+=.2;s=resolveAttachments(s,assets);for(const n of [2,4]){near(s[n].position[1],.92);near(s[n].rotation[1],.3);assert.notDeepEqual(s[n].position,scene[n].position);}near(s[9].position[0],scene[9].position[0]+.2);assert.deepEqual(loadScene(saveScene(s),assets),s);
 for(const original of scene){const copy=structuredClone(original),aa=assets.get(copy.assetId);copy.id+='-copy';delete copy.attachment;delete copy.mount;copy.position[0]+=.2;copy.state=structuredClone(reachableStates(aa).at(-1).state);s.push(copy);}assert.equal(s.length,34);assert.deepEqual(loadScene(saveScene(s),assets),s);
});
test('documented travel moves retained parts rather than removing operating assemblies',()=>{
 for(const aa of fresh)for(const m of aa.motionRanges){assert.equal(m.mode,'discrete-endpoints');for(const id of m.parts)assert.ok(aa.parts.some(p=>p.id===id));}
 near(a('bench-vise').parts.find(p=>p.id==='open-jaw').position[2]-a('bench-vise').parts.find(p=>p.id==='closed-jaw').position[2],.08);
 near(a('floor-pump').parts.find(p=>p.id==='up-grip').position[1]-a('floor-pump').parts.find(p=>p.id==='down-grip').position[1],.28);
 const bike=a('bicycle');assert.equal(bike.parts.filter(p=>p.id.startsWith('tire-')).length,48);near(bike.parts.find(p=>p.id==='back-axle').rotation[0],-Math.PI/2);
});

test('truing feelers address the sample rim band rather than empty space',()=>{
 const aa=a('truing-stand');for(const name of ['in-tip-1','out-tip-1']){const p=aa.parts.find(p=>p.id===name),distance=Math.hypot(p.position[1]-.47,p.position[2]);assert.ok(distance>.287 && distance<.313);assert.ok(p.position[0]-p.geometry.size[0]/2>.0125);}
});

test('fed drill tip enters sample while clearing the solid worktable',()=>{
 const aa=a('drill-press'),i=createInstance(aa,'d');act(aa,i,'power');act(aa,i,'toggle');const b=partBounds(aa,i),bit=b.find(p=>p.id==='fed-bit'),table=b.find(p=>p.id==='worktable'),sample=b.find(p=>p.id==='retained-workpiece');assert.ok(bit.min[1]>table.max[1]+.005);assert.ok(bit.min[1]<sample.max[1]);near(bit.max[1],b.find(p=>p.id==='fed-quill').min[1]);
});
