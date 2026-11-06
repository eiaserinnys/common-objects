import {readFile,writeFile} from 'node:fs/promises';
import {validate} from './validate.mjs';
import {createInstance,act} from '../renderer/model.js';
import {instanceBounds,supportSurfaces} from '../renderer/metric-state.js';
const catalog=JSON.parse(await readFile('assets/catalog.json')),objects=[];
for(const path of catalog.assets.filter(p=>p.startsWith('sanitary-'))){
 const a=JSON.parse(await readFile('assets/'+path)),i=createInstance(a,a.id),geometry=validate(a);
 const states=[];const keys=Object.keys(a.state);for(let mask=0;mask<2**keys.length;mask++){keys.forEach((k,n)=>i.state[k]=!!(mask&(1<<n)));states.push({state:structuredClone(i.state),bounds:instanceBounds(a,i),supportSurfaces:supportSurfaces(a,i)});}
 objects.push({id:a.id,version:a.version,dimensions:a.dimensions,scale:a.defaultScale,measurement:a.measurement.status,geometry,states,interactionNote:a.interactionNote,thumbnail:'assets/'+a.id+'/thumbnail.svg'});
}
await writeFile('docs/sanitary-validation-result.json',JSON.stringify({batch:'sanitary-2026-11-06',count:objects.length,objects},null,2)+'\n');
console.log('Validated',objects.length,'sanitary anchors and available states');
