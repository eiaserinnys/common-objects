export function createInstance(asset, id, position = [0,0,0]) {
  return {id, assetId:asset.id, assetVersion:asset.version, position:[...position], rotation:[0,0,0], scale:[...asset.defaultScale], state:structuredClone(asset.state)};
}
export function act(asset, instance, actionId) {
  const a=asset.actions.find(a=>a.id===actionId);
  if(!a || a.type!=='toggle') throw Error('Unknown action');
  instance.state[a.stateKey]=!instance.state[a.stateKey];
}
export function saveScene(instances) { return JSON.stringify({schemaVersion:1,instances}); }
export function loadScene(text, assets) {
  const s=JSON.parse(text), ids=new Set();
  if(s.schemaVersion!==1 || !Array.isArray(s.instances)) throw Error('Unsupported scene');
  for(const i of s.instances){
    const a=assets.get(i.assetId);
    if(!a || i.assetVersion!==a.version || typeof i.id!=='string' || !i.id || ids.has(i.id)) throw Error('Invalid instance/asset version');
    ids.add(i.id);
    for(const k of ['position','rotation','scale']) if(!Array.isArray(i[k]) || i[k].length!==3 || !i[k].every(Number.isFinite)) throw Error('Invalid transform');
    if(i.scale.some(v=>v<=0) || !i.state || Object.keys(i.state).length!==Object.keys(a.state).length || Object.keys(a.state).some(k=>typeof i.state[k]!==typeof a.state[k])) throw Error('Invalid state/scale');
  }
  return structuredClone(s.instances);
}
