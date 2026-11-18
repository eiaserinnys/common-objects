import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createInstance,saveScene} from '../renderer/model.js';import {resolveAttachments} from '../renderer/attachments.js';
const definitions=[['plant-air-handler',[-2.7,0,-1.3]],['plant-water-heater',[2.0,0,-2.0]],['plant-booster-skid',[.8,0,.1]],['plant-expansion-vessel',[2.4,0,.2]],['plant-water-softener',[3.3,0,-1.4]],['plant-distribution-panel',[0,0,0]],['plant-duct-damper',[-2.9,0,.5]],['plant-plate-exchanger',[-1.3,0,.1]],['plant-condensate-station',[0,0,1.5]],['plant-cable-ladder',[0,0,0]],['architecture-wall',[-2.5,0,-2.8]],['architecture-wall',[0,0,-2.8]],['office-sorting-table',[1.9,0,2.2]],['desk-lamp',[0,0,0]],['stationery-ruler',[0,0,0]],['repair-mechanic-stool',[.8,0,2.5]]];
const assets=new Map();for(const [id] of definitions)assets.set(id,JSON.parse(await readFile('assets/'+id+'/asset.json')));
const instances=definitions.map(([id,pos],n)=>createInstance(assets.get(id),'object-'+(n+1),pos));
instances[5].mount={parentId:'object-11',surfaceId:'front',anchorId:'back',offset:[0,.1]};
instances[9].mount={parentId:'object-12',surfaceId:'front',anchorId:'back',offset:[0,0]};
instances[13].attachment={parentId:'object-13',surfaceId:'worktop',offset:[-.4,0],yaw:0};instances[14].attachment={parentId:'object-13',surfaceId:'worktop',offset:[.35,0],yaw:0};
await mkdir('assets/plant-interior',{recursive:true});await writeFile('assets/plant-interior/assembly.json',JSON.stringify(JSON.parse(saveScene(resolveAttachments(instances,assets))),null,2)+'\n');
