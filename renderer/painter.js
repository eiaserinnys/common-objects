// BSP painter ordering splits spanning polygons and edges at geometry planes.
// This keeps the SVG renderer, while avoiding average-depth triangle artifacts.
const EPS=1e-8;
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
function plane(v){const a=sub(v[1],v[0]),b=sub(v[2],v[0]);let n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],l=Math.hypot(...n);if(l<EPS*EPS)return null;n=n.map(x=>x/l);return {n,d:dot(n,v[0])};}
function split(item,p){
 const ds=item.vertices.map(v=>dot(p.n,v)-p.d),pos=ds.some(d=>d>EPS),neg=ds.some(d=>d< -EPS);
 if(!pos&&!neg)return [null,null,item];if(!neg)return [item,null,null];if(!pos)return [null,item,null];
 const front=[],back=[],v=item.vertices;
 for(let i=0;i<v.length;i++){
  const j=(i+1)%v.length,a=v[i],b=v[j],da=ds[i],db=ds[j];
  if(da>=-EPS)front.push(a);if(da<=EPS)back.push(a);
  if(item.line&&i===v.length-1)break;
  if((da>EPS&&db< -EPS)||(da< -EPS&&db>EPS)){const t=da/(da-db),q=a.map((x,k)=>x+(b[k]-x)*t);front.push(q);back.push(q);}
 }
 return [{...item,vertices:front},{...item,vertices:back},null];
}
export function painterOrder(items){
 function build(list){
  const face=list.find(x=>!x.line&&plane(x.vertices));if(!face)return {items:list};
  const p=plane(face.vertices),front=[],back=[],same=[];
  for(const item of list){const [f,b,s]=split(item,p);if(f)front.push(f);if(b)back.push(b);if(s)same.push(s);}
  return {p,items:same.sort((a,b)=>Number(!!a.line)-Number(!!b.line)),front:front.length?build(front):null,back:back.length?build(back):null};
 }
 const output=[];
 function visit(node){if(!node)return;if(!node.p){output.push(...node.items);return;}const side=-node.p.d>=0;visit(side?node.back:node.front);output.push(...node.items);visit(side?node.front:node.back);}
 visit(build(items));return output;
}
export function clipNear(item,near=-.01){
 const v=item.vertices,out=[];
 if(item.line){let [a,b]=v;if(a[2]>near&&b[2]>near)return null;if((a[2]>near)!==(b[2]>near)){const t=(near-a[2])/(b[2]-a[2]),q=a.map((x,k)=>x+(b[k]-x)*t);if(a[2]>near)a=q;else b=q;}return {...item,vertices:[a,b]};}
 for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];if(a[2]<=near)out.push(a);if((a[2]<=near)!==(b[2]<=near)){const t=(near-a[2])/(b[2]-a[2]);out.push(a.map((x,k)=>x+(b[k]-x)*t));}}
 return out.length>=3?{...item,vertices:out}:null;
}
