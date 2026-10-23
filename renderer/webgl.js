import {mesh,mul,transform,worldParts} from './geometry.js';
export function createRenderer(canvas,asset){
 const gl=canvas.getContext('webgl',{antialias:true,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL unavailable');
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec3 p; uniform mat4 mvp; void main(){gl_Position=mvp*vec4(p,1.0);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; uniform vec3 color; void main(){gl_FragColor=vec4(color,1.0);}'));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const loc=gl.getAttribLocation(program,'p'),mvp=gl.getUniformLocation(program,'mvp'),color=gl.getUniformLocation(program,'color');
 gl.enableVertexAttribArray(loc);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 const buffer=data=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return {b,n:data.length/3};};
 const parts=asset.parts.map(p=>{const m=mesh(p.geometry);return {p,solid:buffer(m.triangles),line:buffer(m.lines)};}), matrices=worldParts(asset);
 const grid=[];for(let n=-10;n<=10;n++){const v=n/10;grid.push(-1,0,v,1,0,v,v,0,-1,v,0,1);}
 const gridBuffer=buffer(grid);
 function draw(b,mode,m,c){gl.uniformMatrix4fv(mvp,false,new Float32Array(m));gl.uniform3fv(color,c);gl.bindBuffer(gl.ARRAY_BUFFER,b.b);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);gl.drawArrays(mode,0,b.n);}
 return {render(instances,camera){
  const dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(canvas.clientWidth*dpr);canvas.height=Math.round(canvas.clientHeight*dpr);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.94,.93,.89,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const aspect=canvas.width/canvas.height, near=.01,far=100,f=1/Math.tan(Math.PI/8), projection=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];
  const view=mul(transform([0,0,-camera.distance]),mul(transform([0,0,0],[camera.pitch,camera.yaw,0]),transform([0,-.24,0]))),vp=mul(projection,view);
  draw(gridBuffer,gl.LINES,vp,[.79,.79,.74]);
  // Shared depth buffer across every instance; outlines also respect depth.
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);
  for(const i of instances)for(const {p,solid} of parts){const mat=asset.materials[p.material],emit=i.state.on?(mat.emissionWhenOn||0):0;const c=mat.color.map(v=>Math.min(1,v+emit*.3));draw(solid,gl.TRIANGLES,mul(vp,mul(transform(i.position,i.rotation,i.scale),matrices.get(p.id))),c);}
  gl.disable(gl.POLYGON_OFFSET_FILL);
  for(const i of instances)for(const {p,line} of parts)draw(line,gl.LINES,mul(vp,mul(transform(i.position,i.rotation,i.scale),matrices.get(p.id))),[.16,.20,.18]);
 }, gl};
}
