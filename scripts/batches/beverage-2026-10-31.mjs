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
const entries=[
 ['teapot','Side handled teapot','lidded','Remove / replace teapot lid',[
 cyl('foot',.048,.008,[0,.004,0],'cream'),cyl('floor',.062,.008,[0,.012,0],'sage'),shell('body',.062,.09,.061,'sage',undefined,.052),
 ...handle('handle',.078,.061,.055,.065),
 {...shell('spout',.014,.08,.04,'sage',undefined,.010),position:[-.087,.070,0],rotation:[0,0,.85]},
 cyl('lid',.056,.008,[0,.110,0],'cream',{lidded:true}),cyl('lid-knob',.011,.018,[0,.123,0],'wood',{lidded:true})
 ],[]],
 ['dripper','Pour over coffee dripper','filtered','Remove / replace paper filter',[
 ...ring('base-ring',.042,.008,.004,'sage'),
 ...[-1,1].flatMap((v,i)=>[box('base-spoke-x-'+i,[.034,.004,.012],[v*.025,.006,0],'sage'),box('base-spoke-z-'+i,[.012,.004,.034],[0,.006,v*.025],'sage')]),
 shell('cone',.012,.075,.0455,'sage',undefined,.059),
 ...handle('ear',.069,.056,.032,.025),
 shell('paper-filter',.009,.074,.051,'paper',{filtered:true},.053)
 ],[]],
 ['filter-holder','Fan shaped coffee filter holder','stocked','Remove / replace paper filters',[
 box('base',[.14,.012,.064],[0,.006,0],'wood'),
 ...[-1,1].map((v,i)=>({...box('cheek-'+i,[.14,.085,.006],[0,.053,v*.026],'sage'),rotation:[0,0,0]})),
 ...[-1,1].map((v,i)=>box('end-stop-'+i,[.006,.05,.052],[v*.067,.031,0],'wood')),
 ...Array.from({length:5},(_,i)=>({...box('filter-'+i,[.115,.10,.002],[0,.066,(i-2)*.008],'paper',{stocked:true}),rotation:[0,0,(i-2)*.04]}))
 ],[]],
 ['french-press','Steel French press','plunged','Remove / replace plunger assembly',[
 cyl('foot',.044,.008,[0,.004,0],'dark'),cyl('floor',.042,.006,[0,.011,0],'metal'),shell('vessel',.042,.14,.084,'metal'),
 ...handle('handle',.063,.084,.044,.09,'wood'),
 cyl('lid',.046,.008,[0,.158,0],'cream',{plunged:true}),cyl('rod',.003,.16,[0,.138,0],'metal',{plunged:true}),
 cyl('press-disc',.036,.004,[0,.060,0],'dark',{plunged:true}),cyl('knob',.012,.016,[0,.226,0],'wood',{plunged:true})
 ],[]],
 ['hand-grinder','Hand crank coffee grinder','cranked','Remove / replace crank assembly',[
 cyl('grounds-cup',.035,.045,[0,.0225,0],'cream'),cyl('cup-seam',.036,.004,[0,.047,0],'dark'),
 cyl('mill-body',.035,.105,[0,.1015,0],'sage'),
 ...Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return box('grip-'+i,[.003,.058,.003],[.035*Math.cos(a),.100,.035*Math.sin(a)],'dark');}),
 cyl('lid',.036,.006,[0,.157,0],'wood'),cyl('axle',.005,.025,[0,.1725,0],'metal',{cranked:true}),
 box('crank',[.085,.005,.012],[.0375,.187,0],'metal',{cranked:true}),cyl('crank-knob',.012,.027,[.075,.203,0],'wood',{cranked:true})
 ],[]],
 ['tamper','Espresso tamper with removable handle','handled','Detach / attach tamper handle',[
 cyl('press-base',.029,.012,[0,.006,0],'metal'),cyl('neck',.010,.015,[0,.0195,0],'metal'),
 cyl('grip',.015,.045,[0,.0495,0],'wood',{handled:true},.022),cyl('grip-cap',.022,.006,[0,.075,0],'wood',{handled:true})
 ],[]],
 ['knock-box','Coffee grounds knock box','barred','Remove / replace knock bar',[
 ...vessel(.14,.13,.10,.008),
 {...cyl('knock-bar',.012,.15,[0,.083,0],'dark',{barred:true}),rotation:[0,0,Math.PI/2]}
 ],[surface('interior-floor',.008,.124,.114,{barred:false})]],
 ['tea-infuser','Handled basket tea infuser','capped','Remove / replace infuser cap',[
 cyl('bottom',.024,.003,[0,.0015,0],'metal'),
 ...Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return rod('basket-wire-'+i,[.024*Math.cos(a),.003,.024*Math.sin(a)],[.028*Math.cos(a),.054,.028*Math.sin(a)],.0012,'metal');}),
 ...[.014,.027,.040,.054].flatMap((y,i)=>loop('hoop-'+i,.024+y*.074,.024+y*.074,y,'metal')),
 box('handle',[.014,.005,.075],[0,.052,-.063],'wood'),
 cyl('cap',.031,.004,[0,.058,0],'cream',{capped:true}),cyl('knob',.007,.009,[0,.0645,0],'wood',{capped:true})
 ],[]],
 ['tea-tin','Square loose leaf tea tin','lidded','Remove / replace tea tin lid',[
 ...vessel(.09,.09,.12,.004),box('label',[.055,.045,.001],[0,.067,.0455],'paper'),
 box('label-rule',[.033,.003,.001],[0,.067,.0465],'wood'),box('lid',[.096,.008,.096],[0,.124,0],'wood',{lidded:true})
 ],[surface('lid-top',.128,.09,.09,{lidded:true})]],
 ['coaster-rack','Coaster stack and open rack','stacked','Remove / replace cork coasters',[
 box('base',[.14,.012,.14],[0,.006,0],'wood'),
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('corner-'+i+j,[.012,.045,.012],[x*.064,.0345,z*.064],'sage'))),
 ...Array.from({length:4},(_,i)=>box('coaster-'+i,[.11,.006,.11],[0,.015+i*.007,0],'food',{stacked:true}))
 ],[surface('coaster-top',.039,.11,.11,{stacked:true}),surface('empty-base',.012,.116,.116,{stacked:false})]]
];
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces] of entries){
 const id='beverage-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){p.position[0]-=center[0];p.position[2]-=center[1];}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'beverage-2026-10-31',measurement:{status:'estimated',note:'Original fictional household object. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds are exact rest geometry; footprint conservatively includes removable parts.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/beverage-2026-10-31.mjs.'},materials,state:{[key]:true},actions:[{id:'toggle',type:'toggle',stateKey:key,label}],parts,supportSurfaces,interactionNote:'Discrete functional state. Removed contents/covers are taken out of the scene, not animated. No liquid, heat or physics simulation.',thumbnail:'thumbnail.svg',preview:'preview/beverage.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
