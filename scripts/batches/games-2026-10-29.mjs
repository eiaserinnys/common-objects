// Reproducible original metric geometry; no external source dimensions claimed.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {mesh,point,worldParts} from '../../renderer/geometry.js';
import {svgScene} from '../../renderer/svg.js';
const materials={cream:{color:[.88,.84,.72]},sage:{color:[.30,.52,.53]},wood:{color:[.64,.43,.27]},metal:{color:[.38,.43,.40]},food:{color:[.82,.62,.35]},dark:{color:[.16,.24,.20]},paper:{color:[.96,.93,.83]}};
const box=(id,size,position,material='cream',visibleWhen)=>({id,parent:null,position,rotation:[0,0,0],pivot:[0,0,0],rotationAxis:[0,1,0],joint:'fixed',state:{},geometry:{type:'box',size},material,...visibleWhen&&{visibleWhen}});
const cyl=(id,r,h,position,material='cream',visibleWhen,top=r)=>({...box(id,[],position,material,visibleWhen),geometry:{type:'cylinder',radiusBottom:r,radiusTop:top,height:h,segments:24}});
function vessel(w,d,h,t=.006){return [box('base',[w,t,d],[0,t/2,0],'sage'),box('left-wall',[t,h-t,d],[-(w-t)/2,(h+t)/2,0],'sage'),box('right-wall',[t,h-t,d],[(w-t)/2,(h+t)/2,0],'sage'),box('back-wall',[w-2*t,h-t,t],[0,(h+t)/2,-(d-t)/2],'sage'),box('front-wall',[w-2*t,h-t,t],[0,(h+t)/2,(d-t)/2],'sage')];}
const surface=(id,height,w,d,condition)=>({id,height,polygon:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],normal:[0,1,0],...(condition?{availableWhen:condition}:{}),note:'Usable horizontal support rectangle; no load capacity or physics simulation.'});
const ring=(id,r,h,y,mat,when)=>Array.from({length:32},(_,n)=>{const angle=n*Math.PI/16;return {...box(id+'-'+n,[.008,h,2*r*Math.tan(Math.PI/32)],[r*Math.cos(angle),y,r*Math.sin(angle)],mat,when),rotation:[0,-angle,0]};});
const entries=[
 ['dice','Pipped playing die','marked','Remove / replace pip inlays',[
 box('body',[.024,.024,.024],[0,.012,0],'cream'),
 ...[-1,1].flatMap((v,i)=>[-1,0,1].map((z,j)=>cyl('top-pip-'+i+'-'+j,.0017,.0004,[v*.006,.0242,z*.006],'dark',{marked:true}))),
 ...[-1,1].flatMap((v,i)=>[-1,1].map((x,j)=>({...cyl('front-pip-'+i+'-'+j,.0017,.0004,[x*.006,.012+v*.006,.0122],'dark',{marked:true}),rotation:[Math.PI/2,0,0]}))),
 ...[-1,1].map((v,i)=>({...cyl('right-pip-'+i,.0017,.0004,[.0122,.012+v*.006,v*.006],'dark',{marked:true}),rotation:[0,0,Math.PI/2]})),
 ...[-1,1].flatMap((v,i)=>[-1,1].map((z,j)=>({...cyl('left-pip-'+i+j,.0017,.0004,[-.0122,.012+v*.006,z*.006],'dark',{marked:true}),rotation:[0,0,Math.PI/2]}))),
 {...cyl('left-center',.0017,.0004,[-.0122,.012,0],'dark',{marked:true}),rotation:[0,0,Math.PI/2]},
 ...[-1,0,1].map((v,i)=>({...cyl('back-pip-'+i,.0017,.0004,[v*.006,.012+v*.006,-.0122],'dark',{marked:true}),rotation:[Math.PI/2,0,0]})),
 cyl('bottom-pip',.0017,.0004,[0,.0002,0],'dark',{marked:true})
 ],[]],
 ['domino','Double six domino','marked','Remove / replace dot inserts',[
 box('tile',[.025,.008,.05],[0,.004,0],'cream'),box('divider',[.023,.0005,.001],[0,.00825,0],'metal'),
 ...[-1,1].flatMap((z,i)=>[-1,1].flatMap((x,j)=>[-1,0,1].map((v,k)=>cyl('pip-'+i+j+k,.0015,.0005,[x*.006,.00825,z*.013+v*.006],'dark',{marked:true}))))
 ],[]],
 ['rook','Wooden chess rook','crowned','Remove / replace crown',[
 cyl('foot',.023,.009,[0,.0045,0],'wood'),cyl('bevel',.023,.009,[0,.0135,0],'wood',undefined,.017),cyl('shaft',.014,.036,[0,.036,0],'wood',undefined,.012),cyl('collar',.019,.009,[0,.0585,0],'wood'),
 cyl('crown-base',.021,.009,[0,.0675,0],'cream',{crowned:true}),
 ...Array.from({length:6},(_,i)=>{const t=i*Math.PI/3;return {...box('battlement-'+i,[.012,.009,.009],[.016*Math.cos(t),.0765,.016*Math.sin(t)],'cream',{crowned:true}),rotation:[0,-t,0]};})
 ],[]],
 ['checkers','Draughts piece stack','stacked','Remove / replace top piece',[
 ...[0,1,2].flatMap(i=>[cyl('disk-'+i,.018,.006,[0,.003+i*.007,0],i===1?'wood':'sage',i===2?{stacked:true}:undefined),...ring('rim-'+i,.014,.001,.0065+i*.007,'cream',i===2?{stacked:true}:undefined)])
 ],[]],
 ['dice-cup','Felt lined dice cup','loaded','Remove / replace die',[
 cyl('base',.038,.006,[0,.003,0],'wood'),...ring('wall',.035,.078,.045,'wood'),...ring('lining',.030,.072,.042,'sage'),
 box('die',[.02,.02,.02],[0,.016,0],'cream',{loaded:true}),cyl('pip',.002,.0004,[0,.0262,0],'dark',{loaded:true})
 ],[]],
 ['tile-rack','Letter tile rack','loaded','Remove / replace letter tiles',[
 box('foot',[.28,.008,.045],[0,.004,0],'wood'),box('back',[.28,.032,.008],[0,.024,-.0185],'wood'),box('lip',[.28,.009,.005],[0,.0125,.02],'wood'),
 ...Array.from({length:7},(_,i)=>[box('tile-'+i,[.032,.032,.006],[(i-3)*.036,.024,0],'cream',{loaded:true}),box('glyph-stem-'+i,[.003,.02,.0005],[(i-3)*.036,.024,.00325],'dark',{loaded:true}),box('glyph-bar-'+i,[.016,.003,.0005],[(i-3)*.036+.006,.032,.00325],'dark',{loaded:true})]).flat()
 ],[]],
 ['card-shoe','Playing card dealing shoe','loaded','Remove / replace card deck',[
 ...vessel(.085,.16,.035,.005).filter(p=>p.id!=='front-wall'),...[-1,1].map((v,i)=>box('front-stop-'+i,[.012,.030,.005],[v*.0365,.020,.0775],'sage')),box('deck',[.063,.018,.088],[0,.014,.015],'paper',{loaded:true}),
 ...Array.from({length:5},(_,i)=>box('card-edge-'+i,[.064,.0006,.089],[0,.007+i*.003,.015],'cream',{loaded:true})),box('rear-stop',[.07,.018,.025],[0,.044,-.058],'wood')
 ],[]],
 ['hourglass','Sand timer','capped','Remove / replace upper cap',[
 cyl('foot',.04,.009,[0,.0045,0],'wood'),cyl('lower-bulb',.025,.051,[0,.0345,0],'cream',undefined,.006),cyl('upper-bulb',.006,.051,[0,.0855,0],'cream',undefined,.025),
 ...[-1,1].flatMap((x,i)=>[-1,1].map((z,j)=>cyl('post-'+i+j,.004,.105,[x*.024,.0615,z*.024],'wood'))),
 cyl('cap',.04,.009,[0,.1185,0],'wood',{capped:true})
 ],[]],
 ['peg-board','Track scoring peg board','pegged','Remove / replace scoring pegs',[
 box('board',[.09,.018,.26],[0,.009,0],'wood'),
 ...[-1,1].flatMap((x,i)=>Array.from({length:12},(_,j)=>cyl('hole-'+i+'-'+j,.002,.0004,[x*.023,.0182,(j-5.5)*.019],'dark'))),
 ...[-1,1].map((x,i)=>cyl('peg-'+i,.0025,.017,[x*.023,.0265,(i-5.5)*.019],i?'cream':'sage',{pegged:true}))
 ],[]],
 ['game-box','Lidded board game box','closed','Remove / replace game board lid',[
 ...vessel(.32,.32,.055,.006),box('lid',[.33,.008,.33],[0,.059,0],'wood',{closed:true}),
 ...Array.from({length:8},(_,x)=>Array.from({length:8},(_,z)=>box('square-'+x+'-'+z,[.035,.0006,.035],[(x-3.5)*.035,.0633,(z-3.5)*.035],(x+z)%2?'sage':'cream',{closed:true}))).flat()
 ],[surface('board-top',.0636,.28,.28,{closed:true})]]
];
const paths=[];
for(const [short,name,key,label,parts,supportSurfaces] of entries){
 const id='games-'+short;
 // Center the union of ground-contact patches, not the full clearance bounds.
 const contact=parts.flatMap(p=>{const v=mesh(p.geometry).triangles,m=worldParts({parts}).get(p.id),out=[];for(let k=0;k<v.length;k+=3){const q=point(m,v.slice(k,k+3));if(Math.abs(q[1])<1e-8)out.push(q);}return out;});
 const center=[0,2].map(k=>(Math.min(...contact.map(q=>q[k]))+Math.max(...contact.map(q=>q[k])))/2);
 for(const p of parts){p.position[0]-=center[0];p.position[2]-=center[1];}
 for(const s of supportSurfaces)s.polygon=s.polygon.map(([x,z])=>[x-center[0],z-center[1]]);

 const a={schemaVersion:1,id,version:1,name,format:'metric-svg',renderer:'renderer/svg.js',units:'m',upAxis:'Y',origin:'ground-contact-center',defaultScale:[1,1,1],batch:'games-2026-10-29',measurement:{status:'estimated',note:'Original fictional household object. Nominal dimensions estimated from everyday proportions; no manufacturer measurements or external dimensional source. Bounds are exact rest geometry; footprint conservatively includes removable parts.'},provenance:{creator:'common-objects contributors',license:'CC0-1.0',note:'Original procedural geometry generated by scripts/batches/games-2026-10-29.mjs.'},materials,state:{[key]:true},actions:[{id:'toggle',type:'toggle',stateKey:key,label}],parts,supportSurfaces,interactionNote:'Discrete functional state. Removed contents/covers are taken out of the scene, not animated. No game rules, sand flow or physics simulation.',thumbnail:'thumbnail.svg',preview:'preview/games.html'};
 const matrices=worldParts(a),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of parts){const v=mesh(p.geometry).triangles;for(let i=0;i<v.length;i+=3){const q=point(matrices.get(p.id),v.slice(i,i+3));q.forEach((n,k)=>{min[k]=Math.min(min[k],n);max[k]=Math.max(max[k],n);});}}
 const round=n=>Math.round(n*1e9)/1e9;
 a.bounds={min:min.map(round),max:max.map(round)};a.dimensions=max.map((n,k)=>round(n-min[k]));a.footprint=[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]].map(p=>p.map(round));
 const dir='assets/'+id;await mkdir(dir,{recursive:true});await writeFile(dir+'/asset.json',JSON.stringify(a,null,2)+'\n');
 const camera={yaw:-.6,pitch:.6,distance:Math.max(...a.dimensions)*2.8,target:[0,a.dimensions[1]/2,0],grid:false};
 await writeFile(dir+'/thumbnail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f0eee5"/>'+svgScene(a,[{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],state:a.state}],camera,480,360)+'</svg>\n');paths.push(id+'/asset.json');
}
const catalog=JSON.parse(await readFile('assets/catalog.json'));catalog.assets=[...catalog.assets.filter(p=>!paths.includes(p)),...paths];await writeFile('assets/catalog.json',JSON.stringify(catalog,null,2)+'\n');
