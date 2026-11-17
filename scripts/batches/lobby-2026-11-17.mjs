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

// Mail bank: slotted individual compartments, one hinged retrieval door.
const mail=[...feet(1.2,.38,.42),box('back',[1.2,1.08,.025],[0,.96,-.1775],'sage')];
for(const x of [-.585,-.195,.195,.585])mail.push(box('divider-'+x,[.025,1.08,.38],[x,.96,0],'sage'));
for(let row=0;row<4;row++)mail.push(box('shelf-'+row,[1.2,.025,.38],[0,.43+row*.35,0],'sage'));
for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x=(c-1)*.39,y=.6+r*.35,id=r+'-'+c;if(r===1&&c===1){for(const open of [false,true]){const k=open?'open':'closed',w={open};mail.push({...box(k+'-door',[.355,.29,.018],[x,y,.198],'cream',w),pivot:[-.1775,0,0],rotation:[0,open?-1.4:0,0],rotationAxis:[0,1,0]}, {...box(k+'-label',[.09,.035,.005],[0,-.06,.0115],'paper',w),parent:k+'-door'}, {...pipe(k+'-lock',.012,.008,[.12,-.06,.013],'z','metal',w),parent:k+'-door'});}}else mail.push(box('door-'+id,[.355,.29,.018],[x,y,.198],'cream'),box('label-'+id,[.09,.035,.006],[x,y-.06,.210],'paper'));mail.push(pipe('hinge-'+id,.014,.23,[x-.18,y,.19],'y','metal'),box('slot-header-'+id,[.365,.03,.04],[x,y+.16,.18],'cream'),box('slot-'+id,[.26,.012,.006],[x,y+.16,.203],'dark'));}
add('mail-bank','Nine-compartment freestanding mail bank',mail,[],'open','Open / close center mailbox','Center retrieval door hinges 1.4 rad; slots and other eight doors are static details. One bank, not nine counted objects. No postal routing or lock authentication.');range('mail-bank','open',[0,1,0],[0,-1.4],'rad',['closed-door','open-door']);
// Parcel drop has open bin cavity, upper deposit flap and a guarded transfer illustration.
const parcel=[box('plinth',[.72,.08,.62],[0,.04,0],'dark'),box('back',[.72,1.22,.025],[0,.69,-.2975],'sage'),...[-.3475,.3475].map((x,n)=>box('side-'+n,[.025,1.22,.62],[x,.69,0],'sage')),box('top',[.72,.025,.62],[0,1.3125,0],'sage'),box('bin-floor',[.67,.025,.56],[0,.13,0],'metal'),box('front-upper-rail',[.67,.20,.025],[0,.80,.2975],'cream'),box('front-lower-rail',[.67,.10,.025],[0,.17,.2975],'cream'),...[-.285,.285].map((x,n)=>box('front-stile-'+n,[.10,.58,.025],[x,.51,.2975],'cream')),...[-.15,0,.15].map((x,n)=>box('inspection-bar-'+n,[.018,.50,.025],[x,.46,.2975],'metal')),box('divider',[.67,.025,.56],[0,.94,0],'metal')];
parcel.push(pipe('flap-hinge',.025,.69,[0,.98,.32],'x','metal'),...[-.32,.32].map((x,n)=>box('hinge-bracket-'+n,[.04,.08,.065],[x,.98,.295],'metal')));
for(const open of [false,true])parcel.push({...box(open?'flap-open':'flap-closed',[.66,.28,.022],[0,1.12,.32],'sage',{open}),pivot:[0,-.14,0],rotation:[open?1.0:0,0,0],rotationAxis:[1,0,0]});
for(const delivered of [false,true])parcel.push(box(delivered?'parcel-collected':'parcel-ready',[.32,.18,.25],[0,delivered?.2325:1.0425,0],'wood',{delivered}));
add('parcel-drop','Secure parcel deposit pedestal',parcel,[],null,null,'Open the flap to inspect the sample parcel; close then deposit moves that retained sample into the lower bin. Reset only with flap open. Lower grille reveals the deposited sample. Discrete internal illustration; no gravity, arbitrary parcel attachment, theft protection or inventory service.');configs['parcel-drop']={state:{open:false,delivered:false},actions:[toggle('toggle','open','Open / close deposit flap'),transition('deposit','Deposit sample parcel',{open:false,delivered:false},{delivered:true},'Close the flap and reset the sample before depositing.'),transition('reset','Reset sample parcel',{open:true},{delivered:false},'Open the flap before resetting.') ]};range('parcel-drop','open',[1,0,0],[0,1],'rad',['flap-closed','flap-open']);
const truck=[pipe('axle',.022,.54,[0,.15,0],'x'),...[-.27,.27].map((x,n)=>pipe('wheel-'+n,.15,.07,[x,.15,0],'x','dark')),...[-.20,.20].map((x,n)=>pipe('upright-'+n,.022,1.1,[x,.65,0],'y','sage')),pipe('handle',.025,.44,[0,1.20,0],'x','sage')];
for(const y of [.32,.60,.88])truck.push(pipe('brace-'+y,.018,.42,[0,y,0],'x','sage'));
truck.push(box('toe-mount',[.43,.13,.04],[0,.0875,0],'metal'));
for(const folded of [false,true])truck.push({...box(folded?'toe-folded':'toe-down',[.43,.025,.32],[0,.025,.16],'metal',{folded}),pivot:[0,0,-.16],rotation:[folded?-Math.PI/2:0,0,0],rotationAxis:[1,0,0]});
add('hand-truck','Two-wheel folding-toe hand truck',truck,[],'folded','Fold / lower toe plate','Toe plate pivots vertically for storage. Upright parked illustration; wheels, cargo loading and tipping are not simulated. No load certification.');range('hand-truck','folded',[1,0,0],[0,-Math.PI/2],'rad',['toe-down','toe-folded']);
const intercom=[box('base',[.42,.06,.36],[0,.03,0],'dark'),box('post',[.14,1.16,.14],[0,.64,0],'metal'),box('housing',[.32,.44,.12],[0,1.37,0],'sage'),box('speaker',[.24,.17,.008],[0,1.43,.064],'dark')];
for(let n=0;n<6;n++)intercom.push(box('grille-'+n,[.22,.008,.004],[0,1.37+n*.025,.07],'metal'));
for(const calling of [false,true])intercom.push(pipe(calling?'button-pressed':'button-rest',.03,.012,[0,1.24,calling?.063:.066],'z','cream',{calling}),box(calling?'call-lit':'call-dark',[.08,.014,.008],[0,1.32,.064],calling?'green':'dark',{calling}));
add('intercom','Visitor call intercom pedestal',intercom,[],'calling','Press / release visitor call','Button depression and call indicator are local illustrative endpoints. No actual call, recording, network connection or door unlock.');range('intercom','calling',[0,0,1],[.066,.063],'m',['button-rest','button-pressed']);
const kiosk=[box('base',[.56,.055,.48],[0,.0275,0],'dark'),box('column',[.30,1.05,.26],[0,.58,0],'sage'),box('terminal',[.54,.50,.15],[0,1.30,0],'cream'),box('screen',[.44,.30,.012],[0,1.36,.081],'dark'),box('printer-slot',[.21,.025,.012],[0,1.11,.082],'dark')];
for(const issued of [false,true]){kiosk.push(box(issued?'screen-issued':'screen-idle',[.30,.035,.004],[0,1.40,.089],issued?'green':'sage',{issued}),box(issued?'ticket-out':'ticket-inside',[.16,.12,.005],[0,issued?1.06:1.18,issued?.095:0],'paper',{issued}));}
add('visitor-kiosk','Visitor badge issue kiosk',kiosk,[],'issued','Issue / clear sample badge','Screen status and retained sample badge feed from the slot. No personal information, identity check, payments, real printer or visitor database.');range('visitor-kiosk','issued',[0,1,0],[1.18,1.06],'m',['ticket-inside','ticket-out']);
const umbrellas=[box('drip-pan',[.60,.035,.36],[0,.0175,0],'sage'),...[-.28,.28].flatMap((x,i)=>[-.16,.16].map((z,j)=>box('post-'+i+j,[.025,.55,.025],[x,.31,z],'metal')))];
for(const z of [-.16,.16])umbrellas.push(box('rim-'+z,[.58,.025,.025],[0,.58,z],'metal'));
for(const x of [-.28,0,.28])umbrellas.push(box('cross-'+x,[.025,.025,.34],[x,.58,0],'metal'));
add('umbrella-rack','Divided umbrella drip rack',umbrellas,[],null,null,'Fixed divided frame and catch pan for long wet umbrellas. Empty rack is intentional; no water collection process, umbrella attachment or removable-part toggle.');
const turn=[box('base',[.45,.055,.75],[0,.0275,0],'dark'),box('pillar',[.32,.86,.56],[0,.485,0],'sage'),box('head',[.43,.13,.74],[0,.98,0],'cream'),pipe('hub',.11,.10,[.22,.83,0],'x','metal')];
for(const stepped of [false,true]){const p=stepped?'advanced':'rest',w={stepped},a=stepped?Math.PI*2/3:0;turn.push({...pipe(p+'-rotor',.065,.05,[.29,.83,0],'x','metal',w),rotation:[a,0,Math.PI/2],rotationAxis:[1,0,0]});for(let n=0;n<3;n++){let t=n*Math.PI*2/3+a;turn.push(tube(p+'-arm-'+n,[.29,.83,0],[.68,.83+.33*Math.sin(t),.33*Math.cos(t)],.024,n===0?'red':'metal',w));}}
for(const unlocked of [false,true])turn.push(box(unlocked?'permit':'stop',[.12,.012,.14],[0,1.051,0],unlocked?'green':'red',{unlocked}));
add('turnstile','Three-arm visitor turnstile',turn,[],null,null,'Release permits one indexed 120-degree rotor step, which relocks. Red arm identifies phase. Reset requires locked state. No credential verification, people collision or safety-certified egress; endpoint demonstration only.');configs.turnstile={state:{unlocked:false,stepped:false},actions:[toggle('toggle','unlocked','Release / lock rotor'),transition('step','Advance one index',{unlocked:true,stepped:false},{stepped:true,unlocked:false},'Release the reset rotor before stepping.'),transition('reset','Reset rotor',{unlocked:false},{stepped:false},'Lock rotor before resetting.')]};range('turnstile','stepped',[1,0,0],[0,Math.PI*2/3],'rad',['rest-arm-0','advanced-arm-0']);
const polish=[box('base',[.66,.05,.40],[0,.025,0],'dark'),...[-.31,.31].map((x,n)=>box('side-'+n,[.04,.32,.36],[x,.21,0],'sage')),box('roof',[.66,.04,.36],[0,.39,0],'sage'),pipe('shaft',.018,.60,[0,.20,0],'x','metal'),pipe('switch-post',.02,.50,[.27,.66,-.10],'y','metal'),cyl('push-cap',.035,.025,[.27,.9225,-.10],'dark')];
for(const running of [false,true])for(const [n,x] of [[0,-.18],[1,.18]]){polish.push(pipe((running?'on':'off')+'-brush-'+n,.13,.22,[x,.20,0],'x',n?'wood':'dark',{running}));for(let k=0;k<8;k++){const t=k*Math.PI/4+(running?.2:0);polish.push({...box((running?'on':'off')+'-bristle-'+n+'-'+k,[.22,.018,.025],[x,.20+.13*Math.sin(t),.13*Math.cos(t)],'metal',{running}),rotation:[-t,0,0],rotationAxis:[1,0,0]});}}
add('shoe-polisher','Twin-brush shoe polishing machine',polish,[],'running','Step brush / return resting phase','Two brush drums show a single indexed rotation endpoint, not elapsed running. No inserted shoe, polishing result, motor timing, brush deformation or dust physics.');range('shoe-polisher','running',[1,0,0],[0,.2],'rad',['off-bristle-0-0','on-bristle-0-0']);
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='lobby-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const extra=extras[short]||[];
 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'lobby-2026-11-17',measurement:{status:'estimated',note:'Original fictional lobby furniture/equipment; not manufacturer specifications. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/lobby-2026-11-17.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/lobby.html'};
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
