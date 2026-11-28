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
// Recessed pocket mouths are gaps in the cloth and segmented rails, not painted dots.
const pool=[...feet(1.4,2.4,.70),box('slate',[1.4,.05,2.4],[0,.725,0],'wood'),box('cloth-center',[1.12,.025,2.12],[0,.7625,0],'sage')];
for(const x of [-.61,.61])for(const z of [-.56,.56])pool.push(box('cloth-edge-'+x+z,[.10,.025,.94],[x,.7625,z],'sage'),box('side-rail-'+x+z,[.12,.065,.94],[x*1.06,.79,z],'wood'));
for(const z of [-1.14,1.14])pool.push(box('end-rail-'+z,[1.12,.065,.12],[0,.7825,z],'wood'));
for(const x of [-.63,.63])for(const z of [-1.11,0,1.11])pool.push(cyl('pocket-'+x+z,.06,.008,[x,.754,z],'dark'));
for(let n=0;n<3;n++)pool.push(cyl('ball-'+n,.027,.054,[-.06+n*.06,.802,0],n===0?'cream':'red'));
add('billiards','Recessed-pocket billiard table',pool,[],null,null,'Static table with recessed pocket mouths, segmented cushions and retained sample balls. No cue, playable billiards, rolling, collision, pocketing, scoring or regulation-size claim.');
// Eight complete rods, handles and player rows rotate together around the long X rod axes.
const football=[...feet(.74,1.4,.72),box('field',[.74,.035,1.40],[0,.7375,0],'sage'),...[-.385,.385].map((x,n)=>box('side-'+n,[.07,.22,1.48],[x,.81,0],'wood')),...[-.71,.71].map((z,n)=>box('end-'+n,[.74,.22,.06],[0,.81,z],'wood'))];
for(let n=0;n<7;n++)football.push(box('field-line-'+n,[.66,.002,.008],[0,.756,-.60+n*.20],'paper'));
for(const kicked of [false,true])for(let n=0;n<8;n++){const pre=kicked?'kick':'rest',w={kicked},id=pre+'-rod-'+n,z=-.59+n*.168;football.push({...pipe(id,.009,1.22,[0,.88,z],'x','metal',w),rotation:[0,0,Math.PI/2],rotationAxis:[1,0,0]},pipe(pre+'-handle-'+n,.025,.14,[n%2?.67:-.67,.88,z],'x','dark',w));for(let j=0;j<3;j++){const x=-.22+j*.22,t=kicked?.65:0;football.push({...box(pre+'-player-'+n+'-'+j,[.035,.13,.035],[x,.845,z],n%2?'cream':'red',w),pivot:[0,.035,0],rotation:[t,0,0],rotationAxis:[1,0,0]});}}
add('foosball','Eight-rod table football',football,[],'kicked','Turn / reset player rows','All 24 retained figures rotate .65 rad around rod-height X axes; shafts and grips stay mounted. Discrete kick posture; no ball trajectory, scoring, autonomous play or continuous rods.');range('foosball','kicked',[1,0,0],[0,.65],'rad',['rest-player-0-0','kick-player-0-0']);
// Right half pivots upward about the center hinge; occupied right deck cannot disappear.
const tennis=[...feet(1.3,2.3,.72),...[-1.10,1.10].map((z,n)=>box('crossframe-'+n,[1.30,.08,.08],[0,.68,z],'metal')),box('underframe',[.08,.08,2.2],[0,.68,0],'metal'),box('left-deck',[1.525,.04,1.37],[0,.74,-.685],'sage'),pipe('hinge',.02,1.525,[0,.74,0],'x','metal')];
for(const folded of [false,true]){const pre=folded?'up':'flat',w={folded},root=pre+'-deck';tennis.push({...box(root,[1.525,.04,1.37],[0,.74,.685],'sage',w),pivot:[0,0,-.685],rotation:[folded?-Math.PI/2:0,0,0],rotationAxis:[1,0,0]});for(const x of [-.74,.74])tennis.push({...box(pre+'-line-'+x,[.012,.002,1.34],[x,.021,0],'paper',w),parent:root});tennis.push({...box(pre+'-end-line',[1.49,.002,.012],[0,.021,.66],'paper',w),parent:root});}
for(const x of [-.74,.74])tennis.push(box('left-line-'+x,[.012,.002,1.34],[x,.761,-.685],'paper'));
for(const x of [-.79,.79])tennis.push(box('net-post-'+x,[.025,.16,.025],[x,.82,-.035],'metal'),box('net-clamp-'+x,[.065,.03,.06],[x*.97,.745,-.035],'metal'));
for(let n=0;n<8;n++)tennis.push(box('net-strand-'+n,[1.58,.004,.004],[0,.78+n*.017,-.035],'cream'));
add('table-tennis','Half-fold table-tennis table',tennis,[{...offsetSurface('right-deck',.76,1.30,1.12,0,.70),availableWhen:{folded:false}}],'folded','Fold / lower right table half','Full retained right deck and markings fold 90 degrees at center X hinge. Right support unavailable when folded: attached contents block folding atomically. Fixed left half/net. No live table tennis, ball, automatic legs or swept collision.');range('table-tennis','folded',[1,0,0],[0,-Math.PI/2],'rad',['flat-deck','up-deck']);
const powerConfig=(step,label)=>({state:{powered:false,stepped:false},actions:[{...toggle('toggle','powered','Power on / off'),requires:{stepped:false},blockedMessage:'Reset play endpoint before power off.'},{...toggle('play','stepped',label),requires:{powered:true},blockedMessage:'Power on before play endpoint.'}],stateRules:[{when:{stepped:true},must:{powered:true},message:'Play endpoint requires power.'}]});
const arcade=[box('plinth',[.70,.06,.74],[0,.03,0],'dark'),box('cabinet',[.64,.86,.64],[0,.49,0],'wood'),box('control-deck',[.72,.06,.35],[0,.95,.22],'sage'),box('screen-back',[.64,.62,.10],[0,1.27,-.21],'dark'),box('marquee',[.70,.16,.30],[0,1.66,-.18],'sage'),...[-.335,.335].map((x,n)=>box('cheek-'+n,[.03,.82,.48],[x,1.30,-.12],'wood')),box('coin-slot',[.08,.025,.012],[.18,.60,.326],'dark')];
for(const powered of [false,true])arcade.push(box(powered?'screen-on':'screen-off',[.55,.48,.012],[0,1.29,-.154],powered?'glass':'dark',{powered}));
for(const stepped of [false,true]){const pre=stepped?'move':'idle',w={stepped};arcade.push({...pipe(pre+'-stick',.012,.09,[-.18,1.025,.22],'y','metal',w),pivot:[0,-.045,0],rotation:[0,0,stepped?-.4:0],rotationAxis:[0,0,1]},box(pre+'-cursor',[.065,.025,.012],[stepped?.16:-.16,1.29,-.142],'paper',{powered:true,stepped}));}
for(let n=0;n<3;n++)arcade.push(cyl('button-'+n,.024,.025,[.04+n*.07,.9925,.22],'red'));
add('arcade','Upright joystick arcade cabinet',arcade,[],null,null,'Power reveals screen; play endpoint tilts retained joystick and moves screen cursor. Reset before power-off. No executable videogame, sound, payment, scores or elapsed game.');configs.arcade=powerConfig('stepped','Move / reset cursor');range('arcade','stepped',[0,0,1],[0,-.4],'rad',['idle-stick','move-stick']);
const pin=[...[-.24,.24].map((x,n)=>cyl('flipper-pin-'+n,.018,.02,[x,.915,.40],'metal')),...feet(.70,1.4,.78),box('body',[.70,.16,1.40],[0,.80,0],'wood'),box('playfield',[.62,.025,1.30],[0,.8925,0],'sage'),...[-.335,.335].map((x,n)=>box('side-rail-'+n,[.03,.08,1.4],[x,.92,0],'metal')),box('backbox',[.70,.65,.18],[0,1.20,-.61],'wood'),box('front-rail',[.70,.08,.035],[0,.92,.6825],'metal')];
for(const x of [-.18,.18])for(const z of [-.30,-.05])pin.push(cyl('bumper-'+x+z,.06,.07,[x,.94,z],'cream'));
for(const powered of [false,true])pin.push(box(powered?'display-on':'display-off',[.58,.40,.012],[0,1.22,-.514],powered?'glass':'dark',{powered}));
for(const stepped of [false,true])for(const x of [-.14,.14])pin.push({...box((stepped?'up':'down')+'-flipper-'+x,[.20,.025,.045],[x,.92,.40],'red',{stepped}),pivot:[x<0?-.10:.10,0,0],rotation:[0,(x<0?1:-1)*(stepped?.6:0),0],rotationAxis:[0,1,0]});
add('pinball','Open-view pinball cabinet',pin,[],null,null,'Open inspection playfield: both retained flippers pivot about outer Y axes after power indication; reset before power off. No glass transparency, ball physics, scoring, tilt sensing or complete pinball game.');configs.pinball=powerConfig('stepped','Flip / reset paddles');range('pinball','stepped',[0,1,0],[0,.6],'rad',['down-flipper--0.14','up-flipper--0.14']);
const shuffle=[...feet(.65,2.8,.75),box('trough',[.65,.08,3],[0,.79,0],'dark'),box('lane',[.44,.03,2.80],[0,.845,0],'wood'),...[-.31,.31].map((x,n)=>box('side-'+n,[.03,.10,3],[x,.86,0],'wood')),...[-1.485,1.485].map((z,n)=>box('end-'+n,[.65,.10,.03],[0,.86,z],'wood'))];
for(let n=0;n<4;n++)shuffle.push(box('score-line-'+n,[.44,.002,.008],[0,.861,-1.25+n*.18],'cream'));
for(const slid of [false,true])shuffle.push(cyl(slid?'puck-end':'puck-start',.045,.025,[0,.8725,slid?-1.08:.95],'metal',{slid}));
add('shuffleboard','Long-trough shuffleboard table',shuffle,[],'slid','Slide / reset sample puck','Retained puck moves 2.03 m along the wood lane into marked scoring bands. No friction, collision, scored game or continuous movement. The puck is an internal part, not another asset.');range('shuffleboard','slid',[0,0,1],[.95,-1.08],'m',['puck-start','puck-end']);
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='recreation-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const extra=extras[short]||[];
 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'recreation-2026-11-28',measurement:{status:'estimated',note:'Original fictional recreation furniture/equipment; not manufacturer specifications. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/recreation-2026-11-28.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/recreation.html'};
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
