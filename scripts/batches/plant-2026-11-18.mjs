// Reproducible original metric geometry; no external source dimensions claimed.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {mesh,point,worldParts} from '../../renderer/geometry.js';
import {svgScene} from '../../renderer/svg.js';
const materials={cream:{color:[.88,.84,.72]},sage:{color:[.30,.52,.53]},wood:{color:[.64,.43,.27]},metal:{color:[.38,.43,.40]},food:{color:[.82,.62,.35]},dark:{color:[.16,.24,.20]},paper:{color:[.96,.93,.83]}};
const box=(id,size,position,material='cream',visibleWhen)=>({id,parent:null,position,rotation:[0,0,0],pivot:[0,0,0],rotationAxis:[0,1,0],joint:'fixed',state:{},geometry:{type:'box',size},material,...visibleWhen&&{visibleWhen}});
const cyl=(id,r,h,position,material='cream',visibleWhen,top=r)=>({...box(id,[],position,material,visibleWhen),geometry:{type:'cylinder',radiusBottom:r,radiusTop:top,height:h,segments:r<.04?8:16}});
const surface=(id,height,w,d)=>({id,height,polygon:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],normal:[0,1,0],note:'Inset usable rectangle; no load rating or attachment physics.'});
const feet=(w,d,h)=>[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('foot-'+i+j,[.045,h,.045],[x*(w/2-.05),h/2,z*(d/2-.05)],'dark')));
const entries=[];
const add=(id,name,parts,surfaces=[],key=null,label=null,note='Static furniture; no moving joints, load certification or physics.')=>entries.push([id,name,key,label,parts,surfaces,note]);
const offsetSurface=(id,h,w,d,x=0,z=0)=>({...surface(id,h,w,d),polygon:surface(id,h,w,d).polygon.map(([a,b])=>[a+x,b+z])});


const extras={},motion={},mountSurfaces={},anchors={},configs={};
materials.steel={color:[.62,.68,.65]};materials.glass={color:[.46,.65,.70]};materials.red={color:[.78,.32,.22]};materials.green={color:[.38,.56,.28]};
const pipe=(id,r,len,pos,axis='y',mat='metal',when)=>({...cyl(id,r,len,pos,mat,when),rotation:axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]});
const range=(id,stateKey,axis,values,units,parts)=>motion[id]=[{stateKey,axis,values,units,parts,mode:'discrete-endpoints'}];
const transition=(id,label,requires,set,blockedMessage)=>({id,label,type:'transition',requires,set,blockedMessage});
const toggle=(id,key,label)=>({id,type:'toggle',stateKey:key,label});
// Tube joining two metric endpoints, cylinder native Y axis.
const tube=(id,a,b,r=.018,mat='metal',when)=>{const d=b.map((v,k)=>v-a[k]),len=Math.hypot(...d);return {...cyl(id,r,len,a.map((v,k)=>(v+b[k])/2),mat,when),rotation:[Math.atan2(d[2],Math.hypot(d[0],d[1])),0,-Math.atan2(d[0],d[1])]};};
const ring=(id,center,r,width,mat='dark')=>Array.from({length:24},(_,n)=>{const a=n*Math.PI/12;return {...box(id+'-'+n,[width,2*r*Math.tan(Math.PI/24)+.002,.025],[center[0],center[1]+r*Math.sin(a),center[2]+r*Math.cos(a)],mat),rotation:[-a,0,0]};});
const wheeledFeet=(w,d)=>[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>pipe('caster-'+i+j,.035,.025,[x*w/2,.035,z*d/2],'x','dark')));


