import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createInstance,saveScene} from '../renderer/model.js';import {resolveAttachments} from '../renderer/attachments.js';
const definitions=[['wellness-couch',[-2.2,0,.0]],['wellness-parallel-bars',[0,0,-.4]],['wellness-training-stairs',[2.0,0,-2]],['wellness-wheelchair',[-2.0,0,2.0]],['wellness-walking-frame',[-.7,0,2.2]],['wellness-cycle',[2.0,0,.1]],['wellness-shoulder-wheel',[.2,0,-2.7]],['wellness-overbed-table',[-3.3,0,0]],['wellness-stadiometer',[-2.2,0,-2.5]],['wellness-transfer-hoist',[2.0,0,2.1]],['workplace-lockers',[3.5,0,-2.4]],['cafe-dining-chair',[-3.4,0,2.0]],['workplace-water-dispenser',[3.6,0,0]],['fitness-balance-board',[.6,0,2.25]],['bathroom-tissue-box',[0,0,0]],['fitness-foam-roller',[0,0,0]],['fitness-yoga-block',[0,0,0]]];
const assets=new Map();for(const [id] of definitions)assets.set(id,JSON.parse(await readFile('assets/'+id+'/asset.json')));
const instances=definitions.map(([id,pos],n)=>createInstance(assets.get(id),'object-'+(n+1),pos));
instances[14].attachment={parentId:'object-8',surfaceId:'tabletop',offset:[0,0],yaw:0};
instances[15].attachment={parentId:'object-1',surfaceId:'fixed-seat',offset:[0,.16],yaw:0};
instances[16].attachment={parentId:'object-1',surfaceId:'fixed-seat',offset:[0,.70],yaw:0};
await mkdir('assets/wellness-interior',{recursive:true});await writeFile('assets/wellness-interior/assembly.json',JSON.stringify(JSON.parse(saveScene(resolveAttachments(instances,assets))),null,2)+'\n');
