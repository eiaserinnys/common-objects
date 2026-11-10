import {resolveAttachments} from '../renderer/attachments.js';
import {createRenderer} from '../renderer/svg.js';
import {createInstance,act,saveScene,loadScene,placementLocked} from '../renderer/model.js';
const batch=document.documentElement.dataset.batch;
const $=id=>document.getElementById(id);
try {
 const catalog=await (await fetch('../assets/catalog.json')).json();
 const assembly=document.documentElement.dataset.assembly?await (await fetch(document.documentElement.dataset.assembly)).json():null;
 const wanted=assembly?new Set(assembly.instances.map(i=>i.assetId)):null;
 const list=await Promise.all(catalog.assets.filter(p=>wanted?wanted.has(p.split('/')[0]):p.startsWith(batch+'-')).map(async p=>{const r=await fetch('../assets/'+p);if(!r.ok)throw Error(p);return r.json();}));
 const assets=new Map(list.map(a=>[a.id,a]));let serial=assembly?assembly.instances.length:10,isolated=false;
 const layoutIndex=n=>n;
 const spacingX=Number(document.documentElement.dataset.spacingX)||.48,spacingZ=Number(document.documentElement.dataset.spacingZ)||.58;
 let instances=assembly?loadScene(JSON.stringify(assembly),assets):list.map((a,n)=>{const k=layoutIndex(n);return createInstance(a,'object-'+(n+1),[(k%5-2)*spacingX,0,(Math.floor(k/5)-.5)*spacingZ]);}),selected=instances[0].id;
 const overviewDistance=()=>window.innerWidth<700?(Number(document.documentElement.dataset.mobileDistance)||4.1):(Number(document.documentElement.dataset.distance)||3.0);
 const overviewTarget=assembly?[0,.75,0]:[0,.10,0];
 const camera={yaw:-.35,pitch:.65,distance:overviewDistance(),target:[...overviewTarget]},renderer=createRenderer($('scene'),assets);
 const current=()=>instances.find(i=>i.id===selected),asset=()=>assets.get(current().assetId),render=()=>renderer.render(isolated?[current()]:instances,camera);
 function change(edit){const before=structuredClone(instances);try{edit();instances=resolveAttachments(instances,assets);refresh();$('status').textContent='';}catch(e){instances=before;refresh();$('status').textContent=e.message;}}
 function refresh(){const i=current(),a=asset();$('selected').replaceChildren(...instances.map(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=assets.get(i.assetId).name+' · '+i.id;return o;}));$('selected').value=selected;$('dimensions').textContent=a.dimensions.map(v=>(v*100).toFixed(1)).join(' × ')+' cm · estimated';$('toggle').textContent=a.actions[0]?.label||'Static object';$('toggle').disabled=!a.actions.length;if($('limitations'))$('limitations').textContent=a.interactionNote||'Appearance toggle only; no lighting simulation.';if(a.actions[0]?.type==='toggle')$('toggle').setAttribute('aria-pressed',String(i.state[a.actions[0].stateKey]));else $('toggle').removeAttribute('aria-pressed');document.getElementById('extra-actions')?.remove();const extra=document.createElement('div');extra.id='extra-actions';for(const action of a.actions.slice(1)){const b=document.createElement('button');b.dataset.action=action.id;b.textContent=action.label;b.onclick=()=>{change(()=>act(asset(),current(),action.id));};extra.append(b);}$('toggle').after(extra);for(const id of ['x','y','z','rotation'])$(id).disabled=placementLocked(a,i)||!!(i.attachment||i.mount);document.getElementById('detach-support')?.remove();if(i.attachment||i.mount){const b=document.createElement('button');b.id='detach-support';b.textContent='Detach from parent';b.onclick=()=>change(()=>{delete current().attachment;delete current().mount;});$('supports').before(b);}$('state').textContent=Object.entries(i.state).map(([k,v])=>k+': '+v).join(', ');$('rotation').value=i.rotation[1]*180/Math.PI;$('x').value=i.position[0];$('y').value=i.position[1];$('z').value=i.position[2];$('zoom').value=camera.distance;$('supports').textContent=((i.attachment||i.mount)?'Attached to '+(i.attachment||i.mount).parentId+' / '+(i.attachment||i.mount).surfaceId+'. ':'')+'Support surfaces: '+((a.supportSurfaces||[]).filter(s=>!s.availableWhen||Object.entries(s.availableWhen).every(([k,v])=>i.state[k]===v)).map(s=>s.id+' at '+s.height+' m').join(', ')||'none available');render();}
 $('selected').onchange=e=>{selected=e.target.value;refresh();};$('toggle').onclick=()=>{change(()=>act(asset(),current(),'toggle'));};
 $('duplicate').onclick=()=>{const i=structuredClone(current());i.id='object-'+(++serial);delete i.attachment;delete i.mount;i.position[0]+=.20;i.position[2]+=.32;instances.push(i);selected=i.id;refresh();};
 $('focus').onclick=()=>{isolated=true;camera.target=current().position.map((v,k)=>v+(k===1?asset().dimensions[1]/2:0));camera.distance=Math.max(...asset().dimensions)*2.8;refresh();};
 $('all').onclick=()=>{isolated=false;Object.assign(camera,{target:[...overviewTarget],distance:overviewDistance(),yaw:-.35,pitch:.65});refresh();};
 $('rotation').oninput=e=>{if(placementLocked(asset(),current())||(current().attachment||current().mount))return;change(()=>{current().rotation[1]=Number(e.target.value)*Math.PI/180;});};
 for(const [id,k] of [['x',0],['y',1],['z',2]])$(id).onchange=e=>{if(placementLocked(asset(),current())||(current().attachment||current().mount))return;if(Number.isFinite(e.target.valueAsNumber))change(()=>{current().position[k]=e.target.valueAsNumber;});};
 $('zoom').oninput=e=>{camera.distance=Number(e.target.value);render();};
 $('save').onclick=()=>{localStorage.setItem('common-objects.'+batch+'.v1',saveScene(instances));$('status').textContent='Arrangement saved.';};
 $('restore').onclick=()=>{try{const loaded=loadScene(localStorage.getItem('common-objects.'+batch+'.v1'),assets);if(!loaded.length)throw Error('Empty arrangement');instances=loaded;selected=instances[0].id;serial=Math.max(...instances.map(i=>Number(i.id.split('-').at(-1))||0));refresh();$('status').textContent='Arrangement restored.';}catch(e){$('status').textContent=e.message;}};
 let drag=null;const svg=$('scene');svg.onpointerdown=e=>{drag=[e.clientX,e.clientY];svg.setPointerCapture(e.pointerId);};svg.onpointermove=e=>{if(!drag)return;camera.yaw+=(e.clientX-drag[0])*.01;camera.pitch=Math.max(-1.2,Math.min(1.2,camera.pitch+(e.clientY-drag[1])*.01));drag=[e.clientX,e.clientY];render();};svg.onpointerup=svg.onpointercancel=()=>drag=null;
 new ResizeObserver(render).observe(svg);refresh();document.documentElement.dataset.ready='true';
}catch(e){$('status').textContent=e.message;document.documentElement.dataset.error=e.message;}
