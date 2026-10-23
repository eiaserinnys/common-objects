import {test} from 'node:test';import assert from 'node:assert/strict';
import {painterOrder,clipNear} from '../renderer/painter.js';
test('spanning face and contour split around occluding plane',()=>{
 const plane={color:'wall',vertices:[[-1,-1,-2],[1,-1,-2],[0,1,-2]]};
 const crossing={color:'crossing',vertices:[[-.5,0,-3],[.5,0,-1],[0,.5,-1]]};
 const line={line:true,color:'edge',vertices:[[-1,0,-3],[1,0,-1]]};
 const out=painterOrder([plane,crossing,line]),wall=out.findIndex(p=>p.color==='wall');
 assert.ok(out.length>3);assert.ok(out.slice(0,wall).some(p=>p.color==='crossing'));assert.ok(out.slice(wall+1).some(p=>p.color==='crossing'));
 for(const p of out.slice(0,wall))assert.ok(p.vertices.every(v=>v[2]<=-2+1e-8));
 for(const p of out.slice(wall+1))assert.ok(p.vertices.every(v=>v[2]>=-2-1e-8));
});
test('near clipping removes behind-camera polygons and keeps finite intersection points',()=>{
 assert.equal(clipNear({vertices:[[0,0,1],[1,0,1],[0,1,1]]}),null);
 const p=clipNear({vertices:[[0,0,-1],[1,0,1],[0,1,-1]]});assert.equal(p.vertices.length,4);assert.ok(p.vertices.every(v=>v.every(Number.isFinite)&&v[2]<=-.01+1e-8));
});
