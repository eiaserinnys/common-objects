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


const extras={},motion={},mountSurfaces={},anchors={},configs={};
materials.steel={color:[.62,.68,.65]};materials.glass={color:[.46,.65,.70]};materials.red={color:[.78,.32,.22]};materials.green={color:[.38,.56,.28]};
const pipe=(id,r,len,pos,axis='y',mat='metal',when)=>({...cyl(id,r,len,pos,mat,when),rotation:axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]});
const range=(id,stateKey,axis,values,units,parts)=>motion[id]=[{stateKey,axis,values,units,parts,mode:'discrete-endpoints'}];
const transition=(id,label,requires,set,blockedMessage)=>({id,label,type:'transition',requires,set,blockedMessage});
const toggle=(id,key,label)=>({id,type:'toggle',stateKey:key,label});
// Double-sided open merchandising, intentionally not an enclosed archive cabinet.
const gondola=[box('plinth',[1.2,.12,.90],[0,.06,0],'sage'),box('center-spine',[1.16,1.38,.045],[0,.81,0],'cream')];
const gs=[];for(const side of [-1,1])for(const [n,y] of [.18,.65,1.12].entries()){
 gondola.push(box(`deck-${side}-${n}`,[1.16,.025,.40],[0,y-.0125,side*.225],'paper'),box(`price-rail-${side}-${n}`,[1.16,.045,.018],[0,y-.006,side*.432],'sage'));
 gs.push(offsetSurface(`shelf-${side}-${n}`,y,1.10,.34,0,side*.225));
}
for(const x of [-.56,.56])gondola.push(box('upright-'+x,[.04,1.50,.055],[x,.75,0],'metal'));
add('gondola','Double-sided retail gondola',gondola,gs,null,null,'Fixed double-sided open merchandising shelves, with real flat support regions inset from front price rails. Six levels, one source. No load rating or adjustable shelf mechanism.');
// Open, tilted bins with retained fruit examples; no false support plane over a slope.
const produce=[...feet(1.2,.74,.18),...[-1,1].map((x,n)=>({...box('side-stringer-'+n,[.045,1.22,.045],[x*.55,.64,.02],'metal'),rotation:[-.58,0,0]})),box('back',[1.20,1.02,.04],[0,.69,-.35],'sage')];
for(let n=0;n<3;n++){
 const z=.22-n*.22,y=.32+n*.30,p='tier-'+n;
 produce.push({...box(p+'-tray',[1.12,.025,.34],[0,y,z],'wood'),rotation:[.18,0,0]},box(p+'-lip',[1.12,.13,.025],[0,y+.035,z+.16],'wood'));
 for(const x of [-.56,0,.56])produce.push(box(p+'-divider-'+x,[.025,.13,.34],[x,y+.06,z],'wood'));
 for(let k=0;k<4;k++)produce.push(cyl(p+'-fruit-'+k,.055,.09,[-.40+k*.26,y+.055,z],n===0?'red':n===1?'green':'food',undefined,.04));
}
add('produce','Three-tier produce-bin display',produce,[],null,null,'Fixed stepped and slightly inclined open produce bins with four stylized fruit examples per tier. Fruit belongs to this demonstration assembly and is not counted separately. No loose-particle, restocking, weighing or flat support over inclined bins.');
const conveyor=[...feet(1.8,.65,.76),box('bed',[1.8,.10,.65],[0,.81,0],'sage'),box('belt',[1.64,.025,.49],[0,.8725,0],'dark'),...[-1,1].map((z,n)=>box('side-rail-'+n,[1.8,.05,.055],[0,.875,z*.30],'metal')),box('control-base',[.16,.04,.12],[.68,.88,-.23],'cream')];
for(const delivered of [false,true]){
 const p=delivered?'out':'in',x=delivered?.58:-.58,when={delivered};
 conveyor.push(box(p+'-parcel',[.24,.18,.24],[x,.975,0],'food',when),box(p+'-band',[.025,.002,.24],[x,1.066,0],'paper',when));
 for(let n=0;n<5;n++)conveyor.push(box(p+'-belt-seam-'+n,[.009,.002,.48],[-.65+n*.29+(delivered?.10:0),.886,0],'metal',when));
}
for(const stopped of [false,true])conveyor.push(cyl(stopped?'stop-latched':'stop-released',.026,.025,[.68,stopped?.905:.92,-.23],'red',{stopped}));
add('conveyor','Checkout conveyor with stop latch',conveyor,[],null,null,'One explicit step transfers the retained sample parcel 1.16 m and offsets belt seams. A latched stop blocks transfer; reload is allowed only while stopped. No real-time motor, sensors, transaction linkage, swept collision or general attached-item transport. Sample parcel is internal illustration, not a new source.');
configs.conveyor={state:{delivered:false,stopped:false},actions:[transition('toggle','Advance sample parcel',{stopped:false,delivered:false},{delivered:true},'Release stop and reload the parcel before advancing.'),toggle('stop','stopped','Latch / release stop'),transition('reload','Reload parcel while stopped',{stopped:true},{delivered:false},'Latch stop before reloading.')]};range('conveyor','delivered',[1,0,0],[-.58,.58],'m',['in-parcel','out-parcel']);
const register=[...feet(.44,.40,.025),box('base',[.44,.10,.40],[0,.075,0],'sage'),box('column',[.065,.21,.06],[0,.23,-.11],'metal'),{...box('screen',[.34,.23,.04],[0,.415,-.09],'dark'),rotation:[-.20,0,0]},box('printer',[.13,.11,.17],[-.145,.175,-.065],'cream'),box('receipt-slot',[.10,.008,.009],[-.145,.225,.025],'dark')];
for(const drawerOpen of [false,true]){const p=drawerOpen?'open':'closed',z=drawerOpen?.35:0,w={drawerOpen};register.push(box(p+'-tray',[.39,.015,.36],[0,.035,z],'metal',w),box(p+'-front',[.41,.085,.02],[0,.075,z+.19],'sage',w),box(p+'-pull',[.12,.015,.018],[0,.075,z+.208],'dark',w));for(const x of [-.185,-.06,.06,.185])register.push(box(p+'-divider-'+x,[.012,.045,.34],[x,.065,z],'cream',w));}
register.push(box('receipt',[.085,.16,.002],[-.145,.30,.025],'paper',{printed:true}),box('receipt-rule',[.06,.004,.003],[-.145,.34,.027],'dark',{printed:true}),{...box('sale-display',[.23,.06,.003],[0,0,.0215],'green',{printed:true}),parent:'screen'});
add('register','Cash register and receipt terminal',register,[],null,null,'Sale illustration issues a retained paper receipt and opens the complete divided cash tray. Close drawer before clearing the receipt or issuing another sale. No payment network, money, software or real transactions. Screen, printer and cash drawer form one source.');
configs.register={state:{drawerOpen:false,printed:false},actions:[transition('toggle','Issue receipt and open drawer',{drawerOpen:false,printed:false},{drawerOpen:true,printed:true},'Close drawer and clear the previous receipt first.'),transition('close','Close cash drawer',{drawerOpen:true},{drawerOpen:false},'Cash drawer is already closed.'),transition('clear','Clear receipt',{drawerOpen:false},{printed:false},'Close drawer before clearing the receipt.')],stateRules:[{when:{drawerOpen:true},must:{printed:true},message:'Open sale drawer requires its issued receipt.'}]};range('register','drawerOpen',[0,0,1],[0,.35],'m',['closed-tray','open-tray']);
const scale=[...feet(.42,.42,.025),box('base',[.42,.11,.42],[0,.08,0],'sage'),box('platter',[.31,.018,.27],[-.035,.144,.04],'steel'),box('sample-bag',[.16,.14,.14],[-.035,.223,.04],'food'),box('mast',[.035,.42,.04],[.12,.345,-.17],'metal'),box('display',[.24,.13,.035],[.08,.585,-.17],'dark'),box('label-slot',[.09,.009,.008],[.145,.11,.213],'dark')];
for(const weighed of [false,true])scale.push(box(weighed?'reading-bars':'idle-dash',[weighed?.16:.035,.025,.004],[.08,.585,-.15],weighed?'green':'paper',{weighed}));
scale.push(box('printed-label',[.08,.002,.13],[.145,.106,.27],'paper',{label:true}),box('barcode',[.06,.003,.035],[.145,.108,.30],'dark',{label:true}));
add('scale','Counter weighing and label unit',scale,[],null,null,'Weigh acknowledges the retained sample bag with a display change; printing extends one label only after weighing. Reset removes the label and reading. Illustrative sequence, not a sensor, calibrated measurement, price computation or editable barcode.');
configs.scale={state:{weighed:false,label:false},actions:[transition('toggle','Weigh sample bag',{weighed:false},{weighed:true},'Reset the sample before weighing again.'),transition('print','Print weighed label',{weighed:true,label:false},{label:true},'Weigh the sample before printing; reset before another label.'),transition('reset','Reset sample reading',{}, {weighed:false,label:false},'')],stateRules:[{when:{label:true},must:{weighed:true},message:'A printed label requires a weighed sample.'}]};
// Wheel cylinders are horizontal and centered exactly one radius above ground.
const wheels=(w,d)=>[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>pipe('wheel-'+i+j,.055,.035,[x*(w/2-.04),.055,z*(d/2-.05)],'x','dark')));
const trolley=[...wheels(.58,.95),...[-1,1].flatMap((x,i)=>[box('chassis-'+i,[.03,.03,.88],[x*.25,.155,0],'metal'),...[-1,1].map((z,j)=>box('caster-fork-'+i+j,[.045,.09,.035],[x*.25,.105,z*.425],'metal'))]),...[-1,1].map((x,n)=>box('basket-cradle-'+n,[.03,.035,.80],[x*.24,.475,-.03],'metal')),box('lower-rack',[.48,.025,.65],[0,.18,.04],'metal'),...[-1,1].map((x,n)=>box('rear-upright-'+n,[.025,.84,.025],[x*.25,.53,-.38],'metal')),pipe('handle',.023,.53,[0,.96,-.40],'x','sage'),box('basket-floor',[.50,.018,.63],[0,.49,.03],'metal')];
for(const x of [-.26,.26]){for(let n=0;n<6;n++)trolley.push(box('side-bar-'+x+'-'+n,[.012,.34,.012],[x,.66,-.27+n*.12],'metal'));for(const y of [.52,.65,.82])trolley.push(box('side-rim-'+x+'-'+y,[.018,.016,.66],[x,y,.03],'metal'));}
for(const z of [-.30,.36]){for(let n=0;n<5;n++)trolley.push(box('end-bar-'+z+'-'+n,[.012,.34,.012],[-.22+n*.11,.66,z],'metal'));trolley.push(pipe('end-rim-'+z,.012,.53,[0,.82,z],'x','metal'));}
for(const braked of [false,true])trolley.push({...box(braked?'pedal-down':'pedal-up',[.10,.018,.09],[.21,.15,-.42],'red',{braked}),rotation:[braked?0:-.45,0,0],rotationAxis:[1,0,0]});
add('trolley','Wire-basket shopping trolley',trolley,[offsetSurface('basket-floor',.499,.44,.54,0,.03)],'braked','Set / release parking brake','Pedal rotates and parking state locks preview placement controls. Basket and wheels stay present. No wheel rolling, nesting, child seat, load certification or collision dynamics. Basket support is inset inside wire walls.');configs.trolley={placementLockWhen:{braked:true}};range('trolley','braked',[1,0,0],[-.45,0],'rad',['pedal-up','pedal-down']);
const basketStand=[...feet(.55,.45,.16),box('stand-deck',[.55,.035,.45],[0,.1775,0],'metal'),...[-1,1].map((x,n)=>box('stand-rail-'+n,[.025,.38,.025],[x*.25,.36,-.20],'metal'))];
for(let n=0;n<3;n++){const y=.21+n*.12; basketStand.push(box('basket-floor-'+n,[.45,.015,.32],[0,y,0],'sage'));for(const x of [-.23,.23])basketStand.push(box('basket-side-'+n+'-'+x,[.018,.10,.34],[x,y+.05,0],'sage'));for(const z of [-.17,.17])basketStand.push(box('basket-end-'+n+'-'+z,[.46,.10,.018],[0,y+.05,z],'sage'));}
for(const raised of [false,true]){const p=raised?'raised':'folded',w={raised};basketStand.push({...box(p+'-pivot',[.012,.012,.012],[0,.55,-.16],'metal',w),rotation:[raised?0:Math.PI/2,0,0],rotationAxis:[1,0,0]});for(const x of [-.20,.20])basketStand.push({...box(p+'-arm-'+x,[.016,.25,.016],[x,.125,0],'metal',w),parent:p+'-pivot'});basketStand.push({...pipe(p+'-grip',.018,.42,[0,.25,0],'x','wood',w),parent:p+'-pivot'});}
add('basket-stand','Pickup stand with stacked shopping baskets',basketStand,[],'raised','Raise / fold top basket handle','Top basket U-handle rotates 90 degrees about its hinge, with both arms and grip retained. Three baskets and stand count as one source. No basket extraction, nesting physics or pickup inventory.');range('basket-stand','raised',[1,0,0],[Math.PI/2,0],'rad',['folded-pivot','raised-pivot']);
const gate=[cyl('base',.16,.025,[0,.0125,0],'metal'),cyl('post',.045,1.02,[0,.535,0],'steel'),cyl('cap',.055,.025,[0,1.0575,0],'sage')];
for(const open of [false,true]){const p=open?'open':'closed',w={open};gate.push({...box(p+'-pivot',[.015,.015,.015],[0,.82,0],'metal',w),rotation:[0,open?-Math.PI/2:0,0]});for(const y of [0,-.35])gate.push({...pipe(p+'-rail-'+y,.018,.88,[.46,y,0],'x','metal',w),parent:p+'-pivot'});gate.push({...pipe(p+'-end',.018,.35,[.90,-.175,0],'y','metal',w),parent:p+'-pivot'},{...box(p+'-sign',[.25,.21,.02],[.50,-.175,0],'sage',w),parent:p+'-pivot'});}
add('gate','Single-post customer entrance gate',gate,[],'open','Swing entrance gate','Complete two-rail gate and sign rotate 90 degrees about the fixed post. No access authorization, latch, crowd safety, one-way enforcement or swept collision simulation.');range('gate','open',[0,1,0],[0,-Math.PI/2],'rad',['closed-pivot','open-pivot']);
const chiller=[box('base',[1.2,.22,.72],[0,.11,0],'sage'),box('back',[1.2,1.68,.045],[0,1.06,-.3375],'cream'),...[-1,1].map((x,n)=>box('side-'+n,[.045,1.68,.72],[x*.5775,1.06,0],'cream')),box('canopy',[1.2,.12,.72],[0,1.84,0],'sage')];
const cs=[];for(const [n,y] of [.28,.73,1.18].entries()){chiller.push(box('shelf-'+n,[1.10,.025,.58],[0,y-.0125,-.015],'paper'),box('price-rail-'+n,[1.10,.035,.018],[0,y,.282],'sage'));cs.push(offsetSurface('deck-'+n,y,1.04,.50,0,-.025));}
for(let n=0;n<7;n++)chiller.push(box('vent-'+n,[.09,.025,.006],[-.45+n*.15,.12,.363],'dark'));
for(const raised of [false,true]){const bottom=raised?1.62:.23,p=raised?'raised':'lowered',w={raised};chiller.push(box(p+'-night-screen',[1.08,1.77-bottom,.008],[0,(1.77+bottom)/2,.33],'glass',w),box(p+'-pullbar',[1.1,.025,.025],[0,bottom,.34],'metal',w));}
add('chiller','Open-front multideck display chiller',chiller,cs,'raised','Retract / lower night screen','Night screen retracts to expose three merchandise decks; fixed lower vents and insulated shell distinguish open merchandising from storage refrigerators and pastry cases. Cooling, fans, temperatures and food preservation are not simulated. Screen is opaque; no glass transparency.');range('chiller','raised',[0,1,0],[.23,1.62],'m',['lowered-pullbar','raised-pullbar']);
const bulk=[...feet(.65,.55,.12),box('hopper-cradle',[.60,.045,.08],[0,1.18,-.175],'metal'),box('bag-rest-crossrail',[.60,.045,.20],[0,.46,-.16],'metal'),box('base',[.65,.055,.55],[0,.1475,0],'sage'),...[-1,1].map((x,n)=>box('upright-'+n,[.045,1.18,.045],[x*.28,.70,-.20],'metal')),box('bag-rest',[.44,.025,.40],[0,.49,.06],'wood'),box('lid-hinge-block',[.36,.035,.07],[0,1.435,-.17],'metal'),box('hopper-back',[.40,.48,.025],[0,1.20,-.15],'cream'),...[-1,1].map((x,n)=>box('hopper-side-'+n,[.025,.48,.33],[x*.20,1.20,0],'cream')),cyl('funnel',.06,.20,[0,.86,0],'sage',undefined,.205),pipe('spout',.035,.14,[0,.70,0],'y','metal'),box('catch-bag-floor',[.20,.01,.18],[0,.5075,.045],'paper'),...[-1,1].flatMap((v,n)=>[box('bag-side-'+n,[.008,.13,.18],[v*.096,.5775,.045],'paper'),box('bag-end-'+n,[.184,.13,.008],[0,.5775,.045+v*.086],'paper')])];
for(const dispensed of [false,true]){const p=dispensed?'dispensed':'full',w={dispensed};bulk.push(box(p+'-grain',[.36,dispensed?.15:.35,.28],[0,dispensed?1.035:1.135,0],'food',w),{...box(p+'-lever',[.025,.18,.025],[.10,.73,.035],'dark',w),rotation:[0,0,dispensed?-.8:0],rotationAxis:[0,0,1]});if(dispensed)bulk.push(box('bag-grain',[.17,.045,.15],[0,.62,.045],'food',w));}
for(const lidOpen of [false,true]){const p=lidOpen?'open':'closed',w={lidOpen};bulk.push({...box(p+'-lid',[.45,.025,.38],[0,1.4525,0],'sage',w),rotation:[lidOpen?-1.25:0,0,0],rotationAxis:[1,0,0],pivot:[0,0,-.19]});}
add('bulk-dispenser','Gravity dry-goods dispenser station',bulk,[],null,null,'Dispense turns lever, lowers illustrated hopper fill and fills the retained catch bag. Closed lid is required; refill resets fill/lever only with lid open. Static endpoint illustration, not granular flow, real quantity measurement, hygiene or equipment safety certification.');
configs['bulk-dispenser']={state:{dispensed:false,lidOpen:false},actions:[transition('toggle','Dispense one illustrated portion',{lidOpen:false,dispensed:false},{dispensed:true},'Close lid and refill before dispensing.'),toggle('lid','lidOpen','Open / close refill lid'),transition('refill','Refill hopper with lid open',{lidOpen:true},{dispensed:false},'Open refill lid before refilling.')]};range('bulk-dispenser','dispensed',[0,0,1],[0,-.8],'rad',['full-lever','dispensed-lever']);
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='retail-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const extra=extras[short]||[];
 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'retail-2026-11-11',measurement:{status:'estimated',note:'Original fictional retail furniture/equipment. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/retail-2026-11-11.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/retail.html'};
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
