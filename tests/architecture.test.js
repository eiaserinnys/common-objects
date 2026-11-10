import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';import {loadScene,saveScene,createInstance,act} from '../renderer/model.js';import {resolveAttachments} from '../renderer/attachments.js';import {instanceBounds,matches} from '../renderer/metric-state.js';import {mesh,worldParts,mul,transform,point} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url))),raw=read('assets/architecture-interior/assembly.json'),assets=new Map(raw.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')])),scene=loadScene(JSON.stringify(raw),assets),fresh=[...assets.values()].filter(a=>a.id.startsWith('architecture-')),a=id=>assets.get('architecture-'+id),near=(x,y,msg)=>assert.ok(Math.abs(x-y)<1e-8,msg||`${x} != ${y}`);
function partBounds(asset,i){const matrices=worldParts(asset),root=transform(i.position,i.rotation,i.scale);return asset.parts.filter(p=>matches(p.visibleWhen,i.state)).map(p=>{const m=mul(root,matrices.get(p.id)),v=mesh(p.geometry).triangles,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],points=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));points.push(q);q.forEach((x,j)=>{min[j]=Math.min(x,min[j]);max[j]=Math.max(x,max[j]);});}return {id:p.id,min,max,points};});}
const overlap=(a,b)=>[0,1,2].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-7);
test('ten metric architecture sources retain contact-centered rest origins and seventeen finite poses',()=>{
 assert.equal(fresh.length,10);let count=0;for(const a of fresh){validate(a);assert.deepEqual(a.defaultScale,[1,1,1]);const i=createInstance(a,a.id),contact=partBounds(a,i).flatMap(p=>p.points).filter(q=>Math.abs(q[1])<1e-8);for(const k of [0,2])near(Math.max(...contact.map(q=>q[k]))+Math.min(...contact.map(q=>q[k])),0,a.id+' rest-contact');for(let n=0;n<(a.actions.length?2:1);n++){if(n)act(a,i,'toggle');const b=instanceBounds(a,i);assert.ok(b.min[1]>=-1e-8);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}count++;}}assert.equal(count,17);
});
test('six mounted fixtures touch opposite-facing wall/soffit planes with contained contact envelopes',()=>{
 const s=resolveAttachments(scene,assets);assert.equal(s.filter(i=>i.mount).length,6);for(const i of s.filter(i=>i.mount)){const r=i.mount,parent=s.find(p=>p.id===r.parentId),surface=assets.get(parent.assetId).installationSurfaces.find(q=>q.id===r.surfaceId),anchor=assets.get(i.assetId).mountAnchors.find(q=>q.id===r.anchorId);assert.deepEqual(surface.normal,anchor.normal.map(v=>v===0?0:-v));const m=transform(i.position,i.rotation,i.scale),anchorWorld=point(m,anchor.position),target=surface.kind==='wall'?[surface.position[0]+r.offset[0],surface.position[1]+r.offset[1],surface.position[2]]:[surface.position[0]+r.offset[0],surface.position[1],surface.position[2]+r.offset[1]],world=point(transform(parent.position,parent.rotation,parent.scale),target);world.forEach((v,k)=>near(anchorWorld[k],v));}
});
test('moving and rotating a wall carries mounted shelf plus supported teapot through a mixed graph',()=>{
 let s=structuredClone(scene);s[0].position=[2,.1,3];s[0].rotation=[0,Math.PI/2,0];s=resolveAttachments(s,assets);for(const n of [4,5,7,14]){near(s[n].rotation[1],Math.PI/2);assert.notDeepEqual(s[n].position,scene[n].position);}const shelf=s[4],pot=s[14];near(pot.position[1],shelf.position[1]+.3);near(instanceBounds(assets.get(pot.assetId),pot).min[1],shelf.position[1]+.3);assert.deepEqual(loadScene(saveScene(s),assets),s);
});
test('pendant follows overhead translation and remains below its soffit',()=>{
 let s=structuredClone(scene);s[3].position=[.4,.3,.2];s[3].rotation=[0,.7,0];s=resolveAttachments(s,assets);near(s[6].position[1],.3+2.4-.885);near(instanceBounds(a('pendant'),s[6]).max[1],2.7);near(s[6].rotation[1],.7);
});
test('installation rejects missing anchors, reversed planes, kind mismatch, overflow and mixed cycles atomically',()=>{
 for(const edit of [s=>s[4].mount.parentId='missing',s=>s[4].mount.anchorId='missing',s=>s[4].mount.offset=[4,0],s=>s[4].attachment={parentId:'object-1',surfaceId:'x',offset:[0,0],yaw:0},s=>s[0].rotation[0]=.2,s=>s[0].scale=[2,2,2],s=>s[0].mount={parentId:'object-15',surfaceId:'front',anchorId:'x',offset:[0,0]}]){const s=structuredClone(scene);edit(s);const prior=structuredClone(s);assert.throws(()=>resolveAttachments(s,assets));assert.deepEqual(s,prior);}
 for(const edit of [x=>x.mountAnchors[0].kind='soffit',x=>x.mountAnchors[0].normal=[0,0,1],x=>x.mountAnchors[0].position[2]+=.1]){const map=new Map(assets),shelf=structuredClone(a('shelf'));edit(shelf);map.set(shelf.id,shelf);assert.throws(()=>resolveAttachments(scene,map));}
 const map=new Map(assets),wall=structuredClone(a('wall'));wall.installationSurfaces=[];map.set(wall.id,wall);assert.throws(()=>resolveAttachments(scene,map),/unavailable/);
});
test('schema rejects degenerate mount regions, duplicate IDs and wrong normals',()=>{
 for(const edit of [x=>x.installationSurfaces[0].polygon=[[0,0],[0,0],[0,0]],x=>x.installationSurfaces.push(structuredClone(x.installationSurfaces[0])),x=>x.installationSurfaces[0].normal=[0,0,-1]]){const wall=structuredClone(a('wall'));edit(wall);assert.throws(()=>validate(wall));}
});
test('all cross-source endpoint geometry clears except a bounded intentional rear/side wall lap joint',()=>{
 const states=i=>{const aa=assets.get(i.assetId);return aa.actions.length?[i.state,Object.fromEntries(Object.entries(i.state).map(([k,v])=>[k,!v]))]:[i.state];};
 for(let j=0;j<scene.length;j++)for(let k=j+1;k<scene.length;k++)for(const sj of states(scene[j]))for(const sk of states(scene[k])){const proposed=structuredClone(scene);proposed[j].state=sj;proposed[k].state=sk;const resolved=resolveAttachments(proposed,assets),va=partBounds(assets.get(resolved[j].assetId),resolved[j]),vb=partBounds(assets.get(resolved[k].assetId),resolved[k]);for(const p of va)for(const q of vb)if(overlap(p,q)){assert.ok(j===0&&k===2,`${scene[j].id}/${p.id} intersects ${scene[k].id}/${q.id}`);assert.ok(Math.min(p.max[0],q.max[0])-Math.max(p.min[0],q.min[0])<=.061);assert.ok(Math.min(p.max[2],q.max[2])-Math.max(p.min[2],q.min[2])<=.068);}}

});
test('door and sliding window preserve full panel motion and genuine openings',()=>{
 const door=a('doorway'),open=door.parts.find(p=>p.id==='open-hinge');near(open.rotation[1],-Math.PI/2);for(const part of ['leaf','inset','lever'])assert.equal(door.parts.find(p=>p.id==='open-'+part).parent,'open-hinge');
 const window=a('window');for(const suffix of ['glass','vertical-0','vertical-1','horizontal-0','horizontal-1','pull']){const c=window.parts.find(p=>p.id==='closed-'+suffix),o=window.parts.find(p=>p.id==='slid-'+suffix);near(o.position[0]-c.position[0],.8);assert.deepEqual(c.geometry,o.geometry);}
 const closed=partBounds(window,createInstance(window,'w')),i=createInstance(window,'w');act(window,i,'toggle');const opened=partBounds(window,i),probe=[-.4,1.4,.025];assert.ok(closed.some(b=>probe.every((v,k)=>v>=b.min[k]&&v<=b.max[k])));assert.ok(!opened.some(b=>probe.every((v,k)=>v>=b.min[k]&&v<=b.max[k])));
});
test('blind retracts while anchor remains fixed and rocker/valve rotate rather than detach',()=>{
 const b=a('blind'),low=b.parts.find(p=>p.id==='lowered-bottom-bar'),high=b.parts.find(p=>p.id==='raised-bottom-bar');near(high.position[1]-low.position[1],1.14);assert.ok(b.parts.find(p=>p.id==='raised-cloth').geometry.size[1]<b.parts.find(p=>p.id==='lowered-cloth').geometry.size[1]);const i=createInstance(b,'b');act(b,i,'toggle');near(instanceBounds(b,i).min[1],1.14);
 near(a('switch').parts.find(p=>p.id==='on-rocker').rotation[0]-.16,0);near(a('radiator').parts.find(p=>p.id==='high-mark').rotation[0],1.2);
});
test('seven independent fixture actions and thirty detached-copy placements round-trip exactly',()=>{
 assert.equal(fresh.filter(a=>a.actions.length).length,7);const s=structuredClone(scene);for(const original of scene){const aa=assets.get(original.assetId),copy=structuredClone(original);copy.id+='-copy';delete copy.mount;delete copy.attachment;copy.position[0]+=.3;if(aa.actions.length){act(aa,copy,'toggle');assert.notDeepEqual(copy.state,original.state);act(aa,copy,'toggle');assert.deepEqual(copy.state,original.state);act(aa,copy,'toggle');}s.push(copy);}assert.equal(s.length,30);assert.deepEqual(loadScene(saveScene(s),assets),s);
});
test('prior desk attachment still follows raised worktop inside the architectural composition',()=>{
 let s=structuredClone(scene);act(assets.get('workplace-desk'),s[10],'toggle');s=resolveAttachments(s,assets);for(const n of [12,13])near(s[n].position[1],1.10);near(s[14].position[1],1.465);
});
test('detaching mounted shelf preserves pose and its supported contents follow later shelf edits',()=>{
 let s=structuredClone(scene);const pos=[...s[4].position];delete s[4].mount;s[0].position[0]+=1;s=resolveAttachments(s,assets);assert.deepEqual(s[4].position,pos);s[4].position[0]+=.2;s=resolveAttachments(s,assets);near(s[14].position[0],scene[14].position[0]+.2);
});
test('every declared installation region sits on actual host geometry with the required face direction',()=>{
 for(const aa of fresh){const boxes=partBounds(aa,createInstance(aa,aa.id));for(const s of aa.installationSurfaces){for(const uv of [...s.polygon,[0,0]]){const q=s.kind==='wall'?[s.position[0]+uv[0],s.position[1]+uv[1],s.position[2]]:[s.position[0]+uv[0],s.position[1],s.position[2]+uv[1]];assert.ok(boxes.some(b=>{const axis=s.kind==='wall'?2:1,edge=s.kind==='wall'?b.max[axis]:b.min[axis];return Math.abs(q[axis]-edge)<1e-8&&[0,1,2].every(k=>q[k]>=b.min[k]-1e-8&&q[k]<=b.max[k]+1e-8);}),aa.id+' virtual mounting plane');}}}
});
