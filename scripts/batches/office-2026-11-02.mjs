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
const drawer=(opened)=>{const z=opened?.28:0,when={open:opened},s=opened?'open':'closed';return [
 box(s+'-drawer-bottom',[1.10,.018,.50],[0,.52,z],'wood',when),
 box(s+'-drawer-front',[1.144,.19,.025],[0,.61,.2875+z],'sage',when),
 box(s+'-drawer-back',[1.10,.14,.018],[0,.59,-.241+z],'wood',when),
 ...[-1,1].map((v,i)=>box(s+'-drawer-side-'+i,[.018,.14,.50],[v*.541,.59,z],'wood',when)),
 box(s+'-drawer-pull',[.24,.022,.025],[0,.62,.315+z],'metal',when)
 ];};
entries.push(['credenza','Printer credenza with sliding supply drawer','open','Open / close supply drawer',[
 ...feet(1.20,.60,.09),box('base',[1.20,.035,.60],[0,.1075,0],'wood'),
 ...[-1,1].map((v,i)=>box('side-'+i,[.025,.60,.60],[v*.5875,.425,0],'wood')),
 box('back',[1.15,.60,.018],[0,.425,-.291],'wood'),box('top',[1.20,.025,.60],[0,.7375,0],'wood'),
 box('lower-shelf',[1.15,.022,.56],[0,.34,0],'cream'),box('drawer-divider',[1.15,.018,.56],[0,.50,0],'wood'),
 ...[-1,1].map((v,i)=>box('drawer-rail-'+i,[.012,.02,.49],[v*.565,.53,0],'metal')),
 ...drawer(false),...drawer(true)
 ],[surface('top',.75,1.16,.56),surface('lower-shelf',.351,1.10,.50)],'Entire drawer moves 0.28 m along +Z between two fixed poses. No interpolated slide, stops, lock or collision physics.']);
const printer=[
 ...feet(.50,.45,.025),box('lower-engine',[.51,.24,.45],[0,.145,0],'cream'),
 box('paper-cassette-front',[.46,.105,.012],[0,.09,.231],'sage'),box('cassette-handle',[.15,.014,.012],[0,.12,.243],'dark'),
 box('rear-spine',[.51,.14,.08],[0,.335,-.185],'cream'),
 ...[-1,1].map((v,i)=>box('output-side-'+i,[.035,.105,.37],[v*.2375,.3175,.04],'cream')),
 box('output-shelf',[.43,.012,.37],[0,.271,.04],'dark'),
 box('output-mouth',[.40,.05,.012],[0,.305,-.138],'dark'),
 box('scanner-platen',[.54,.035,.36],[0,.3875,-.06],'dark'),box('scanner-lid',[.54,.035,.36],[0,.4225,-.06],'cream'),
 box('feeder-left',[.07,.023,.30],[-.225,.4515,-.08],'sage'),box('feeder-right',[.07,.023,.30],[.225,.4515,-.08],'sage'),
 box('feed-bed',[.38,.008,.30],[0,.444,-.08],'metal'),
 box('control-bezel',[.17,.028,.09],[.15,.371,.267],'dark'),box('control-display',[.105,.003,.05],[.135,.3865,.267],'sage'),
 cyl('copy-button',.012,.004,[.215,.387,.267],'paper'),
 box('ready-led',[.018,.004,.018],[.08,.388,.267],'sage',{printed:false}),
 box('done-led',[.018,.004,.018],[.08,.388,.267],'food',{printed:true}),
 box('feed-sheet',[.210,.001,.297],[0,.4485,-.08],'paper',{printed:false}),
 box('output-sheet',[.210,.001,.297],[0,.2775,.11],'paper',{printed:true}),
 ...Array.from({length:7},(_,i)=>box('printed-line-'+i,[i===0?.145:.12,.0005,.004],[0,.27825,.025+i*.023],'dark',{printed:true})),
 ...Array.from({length:6},(_,i)=>box('rear-vent-'+i,[.18,.008,.002],[0,.14+i*.016,-.226],'dark')),
 box('rear-port',[.035,.025,.004],[.15,.07,-.227],'dark')
];
entries.push(['printer','Compact multifunction printer','printed','Feed sheet / reset paper path',printer,[],'Discrete before/after sheet transfer: blank A4-sized feed sheet becomes printed output with bars. Scanner lid and cassette static. No scanning, continuous roller animation, document processing, electrical or thermal simulation.']);
entries.push(['paper-cart','Two-tier mobile paper cart',null,null,[
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>({...cyl('caster-'+i+j,.04,.025,[x*.25,.04,z*.16],'dark'),rotation:[0,0,Math.PI/2]}))),
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>box('upright-'+i+j,[.025,.65,.025],[x*.275,.405,z*.185],'metal'))),
 ...[.22,.68].flatMap((y,i)=>[box('tray-'+i,[.60,.024,.42],[0,y,0],'sage'),...[-1,1].map((v,j)=>box('tray-rim-'+i+j,[.60,.045,.012],[0,y+.0345,v*.204],'sage'))]),
 ...[-1,1].map((v,i)=>box('handle-post-'+i,[.025,.12,.025],[-.275,.76,v*.185],'metal')),
 box('push-handle',[.025,.025,.395],[-.275,.8075,0],'wood')
 ],[surface('upper-tray',.692,.54,.36),surface('lower-tray',.232,.54,.36)],'Static rolling-cart depiction. Move the instance using placement controls; wheels do not spin and no rolling physics is claimed.']);
