/* ============================================================
   CAPRA · observatorio (Three.js r160, MIT)
   Una sola figura: la cabra-pez de CAPRA dibujada en luz, trazo a trazo,
   con sus 7 estrellas encendidas; y el cielo real (zodiaco + 10 planetas).
   Monocromo: luz blanca + un acento cálido (el sol del logo).
   ============================================================ */
import * as THREE from './vendor/three.module.min.js';

const ACC = new THREE.Color('#D9C08A');
const GL = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇' };
const SG = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const FONT = '"Segoe UI Symbol","Apple Symbols","Noto Sans Symbols 2","Noto Sans Symbols",sans-serif';

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
function flareTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,248,230,1)'); g.addColorStop(0.08, 'rgba(255,236,200,.9)'); g.addColorStop(0.3, 'rgba(217,192,138,.22)'); g.addColorStop(1, 'rgba(217,192,138,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.globalCompositeOperation = 'lighter';
  [[0, 1], [1, 0]].forEach(([h, v]) => { const lg = x.createLinearGradient(h ? 0 : 128, v ? 0 : 128, h ? 256 : 128, v ? 256 : 128); lg.addColorStop(0, 'rgba(255,240,210,0)'); lg.addColorStop(0.5, 'rgba(255,240,210,.85)'); lg.addColorStop(1, 'rgba(255,240,210,0)'); x.fillStyle = lg; if (h) x.fillRect(0, 126, 256, 4); else x.fillRect(126, 0, 4, 256); });
  return new THREE.CanvasTexture(c);
}
function textSprite(txt) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 48; const x = c.getContext('2d');
  x.fillStyle = '#B9B7B0'; x.font = '500 22px "IBM Plex Mono", ui-monospace, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
  if (x.letterSpacing !== undefined) x.letterSpacing = '6px'; x.fillText(txt, 128, 26);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0 })); s.scale.set(0.9, 0.17, 1); return s;
}
function glyphSprite(ch, color, px) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = color; x.font = (px || 80) + 'px ' + FONT; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch + '︎', 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0 }));
}

/* puntos con revelado progresivo (atributo «ord») y titileo */
const VERT = `
attribute float ord; attribute float ph; attribute float sz;
uniform float uReveal; uniform float uTime; uniform float uScale; uniform float uFade;
varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  float r = smoothstep(ord-0.06, ord, uReveal);
  vA = r * uFade * (0.62 + 0.38 * sin(uTime*1.6 + ph*6.2831));
  gl_PointSize = sz * uScale * (0.6 + 0.4*r) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform sampler2D uTex; uniform vec3 uColor; varying float vA;
void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(uColor, t.a * vA); }`;

