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


const extras={};
materials.water={color:[.36,.70,.78]};materials.mirror={color:[.67,.78,.79]};materials.heat={color:[.91,.43,.20]};
const extra=(id,key,label)=>extras[id]=[{id:key,type:'toggle',stateKey:key,label}];
const pipe=(id,r,len,pos,axis='y',mat='metal',when)=>({...cyl(id,r,len,pos,mat,when),rotation:axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]});
// Rectangular hollow bowls have real interior floors and rims, never a solid blue cap concealing a solid body.
const bowl=(id,w,d,h,y,z=0)=>[
 box(id+'-floor',[w-.04,.035,d-.04],[0,y+.0175,z],'cream'),
 ...[-1,1].flatMap((v,i)=>[box(id+'-side-'+i,[.035,h,d],[v*(w/2-.0175),y+h/2,z],'cream'),box(id+'-end-'+i,[w-.07,h,.035],[0,y+h/2,z+v*(d/2-.0175)],'cream')])];
const tap=(id,y,z,key='flow',drop=.27)=>[cyl(id+'-stem',.018,.18,[0,y+.09,z],'metal'),pipe(id+'-spout',.018,.18,[0,y+.18,z+.075],'z'),box(id+'-lever',[.085,.012,.022],[.025,y+.19,z],'dark'),cyl(id+'-stream',.009,drop,[0,y+.17-drop/2,z+.15],'water',{[key]:true})];
const toilet=[box('foot',[.28,.06,.46],[0,.03,0],'cream'),box('pedestal',[.25,.23,.36],[0,.175,0],'cream'),...bowl('bowl',.40,.49,.12,.29,.055),box('cistern',[.39,.43,.16],[0,.585,-.23],'cream'),box('tank-lid',[.41,.025,.18],[0,.8125,-.23],'cream'),box('flush-button',[.05,.008,.03],[.09,.829,-.23],'metal'),box('water-rest',[.27,.007,.28],[0,.335,.055],'water',{flush:false}),box('water-flush',[.27,.007,.28],[0,.355,.055],'water',{flush:true}),...[-1,1].map((x,i)=>box('flush-jet-'+i,[.012,.08,.30],[x*.16,.365,.055],'water',{flush:true}))];
for(const open of [false,true]){const p=open?'open':'closed';toilet.push({...box(p+'-hinge',[.04,.02,.02],[0,.425,-.19],'metal',{open}),rotation:[open?-Math.PI/2:0,0,0],rotationAxis:[1,0,0]}, {...box(p+'-lid',[.40,.025,.49],[0,.015,.245],'cream',{open}),parent:p+'-hinge'});}
add('toilet','Close-coupled toilet with hinged lid',toilet,[],'open','Open / close toilet lid','Lid rotates 90 degrees around rear X hinge. Separate flush button toggles rim jets and water-level endpoints; inspect with lid open. Illustrative flush, no timer, waste, fluid flow or plumbing simulation.');extra('toilet','flush','Start / stop illustrated flush');
const vanity=[...feet(1.20,.55,.10),box('bottom',[1.20,.03,.55],[0,.115,0],'wood'),box('rear',[1.20,.66,.025],[0,.46,-.2625],'wood'),...[-1,1].map((x,i)=>box('side-'+i,[.03,.66,.55],[x*.585,.46,0],'wood')),box('front-plinth',[1.14,.12,.025],[0,.20,.26],'sage'),...bowl('basin',.48,.40,.16,.69),...[-1,1].map((x,i)=>box('dry-counter-'+i,[.36,.035,.55],[x*.42,.8325,0],'cream')),box('back-counter',[.48,.035,.075],[0,.8325,-.2375],'cream'),box('front-rim',[.48,.035,.075],[0,.8325,.2375],'cream'),...tap('tap',.85,-.23)];
for(const open of [false,true]){const z=open?.30:0,w={open},p=open?'out':'in';vanity.push(box(p+'-drawer-front',[1.12,.31,.03],[0,.41,.28+z],'sage',w),box(p+'-drawer-floor',[1.08,.025,.45],[0,.2675,z],'wood',w),...[-1,1].map((x,i)=>box(p+'-drawer-side-'+i,[.02,.22,.45],[x*.53,.39,z],'wood',w)),box(p+'-handle',[.30,.025,.028],[0,.48,.31+z],'metal',w));}
add('vanity','Wide bathroom vanity with recessed basin',vanity,[offsetSurface('left-counter',.85,.30,.47,-.42),offsetSurface('right-counter',.85,.30,.47,.42)],'open','Pull / close vanity drawer','Wide domestic washstand with inset bowl and two dry counters, unlike café service sink. Drawer travels .30 m below basin; independent tap flow. No plumbing, fluid simulation or child attachment.');extra('vanity','flow','Turn basin tap on / off');
const shower=[box('tray',[1,.06,1],[0,.03,0],'cream'),box('drain',[.11,.006,.11],[.24,.063,.20],'dark'),...[-1,1].map((x,i)=>box('side-panel-'+i,[.025,1.98,1],[x*.4875,1.05,0],'sage')),box('rear-panel',[.95,1.98,.025],[0,1.05,-.4875],'sage'),box('top-front-track',[1,.035,.05],[0,2.065,.475],'metal'),box('bottom-front-track',[1,.025,.05],[0,.0725,.475],'metal'),box('fixed-front-panel',[.46,1.96,.018],[-.25,1.06,.48],'mirror'),pipe('riser',.014,1.65,[.30,1.10,-.44]),pipe('head-arm',.014,.36,[.30,1.925,-.27],'z'),cyl('shower-head',.105,.022,[.30,1.91,-.10],'metal')];
for(const open of [false,true]){const x=open?-.24:.24,w={open},p=open?'open':'closed';shower.push(box(p+'-panel',[.46,1.96,.018],[x,1.06,.45],'mirror',w),box(p+'-pull',[.02,.18,.035],[x+.15,1.05,.48],'dark',w));}
for(let n=0;n<5;n++)shower.push(cyl('jet-'+n,.004,1.82,[.24+n*.03,.98,-.10],'water',{flow:true}));
add('shower','Sliding-panel shower enclosure',shower,[],'open','Slide shower door open / closed','Door slides .48 m laterally, exposing right-hand entry. Independent jets below fixed shower head. Opaque pale panels deliberately avoid unsupported transparency. No seals, fluid physics or continuous animation.');extra('shower','flow','Turn shower jets on / off');
add('bathtub','Freestanding deep bathtub',[
 box('plinth',[1.48,.07,.60],[0,.035,0],'dark'),...bowl('bath',1.70,.78,.48,.07),box('drain',[.06,.006,.06],[.56,.108,0],'metal'),box('filled-water',[1.61,.012,.69],[0,.40,0],'water',{filled:true}),...[-1,1].map((x,i)=>box('long-rim-'+i,[1.70,.035,.06],[0,.5675,x*.36],'cream')),box('tap-mount',[.14,.08,.14],[.60,.59,-.29],'cream'),...tap('bath-tap',.63,-.29,'filled',.41).map(p=>({...p,position:[p.position[0]+.60,p.position[1],p.position[2]]}))
],[],'filled','Fill / drain bath illustration','Filled/drained endpoints expose an actual hollow cavity; the filled endpoint includes spout stream. Not a timed fill, overflow or temperature simulation. No removable tub shell.');
add('bidet','Floor-standing ceramic bidet',[
 box('base',[.25,.07,.39],[0,.035,0],'cream'),box('pedestal',[.22,.20,.31],[0,.17,0],'cream'),...bowl('wash-bowl',.38,.59,.14,.27),...tap('bidet-tap',.41,-.25),box('drain',[.035,.005,.035],[0,.308,.08],'dark')
],[],'flow','Turn bidet tap on / off','Low independent washing fixture with visible tap stream into open bowl. No toilet cistern or lid; no fluid or sanitary engineering simulation.');
const cabinet=[...feet(.65,.36,.08),box('bottom',[.65,.025,.36],[0,.0925,0],'wood'),box('top',[.65,.025,.36],[0,1.6375,0],'wood'),box('back',[.65,1.52,.02],[0,.865,-.17],'wood'),...[-1,1].map((x,i)=>box('side-'+i,[.025,1.52,.36],[x*.3125,.865,0],'wood')),...[.42,.82,1.22].map((y,i)=>box('shelf-'+i,[.60,.025,.32],[0,y,0],'cream'))];
for(const open of [false,true]){const p=open?'open':'closed',w={open};cabinet.push({...box(p+'-hinge',[.018,.02,.018],[-.31,.87,.19],'metal',w),rotation:[0,open?-Math.PI/2:0,0]},...[[p+'-door',[.61,1.50,.022],[.305,0,0],'sage'],[p+'-mirror',[.55,1.40,.005],[.305,0,.015],'mirror'],[p+'-pull',[.018,.12,.025],[.55,-.15,.03],'dark']].map(([id,size,pos,mat])=>({...box(id,size,pos,mat,w),parent:p+'-hinge'})));}
add('mirror-cabinet','Floor-standing mirrored hygiene cabinet',cabinet,[surface('top',1.65,.57,.28),{...surface('middle-shelf',.8325,.54,.27),availableWhen:{open:true}}],'open','Open / close mirrored door','Tall narrow bathroom storage with mirror-faced hinged door. Door rotates 90 degrees around vertical hinge to expose shelves. Mirror is a colored surface, not rendered reflection. Floor standing; no wall mount contract.');
add('towel-warmer','Freestanding electric towel warmer',[
 ...[-1,1].map((x,i)=>box('foot-'+i,[.10,.03,.38],[x*.27,.015,0],'dark')),...[-1,1].map((x,i)=>pipe('upright-'+i,.024,1.10,[x*.27,.58,0])),...[0,1,2,3,4,5].map(n=>pipe('rail-'+n,.018,.54,[0,.28+n*.15,0],'x')),
 box('controller',[.10,.12,.065],[.27,.18,.015],'dark'),box('switch-off',[.04,.025,.008],[.27,.20,.052],'cream',{on:false}),box('switch-on',[.04,.025,.008],[.27,.18,.052],'heat',{on:true}),...[-.15,0,.15].map((x,i)=>box('heat-indicator-'+i,[.012,.12,.012],[x,1.18,0],'heat',{on:true}))
],[],'on','Power towel warmer on / off','Controller changes and three heat-symbol strokes appear above rails. Symbolic electrical heating indication, not a measured temperature, drying process or cast glow. Clothes are not attached or simulated.');
add('shower-seat','Fixed draining shower seat',[
 ...feet(.48,.42,.04),...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>pipe('leg-'+i+j,.018,.40,[x*.19,.24,z*.16]))),...[-.18,-.09,0,.09,.18].map((x,i)=>box('seat-slat-'+i,[.075,.035,.42],[x,.4575,0],'cream')),pipe('left-brace',.012,.34,[-.19,.22,0],'z'),pipe('right-brace',.012,.34,[.19,.22,0],'z')
],[],null,null,'Rigid waterproof-style slatted seat for wet-area rest; intentionally no folding or height adjustment. Gaps drain visually; no load, slip-resistance or accessibility certification. Distinct from long utility changing bench and upholstered seating.');
add('grab-rail','Floor-anchored assistance rail',[
 ...[-1,1].flatMap((z,i)=>[box('anchor-plate-'+i,[.22,.018,.18],[0,.009,z*.32],'metal'),pipe('post-'+i,.023,.79,[0,.413,z*.32]),...[-1,1].map((x,j)=>cyl('bolt-'+i+j,.012,.008,[x*.07,.022,z*.32],'dark'))]),pipe('grip',.027,.70,[0,.81,0],'z'),pipe('mid-brace',.016,.64,[0,.46,0],'z')
],[],null,null,'Rigid floor-bolted assistance handrail. Static by design, no foldaway joint. Installation bolts are depicted but anchoring and structural strength are not simulated or certified; it is not a freestanding balance aid.');
add('hand-dryer','Pedestal-mounted automatic hand dryer',[
 box('base',[.42,.035,.40],[0,.0175,0],'dark'),box('post',[.12,.80,.12],[0,.435,-.06],'metal'),box('housing',[.34,.38,.23],[0,1.045,0],'cream'),box('front',[.29,.27,.015],[0,1.06,.122],'sage'),box('outlet',[.20,.018,.12],[0,.845,.02],'dark'),box('sensor',[.03,.012,.03],[.12,.846,.05],'dark'),box('indicator-off',[.05,.02,.008],[0,1.16,.134],'dark',{on:false}),box('indicator-on',[.05,.02,.008],[0,1.16,.134],'water',{on:true}),...[-.06,0,.06].map((x,i)=>box('air-jet-'+i,[.012,.22,.012],[x,.72,.03],'water',{on:true}))
],[],'on','Start / stop dryer blower illustration','Blower state has visible air-direction strokes below nozzle and a power indicator. Explicit manual preview trigger for an automatic dryer; no hand detection, moisture, fan rotation or airflow physics. Pedestal mount avoids unimplemented wall attachment.');
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='sanitary-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const extra=extras[short]||[];
 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'sanitary-2026-11-06',measurement:{status:'estimated',note:'Original fictional sanitary furniture/equipment. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/sanitary-2026-11-06.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/sanitary.html'};
 for(const action of extra){a.state[action.stateKey]=false;a.actions.push(action);}
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
