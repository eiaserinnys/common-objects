export function createInstance(asset, id, position = [0,0,0]) {
  return {id, assetId:asset.id, assetVersion:asset.version, position:[...position], rotation:[0,0,0], scale:[...asset.defaultScale], state:structuredClone(asset.state)};
}
export function act(asset, instance, actionId) {
  const a=asset.actions.find(a=>a.id===actionId);
  if(!a) throw Error('Unknown action');
  if(a.type==='toggle'){instance.state[a.stateKey]=!instance.state[a.stateKey];return;}
  if(a.type==='dehumidify'){
    const m=asset.simulation,s=instance.state;
    if(s.full||s.humidity<=m.targetHumidity)return;
    s.waterMl=Math.min(m.tankCapacityMl,s.waterMl+m.waterPerCycleMl);
    s.humidity=Math.max(m.targetHumidity,s.humidity-m.humidityDropPerCycle);
    s.wet=s.waterMl>0;s.full=s.waterMl>=m.tankCapacityMl;return;
  }
  if(a.type==='empty-tank'){Object.assign(instance.state,{waterMl:0,wet:false,full:false});return;}
  throw Error('Unknown action');
}
export function saveScene(instances) { return JSON.stringify({schemaVersion:1,instances}); }
export function loadScene(text, assets) {
  const s=JSON.parse(text), ids=new Set();
  if(s.schemaVersion!==1 || !Array.isArray(s.instances)) throw Error('Unsupported scene');
  for(const i of s.instances){
    const a=assets.get(i.assetId);
    if(!a || ![a.version,...(a.compatibleVersions||[])].includes(i.assetVersion) || typeof i.id!=='string' || !i.id || ids.has(i.id)) throw Error('Invalid instance/asset version');
    ids.add(i.id);
    for(const k of ['position','rotation','scale']) if(!Array.isArray(i[k]) || i[k].length!==3 || !i[k].every(Number.isFinite)) throw Error('Invalid transform');
    if(i.scale.some(v=>v<=0) || !i.state || Object.keys(i.state).length!==Object.keys(a.state).length || Object.keys(a.state).some(k=>typeof i.state[k]!==typeof a.state[k])) throw Error('Invalid state/scale');
  }
  return structuredClone(s.instances);
}

export function placementLocked(asset,instance){return !!asset.placementLockWhen&&Object.entries(asset.placementLockWhen).every(([k,v])=>instance.state[k]===v);}
