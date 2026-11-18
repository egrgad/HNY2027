const M=`#version 300 es
in vec2 aPos;          // unit quad 0..1
in vec4 aRect;         // sprite rect in bg pixels: x, y, w, h
in vec4 aUv;           // atlas rect (normalised)
in vec4 aMotion;       // amp x, amp y, speed, phase
in vec2 aPulse;        // pulse speed, phase
uniform vec4 uBg;      // bg rect in device px: x, y, w, h
uniform vec2 uBgSize;  // bg image size in px
uniform vec2 uRes;
uniform float uTime;
uniform float uMode;   // 0 = base, 1 = sprites
out vec2 vUv;
out float vGain;
void main() {
  vec2 p;
  if (uMode < 0.5) {
    p = uBg.xy + aPos * uBg.zw;
    vUv = aPos;
    vGain = 1.0;
  } else {
    float t = uTime;
    float s = aMotion.z;
    float ph = aMotion.w;
    vec2 off = vec2(sin(t * s + ph) - sin(ph), sin(t * s * 0.73 + ph * 1.7) - sin(ph * 1.7)) * aMotion.xy;
    vec2 px = aRect.xy + off + aPos * aRect.zw;          // bg pixels
    p = uBg.xy + px / uBgSize * uBg.zw;
    vUv = aUv.xy + aPos * aUv.zw;
    vGain = 1.0 + 0.2 * (sin(t * aPulse.x + aPulse.y) - sin(aPulse.y));
  }
  vec2 clip = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`,y=`#version 300 es
precision highp float;
in vec2 vUv;
in float vGain;
uniform sampler2D uTex;
uniform float uMode;
uniform float uFade;
out vec4 o;
void main() {
  vec3 c = texture(uTex, vUv).rgb;
  o = vec4(c * vGain * uFade, uMode < 0.5 ? 1.0 : 0.0);
}`;function g(o,i,t){const r=o.createShader(i);if(o.shaderSource(r,t),o.compileShader(r),!o.getShaderParameter(r,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(r));return r}function B(o){let i=o>>>0;return()=>(i=i*1664525+1013904223>>>0,i/4294967296)}class S{constructor(i,t,r,a){const e=i.getContext("webgl2",{alpha:!1,antialias:!1,premultipliedAlpha:!1,powerPreference:"low-power"});if(!e)throw new Error("webgl2 unavailable");this.gl=e,this.canvas=i,this.meta=a;const s=e.createProgram();if(e.attachShader(s,g(e,e.VERTEX_SHADER,M)),e.attachShader(s,g(e,e.FRAGMENT_SHADER,y)),e.linkProgram(s),!e.getProgramParameter(s,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(s));this.prog=s,e.useProgram(s),this.u={};for(const n of["uBg","uBgSize","uRes","uTime","uMode","uTex","uFade"])this.u[n]=e.getUniformLocation(s,n);const d=n=>{const h=e.createTexture();return e.bindTexture(e.TEXTURE_2D,h),e.texImage2D(e.TEXTURE_2D,0,e.RGB,e.RGB,e.UNSIGNED_BYTE,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),h};this.baseTex=d(t),this.atlasTex=d(r),this.vao=e.createVertexArray(),e.bindVertexArray(this.vao);const b=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,b),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),e.STATIC_DRAW);const A=e.getAttribLocation(s,"aPos");e.enableVertexAttribArray(A),e.vertexAttribPointer(A,2,e.FLOAT,!1,0,0);const E=a.sprites.length,f=new Float32Array(E*14),c=B(2027),[x,R]=a.atlas;a.sprites.forEach(([n,h,l,u,_,w],U)=>{const v=U*14;f.set([n,h,l,u],v),f.set([_/x,w/R,l/x,u/R],v+4);const p=14+c()*16,m=c()*Math.PI*2;f.set([p*(.75+.5*Math.abs(Math.cos(m))),p*(.45+.35*Math.abs(Math.sin(m))),.21+c()*.24,c()*Math.PI*2],v+8),f.set([.35+c()*.55,c()*Math.PI*2],v+12)});const P=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,P),e.bufferData(e.ARRAY_BUFFER,f,e.STATIC_DRAW);const T=(n,h,l)=>{const u=e.getAttribLocation(s,n);return e.enableVertexAttribArray(u),e.vertexAttribPointer(u,h,e.FLOAT,!1,14*4,l*4),e.vertexAttribDivisor(u,1),u};this.instAttrs=[T("aRect",4,0),T("aUv",4,4),T("aMotion",4,8),T("aPulse",2,12)],this.count=E,e.bindVertexArray(null),this.time=0,this.rect={x:0,y:0,w:1,h:1}}resize(i,t,r){const a=Math.min(window.devicePixelRatio||1,1.5);this.canvas.width=Math.round(i*a),this.canvas.height=Math.round(t*a),this.dpr=a,this.rect=r}render(i){const t=this.gl,r=this.dpr;t.viewport(0,0,this.canvas.width,this.canvas.height),t.useProgram(this.prog),t.bindVertexArray(this.vao),t.uniform4f(this.u.uBg,this.rect.x*r,this.rect.y*r,this.rect.w*r,this.rect.h*r),t.uniform2f(this.u.uBgSize,this.meta.w,this.meta.h),t.uniform2f(this.u.uRes,this.canvas.width,this.canvas.height),t.uniform1f(this.u.uTime,i),t.uniform1f(this.u.uFade,1),t.uniform1i(this.u.uTex,0),t.activeTexture(t.TEXTURE0),t.disable(t.BLEND);for(const a of this.instAttrs)t.disableVertexAttribArray(a);t.uniform1f(this.u.uMode,0),t.bindTexture(t.TEXTURE_2D,this.baseTex),t.drawArrays(t.TRIANGLE_STRIP,0,4);for(const a of this.instAttrs)t.enableVertexAttribArray(a);t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE),t.uniform1f(this.u.uMode,1),t.bindTexture(t.TEXTURE_2D,this.atlasTex),t.drawArraysInstanced(t.TRIANGLE_STRIP,0,4,this.count),t.bindVertexArray(null)}}export{S as Background};
