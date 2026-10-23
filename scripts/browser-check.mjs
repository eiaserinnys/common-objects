// Start the built preview on :8000 and Chromium with --remote-debugging-port=9222 first.
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map(),errors=[];ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params);if(m.id){const {resolve,reject}=pending.get(m.id);pending.delete(m.id);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
try{
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:8000/preview/'});
 for(let n=0;n<60;n++){if(await evaluate('document.documentElement.dataset.ready'))break;await new Promise(r=>setTimeout(r,100));}
 assert.equal(await evaluate('document.documentElement.dataset.ready'),'true');assert.equal(await evaluate('document.documentElement.dataset.error'),undefined);
 await mkdir('docs/screenshots',{recursive:true});
 const shot=async name=>{await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');const r=await send('Page.captureScreenshot',{format:'png'});await writeFile('docs/screenshots/'+name+'.png',Buffer.from(r.data,'base64'));};
 await shot('lamp-desktop');
 const result=await evaluate(`(()=>{const $=id=>document.getElementById(id);$('toggle').click();$('duplicate').click();$('toggle').click();$('save').click();const saved=JSON.parse(localStorage.getItem('common-objects.scene.v1'));$('selected').value='lamp-1';$('selected').dispatchEvent(new Event('change'));$('rotation').value='60';$('rotation').dispatchEvent(new Event('input'));$('zoom').value='1.6';$('zoom').dispatchEvent(new Event('input'));$('save').click();const rotated=localStorage.getItem('common-objects.scene.v1');$('toggle').click();$('restore').click();$('save').click();return {states:saved.instances.map(i=>i.state.on),restored:rotated===localStorage.getItem('common-objects.scene.v1'),rotation:JSON.parse(rotated).instances[0].rotation[1],glError:$('scene').getContext('webgl').getError()}})()`);
 assert.deepEqual(result.states,[true,false]);assert.equal(result.restored,true);assert.ok(Math.abs(result.rotation-Math.PI/3)<1e-8);assert.equal(result.glError,0);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:400,y:350,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:470,y:370,button:'left',buttons:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:470,y:370,button:'left',clickCount:1});
 await shot('lamp-duplicates');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await shot('lamp-mobile');assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);assert.deepEqual(errors,[]);
 console.log('PASS: browser load, WebGL, switch, independent duplicates, rotation, zoom, save/restore, drag, mobile overflow. Screenshots: docs/screenshots/');
}finally{ws.close();}
