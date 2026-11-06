import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {instanceBounds,supportSurfaces,matches} from '../renderer/metric-state.js';
import {mesh,point,worldParts} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const scene=read('assets/sanitary-interior/assembly.json');
const assets=new Map(scene.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')]));
const fresh=[...assets.values()].filter(a=>a.id.startsWith('sanitary-'));
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,msg??`${a} != ${b}`);
const vertices=(a,p)=>{const m=worldParts(a).get(p.id),v=mesh(p.geometry).triangles,qs=[];for(let k=0;k<v.length;k+=3)qs.push(point(m,v.slice(k,k+3)));return qs;};
const live=(a,state)=>a.parts.filter(p=>matches(p.visibleWhen,state));
test('ten sanitary sources: metric bounds, defaults, ground contact, all operating states',()=>{
 assert.equal(fresh.length,10);
 for(const a of fresh){validate(a);assert.deepEqual(a.defaultScale,[1,1,1]);
 const contacts=live(a,a.state).flatMap(p=>vertices(a,p)).filter(q=>Math.abs(q[1])<1e-8);
 for(const k of [0,2])near(Math.max(...contacts.map(p=>p[k]))+Math.min(...contacts.map(p=>p[k])),0,a.id+' origin');
 const i=createInstance(a,'test'),keys=Object.keys(a.state);for(let n=0;n<2**keys.length;n++){keys.forEach((k,j)=>i.state[k]=!!(n&(1<<j)));const b=instanceBounds(a,i);near(b.min[1],0);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}}
 }
});
const placements=[['object-11','object-2','left-counter'],['object-12','object-2','left-counter'],['object-13','object-2','right-counter'],['object-14','object-6','top']];
test('Reused hygiene props contact and fit supported surfaces; all endpoint envelopes clear',()=>{
 for(const [childId,parentId,surfaceId] of placements){const child=scene.instances.find(i=>i.id===childId),parent=scene.instances.find(i=>i.id===parentId),b=instanceBounds(assets.get(child.assetId),child),s=supportSurfaces(assets.get(parent.assetId),parent).find(s=>s.id===surfaceId);
 near(b.min[1],s.vertices[0][1],childId+' contact');for(const k of [0,2]){assert.ok(b.min[k]>=Math.min(...s.vertices.map(p=>p[k]))-1e-8,childId+' min');assert.ok(b.max[k]<=Math.max(...s.vertices.map(p=>p[k]))+1e-8,childId+' max');}}
 const ground=scene.instances.filter(i=>i.position[1]===0);
 const envelopes=ground.map(i=>{const a=assets.get(i.assetId),q=structuredClone(i),states=[instanceBounds(a,q)];if(a.actions.length){act(a,q,'toggle');states.push(instanceBounds(a,q));}return {min:[0,1,2].map(k=>Math.min(...states.map(b=>b.min[k]))),max:[0,1,2].map(k=>Math.max(...states.map(b=>b.max[k])))};});
 for(let j=0;j<ground.length;j++)for(let k=j+1;k<ground.length;k++)assert.ok([0,2].some(axis=>envelopes[j].max[axis]<=envelopes[k].min[axis]||envelopes[k].max[axis]<=envelopes[j].min[axis]),ground[j].assetId+' overlaps '+ground[k].assetId);
 for(let j=0;j<placements.length;j++)for(let k=j+1;k<placements.length;k++)if(placements[j][1]===placements[k][1]){const b=[placements[j][0],placements[k][0]].map(id=>{const i=scene.instances.find(i=>i.id===id);return instanceBounds(assets.get(i.assetId),i);});assert.ok([0,2].some(k=>b[0].max[k]<=b[1].min[k]||b[1].max[k]<=b[0].min[k]));}
});
test('eight operating sanitary assets keep independent state and round-trip all placements',()=>{
 assert.equal(fresh.filter(a=>a.actions.length).length,8);
 const instances=structuredClone(scene.instances);
 for(const a of assets.values()){const original=instances.find(i=>i.assetId===a.id),copy=structuredClone(original);copy.id+='-copy';copy.position[0]+=.3;if(a.actions.length){act(a,copy,'toggle');assert.notDeepEqual(original.state,copy.state);}instances.push(copy);}
 assert.equal(instances.length,28);assert.deepEqual(loadScene(saveScene(instances),assets),instances);
});
test('every operation changes live geometry; actions and duplicate states are independent',()=>{
 for(const a of fresh){const i=createInstance(a,'source'),copy=createInstance(a,'copy');
 for(const action of a.actions){const before=live(a,copy.state).map(p=>p.id),prior=structuredClone(copy.state);act(a,copy,action.id);assert.notDeepEqual(live(a,copy.state).map(p=>p.id),before,a.id+' '+action.id);for(const k of Object.keys(prior))assert.equal(copy.state[k],k===action.stateKey?!prior[k]:prior[k]);assert.deepEqual(i.state,a.state);act(a,copy,action.id);assert.deepEqual(copy.state,prior);}
 }
});
test('doors retain their geometry while rotating on stable axes; drawer and shower travel uncover access',()=>{
 for(const id of ['toilet','mirror-cabinet']){const a=assets.get('sanitary-'+id),c=a.parts.find(p=>p.id==='closed-hinge'),o=a.parts.find(p=>p.id==='open-hinge');assert.deepEqual(c.position,o.position);near(o.rotation[id==='toilet'?0:1],-Math.PI/2);assert.deepEqual(c.rotationAxis,o.rotationAxis);}
 const a=assets.get('sanitary-vanity');near(a.parts.find(p=>p.id==='out-drawer-front').position[2]-a.parts.find(p=>p.id==='in-drawer-front').position[2],.30);
 const b=assets.get('sanitary-shower');near(b.parts.find(p=>p.id==='closed-panel').position[0]-b.parts.find(p=>p.id==='open-panel').position[0],.48);
});
test('water endpoints lie inside real open cavities and jets meet bowl or tray rather than replacing housing',()=>{
 for(const [id,water,floor] of [['bathtub','filled-water','bath-floor'],['toilet','water-flush','bowl-floor']]){
 const a=assets.get('sanitary-'+id),p=a.parts.find(p=>p.id===water),f=a.parts.find(p=>p.id===floor);assert.ok(p.position[1]>f.position[1]);for(const k of [0,2])assert.ok(p.geometry.size[k]<f.geometry.size[k]);assert.ok(!f.visibleWhen);
 }
 const shower=assets.get('sanitary-shower');assert.equal(shower.parts.filter(p=>p.id.startsWith('jet-')).length,5);assert.ok(shower.parts.filter(p=>p.id.startsWith('jet-')).every(p=>p.visibleWhen.flow===true));
 for(const id of ['towel-warmer','hand-dryer']){const a=assets.get('sanitary-'+id);assert.ok(a.parts.some(p=>p.id.includes('indicator')&&p.visibleWhen?.on));assert.match(a.interactionNote,/simulation|physics|measured/);}
});
test('all boolean state combinations round-trip, keep contact and draw water down to the receiving surface',()=>{
 const instances=[];
 for(const a of fresh){const keys=Object.keys(a.state);for(let mask=0;mask<2**keys.length;mask++){const i=createInstance(a,a.id+'-'+mask,[mask*.2,0,0]);keys.forEach((k,n)=>i.state[k]=!!(mask&(1<<n)));instances.push(i);near(instanceBounds(a,i).min[1],0);}}
 assert.equal(instances.length,24);assert.deepEqual(loadScene(saveScene(instances),assets),instances);
 for(const [id,part,floor,maxBottom] of [['vanity','tap-stream','basin-floor',.76],['bidet','bidet-tap-stream','wash-bowl-floor',.32],['bathtub','bath-tap-stream','bath-floor',.40]]){
 const a=assets.get('sanitary-'+id),p=a.parts.find(p=>p.id===part),f=a.parts.find(p=>p.id===floor),bottom=p.position[1]-p.geometry.height/2;assert.ok(bottom>=f.position[1]+f.geometry.size[1]/2);assert.ok(bottom<=maxBottom+1e-8);
 }
 const a=assets.get('sanitary-shower'),p=a.parts.find(p=>p.id==='jet-0');near(p.position[1]-p.geometry.height/2,.07);
});
