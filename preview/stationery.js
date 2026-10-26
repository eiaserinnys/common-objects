import {createRenderer} from '../renderer/svg.js';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
const $=id=>document.getElementById(id);
try {
 const catalog=await (await fetch('../assets/catalog.json')).json();
 const list=await Promise.all(catalog.assets.filter(p=>p.startsWith('stationery-')).map(async p=>{const r=await fetch('../assets/'+p);if(!r.ok)throw Error(p);return r.json();}));
 const assets=new Map(list.map(a=>[a.id,a]));let serial=10,isolated=false;
 let instances=list.map((a,n)=>createInstance(a,'object-'+(n+1),[(n%5-2)*.43,0,(Math.floor(n/5)-.5)*.48])),selected=instances[0].id;
 const overviewDistance=()=>window.innerWidth<700?3.5:2.6;
 const camera={yaw:-.35,pitch:.65,distance:overviewDistance(),target:[0,.06,0]},renderer=createRenderer($('scene'),assets);
 const current=()=>instances.find(i=>i.id===selected),asset=()=>assets.get(current().assetId),render=()=>renderer.render(isolated?[current()]:instances,camera);
 function refresh(){const i=current(),a=asset();$('selected').replaceChildren(...instances.map(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=assets.get(i.assetId).name+' · '+i.id;return o;}));$('selected').value=selected;$('dimensions').textContent=a.dimensions.map(v=>(v*100).toFixed(1)).join(' × ')+' cm · estimated';$('toggle').textContent=a.actions[0].label;$('toggle').setAttribute('aria-pressed',Object.values(i.state)[0]);$('state').textContent=Object.entries(i.state).map(([k,v])=>k+': '+v).join(', ');$('rotation').value=i.rotation[1]*180/Math.PI;$('x').value=i.position[0];$('y').value=i.position[1];$('z').value=i.position[2];$('zoom').value=camera.distance;$('supports').textContent='Support surfaces: '+(a.supportSurfaces.filter(s=>!s.availableWhen||Object.entries(s.availableWhen).every(([k,v])=>i.state[k]===v)).map(s=>s.id+' at '+s.height+' m').join(', ')||'none available');render();}
 $('selected').onchange=e=>{selected=e.target.value;refresh();};$('toggle').onclick=()=>{act(asset(),current(),'toggle');refresh();};
 $('duplicate').onclick=()=>{const i=structuredClone(current());i.id='object-'+(++serial);i.position[0]+=.20;i.position[2]+=.32;instances.push(i);selected=i.id;refresh();};
 $('focus').onclick=()=>{isolated=true;camera.target=current().position.map((v,k)=>v+(k===1?asset().dimensions[1]/2:0));camera.distance=Math.max(...asset().dimensions)*2.8;refresh();};
 $('all').onclick=()=>{isolated=false;Object.assign(camera,{target:[0,.06,0],distance:overviewDistance(),yaw:-.35,pitch:.65});refresh();};
 $('rotation').oninput=e=>{current().rotation[1]=Number(e.target.value)*Math.PI/180;refresh();};
 for(const [id,k] of [['x',0],['y',1],['z',2]])$(id).onchange=e=>{if(Number.isFinite(e.target.valueAsNumber))current().position[k]=e.target.valueAsNumber;refresh();};
 $('zoom').oninput=e=>{camera.distance=Number(e.target.value);render();};
 $('save').onclick=()=>{localStorage.setItem('common-objects.stationery.v1',saveScene(instances));$('status').textContent='Arrangement saved.';};
 $('restore').onclick=()=>{try{const loaded=loadScene(localStorage.getItem('common-objects.stationery.v1'),assets);if(!loaded.length)throw Error('Empty arrangement');instances=loaded;selected=instances[0].id;serial=Math.max(...instances.map(i=>Number(i.id.split('-').at(-1))||0));refresh();$('status').textContent='Arrangement restored.';}catch(e){$('status').textContent=e.message;}};
 let drag=null;const svg=$('scene');svg.onpointerdown=e=>{drag=[e.clientX,e.clientY];svg.setPointerCapture(e.pointerId);};svg.onpointermove=e=>{if(!drag)return;camera.yaw+=(e.clientX-drag[0])*.01;camera.pitch=Math.max(-1.2,Math.min(1.2,camera.pitch+(e.clientY-drag[1])*.01));drag=[e.clientX,e.clientY];render();};svg.onpointerup=svg.onpointercancel=()=>drag=null;
 new ResizeObserver(render).observe(svg);refresh();document.documentElement.dataset.ready='true';
}catch(e){$('status').textContent=e.message;document.documentElement.dataset.error=e.message;}
