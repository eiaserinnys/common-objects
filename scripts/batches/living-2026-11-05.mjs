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


// Lounge furniture: each root is a reusable source, not a new room registration.
add('sofa','Three-seat upholstered sofa',[
 ...feet(2.10,.86,.12),box('frame',[2.10,.22,.86],[0,.23,0],'wood'),
 ...[-1,1].map((x,i)=>box('arm-'+i,[.15,.42,.86],[x*.975,.48,0],'sage')),
 ...[-.60,0,.60].flatMap((x,i)=>[box('seat-'+i,[.58,.14,.65],[x,.41,.06],'sage'),box('back-'+i,[.58,.45,.15],[x,.695,-.33],'sage')]),
 box('rear-upholstery',[1.80,.43,.08],[0,.665,-.40],'sage')
],[],null,null,'Fixed upholstered sofa with three seats and arms; no adjustable or removable mechanism is represented. No cushion deformation, occupant animation or load certification.');
const recliner=[...feet(.82,.78,.10),box('plinth',[.74,.22,.70],[0,.21,0],'wood'),box('seat',[.66,.14,.60],[0,.43,.02],'cream'),...[-1,1].map((x,i)=>box('arm-'+i,[.10,.40,.72],[x*.36,.45,0],'sage'))];
for(const reclined of [false,true]){
 const s=reclined?'extended':'upright',when={reclined};
 recliner.push({...box(s+'-back-hinge',[.06,.04,.04],[0,.47,-.29],'metal',when),rotation:[reclined?-.50:0,0,0],rotationAxis:[1,0,0]});
 recliner.push({...box(s+'-back',[.64,.60,.14],[0,.28,0],'sage',when),parent:s+'-back-hinge'});
 recliner.push({...box(s+'-foot-hinge',[.06,.035,.035],[0,.39,.32],'metal',when),rotation:[reclined?-Math.PI/2:0,0,0],rotationAxis:[1,0,0]});
 recliner.push({...box(s+'-footrest',[.62,.28,.08],[0,-.14,0],'sage',when),parent:s+'-foot-hinge'});
}
add('recliner','Reclining lounge chair',recliner,[],'reclined','Recline / return chair','Backrest rotates 0.50 rad rearward and footrest rotates 90 degrees forward about distinct X hinges. Two coordinated endpoint poses; fixed seat, arms and feet. No powered actuation, continuous linkage or occupant simulation. Reserve rear and front clearance.');
add('coffee-table','Low lounge coffee table',[
 ...feet(1.20,.65,.08),...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('leg-'+i+j,[.045,.32,.045],[x*.51,.24,z*.235],'wood'))),
 box('top',[1.20,.035,.65],[0,.4175,0],'wood'),box('lower-shelf',[1.05,.025,.48],[0,.17,0],'cream')
],[surface('top',.435,1.14,.59),surface('lower-shelf',.1825,.97,.40)],null,null,'Rigid low table with a continuous top and lower shelf; no height or folding mechanism. Distinct from service-height and office tables.');
const ottoman=[...feet(.72,.52,.06),box('floor',[.72,.025,.52],[0,.0725,0],'wood'),...[-1,1].flatMap((x,i)=>[box('side-'+i,[.04,.30,.52],[x*.34,.235,0],'sage'),box('end-'+i,[.64,.30,.04],[0,.235,x*.24],'sage')])];
for(const open of [false,true]){
 const s=open?'open':'closed',when={open};
 ottoman.push({...box(s+'-hinge',[.04,.018,.018],[0,.385,-.26],'metal',when),rotation:[open?-Math.PI/2:0,0,0],rotationAxis:[1,0,0]});
 ottoman.push({...box(s+'-lid',[.74,.09,.54],[0,.045,.26],'cream',when),parent:s+'-hinge'});
}
add('storage-ottoman','Hinged storage ottoman',ottoman,[{...surface('interior',.085,.60,.40),availableWhen:{open:true}}],'open','Open / close upholstered lid','Cushioned lid rotates 90 degrees around rear X hinge to expose storage floor. No loose cushion removal masquerading as operation. Two poses, no damping or load rating.');
add('media-console','Low sliding-door media console',[
 ...feet(1.60,.42,.12),box('bottom',[1.60,.03,.42],[0,.135,0],'wood'),box('top',[1.60,.035,.42],[0,.5525,0],'wood'),
 ...[-1,1].map((x,i)=>box('side-'+i,[.025,.38,.42],[x*.7875,.34,0],'wood')),
 box('rear',[1.55,.38,.02],[0,.34,-.20],'sage'),box('divider',[.025,.38,.38],[0,.34,0],'wood'),
 ...[false,true].flatMap(open=>[box((open?'right':'left')+'-door',[.76,.36,.025],[open?.39:-.39,.34,.223],'sage',{open}),box((open?'right':'left')+'-pull',[.018,.09,.018],[open?.08:-.70,.35,.245],'dark',{open})]),
 box('upper-track',[1.56,.014,.014],[0,.532,.237],'metal'),box('lower-track',[1.56,.014,.014],[0,.155,.237],'metal')
],[surface('top',.57,1.50,.36),{...offsetSurface('left-bay',.15,.69,.32,-.395),availableWhen:{open:true}},{...offsetSurface('right-bay',.15,.69,.32,.395),availableWhen:{open:false}}],'open','Slide door to left / right bay','One door travels 0.78 m between two bays within cabinet width. Cable recess is illustrative; no cable routing, automatic child attachments or audio system. Different from office drawer credenza and tall utility cabinet.');
materials.glow={color:[.95,.72,.36],emissionWhenOn:.65};
add('floor-lamp','Freestanding shaded floor lamp',[
 cyl('weighted-base',.18,.035,[0,.0175,0],'dark'),cyl('stem',.018,1.39,[0,.73,0],'metal'),
 {...cyl('shade',.25,.32,[0,1.51,0],'cream',undefined,.14),geometry:{type:'cylinder',radiusBottom:.25,radiusTop:.14,height:.32,segments:24,openBottom:true,openTop:true}},
 cyl('bulb',.055,.10,[0,1.46,0],'glow'),box('foot-switch',[.07,.025,.04],[0,.0475,.13],'dark')
],[],'on','Switch floor lamp on / off','Electrical on/off is represented by bulb material emission. Shade, stem and base remain fixed. No cast illumination, shadows, mains simulation or articulated shade.');
add('television','Freestanding flat-panel television',[
 ...[-1,1].map((x,i)=>box('foot-'+i,[.22,.025,.25],[x*.34,.0125,0],'dark')),
 ...[-1,1].map((x,i)=>box('stand-'+i,[.035,.12,.045],[x*.34,.08,-.01],'metal')),
 box('housing',[1.10,.64,.055],[0,.44,-.015],'dark'),box('rear-electronics',[.45,.27,.04],[0,.38,-.0625],'metal'),
 box('screen-off',[1.04,.58,.006],[0,.44,.016],'dark',{on:false}),box('screen-on',[1.04,.58,.006],[0,.44,.016],'sage',{on:true}),
 box('test-horizon',[1.02,.12,.004],[0,.31,.021],'cream',{on:true}),cyl('test-sun',.075,.005,[.28,.57,.023],'food',{on:true}),
 ...[-1,1].map((x,i)=>box('rear-port-'+i,[.06,.035,.006],[x*.14,.31,-.086],'dark'))
].map(p=>p.id==='test-sun'?{...p,rotation:[Math.PI/2,0,0]}:p),[],'on','Power display on / off','Display power toggles between blank screen and an original static test image. Not video playback, broadcast reception or audio. Feet rest on a certified console surface at unit scale; no wall mount.');
const screen=[];
for(const folded of [false,true])for(let n=0;n<3;n++){
 const s=(folded?'folded':'spread')+'-'+n,when={folded};
 // Hinged chain: each next leaf begins at previous leaf's far stile.
 screen.push({...box(s+'-hinge',[.012,.02,.012],n?[.55,0,0]:[-.55,0,0],'metal',when),position:n?[.55,.01,0]:[-.55,.01,0],parent:n?(folded?'folded':'spread')+'-'+(n-1)+'-hinge':null,rotation:[0,n?(folded?(n===1?2.7:-2.7):(n===1?.6:-.6)):0,0]});
 for(const x of [.02,.53])screen.push({...box(s+'-stile-'+x,[.035,1.66,.035],[x,.84,0],'wood',when),parent:s+'-hinge'});
 for(const y of [.12,1.63])screen.push({...box(s+'-rail-'+y,[.53,.04,.035],[.275,y,0],'wood',when),parent:s+'-hinge'});
 screen.push({...box(s+'-fabric',[.48,1.43,.018],[.275,.875,0],'cream',when),parent:s+'-hinge'});
}
// Root feet are stable in spread and folded poses. This stand-mounted screen deliberately retains its floor base.
screen.push(box('base',[1.05,.025,.55],[0,.0125,0],'dark'));
add('privacy-screen','Stand-mounted three-leaf folding screen',screen,[],'folded','Fold / spread privacy leaves','Three connected leaves pivot about vertical hinge axes on a fixed weighted stand. Endpoint spreads change partition width without relocating the base. No freestanding balance or hinge collision simulation; endpoint clearance is included.');
add('coat-stand','Freestanding branching coat stand',[
 cyl('base',.24,.035,[0,.0175,0],'dark'),cyl('post',.025,1.72,[0,.895,0],'wood'),
 ...[0,1,2,3].flatMap((n)=>{const a=n*Math.PI/2;return [{...box('branch-'+n,[.025,.025,.28],[Math.sin(a)*.13,1.60,Math.cos(a)*.13],'wood'),rotation:[0,a,0]},cyl('peg-'+n,.018,.09,[Math.sin(a)*.26,1.635,Math.cos(a)*.26],'wood')];}),
 ...[-1,1].map((x,i)=>box('lower-hook-'+i,[.20,.025,.025],[x*.10,1.15,0],'wood'))
],[],null,null,'Rigid coat stand for reception or lounge entry. No folding, height mechanism or cloth attachment. Branches are not certified flat support surfaces; distinct from utility drip-tray tool stand.');
const nesting=[];
const table=(prefix,w,d,h,x,when)=>[...[-1,1].flatMap((a,i)=>[-1,1].map((b,j)=>box(prefix+'-leg-'+i+j,[.025,h-.025,.025],[x+a*(w/2-.025),(h-.025)/2,b*(d/2-.025)],'metal',when))),box(prefix+'-top',[w,.025,d],[x,h-.0125,0],'wood',when)];
nesting.push(...table('outer',.60,.48,.58,0));
for(const extended of [false,true])nesting.push(...table(extended?'out':'in',.45,.38,.47,extended?.56:0,{extended}));
add('nesting-tables','Nesting side-table pair',nesting,[surface('outer-top',.58,.54,.42),{...offsetSurface('inner-top',.47,.39,.32,.56),availableWhen:{extended:true}}],'extended','Pull out / nest smaller side table','One authored two-table assembly, counted once; neither constituent is separately registered. Smaller whole table translates 0.56 m to provide a second surface, rather than a cosmetic part toggle. Fixed endpoint poses; loose items do not follow table movement.');
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='living-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'living-2026-11-05',measurement:{status:'estimated',note:'Original fictional living furniture/equipment. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/living-2026-11-05.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/living.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
