import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {reachableStates} from '../scripts/retail-states.mjs';import {validate} from '../scripts/validate.mjs';import {loadScene,saveScene,createInstance,act} from '../renderer/model.js';import {resolveAttachments} from '../renderer/attachments.js';import {instanceBounds,matches} from '../renderer/metric-state.js';import {mesh,worldParts,mul,transform,point} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url))),raw=read('assets/music-interior/assembly.json'),assets=new Map(raw.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')])),scene=loadScene(JSON.stringify(raw),assets),fresh=[...assets.values()].filter(a=>a.id.startsWith('music-')),a=id=>assets.get('music-'+id),near=(x,y,msg)=>assert.ok(Math.abs(x-y)<1e-8,msg||`${x} != ${y}`);
function partBounds(asset,i){const matrices=worldParts(asset),root=transform(i.position,i.rotation,i.scale);return asset.parts.filter(p=>matches(p.visibleWhen,i.state)).map(p=>{const m=mul(root,matrices.get(p.id)),v=mesh(p.geometry).triangles,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],points=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));points.push(q);q.forEach((x,j)=>{min[j]=Math.min(x,min[j]);max[j]=Math.max(x,max[j]);});}return {id:p.id,min,max,points};});}
const overlap=(a,b)=>[0,1,2].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-7);
test('ten music sources retain real units, centered contact origins and 18 reachable poses',()=>{
 assert.equal(fresh.length,10);let count=0;for(const aa of fresh){validate(aa);const i=createInstance(aa,aa.id),contact=partBounds(aa,i).flatMap(p=>p.points).filter(p=>Math.abs(p[1])<1e-8);for(const k of [0,2])near(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])),0,aa.id);for(const pose of reachableStates(aa)){i.state=pose.state;const b=instanceBounds(aa,i);assert.ok(b.min[1]>=-1e-8);for(const k of [0,1,2]){assert.ok(b.min[k]>=aa.bounds.min[k]-1e-8);assert.ok(b.max[k]<=aa.bounds.max[k]+1e-8);}count++;}}assert.equal(count,18);
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


test('amplifier gain guard and saved-state rules reject invalid power sequences',()=>{
 const aa=a('amplifier'),i=createInstance(aa,'amp');assert.throws(()=>act(aa,i,'gain'),/power/);act(aa,i,'toggle');act(aa,i,'gain');const before=structuredClone(i);assert.throws(()=>act(aa,i,'toggle'),/gain/);assert.deepEqual(i,before);act(aa,i,'gain');act(aa,i,'toggle');assert.deepEqual(i.state,aa.state);i.state={powered:false,boosted:true};assert.throws(()=>loadScene(saveScene([i]),assets));
});
test('table carries metronome and lamp through yaw/translation and exact restoration',()=>{
 let s=structuredClone(scene);s[13].position[0]+=.4;s[13].rotation[1]=.3;s=resolveAttachments(s,assets);for(const n of [9,14]){near(s[n].position[1],.92);near(s[n].rotation[1],.3);assert.notDeepEqual(s[n].position,scene[n].position);}assert.deepEqual(loadScene(saveScene(s),assets),s);
 for(const original of scene){const copy=structuredClone(original),aa=assets.get(copy.assetId);copy.id+='-copy';delete copy.attachment;copy.position[0]+=.2;copy.state=structuredClone(reachableStates(aa).at(-1).state);s.push(copy);}assert.equal(s.length,30);assert.deepEqual(loadScene(saveScene(s),assets),s);
});
test('retained motion endpoints change physical geometry without scale tricks',()=>{
 for(const aa of fresh)for(const m of aa.motionRanges){assert.equal(m.mode,'discrete-endpoints');assert.equal(m.parts.length,2);const [p,q]=m.parts.map(id=>aa.parts.find(p=>p.id===id));assert.ok(p&&q);assert.notDeepEqual([p.position,p.rotation],[q.position,q.rotation]);}
 near(a('music-stand').parts.find(p=>p.id==='high-tray').position[1]-a('music-stand').parts.find(p=>p.id==='low-tray').position[1],.26);
 const aa=a('vibraphone'),i=createInstance(aa,'v');act(aa,i,'toggle');const parts=partBounds(aa,i);near(parts.find(p=>p.id==='touch-damper').max[1],parts.find(p=>p.id==='bar-0').min[1]);
});

test('every music structural component connects to its base in each pose',()=>{
 for(const aa of fresh)for(const state of reachableStates(aa)){const i=createInstance(aa,'t');i.state=state.state;const parts=partBounds(aa,i);const connected=new Set(parts.map((p,n)=>p.min[1]<1e-8?n:-1).filter(n=>n>=0));let changed=true;while(changed){changed=false;parts.forEach((p,n)=>{if(connected.has(n))return;for(const m of connected)if([0,1,2].every(k=>Math.min(p.max[k],parts[m].max[k])-Math.max(p.min[k],parts[m].min[k])>=-1e-8)){connected.add(n);changed=true;break;}});}assert.equal(connected.size,parts.length,aa.id+' unsupported parts: '+parts.filter((_,n)=>!connected.has(n)).map(p=>p.id).join(','));}
});

test('bass beater reaches the head only in the pressed endpoint',()=>{
 const aa=a('drum-kit'),i=createInstance(aa,'kit');const rest=partBounds(aa,i),head=rest.find(p=>p.id==='bass-back-head');assert.ok(!overlap(rest.find(p=>p.id==='rest-felt'),head));act(aa,i,'toggle');const hit=partBounds(aa,i);assert.ok(overlap(hit.find(p=>p.id==='strike-felt'),head));
});
