import {mesh,worldParts,mul,transform,point} from './geometry.js';
export const matches=(condition,state)=>!condition||Object.entries(condition).every(([key,value])=>state[key]===value);
export function instanceBounds(asset,instance){
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],parts=worldParts(asset);
 for(const p of asset.parts){if(!matches(p.visibleWhen,instance.state))continue;const m=mul(transform(instance.position,instance.rotation,instance.scale),parts.get(p.id)),v=mesh(p.geometry).triangles;
 for(let n=0;n<v.length;n+=3)point(m,v.slice(n,n+3)).forEach((x,k)=>{min[k]=Math.min(min[k],x);max[k]=Math.max(max[k],x);});}
 return {min,max};
}
export function supportSurfaces(asset,instance){
 const m=transform(instance.position,instance.rotation,instance.scale);
 return (asset.supportSurfaces||[]).filter(s=>matches(s.availableWhen,instance.state)).map(s=>({id:s.id,vertices:s.polygon.map(([x,z])=>point(m,[x,s.height,z]))}));
}
