import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from '../scripts/validate.mjs';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
import {instanceBounds,supportSurfaces,matches} from '../renderer/metric-state.js';
import {mesh,point,worldParts} from '../renderer/geometry.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const scene=read('assets/office-document-station/assembly.json');
const assets=new Map(scene.instances.map(i=>[i.assetId,read('assets/'+i.assetId+'/asset.json')]));
const fresh=[...assets.values()].filter(a=>a.id.startsWith('office-'));
test('office assets reserve all poses, share scale and have centered ground contact',()=>{
 assert.equal(fresh.length,5);
 for(const a of fresh){validate(a);const matrices=worldParts(a);const contacts=[];
 for(const p of a.parts){if(!matches(p.visibleWhen,a.state))continue;const vertices=mesh(p.geometry).triangles;for(let n=0;n<vertices.length;n+=3){const q=point(matrices.get(p.id),vertices.slice(n,n+3));if(Math.abs(q[1])<1e-8)contacts.push(q);}}
 for(const axis of [0,2])assert.ok(Math.abs(Math.max(...contacts.map(p=>p[axis]))+Math.min(...contacts.map(p=>p[axis])))<1e-8);
 const i=createInstance(a,'test');for(let n=0;n<2;n++){const b=instanceBounds(a,i);assert.ok(Math.abs(b.min[1])<1e-8);for(let k=0;k<3;k++){assert.ok(b.min[k]>=a.bounds.min[k]-1e-8);assert.ok(b.max[k]<=a.bounds.max[k]+1e-8);}if(a.actions.length)act(a,i,'toggle');}
 }
});
test('drawer is retained and translated; printer transfers one sheet and adds ink',()=>{
 const a=assets.get('office-credenza');for(const closed of a.parts.filter(p=>p.id.startsWith('closed-'))){const open=a.parts.find(p=>p.id===closed.id.replace('closed-','open-'));assert.deepEqual(open.geometry,closed.geometry);assert.ok(Math.abs(open.position[2]-closed.position[2]-.28)<1e-8);}
 const p=assets.get('office-printer');for(const printed of [false,true]){const active=p.parts.filter(q=>matches(q.visibleWhen,{printed}));assert.equal(active.filter(q=>q.id.endsWith('-sheet')).length,1);assert.equal(active.filter(q=>q.id.startsWith('printed-line')).length,printed?7:0);}
});
test('mixed scene has supported contact, inset containment and no furniture overlap',()=>{
 for(const [childId,parentId,surfaceId] of [['object-2','object-1','top'],['object-6','object-5','worktop'],['object-7','object-5','worktop'],['object-8','object-5','worktop'],['object-9','object-3','upper-tray'],['object-10','object-5','worktop']]){
 const child=scene.instances.find(i=>i.id===childId),parent=scene.instances.find(i=>i.id===parentId),b=instanceBounds(assets.get(child.assetId),child),s=supportSurfaces(assets.get(parent.assetId),parent).find(s=>s.id===surfaceId);
 assert.ok(Math.abs(b.min[1]-s.vertices[0][1])<1e-8,childId+' support height');
 for(const k of [0,2]){assert.ok(b.min[k]>=Math.min(...s.vertices.map(p=>p[k]))-1e-8,childId+' min containment');assert.ok(b.max[k]<=Math.max(...s.vertices.map(p=>p[k]))+1e-8,childId+' max containment');}
 }
 const anchors=scene.instances.filter(i=>[1,3,4,5].includes(Number(i.id.split('-')[1])));
 for(let j=0;j<anchors.length;j++)for(let k=j+1;k<anchors.length;k++){const bounds=anchors.slice(0,0);for(const i of [anchors[j],anchors[k]]){const a=assets.get(i.assetId);bounds.push({min:a.bounds.min.map((v,k)=>v+i.position[k]),max:a.bounds.max.map((v,k)=>v+i.position[k])});}assert.ok([0,2].some(k=>bounds[0].max[k]<=bounds[1].min[k]||bounds[1].max[k]<=bounds[0].min[k]));}
});
test('independent drawer and paper states persist with mixed-size scene',()=>{
 const instances=structuredClone(scene.instances);
 for(const original of instances.slice(0,2)){const a=assets.get(original.assetId),copy=createInstance(a,original.id+'-copy');act(a,copy,'toggle');assert.notDeepEqual(original.state,copy.state);instances.push(copy);}
 assert.deepEqual(loadScene(saveScene(instances),assets),instances);
 assert.equal(fresh.filter(a=>a.actions.length===0).length,3);
});
