import {mesh,mul,transform,point,worldParts} from './geometry.js';
import {painterOrder,clipNear} from './painter.js';
import {matches} from './metric-state.js';

export function svgScene(asset,instances,camera,width,height){
 const view=mul(transform([0,0,-camera.distance]),mul(transform([0,0,0],[camera.pitch,camera.yaw,0]),transform((camera.target||[0,.24,0]).map(v=>-v))));
 const focal=height/(2*Math.tan(Math.PI/8));
 const xy=v=>[width/2+focal*v[0]/-v[2],height/2-focal*v[1]/-v[2]].map(n=>n.toFixed(3)).join(',');
 const items=[],grid=[],assets=asset instanceof Map?asset:new Map([[asset.id,asset]]);
 const path=item=>item.line?`<path d="M${item.vertices.map(xy).join('L')}" fill="none" stroke="${item.color}" stroke-width="${item.width}"/>`:`<path d="M${item.vertices.map(xy).join('L')}Z" fill="${item.color}" stroke="${item.color}" stroke-width=".3"/>`;
 for(let n=-10;camera.grid!==false&&n<=10;n++)for(const pair of [[[-1,0,n/10],[1,0,n/10]],[[n/10,0,-1],[n/10,0,1]]]){const item=clipNear({line:true,vertices:pair.map(v=>point(view,v)),color:'#c9c9bd',width:.5});if(item)grid.push(path(item));}
 for(const instance of instances){const current=assets.get(instance.assetId)||asset,matrices=worldParts(current);
 for(const part of current.parts){if(!matches(part.visibleWhen,instance.state))continue;
 const m=mul(view,mul(transform(instance.position,instance.rotation,instance.scale),matrices.get(part.id))),g=mesh(part.geometry),material=current.materials[part.material],emission=instance.state.on?(material.emissionWhenOn||0):0;
 const color=`rgb(${material.color.map(v=>Math.round(Math.min(1,v+emission*.3)*255)).join(',')})`;
 for(let n=0;n<g.triangles.length;n+=9){const item=clipNear({vertices:[0,3,6].map(k=>point(m,g.triangles.slice(n+k,n+k+3))),color});if(item)items.push(item);}
 for(let n=0;n<g.lines.length;n+=6){const item=clipNear({line:true,vertices:[point(m,g.lines.slice(n,n+3)),point(m,g.lines.slice(n+3,n+6))],color:'#29362f',width:.7});if(item)items.push(item);}
 }}
 return grid.join('')+painterOrder(items).map(path).join('');
}
export function createRenderer(svg,asset){return {render(instances,camera){const w=svg.clientWidth,h=svg.clientHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.innerHTML=svgScene(asset,instances,camera,w,h);}};}
