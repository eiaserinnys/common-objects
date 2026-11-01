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
const shell=(id,r,h,y,mat='sage',when,top=r)=>({...cyl(id,r,h,[0,y,0],mat,when,top),geometry:{type:'cylinder',radiusBottom:r,radiusTop:top,height:h,segments:24,openTop:true,openBottom:true}});
const handle=(id,x,y,w,h,mat='wood')=>[
 box(id+'-upper',[w,.012,.018],[x,y+h/2,0],mat),
 box(id+'-outer',[.012,h,.018],[x+w/2-.006,y,0],mat),
 box(id+'-lower',[w,.012,.018],[x,y-h/2,0],mat)];
const horizontal=(p)=>({...p,rotation:[0,0,Math.PI/2]});
const entries=[
 ['yoga-mat','Rolled yoga mat with carrying straps','strapped','Remove / replace carrying straps',[
 horizontal(cyl('rolled-mat',.065,.60,[0,.065,0],'sage')),
 ...[-1,1].map((v,i)=>horizontal(shell('strap-'+i,.065,.028,.065,'wood',{strapped:true}))).map((p,i)=>({...p,position:[(i?1:-1)*.21,.065,0]})),
 box('carry-handle',[.42,.012,.025],[0,.145,0],'wood',{strapped:true}),
 ...[-1,1].map((v,i)=>box('handle-anchor-'+i,[.028,.018,.025],[v*.21,.135,0],'wood',{strapped:true}))
 ],[]],
 ['yoga-block','Cork yoga block with cotton sleeve','sleeved','Remove / replace cotton sleeve',[
 box('cork-block',[.23,.075,.15],[0,.0375,0],'wood'),
 box('sleeve-top',[.08,.002,.15],[0,.076,0],'cream',{sleeved:true}),
 ...[-1,1].map((v,i)=>box('sleeve-side-'+i,[.08,.075,.002],[0,.0375,v*.076],'cream',{sleeved:true}))
 ],[surface('block-top',.077,.08,.15,{sleeved:true}),surface('bare-top',.075,.23,.15,{sleeved:false})]],
 ['dumbbell','Adjustable short dumbbell','loaded','Remove / replace outer weight plates',[
 horizontal(cyl('steel-bar',.012,.32,[0,.065,0],'metal')),
 horizontal(cyl('grip',.021,.12,[0,.065,0],'wood')),
 ...[-1,1].map((v,i)=>horizontal(cyl('inner-plate-'+i,.065,.025,[v*.09,.065,0],'dark'))),
 ...[-1,1].map((v,i)=>horizontal(cyl('outer-plate-'+i,.065,.025,[v*.121,.065,0],'metal',{loaded:true})))
 ],[]],
 ['kettlebell','Flat bottom kettlebell','wrapped','Remove / replace grip wrap',[
 cyl('flat-base',.065,.018,[0,.009,0],'dark'),cyl('bell-body',.065,.10,[0,.068,0],'sage',undefined,.049),
 ...[-1,1].map((v,i)=>rod('handle-arm-'+i,[v*.04,.105,0],[v*.048,.185,0],.009,'metal')),
 horizontal(cyl('handle',.009,.096,[0,.185,0],'metal')),
 horizontal(cyl('grip-wrap',.013,.062,[0,.185,0],'wood',{wrapped:true}))
 ],[]],
 ['pushup-bar','Freestanding push up bar','padded','Remove / replace handle pad',[
 ...[-1,1].map((v,i)=>box('foot-'+i,[.045,.018,.16],[v*.10,.009,0],'dark')),
 ...[-1,1].map((v,i)=>rod('riser-'+i,[v*.10,.018,0],[v*.08,.115,0],.009,'metal')),
 horizontal(cyl('handle',.009,.16,[0,.115,0],'metal')),
 horizontal(cyl('foam-pad',.019,.12,[0,.115,0],'sage',{padded:true}))
 ],[]],
 ['ab-wheel','Twin disc abdominal roller','gripped','Remove / replace axle grips',[
 ...[-1,1].map((v,i)=>horizontal(cyl('wheel-'+i,.085,.025,[v*.022,.085,0],'dark'))),
 horizontal(cyl('axle',.009,.32,[0,.085,0],'metal')),
 ...[-1,1].map((v,i)=>horizontal(cyl('hand-grip-'+i,.021,.105,[v*.105,.085,0],'sage',{gripped:true})))
 ],[]],
 ['foam-roller','Hollow ribbed foam roller','cored','Remove / replace inner core',[
 {...shell('foam-shell',.07,.32,.07,'sage'),position:[0,.07,0],rotation:[0,0,Math.PI/2]},
 ...Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return box('rib-'+i,[.32,.005,.005],[0,.07+.0675*Math.cos(a),.0675*Math.sin(a)],'sage');}),
 horizontal(cyl('core',.058,.30,[0,.07,0],'cream',{cored:true}))
 ],[]],
 ['massage-tool','Four foot wooden massage tool','handled','Remove / replace palm knob',[
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>cyl('foot-'+i+j,.014,.025,[x*.038,.0125,z*.038],'wood'))),
 box('bridge',[.10,.018,.10],[0,.034,0],'wood'),
 cyl('palm-knob',.032,.035,[0,.0605,0],'sage',{handled:true},.023)
 ],[]],
 ['balance-board','Circular balance board with removable pad','padded','Remove / replace cork standing pad',[
 cyl('pivot',.04,.045,[0,.0225,0],'dark',undefined,.065),
 cyl('deck',.19,.018,[0,.054,0],'wood'),cyl('standing-pad',.175,.004,[0,.065,0],'sage',{padded:true})
 ],[surface('pad-top',.067,.24,.24,{padded:true}),surface('deck-top',.063,.24,.24,{padded:false})]],
 ['stretch-strap','Folded stretching strap with buckle','buckled','Remove / replace metal buckle',[
 ...Array.from({length:4},(_,i)=>box('fold-'+i,[.18,.004,.035],[0,.002+i*.005,0],'sage')),
 box('buckle-left',[.006,.008,.05],[.082,.024,0],'metal',{buckled:true}),
 box('buckle-right',[.006,.008,.05],[.107,.024,0],'metal',{buckled:true}),
 ...[-1,1].map((v,i)=>box('buckle-end-'+i,[.031,.008,.006],[.0945,.024,v*.022],'metal',{buckled:true}))
 ],[]]
];
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces] of entries){
 const id='fitness-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){p.position[0]-=center[0];p.position[2]-=center[1];}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'fitness-2026-11-01',measurement:{status:'estimated',note:'Original fictional household object. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds are exact rest geometry; footprint conservatively includes removable parts.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/fitness-2026-11-01.mjs.'},materials,state:{[key]:true},actions:[{id:'toggle',type:'toggle',stateKey:key,label}],parts,supportSurfaces,interactionNote:'Discrete functional state. Removed contents/covers are taken out of the scene, not animated. No exercise, force, load or physics simulation.',thumbnail:'thumbnail.svg',preview:'preview/fitness.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
