import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createInstance,saveScene} from '../renderer/model.js';import {resolveAttachments} from '../renderer/attachments.js';
const definitions=[['lobby-mail-bank',[-2,0,-1.3]],['lobby-parcel-drop',[-.65,0,-1.3]],['lobby-hand-truck',[.45,0,-1.4]],['lobby-intercom',[1.5,0,-.8]],['lobby-visitor-kiosk',[2.4,0,-.8]],['lobby-umbrella-rack',[-2.4,0,.4]],['lobby-turnstile',[1.3,0,.65]],['lobby-shoe-polisher',[-1.4,0,.4]],['office-sorting-table',[-.3,0,2]],['cafe-dining-chair',[-1.5,0,2]],['desk-lamp',[0,0,0]],['bathroom-tissue-box',[0,0,0]]];
const assets=new Map();for(const [id] of definitions)assets.set(id,JSON.parse(await readFile('assets/'+id+'/asset.json')));
const instances=definitions.map(([id,pos],n)=>createInstance(assets.get(id),'object-'+(n+1),pos));
instances[10].attachment={parentId:'object-9',surfaceId:'worktop',offset:[-.4,0],yaw:0};instances[11].attachment={parentId:'object-9',surfaceId:'worktop',offset:[.35,0],yaw:0};
await mkdir('assets/lobby-interior',{recursive:true});await writeFile('assets/lobby-interior/assembly.json',JSON.stringify(JSON.parse(saveScene(resolveAttachments(instances,assets))),null,2)+'\n');
