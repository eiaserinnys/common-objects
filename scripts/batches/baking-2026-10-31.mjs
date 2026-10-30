// Reproducible original metric geometry; no external source dimensions claimed.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {mesh,point,worldParts} from '../../renderer/geometry.js';
import {svgScene} from '../../renderer/svg.js';
const materials={cream:{color:[.88,.84,.72]},sage:{color:[.30,.52,.53]},wood:{color:[.64,.43,.27]},metal:{color:[.38,.43,.40]},food:{color:[.82,.62,.35]},dark:{color:[.16,.24,.20]},paper:{color:[.96,.93,.83]}};
const box=(id,size,position,material='cream',visibleWhen)=>({id,parent:null,position,rotation:[0,0,0],pivot:[0,0,0],rotationAxis:[0,1,0],joint:'fixed',state:{},geometry:{type:'box',size},material,...visibleWhen&&{visibleWhen}});
const cyl=(id,r,h,position,material='cream',visibleWhen,top=r)=>({...box(id,[],position,material,visibleWhen),geometry:{type:'cylinder',radiusBottom:r,radiusTop:top,height:h,segments:24}});
function vessel(w,d,h,t=.006){return [box('base',[w,t,d],[0,t/2,0],'sage'),box('left-wall',[t,h-t,d],[-(w-t)/2,(h+t)/2,0],'sage'),box('right-wall',[t,h-t,d],[(w-t)/2,(h+t)/2,0],'sage'),box('back-wall',[w-2*t,h-t,t],[0,(h+t)/2,-(d-t)/2],'sage'),box('front-wall',[w-2*t,h-t,t],[0,(h+t)/2,(d-t)/2],'sage')];}
const surface=(id,height,w,d,condition)=>({id,height,polygon:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],normal:[0,1,0],...(condition?{availableWhen:condition}:{}),note:'Usable horizontal support rectangle; no load capacity or physics simulation.'});
const ring=(id,r,h,y,mat,when)=>Array.from({length:16},(_,n)=>{const angle=n*Math.PI/8;return {...box(id+'-'+n,[.008,h,2*r*Math.tan(Math.PI/16)],[r*Math.cos(angle),y,r*Math.sin(angle)],mat,when),rotation:[0,-angle,0]};});
const rod=(id,a,b,r=.002,mat='metal',when)=>{const d=b.map((v,k)=>v-a[k]),h=Math.hypot(...d);const part=box(id,[r*2,h,r*2],a.map((v,k)=>(v+b[k])/2),mat,when);return {...part,rotation:[Math.asin(d[2]/h),0,Math.atan2(-d[0],d[1])]};};
const loop=(id,rx,rz,y,mat,when)=>Array.from({length:16},(_,i)=>{const a=i*Math.PI/8,b=(i+1)*Math.PI/8;return rod(id+'-'+i,[rx*Math.cos(a),y,rz*Math.sin(a)],[rx*Math.cos(b),y,rz*Math.sin(b)],.002,mat,when);});
const entries=[
 ['rolling-pin','Handled rolling pin','handled','Remove / replace end handles',[
 {...cyl('barrel',.027,.25,[0,.027,0],'wood'),rotation:[0,0,Math.PI/2]},
 ...[-1,1].map((v,i)=>({...cyl('handle-'+i,.014,.075,[v*.1625,.027,0],'wood',{handled:true}),rotation:[0,0,Math.PI/2]}))
 ],[]],
 ['whisk','Balloon wire whisk','headed','Detach / attach wire head',[
 cyl('handle',.013,.115,[0,.0575,0],'wood'),cyl('ferrule',.015,.018,[0,.124,0],'metal'),
 ...Array.from({length:4},(_,j)=>Array.from({length:12},(_,i)=>{const theta=j*Math.PI/4;const p=t=>{const rad=.035*Math.sin(t);return [rad*Math.cos(theta),.133+.115*(1-Math.cos(t))/2,rad*Math.sin(theta)];};return rod('wire-'+j+'-'+i,p(i*Math.PI/6),p((i+1)*Math.PI/6),.0012,'metal',{headed:true});})).flat()
 ],[]],
 ['measuring-spoon','Tablespoon measure','filled','Empty / fill flour measure',[
 cyl('bowl-base',.021,.003,[0,.0015,0],'sage'),...ring('bowl-wall',.020,.014,.010,'sage'),
 box('handle',[.016,.005,.105],[0,.014,-.069],'sage'),cyl('flour',.015,.009,[0,.0075,0],'paper',{filled:true})
 ],[]],
 ['measuring-jug','Graduated measuring jug','filled','Empty / fill jug',[
 cyl('base',.046,.005,[0,.0025,0],'cream'),...ring('wall',.042,.085,.0475,'cream'),
 box('handle-upper',[.036,.008,.012],[.060,.080,0],'sage'),box('handle-grip',[.008,.06,.012],[.074,.05,0],'sage'),box('handle-lower',[.036,.008,.012],[.060,.02,0],'sage'),
 ...Array.from({length:4},(_,i)=>box('graduation-'+i,[.018,.0018,.001],[0,.022+i*.016,.0465],'dark')),
 cyl('contents',.036,.05,[0,.030,0],'food',{filled:true}),box('pour-lip',[.028,.004,.018],[0,.091,-.043],'cream')
 ],[]],
 ['funnel','Wide mouth kitchen funnel','strained','Remove / replace strainer insert',[
 // Open-ended frustum shell, with an unobstructed throat.
 {...cyl('spout',.009,.042,[0,.021,0],'sage'),geometry:{type:'cylinder',radiusBottom:.009,radiusTop:.009,height:.042,segments:16,openTop:true,openBottom:true}},
 {...cyl('cone',.009,.06,[0,.072,0],'sage',undefined,.052),geometry:{type:'cylinder',radiusBottom:.009,radiusTop:.052,height:.06,segments:16,openTop:true,openBottom:true}},
 ...loop('rim',.052,.052,.102,'sage'),
 ...[-2,-1,0,1,2].flatMap((v,i)=>[rod('strainer-x-'+i,[-Math.sqrt(.024**2-(v*.008)**2),.065,v*.008],[Math.sqrt(.024**2-(v*.008)**2),.065,v*.008],.001,'metal',{strained:true}),rod('strainer-z-'+i,[v*.008,.065,-Math.sqrt(.024**2-(v*.008)**2)],[v*.008,.065,Math.sqrt(.024**2-(v*.008)**2)],.001,'metal',{strained:true})])
 ],[]],
 ['pastry-brush','Silicone pastry brush','headed','Detach / attach brush head',[
 box('handle',[.020,.012,.16],[0,.006,-.05],'wood'),box('socket',[.040,.018,.025],[0,.009,.0425],'sage'),
 ...Array.from({length:9},(_,i)=>box('bristle-'+i,[.003,.012,.045],[(i-4)*.004,.009,.0775],'sage',{headed:true}))
 ],[]],
 ['bench-scraper','Bench dough scraper','sleeved','Remove / replace blade guard',[
 box('blade',[.15,.095,.0018],[0,.0475,0],'metal'),{...cyl('grip',.014,.15,[0,.103,0],'wood'),rotation:[0,0,Math.PI/2]},
 box('guard',[.154,.009,.008],[0,.0045,0],'sage',{sleeved:true})
 ],[]],
 ['cookie-cutter','Round biscuit cutter','pressed','Remove / replace dough cutout',[
 ...ring('cutting-wall',.036,.024,.012,'metal'),...loop('rolled-rim',.036,.036,.024,'metal'),
 cyl('dough',.030,.006,[0,.003,0],'food',{pressed:true})
 ],[]],
 ['muffin-tin','Six cup muffin tin','loaded','Remove / replace paper liners',[
 // Open cells bounded by webs; no solid deck across cup openings.
 ...[-1,0,1,2].map((v,i)=>box('cross-web-'+i,[.008,.006,.15],[(v-.5)*.08,.032,0],'metal')),
 ...[-1,0,1].map((v,i)=>box('long-web-'+i,[.248,.006,.008],[0,.032,v*.075],'metal')),
 ...[-1,0,1].flatMap((x,i)=>[-1,1].flatMap((z,j)=>[
 cyl('cup-base-'+i+j,.027,.003,[x*.08,.0015,z*.0375],'metal'),
 ...ring('cup-wall-'+i+j,.027,.030,.018,'metal').map(p=>({...p,position:[p.position[0]+x*.08,p.position[1],p.position[2]+z*.0375]})),
 cyl('liner-base-'+i+j,.022,.002,[x*.08,.004,z*.0375],'paper',{loaded:true}),
 ...ring('liner-wall-'+i+j,.019,.025,.0175,'paper',{loaded:true}).map(p=>({...p,position:[p.position[0]+x*.08,p.position[1],p.position[2]+z*.0375]}))
 ]))
 ],[]],
 ['cooling-rack','Raised wire cooling rack','matted','Remove / replace cooling mat',[
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('foot-'+i+j,[.018,.027,.018],[x*.15,.0135,z*.11],'metal'))),
 ...Array.from({length:15},(_,i)=>rod('wire-'+i,[(i-7)*.022,.030,-.13],[(i-7)*.022,.030,.13],.003,'metal')),
 ...[-1,1].map((v,i)=>rod('edge-'+i,[-.16,.030,v*.13],[.16,.030,v*.13],.003,'metal')),
 ...[-1,0,1].map((v,i)=>rod('brace-'+i,[-.16,.027,v*.10],[.16,.027,v*.10],.002,'metal')),
 box('mat',[.30,.003,.24],[0,.0345,0],'sage',{matted:true})
 ],[surface('mat-top',.036,.30,.24,{matted:true})]]
];
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces] of entries){
 const id='baking-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){p.position[0]-=center[0];p.position[2]-=center[1];}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'baking-2026-10-31',measurement:{status:'estimated',note:'Original fictional household object. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds are exact rest geometry; footprint conservatively includes removable parts.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/baking-2026-10-31.mjs.'},materials,state:{[key]:true},actions:[{id:'toggle',type:'toggle',stateKey:key,label}],parts,supportSurfaces,interactionNote:'Discrete functional state. Removed contents/covers are taken out of the scene, not animated. No food deformation, heat or physics simulation.',thumbnail:'thumbnail.svg',preview:'preview/baking.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
