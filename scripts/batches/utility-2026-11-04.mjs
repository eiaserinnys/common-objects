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

const frontCylinder=(id,r,h,pos,mat,when,open=false)=>({...cyl(id,r,h,pos,mat,when),rotation:[Math.PI/2,0,0],geometry:{type:'cylinder',radiusBottom:r,radiusTop:r,height:h,segments:32,...open&&{openTop:true,openBottom:true}}});
const washerDoor=open=>{
 const when={open},s=open?'open':'closed',angle=open?-Math.PI/2:0;
 return [frontCylinder(s+'-rim',.225,.04,[0,.44,.32],'metal',when,true),frontCylinder(s+'-window',.199,.012,[0,.44,.337],'dark',when),box(s+'-handle',[.025,.11,.035],[.175,.44,.3625],'cream',when)].map(p=>{
 // Apply common world Y hinge to each already X-oriented cylinder through parent.
 return {...p,parent:s+'-hinge',position:[p.position[0]+.23,p.position[1]-.44,p.position[2]-.32]};
 }).concat([{...box(s+'-hinge',[.012,.10,.012],[-.23,.44,.32],'metal',when),position:[-.23,.44,.32],pivot:[0,0,0],rotation:[0,angle,0]}]);
};
add('washer','Front-loading washing machine',[
 ...feet(.60,.62,.04),box('rear',[.60,.79,.025],[0,.435,-.2975],'cream'),
 ...[-1,1].map((x,i)=>box('side-'+i,[.025,.79,.62],[x*.2875,.435,0],'cream')),
 box('top',[.60,.025,.62],[0,.8375,0],'cream'),box('base',[.55,.025,.58],[0,.0525,0],'metal'),
 box('front-control',[.55,.15,.04],[0,.75,.30],'sage'),box('lower-front',[.55,.12,.04],[0,.10,.30],'cream'),
 ...[-1,1].map((x,i)=>box('front-edge-'+i,[.045,.52,.04],[x*.2525,.435,.30],'cream')),
 frontCylinder('drum-shell',.235,.40,[0,.44,.08],'metal',undefined,true),frontCylinder('drum-back',.23,.012,[0,.44,-.12],'dark'),
 ...[0,1,2].map((n)=>{const a=n*Math.PI*2/3;return {...box('drum-lifter-'+n,[.03,.026,.35],[Math.sin(a)*.20,.44+Math.cos(a)*.20,.08],'cream'),rotation:[0,0,-a]};}),
 ...washerDoor(false),...washerDoor(true),
 box('detergent-front',[.16,.065,.015],[-.17,.75,.328],'cream'),frontCylinder('program-dial',.032,.016,[.07,.75,.335],'dark'),box('status-display',[.09,.035,.012],[.19,.75,.33],'dark'),
 box('rear-hose-connector',[.04,.04,.025],[.19,.67,-.3225],'metal')
],[], 'open','Open / close washer loading door','Two fixed poses of the complete loading door about its left hinge expose a modeled drum and lifters. Loading access only; no drum animation, laundry, wash cycle, water, heat, power or interlock simulation. Door opening reserves endpoint clearance, not a swept collision volume.');
add('cleaning-cabinet','Tall utility cabinet with sliding door',[
 ...feet(.80,.50,.08),box('bottom',[.80,.03,.50],[0,.095,0],'wood'),box('top',[.80,.03,.50],[0,1.785,0],'wood'),
 ...[-1,1].map((x,i)=>box('side-'+i,[.025,1.66,.50],[x*.3875,.94,0],'sage')),
 box('back',[.75,1.66,.025],[0,.94,-.2375],'sage'),box('divider',[.025,1.66,.45],[.08,.94,0],'wood'),
 ...[.5,.9,1.3].map((h,i)=>box('shelf-'+i,[.28,.025,.44],[.2325,h,0],'wood')),
 ...[false,true].flatMap(open=>[box((open?'open':'closed')+'-door',[.76,1.65,.025],[open?-.76:0,.94,.2675],'cream',{open}),box((open?'open':'closed')+'-pull',[.018,.17,.025],[(open?-.76:0)+.30,1.05,.2925],'metal',{open})]),
 box('sliding-track',[1.56,.025,.035],[-.38,1.79,.28],'metal')
],[... [.5125,.9125,1.3125].map((h,i)=>({...offsetSurface('shelf-'+i,h,.24,.38,.2325,0),availableWhen:{open:true}}))], 'open','Slide utility cabinet door','Door and pull translate 0.76 m left in two poses; track and clearance are retained. Tall left bay for cleaning equipment, three right shelves. No continuous sliding, latch or collision physics; open shelf support is state dependent.');
add('drying-rack','Freestanding two-tier laundry drying rack',[
 ...[-1,1].map((x,i)=>box('runner-'+i,[.055,.035,.70],[x*.52,.0175,0],'dark')),
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('upright-'+i+j,[.024,1.365,.024],[x*.52,.7175,z*.29],'metal'))),
 ...[.72,1.40].flatMap((h,j)=>[...[-1,1].map((x,i)=>box('side-'+j+i,[.024,.024,.64],[x*.52,h,0],'sage')),...Array.from({length:7},(_,i)=>box('drying-rod-'+j+i,[1.04,.014,.014],[0,h,-.27+i*.09],'metal'))]),
 box('rear-brace',[1.04,.025,.025],[0,.35,-.29],'sage')
],[],null,null,'Static deployed two-tier drying frame. Rails are not flat support surfaces; no hanging-cloth attachment, folding or evaporation simulation.');
add('folding-table','Laundry sorting and folding table',[
 ...feet(1.4,.72,.06),...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('leg-'+i+j,[.045,.80,.045],[x*.62,.46,z*.28],'metal'))),
 box('worktop',[1.4,.035,.72],[0,.8825,0],'wood'),box('undertray',[1.22,.025,.54],[0,.25,0],'sage'),
 ...[-1,1].map((x,i)=>box('apron-'+i,[.03,.11,.62],[x*.65,.81,0],'sage'))
],[surface('worktop',.90,1.34,.66),surface('undertray',.2625,1.14,.46)],null,null,'Static 0.90 m folding work surface with low basket tray. Distinct from office standing desk: broader laundry surface and low basket storage. No folding frame or height adjustment.');
add('ironing-board','Full-size freestanding ironing board',[
 ...[-1,1].map((x,i)=>box('runner-'+i,[.055,.035,.52],[x*.36,.0175,0],'dark')),
 ...[-1,1].map((x,i)=>({...box('angled-leg-'+i,[.035,1.08,.035],[0,.44,x*.12],'metal'),rotation:[0,0,x*.66]})),
 box('padded-deck',[1.10,.035,.38],[-.05,.8825,0],'sage'),cyl('rounded-nose',.19,.035,[.50,.8825,0],'sage'),
 box('iron-rest',[.25,.02,.30],[-.725,.86,0],'metal'),
 ...[-1,1].map((z,i)=>box('rest-rim-'+i,[.25,.025,.012],[-.725,.8825,z*.15],'dark'))
],[offsetSurface('pressing-area',.90,.98,.32,-.05,0),offsetSurface('iron-rest',.87,.21,.25,-.725,0)],null,null,'Static deployed ironing board at 0.90 m. No folding or height adjustment; iron heat and contact are not simulated. Support polygons exclude rounded nose and edge rails.');
add('linen-cart','Wheeled open linen transport cart',[
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>({...cyl('wheel-'+i+j,.045,.028,[x*.30,.045,z*.22],'dark'),rotation:[0,0,Math.PI/2]}))),
 box('deck',[.70,.025,.54],[0,.12,0],'wood'),
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('corner-'+i+j,[.025,.63,.025],[x*.325,.4475,z*.245],'metal'))),
 ...[-1,1].map((z,j)=>box('rim-'+j,[.66,.025,.025],[0,.75,z*.245],'sage')),
 ...[-1,1].flatMap((x,j)=>[box('end-rim-'+j,[.025,.025,.49],[x*.325,.75,0],'sage'),...Array.from({length:4},(_,i)=>box('end-bar-'+j+i,[.018,.57,.018],[x*.325,.44,-.18+i*.12],'metal'))]),
 ...[-1,1].flatMap((z,j)=>Array.from({length:6},(_,i)=>box('side-bar-'+j+i,[.018,.57,.018],[-.27+i*.108,.44,z*.245],'metal'))),
 ...[-1,1].map((z,i)=>box('handle-upright-'+i,[.025,.17,.025],[.325,.8475,z*.20],'metal')),box('push-grip',[.03,.03,.43],[.325,.94,0],'dark')
],[surface('basket-floor',.1325,.60,.43)],null,null,'Static wheeled open cage for linen transport, distinct from the shallow office printer cart. Casters do not roll or swivel; contents may be placed on basket floor, no cloth simulation.');
add('changing-bench','Utility changing bench with shoe shelf',[
 ...feet(1.0,.40,.035),...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('leg-'+i+j,[.035,.40,.035],[x*.43,.235,z*.14],'metal'))),
 ...[-1,1].map((z,i)=>box('seat-slat-'+i,[1.0,.035,.18],[0,.4475,z*.10],'wood')),
 ...Array.from({length:5},(_,i)=>box('shoe-rail-'+i,[.86,.022,.035],[0,.15,-.12+i*.06],'sage'))
],[surface('seat',.465,.92,.34)],null,null,'Static bench for changing shoes with slatted shoe shelf; no occupant or load certification. Lower rails are not a continuous support polygon.');
add('mop-stand','Freestanding long-tool parking stand',[
 box('weighted-base',[.62,.035,.40],[0,.0175,0],'dark'),box('drip-tray',[.56,.025,.32],[0,.0475,0],'sage'),
 ...[-1,1].map((x,i)=>box('upright-'+i,[.03,1.35,.03],[x*.26,.71,-.13],'metal')),
 box('upper-crossbar',[.55,.04,.035],[0,1.35,-.13],'wood'),
 ...[-.18,0,.18].flatMap((x,i)=>[box('hook-stem-'+i,[.018,.018,.10],[x,1.35,-.065],'metal'),box('hook-lip-'+i,[.018,.05,.018],[x,1.37,-.015],'metal')])
],[],null,null,'Static stand for long cleaning tools with catch tray and three hooks. No magnetic gripping or object attachment; not a duplicate handheld tool. Hooks are not horizontal placement surfaces.');
add('dehumidifier','Portable utility-room dehumidifier',[
 ...feet(.38,.30,.04),box('body',[.38,.50,.30],[0,.29,0],'cream'),
 box('tank-front',[.33,.18,.012],[0,.16,.156],'sage'),box('tank-pull',[.12,.018,.02],[0,.23,.17],'dark'),box('tank-window',[.025,.11,.014],[.115,.15,.165],'dark'),
 ...Array.from({length:7},(_,i)=>box('front-intake-'+i,[.29,.012,.008],[0,.30+i*.026,.154],'dark')),
 ...Array.from({length:6},(_,i)=>box('top-outlet-'+i,[.25,.008,.012],[0,.544,-.10+i*.035],'dark')),
 box('control-panel',[.14,.008,.045],[0,.544,.11],'sage'),box('rear-filter',[.28,.30,.008],[0,.34,-.154],'metal'),
 ...[-1,1].map((x,i)=>box('carry-recess-'+i,[.008,.035,.10],[x*.194,.47,0],'dark'))
],[],null,null,'Static appliance depiction with intake, exhaust, tank, controls and carry recesses. No air flow, humidity sensing, tank extraction, power or condensation simulation.');
add('step-platform','Two-step utility access platform',[
 ...feet(.50,.62,.035),
 ...[-1,1].map((x,i)=>box('side-frame-'+i,[.035,.38,.58],[x*.215,.225,0],'metal')),
 box('lower-step',[.50,.035,.28],[0,.2025,.18],'wood'),box('upper-step',[.50,.035,.30],[0,.4225,-.13],'wood'),
 ...[.18,-.13].flatMap((z,j)=>Array.from({length:4},(_,i)=>box('grip-'+j+i,[.42,.003,.015],[0,j?.4415:.2215,z-.09+i*.06],'dark')))
],[],null,null,'Static two-step access platform. Treads carry grip strips, so no generic flat object support is certified. No folding, person animation, load rating or safety certification.');

