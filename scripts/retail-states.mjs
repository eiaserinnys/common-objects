import {createInstance,act} from '../renderer/model.js';
// Exhaustive reachable Boolean states, preserving an executable action path for browser QA.
export function reachableStates(asset){
 const out=[{state:structuredClone(asset.state),steps:[]}],seen=new Set([JSON.stringify(asset.state)]);
 for(let n=0;n<out.length;n++)for(const action of asset.actions){const i=createInstance(asset,'probe');i.state=structuredClone(out[n].state);try{act(asset,i,action.id);}catch{continue;}const key=JSON.stringify(i.state);if(!seen.has(key)){seen.add(key);out.push({state:i.state,steps:[...out[n].steps,action.id]});}}
 return out;
}
