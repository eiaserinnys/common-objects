import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {mesh,point,worldParts} from '../renderer/geometry.js';
import {validateProcedural} from './validate-svg.mjs';
const vector=(v,n=3)=>Array.isArray(v)&&v.length===n&&v.every(Number.isFinite);
export function validate(a){
 assert.equal(a.schemaVersion,1);assert.match(a.id,/^[a-z][a-z0-9-]*$/);assert.ok(Number.isInteger(a.version)&&a.version>0);
 assert.equal(a.units,'m');assert.equal(a.upAxis,'Y');assert.equal(a.origin,'ground-contact-center');assert.deepEqual(a.defaultScale,[1,1,1]);
 assert.ok(vector(a.dimensions)&&a.dimensions.every(v=>v>0));assert.ok(vector(a.bounds.min)&&vector(a.bounds.max));assert.equal(a.bounds.min[1],0);
 for(let k=0;k<3;k++)assert.ok(Math.abs(a.bounds.max[k]-a.bounds.min[k]-a.dimensions[k])<1e-8);
 assert.ok(a.measurement.status&&a.measurement.note&&a.provenance.license);assert.ok(a.parts.length>0);
 assert.ok(a.footprint.length>=3&&a.footprint.every(v=>vector(v,2)));
 const ids=new Set();for(const p of a.parts){assert.ok(!ids.has(p.id));ids.add(p.id);assert.ok(p.id&&a.materials[p.material]);for(const k of ['position','rotation','pivot','rotationAxis'])assert.ok(vector(p[k]));assert.ok(Math.abs(Math.hypot(...p.rotationAxis)-1)<1e-8);assert.equal(p.joint,'fixed');assert.ok(p.state&&typeof p.state==='object');
 const g=p.geometry;if(g.type==='box')assert.ok(vector(g.size)&&g.size.every(v=>v>0));else{assert.equal(g.type,'cylinder');assert.ok(g.radiusBottom>0&&g.radiusTop>0&&g.height>0);assert.ok(Number.isInteger(g.segments)&&g.segments>=8&&g.segments<=128&&g.segments%4===0);}}
 for(const p of a.parts){const seen=new Set([p.id]);let parent=p.parent;while(parent!==null){assert.ok(ids.has(parent)&&!seen.has(parent),'Invalid parent/cycle');seen.add(parent);parent=a.parts.find(q=>q.id===parent).parent;}}
 for(const m of Object.values(a.materials)){assert.ok(vector(m.color)&&m.color.every(v=>v>=0&&v<=1));if(m.emissionWhenOn!==undefined)assert.ok(Number.isFinite(m.emissionWhenOn)&&m.emissionWhenOn>=0&&m.emissionWhenOn<=1);}
 assert.ok(a.state&&typeof a.state==='object');const actions=new Set();for(const action of a.actions){assert.ok(!actions.has(action.id));actions.add(action.id);if(action.type==='toggle')assert.equal(typeof a.state[action.stateKey],'boolean');else if(action.type==='transition'){assert.ok(action.set&&Object.keys(action.set).length);}else {assert.ok(['dehumidify','empty-tank'].includes(action.type));const m=a.simulation;assert.ok(m&&[m.targetHumidity,m.humidityDropPerCycle,m.waterPerCycleMl,m.tankCapacityMl].every(Number.isFinite));assert.ok(m.targetHumidity>=0&&m.targetHumidity<=100&&m.humidityDropPerCycle>0&&m.waterPerCycleMl>0&&m.tankCapacityMl>0);assert.ok(Number.isFinite(a.state.humidity)&&Number.isFinite(a.state.waterMl));assert.equal(typeof a.state.wet,'boolean');assert.equal(typeof a.state.full,'boolean');}}
 const condition=c=>{assert.ok(c&&typeof c==='object');for(const [k,v] of Object.entries(c)){assert.equal(typeof a.state[k],'boolean');assert.equal(typeof v,'boolean');}};
 for(const action of a.actions){if(action.requires)condition(action.requires);if(action.type==='transition')condition(action.set);}
 for(const rule of a.stateRules||[]){condition(rule.when);condition(rule.must);assert.ok(Object.keys(rule.when).length&&Object.keys(rule.must).length);if(Object.entries(rule.when).every(([k,v])=>a.state[k]===v))assert.ok(Object.entries(rule.must).every(([k,v])=>a.state[k]===v),'Invalid default operating state');}
 if(a.placementLockWhen)condition(a.placementLockWhen);
 for(const p of a.parts)if(p.visibleWhen)condition(p.visibleWhen);
 for(const s of a.supportSurfaces||[]){assert.ok(s.id&&Number.isFinite(s.height)&&s.height>=0&&s.height<=a.bounds.max[1]);assert.deepEqual(s.normal,[0,1,0]);assert.ok(s.polygon.length>=3&&s.polygon.every(v=>vector(v,2)));if(s.availableWhen)condition(s.availableWhen);}
 const mountKinds=['wall','soffit'];
 const polygon=p=>{assert.ok(Array.isArray(p)&&p.length>=3&&p.every(v=>vector(v,2)));let sum=0,sign=0;for(let n=0;n<p.length;n++){const q=p[n],r=p[(n+1)%p.length],s=p[(n+2)%p.length];sum+=q[0]*r[1]-r[0]*q[1];const cross=(r[0]-q[0])*(s[1]-r[1])-(r[1]-q[1])*(s[0]-r[0]);if(Math.abs(cross)>1e-10){if(sign)assert.equal(Math.sign(cross),sign,'Mount region must be convex');sign=Math.sign(cross);}}assert.ok(Math.abs(sum)>1e-10,'Mount region must have area');};
 for(const key of ['installationSurfaces','mountAnchors']){const ids=new Set();for(const s of a[key]||[]){assert.ok(s.id&&!ids.has(s.id));ids.add(s.id);assert.ok(mountKinds.includes(s.kind)&&vector(s.position));polygon(s.polygon);const normal=s.kind==='wall'?[0,0,1]:[0,-1,0];assert.deepEqual(s.normal,key==='installationSurfaces'?normal:normal.map(v=>v===0?0:-v));if(s.availableWhen)condition(s.availableWhen);}}
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of a.parts){const vertices=mesh(p.geometry).triangles;for(let n=0;n<vertices.length;n+=3){const v=point(matrices.get(p.id),vertices.slice(n,n+3));for(let k=0;k<3;k++){min[k]=Math.min(min[k],v[k]);max[k]=Math.max(max[k],v[k]);}}}
 for(let k=0;k<3;k++){assert.ok(Math.abs(min[k]-a.bounds.min[k])<1e-7,'Geometry minimum mismatch');assert.ok(Math.abs(max[k]-a.bounds.max[k])<1e-7,'Geometry maximum mismatch');}
 // v1 footprints are conservative axis-aligned clearance rectangles.
 assert.deepEqual(a.footprint,[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(v=>v.map(n=>Math.round(n*1e9)/1e9)));
 return {id:a.id,parts:a.parts.length,min,max};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const catalog=JSON.parse(await readFile(new URL('../assets/catalog.json',import.meta.url))),assets=new Map();
 for(const path of catalog.assets){
  assert.ok(!path.includes('..')&&path.endsWith('/asset.json'));
  const a=JSON.parse(await readFile(new URL('../assets/'+path,import.meta.url)));
  assert.ok(!assets.has(a.id));assets.set(a.id,a);
 }
 for(const a of assets.values()){
  if(a.format==='procedural-svg')console.log(await validateProcedural(a,assets));
  else {assert.ok(a.format===undefined||a.format==='metric-svg');console.log(validate(a));}
 }
}
