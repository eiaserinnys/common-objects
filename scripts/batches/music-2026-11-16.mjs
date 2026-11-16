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
// Upright cabinet and individually separated keys; one middle C demonstrates key travel.
const piano=[...feet(1.40,.58,.10),box('lower-case',[1.40,.68,.36],[0,.44,-.08],'wood'),box('upper-case',[1.45,.43,.32],[0,.985,-.10],'wood'),box('top',[1.48,.035,.37],[0,1.2175,-.10],'wood'),box('keyboard-bed',[1.40,.045,.29],[0,.72,.13],'dark')];
for(const x of [-.65,.65])piano.push(box('front-leg-'+x,[.045,.65,.045],[x,.375,.24],'wood'));
for(const x of [-.705,.705])piano.push(box('cheek-'+x,[.04,.12,.30],[x,.78,.12],'wood'));
for(let n=0;n<52;n++) {const x=(n-25.5)*.0235;if(n!==24)piano.push(box('white-key-'+n,[.0225,.022,.21],[x,.761,.14],'paper'));else for(const pressed of [false,true])piano.push({...box(pressed?'key-down':'key-up',[.0225,.022,.21],[x,.761,.14],'paper',{pressed}),pivot:[0,0,-.10],rotation:[pressed?.065:0,0,0],rotationAxis:[1,0,0]});if(![2,6].includes(n%7)&&n<51)piano.push(box('black-key-'+n,[.012,.029,.115],[x+.01175,.784,.09],'dark'));}
for(const x of [-.13,0,.13])piano.push(box('pedal-'+x,[.035,.022,.15],[x,.12,.16],'metal'),box('pedal-neck-'+x,[.025,.09,.025],[x,.15,.09],'metal'));
piano.push(box('music-ledge',[.80,.022,.07],[0,.91,.08],'wood'));
add('upright-piano','Upright acoustic piano',piano,[offsetSurface('top',1.235,1.35,.28,0,-.10)],'pressed','Depress / release middle key','A 52-white-key keyboard with one white key that pivots at its rear fulcrum by .065 rad. Other keys and pedals are retained static detail; no sound, hammer action, sustain or timed music.');range('upright-piano','pressed',[1,0,0],[0,.065],'rad',['key-up','key-down']);
// Compact kit is one instrument source; each drum/cymbal is retained internal equipment.
const drums=[pipe('bass-shell',.28,.36,[0,.29,0],'z','sage'),pipe('bass-front-head',.266,.012,[0,.29,.186],'z','cream'),pipe('bass-back-head',.266,.012,[0,.29,-.186],'z','cream')];
for(const x of [-.30,.30])drums.push(tube('bass-spur-'+x,[x*.7,.25,.10],[x,.01,.23],.012));
for(const [n,x,y,z,r] of [[0,-.34,.72,-.05,.17],[1,.30,.75,-.03,.19],[2,.55,.53,.36,.22]]){drums.push(cyl('drum-shell-'+n,r,.23,[x,y,z],'sage'),cyl('drum-head-'+n,r+.008,.012,[x,y+.121,z],'paper'));for(const [k,dx,dz] of [[0,-.1,-.08],[1,.1,-.08],[2,0,.12]])drums.push(tube('leg-'+n+k,[x+dx,y-.115,z+dz],[x+dx,.008,z+dz],.012));}
for(const [n,x,z,y,r] of [[0,-.60,.27,1.18,.24],[1,.55,-.40,1.29,.27]]){drums.push(pipe('cymbal-post-'+n,.012,y,[x,y/2,z]),cyl('cymbal-'+n,r,.018,[x,y,z],'food',undefined,.045));for(let k=0;k<3;k++){const t=k*2*Math.PI/3;drums.push(tube('tripod-'+n+k,[x,.20,z],[x+.24*Math.cos(t),.008,z+.24*Math.sin(t)],.009));}}
drums.push(box('pedal-base',[.15,.018,.28],[0,.009,-.40],'metal'),pipe('pedal-axle',.018,.16,[0,.07,-.29],'x','metal'));
drums.push(box('heel-pivot',[.11,.035,.025],[0,.0275,-.50],'metal'),box('pedal-mount',[.15,.045,.10],[0,.03,-.24],'metal'),...[-.065,.065].map((x,n)=>box('axle-pillar-'+n,[.02,.07,.03],[x,.045,-.29],'metal')));
for(const struck of [false,true]){const p=struck?'strike':'rest',w={struck};drums.push({...box(p+'-pedal',[.10,.018,.20],[0,.055,-.40],'dark',w),pivot:[0,0,-.10],rotation:[struck?0:-.18,0,0],rotationAxis:[1,0,0]}, {...box(p+'-beater',[.015,.25,.015],[0,.195,-.29],'metal',w),pivot:[0,-.125,0],rotation:[struck?.34:-.24,0,0],rotationAxis:[1,0,0]});drums.push({...pipe(p+'-felt',.038,.04,[0,.25,0],'z','cream',w),parent:p+'-beater',position:[0,.125,0],rotation:[Math.PI/2,0,0]});}
add('drum-kit','Compact four-drum rehearsal kit',drums,[],'struck','Press / release bass drum pedal','Footboard pivots down and linked beater swings toward the bass head. Other drums and cymbals are static. One compound instrument, no separately counted drum assets; no sound or real linkage simulation.');range('drum-kit','struck',[1,0,0],[-.24,.34],'rad',['rest-beater','strike-beater']);
const vibes=[...feet(1.35,.62,.79),box('left-rail',[.045,.10,.62],[-.66,.81,0],'wood'),box('right-rail',[.045,.10,.62],[.66,.81,0],'wood'),box('rear-rail',[1.32,.045,.035],[0,.82,-.29],'wood'),box('front-rail',[1.32,.045,.035],[0,.82,.29],'wood'),box('lower-brace',[1.28,.035,.035],[0,.20,0],'metal')];
vibes.push(box('resonator-rack',[1.32,.025,.06],[0,.84,0],'metal'),...[-.625,.625].map((x,n)=>box('lower-cross-'+n,[.035,.035,.55],[x,.20,0],'metal')),box('pedal-support',[.10,.07,.07],[0,.15,.075],'metal'));
vibes.push(...[-.11,.11].map((z,n)=>box('bar-support-'+n,[1.32,.025,.022],[0,.8585,z],'dark')));
for(let n=0;n<18;n++){const x=-.60+n*.07,len=.53-n*.012;vibes.push(box('bar-'+n,[.061,.018,len],[x,.88,0],'steel'),cyl('resonator-'+n,.025,.38-n*.013,[x,.65+n*.0065,0],'food'));}
for(const damped of [false,true]){const p=damped?'touch':'lower',w={damped};vibes.push(box(p+'-damper',[1.28,.025,.035],[0,damped?.8585:.81,.08],'dark',w),box(p+'-rod',[.015,(damped?.8585:.81)-.1625,.015],[0,((damped?.8585:.81)+.1375)/2,.08],'metal',w),{...box(p+'-pedal',[.12,.025,.23],[0,.15,.19],'metal',w),pivot:[0,0,-.115],rotation:[damped?-.20:0,0,0],rotationAxis:[1,0,0]});}
add('vibraphone','Eighteen-bar practice vibraphone',vibes,[],'damped','Engage / release damper','Felt rail rises .0485 m to the bar undersides; pedal and rod show corresponding endpoints. Eighteen illustrative bars, not a complete concert pitch range. No sound, mallet performance or motor-driven vibrato.');range('vibraphone','damped',[0,1,0],[.81,.8585],'m',['lower-damper','touch-damper']);
// Triangular frame keeps each string between soundboard and sloping neck.
const harp=[box('base',[.85,.07,.40],[0,.035,0],'wood'),tube('pillar',[-.34,.07,0],[-.34,1.48,0],.038,'wood'),tube('neck',[-.34,1.48,0],[.34,.86,0],.045,'wood'),tube('soundboard',[.34,.12,0],[.34,.86,0],.075,'wood')];
for(let n=0;n<17;n++){const x=-.29+n*.035,top=1.48-(x+.34)*.62/.68;harp.push(tube('string-'+n,[x,.13,0],[x,top-.03,0],.0018,n%5===0?'red':'paper'),tube('base-rail-'+n,[x,.13,0],[.34,.13,0],.003,'wood'));}
harp.push(tube('diagonal-soundbox',[-.30,.10,0],[.34,.86,0],.055,'wood'));
// String lower endpoints meet the diagonal soundbox rather than hovering inside the frame.
for(let n=0;n<17;n++){const p=harp.find(p=>p.id==='string-'+n),x=-.29+n*.035,top=1.48-(x+.34)*.62/.68,bottom=.10+(x+.30)*.76/.64;Object.assign(p,tube(p.id,[x,bottom,0],[x,top-.03,0],.0018,n%5===0?'red':'paper'));}
add('harp','Compact floor harp depiction',harp,[],null,null,'Fixed acoustic instrument: triangular frame, seventeen retained illustrative strings and diagonal soundbox. No plucking, lever tuning, string vibration or audio.');
function stringInstrument(id,name,cello){const r=cello?.20:.17,lower=cello?.40:.29,upper=cello?.66:.49,neckTop=cello?1.25:1.0,depth=cello?.15:.11;
 const p=[box('cradle-foot',[cello?.50:.42,.035,.40],[0,.0175,0],'metal'),box('cradle-post',[.035,lower,.035],[0,lower/2,-.10],'metal'),box('padded-cradle',[.30,.045,.18],[0,lower-r-.02,0],'dark'),pipe('lower-bout',r,depth,[0,lower,0],'z','wood'),pipe('upper-bout',r*.78,depth,[0,upper,0],'z','wood'),box('waist',[r*.95,upper-lower,depth],[0,(upper+lower)/2,0],'wood'),box('neck',[.055,neckTop-upper,.04],[0,(neckTop+upper)/2,depth/2-.014],'wood'),box('fingerboard',[.047,neckTop-upper+.08,.012],[0,(neckTop+upper)/2-.04,depth/2+.006],'dark'),box('headstock',[.085,.14,.04],[0,neckTop+.06,.025],'wood'),box('bridge',[.09,.02,.045],[0,lower,depth/2+.0225],'cream')];
 if(!cello)p.push(pipe('soundhole',.048,.004,[0,upper-.06,depth/2+.0015],'z','dark'));else for(const x of [-.09,.09])p.push({...box('f-hole-'+x,[.013,.13,.003],[x,lower+.10,depth/2+.0015],'dark'),rotation:[0,0,x<0?-.15:.15]});
 for(let n=0;n<(cello?4:6);n++){const x=(n-(cello?1.5:2.5))*.007;p.push(tube('string-'+n,[x,lower-.08,depth/2+.034],[x,neckTop+.10,depth/2+.034],.0012,'paper'));}p.push(box('tailpiece',[.05,.12,.068],[0,lower-.10,depth/2+.034],'dark'),box('nut',[.057,.012,depth/2+.02],[0,neckTop+.10,.04],'cream'));
 for(let n=0;n<4;n++)p.push(pipe('tuning-peg-'+n,.014,.11,[0,neckTop+.01+n*.03,.025],'x','dark'));
 add(id,name,p,[],null,null,'Fixed '+(cello?'bowed':'plucked')+' acoustic instrument on a retained floor cradle. Stylized waisted body, neck, bridge, strings and tuning pegs; soundhole/f-holes are dark surface inlays, not hollow acoustic cavities; stand is part of this source, not separately counted. No player, bow/strum motion, tuning, vibration or sound.');}