// Version 2 operating poses; v1 sources stay immutable in versions/1.json.
for(const e of entries){
 const [id]=e;
 if(id==='drying-rack'){
  e[2]='lowered';e[3]='Lower / raise telescoping drying tier';
  // Fixed outer posts end at lower tier; inner posts and top rails slide 0.58 m.
  const kept=e[4].filter(p=>!p.id.startsWith('upright-'));
  for(const p of e[4].filter(p=>p.id.startsWith('upright-'))){
   kept.push({...p,id:p.id+'-outer',position:[p.position[0],.39,p.position[2]],geometry:{type:'box',size:[.030,.71,.030]}});
   for(const lowered of [false,true])kept.push({...p,id:p.id+(lowered?'-low':'-high'),position:[p.position[0],lowered?.46:1.04,p.position[2]],geometry:{type:'box',size:[.018,.72,.018]},visibleWhen:{lowered}});
  }
  e[4]=kept.flatMap(p=>/^(side-1|drying-rod-1)/.test(p.id)?[false,true].map(lowered=>({...p,id:p.id+(lowered?'-low':'-high'),position:[p.position[0],p.position[1]-(lowered?.58:0),p.position[2]],visibleWhen:{lowered}})):[p]);
  e[6]='Upper drying tier and inner posts telescope down 0.58 m for loading/storage in two fixed height settings; lower frame and feet remain fixed. No cloth attachment, evaporation or continuous animation.';
 }
 if(id==='ironing-board'){
  e[2]='low';e[3]='Set ironing height 0.90 / 0.75 m';
  e[4]=e[4].flatMap(p=>{
   if(p.id.startsWith('runner'))return [{...p,geometry:{type:'box',size:[.18,.035,.52]}}];
   return [false,true].map(low=>{const q=structuredClone(p);q.id+=low?'-low':'-high';q.visibleWhen={low};
    if(p.id.startsWith('angled-leg')){q.position[1]=low?.365:.44;q.rotation[2]=Math.sign(p.rotation[2])*(low?.865:.66);}
    else q.position[1]-=low?.15:0;return q;});
  });
  e[5]=e[5].flatMap(p=>[false,true].map(low=>({...p,id:p.id+(low?'-low':'-high'),height:p.height-(low?.15:0),availableWhen:{low}})));
  e[6]='Scissor frame and deck switch between 0.90 m and 0.75 m ironing settings. Supported height follows state; existing loose contents do not follow automatically and must be repositioned. Two fixed poses, no continuous folding or heat simulation.';
 }
 if(id==='linen-cart'){
  e[2]='braked';e[3]='Engage / release caster parking brakes';
  for(const side of [-1,1])for(const braked of [false,true]){
   e[4].push({...box('brake-'+side+'-'+braked,[.065,.012,.025],[side*.30,.092,.22],'sage',{braked}),pivot:[0,0,-.025],rotation:[braked?-.65:.35,0,0],rotationAxis:[1,0,0]});
   e[4].push(box('brake-shoe-'+side+'-'+braked,[.03,.012,.026],[side*.30,braked?.085:.11,.22],'metal',{braked}));
  }
  e[6]='Two caster pedals and shoes engage parking brakes in fixed poses. Preview placement edits are blocked while braked; release to move the cart. No rolling animation or physics; child contents do not follow placement edits automatically.';
 }
 if(id==='dehumidifier'){
  e[2]='wet';e[3]='Run one simulated drying cycle';
  e[4].push(box('collected-water',[.020,.085,.004],[.115,.14,.174],'sage',{wet:true}));
  e[4].push(box('tank-full-indicator',[.02,.008,.02],[.045,.55,.11],'food',{full:true}));
  e[6]='Discrete illustrative drying model: each cycle lowers simulated relative humidity by 5 points toward 45% and collects 200 mL up to a 600 mL tank; full tank blocks further cycles until emptied. Water level/full indicator and numeric values are instance state, not measured room humidity or a physical thermodynamic simulation.';
 }
}
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='utility-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'utility-2026-11-04',measurement:{status:'estimated',note:'Original fictional utility furniture/equipment. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/utility-2026-11-04.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/utility.html'};
 if(['drying-rack','ironing-board','linen-cart','dehumidifier'].includes(short))a.version=2;
 if(short==='linen-cart')a.placementLockWhen={braked:true};
 if(short==='dehumidifier'){
  a.state={humidity:65,waterMl:0,wet:false,full:false};
  a.simulation={targetHumidity:45,humidityDropPerCycle:5,waterPerCycleMl:200,tankCapacityMl:600};
  a.actions=[{id:'toggle',type:'dehumidify',label:'Run one simulated drying cycle'},{id:'drain',type:'empty-tank',label:'Empty collected water tank'}];
 }
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