entries.push(['archive-shelf','Open archive shelving',null,null,[
 ...feet(.90,.36,.08),box('back',[.90,1.57,.018],[0,.865,-.171],'sage'),
 ...[-1,1].map((v,i)=>box('side-'+i,[.025,1.57,.36],[v*.4375,.865,0],'wood')),
 ...[.105,.49,.875,1.26,1.6375].map((y,i)=>box('shelf-'+i,[.85,.025,.36],[0,y,0],'wood')),
 ...[.49,.875,1.26].map((y,i)=>box('label-holder-'+i,[.10,.015,.004],[.30,y,.182],'metal'))
 ],[surface('bottom',.1175,.81,.31),surface('shelf-1',.5025,.81,.31),surface('shelf-2',.8875,.81,.31),surface('shelf-3',1.2725,.81,.31)],'Static shelving. No adjustable shelves, wall anchoring or tip/load simulation.']);
entries.push(['sorting-table','Standing document sorting table',null,null,[
 ...[-1,1].flatMap((x,i)=>[-1,1].flatMap((z,j)=>[box('level-foot-'+i+j,[.05,.018,.05],[x*.63,.009,z*.28],'dark'),box('leg-'+i+j,[.04,.872,.04],[x*.63,.454,z*.28],'metal')])),
 ...[-1,1].map((v,i)=>box('apron-'+i,[1.30,.08,.025],[0,.85,v*.28],'sage')),
 ...[-1,1].map((v,i)=>box('end-apron-'+i,[.025,.08,.58],[v*.63,.85,0],'sage')),
 box('worktop',[1.40,.03,.70],[0,.905,0],'wood'),box('rear-stop',[1.40,.055,.018],[0,.9475,-.341],'sage')
 ],[surface('worktop',.92,1.34,.64)],'Static standing worktable. No height adjustment, folding or load simulation.']);
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces,interactionNote] of entries){
 const id='office-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){p.position[0]-=center[0];p.position[2]-=center[1];}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'office-2026-11-02',measurement:{status:'estimated',note:'Original fictional office furniture/equipment. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds cover the union of authored discrete poses; active bounds are available per state. Footprint reserves full drawer clearance where present.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/office-2026-11-02.mjs.'},materials,state:key?{[key]:false}:{},actions:key?[{id:'toggle',type:'toggle',stateKey:key,label}]:[],parts,supportSurfaces,interactionNote,thumbnail:'thumbnail.svg',preview:'preview/office.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
