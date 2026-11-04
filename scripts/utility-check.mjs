import {readFile,writeFile} from 'node:fs/promises';
import {validate} from './validate.mjs';
import {createInstance,act} from '../renderer/model.js';
import {instanceBounds,supportSurfaces} from '../renderer/metric-state.js';
const catalog=JSON.parse(await readFile('assets/catalog.json')),objects=[];
for(const path of catalog.assets.filter(p=>p.startsWith('utility-'))){
 const a=JSON.parse(await readFile('assets/'+path)),i=createInstance(a,a.id),geometry=validate(a);
 const states=[];for(let n=0;n<(a.actions.length?2:1);n++){states.push({state:structuredClone(i.state),bounds:instanceBounds(a,i),supportSurfaces:supportSurfaces(a,i)});if(a.actions.length)act(a,i,'toggle');}
 objects.push({id:a.id,version:a.version,dimensions:a.dimensions,scale:a.defaultScale,measurement:a.measurement.status,geometry,states,interactionNote:a.interactionNote,thumbnail:'assets/'+a.id+'/thumbnail.svg'});
}
await writeFile('docs/utility-validation-result.json',JSON.stringify({batch:'utility-2026-11-04',count:objects.length,objects},null,2)+'\n');
console.log('Validated',objects.length,'utility anchors and available states');
