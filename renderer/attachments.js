import {matches,instanceBounds} from './metric-state.js';
// Opt-in horizontal support binding. Resolve on a copy so rejected operations are atomic.
export function resolveAttachments(instances,assets){
 const result=structuredClone(instances),byId=new Map(result.map(i=>[i.id,i])),done=new Set(),visiting=new Set();
 if(byId.size!==result.length)throw Error('Duplicate attachment instance ID');
 const near=(a,b)=>Math.abs(a-b)<1e-8,unit=i=>i.scale.every(v=>near(v,1))&&near(i.rotation[0],0)&&near(i.rotation[2],0);
 const inside=(p,poly)=>{let sign=0;for(let n=0;n<poly.length;n++){const a=poly[n],b=poly[(n+1)%poly.length],cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(Math.abs(cross)<1e-8)continue;const s=Math.sign(cross);if(sign&&sign!==s)return false;sign=s;}return true;};
 function visit(i){
  if(done.has(i.id))return;if(visiting.has(i.id))throw Error('Attachment cycle');visiting.add(i.id);
  if(i.attachment&&i.mount)throw Error('Choose support or installation binding, not both');
  if(i.mount){
   const r=i.mount,p=byId.get(r.parentId);
   if(!p||p===i||typeof r.surfaceId!=='string'||typeof r.anchorId!=='string'||!Array.isArray(r.offset)||r.offset.length!==2||!r.offset.every(Number.isFinite))throw Error('Invalid installation binding');
   visit(p);if(!unit(i)||!unit(p))throw Error('Installation requires unit scale and yaw-only rotation');
   const parent=assets.get(p.assetId),a=assets.get(i.assetId);
   if(!parent?.parts||!a?.parts)throw Error('Installation requires metric geometry');
   const surfaces=(parent.installationSurfaces||[]).filter(s=>s.id===r.surfaceId&&matches(s.availableWhen,p.state));
   const anchors=(a.mountAnchors||[]).filter(s=>s.id===r.anchorId&&matches(s.availableWhen,i.state));
   if(surfaces.length!==1||anchors.length!==1)throw Error('Installation surface or anchor unavailable or ambiguous');
   const surface=surfaces[0],anchor=anchors[0];
   if(surface.kind!==anchor.kind||!['wall','soffit'].includes(surface.kind))throw Error('Installation plane kind mismatch');
   const normal=surface.kind==='wall'?[0,0,1]:[0,-1,0];
   if(!normal.every((v,k)=>surface.normal?.[k]===v&&anchor.normal?.[k]===-v))throw Error('Installation normals must oppose');
   for(const q of anchor.polygon)if(!inside([q[0]+r.offset[0],q[1]+r.offset[1]],surface.polygon))throw Error('Installation anchor exceeds surface');
   const target=surface.kind==='wall'?[surface.position[0]+r.offset[0],surface.position[1]+r.offset[1],surface.position[2]]:[surface.position[0]+r.offset[0],surface.position[1],surface.position[2]+r.offset[1]];
   const local=target.map((v,k)=>v-anchor.position[k]),bounds=instanceBounds(a,{...i,position:local,rotation:[0,0,0]});
   if(surface.kind==='wall'&&bounds.min[2]<surface.position[2]-1e-8||surface.kind==='soffit'&&bounds.max[1]>surface.position[1]+1e-8)throw Error('Installed geometry crosses mounting plane');
   const c=Math.cos(p.rotation[1]),t=Math.sin(p.rotation[1]),round=v=>Math.round(v*1e12)/1e12;
   i.position=[p.position[0]+c*local[0]+t*local[2],p.position[1]+local[1],p.position[2]-t*local[0]+c*local[2]].map(round);
   i.rotation=[0,p.rotation[1],0];
  }
  if(i.attachment){
   const r=i.attachment,p=byId.get(r.parentId);
   if(!p||p===i||typeof r.surfaceId!=='string'||!Array.isArray(r.offset)||r.offset.length!==2||!r.offset.every(Number.isFinite)||!Number.isFinite(r.yaw))throw Error('Invalid support attachment');
   visit(p);if(!unit(i)||!unit(p))throw Error('Attachments require unit scale and yaw-only rotation');
   const parent=assets.get(p.assetId),a=assets.get(i.assetId);
   if(!parent||!parent.parts||!a||!a.parts)throw Error('Attachments require metric geometry');
   const surfaces=(parent.supportSurfaces||[]).filter(s=>s.id===r.surfaceId&&matches(s.availableWhen,p.state));
   if(surfaces.length!==1)throw Error('Attached support unavailable or ambiguous');
   const s=surfaces[0],local={...i,position:[r.offset[0],0,r.offset[1]],rotation:[0,r.yaw,0]},bounds=instanceBounds(a,local);
   if(!near(bounds.min[1],0))throw Error('Attached child must have a bottom contact at zero');
   for(const x of [bounds.min[0],bounds.max[0]])for(const z of [bounds.min[2],bounds.max[2]])if(!inside([x,z],s.polygon))throw Error('Attached child exceeds support');
   const c=Math.cos(p.rotation[1]),t=Math.sin(p.rotation[1]),[x,z]=r.offset;
   const round=v=>Math.round(v*1e12)/1e12;
   i.position=[p.position[0]+c*x+t*z,p.position[1]+s.height,p.position[2]-t*x+c*z].map(round);
   i.rotation=[0,round(p.rotation[1]+r.yaw),0];
  }
  visiting.delete(i.id);done.add(i.id);
 }
 for(const i of result)visit(i);return result;
}
