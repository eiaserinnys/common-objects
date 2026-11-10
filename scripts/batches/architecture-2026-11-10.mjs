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


const extras={},motion={},mountSurfaces={},anchors={};
materials.steel={color:[.62,.68,.65]};materials.glass={color:[.46,.65,.70]};materials.warm={color:[1,.84,.42]};
const rect=(w,h)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
const mounting=(id,kind,position,polygon)=>({id,kind,position,polygon,normal:kind==='wall'?[0,0,1]:[0,-1,0]});
const wallRegion=(id,x,y,z,w,h)=>mounting(id,'wall',[x,y,z],rect(w,h));
const anchor=(id,kind,position,w,h)=>({...mounting(id,kind,position,rect(w,h)),normal:kind==='wall'?[0,0,-1]:[0,1,0]});
const pipe=(id,r,len,pos,axis='y',mat='metal',when)=>({...cyl(id,r,len,pos,mat,when),rotation:axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]});
const range=(id,stateKey,axis,values,units,parts)=>motion[id]=[{stateKey,axis,values,units,parts,mode:'discrete-endpoints'}];
add('wall','Solid interior wall panel',[box('wall-core',[2.4,2.4,.12],[0,1.2,0],'cream'),box('baseboard',[2.4,.09,.015],[0,.045,.0675],'wood')],[],null,null,'Fixed 2.4 m interior wall module. Front installation region excludes baseboard and edge margins. No building-code, structural, acoustic or fire rating; no automatic wall joining or cutaways.');
mountSurfaces.wall=[wallRegion('front',0,1.25,.06,2.30,2.26)];
const door=[...[-1,1].map((x,i)=>box('jamb-wall-'+i,[.15,2.4,.16],[x*.525,1.2,0],'cream')),box('header-wall',[.90,.28,.16],[0,2.26,0],'cream'),...[-1,1].map((x,i)=>box('lining-'+i,[.025,2.12,.18],[x*.4375,1.06,0],'wood')),box('lining-top',[.90,.025,.18],[0,2.1075,0],'wood')];
for(const open of [false,true]){const p=open?'open':'closed',when={open};door.push({...box(p+'-hinge',[.01,.01,.01],[-.4225,1.055,.025],'metal',when),rotation:[0,open?-Math.PI/2:0,0]},...[[p+'-leaf',[.84,2.06,.04],[.42,0,0],'sage'],[p+'-inset',[.66,1.75,.008],[.42,.04,.024],'cream'],[p+'-lever',[.12,.022,.03],[.73,-.10,.05],'metal']].map(([id,size,pos,mat])=>({...box(id,size,pos,mat,when),parent:p+'-hinge'})));}
add('doorway','Hinged door and doorway wall module',door,[],'open','Open / close entry door','Complete door leaf, inset and lever rotate 90 degrees about vertical hinge; wall/header remain fixed. Leaf bottom .025 m clears floor. Door and wall are one reusable module, not separately counted. No latch, lock, egress or safety certification.');range('doorway','open',[0,1,0],[0,-Math.PI/2],'rad',['closed-hinge','open-hinge']);
mountSurfaces.doorway=[wallRegion('switch-jamb',-.525,1.15,.08,.12,1.9)];
const window=[box('lower-wall',[2.4,.85,.12],[0,.425,0],'cream'),box('upper-wall',[2.4,.30,.12],[0,2.25,0],'cream'),...[-1,1].map((x,i)=>box('side-wall-'+i,[.35,1.25,.12],[x*1.025,1.475,0],'cream')),...[.85,2.1].map((y,i)=>box('track-'+i,[1.72,.035,.18],[0,y,0],'wood')),...[-1,1].map((x,i)=>box('frame-side-'+i,[.035,1.25,.18],[x*.85,1.475,0],'wood'))];
const sash=(p,x,z,when)=>[box(p+'-glass',[.75,1.13,.008],[x,1.475,z],'glass',when),...[-1,1].map((sign,i)=>box(p+'-vertical-'+i,[.025,1.18,.025],[x+sign*.39,1.475,z],'sage',when)),...[.885,2.065].map((y,i)=>box(p+'-horizontal-'+i,[.805,.025,.025],[x,y,z],'sage',when)),box(p+'-pull',[.018,.12,.025],[x+.32,1.475,z+.025],'dark',when)];
window.push(...sash('fixed',.405,-.025));for(const open of [false,true])window.push(...sash(open?'slid':'closed',open?.395:-.405,.025,{open}));
add('window','Sliding window and apertured wall module',window,[],'open','Slide / close left window sash','Left complete sash translates .80 m on the forward track, overlapping the fixed rear sash while exposing an actual wall aperture. Blue panels are opaque stylized glazing, not transparent rendering. No weather seal, glass physics or building certification.');range('window','open',[1,0,0],[0,.80],'m',['closed-glass','slid-glass']);
mountSurfaces.window=[wallRegion('blind-header',0,2.25,.06,1.94,.24)];
add('beam-bay','Exposed post-and-beam interior bay',[
 ...[-1,1].map((x,i)=>box('post-'+i,[.14,2.40,.20],[x*1.38,1.20,0],'wood')),box('beam',[2.9,.15,.20],[0,2.475,0],'wood'),...[-1,1].map((x,i)=>box('joint-plate-'+i,[.14,.18,.012],[x*1.38,2.39,.106],'metal'))
],[],null,null,'Fixed floor-supported posts and overhead beam. Underside provides a real downward mounting plane. Open bay is not a roof or full ceiling enclosure; no span/load/structural certification. Posts and beam count once.');
mountSurfaces['beam-bay']=[mounting('soffit','soffit',[0,2.40,0],rect(2.60,.18))];
const shelf=[box('deck',[.85,.035,.28],[0,.2825,.125],'wood'),...[-1,1].flatMap((x,i)=>[box('back-plate-'+i,[.05,.27,.015],[x*.30,.135,-.0075],'metal'),box('arm-'+i,[.035,.035,.25],[x*.30,.245,.11],'metal'),{...box('brace-'+i,[.025,.29,.025],[x*.30,.145,.095],'metal'),rotation:[-.65,0,0]}])];
add('shelf','Bracketed wall shelf',shelf,[offsetSurface('top',.30,.79,.22,0,.125)],null,null,'Fixed shelf with rear plates, horizontal arms and diagonal braces. Explicit wall anchor carries the shelf and its separately supported contents. No load rating, fixings simulation or general moving-part attachment.');
anchors.shelf=[anchor('back','wall',[0,.135,-.015],.65,.27)];
const sconce=[box('back-plate',[.11,.30,.02],[0,.15,-.05],'metal'),pipe('arm',.012,.13,[0,.15,.005],'z','metal'),cyl('shade',.10,.18,[0,.31,.08],'sage',undefined,.075)];
for(const on of [false,true])sconce.push(cyl(on?'lit-diffuser':'dark-diffuser',.092,.009,[0,.216,.08],on?'warm':'paper',{on}));
add('sconce','Wall-mounted downlight sconce',sconce,[],'on','Switch sconce on / off','Fixed wall plate, arm and shade with a visibly changing diffuser. Installation uses rear plate contact; no cast light, electrical circuit or wall-load certification.');anchors.sconce=[anchor('back','wall',[0,.15,-.06],.11,.30)];
const pendant=[{...cyl('shade',.20,.20,[0,.10,0],'sage',undefined,.07),geometry:{type:'cylinder',radiusBottom:.20,radiusTop:.07,height:.20,segments:24,openBottom:true}},pipe('cord',.006,.65,[0,.525,0],'y','dark'),cyl('canopy',.06,.035,[0,.8675,0],'metal')];
for(const on of [false,true])pendant.push(cyl(on?'lit-bulb':'dark-bulb',.04,.055,[0,.07,0],on?'warm':'paper',{on}));
add('pendant','Suspended pendant with ceiling canopy',pendant,[],'on','Switch pendant on / off','Canopy fixes to a downward soffit while cord and open-bottom shade hang below it. Bulb appearance toggles; no cable dynamics, real illumination or electrical simulation. Bottom-origin source remains unchanged during installation.');anchors.pendant=[anchor('top','soffit',[0,.885,0],.12,.12)];
const radiator=[box('back-panel',[.86,.56,.025],[0,.30,-.045],'cream'),...Array.from({length:12},(_,n)=>box('rib-'+n,[.048,.56,.075],[-.385+n*.07,.30,.005],'paper')),...[-1,1].flatMap((x,i)=>[box('mount-plate-'+i,[.05,.60,.018],[x*.30,.30,-.0665],'metal'),pipe('manifold-'+i,.022,.86,[0,.04+i*.52,.005],'x','cream')]),pipe('valve-body',.025,.10,[.47,.50,.005],'x','metal')];
for(const high of [false,true]){const p=high?'high':'low',when={high};radiator.push(pipe(p+'-knob',.035,.04,[.535,.50,.005],'x','cream',when),{...box(p+'-mark',[.004,.040,.005],[.557,.50,.005],'dark',when),rotation:[high?1.2:0,0,0],rotationAxis:[1,0,0]});}
add('radiator','Wall panel radiator with thermostat',radiator,[],'high','Turn thermostat high / low','Thermostat witness mark rotates 1.2 rad about X; panel/manifolds remain fixed. This is valve adjustment only, not heating, water flow or temperature simulation. No plumbing or thermal/load certification.');anchors.radiator=[anchor('back','wall',[0,.30,-.0755],.65,.60)];range('radiator','high',[1,0,0],[0,1.2],'rad',['low-mark','high-mark']);
const blind=[box('headrail',[1.82,.10,.12],[0,1.35,0],'cream'),...[-1,1].map((x,i)=>box('bracket-'+i,[.05,.10,.02],[x*.865,1.35,-.07],'metal')),pipe('roller',.035,1.73,[0,1.30,.015],'x','wood')];
for(const raised of [false,true]){const p=raised?'raised':'lowered',bottom=raised?1.14:0,when={raised};blind.push(box(p+'-cloth',[1.70,1.28-bottom,.008],[0,(1.28+bottom)/2+.015,.02],'sage',when),box(p+'-bottom-bar',[1.73,.03,.028],[0,bottom+.015,.02],'metal',when));}
add('blind','Retracting roller blind',blind,[],'raised','Raise / lower window blind','Cloth length shortens and bottom bar rises 1.14 m; headrail, brackets and roller remain attached. Endpoints only, no cloth/cord mechanics. Active raised geometry no longer touches local Y=0; immutable origin remains the lowered-state bottom contact center.');anchors.blind=[anchor('back','wall',[0,1.35,-.08],1.78,.10)];range('blind','raised',[0,1,0],[0,1.14],'m',['lowered-bottom-bar','raised-bottom-bar']);
const rocker=[box('backplate',[.085,.09,.012],[0,.045,0],'cream')];
for(const on of [false,true])rocker.push({...box(on?'on-rocker':'off-rocker',[.055,.062,.012],[0,.045,.014],'sage',{on}),rotation:[on?.16:-.16,0,0],rotationAxis:[1,0,0]});
add('switch','Wall rocker switch',rocker,[],'on','Press rocker on / off','Rocker physically tilts between +/- .16 rad on X. Standalone interface; it does not control other light instances or simulate wiring, voltage or electrical certification.');anchors.switch=[anchor('back','wall',[0,.045,-.006],.085,.09)];range('switch','on',[1,0,0],[-.16,.16],'rad',['off-rocker','on-rocker']);
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='architecture-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const extra=extras[short]||[];
 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'architecture-2026-11-10',measurement:{status:'estimated',note:'Original fictional architecture furniture/equipment. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/architecture-2026-11-10.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/architecture.html'};
 a.motionRanges=motion[short]||[];
 a.installationSurfaces=(mountSurfaces[short]||[]).map(s=>({...s,position:[s.position[0]-center[0],s.position[1],s.position[2]-center[1]]}));
 a.mountAnchors=(anchors[short]||[]).map(s=>({...s,position:[s.position[0]-center[0],s.position[1],s.position[2]-center[1]]}));
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
