import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {instanceBounds,supportSurfaces,matches} from '../renderer/metric-state.js';
import {mesh,point,worldParts} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const scene=read('assets/bakery-interior/assembly.json');
const assets=new Map(scene.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')]));
const fresh=[...assets.values()].filter(a=>a.id.startsWith('bakery-'));
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,msg??`${a} != ${b}`);
const vertices=(a,p)=>{const m=worldParts(a).get(p.id),v=mesh(p.geometry).triangles,qs=[];for(let k=0;k<v.length;k+=3)qs.push(point(m,v.slice(k,k+3)));return qs;};
const live=(a,state)=>a.parts.filter(p=>matches(p.visibleWhen,state));
const asset=id=>assets.get('bakery-'+id);
test('ten bakery sources retain metric geometry, ground-contact origins and all-state bounds',()=>{
 assert.equal(fresh.length,10);
 for(const a of fresh){validate(a);assert.deepEqual(a.defaultScale,[1,1,1]);assert.equal(a.measurement.status,'estimated');
 const contacts=live(a,a.state).flatMap(p=>vertices(a,p)).filter(q=>Math.abs(q[1])<1e-8);
 for(const k of [0,2])near(Math.max(...contacts.map(p=>p[k]))+Math.min(...contacts.map(p=>p[k])),0,a.id+' origin');
 const i=createInstance(a,'test'),keys=Object.keys(a.state);for(let n=0;n<2**keys.length;n++){keys.forEach((k,j)=>i.state[k]=!!(n&(1<<j)));const b=instanceBounds(a,i);near(b.min[1],0);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}}
 }
});
const placements=[['object-6','object-11','worktop'],['object-14','object-12','worktop'],['object-15','object-12','worktop']];
test('slicer and reused baking tools contact and fit their fixed supports in every state',()=>{
 for(const [childId,parentId,surfaceId] of placements){const child=scene.instances.find(i=>i.id===childId),parent=scene.instances.find(i=>i.id===parentId),a=assets.get(child.assetId),s=supportSurfaces(assets.get(parent.assetId),parent).find(s=>s.id===surfaceId);
 for(const state of [a.state,Object.fromEntries(Object.entries(a.state).map(([k,v])=>[k,!v]))]){const b=instanceBounds(a,{...child,state});near(b.min[1],s.vertices[0][1],childId+' contact');for(const k of [0,2]){assert.ok(b.min[k]>=Math.min(...s.vertices.map(p=>p[k]))-1e-8,childId+' min '+k);assert.ok(b.max[k]<=Math.max(...s.vertices.map(p=>p[k]))+1e-8,childId+' max '+k);}}}
 const tools=scene.instances.slice(13).map(i=>instanceBounds(assets.get(i.assetId),i));assert.ok(tools[0].max[0]<tools[1].min[0]);
});
test('all endpoint floor envelopes have non-overlapping clearance in mixed scene',()=>{
 const floor=scene.instances.filter(i=>i.position[1]===0);for(let j=0;j<floor.length;j++)for(let k=j+1;k<floor.length;k++){const i=floor[j],v=floor[k],a=assets.get(i.assetId),b=assets.get(v.assetId);assert.ok([0,2].some(t=>a.bounds.max[t]+i.position[t]<=b.bounds.min[t]+v.position[t]||b.bounds.max[t]+v.position[t]<=a.bounds.min[t]+i.position[t]),i.assetId+' overlaps '+v.assetId);}
});
test('nine operating sources preserve independent duplicates and thirty-instance round-trip',()=>{
 assert.equal(fresh.filter(a=>a.actions.length).length,9);const instances=structuredClone(scene.instances);
 for(const original of scene.instances){const a=assets.get(original.assetId),copy=structuredClone(original);copy.id+='-copy';copy.position[0]+=.3;if(a.actions.length){act(a,copy,'toggle');assert.notDeepEqual(original.state,copy.state);}instances.push(copy);}
 assert.equal(instances.length,30);assert.deepEqual(loadScene(saveScene(instances),assets),instances);
});
test('nineteen discrete bakery poses round-trip; each action changes geometry and reverses',()=>{
 const instances=[];for(const a of fresh){const i=createInstance(a,a.id);instances.push(structuredClone(i));if(a.actions.length){const before=live(a,i.state).map(p=>p.id);act(a,i,'toggle');assert.notDeepEqual(live(a,i.state).map(p=>p.id),before);instances.push(structuredClone({...i,id:i.id+'-active'}));act(a,i,'toggle');assert.deepEqual(i.state,a.state);}}
 assert.equal(instances.length,19);assert.deepEqual(loadScene(saveScene(instances),assets),instances);
});
test('loading doors rotate at fixed hinges; dishwasher retains and translates complete rack',()=>{
 for(const id of ['deck-oven','dishwasher']){const a=asset(id),o=a.parts.find(p=>p.id==='door-open-pivot'),c=a.parts.find(p=>p.id==='door-closed-pivot');near(o.rotation[0],Math.PI/2);assert.deepEqual(o.position,c.position);assert.deepEqual(o.rotationAxis,[1,0,0]);}
 const a=asset('dishwasher');for(const suffix of ['rack-base','rack-side-0','rack-side-1',...Array.from({length:6},(_,n)=>'plate-'+n)]){const c=a.parts.find(p=>p.id==='in-'+suffix),o=a.parts.find(p=>p.id==='out-'+suffix);near(o.position[2]-c.position[2],.5);assert.deepEqual(o.geometry,c.geometry);}
 for(const id of ['freezer','ingredient-bin'])near(asset(id).parts.find(p=>p.id==='lid-open-pivot').rotation[0],-1.25);
 near(asset('proofer').parts.find(p=>p.id==='door-open-pivot').rotation[1],-Math.PI/2);
});
test('planetary beater orbits with connected shaft and open bowl rather than disappearing',()=>{
 const a=asset('mixer');assert.equal(a.parts.find(p=>p.id==='bowl').geometry.openTop,true);
 const shaft=a.parts.find(p=>p.id==='shaft');near(shaft.position[1]-shaft.geometry.height/2,.4);
 for(const key of ['arm','beater','hook']){const c=a.parts.find(p=>p.id==='rest-'+key),o=a.parts.find(p=>p.id==='mixed-'+key);assert.deepEqual(c.geometry,o.geometry);assert.equal(o.parent,'mixed-orbit');assert.equal(c.parent,'rest-orbit');}
 near(a.parts.find(p=>p.id==='mixed-orbit').rotation[1],1.2);assert.ok(live(a,{mixed:true}).some(p=>p.id==='bowl'));
});
test('sheeter transfers dough from feed to thin output with a turned roller witness mark',()=>{
 const a=asset('sheeter'),feed=a.parts.find(p=>p.id==='feed-dough'),out=a.parts.find(p=>p.id==='rolled-dough');assert.ok(feed.position[0]<0&&out.position[0]>0);assert.ok(out.geometry.size[1]<feed.geometry.size[1]);assert.ok(out.geometry.size[0]>feed.geometry.size[0]);near(a.parts.find(p=>p.id==='rolled-roller-mark').rotation[2],1);
});
test('slicer converts a whole loaf into twelve output slices while retaining the blade bank',()=>{
 const a=asset('slicer');const rest=live(a,{sliced:false}),out=live(a,{sliced:true});assert.ok(rest.some(p=>p.id==='whole-loaf'));assert.ok(!out.some(p=>p.id==='whole-loaf'));assert.equal(out.filter(p=>p.id.startsWith('slice-')).length,12);const loaf=a.parts.find(p=>p.id==='whole-loaf'),housing=a.parts.find(p=>p.id==='rear-housing');assert.ok(loaf.position[1]-loaf.geometry.size[1]/2>housing.position[1]+housing.geometry.size[1]/2);near(loaf.position[1]-loaf.geometry.size[1]/2,.615);assert.equal(out.filter(p=>p.id.startsWith('blade-')&&p.id!=='blade-guard').length,13);
});
test('manual divider moves lever, ram and platen together and divides into sixteen portions',()=>{
 const a=asset('divider'),find=id=>a.parts.find(p=>p.id===id);near(find('rest-platen').position[1]-find('pressed-platen').position[1],.20);assert.ok(find('pressed-ram').geometry.height>find('rest-ram').geometry.height);near(find('pressed-lever').rotation[0]-find('rest-lever').rotation[0],1);assert.equal(live(a,{pressed:true}).filter(p=>p.id.startsWith('portion-')).length,16);assert.equal(live(a,{pressed:false}).filter(p=>p.id==='dough-slab').length,1);
});
test('tray rack has eighteen actual narrow supporting rails, no invented solid shelf',()=>{
 const a=asset('tray-rack');assert.equal(a.actions.length,0);assert.equal(a.supportSurfaces.length,18);for(const id of ['rear-tie-0','rear-tie-1']){const tie=a.parts.find(p=>p.id===id);assert.ok(tie.geometry.size[0]>.58);}for(const s of a.supportSurfaces){near(Math.max(...s.polygon.map(q=>q[0]))-Math.min(...s.polygon.map(q=>q[0])),.035);const rail=a.parts.find(p=>p.id===s.id);near(rail.position[1]+rail.geometry.size[1]/2,s.height);}
});
