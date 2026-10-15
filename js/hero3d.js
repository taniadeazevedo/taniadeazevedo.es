// Elemento 3D del hero: superficie de seda ondulante en WebGL (Three.js), paleta arcoíris de la web.
(function () {
  var canvas = document.getElementById('hero3d');
  if (!canvas || typeof THREE === 'undefined') return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // sin WebGL el canvas simplemente no se muestra
  }
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  var vertex = [
    'uniform float uTime;',
    'varying vec2 vUv;',
    'varying float vH;',
    'varying vec3 vNormal;',
    'varying vec3 vView;',
    'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}',
    'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}',
    'float snoise(vec3 v){',
    '  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);',
    '  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);',
    '  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);',
    '  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;',
    '  i=mod289(i);',
    '  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));',
    '  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;',
    '  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);',
    '  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);',
    '  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);',
    '  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));',
    '  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
    '  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);',
    '  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));',
    '  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;',
    '  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;',
    '  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));',
    '}',
    'float height(vec2 p){',
    '  float t=uTime*0.10;',
    '  float a=snoise(vec3(p.x*0.42+t, p.y*0.55-t*0.6, t*0.9));',
    '  float b=snoise(vec3(p.x*0.95-t*1.3, p.y*0.80+t*0.7, t*1.2+4.0));',
    '  return a*1.15+b*0.28;',
    '}',
    'void main(){',
    '  vUv=uv;',
    '  vec2 p0=position.xy;',
    '  float h=height(p0);',
    '  float e=0.06;',
    '  float hx=height(p0+vec2(e,0.0)); float hy=height(p0+vec2(0.0,e));',
    '  vec3 n=normalize(vec3(-(hx-h)/e,-(hy-h)/e,1.0));',
    '  vec3 pos=vec3(p0,h);',
    '  vH=h;',
    '  vNormal=normalize(normalMatrix*n);',
    '  vec4 mv=modelViewMatrix*vec4(pos,1.0);',
    '  vView=-mv.xyz;',
    '  gl_Position=projectionMatrix*mv;',
    '}'
  ].join('\n');

  var fragment = [
    'precision highp float;',
    'uniform float uTime;',
    'varying vec2 vUv;',
    'varying float vH;',
    'varying vec3 vNormal;',
    'varying vec3 vView;',
    'vec3 palette(float t){',
    '  vec3 c0=vec3(1.00,0.42,0.76); vec3 c1=vec3(1.00,0.70,0.28); vec3 c2=vec3(0.43,0.91,0.72);',
    '  vec3 c3=vec3(0.38,0.65,0.98); vec3 c4=vec3(0.66,0.33,0.97);',
    '  t=clamp(t,0.0,1.0)*4.0;',
    '  if(t<1.0) return mix(c0,c1,t);',
    '  if(t<2.0) return mix(c1,c2,t-1.0);',
    '  if(t<3.0) return mix(c2,c3,t-2.0);',
    '  return mix(c3,c4,t-3.0);',
    '}',
    'void main(){',
    '  vec3 n=normalize(vNormal); vec3 v=normalize(vView);',
    '  float k=vUv.x*0.62+vUv.y*0.22+vH*0.20+0.06*sin(uTime*0.25);',
    '  vec3 base=palette(k);',
    '  vec3 L=normalize(vec3(-0.5,0.7,0.65));',
    '  float diff=max(dot(n,L),0.0);',
    '  float fres=pow(1.0-max(dot(n,v),0.0),2.4);',
    '  float spec=pow(max(dot(reflect(-L,n),v),0.0),28.0);',
    '  vec3 col=base*(0.62+0.5*diff)+vec3(1.0)*spec*0.28+fres*0.14;',
    '  float ax=smoothstep(0.0,0.2,vUv.x)*smoothstep(1.0,0.8,vUv.x);',
    '  float ay=smoothstep(0.0,0.2,vUv.y)*smoothstep(1.0,0.8,vUv.y);',
    '  gl_FragColor=vec4(col,ax*ay);',
    '}'
  ].join('\n');

  var uniforms = { uTime: { value: 8.0 } };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    side: THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.5, 170, 120), material);
  mesh.rotation.set(-0.85, 0.0, 0.55);
  scene.add(mesh);

  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', function (e) {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  var visible = true, running = false, last = performance.now();

  function frame(now) {
    if (!visible || document.hidden) { running = false; return; }
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    uniforms.uTime.value += dt;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    mesh.rotation.x = -0.85 + pointer.y * 0.08;
    mesh.rotation.y = pointer.x * 0.10;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  resize();
  renderer.render(scene, camera);
  canvas.classList.add('is-ready');

  window.addEventListener('resize', function () { resize(); renderer.render(scene, camera); });
  document.addEventListener('visibilitychange', start);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(canvas);
  }
  start();
})();
