// Reproducible original metric geometry; no external source dimensions claimed.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {mesh,point,worldParts} from '../../renderer/geometry.js';
import {svgScene} from '../../renderer/svg.js';
const materials={cream:{color:[.88,.84,.72]},sage:{color:[.30,.52,.53]},wood:{color:[.64,.43,.27]},metal:{color:[.38,.43,.40]},food:{color:[.82,.62,.35]},dark:{color:[.16,.24,.20]},paper:{color:[.96,.93,.83]}};
const box=(id,size,position,material='cream',visibleWhen)=>({id,parent:null,position,rotation:[0,0,0],pivot:[0,0,0],rotationAxis:[0,1,0],joint:'fixed',state:{},geometry:{type:'box',size},material,...visibleWhen&&{visibleWhen}});
const cyl=(id,r,h,position,material='cream',visibleWhen,top=r)=>({...box(id,[],position,material,visibleWhen),geometry:{type:'cylinder',radiusBottom:r,radiusTop:top,height:h,segments:24}});
function vessel(w,d,h,t=.006){return [box('base',[w,t,d],[0,t/2,0],'sage'),box('left-wall',[t,h-t,d],[-(w-t)/2,(h+t)/2,0],'sage'),box('right-wall',[t,h-t,d],[(w-t)/2,(h+t)/2,0],'sage'),box('back-wall',[w-2*t,h-t,t],[0,(h+t)/2,-(d-t)/2],'sage'),box('front-wall',[w-2*t,h-t,t],[0,(h+t)/2,(d-t)/2],'sage')];}
const surface=(id,height,w,d,condition)=>({id,height,polygon:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],normal:[0,1,0],...(condition?{availableWhen:condition}:{}),note:'Usable horizontal support rectangle; no load capacity or physics simulation.'});
const ring=(id,r,h,y,mat,when)=>Array.from({length:32},(_,n)=>{const angle=n*Math.PI/16;return {...box(id+'-'+n,[.008,h,2*r*Math.tan(Math.PI/32)],[r*Math.cos(angle),y,r*Math.sin(angle)],mat,when),rotation:[0,-angle,0]};});
const entries=[
 ['watering-can','Indoor watering can','closed','Remove / replace filling lid',[
 ...vessel(.13,.16,.16),box('lid',[.14,.008,.17],[0,.164,0],'cream',{closed:true}),
 {...cyl('spout',.018,.17,[.12,.105,0],'sage',undefined,.012),rotation:[0,0,-.85]},
 ...[-1,1].map((v,i)=>box('handle-post-'+i,[.05,.014,.014],[-.085,.08+v*.05,0],'wood')),
 box('handle-back',[.014,.114,.016],[-.11,.08,0],'wood'),
 ],[surface('lid-top',.168,.10,.13,{closed:true})]],
 ['trowel','Hand potting trowel','sheathed','Remove / replace blade sheath',[
 box('blade',[.065,.005,.11],[0,.008,.025],'metal'),
 ...[-1,1].map((v,i)=>({...box('blade-edge-'+i,[.012,.006,.10],[v*.032,.013,.025],'metal'),rotation:[0,0,v*.45]})),
 box('blade-tip',[.035,.005,.025],[0,.008,.0925],'metal'),box('tang',[.016,.012,.055],[0,.012,-.057],'metal'),box('handle',[.029,.025,.11],[0,.0125,-.13],'wood'),
 box('sheath',[.078,.008,.14],[0,.004,.035],'sage',{sheathed:true})
 ],[]],
 ['cultivator','Three tine hand cultivator','guarded','Remove / replace tine guard',[
 box('handle',[.03,.03,.12],[0,.015,-.10],'wood'),box('shaft',[.012,.012,.08],[0,.018,0],'metal'),box('crossbar',[.075,.012,.014],[0,.018,.035],'metal'),
 ...[-1,0,1].map((v,i)=>box('tine-'+i,[.009,.024,.075],[v*.032,.012,.075],'metal')),
 box('guard',[.084,.01,.035],[0,.005,.10],'sage',{guarded:true})
 ],[]],
 ['dibber','Wooden seed dibber','capped','Remove / replace point cap',[
 box('rest',[.045,.012,.05],[0,.006,0],'wood'),
 {...cyl('shaft',.013,.16,[0,.025,0],'wood'),rotation:[Math.PI/2,0,0]},
 {...cyl('point',.013,.045,[0,.025,.1025],'wood',undefined,.001),rotation:[Math.PI/2,0,0]},
 box('T-grip',[.08,.022,.022],[0,.025,-.08],'wood'),
 ...Array.from({length:4},(_,i)=>box('depth-mark-'+i,[.02,.001,.002],[0,.038,-.02+i*.025],'dark')),
 box('point-cap',[.032,.032,.05],[0,.025,.1025],'sage',{capped:true})
 ],[]],
 ['seed-tray','Six cell seedling tray','filled','Remove / replace soil plugs',[
 ...vessel(.24,.16,.042,.004),box('divider-long',[.004,.038,.152],[0,.023,0],'sage'),
 ...[-1,1].map((v,i)=>box('divider-short-'+i,[.232,.038,.004],[0,.023,v*.026],'sage')),
 ...[-1,1].flatMap((x,i)=>[-1,0,1].map((z,j)=>box('soil-plug-'+i+'-'+j,[.108,.028,.045],[x*.059,.018,z*.052],'dark',{filled:true})))
 ],[]],
 ['plant-label','Reusable plant label','written','Remove / replace name insert',[
 box('stake',[.012,.006,.14],[0,.003,.04],'wood'),box('label-board',[.075,.009,.045],[0,.0045,-.045],'sage'),
 box('name-insert',[.063,.001,.033],[0,.0095,-.045],'paper',{written:true}),
 ...[0,1,2].map(i=>box('writing-'+i,[.04-i*.008,.0005,.0015],[0,.01025,-.055+i*.009],'dark',{written:true}))
 ],[]],
 ['pruners','Compact pruning shears','locked','Remove / replace safety strap',[
 ...[-1,1].flatMap((v,i)=>[
 {...box('grip-'+i,[.018,.018,.09],[v*.026,.009,-.045],'sage'),rotation:[0,v*.20,0]},
 {...box('blade-'+i,[.012,.008,.08],[v*.008,.01,.04],'metal'),rotation:[0,-v*.12,0]}]),
 ...[-1,1].map((v,i)=>({...box('handle-shank-'+i,[.013,.01,.045],[v*.013,.01,-.012],'metal'),rotation:[0,-v*.5,0]})),
 cyl('pivot',.012,.022,[0,.011,0],'wood'),box('safety-strap',[.075,.005,.018],[0,.020,-.067],'cream',{locked:true})
 ],[]],
 ['sieve','Potting soil sieve','loaded','Remove / replace pebble sample',[
 ...ring('rim',.095,.035,.0175,'wood'),
 ...Array.from({length:9},(_,i)=>{const x=(i-4)*.018;return box('mesh-x-'+i,[.0015,.002,2*Math.sqrt(.09*.09-x*x)],[x,.005,0],'metal');}),
 ...Array.from({length:9},(_,i)=>{const z=(i-4)*.018;return box('mesh-z-'+i,[2*Math.sqrt(.09*.09-z*z),.002,.0015],[0,.007,z],'metal');}),
 ...Array.from({length:5},(_,i)=>cyl('pebble-'+i,.011,.013,[(i%3-1)*.027,.0145,(Math.floor(i/3)-.5)*.033],'cream',{loaded:true},.008))
 ],[]],
 ['moisture-meter','Analog soil moisture meter','capped','Remove / replace probe sleeve',[
 box('meter-housing',[.055,.022,.075],[0,.011,-.0525],'sage'),box('dial',[.042,.001,.04],[0,.0225,-.0525],'paper'),
 {...box('needle',[.002,.001,.027],[0,.0235,-.0525],'dark'),rotation:[0,.4,0]},
 ...Array.from({length:5},(_,i)=>box('dial-tick-'+i,[.002,.001,.004],[(i-2)*.007,.0235,-.066],'dark')),
 {...cyl('probe',.003,.15,[0,.011,.06],'metal'),rotation:[Math.PI/2,0,0]},
 box('probe-sleeve',[.012,.012,.14],[0,.011,.067],'cream',{capped:true})
 ],[]],
 ['pot-caddy','Rolling plant caddy','matted','Remove / replace cork mat',[
 ...[-1,1].flatMap((x,i)=>[-1,1].flatMap((z,j)=>[box('caster-fork-'+i+'-'+j,[.012,.034,.025],[x*.10,.053,z*.10],'metal'),{...cyl('caster-wheel-'+i+'-'+j,.018,.022,[x*.10,.018,z*.10],'dark'),rotation:[0,0,Math.PI/2]}])),
 ...[-1,1].map((z,i)=>box('bearer-'+i,[.25,.018,.025],[0,.079,z*.10],'wood')),
 ...Array.from({length:7},(_,i)=>box('slat-'+i,[.03,.012,.25],[(i-3)*.036,.094,0],'cream')),
 box('cork-mat',[.21,.006,.21],[0,.103,0],'food',{matted:true})
 ],[surface('mat-top',.106,.20,.20,{matted:true})]]
];
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces] of entries){
 const id='gardening-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){p.position[0]-=center[0];p.position[2]-=center[1];}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'gardening-2026-10-28',measurement:{status:'estimated',note:'Original fictional household object. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds are exact rest geometry; footprint conservatively includes removable parts.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/gardening-2026-10-28.mjs.'},materials,state:{[key]:true},actions:[{id:'toggle',type:'toggle',stateKey:key,label}],parts,supportSurfaces,interactionNote:'Discrete functional state. Removed contents/covers are taken out of the scene, not animated. No growth, sensing, cutting or physics simulation.',thumbnail:'thumbnail.svg',preview:'preview/gardening.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