export function createObservatory(canvas, opts) {
  const mobile = !!(opts && opts.mobile);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const DPR = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(DPR);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
  const dot = dotTexture(), flare = flareTexture();

  /* estrellas: dos capas para profundidad */
  const starLayer = (n, r0, r1, size, op, k) => {
    const p = new Float32Array(n * 3), o = new Float32Array(n), ph = new Float32Array(n), s = new Float32Array(n);
    for (let i = 0; i < n; i++) { const r = r0 + Math.random() * (r1 - r0), th = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1; p[i * 3] = r * Math.sqrt(1 - u * u) * Math.cos(th); p[i * 3 + 1] = r * u * 0.7; p[i * 3 + 2] = -Math.abs(r * Math.sqrt(1 - u * u) * Math.sin(th)) - 4; o[i] = 0; ph[i] = Math.random(); s[i] = size * (0.4 + Math.random() * 1.2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('ord', new THREE.BufferAttribute(o, 1)); g.setAttribute('ph', new THREE.BufferAttribute(ph, 1)); g.setAttribute('sz', new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uReveal: { value: 1 }, uTime: { value: 0 }, uScale: { value: k * DPR }, uFade: { value: op }, uTex: { value: dot }, uColor: { value: new THREE.Color('#E8ECF5') } } });
    const pts = new THREE.Points(g, m); scene.add(pts); return pts;
  };
  const starsFar = starLayer(mobile ? 1400 : 2800, 40, 120, 1.0, 0.8, 200);
  const starsNear = starLayer(mobile ? 220 : 420, 10, 40, 0.9, 0.5, 60);

  /* la cabra-pez en luz */
  const goat = new THREE.Group(); scene.add(goat);
  const goatMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uReveal: { value: 0 }, uTime: { value: 0 }, uScale: { value: 24 * DPR }, uFade: { value: 1 }, uTex: { value: dot }, uColor: { value: new THREE.Color('#F4F1EA') } } });
  const IW = 1590, IH = 1479, W = 5.9, H = W * IH / IW;
  const STARS = [[1166, 320], [1102, 466], [566, 610], [410, 640], [380, 1010], [534, 1140], [830, 1290], [930, 1040]].map(([x, y]) => new THREE.Vector3((x / IW - 0.5) * W, (0.5 - y / IH) * H, 0.05));
  const flares = STARS.map((v, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flare, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.position.copy(v); s.scale.setScalar(0.9); s.userData.ord = 0; goat.add(s); return s; });
  const linePts = []; [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 1]].forEach(([a, b]) => linePts.push(STARS[a], STARS[b]));
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(linePts), new THREE.LineDashedMaterial({ color: ACC, dashSize: 0.06, gapSize: 0.09, transparent: true, opacity: 0 }));
  lines.computeLineDistances(); goat.add(lines);
  let goatPts = null;
  /* el trazo nítido de la cabra-pez como lámina de luz que se dibuja de la cola a la cabeza */
  const lineTex = new THREE.TextureLoader().load((opts && opts.goat) || 'img/cabra.webp');
  lineTex.colorSpace = THREE.SRGBColorSpace; lineTex.anisotropy = 8;
  const lineMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTex: { value: lineTex }, uReveal: { value: 0 }, uFade: { value: 1 }, uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D uTex; uniform float uReveal; uniform float uFade; uniform float uTime; varying vec2 vUv;
      void main(){ vec4 t = texture2D(uTex, vUv); float o = vUv.x*0.86 + (vUv.y)*0.06; float r = smoothstep(o-0.05, o, uReveal);
        float edge = smoothstep(o-0.05, o-0.005, uReveal) - smoothstep(o-0.005, o+0.02, uReveal);
        vec3 c = mix(vec3(0.95,0.94,0.91), vec3(1.0,0.86,0.6), clamp(edge*2.0,0.0,1.0));
        gl_FragColor = vec4(c, t.a * (r * 0.62 + edge * 0.9) * uFade); }` });
  const linePlane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), lineMat); linePlane.position.z = -0.02; goat.add(linePlane);
  const img = new Image(); img.src = (opts && opts.goat) || 'img/cabra.webp';
  img.decode().then(() => {
    const cw = 440, ch = Math.round(cw * IH / IW), c = document.createElement('canvas'); c.width = cw; c.height = ch; const x = c.getContext('2d'); x.drawImage(img, 0, 0, cw, ch);
    const d = x.getImageData(0, 0, cw, ch).data, src = [];
    for (let y = 0; y < ch; y++) for (let xx = 0; xx < cw; xx++) { const a = d[(y * cw + xx) * 4 + 3]; if (a > 60 && Math.random() < a / 255 * 0.85) src.push([xx / cw, y / ch]); }
    const N = Math.min(src.length, mobile ? 6000 : 11000);
    const p = new Float32Array(N * 3), o = new Float32Array(N), ph = new Float32Array(N), s = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const [u, v] = src[(Math.random() * src.length) | 0]; const jx = (Math.random() - 0.5) * 0.004, jy = (Math.random() - 0.5) * 0.004;
      p[i * 3] = (u + jx - 0.5) * W; p[i * 3 + 1] = (0.5 - v - jy) * H; p[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
      // se dibuja de la cola (izquierda) hacia la cabeza, con un poco de ruido para que parezca trazo
      o[i] = Math.min(1, Math.max(0, u * 0.86 + (1 - v) * 0.06 + (Math.random() - 0.5) * 0.06)); ph[i] = Math.random(); s[i] = 0.55 + Math.random() * 0.9;
    }
    STARS.forEach((v, i) => { flares[i].userData.ord = (v.x / W + 0.5) * 0.86 + 0.04; });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('ord', new THREE.BufferAttribute(o, 1)); g.setAttribute('ph', new THREE.BufferAttribute(ph, 1)); g.setAttribute('sz', new THREE.BufferAttribute(s, 1));
    goatPts = new THREE.Points(g, goatMat); goat.add(goatPts);
  }).catch(() => {});

  /* ---------- la obra de la portada: montaña, planetas y los cuatro elementos, en trazo fino de luz ---------- */
  const art = new THREE.Group(); goat.add(art);
  const drawables = [];
  const LW = '#F4F1EA';
  const addLine = (pts, op, start, dur, opts = {}) => {
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = opts.dashed ? new THREE.LineDashedMaterial({ color: opts.color || LW, transparent: true, opacity: 0, dashSize: opts.dash || 0.05, gapSize: opts.gap || 0.08, depthWrite: false })
      : new THREE.LineBasicMaterial({ color: opts.color || LW, transparent: true, opacity: 0, depthWrite: false });
    const l = new (opts.segments ? THREE.LineSegments : THREE.Line)(g, m); if (opts.dashed) l.computeLineDistances();
    l.userData = { base: op, start, dur, n: pts.length }; g.setDrawRange(0, 0); art.add(l); drawables.push(l); return l;
  };
  const ring = (cx, cy, z, r, a0 = 0, a1 = Math.PI * 2, n = 64, sx = 1, sy = 1, rot = 0) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, x = Math.cos(a) * r * sx, y = Math.sin(a) * r * sy; p.push(new THREE.Vector3(cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot), z)); } return p; };
  /* cordillera: tres crestas con desplazamiento fractal y achurado de grabado */
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ridge = (x0, x1, base, peaks, z, op, start, hatch) => {
    let pts = [[x0, base], ...peaks, [x1, base]];
    for (let it = 0; it < 6; it++) { const np = []; for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; np.push([ax, ay]); const d = Math.hypot(bx - ax, by - ay); np.push([(ax + bx) / 2, (ay + by) / 2 + (rnd() - 0.5) * d * 0.22]); } np.push(pts[pts.length - 1]); pts = np; }
    addLine(pts.map(([x, y]) => new THREE.Vector3(x, y, z)), op, start, 0.5);
    if (hatch) { const hs = []; for (let i = 2; i < pts.length - 2; i += 2) { const [x, y] = pts[i], [px, py] = pts[i - 2], slope = (y - py) / (x - px || 1e-3); if (slope < -0.25 && rnd() < 0.85) { const L = 0.12 + rnd() * 0.35; hs.push(new THREE.Vector3(x, y - 0.03, z), new THREE.Vector3(x - L * 0.45, y - L, z)); } } if (hs.length) addLine(hs, op * 0.6, start + 0.15, 0.4, { segments: true }); }
  };
  ridge(-4.6, 4.9, -3.75, [[-3.1, -3.05], [-1.6, -2.75], [0.35, -2.05], [1.7, -2.55], [3.4, -2.85]], 0.15, 0.55, 0.30, true);
  ridge(-4.9, 5.2, -3.6, [[-2.4, -2.55], [-0.6, -2.35], [2.5, -2.3], [4.1, -2.6]], -0.9, 0.26, 0.38, false);
  ridge(-5.2, 5.4, -3.5, [[-3.6, -2.25], [-1.2, -2.0], [1.3, -1.85], [3.6, -2.1]], -1.8, 0.14, 0.44, false);
  /* órbita y planetas */
  const ORX = 4.15, ORY = 1.15, OCY = 0.55, OROT = -0.16;
  addLine(ring(0, OCY, -0.4, 1, -2.45, 2.25, 180, ORX, ORY, OROT), 0.32, 0.48, 0.5, { dashed: true });
  addLine(ring(0, 0.2, -1.2, 5.0, -1.9, 1.75, 180), 0.12, 0.6, 0.4, { dashed: true, dash: 0.03, gap: 0.12 });
  const onOrbit = (deg) => { const a = deg * Math.PI / 180, x = Math.cos(a) * ORX, y = Math.sin(a) * ORY; return [x * Math.cos(OROT) - y * Math.sin(OROT), OCY + x * Math.sin(OROT) + y * Math.cos(OROT)]; };
  const label = (ch, x, y, z, color) => { const s = glyphSprite(ch, color || '#D8D6CF', 84); s.position.set(x, y, z); s.scale.set(0.3, 0.3, 1); s.userData = { base: 0.85, start: 0.68, dur: 0.3, sprite: true }; art.add(s); drawables.push(s); return s; };
  const planet = (deg, kind) => {
    const [x, y] = onOrbit(deg), z = -0.3, st = 0.46 + (deg % 360) / 360 * 0.2;
    if (kind === 'Sun') {
      addLine(ring(x, y, z, 0.3, 0, Math.PI * 2, 48), 0.95, st, 0.25, { color: '#D9C08A' });
      const rays = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r1 = 0.38, r2 = i % 2 ? 0.55 : 0.7; rays.push(new THREE.Vector3(x + Math.cos(a) * r1, y + Math.sin(a) * r1, z), new THREE.Vector3(x + Math.cos(a) * r2, y + Math.sin(a) * r2, z)); }
      addLine(rays, 0.8, st + 0.08, 0.25, { segments: true, color: '#D9C08A' });
      const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: flare, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); f.position.set(x, y, z); f.scale.setScalar(1.3); f.userData = { base: 0.55, start: st + 0.1, dur: 0.3, sprite: true }; art.add(f); drawables.push(f);
    } else if (kind === 'Moon') {
      addLine(ring(x, y, z, 0.24, Math.PI * 0.55, Math.PI * 1.45, 40), 0.9, st, 0.25);
      addLine(ring(x - 0.1, y, z, 0.2, Math.PI * 0.62, Math.PI * 1.38, 40), 0.9, st + 0.05, 0.25);
    } else if (kind === 'Saturn') {
      addLine(ring(x, y, z, 0.22, 0, Math.PI * 2, 48), 0.9, st, 0.25);
      addLine(ring(x, y, z + 0.01, 1, 0, Math.PI * 2, 64, 0.5, 0.13, -0.35), 0.8, st + 0.08, 0.25);
    } else if (kind === 'Jupiter') {
      addLine(ring(x, y, z, 0.3, 0, Math.PI * 2, 56), 0.9, st, 0.25);
      const b = []; [-0.12, 0, 0.12].forEach((dy) => { const w = Math.sqrt(0.3 * 0.3 - dy * dy); b.push(new THREE.Vector3(x - w, y + dy, z), new THREE.Vector3(x + w, y + dy, z)); }); addLine(b, 0.5, st + 0.08, 0.2, { segments: true });
    } else addLine(ring(x, y, z, kind === 'Mars' ? 0.13 : 0.09, 0, Math.PI * 2, 32), 0.9, st, 0.2);
    label(GL[kind], x, y + (kind === 'Sun' ? 0.95 : 0.5), z, kind === 'Sun' ? '#D9C08A' : null);
  };
  [[18, 'Saturn'], [50, 'Jupiter'], [92, 'Sun'], [122, 'Mercury'], [292, 'Moon'], [338, 'Mars']].forEach(([d, k]) => planet(d, k));
  /* los cuatro elementos (triángulos alquímicos) */
  const tri = (x, y, s, down, bar, name, st) => {
    const h = s * 0.87, p = down ? [[x - s / 2, y + h / 2], [x + s / 2, y + h / 2], [x, y - h / 2]] : [[x - s / 2, y - h / 2], [x + s / 2, y - h / 2], [x, y + h / 2]];
    addLine([...p, p[0]].map(([a, b]) => new THREE.Vector3(a, b, -0.2)), 0.7, st, 0.2);
    if (bar) addLine([new THREE.Vector3(x - s * 0.36, y + (down ? -0.06 : 0.06) * s * 2, -0.2), new THREE.Vector3(x + s * 0.36, y + (down ? -0.06 : 0.06) * s * 2, -0.2)], 0.7, st + 0.05, 0.15);
    const t = textSprite(name); t.position.set(x, y - s * 0.95, -0.2); t.userData = { base: 0.55, start: st + 0.1, dur: 0.3, sprite: true }; art.add(t); drawables.push(t);
  };
  tri(-3.55, 2.55, 0.42, false, false, 'FUEGO', 0.5); tri(3.55, 2.65, 0.42, false, true, 'AIRE', 0.54);
  tri(2.95, -2.6, 0.42, true, false, 'AGUA', 0.58); tri(-1.65, -2.75, 0.42, true, true, 'TIERRA', 0.6);

  /* el cielo real: anillo zodiacal y planetas */
  const sky = new THREE.Group(); sky.position.set(0, -0.6, -9); sky.rotation.x = -1.05; scene.add(sky);
  const lm = (op) => new THREE.LineBasicMaterial({ color: '#E8ECF5', transparent: true, opacity: op });
  const circ = (r, op) => { const pts = []; for (let i = 0; i <= 256; i++) { const a = i / 256 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); } const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm(op)); l.userData.base = op; sky.add(l); return l; };
  circ(5.6, 0.55); circ(4.9, 0.3); circ(3.2, 0.12);
  const tk = []; for (let i = 0; i < 360; i += 5) { const a = i * Math.PI / 180, r2 = i % 30 ? 5.42 : 4.9; tk.push(new THREE.Vector3(Math.cos(a) * 5.6, Math.sin(a) * 5.6, 0), new THREE.Vector3(Math.cos(a) * r2, Math.sin(a) * r2, 0)); }
  const ticks = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tk), lm(0.35)); ticks.userData.base = 0.35; sky.add(ticks);
  const signs = SG.map((g, i) => { const s = glyphSprite(g, '#C9CCD6', 74); const a = (i * 30 + 15) * Math.PI / 180; s.position.set(Math.cos(a) * 5.25, Math.sin(a) * 5.25, 0.01); s.scale.set(0.42, 0.42, 1); s.userData.base = 0.8; sky.add(s); return s; });
  const planets = {}; Object.keys(GL).forEach((k) => {
    const g = new THREE.Group(); const isSun = k === 'Sun';
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: isSun ? flare : dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: isSun ? '#FFFFFF' : '#F4F1EA' }));
    f.scale.setScalar(isSun ? 1.4 : 0.24); f.userData.base = 1; g.add(f);
    const lab = glyphSprite(GL[k], isSun ? '#D9C08A' : '#F4F1EA', 84); lab.position.y = 0.46; lab.scale.set(0.38, 0.38, 1); lab.userData.base = 1; g.add(lab);
    sky.add(g); planets[k] = g;
  });

  const S = { goatX: 1.5, goatY: 0.1, goatZ: 0, goatS: 1, goatFade: 1, artFade: 1, reveal: 0, artReveal: 0, camX: 0, camY: 0, camZ: 9, lookX: 1.2, lookY: 0, lookZ: 0, sky: 0, skyRot: 0 };
  let mx = 0, my = 0, tmx = 0, tmy = 0, running = true, t0 = performance.now();
  addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });
  const resize = () => { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);
  const look = new THREE.Vector3();
  const setOp = (o, v) => { o.traverse((n) => { if (n.material && n.material.opacity !== undefined && !n.material.uniforms) n.material.opacity = (n.userData.base ?? 1) * v; }); };
  function frame(now) {
    if (!running) return;
    const t = (now - t0) / 1000;
    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
    [starsFar, starsNear].forEach((s) => { s.material.uniforms.uTime.value = t; }); goatMat.uniforms.uTime.value = t;
    starsFar.rotation.y = t * 0.004 + mx * 0.04; starsNear.rotation.y = t * 0.008 + mx * 0.1;
    goatMat.uniforms.uReveal.value = S.reveal; goatMat.uniforms.uFade.value = S.goatFade * 0.8;
    lineMat.uniforms.uReveal.value = S.reveal; lineMat.uniforms.uFade.value = S.goatFade;
    goat.position.set(S.goatX, S.goatY, S.goatZ); goat.scale.setScalar(S.goatS);
    goat.rotation.y = mx * 0.22 + Math.sin(t * 0.15) * 0.05; goat.rotation.x = -my * 0.12;
    flares.forEach((f, i) => { const on = Math.max(0, Math.min(1, (S.reveal - f.userData.ord) / 0.08)); f.material.opacity = on * S.goatFade * (0.75 + 0.25 * Math.sin(t * 2 + i)); f.scale.setScalar(0.55 + on * 0.5 + 0.06 * Math.sin(t * 1.7 + i * 2)); });
    lines.material.opacity = Math.max(0, Math.min(1, (S.reveal - 0.92) / 0.08)) * 0.6 * S.goatFade;
    const af = S.goatFade * (S.artFade ?? 1), ar = S.artReveal ?? S.reveal;
    drawables.forEach((d) => { const u = d.userData, k = Math.max(0, Math.min(1, (ar - u.start) / u.dur)); if (u.sprite) d.material.opacity = u.base * k * af; else { d.geometry.setDrawRange(0, Math.ceil(u.n * k) * (d.isLineSegments ? 1 : 1)); d.material.opacity = u.base * af * (k > 0 ? 1 : 0); } d.visible = k > 0 && af > 0.01; });
    art.position.z = Math.sin(t * 0.2) * 0.05;
    sky.rotation.z = S.skyRot + t * 0.01; setOp(sky, S.sky); sky.visible = S.sky > 0.01;
    camera.position.set(S.camX + mx * 0.5, S.camY - my * 0.35, S.camZ); look.set(S.lookX, S.lookY, S.lookZ); camera.lookAt(look);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) requestAnimationFrame(frame); });
  return {
    state: S,
    setSky(bodies) { bodies.forEach((b) => { const g = planets[b.k]; if (!g) return; const a = b.lon * Math.PI / 180, r = b.k === 'Moon' ? 4.15 : b.k === 'Sun' ? 4.55 : 3.85 + (['Mercury', 'Venus', 'Mars'].includes(b.k) ? 0.35 : 0); g.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.02); }); },
    resize,
  };
}
