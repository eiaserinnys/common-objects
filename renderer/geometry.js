// Metric, Y-up geometry. No camera-dependent normalization.
export function mesh(g) {
  const triangles=[], lines=[];
  const tri=(a,b,c)=>triangles.push(...a,...b,...c);
  const edge=(a,b)=>lines.push(...a,...b);
  if(g.type==='box'){
    const [x,y,z]=g.size.map(v=>v/2), p=[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]];
    for(const [a,b,c,d] of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]]) {tri(p[a],p[b],p[c]);tri(p[a],p[c],p[d]);}
    for(const [a,b] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])edge(p[a],p[b]);
  } else if(g.type==='cylinder') {
    const n=g.segments,h=g.height/2;
    const p=(i,r,y)=>[Math.cos(i*2*Math.PI/n)*r,y,Math.sin(i*2*Math.PI/n)*r];
    for(let i=0;i<n;i++){
      const a=p(i,g.radiusBottom,-h),b=p(i+1,g.radiusBottom,-h),c=p(i+1,g.radiusTop,h),d=p(i,g.radiusTop,h);
      tri(a,c,b);tri(a,d,c);tri([0,h,0],c,d);
      if(!g.openBottom)tri([0,-h,0],a,b);
      edge(a,b);edge(c,d);if(i%(n/4)===0)edge(a,d);
    }
  } else throw Error('Unsupported geometry');
  return {triangles,lines};
}
export const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function mul(a,b){const o=Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
export function transform(position=[0,0,0], rotation=[0,0,0], scale=[1,1,1]){
 const [x,y,z]=rotation,[sx,cx,sy,cy,sz,cz]=[Math.sin(x),Math.cos(x),Math.sin(y),Math.cos(y),Math.sin(z),Math.cos(z)];
 const rx=[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1], ry=[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1],rz=[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1];
 const t=identity(); t[12]=position[0];t[13]=position[1];t[14]=position[2];
 const s=identity();s[0]=scale[0];s[5]=scale[1];s[10]=scale[2];return mul(t,mul(rz,mul(ry,mul(rx,s))));
}
export function point(m,p){return [0,1,2].map(r=>m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]);}
export function partMatrix(part){return mul(transform(part.position),mul(transform(part.pivot),mul(transform([0,0,0],part.rotation),transform(part.pivot.map(v=>-v)))));}
export function worldParts(asset){const result=new Map();function get(p){if(result.has(p.id))return result.get(p.id);const m=p.parent?mul(get(asset.parts.find(q=>q.id===p.parent)),partMatrix(p)):partMatrix(p);result.set(p.id,m);return m;}asset.parts.forEach(get);return result;}
