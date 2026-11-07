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
const extra=(id,key,label)=>extras[id]=[{id:key,type:'toggle',stateKey:key,label}];
materials.linen={color:[.71,.76,.67]};materials.mirror={color:[.64,.77,.79]};materials.air={color:[.38,.68,.76]};
const pipe=(id,r,len,pos,axis='y',mat='metal',when)=>({...cyl(id,r,len,pos,mat,when),rotation:axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]});
const shell=(w,h,d,bottom=.10)=>[...feet(w,d,bottom),box('bottom',[w,.025,d],[0,bottom+.0125,0],'wood'),box('top',[w,.025,d],[0,h-.0125,0],'wood'),box('back',[w,h-bottom-.05,.025],[0,(h+bottom)/2,-d/2+.0125],'wood'),...[-1,1].map((x,i)=>box('side-'+i,[.025,h-bottom-.05,d],[x*(w/2-.0125),(h+bottom)/2,0],'wood'))];
const drawer=(id,w,h,d,y,frontZ,travel,key='open')=>[false,true].flatMap(open=>{const p=id+(open?'-out':'-in'),z=frontZ+(open?travel:0),when={[key]:open};return [box(p+'-front',[w,h,.025],[0,y,z],'sage',when),box(p+'-floor',[w-.04,.018,d],[0,y-h/2+.015,z-d/2-.014],'wood',when),...[-1,1].map((x,i)=>box(p+'-side-'+i,[.018,h-.04,d],[x*(w/2-.03),y,z-d/2-.014],'wood',when)),box(p+'-rear',[w-.04,h-.04,.018],[0,y,z-d-.005],'wood',when),box(p+'-pull',[w*.35,.022,.027],[0,y+.025,z+.026],'metal',when)];});
add('bed','Double bed with mattress and headboard',[
 ...feet(1.64,2.04,.20),box('deck',[1.64,.08,2.04],[0,.24,0],'wood'),...[-1,1].map((x,i)=>box('side-rail-'+i,[.05,.20,2.04],[x*.80,.30,0],'wood')),box('foot-rail',[1.64,.20,.05],[0,.30,.995],'wood'),box('headboard',[1.65,.85,.065],[0,.625,-1.0375],'wood'),box('headboard-inset',[1.48,.44,.025],[0,.78,-.99],'linen'),box('mattress',[1.54,.24,1.98],[0,.42,0],'cream'),box('quilt',[1.55,.035,1.35],[0,.5575,.31],'linen'),...[-1,1].map((x,i)=>box('pillow-'+i,[.62,.10,.40],[x*.39,.59,-.72],'paper')),box('folded-throw',[1.55,.025,.30],[0,.5875,.80],'sage')
],[],null,null,'Fixed bed/mattress/pillow assembly counted as one asset. Mattress top .54 m is occupied by bedding, so no certified prop surface. No removable mattress toggle, cloth deformation, sleep or load simulation.');
add('nightstand','Bedside drawer cabinet',[
 ...shell(.46,.56,.40,.08),box('lower-shelf',[.41,.02,.36],[0,.17,0],'cream'),...drawer('drawer',.40,.18,.32,.40,.2075,.24)
],[surface('top',.56,.40,.34)],'open','Open / close bedside drawer','Drawer translates .24 m to expose storage; top stays fixed. Lower open cubby differs from lounge side tables. No automatic child attachment or collision solver.');
const wardrobe=[...shell(1.2,1.95,.60,.06),box('upper-shelf',[1.15,.025,.55],[0,1.67,0],'cream'),pipe('garment-rail',.016,1.09,[0,1.53,0],'x'),box('lower-shelf',[1.15,.025,.55],[0,.30,0],'cream')];
for(const [side,key,x,sign] of [['left','open',-.585,1],['right','rightOpen',.585,-1]])for(const open of [false,true]){const id=side+(open?'-open':'-closed'),when={[key]:open};wardrobe.push({...box(id+'-hinge',[.014,.02,.014],[x,1.015,.31],'metal',when),rotation:[0,open?-sign*Math.PI/2:0,0]},...[[id+'-door',[.57,1.81,.025],[sign*.285,0,0],'sage'],[id+'-pull',[.018,.16,.03],[sign*.51,-.03,.03],'dark']].map(([id2,size,pos,mat])=>({...box(id2,size,pos,mat,when),parent:id+'-hinge'})));}
add('wardrobe','Twin-door hanging wardrobe',wardrobe,[surface('top',1.95,1.12,.52)],'open','Open / close left wardrobe door','Two independently operated hinged doors expose full hanging bay, rail and shelf. Left/right doors rotate 90 degrees about fixed vertical hinges. No hangers/clothing simulation or tip-over certification.');extra('wardrobe','rightOpen','Open / close right wardrobe door');
add('chest','Four-drawer garment chest',[
 ...shell(.76,1.10,.45,.07),...[.19,.43,.67].flatMap((y,i)=>[box('fixed-drawer-'+i,[.70,.21,.025],[0,y,.2325],'sage'),box('fixed-pull-'+i,[.22,.022,.027],[0,y+.025,.259],'metal')]),...drawer('top-drawer',.70,.21,.37,.91,.2325,.30)
],[surface('top',1.10,.68,.37)],'open','Open / close top chest drawer','Top drawer slides .30 m; lower three drawers are fixed depictions and cannot open. Vertical folded-garment chest differs from printer credenza. No child attachment, tip-over or load simulation.');
add('dressing-desk','Seated dressing desk with shallow drawer',[
 ...feet(1.05,.45,.70),box('top',[1.05,.035,.45],[0,.7425,0],'wood'),box('rear-apron',[1,.11,.025],[0,.665,-.2075],'wood'),...[-1,1].map((x,i)=>box('side-apron-'+i,[.025,.11,.42],[x*.50,.665,0],'wood')),...drawer('cosmetic',.54,.095,.32,.665,.228,.22)
],[surface('top',.76,.97,.37)],'open','Open / close cosmetic drawer','Seated worktop with .61 m drawer-under clearance and open knee space. Shallow drawer slides .22 m; existing handheld mirror and chair are reused. No integrated mirror duplicate or sitting simulation.');
const mirror=[...[-1,1].map((x,i)=>box('foot-'+i,[.08,.035,.46],[x*.25,.0175,0],'dark')),...[-1,1].map((x,i)=>pipe('post-'+i,.019,1.21,[x*.25,.64,0],'y','wood')),pipe('axle',.014,.55,[0,.96,0],'x')];
for(const tilted of [false,true]){const id=tilted?'tilted':'upright',when={tilted};mirror.push({...box(id+'-pivot',[.02,.02,.02],[0,.96,0],'metal',when),rotation:[tilted?-.16:0,0,0],rotationAxis:[1,0,0]},...[[id+'-frame',[.46,1.30,.04],[0,0,0],'wood'],[id+'-glass',[.40,1.24,.006],[0,0,.025],'mirror']].map(([id2,size,pos,mat])=>({...box(id2,size,pos,mat,when),parent:id+'-pivot'})));}
add('mirror','Tilting full-length cheval mirror',mirror,[],'tilted','Tilt / straighten mirror','Whole-length panel tilts 0.16 rad around fixed horizontal X axle. The pale mirror surface does not reflect. Stand is floor based; no wall attachment or stability simulation.');
const rack=[...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('foot-'+i+j,[.05,.025,.07],[x*.32,.0125,z*.205],'dark'))),...[-1,1].flatMap((x,i)=>[-1,1].map((sign,j)=>({...box('cross-leg-'+i+j,[.035,Math.hypot(.40,.46),.035],[x*.32,.255,0],'wood'),rotation:[sign*Math.atan2(.40,.46),0,0]}))),...[-1,1].map((z,i)=>pipe('top-rail-'+i,.019,.72,[0,.49,z*.205],'x','wood')),...[-.24,0,.24].map((x,i)=>box('webbing-'+i,[.09,.012,.44],[x,.514,0],'dark'))];
add('luggage-rack','Fixed hotel luggage rack',rack,[-.24,0,.24].map((x,i)=>offsetSurface('strap-'+i,.52,.085,.40,x)),null,null,'Rigid crossed-leg luggage rack with three webbing supports. This model is intentionally fixed, not foldable. Individual straps are certified support strips, not a fictitious solid deck; no fabric sag or weight certification.');
const suitcase=[...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>pipe('wheel-'+i+j,.025,.035,[x*.16,.025,z*.095],'x','dark'))),box('shell-rear',[.40,.49,.025],[0,.30,-.1125],'sage'),box('shell-floor',[.40,.025,.23],[0,.0675,0],'sage'),box('shell-top',[.40,.025,.23],[0,.5325,0],'sage'),...[-1,1].map((x,i)=>box('shell-side-'+i,[.025,.49,.23],[x*.1875,.30,0],'sage')),box('lining',[.34,.40,.012],[0,.30,-.09],'linen')];
for(const open of [false,true]){const id=open?'open':'closed',when={open};suitcase.push({...box(id+'-hinge',[.015,.02,.015],[-.195,.30,.13],'metal',when),rotation:[0,open?-Math.PI/2:0,0]},...[[id+'-lid',[.39,.49,.035],[.195,0,0],'sage'],[id+'-rib-1',[.015,.40,.015],[.09,0,.025],'cream'],[id+'-rib-2',[.015,.40,.015],[.20,0,.025],'cream'],[id+'-rib-3',[.015,.40,.015],[.31,0,.025],'cream']].map(([id2,size,pos,mat])=>({...box(id2,size,pos,mat,when),parent:id+'-hinge'})));}
for(const extended of [false,true]){const y=extended?.95:.56,h=y-.54,p=extended?'extended':'retracted',when={extended};suitcase.push(...[-1,1].map((x,i)=>box(p+'-rail-'+i,[.012,h,.012],[x*.10,.54+h/2,-.09],'metal',when)),box(p+'-grip',[.23,.025,.035],[0,y,-.09],'dark',when));}
add('suitcase','Cabin suitcase with extending pull handle',suitcase,[],'open','Open / close suitcase lid','Lid swings 90 degrees around vertical hinge; separate pull handle extends .39 m. Open cavity remains visible. Wheels are fixed; no rolling, fabric packing, zipper or lock simulation.');extra('suitcase','extended','Extend / retract pull handle');
const fan=[cyl('base',.20,.035,[0,.0175,0],'dark'),pipe('mast',.021,.91,[0,.49,0]),box('controls',[.09,.08,.05],[0,.65,.02],'cream')];
for(const turned of [false,true]){const p=turned?'turned':'forward',when={turned};fan.push({...box(p+'-yaw',[.02,.02,.02],[0,1.03,0],'metal',when),rotation:[0,turned?.65:0,0]});
 const child=q=>({...q,parent:p+'-yaw'});fan.push(child(pipe(p+'-motor',.065,.13,[0,0,-.075],'z','cream',when)),child(pipe(p+'-hub',.035,.07,[0,0,.035],'z','sage',when)));
 // Open front/rear cages, no solid disk hiding the rotor.
 for(const z of [-.025,.08])for(let n=0;n<8;n++){const t=n*Math.PI/4;fan.push(child({...box(p+'-cage-'+z+'-'+n,[.007,.18,.007],[.12*Math.sin(t),.12*Math.cos(t),z],'metal',when),rotation:[0,0,-t]}));}
 for(let n=0;n<24;n++){const t=n*Math.PI/12;fan.push(child({...box(p+'-rim-'+n,[.058,.012,.12],[.21*Math.cos(t),.21*Math.sin(t),.025],'metal',when),rotation:[0,0,t+Math.PI/2]}));}
 for(const on of [false,true])for(let n=0;n<3;n++){const t=n*2*Math.PI/3+(on?.55:0);fan.push(child({...box(p+'-'+on+'-blade-'+n,[.075,.15,.012],[.09*Math.sin(t),.09*Math.cos(t),.025],'sage',{turned,on}),rotation:[0,0,-t]}));}
 for(let n=-1;n<=1;n++)fan.push(child(box(p+'-air-'+n,[.014,.014,.20],[n*.09,0,.26],'air',{turned,on:true})));
}
add('fan','Pedestal fan with swiveling head',fan,[],'on','Power fan on / off','Power changes discrete rotor phase and shows outlet direction strokes. Independent head yaw rotates the entire cage/motor/rotor assembly by .65 rad. Not continuous rotation, oscillation, cooling or airflow physics.');extra('fan','turned','Turn / center fan head');
const purifier=[...feet(.32,.28,.025),box('housing-back',[.32,.57,.025],[0,.31,-.1275],'cream'),...[-1,1].map((x,i)=>box('side-'+i,[.025,.57,.28],[x*.1475,.31,0],'cream')),box('top',[.32,.025,.28],[0,.6075,0],'cream'),box('bottom',[.32,.025,.28],[0,.0375,0],'cream'),box('front-header',[.27,.12,.025],[0,.535,.14],'sage'),...Array.from({length:7},(_,i)=>box('outlet-'+i,[.22,.006,.008],[0,.62,-.09+i*.03],'dark')),box('off-indicator',[.04,.014,.008],[0,.55,.158],'dark',{on:false}),box('on-indicator',[.04,.014,.008],[0,.55,.158],'air',{on:true}),...[-.08,0,.08].map((x,i)=>box('air-'+i,[.008,.12,.008],[x,.69,0],'air',{on:true}))];
for(const service of [false,true]){const p=service?'service':'closed',z=service?.20:0,when={service};purifier.push(box(p+'-filter',[.25,.34,.025],[0,.27,.10+z],'linen',when),...Array.from({length:8},(_,i)=>box(p+'-pleat-'+i,[.008,.32,.025],[-.105+i*.03,.27,.12+z],'paper',when)),box(p+'-grille-frame',[.27,.39,.018],[0,.27,.145+z],'sage',when),...Array.from({length:9},(_,i)=>box(p+'-grille-slot-'+i,[.22,.01,.006],[0,.11+i*.04,.157+z],'dark',when)))}
add('air-purifier','Floor air purifier with filter cassette',purifier,[],'on','Power purifier on / off','Power has outlet-air strokes and a status indicator; separate filter cassette extends .20 m for service. Service access is not filtration operation. No measured clean-air rate, particulate removal, sensor, fan animation or electrical interlock.');extra('air-purifier','service','Pull / close filter cassette');
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='bedroom-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const extra=extras[short]||[];
 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'bedroom-2026-11-07',measurement:{status:'estimated',note:'Original fictional bedroom furniture/equipment. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/bedroom-2026-11-07.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/bedroom.html'};
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
