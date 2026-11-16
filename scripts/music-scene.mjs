import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createInstance,saveScene} from '../renderer/model.js';import {resolveAttachments} from '../renderer/attachments.js';
const definitions=[['music-upright-piano',[-1.8,0,-1.6]],['music-drum-kit',[1.1,0,-1.6]],['music-vibraphone',[1.7,0,.4]],['music-harp',[-2.3,0,.3]],['music-cello',[-2.2,0,1.8]],['music-guitar',[-1.4,0,1.8]],['music-amplifier',[.15,0,1.8]],['music-microphone',[.1,0,.3]],['music-music-stand',[-.9,0,.3]],['music-metronome',[0,0,0]],['cafe-dining-chair',[-1.8,0,-.65]],['repair-mechanic-stool',[1.1,0,-2.6]],['office-archive-shelf',[3.0,0,-1.9]],['office-sorting-table',[2.0,0,2.0]],['desk-lamp',[0,0,0]]];
const assets=new Map();for(const [id] of definitions)assets.set(id,JSON.parse(await readFile('assets/'+id+'/asset.json')));
const instances=definitions.map(([id,pos],n)=>createInstance(assets.get(id),'object-'+(n+1),pos));instances[10].rotation[1]=Math.PI;
instances[9].attachment={parentId:'object-14',surfaceId:'worktop',offset:[-.40,0],yaw:0};
instances[14].attachment={parentId:'object-14',surfaceId:'worktop',offset:[.35,0],yaw:0};
await mkdir('assets/music-interior',{recursive:true});await writeFile('assets/music-interior/assembly.json',JSON.stringify(JSON.parse(saveScene(resolveAttachments(instances,assets))),null,2)+'\n');
