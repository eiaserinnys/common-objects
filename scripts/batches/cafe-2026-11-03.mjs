// Reproducible original metric geometry; no external source dimensions claimed.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {mesh,point,worldParts} from '../../renderer/geometry.js';
import {svgScene} from '../../renderer/svg.js';
const materials={cream:{color:[.88,.84,.72]},sage:{color:[.30,.52,.53]},wood:{color:[.64,.43,.27]},metal:{color:[.38,.43,.40]},food:{color:[.82,.62,.35]},dark:{color:[.16,.24,.20]},paper:{color:[.96,.93,.83]}};
const box=(id,size,position,material='cream',visibleWhen)=>({id,parent:null,position,rotation:[0,0,0],pivot:[0,0,0],rotationAxis:[0,1,0],joint:'fixed',state:{},geometry:{type:'box',size},material,...visibleWhen&&{visibleWhen}});
const cyl=(id,r,h,position,material='cream',visibleWhen,top=r)=>({...box(id,[],position,material,visibleWhen),geometry:{type:'cylinder',radiusBottom:r,radiusTop:top,height:h,segments:24}});
const surface=(id,height,w,d)=>({id,height,polygon:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],normal:[0,1,0],note:'Inset usable rectangle; no load rating or attachment physics.'});
const feet=(w,d,h)=>[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('foot-'+i+j,[.045,h,.045],[x*(w/2-.05),h/2,z*(d/2-.05)],'dark')));
const entries=[];
const add=(id,name,parts,surfaces=[],key=null,label=null,note='Static furniture; no moving joints, load certification or physics.')=>entries.push([id,name,key,label,parts,surfaces,note]);
const offsetSurface=(id,h,w,d,x=0,z=0)=>({...surface(id,h,w,d),polygon:surface(id,h,w,d).polygon.map(([a,b])=>[a+x,b+z])});
add('service-counter','Oak-front café service counter',[
 ...feet(1.8,.72,.08),box('plinth',[1.7,.10,.62],[0,.13,0],'dark'),
 box('customer-panel',[1.76,.74,.025],[0,.55,-.3275],'wood'),
 ...[-1,1].map((x,i)=>box('end-panel-'+i,[.025,.74,.66],[x*.8675,.55,0],'sage')),
 box('worktop',[1.8,.03,.72],[0,.935,0],'cream'),box('lower-shelf',[1.71,.025,.62],[0,.1925,0],'wood'),
 box('middle-shelf',[1.71,.025,.60],[0,.52,0],'wood'),
 ...Array.from({length:12},(_,i)=>box('front-batten-'+i,[.025,.69,.012],[-.79+i*.144,.55,-.346],'wood')),
 box('kick-rail',[1.50,.025,.025],[0,.16,-.355],'metal')
],[surface('worktop',.95,1.74,.66),surface('lower-shelf',.205,1.66,.56),surface('middle-shelf',.5325,1.66,.54)]);
// Door parts use the actual left hinge axis. Paired visibility states preserve all parts.
const door=(open)=>{const angle=open?-Math.PI/2:0,s=open?'open':'closed',when={open};return [
 {...box(s+'-door',[.55,.68,.035],[-.275,.46,.2925],'sage',when),position:[0,.46,.2925],pivot:[-.275,0,0],rotation:[0,angle,0]},
 {...box(s+'-gasket',[.52,.65,.012],[0,.46,.269],'dark',when),pivot:[-.275,0,.0235],rotation:[0,angle,0]},
 {...box(s+'-handle',[.023,.28,.035],[.215,.51,.3275],'metal',when),pivot:[-.49,0,-.035],rotation:[0,angle,0]}
];};
add('refrigerator','Undercounter refrigerator with hinged door',[
 ...feet(.60,.60,.06),box('bottom',[.60,.045,.60],[0,.0825,0],'cream'),box('top',[.60,.035,.60],[0,.8325,0],'cream'),
 ...[-1,1].map((x,i)=>box('insulated-side-'+i,[.035,.71,.60],[x*.2825,.46,0],'cream')),
 box('rear',[.53,.71,.035],[0,.46,-.2825],'cream'),
 ...[.25,.47,.68].map((h,i)=>box('shelf-'+i,[.51,.012,.50],[0,h,-.015],'paper')),
 box('toe-grille',[.53,.05,.015],[0,.1075,.299],'dark'),
 ...Array.from({length:8},(_,i)=>box('vent-bar-'+i,[.01,.035,.005],[-.22+i*.063,.108,.309],'metal')),
 ...door(false),...door(true),box('temperature-panel',[.10,.018,.008],[.17,.8,.304],'dark')
],[...[.256,.476,.686].map((h,i)=>({...offsetSurface('shelf-'+i,h,.47,.45,0,-.015),availableWhen:{open:true}}))], 'open','Open / close refrigerator door','Door, gasket and handle rotate together 90 degrees about the left Y hinge in two fixed poses. Interior shelves are exposed when open. No continuous animation, cooling, thermostat, power or collision simulation.');
const espresso=[...feet(.60,.48,.035),box('drip-base',[.60,.035,.48],[0,.0525,0],'metal'),
 box('rear-boiler-housing',[.60,.37,.22],[0,.255,-.13],'sage'),
 ...[-1,1].map((v,i)=>box('side-cheek-'+i,[.035,.31,.45],[v*.2825,.225,0],'cream')),
 box('control-head',[.60,.10,.24],[0,.405,.06],'cream'),box('cup-warmer',[.56,.015,.35],[0,.4625,-.04],'metal'),
 ...[-1,1].map((v,i)=>box('warmer-rail-'+i,[.012,.035,.35],[v*.27,.4875,-.04],'metal')),
 cyl('group-head',.055,.035,[0,.3375,.105],'metal'),box('portafilter-handle',[.025,.025,.14],[.07,.3225,.16],'dark'),
 cyl('spout',.008,.045,[0,.2975,.105],'metal'),
 ...Array.from({length:8},(_,i)=>box('drip-grid-'+i,[.34,.008,.01],[0,.074,-.035+i*.032],'dark')),
 box('steam-upright',[.012,.17,.012],[.20,.285,.11],'metal'),box('steam-tip',[.012,.012,.085],[.20,.206,.1465],'metal'),
 {...cyl('pressure-dial',.03,.008,[-.18,.405,.184],'paper'),rotation:[Math.PI/2,0,0]},
 box('dial-needle',[.003,.025,.002],[-.18,.413,.189],'dark'),
 box('brew-button',[.035,.022,.008],[.14,.405,.184],'dark'),
 box('ready-lamp',[.018,.018,.008],[.21,.405,.184],'sage',{brewing:false}),
 box('brew-lamp',[.018,.018,.008],[.21,.405,.184],'food',{brewing:true}),
 // Demonstration cup stays in both states and is not a second catalog object.
 {...cyl('demo-cup-wall',.035,.065,[0,.1105,.105],'paper',undefined,.042),geometry:{type:'cylinder',radiusBottom:.035,radiusTop:.042,height:.065,segments:24,openTop:true}},
 cyl('cup-interior',.034,.002,[0,.082,.105],'dark'),
 cyl('coffee-surface',.036,.001,[0,.131,.105],'wood',{brewing:true}),
 cyl('pour-stream',.003,.144,[0,.203,.105],'wood',{brewing:true}),
 ...Array.from({length:5},(_,i)=>box('rear-louvre-'+i,[.32,.008,.004],[0,.18+i*.03,-.242],'dark'))
];
add('espresso-machine','Single-group espresso machine',espresso,[], 'brewing','Start / stop illustrated pour','Idle/pouring fixed-state illustration: coffee stream joins the spout to liquid inside an integral demonstration cup on the drip tray. No continuous animation, extraction, pressure, heat, drink inventory or steam simulation; cup is not separately counted.');
add('pastry-display','Open two-tier pastry display',[
 ...feet(.90,.48,.06),box('base',[.90,.045,.48],[0,.0825,0],'wood'),
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('post-'+i+j,[.022,.52,.022],[x*.427,.365,z*.217],'metal'))),
 box('lower-deck',[.86,.018,.44],[0,.13,0],'cream'),box('upper-deck',[.86,.018,.44],[0,.375,0],'cream'),
 box('canopy',[.90,.025,.48],[0,.6375,0],'sage'),
 ...[.13,.375].map((h,i)=>box('price-strip-'+i,[.80,.035,.012],[0,h-.012,.226],'wood'))
],[surface('lower-deck',.139,.80,.38),surface('upper-deck',.384,.80,.38)],null,null,'Static open display; no glass, enclosure, food refrigeration, sliding doors or load simulation. Distinct from archive shelving: low serving/display decks and price rails.');
add('pedestal-table','Round pedestal café table',[
 cyl('weighted-base',.26,.035,[0,.0175,0],'dark'),cyl('column',.045,.675,[0,.3725,0],'metal'),
 cyl('top-bracket',.14,.02,[0,.70,0],'metal'),cyl('round-top',.36,.03,[0,.725,0],'wood')
],[surface('tabletop',.74,.48,.48)]);
add('dining-chair','Slatted café dining chair',[
 ...feet(.46,.46,.035),
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('leg-'+i+j,[.032,.395,.032],[x*.18,.2325,z*.18],'metal'))),
 box('seat',[.46,.025,.44],[0,.4425,0],'wood'),
 ...[-1,1].map((x,i)=>box('back-upright-'+i,[.025,.40,.025],[x*.195,.62,-.195],'metal')),
 ...[.57,.67,.77].map((h,i)=>box('back-slat-'+i,[.44,.065,.025],[0,h,-.195],'wood')),
 ...[-1,1].map((x,i)=>box('side-stretcher-'+i,[.02,.025,.36],[x*.18,.20,0],'metal'))
],[surface('seat',.455,.40,.36)],null,null,'Static human seating at 0.455 m seat height; no occupant, posture, folding, load or ergonomic certification. Independent geometry, not the original study-chair group.');
add('menu-board','Freestanding café menu board',[
 ...[-1,1].map((x,i)=>box('ground-runner-'+i,[.055,.035,.55],[x*.25,.0175,0],'dark')),
 ...[-1,1].map((x,i)=>box('upright-'+i,[.04,1.315,.04],[x*.25,.6925,0],'wood')),
 box('board',[.46,.78,.025],[0,.89,0],'dark'),
 ...[.48,1.30].map((h,i)=>box('frame-bar-'+i,[.54,.035,.04],[0,h,0],'wood')),
 box('title-rule',[.29,.023,.002],[0,1.18,.014],'paper'),
 ...Array.from({length:5},(_,i)=>[box('menu-row-'+i,[.23,.012,.002],[-.045,1.08-i*.10,.014],'paper'),box('price-mark-'+i,[.045,.012,.002],[.15,1.08-i*.10,.014],'food')]).flat()
],[],null,null,'Static freestanding sign with abstract menu marks, not readable menu text or live pricing. No editable signage UI or folding.');
add('sorting-bin','Two-stream café waste station',[
 ...feet(.90,.48,.06),box('base',[.90,.035,.48],[0,.0775,0],'wood'),
 ...[-1,1].map((v,i)=>box('end-'+i,[.025,.70,.48],[v*.4375,.445,0],'sage')),
 box('back',[.85,.70,.025],[0,.445,-.2275],'sage'),box('front',[.85,.55,.025],[0,.37,.2275],'wood'),
 box('divider',[.025,.70,.43],[0,.445,0],'sage'),
 ...[-.425,0,.425].map((x,i)=>box('slot-divider-'+i,[.025,.15,.025],[x,.72,.2275],'sage')),box('top',[.90,.025,.48],[0,.8075,0],'cream'),
 ...[-1,1].flatMap((v,i)=>[box('mouth-'+i,[.30,.105,.016],[v*.22,.715,-.18],'dark'),box('stream-label-'+i,[.09,.025,.002],[v*.22,.59,.241],i?'sage':'paper'),box('bin-floor-'+i,[.36,.016,.38],[v*.22,.12,0],'dark')])
],[surface('top',.82,.84,.42)],null,null,'Static two-stream waste receptacle with open front deposit slots and divider. No sorting intelligence, fill tracking, liner removal or opening cabinet door.');
add('queue-rail','Freestanding queue guide rail',[
 ...[-1,1].flatMap((v,i)=>[cyl('base-'+i,.16,.035,[v*.48,.0175,0],'dark'),cyl('post-'+i,.025,.865,[v*.48,.4675,0],'metal'),cyl('cap-'+i,.035,.035,[v*.48,.9175,0],'wood')]),
 box('barrier-strap',[.96,.045,.008],[0,.86,0],'sage')
],[],null,null,'Static two-post guide with strap. One assembled reusable barrier, not two separately counted posts. No retractable spool or crowd/physics simulation.');
const sink=[...feet(.70,.60,.08),box('cabinet-bottom',[.70,.025,.60],[0,.0925,0],'sage'),
 ...[-1,1].map((v,i)=>box('cabinet-side-'+i,[.025,.65,.60],[v*.3375,.43,0],'sage')),
 box('rear',[.65,.65,.025],[0,.43,-.2875],'sage'),box('static-door',[.64,.63,.025],[0,.43,.2875],'sage'),box('door-pull',[.13,.018,.025],[0,.65,.313],'metal'),
 box('basin-bottom',[.59,.02,.45],[0,.755,0],'metal'),
 ...[-1,1].map((v,i)=>box('basin-side-'+i,[.025,.135,.50],[v*.3075,.8325,0],'metal')),
 ...[-1,1].map((v,i)=>box('basin-end-'+i,[.59,.135,.025],[0,.8325,v*.2375],'metal')),
 ...[-1,1].map((v,i)=>box('rim-side-'+i,[.04,.025,.60],[v*.33,.8875,0],'cream')),
 ...[-1,1].map((v,i)=>box('rim-end-'+i,[.62,.025,.05],[0,.8875,v*.275],'cream')),
 cyl('drain',.025,.002,[0,.766,0],'dark'),cyl('tap-stem',.018,.22,[0,1.01,-.27],'metal'),
 box('tap-spout',[.03,.025,.23],[0,1.1075,-.17],'metal'),
 box('tap-lever-off',[.075,.012,.018],[.047,1.08,-.27],'dark',{running:false}),
 {...box('tap-lever-on',[.075,.012,.018],[.047,1.08,-.27],'dark',{running:true}),pivot:[-.047,0,0],rotation:[0,0,.6],rotationAxis:[0,0,1]},
 cyl('water-stream',.006,.327,[0,.9315,-.06],'sage',{running:true})];
add('service-sink','Cabinet service sink with tap',sink,[], 'running','Open / close tap illustration','Two fixed lever poses and a stream ending inside the basin. Cabinet door is static. No plumbing, water physics, pooling, drainage, hot water or hygiene certification. No certified rim support surface.');
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='cafe-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){p.position[0]-=center[0];p.position[2]-=center[1];}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'cafe-2026-11-03',measurement:{status:'estimated',note:'Original fictional café furniture/equipment. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/cafe-2026-11-03.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/cafe.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
