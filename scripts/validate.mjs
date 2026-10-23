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
 assert.ok(a.state&&typeof a.state==='object');const actions=new Set();for(const action of a.actions){assert.ok(!actions.has(action.id));actions.add(action.id);assert.equal(action.type,'toggle');assert.equal(typeof a.state[action.stateKey],'boolean');}
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
