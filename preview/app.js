import {createRenderer} from '../renderer/svg.js';
import {createInstance,act,saveScene,loadScene} from '../renderer/model.js';
const $=id=>document.getElementById(id), status=t=>$('status').textContent=t;
try{
 const response=await fetch('../assets/desk-lamp/asset.json');if(!response.ok)throw Error('Asset unavailable');const asset=await response.json();
 let instances=[createInstance(asset,'lamp-1')], selected='lamp-1', serial=1;
 const camera={yaw:-.45,pitch:.25,distance:1.25},renderer=createRenderer($('scene'),asset);
 $('dimensions').textContent=asset.dimensions.map(v=>Math.round(v*100)).join(' × ')+' cm';
 const current=()=>instances.find(i=>i.id===selected),render=()=>renderer.render(instances,camera);
 function refresh(){ $('selected').replaceChildren(...instances.map(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=i.id+(i.state.on?' · on':' · off');return o;}));$('selected').value=selected;$('toggle').textContent=current().state.on?'Turn off':'Turn on';$('toggle').setAttribute('aria-pressed',current().state.on);$('rotation').value=current().rotation[1]*180/Math.PI;$('degrees').textContent=Math.round(Number($('rotation').value))+'°';render();}
 $('toggle').onclick=()=>{act(asset,current(),'toggle');refresh();};
 $('selected').onchange=e=>{selected=e.target.value;refresh();};
 $('duplicate').onclick=()=>{const source=current(),i=structuredClone(source);i.id='lamp-'+(++serial);i.position[0]+=.32;i.position[2]+=.04;instances.push(i);selected=i.id;refresh();status('Independent copy created. Select either lamp to switch it.');};
 $('rotation').oninput=e=>{current().rotation[1]=Number(e.target.value)*Math.PI/180;refresh();};
 $('zoom').oninput=e=>{camera.distance=Number(e.target.value);render();};
 $('reset').onclick=()=>{Object.assign(camera,{yaw:-.45,pitch:.25,distance:1.25});$('zoom').value=camera.distance;render();};
 $('save').onclick=()=>{try{localStorage.setItem('common-objects.scene.v1',saveScene(instances));status('Arrangement saved on this browser.');}catch(e){status(e.message);}};
 $('restore').onclick=()=>{try{const data=localStorage.getItem('common-objects.scene.v1');if(!data)throw Error('No saved arrangement');instances=loadScene(data,new Map([[asset.id,asset]]));if(!instances.length)instances=[createInstance(asset,'lamp-1')];serial=Math.max(instances.length,...instances.map(i=>Number(i.id.split('-').at(-1))||0));selected=instances[0].id;refresh();status('Arrangement restored.');}catch(e){status(e.message);}};
 let drag=null;const canvas=$('scene');canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!drag)return;camera.yaw+=(e.clientX-drag[0])*.01;camera.pitch=Math.max(-1.2,Math.min(1.2,camera.pitch+(e.clientY-drag[1])*.01));drag=[e.clientX,e.clientY];render();};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
 canvas.addEventListener('wheel',e=>{e.preventDefault();camera.distance=Math.max(.65,Math.min(4,camera.distance+e.deltaY*.001));$('zoom').value=camera.distance;render();},{passive:false});
 new ResizeObserver(render).observe(canvas);refresh();document.documentElement.dataset.ready='true';
}catch(e){status(e.message);document.documentElement.dataset.error=e.message;}