materials.copper={color:[.65,.36,.22]};materials.blue={color:[.28,.47,.64]};
const gauge=(id,x,y,z,key)=>[pipe(id+'-dial',.058,.018,[x,y,z],'z','cream'),... [false,true].map(on=>({...box(id+(on?'-high':'-low'),[.008,.075,.006],[x,y+.025,z+.012],'dark',{[key]:on}),pivot:[0,-.025,0],rotation:[0,0,on?-.7:.7],rotationAxis:[0,0,1]}))];
const wallAnchor=(id,x,y,z,w,h)=>({id,kind:'wall',position:[x,y,z],normal:[0,0,-1],polygon:[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]});
// Floor air handler: filter bank and axial blower in one industrial housing.
const ahu=[...feet(1.5,.68,.12),box('base',[1.5,.06,.68],[0,.15,0],'metal'),box('back',[1.5,.92,.025],[0,.64,-.3275],'sage'),box('top',[1.5,.035,.68],[0,1.1175,0],'sage'),...[-.7325,.7325].map((x,n)=>box('side-'+n,[.035,.92,.68],[x,.64,0],'sage')),box('filter-divider',[.025,.92,.68],[-.25,.64,0],'metal'),box('filter-panel',[.43,.80,.07],[-.50,.64,.28],'cream'),box('fan-mount',[.95,.055,.44],[.25,.62,-.10],'metal'),pipe('motor',.11,.23,[.25,.64,-.10],'z','dark'),pipe('fan-hub',.065,.10,[.25,.64,.12],'z','metal')];
for(let n=0;n<8;n++)ahu.push(box('filter-pleat-'+n,[.025,.75,.015],[-.68+n*.052,.64,.3225],'metal'));
for(const stepped of [false,true])for(let n=0;n<5;n++){const t=n*2*Math.PI/5+(stepped?.28:0);ahu.push({...box((stepped?'step':'rest')+'-blade-'+n,[.10,.36,.025],[.25,.64,.18],'steel',{stepped}),pivot:[0,-.15,0],position:[.25,.79,.18],rotation:[0,0,t],rotationAxis:[0,0,1]});}
for(const x of [-.20,.02,.24,.46,.68])ahu.push(box('guard-'+x,[.012,.85,.012],[x,.64,.34],'metal'));
for(const y of [.22,1.06])ahu.push(box('guard-rail-'+y,[.94,.018,.025],[.25,y,.33],'metal'));
for(const powered of [false,true])ahu.push(box(powered?'power-on':'power-off',[.06,.025,.006],[-.50,1.06,.345],powered?'green':'dark',{powered}));
ahu.push(box('indicator-bracket',[.12,.06,.04],[-.50,1.06,.325],'metal'));
add('air-handler','Filter and blower air-handling unit',ahu,[],null,null,'Power indicator and guarded manual fan phase step. Retained blades rotate .28 rad while the filter and grille stay fixed. No elapsed motor, airflow, temperature, duct-network or filtration physics.');configs['air-handler']={state:{powered:false,stepped:false},actions:[toggle('toggle','powered','Power indicator on / off'),{...toggle('step','stepped','Step fan rotor phase'),requires:{powered:true},blockedMessage:'Power indicator must be on before stepping fan.'}]};range('air-handler','stepped',[0,0,1],[0,.28],'rad',['rest-blade-0','step-blade-0']);
// Insulated hot water cylinder: closed vessel with two color-coded top connections.
const heater=[cyl('base',.30,.08,[0,.04,0],'dark'),cyl('tank',.30,1.35,[0,.755,0],'cream'),cyl('top-dome',.30,.12,[0,1.49,0],'cream',undefined,.23),box('control-block',[.16,.18,.09],[0,.68,.29],'sage')];
for(const [n,x,mat] of [[0,-.15,'blue'],[1,.15,'red']])heater.push(pipe('pipe-'+n,.022,.18,[x,1.60,0],'y','copper'),cyl('collar-'+n,.035,.025,[x,1.55,0],mat));
heater.push(...gauge('thermostat',0,.68,.342,'high'));
add('water-heater','Insulated domestic hot-water cylinder',heater,[],'high','Low / high thermostat setting','Thermostat pointer rotates between two symbolic settings. Cylinder, hot/cold unions and insulation are retained. No heating, real temperature, stored-volume measurement, pressure relief or plumbing simulation.');range('water-heater','high',[0,0,1],[.7,-.7],'rad',['thermostat-low','thermostat-high']);
// Two centrifugal booster pumps, common manifolds and isolated pressure display.
const pumps=[box('skid',[1.12,.08,.68],[0,.04,0],'metal'),pipe('inlet-manifold',.04,1.0,[0,.22,.23],'x','blue'),pipe('outlet-manifold',.035,1.0,[0,.72,.23],'x','copper')];
for(const [n,x] of [[0,-.30],[1,.30]]){pumps.push(box('pump-foot-'+n,[.28,.12,.37],[x,.14,-.04],'metal'),pipe('motor-'+n,.12,.30,[x,.30,-.10],'z','sage'),pipe('volute-'+n,.145,.12,[x,.30,.12],'z','blue'),pipe('riser-'+n,.028,.43,[x,.505,.23],'y','copper'));for(let j=0;j<5;j++)pumps.push(box('motor-fin-'+n+'-'+j,[.018,.19,.27],[x-.10+j*.05,.30,-.1],'metal'));}
for(const [n,x] of [[0,-.30],[1,.30]])pumps.push(tube('inlet-elbow-'+n,[x,.22,.23],[x,.30,.16],.028,'blue'),pipe('outlet-nozzle-'+n,.028,.12,[x,.40,.19],'z','copper'));
pumps.push(pipe('gauge-stem',.018,.13,[0,.785,.23],'y','metal'),...gauge('pressure',0,.86,.25,'charged'),pipe('valve-stem',.018,.10,[-.46,.28,.23],'y','metal'));
for(const open of [false,true])pumps.push({...box(open?'valve-open':'valve-closed',[.17,.018,.025],[-.46,.339,.23],'red',{open}),rotation:[0,open?0:Math.PI/2,0],rotationAxis:[0,1,0]});
add('booster-skid','Twin-pump water booster skid',pumps,[],null,null,'Open inlet lever, then pressurize the symbolic gauge; release pressure before closing inlet. Two pumps are one assembled source. No water, motor timing, pipe connectivity, actual pressure or safety logic certification.');configs['booster-skid']={state:{open:false,charged:false},actions:[{...toggle('toggle','open','Open / close inlet valve'),requires:{charged:false},blockedMessage:'Release illustrative pressure before closing inlet.'},transition('charge','Illustrate pressure rise',{open:true,charged:false},{charged:true},'Open inlet and release previous pressure first.'),transition('release','Release illustrative pressure',{}, {charged:false},'')],stateRules:[{when:{charged:true},must:{open:true},message:'Illustrative pressure requires open inlet.'}]};motion['booster-skid']=[{stateKey:'open',axis:[0,1,0],values:[Math.PI/2,0],units:'rad',parts:['valve-closed','valve-open'],mode:'discrete-endpoints'},{stateKey:'charged',axis:[0,0,1],values:[.7,-.7],units:'rad',parts:['pressure-low','pressure-high'],mode:'discrete-endpoints'}];
const expansion=[cyl('pedestal',.18,.12,[0,.06,0],'metal'),cyl('lower-dome',.18,.15,[0,.195,0],'red',undefined,.28),cyl('shell',.28,.46,[0,.50,0],'red'),cyl('upper-dome',.28,.14,[0,.80,0],'red',undefined,.10),pipe('service-neck',.025,.09,[0,.90,0],'y','metal'),cyl('neck-cap',.036,.02,[0,.955,0],'dark'),box('data-plate',[.10,.09,.01],[0,.51,.279],'cream')];
add('expansion-vessel','Hydronic expansion vessel',expansion,[],null,null,'Fixed vessel, pedestal, service neck and data plate. Internal diaphragm, air charge, deformation and pressure response are not modeled. No invented removable-cap operation.');
const soft=[box('plinth',[.88,.05,.55],[0,.025,0],'dark'),cyl('resin-base',.17,.08,[-.22,.09,0],'metal'),cyl('resin-cylinder',.17,.96,[-.22,.61,0],'blue'),cyl('shoulder',.17,.10,[-.22,1.14,0],'blue',undefined,.07),box('valve-head',[.24,.13,.22],[-.22,1.255,0],'dark'),cyl('brine-bin',.21,.72,[.22,.41,0],'cream'),cyl('brine-lid',.22,.035,[.22,.7875,0],'sage'),pipe('brine-tube',.012,.55,[.22,1.0625,0],'y','metal'),pipe('bridge-tube',.012,.44,[0,1.33,0],'x','metal'),pipe('lever-stem',.015,.05,[-.22,1.345,0],'y','metal')];
for(const bypass of [false,true])soft.push({...box(bypass?'bypass-handle':'service-handle',[.18,.025,.028],[-.22,1.3825,0],'red',{bypass}),rotation:[0,bypass?Math.PI/2:0,0],rotationAxis:[0,1,0]});
add('water-softener','Resin-column and brine-bin softener',soft,[],'bypass','Service / bypass valve','Quarter-turn bypass selector only. Resin column, brine bin and connecting tube are one source. No ion exchange, salt handling, regeneration timer, potable-water rating or fluid transfer.');range('water-softener','bypass',[0,1,0],[0,Math.PI/2],'rad',['service-handle','bypass-handle']);
const panel=[box('back',[.58,.80,.025],[0,.40,-.0875],'metal'),...[-.2775,.2775].map((x,n)=>box('side-'+n,[.025,.80,.20],[x,.40,0],'sage')),...[.0125,.7875].map((y,n)=>box('edge-'+n,[.58,.025,.20],[0,y,0],'sage')),box('dead-front',[.53,.75,.025],[0,.40,.0575],'cream'),box('main-breaker',[.16,.15,.035],[-.11,.59,.0875],'dark')];
for(const main of [false,true])panel.push({...box(main?'main-up':'main-down',[.06,.07,.035],[-.11,.59,.1225],'red',{main}),pivot:[0,0,-.0175],rotation:[main?-.45:.45,0,0],rotationAxis:[1,0,0]});
for(let n=0;n<4;n++){panel.push(box('branch-body-'+n,[.085,.13,.035],[-.18+n*.12,.30,.0875],'dark'));if(n)panel.push(box('branch-fixed-'+n,[.045,.035,.022],[-.18+n*.12,.28,.116],'metal'));}
for(const branch of [false,true])panel.push({...box(branch?'branch-up':'branch-down',[.045,.055,.025],[-.18,.30,.1175],'metal',{branch}),rotation:[branch?-.45:.45,0,0],rotationAxis:[1,0,0]});
panel.push(box('label',[.29,.045,.005],[0,.69,.0725],'paper'));
add('distribution-panel','Wall electrical distribution panel',panel,[],null,null,'Main and one branch breaker show independent retained lever endpoints. Main must be enabled before branch; branch must be off before isolation. Illustrative dead-front switchboard; no exposed wiring, live electricity, protection curves or installation guidance.');configs['distribution-panel']={state:{main:false,branch:false},actions:[{...toggle('toggle','main','Main breaker on / off'),requires:{branch:false},blockedMessage:'Switch branch off before main isolation.'},{...toggle('branch','branch','Branch breaker on / off'),requires:{main:true},blockedMessage:'Main breaker must be on first.'}],stateRules:[{when:{branch:true},must:{main:true},message:'Branch indicator requires main.'}]};motion['distribution-panel']=[{stateKey:'main',axis:[1,0,0],values:[.45,-.45],units:'rad',parts:['main-down','main-up'],mode:'discrete-endpoints'},{stateKey:'branch',axis:[1,0,0],values:[.45,-.45],units:'rad',parts:['branch-down','branch-up'],mode:'discrete-endpoints'}];anchors['distribution-panel']=[wallAnchor('back',0,.40,-.10,.58,.80)];
// Rectangular air damper: real through aperture; retained blades pivot about X shafts.
const damper=[...[-.42,.42].map((x,n)=>box('jamb-'+n,[.04,.68,.30],[x,.34,0],'metal')),...[.02,.66].map((y,n)=>box('rail-'+n,[.88,.04,.30],[0,y,0],'metal')),box('actuator',[.12,.15,.18],[.50,.34,0],'dark')];
for(let n=0;n<3;n++){const y=.14+n*.20;damper.push(pipe('shaft-'+n,.012,.88,[0,y,0],'x','metal'));for(const open of [false,true])damper.push({...box((open?'open':'closed')+'-blade-'+n,[.80,.19,.012],[0,y,0],'steel',{open}),rotation:[open?Math.PI/2:0,0,0],rotationAxis:[1,0,0]});}
for(const open of [false,true])damper.push({...box(open?'lever-open':'lever-closed',[.018,.12,.025],[.569,.34,0],'red',{open}),rotation:[open?Math.PI/2:0,0,0],rotationAxis:[1,0,0]});
add('duct-damper','Three-blade rectangular duct damper',damper,[],'open','Open / close airflow blades','All three blades and actuator indicator quarter-turn about X. Open aperture stays empty through the module. Floor-supported inspection module; no installed duct attachment, airflow, fire rating or continuous actuator.');range('duct-damper','open',[1,0,0],[0,Math.PI/2],'rad',['closed-blade-0','open-blade-0']);
const exchanger=[...feet(.70,.62,.10),box('base',[.70,.045,.62],[0,.1225,0],'metal'),box('front-frame',[.48,1.02,.045],[0,.655,.20],'sage'),box('rear-frame',[.48,1.02,.045],[0,.655,-.20],'sage')];
for(let n=0;n<12;n++)exchanger.push(box('plate-'+n,[.40,.88,.018],[0,.65,-.165+n*.030],'steel'));
for(const x of [-.205,.205])for(const y of [.22,1.08])exchanger.push(pipe('tie-'+x+'-'+y,.016,.53,[x,y,0],'z','metal'),pipe('nut-'+x+'-'+y,.028,.025,[x,y,.26],'z','dark'));
for(const x of [-.13,.13])for(const y of [.36,.94])exchanger.push(pipe('port-'+x+'-'+y,.042,.15,[x,y,.29],'z',x<0?'copper':'blue'),pipe('flange-'+x+'-'+y,.065,.025,[x,y,.375],'z','metal'));
add('plate-exchanger','Gasketed plate heat-exchanger frame',exchanger,[],null,null,'Fixed stack of twelve plates, tie rods and four fluid ports. No plate removal gimmick, fluid connectivity, heat transfer, leak behavior or rated performance.');
// Condensate sump with an exposed sight tube/float, rather than disappearing water.
const sump=[box('reservoir',[.48,.23,.32],[0,.115,0],'cream'),box('lid',[.51,.025,.35],[0,.2425,0],'sage'),cyl('motor',.075,.19,[-.10,.35,0],'dark'),pipe('discharge',.016,.30,[.17,.40,-.05],'y','copper'),box('gauge-back',[.065,.20,.025],[.12,.13,.1725],'dark'),pipe('sight-rod',.009,.18,[.12,.13,.192],'y','metal'),box('float-bottom-stop',[.065,.015,.035],[.12,.04,.1825],'metal'),box('float-top-stop',[.065,.015,.035],[.12,.22,.1825],'metal')];
for(const full of [false,true])sump.push(cyl(full?'float-high':'float-low',.021,.025,[.12,full?.19:.065,.192],'red',{full}));
for(const enabled of [false,true])sump.push(box(enabled?'enabled-lamp':'disabled-lamp',[.035,.016,.008],[-.10,.247,.179],enabled?'green':'dark',{enabled}));
sump.push(box('lamp-mount',[.06,.035,.03],[-.10,.247,.16],'metal'));
add('condensate-station','Condensate lift reservoir and pump',sump,[],null,null,'Enable then pump lowers retained sight float; disable then refill raises it. Four guarded Boolean endpoints. Float is an external schematic level indicator; no actual water surface, automatic sensor, motor time or plumbing simulation.');configs['condensate-station']={state:{full:false,enabled:false},actions:[toggle('toggle','enabled','Enable / disable pump'),transition('refill','Illustrate condensate refill',{enabled:false},{full:true},'Disable before illustrative refill.'),transition('pump','Illustrate pump-down',{enabled:true,full:true},{full:false},'Enable pump with a full indication first.')]};range('condensate-station','full',[0,1,0],[.065,.19],'m',['float-low','float-high']);
const ladder=[...[-.22,.22].map((x,n)=>box('rail-'+n,[.035,1.80,.065],[x,.9,0],'metal'))];
for(let n=0;n<9;n++)ladder.push(box('rung-'+n,[.44,.025,.045],[0,.10+n*.20,0],'steel'));
for(const y of [.15,1.65])ladder.push(box('mount-strap-'+y,[.52,.06,.025],[0,y,-.075],'metal'),...[-.22,.22].map((x,n)=>box('standoff-'+y+'-'+n,[.035,.06,.065],[x,y,-.0425],'metal')));
for(const [n,x,mat] of [[0,-.10,'blue'],[1,0,'dark'],[2,.10,'copper']]){ladder.push(pipe('retained-cable-'+n,.014,1.78,[x,.90,.0365],'y',mat));for(const y of [.3,.7,1.1,1.5])ladder.push(box('cable-clip-'+n+'-'+y,[.04,.02,.025],[x,y,.055],'dark'));}
add('cable-ladder','Wall cable ladder with retained routing sample',ladder,[],null,null,'Fixed wall ladder with three illustrative cables and clips. No electrical connection, cable editor, bending, arbitrary cable attachments or certified support/load capacity. One routing asset, not separately counted cables.');anchors['cable-ladder']=[wallAnchor('back',0,.90,-.0875,.52,1.56)];
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='plant-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const extra=extras[short]||[];
 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'plant-2026-11-18',measurement:{status:'estimated',note:'Original fictional plant furniture/equipment; not manufacturer specifications. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/plant-2026-11-18.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/plant.html'};
 Object.assign(a,configs[short]||{});
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
