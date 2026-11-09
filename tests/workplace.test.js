import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {resolveAttachments} from '../renderer/attachments.js';
import {instanceBounds,matches} from '../renderer/metric-state.js';
import {mesh,point,worldParts} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const raw=read('assets/workplace-interior/assembly.json');
const assets=new Map(raw.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')]));
const scene=loadScene(JSON.stringify(raw),assets),fresh=[...assets.values()].filter(a=>a.id.startsWith('workplace-'));
const a=id=>assets.get('workplace-'+id),near=(x,y,msg)=>assert.ok(Math.abs(x-y)<1e-8,msg??`${x} != ${y}`);
const live=(a,s)=>a.parts.filter(p=>matches(p.visibleWhen,s));
const points=(a,p)=>{const m=worldParts(a).get(p.id),v=mesh(p.geometry).triangles,q=[];for(let n=0;n<v.length;n+=3)q.push(point(m,v.slice(n,n+3)));return q;};
test('ten workplace sources have finite metric bounds, bottom-center origins and nineteen valid poses',()=>{
 assert.equal(fresh.length,10);let poses=0;for(const a of fresh){validate(a);assert.equal(a.measurement.status,'estimated');assert.deepEqual(a.defaultScale,[1,1,1]);const q=live(a,a.state).flatMap(p=>points(a,p)).filter(q=>Math.abs(q[1])<1e-8);for(const k of [0,2])near(Math.min(...q.map(q=>q[k]))+Math.max(...q.map(q=>q[k])),0,a.id+' contact-center');const i=createInstance(a,a.id);for(let n=0;n<(a.actions.length?2:1);n++){if(n)act(a,i,'toggle');const b=instanceBounds(a,i);near(b.min[1],0);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}poses++;}}
 assert.equal(poses,19);
});
test('all mixed floor endpoint envelopes remain disjoint',()=>{
 const floor=scene.filter(i=>i.position[1]===0);for(let j=0;j<floor.length;j++)for(let k=j+1;k<floor.length;k++){const i=floor[j],v=floor[k],aa=assets.get(i.assetId),b=assets.get(v.assetId);assert.ok([0,2].some(t=>aa.bounds.max[t]+i.position[t]<=b.bounds.min[t]+v.position[t]||b.bounds.max[t]+v.position[t]<=aa.bounds.min[t]+i.position[t]),i.assetId+' overlaps '+v.assetId);}
});
test('desk lifting and yaw/translation carry the terminal and lamp with persistent support contact',()=>{
 let s=structuredClone(scene);const p=s[0];act(a('desk'),p,'toggle');p.position=[4,0,-3];p.rotation=[0,Math.PI/2,0];s=resolveAttachments(s,assets);
 for(const n of [2,10]){const i=s[n],[x,z]=i.attachment.offset;near(i.position[0],4+z);near(i.position[1],1.10);near(i.position[2],-3-x);near(i.rotation[1],Math.PI/2);near(instanceBounds(assets.get(i.assetId),i).min[1],1.10);}
 assert.equal(s[11].position[1],.75);assert.deepEqual(loadScene(saveScene(s),assets),s);assert.deepEqual(scene[0].state,{high:false});
});
test('supported siblings do not collide and five declared attachments fit active support rectangles',()=>{
 const s=resolveAttachments(scene,assets);assert.equal(s.filter(i=>i.attachment).length,5);
 for(let j=0;j<s.length;j++)for(let k=j+1;k<s.length;k++)if(s[j].attachment&&s[k].attachment?.parentId===s[j].attachment.parentId){const b=[s[j],s[k]].map(i=>instanceBounds(assets.get(i.assetId),i));assert.ok([0,2].some(axis=>b[0].max[axis]<=b[1].min[axis]||b[1].max[axis]<=b[0].min[axis]),'attached siblings overlap');}
});
test('attachment rejection is atomic for unsupported scales, missing surfaces, cycles and overflow',()=>{
 for(const edit of [s=>s[2].attachment.parentId='missing',s=>s[2].attachment.surfaceId='missing',s=>s[2].attachment.offset=[4,0],s=>s[0].scale=[2,2,2],s=>s[0].rotation[0]=.1,s=>s[2].attachment.yaw=NaN,s=>s[0].attachment={parentId:s[2].id,surfaceId:'worktop',offset:[0,0],yaw:0}]){const s=structuredClone(scene);edit(s);const before=structuredClone(s);assert.throws(()=>resolveAttachments(s,assets));assert.deepEqual(s,before);}
 const map=new Map(assets),desk=structuredClone(a('desk'));desk.supportSurfaces=desk.supportSurfaces.filter(s=>!s.availableWhen.high);map.set(desk.id,desk);const s=structuredClone(scene);s[0].state.high=true;assert.throws(()=>resolveAttachments(s,map),/unavailable/);
 const duplicate=structuredClone(scene);duplicate.push(structuredClone(scene[0]));assert.throws(()=>loadScene(saveScene(duplicate),assets),/Invalid/);
});
test('nested support graphs resolve parent-first independent of serialized order',()=>{
 const fixture=structuredClone(a('meeting-table'));fixture.id='fixture';fixture.parts=[{id:'block',parent:null,position:[0,.1,0],rotation:[0,0,0],pivot:[0,0,0],rotationAxis:[0,1,0],joint:'fixed',state:{},geometry:{type:'box',size:[.2,.2,.2]},material:'wood'}];fixture.supportSurfaces=[{id:'top',height:.2,polygon:[[-.15,-.15],[.15,-.15],[.15,.15],[-.15,.15]],normal:[0,1,0]}];
 const map=new Map([[fixture.id,fixture]]),root=createInstance(fixture,'root',[2,0,3]),middle=createInstance(fixture,'middle'),leaf=createInstance(fixture,'leaf');middle.attachment={parentId:'root',surfaceId:'top',offset:[0,0],yaw:0};leaf.attachment={parentId:'middle',surfaceId:'top',offset:[0,0],yaw:0};const s=resolveAttachments([leaf,middle,root],map);assert.deepEqual(s[0].position,[2,.4,3]);assert.deepEqual(s[1].position,[2,.2,3]);
});
test('nine actions change visible geometry, reverse independently and thirty-two copies round-trip',()=>{
 assert.equal(fresh.filter(a=>a.actions.length).length,9);const s=structuredClone(scene);for(const original of scene){const aa=assets.get(original.assetId),copy=structuredClone(original);copy.id+='-copy';delete copy.attachment;copy.position[0]+=.3;if(aa.actions.length){const before=live(aa,copy.state).map(p=>p.id);act(aa,copy,'toggle');if(aa.id.startsWith('workplace-'))assert.notDeepEqual(live(aa,copy.state).map(p=>p.id),before);assert.notDeepEqual(copy.state,original.state);act(aa,copy,'toggle');assert.deepEqual(copy.state,original.state);act(aa,copy,'toggle');}s.push(copy);}assert.equal(s.length,32);assert.deepEqual(loadScene(saveScene(s),assets),s);
});
test('detach preserves world placement, and parent changes no longer affect detached children',()=>{
 let s=structuredClone(scene),old=structuredClone(s[2]);delete s[2].attachment;act(a('desk'),s[0],'toggle');s=resolveAttachments(s,assets);assert.deepEqual(s[2].position,old.position);near(s[10].position[1],1.10);
});
test('desk and task chair adjust complete upper assemblies without moving grounded bases',()=>{
 const desk=a('desk');for(const suffix of ['top','crossbar','cable-tray','control']){const lo=desk.parts.find(p=>p.id==='seated-'+suffix),hi=desk.parts.find(p=>p.id==='standing-'+suffix);near(hi.position[1]-lo.position[1],.35);assert.deepEqual(hi.geometry,lo.geometry);}
 const chair=a('task-chair');for(const suffix of ['seat','back','back-post','arm-pad-0','arm-pad-1','arm-post-0','arm-post-1']){const lo=chair.parts.find(p=>p.id==='low-'+suffix),hi=chair.parts.find(p=>p.id==='high-'+suffix);near(hi.position[1]-lo.position[1],.10);assert.deepEqual(lo.geometry,hi.geometry);}assert.equal(chair.parts.filter(p=>p.id.startsWith('spoke-')).length,5);
});
test('whiteboard flips the complete frame and marks around a fixed X axis',()=>{
 const board=a('whiteboard'),p=board.parts.find(p=>p.id==='reverse-pivot');near(p.rotation[0],Math.PI);assert.deepEqual(p.rotationAxis,[1,0,0]);for(const part of board.parts.filter(p=>p.id.startsWith('reverse-')&&p.id!=='reverse-pivot'))assert.equal(part.parent,'reverse-pivot');assert.deepEqual(board.parts.find(p=>p.id==='front-pivot').position,p.position);
});
test('locker hinge carries label and vents; flat-file slides its complete box and plan',()=>{
 const locker=a('lockers');near(locker.parts.find(p=>p.id==='open-hinge').rotation[1],-Math.PI/2);assert.equal(locker.parts.find(p=>p.id==='open-label').parent,'open-hinge');
 const flat=a('flat-file');for(const suffix of ['front','floor','rear','side-0','side-1','plan-sheet','plan-line']){const lo=flat.parts.find(p=>p.id==='in-'+suffix),hi=flat.parts.find(p=>p.id==='out-'+suffix);near(hi.position[2]-lo.position[2],.50);assert.deepEqual(lo.geometry,hi.geometry);}assert.equal(flat.parts.filter(p=>p.id.startsWith('fixed-drawer-')).length,4);
});
test('equipment operation depicts sheet processing, cup filling and computing indicators with bodies retained',()=>{
 const shred=a('shredder');assert.ok(live(shred,{shredded:false}).some(p=>p.id==='input-sheet'));assert.ok(!live(shred,{shredded:true}).some(p=>p.id==='input-sheet'));assert.equal(live(shred,{shredded:true}).filter(p=>p.id.startsWith('paper-strip-')).length,14);
 const water=a('water-dispenser');for(const key of ['cup','bottle','spout'])assert.ok(live(water,{filled:true}).some(p=>p.id===key));assert.ok(live(water,{filled:true}).some(p=>p.id==='filled-water'));assert.ok(!live(water,{filled:false}).some(p=>p.id==='water-stream'));
 const terminal=a('terminal');assert.equal(live(terminal,{on:true}).filter(p=>p.id.startsWith('key-')).length,48);assert.ok(live(terminal,{on:true}).some(p=>p.id==='screen-on'));assert.ok(live(terminal,{on:false}).some(p=>p.id==='screen-off'));assert.equal(a('tower').parts.filter(p=>p.id.startsWith('on-blade-')).length,4);
});
test('documented motion ranges refer to existing parts and boolean state keys',()=>{
 for(const aa of fresh)for(const r of aa.motionRanges){assert.equal(typeof aa.state[r.stateKey],'boolean');assert.equal(r.mode,'discrete-endpoints');assert.equal(r.values.length,2);assert.ok(r.values.every(Number.isFinite));near(Math.hypot(...r.axis),1);for(const id of r.parts)assert.ok(aa.parts.some(p=>p.id===id));}
});