stringInstrument('cello','Cello on padded floor cradle',true);stringInstrument('guitar','Acoustic guitar on floor cradle',false);
const amp=[...feet(.62,.30,.055),box('cabinet',[.62,.50,.30],[0,.305,0],'sage'),box('speaker-baffle',[.54,.38,.012],[0,.29,.156],'dark'),pipe('speaker-cone',.155,.012,[0,.29,.168],'z','metal'),pipe('dust-cap',.048,.016,[0,.29,.18],'z','dark'),box('control-strip',[.54,.06,.015],[0,.52,.1575],'metal'),box('handle',[.22,.028,.04],[0,.60,0],'dark'),...[-.095,.095].map((x,n)=>box('handle-riser-'+n,[.028,.04,.04],[x,.57,0],'metal')),box('rear-panel',[.44,.30,.01],[0,.29,-.155],'dark')];
for(let n=0;n<6;n++)amp.push(box('rear-slot-'+n,[.34,.012,.003],[0,.20+n*.032,-.1615],'metal'));
for(const boosted of [false,true])amp.push(pipe(boosted?'gain-high':'gain-low',.025,.02,[.10,.52,.175],'z','cream',{boosted}),{...box(boosted?'pointer-high':'pointer-low',[.004,.021,.003],[.10,.52,.1865],'dark',{boosted}),rotation:[0,0,boosted?-.8:.8],rotationAxis:[0,0,1]});
for(const powered of [false,true])amp.push(box(powered?'power-on':'power-off',[.025,.025,.008],[-.15,.52,.169],powered?'red':'dark',{powered}));
add('amplifier','Single-speaker combo amplifier',amp,[],null,null,'Power indicator and gain knob show a guarded low/high setting. Turn gain down before power-off; gain requires power. No signal input, audio, loudness or electrical simulation.');configs.amplifier={state:{powered:false,boosted:false},actions:[{...toggle('toggle','powered','Power on / off'),requires:{boosted:false},blockedMessage:'Return gain to low before powering off.'},{...toggle('gain','boosted','Low / high gain'),requires:{powered:true},blockedMessage:'Switch power on before setting gain.'}],stateRules:[{when:{boosted:true},must:{powered:true},message:'High gain requires power.'}]};range('amplifier','boosted',[0,0,1],[.8,-.8],'rad',['pointer-low','pointer-high']);
const mic=[cyl('weighted-base',.28,.04,[0,.02,0],'dark'),pipe('mast',.018,1.24,[0,.66,0]),pipe('clutch',.027,.06,[0,1.25,0]),pipe('hinge',.035,.08,[0,1.30,0],'x','dark')];
for(const tilted of [false,true]){const p=tilted?'up':'level',w={tilted};mic.push({...box(p+'-boom',[.025,.025,.90],[0,1.30,.25],'metal',w),pivot:[0,0,-.25],rotation:[tilted?-.35:0,0,0],rotationAxis:[1,0,0]}, {...pipe(p+'-microphone',.025,.18,[0,0,.52],'z','dark',w),parent:p+'-boom'}, {...pipe(p+'-grille',.032,.06,[0,0,.64],'z','steel',w),parent:p+'-boom'});}
add('microphone','Weighted boom microphone stand',mic,[],'tilted','Raise / level microphone boom','Boom, clip and microphone pivot together at mast head by .35 rad. No sound capture, cable routing, telescoping mast or continuous joint solver.');range('microphone','tilted',[1,0,0],[0,-.35],'rad',['level-boom','up-boom']);
const stand=[cyl('base',.24,.035,[0,.0175,0],'dark'),pipe('outer-post',.019,.75,[0,.405,0],'metal'),pipe('collar',.027,.05,[0,.76,0],'dark')];
for(const high of [false,true]){const p=high?'high':'low',w={high},y=high?1.28:1.02;stand.push(pipe(p+'-inner-post',.012,y-.73,[0,(y+.73)/2,0],'y','metal',w),{...box(p+'-tray',[.56,.36,.018],[0,y,0],'sage',w),rotation:[-.18,0,0],rotationAxis:[1,0,0]},box(p+'-ledge',[.56,.025,.09],[0,y-.18,.04],'sage',w),{...box(p+'-page',[.36,.25,.004],[0,-.045,.012],'paper',w),parent:p+'-tray'});}
for(const high of [false,true]){const p=high?'high':'low',w={high};for(let n=0;n<5;n++)stand.push({...box(p+'-staff-'+n,[.28,.0015,.001],[0,.025-n*.014,.0025],'dark',w),parent:p+'-page'});}
add('music-stand','Telescoping conductor music stand',stand,[],'high','Raise / lower score tray','Whole tray, ledge and retained sample score rise .26 m on a telescoping post. Score is illustrative internal content; no paper attachment editor or folding mechanism.');range('music-stand','high',[0,1,0],[1.02,1.28],'m',['low-tray','high-tray']);
const metro=[box('base',[.12,.025,.13],[0,.0125,0],'wood'),cyl('tapered-case',.079,.19,[0,.12,0],'wood',undefined,.04),box('dial',[.055,.16,.005],[0,.13,.055],'cream'),pipe('pendulum-hinge',.012,.035,[0,.06,.066],'z','metal')];
for(const right of [false,true]){const p=right?'right':'left',w={right};metro.push({...box(p+'-rod',[.006,.16,.008],[0,.14,.085],'metal',w),pivot:[0,-.08,0],rotation:[0,0,right?-.30:.30],rotationAxis:[0,0,1]}, {...box(p+'-weight',[.025,.026,.018],[0,.045,0],'dark',w),parent:p+'-rod'});}
add('metronome','Mechanical practice metronome',metro,[],'right','Step pendulum right / left','Pendulum and sliding-weight depiction rotate together between two endpoints. Manual visual beat step only; no clock, tempo scheduling, winding or sound.');range('metronome','right',[0,0,1],[.30,-.30],'rad',['left-rod','right-rod']);
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='music-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.filter(p=>!p.visibleWhen||Object.values(p.visibleWhen).every(v=>v===false)).flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){if(!p.parent){p.position[0]-=center[0];p.position[2]-=center[1];}}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const extra=extras[short]||[];
 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'music-2026-11-16',measurement:{status:'estimated',note:'Original fictional music furniture/equipment; not manufacturer specifications. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves authored endpoint clearance where present; intermediate swept motion is not simulated.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/music-2026-11-16.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/music.html'};
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
