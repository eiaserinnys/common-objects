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
 ['bucket','Lidded cleaning bucket','closed','Remove / replace bucket lid',[
 ...vessel(.28,.32,.24,.008),box('rim-left',[.012,.012,.33],[-.14,.234,0],'dark'),box('rim-right',[.012,.012,.33],[.14,.234,0],'dark'),
 box('lid',[.29,.010,.33],[0,.245,0],'cream',{closed:true}),
 ...[-1,1].map((v,i)=>box('handle-arm-'+i,[.012,.055,.012],[v*.15,.19,-.17],'metal')),
 box('carry-grip',[.30,.014,.016],[0,.163,-.17],'wood')
 ],[surface('lid-top',.25,.25,.29,{closed:true})]],
 ['dustpan','Wide household dustpan','covered','Remove / replace lip protector',[
 box('pan-floor',[.23,.006,.20],[0,.003,.045],'sage'),box('back-wall',[.23,.045,.006],[0,.0255,-.052],'sage'),
 ...[-1,1].map((v,i)=>box('side-wall-'+i,[.006,.029,.20],[v*.112,.0205,.045],'sage')),
 box('grip',[.032,.022,.13],[0,.017,-.117],'wood'),box('rubber-lip',[.23,.004,.016],[0,.002,.153],'dark'),
 box('lip-protector',[.234,.012,.020],[0,.006,.153],'cream',{covered:true})
 ],[]],
 ['hand-brush','Wooden hand brush','fitted','Remove / replace bristle cartridge',[
 box('back',[.075,.018,.145],[0,.044,.025],'wood'),box('handle',[.028,.022,.12],[0,.046,-.105],'wood'),
 box('cartridge',[.067,.004,.135],[0,.033,.025],'dark',{fitted:true}),
 ...Array.from({length:24},(_,i)=>box('bristle-tuft-'+i,[.009,.031,.014],[(i%4-1.5)*.016,.0155,(Math.floor(i/4)-2.5)*.022+.025],'cream',{fitted:true})),
 // Four small storage feet ground the body without hiding the replaceable bristles.
 ...[-1,1].flatMap((v,i)=>[-1,1].map((w,j)=>box('storage-foot-'+i+'-'+j,[.006,.035,.008],[v*.0345,.0175,.025+w*.0685],'wood')))
 ],[]],
 ['spray-bottle','Trigger spray bottle','fitted','Remove / replace trigger head',[
 cyl('bottle-body',.043,.15,[0,.075,0],'sage'),cyl('shoulder',.043,.035,[0,.1675,0],'sage',undefined,.017),cyl('neck',.017,.025,[0,.1975,0],'sage'),
 box('front-label',[.043,.065,.002],[0,.087,.042],'paper'),box('label-stripe',[.035,.009,.001],[0,.087,.0435],'food'),
 cyl('thread-collar',.022,.020,[0,.215,0],'cream',{fitted:true}),box('pump-head',[.036,.028,.075],[0,.237,.016],'cream',{fitted:true}),
 {...cyl('nozzle',.012,.018,[0,.237,.062],'dark',{fitted:true}),rotation:[Math.PI/2,0,0]},
 {...box('trigger',[.012,.046,.009],[0,.206,.044],'dark',{fitted:true}),rotation:[-.22,0,0]}
 ],[]],
 ['sponge','Layered scouring sponge','wrapped','Remove / replace paper band',[
 box('cellulose',[.10,.025,.07],[0,.0125,0],'food'),box('abrasive-pad',[.10,.005,.07],[0,.0275,0],'sage'),
 ...Array.from({length:15},(_,i)=>box('scouring-ridge-'+i,[.0015,.001,.066],[-.046+i*.0065,.0305,0],'dark')),
 box('paper-band-top',[.035,.001,.072],[0,.0315,0],'paper',{wrapped:true}),...[-1,1].map((v,i)=>box('paper-band-side-'+i,[.035,.031,.001],[0,.0155,v*.0355],'paper',{wrapped:true}))
 ],[]],
 ['squeegee','Window squeegee','fitted','Remove / replace rubber blade',[
 box('crossbar',[.26,.018,.026],[0,.022,.08],'metal'),box('blade',[.25,.004,.025],[0,.011,.1],'dark',{fitted:true}),
 box('stem',[.019,.015,.18],[0,.015,-.014],'metal'),box('grip',[.033,.030,.095],[0,.015,-.075],'sage'),
 ...[-1,1].map((v,i)=>box('end-cap-'+i,[.009,.03,.028],[v*.1255,.015,.08],'sage'))
 ],[]],
 ['lint-roller','Adhesive lint roller','loaded','Remove / replace adhesive roll',[
 box('rest',[.12,.008,.045],[0,.004,.06],'sage'),
 {...cyl('spindle',.008,.105,[0,.032,.06],'metal'),rotation:[0,0,Math.PI/2]},
 {...cyl('adhesive-roll',.024,.095,[0,.032,.06],'paper',{loaded:true}),rotation:[0,0,Math.PI/2]},
 box('roller-arm',[.009,.025,.115],[.056,.020,.005],'metal'),box('elbow',[.066,.014,.014],[.027,.020,-.053],'metal'),
 box('handle',[.027,.026,.11],[0,.013,-.105],'sage'),box('handle-inset',[.016,.001,.075],[0,.0265,-.105],'dark')
 ],[]],
 ['laundry-basket','Slatted laundry basket','lined','Remove / replace fabric liner',[
 box('basket-base',[.36,.010,.44],[0,.005,0],'cream'),
 ...[-1,1].flatMap((v,i)=>[
 box('rim-long-'+i,[.012,.018,.46],[v*.184,.281,0],'wood'),box('rim-short-'+i,[.36,.018,.012],[0,.281,v*.224],'wood'),
 ...Array.from({length:9},(_,n)=>box('long-slat-'+i+'-'+n,[.008,.27,.018],[v*.176,.14,(n-4)*.05],'cream')),
 ...Array.from({length:7},(_,n)=>box('short-slat-'+i+'-'+n,[.018,.27,.008],[(n-3)*.05,.14,v*.216],'cream')),
 box('liner-side-'+i,[.004,.25,.422],[v*.168,.135,0],'sage',{lined:true}),box('liner-end-'+i,[.332,.25,.004],[0,.135,v*.209],'sage',{lined:true}),
 box('grip-post-'+i+'-a',[.015,.045,.015],[-.055,.3075,v*.224],'wood'),box('grip-post-'+i+'-b',[.015,.045,.015],[.055,.3075,v*.224],'wood'),box('grip-bridge-'+i,[.125,.015,.015],[0,.3375,v*.224],'wood')]),
 box('liner-base',[.332,.003,.414],[0,.0115,0],'sage',{lined:true})
 ],[]],
 ['clothespin','Spring wooden clothespin','clipped','Remove / replace laundry swatch',[
 box('lower-jaw',[.014,.007,.078],[0,.0035,0],'wood'),box('upper-jaw',[.014,.007,.078],[0,.0145,0],'wood'),
 {...cyl('spring-coil',.005,.017,[0,.010,-.003],'metal'),rotation:[0,0,Math.PI/2]},
 ...[-1,1].map((v,i)=>box('spring-leg-'+i,[.0015,.0015,.025],[v*.008,.010,.012],'metal')),
 box('fabric-swatch',[.048,.003,.04],[0,.010,.050],'sage',{clipped:true})
 ],[]],
 ['washboard','Framed washboard','fitted','Remove / replace corrugated insert',[
 ...[-1,1].map((v,i)=>box('side-rail-'+i,[.024,.032,.45],[v*.113,.016,0],'wood')),
 box('lower-rail',[.25,.032,.024],[0,.016,.213],'wood'),box('top-panel',[.202,.018,.10],[0,.016,-.175],'wood'),
 box('insert-backing',[.202,.006,.318],[0,.011,.038],'metal',{fitted:true}),
 ...Array.from({length:17},(_,i)=>box('corrugation-'+i,[.198,.008,.009],[0,.018,-.105+i*.018],'cream',{fitted:true})),
 box('maker-inset',[.10,.001,.035],[0,.0255,-.175],'cream')
 ],[]]
];
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces] of entries){
 const id='cleaning-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){p.position[0]-=center[0];p.position[2]-=center[1];}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'cleaning-2026-10-27',measurement:{status:'estimated',note:'Original fictional household object. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds are exact rest geometry; footprint conservatively includes removable parts.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/cleaning-2026-10-27.mjs.'},materials,state:{[key]:!['on','extended','covered','capped','sleeved'].includes(key)},actions:[{id:'toggle',type:'toggle',stateKey:key,label}],parts,supportSurfaces,interactionNote:'Discrete functional state. Removed contents/covers are taken out of the scene, not animated. No fluid, cleaning, spring or physics simulation.',thumbnail:'thumbnail.svg',preview:'preview/cleaning.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
