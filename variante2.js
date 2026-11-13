// Unità C — VARIANTE 2 — tour 3D. Geometria e arredo di soggiorno, cucina e cappottiera da
// Variante2_Appartamento.FCMacro. Coordinate in metri come nella macro: x verso est, z = "y dall'alto"
// (verso sud), origine = angolo interno in alto a sinistra del Letto 1. y = quota.
import * as THREE from './vendor/three.module.min.js';

const H = 2.70;
const V3 = THREE.Vector3;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .92;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#cfe4f2');
const camera = new THREE.PerspectiveCamera(68, 1, 0.05, 200);
camera.rotation.order = 'YXZ';

// ---------- texture ----------
function canvasTex(size, metres, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / metres, 1 / metres);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const parquetTex = canvasTex(1024, 2.1, (g, S) => {       // parquet esistente (dalla foto)
  const tones = ['#b8682e', '#a8552a', '#8e3f22', '#c98042', '#7c341f', '#d39550', '#9c4a26', '#b97538', '#a3602f'];
  const rows = 30, rh = S / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * 250;
    while (x < S) {
      const len = (0.35 + rnd() * 0.3) / 2.1 * S;
      g.fillStyle = tones[Math.floor(rnd() * tones.length)];
      for (const ox of [0, -S]) g.fillRect(x + ox, r * rh, len, rh);
      g.strokeStyle = 'rgba(40,15,5,.35)'; g.lineWidth = 1;
      for (const ox of [0, -S]) g.strokeRect(x + ox + .5, r * rh + .5, len, rh);
      g.strokeStyle = 'rgba(60,25,10,.10)';
      for (let k = 0; k < 3; k++) { const yy = r * rh + 4 + rnd() * (rh - 8); g.beginPath(); g.moveTo(x, yy); g.lineTo(x + len, yy + (rnd() - .5) * 3); g.stroke(); }
      x += len;
    }
  }
});
function tileTex(base, grout, tile, vary = 8) {
  return canvasTex(512, tile * 2, (g, S) => {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const c = new THREE.Color(base); const d = (rnd() - .5) * vary / 255; c.r += d; c.g += d; c.b += d;
      g.fillStyle = '#' + c.getHexString(); g.fillRect(i * S / 2, j * S / 2, S / 2, S / 2);
      for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(255,255,255,${rnd() * .05})`; g.fillRect(i * S / 2 + rnd() * S / 2, j * S / 2 + rnd() * S / 2, 30 * rnd(), 2); }
    }
    g.strokeStyle = grout; g.lineWidth = 3;
    for (const p of [0, S / 2, S]) { g.beginPath(); g.moveTo(p, 0); g.lineTo(p, S); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(S, p); g.stroke(); }
  });
}

// ---------- materiali ----------
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...o });
const rgb = (r, g, b, o = {}) => M(new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace), o);
const mWall = M('#f3eee4', { roughness: .95 });
const mExt = M('#b9604d', { roughness: .95 });
const mCeil = M('#fbfaf6', { roughness: 1 });
const mDoor = M('#f7f5f0', { roughness: .6 });
const mEntryDoor = M('#6b4a35', { roughness: .55 });
const mFrame = M('#2c2c30', { roughness: .5, metalness: .3 });
const mGlass = new THREE.MeshStandardMaterial({ color: '#cfe6ee', roughness: .05, transparent: true, opacity: .14, depthWrite: false });
const mParquet = M('#ffffff', { map: parquetTex, roughness: .38 });
const mKitTile = M('#ffffff', { map: tileTex('#bdb5a6', 'rgba(110,102,90,.6)', .6), roughness: .55 });
const mBathTile = M('#ffffff', { map: tileTex('#ddd8ce', 'rgba(150,145,135,.6)', .6), roughness: .45 });
const mBathDark = M('#ffffff', { map: tileTex('#8f8377', 'rgba(60,55,50,.6)', .6), roughness: .45 });
const mOutTile = M('#ffffff', { map: tileTex('#b9b4aa', 'rgba(90,88,82,.6)', .6), roughness: .8 });
const mLanding = M('#ffffff', { map: tileTex('#a9a7a2', 'rgba(80,80,80,.5)', .45), roughness: .6 });
const mOak = M('#c9a97c', { roughness: .6 });
const mWhite = M('#f4f3ef', { roughness: .5 });
const mBlack = M('#232326', { roughness: .5, metalness: .4 });
const mSteel = M('#c4c7ca', { roughness: .35, metalness: .25 });
const mFabric = M('#b9b2a5', { roughness: 1 });
const mFabricDark = M('#7d8279', { roughness: 1 });
const mLinen = M('#ece7dd', { roughness: 1 });
const mRug = M('#d9d2c4', { roughness: 1 });
const mGreige = M('#cfc6b6', { roughness: .95 });
const mSage = M('#9aa58f', { roughness: .6 });
const mQuartz = M('#ecebe6', { roughness: .3 });
const mLeaf = M('#5d7f4a', { roughness: .9 });
const mPot = M('#d8d2c6', { roughness: .8 });
const mMirror = M('#cfd8dc', { roughness: .08, metalness: .6 });
const mGlow = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff1d6', emissiveIntensity: 1.6 });
const mAccentBlue = M('#8fa3ad', { roughness: .95 });
const mBathWall = M('#d5cec1', { roughness: .5 });
const mBathWallDark = M('#a79b8c', { roughness: .5 });
const mTerracottaSoft = M('#c9a493', { roughness: .95 });
const mCloset = rgb(.82, .76, .66, { roughness: .6 });       // ante cappottiera (colore della macro)

// ---------- primitive ----------
function box(parent, w, h, d, mat, x, y, z, ry = 0, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y + h / 2, z); m.rotation.y = ry;
  m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
}
function cyl(parent, r, h, mat, x, y, z, rTop = r) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, r, h, 32), mat);
  m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
// stessa firma della macro: bx(x0, y0, x1, y1, z0, z1) con y "dall'alto" e z = quota
const bx = (g, x0, y0, x1, y1, z0, z1, mat, shadow = true) => box(g, x1 - x0, z1 - z0, y1 - y0, mat, (x0 + x1) / 2, z0, (y0 + y1) / 2, 0, shadow);
function G(x, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); return g; }
const R = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
function floor(pts, mat, y = 0) {
  const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m;
}

// ---------- muri con aperture ----------
// Muro da A a B (asse), spessore t. Aperture: {c: distanza del centro da A, w, head, sill, type}.
// +Z locale = a destra della direzione A->B vista dall'alto.
let entryDoor = null;
function wall(ax, az, bx_, bz, t, ops = [], o = {}) {
  const dx = bx_ - ax, dz = bz - az, L = Math.hypot(dx, dz);
  const g = new THREE.Group(); g.position.set(ax, 0, az); g.rotation.y = Math.atan2(-dz, dx); scene.add(g);
  const piece = (x0, x1, y0, y1) => {
    if (x1 - x0 < 1e-3 || y1 - y0 < 1e-3) return;
    if (o.ext) {
      const ti = .08, te = t - ti;
      box(g, x1 - x0, y1 - y0, te, mExt, (x0 + x1) / 2, y0, o.ext * (t / 2 - te / 2));
      box(g, x1 - x0, y1 - y0, ti, mWall, (x0 + x1) / 2, y0, -o.ext * (t / 2 - ti / 2));
    } else box(g, x1 - x0, y1 - y0, t, o.mat || mWall, (x0 + x1) / 2, y0, 0);
  };
  let x = 0;
  for (const op of [...ops].sort((a, b) => a.c - b.c)) {
    const x0 = op.c - op.w / 2, x1 = op.c + op.w / 2, sill = op.sill || 0, head = op.head;
    piece(x, x0, 0, H); piece(x0, x1, head, H); piece(x0, x1, 0, sill);
    fillOpening(g, op, x0, x1, sill, head, t);
    x = x1;
  }
  piece(x, L, 0, H);
  return g;
}
function fillOpening(g, op, x0, x1, sill, head, t) {
  const w = x1 - x0, h = head - sill, cx = (x0 + x1) / 2;
  if (op.type === 'door') {
    const f = .04, s = op.side || 1, hs = op.hinge !== 'end', lw = w - 2 * f, dir = hs ? 1 : -1;
    const fm = op.entry ? mEntryDoor : mDoor;
    box(g, f, head, t + .02, fm, x0 + f / 2, 0, 0); box(g, f, head, t + .02, fm, x1 - f / 2, 0, 0); box(g, w, f, t + .02, fm, cx, head - f, 0);
    const piv = new THREE.Group(); piv.position.set(hs ? x0 + f : x1 - f, 0, 0); g.add(piv);
    box(piv, lw, head - f - .01, .04, fm, dir * lw / 2, .005, 0);
    box(piv, .13, .02, .1, mSteel, dir * (lw - .09), 1.0, 0);
    const sign = hs ? -s : s, open = op.open ?? 1.75;
    piv.rotation.y = sign * open;
    if (op.entry) entryDoor = { piv, sign, open };
  } else if (op.type === 'closet') {          // cappottiera: due ante a battente chiuse sulla diagonale
    const zf = -(t / 2 - .01);
    for (const sg of [-1, 1]) {
      box(g, .59, head, .04, mCloset, cx + sg * .30, 0, zf);
      box(g, .015, .3, .03, mSteel, cx + sg * .035, 1.0, zf - .03);
    }
  } else if (op.type === 'slider') {          // vetrata scorrevole soggiorno/cucina: metà ovest aperta
    const b = .04, dpt = t + .02;
    box(g, b, head, dpt, mFrame, x0 + b / 2, 0, 0); box(g, b, head, dpt, mFrame, x1 - b / 2, 0, 0); box(g, w, b, dpt, mFrame, cx, head - b, 0);
    box(g, w, .008, .07, mFrame, cx, 0, 0, 0, false);
    for (const zo of [-.022, .022]) {         // anta fissa + anta scorrevole impacchettata sulla metà est
      const pw = w / 2, px = cx + pw / 2 - b / 2 + (zo > 0 ? -.03 : 0);
      box(g, pw - .02, h - b - .02, .008, mGlass, px, .01, zo, 0, false);
      box(g, .03, h - b, .03, mFrame, px - pw / 2 + .015, 0, zo); box(g, .03, h - b, .03, mFrame, px + pw / 2 - .025, 0, zo);
      box(g, pw - .02, .03, .03, mFrame, px, 0, zo); box(g, pw - .02, .03, .03, mFrame, px, h - b - .03, zo);
    }
  } else {                                    // finestra o portafinestra
    const b = .05, dpt = .07;
    box(g, b, h, dpt, mFrame, x0 + b / 2, sill, 0); box(g, b, h, dpt, mFrame, x1 - b / 2, sill, 0);
    box(g, w, b, dpt, mFrame, cx, head - b, 0); box(g, w, b, dpt, mFrame, cx, sill, 0);
    if (w > 1) box(g, b * 1.4, h, dpt, mFrame, cx, sill, 0);
    box(g, w - b, h - b, .012, mGlass, cx, sill + b / 2, 0, 0, false);
    if (sill > 0) box(g, w + .1, .03, t + .06, mQuartz, cx, sill - .03, 0);
  }
}
const door = (c, side, hinge, extra = {}) => ({ type: 'door', c, w: .8, head: 2.1, side, hinge, ...extra });
const win = (c, w, sill = .9, head = 2.2) => ({ type: 'window', c, w, sill, head });
const french = (c, w) => ({ type: 'french', c, w, sill: 0, head: 2.3 });

// perimetro (spessore 30 cm, come WALL_T della macro)
wall(-.30, -.15, 7.86, -.15, .30, [win(1.35, 1.30), win(4.56, 1.95)], { ext: -1 });               // nord
wall(7.71, -.30, 7.71, 8.94, .30, [win(4.42, .70, 1.5), french(6.30, 1.30)], { ext: -1 });       // est (letti, bagno)
wall(6.10, 8.79, 7.86, 8.79, .30, [], { ext: 1 });                                                // letto 3 / loggia
wall(5.95, 8.64, 5.95, 13.00, .30, [french(1.43, 1.45), french(2.91, 1.45)], { ext: -1 });       // soggiorno / loggia
wall(6.10, 12.85, 7.96, 12.85, .30, [], { ext: -1 });                                             // cucina / loggia
wall(7.81, 12.70, 7.81, 16.05, .30, [french(1.70, 1.30)], { ext: -1 });                           // cucina est
wall(3.76, 15.90, 7.96, 15.90, .30, [], { ext: 1 });                                              // cucina sud
wall(2.46, 15.825, 3.76, 15.825, .45);                                                            // scalino da 15 cm
wall(-.15, -.30, -.15, 13.70, .30);                                                               // ovest
// ingresso: porta C sulla diagonale sinistra, cappottiera sulla diagonale destra
wall(-.106, 13.756, 1.20, 15.062, .30, [{ type: 'door', c: .793, w: .9, head: 2.1, side: -1, hinge: 'start', entry: true, open: 2.2 }]);
wall(-1.50, 15.062, -.194, 13.756, .30, [{ type: 'door', c: 1.054, w: .9, head: 2.1, side: 1, hinge: 'start', open: 0 }]);   // porta B (vicino)
wall(-1.45, 15.0, -1.45, 16.7, .20); wall(-1.45, 16.6, 2.6, 16.6, .20);                           // pianerottolo
wall(1.169, 14.810, 2.047, 13.716, .12, [{ type: 'closet', c: .702, w: 1.20, head: 2.40 }]);      // fronte cappottiera
wall(1.30, 14.60, 2.56, 15.735, .20);                                                             // fondo cappottiera
box(scene, .66, H, .87, mWall, 2.33, 0, 13.335);                                                  // pilastro 66x77
wall(2.61, 13.77, 2.61, 15.60, .10);                                                              // cappottiera / cucina
wall(2.66, 12.95, 5.80, 12.95, .10, [{ type: 'slider', c: 1.91, w: 2.30, head: 2.10 }]);          // tramezzo soggiorno/cucina con vetrata 2.30
// tramezzi zona notte
wall(2.88, 0, 2.88, 3.23, .14);                                                                   // letto 1 / letto 2
wall(0, 3.93, 2.16, 3.93, .16);                                                                   // letto 1 sud
wall(2.15, 3.895, 2.795, 3.25, .12, [door(.456, -1, 'start', { open: 2.6 })]);                    // porta letto 1 (diagonale)
wall(2.81, 3.29, 3.73, 3.29, .12, [door(.49, -1, 'start', { open: 1.6 })]);                       // porta letto 2
wall(3.63, 3.305, 7.56, 3.305, .15);                                                              // letto 2 / bagno
wall(3.68, 3.35, 3.68, 8.64, .10, [door(1.10, -1, 'end'), door(2.87, -1, 'end')]);                // disimpegno est: bagno, letto 3
wall(3.73, 5.05, 7.56, 5.05, .14);                                                                // bagno / letto 3
wall(2.125, 3.93, 2.125, 8.60, .45, [door(2.62, 1, 'end'), door(3.71, 1, 'start')]);              // disimpegno ovest: bagno, lavanderia
wall(0, 7.06, 1.90, 7.06, .20);                                                                   // bagno / lavanderia
wall(0, 8.70, 5.80, 8.70, .20, [door(2.92, -1, 'end')]);                                          // soggiorno nord (porta zona notte)

// ---------- pavimenti, soffitto, esterno ----------
floor(R(-.05, -.05, 7.6, 8.7), mParquet); floor(R(-.05, 8.6, 5.85, 12.95), mParquet);
floor([[-.05, 12.9], [2.0, 12.9], [2.0, 13.7], [1.15, 14.8], [-.05, 13.6]], mParquet);
floor([[2.0, 13.75], [2.6, 13.75], [2.6, 15.65], [1.4, 14.6]], mParquet);
floor([[2.61, 12.95], [7.7, 12.95], [7.7, 15.8], [3.76, 15.8], [3.76, 15.65], [2.61, 15.65]], mKitTile, .004);
floor(R(0, 4.0, 1.92, 6.98), mBathDark, .004);
floor(R(0, 7.14, 1.92, 8.6), mBathTile, .004);
floor(R(3.71, 3.36, 7.58, 5.0), mBathTile, .004);
floor(R(-1.5, 13.6, 2.6, 16.6), mLanding, -.004);
const outY = -.02;
floor(R(6.1, 8.94, 7.86, 12.7), mOutTile, outY); floor(R(7.86, -.3, 9.06, 16.05), mOutTile, outY); floor(R(2.6, 16.05, 9.06, 18.05), mOutTile, outY);
box(scene, 1.76, .25, 3.76, mWall, 6.98, outY - .255, 10.82); box(scene, 1.2, .25, 16.35, mWall, 8.46, outY - .255, 7.875); box(scene, 6.46, .25, 2.0, mWall, 5.83, outY - .255, 17.05);
function rail(ax, az, bx_, bz) {
  const dx = bx_ - ax, dz = bz - az, L = Math.hypot(dx, dz);
  const g = new THREE.Group(); g.position.set(ax, 0, az); g.rotation.y = Math.atan2(-dz, dx); scene.add(g);
  box(g, L, .04, .06, mFrame, L / 2, 1.0, 0); box(g, L, .04, .04, mFrame, L / 2, .06, 0);
  box(g, L, .9, .012, mGlass, L / 2, .1, 0, 0, false);
  const n = Math.max(1, Math.round(L / 1.3));
  for (let i = 0; i <= n; i++) box(g, .04, 1.0, .04, mFrame, i * L / n, 0, 0);
}
rail(9.03, -.28, 9.03, 18.02); rail(9.03, 18.02, 2.62, 18.02); rail(2.62, 18.02, 2.62, 16.07); rail(7.88, -.28, 9.03, -.28);

const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 16.95), mCeil);
ceiling.rotation.x = Math.PI / 2; ceiling.position.set(3.18, H, 8.15); ceiling.castShadow = true; scene.add(ceiling);

const lawn = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), M('#7f9a5c', { roughness: 1 }));
lawn.rotation.x = -Math.PI / 2; lawn.position.set(4, -.3, 8); lawn.receiveShadow = true; scene.add(lawn);
const mHedge = M('#4f7040', { roughness: 1 });
box(scene, 1.0, 2.1, 30, mHedge, 11.2, -.3, 8); box(scene, 16, 2.1, 1.0, mHedge, 4, -.3, 20.3); box(scene, 16, 2.1, 1.0, mHedge, 4, -.3, -4.5);

// ---------- luci ----------
scene.add(new THREE.HemisphereLight('#ffffff', '#b89f86', .78));
const sun = new THREE.DirectionalLight('#fff3df', 3.2);
sun.position.set(17, 15, 15); sun.target.position.set(4, 0, 8); scene.add(sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
const spotGeo = new THREE.CircleGeometry(.06, 20);
function lamp(x, z, intensity = 7, y = 2.45, disc = true) {
  const l = new THREE.PointLight('#ffe9c9', intensity, 7, 2); l.position.set(x, y, z); scene.add(l);
  if (disc) { const d = new THREE.Mesh(spotGeo, mGlow); d.rotation.x = Math.PI / 2; d.position.set(x, H - .004, z); scene.add(d); }
}
lamp(1.8, 10.6, 9); lamp(4.695, 10.76, 7, 1.45, false); lamp(1.0, 13.2, 6);     // soggiorno, tavolo, ingresso
lamp(4.4, 14.2, 8); lamp(6.52, 14.35, 6, 1.45, false);                           // cucina + sospensioni penisola
lamp(3.0, 7.3, 6); lamp(3.0, 4.7, 6);                                            // disimpegno
lamp(1.4, 1.9, 8); lamp(4.9, 1.6, 9); lamp(5.5, 6.7, 8);                         // camere
lamp(.95, 5.5, 8); lamp(5.4, 4.2, 7); lamp(.95, 7.9, 6);                         // bagni, lavanderia
lamp(-.2, 15.6, 7);                                                              // pianerottolo

// ---------- arredo: elementi generici (zona notte, bagni: proposta, non presenti nella macro) ----------
function chair(x, z, ry, mat = mFabricDark) {
  const g = G(x, z, ry);
  box(g, .44, .06, .44, mat, 0, .42, 0); box(g, .44, .42, .05, mat, 0, .48, .2);
  for (const sx of [-.19, .19]) for (const sz of [-.19, .19]) box(g, .03, .42, .03, mBlack, sx, 0, sz);
}
function table(x, z, w, d, h = .74, top = mOak) {
  const g = G(x, z); box(g, w, .04, d, top, 0, h - .04, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, .05, h - .04, .05, mBlack, sx * (w / 2 - .08), 0, sz * (d / 2 - .08));
  return g;
}
function bed(x, z, ry, w, l = 2.0, cover = mLinen, headMat = mFabric) {   // testata sul lato -z locale
  const g = G(x, z, ry);
  box(g, w, .28, l, mOak, 0, .04, 0); box(g, w - .04, .2, l - .04, mWhite, 0, .32, 0);
  box(g, w + .1, 1.05, .08, headMat, 0, 0, -l / 2 - .04);
  const n = w > 1.2 ? 2 : 1;
  for (let i = 0; i < n; i++) box(g, .62, .12, .4, mWhite, n === 1 ? 0 : (i ? .4 : -.4), .52, -l / 2 + .3);
  box(g, w + .04, .09, l * .66, cover, 0, .5, l * .17);
  return g;
}
function nightstand(x, z) {
  const g = G(x, z); box(g, .4, .42, .4, mOak, 0, .06, 0); cyl(g, .03, .25, mBlack, 0, .48, 0); cyl(g, .11, .16, mGlow, 0, .7, 0, .08);
}
function wardrobe(x, z, ry, w, h = 2.5, d = .6, n = Math.round(w / .55), mat = mWhite) {  // fronte sul lato -z locale
  const g = G(x, z, ry); box(g, w, h, d, mat, 0, 0, 0);
  for (let i = 1; i < n; i++) box(g, .006, h - .04, .004, mGreige, -w / 2 + i * w / n, .02, -d / 2 - .002, 0, false);
  return g;
}
function wallSpot(x, y, z) { const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), mGlow); m.position.set(x, y, z); scene.add(m); }

// ---------- SOGGIORNO (dalla macro) ----------
{ const g = G(0, 0);
  const WOOD = rgb(.55, .38, .25, { roughness: .6 });
  bx(g, 0.00, 9.46, 0.40, 11.50, 0, 0.50, WOOD);                               // mobile TV (parete ovest)
  bx(g, 0.15, 9.80, 0.21, 11.16, 0.60, 1.30, mBlack);                          // TV
  bx(g, 0.60, 9.30, 3.45, 11.98, 0, 0.012, rgb(.92, .88, .80, { roughness: 1 })); // tappeto
  cyl(g, .30, .388, WOOD, 1.15, .012, 10.645);                                 // tavolino
  cyl(g, .08, .18, mLeaf, 1.15, .40, 10.645);
}
// libreria Kriptonite K1+ 227 x 36 x 191, lato nord a sinistra della porta della zona notte
{ const g = G(0, 0), x0 = .15, y0 = 8.80, w = 2.27, d = .36, h = 1.91, nb = 3, tu = .02;
  const GRAF = rgb(.22, .23, .25, { roughness: .5, metalness: .3 });
  const xs = [...Array(nb + 1)].map((_, i) => x0 + i * (w - tu) / nb);
  for (const x of xs) bx(g, x, y0, x + tu, y0 + d, 0, h, GRAF);
  const levels = [.12, .45, .78, 1.11, 1.44, h - .02];
  const pal = [[.70, .18, .15], [.15, .30, .52], [.88, .80, .55], [.88, .88, .85], [.20, .45, .35], [.55, .35, .22], [.15, .15, .17]].map(c => rgb(...c));
  const pick = () => pal[Math.floor(rnd() * pal.length)];
  for (let b = 0; b < nb; b++) {
    for (const z of levels) { bx(g, xs[b] + tu, y0, xs[b + 1], y0 + d - .01, z, z + .02, GRAF); bx(g, xs[b] + tu, y0 + d - .025, xs[b + 1], y0 + d - .005, z - .03, z + .02, GRAF); }
    const xa = xs[b] + tu + .02, xb = xs[b + 1] - .02;
    for (const z of levels.slice(0, -1)) {
      const zt = z + .02, kind = [0, 0, 0, 1, 2][Math.floor(rnd() * 5)];
      if (kind === 0) {                       // fila di libri in piedi
        let x = xa; const limit = xa + (xb - xa) * (.55 + rnd() * .4);
        for (;;) { const t = .022 + rnd() * .028; if (x + t > limit) break; bx(g, x, y0 + .06, x + t, y0 + .30, zt, zt + .19 + rnd() * .1, pick(), false); x += t + .002; }
      } else if (kind === 1) {                // pila orizzontale + vaso
        let zc = zt; const n = 3 + Math.floor(rnd() * 3);
        for (let k = 0; k < n; k++) { const t = .025 + rnd() * .025; bx(g, xa + .02, y0 + .06, xa + .26 + rnd() * .06, y0 + .30, zc, zc + t, pick(), false); zc += t; }
        cyl(g, .055, .24, mPot, xb - .12, zt, y0 + .18);
      } else { cyl(g, .07, .16, mPot, xa + .20, zt, y0 + .18); cyl(g, .04, .30, mPot, xa + .45, zt, y0 + .18); }
    }
  }
}
// tavolo ovale 190 x 100 (asse lungo nord-sud) con base a colonna ovale
const TX = 4.695, TY = 10.76;
{ const g = G(TX, TY);
  const ell = (rx, ry, h, mat, y) => { const m = cyl(g, 1, h, mat, 0, y, 0); m.scale.set(rx, 1, ry); return m; };
  const DK = rgb(.30, .20, .12, { roughness: .5 });
  ell(.50, .95, .04, rgb(.65, .42, .22, { roughness: .45 }), .71); ell(.08, .30, .68, DK, .03); ell(.25, .55, .03, DK, 0);
  cyl(g, .09, .20, mLeaf, 0, .75, 0);
  box(g, .01, 1.05, .01, mBlack, 0, 1.65, 0); const sh = cyl(g, .3, .2, mBlack, 0, 1.45, 0, .1); sh.scale.z = 1.6; const gl = cyl(g, .26, .02, mGlow, 0, 1.44, 0); gl.scale.z = 1.6;
}
// sedie Granite (Kave Home): seduta tonda, schienale avvolgente, 3 gambe in legno
function graniteChair(cx, cy, facing) {
  const FAB = rgb(.86, .80, .70, { roughness: 1, side: THREE.DoubleSide }), WOODC = rgb(.33, .20, .13, { roughness: .6 });
  const g = G(cx, cy, { S: 0, E: Math.PI / 2, N: Math.PI, W: -Math.PI / 2 }[facing]);   // +z locale = direzione dello sguardo
  cyl(g, .24, .10, FAB, 0, .38, 0); cyl(g, .21, .04, WOODC, 0, .34, 0);
  bx(g, -.305, -.10, -.28, .02, 0, .66, WOODC); bx(g, .28, -.10, .305, .02, 0, .66, WOODC); bx(g, -.06, -.26, .06, -.235, 0, .38, WOODC);
  for (const r of [.245, .305]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .15, 28, 1, true, Math.PI / 2 - .13, Math.PI + .26), FAB);
    m.position.y = .655; m.castShadow = true; g.add(m);
  }
  const cap = new THREE.Mesh(new THREE.RingGeometry(.245, .305, 28, 1, -.13, Math.PI + .26), FAB);
  cap.rotation.x = Math.PI / 2; cap.rotation.z = 0; cap.position.y = .73; cap.scale.y = 1; g.add(cap); cap.rotation.set(Math.PI / 2, 0, 0);
}
for (const [cx, cy, f] of [[4.22, 10.36, 'E'], [4.22, 11.16, 'E'], [5.17, 10.36, 'W'], [5.17, 11.16, 'W'], [TX, 9.79, 'S'], [TX, 11.73, 'N']]) graniteChair(cx, cy, f);

// divano Ditre Italia "Isla": isola da 3 posti dal modello OBJ ufficiale (stessa trasformazione della macro)
const ISLA = { file: './ditreitalia-Isla-ISLA.obj', dx: 2.454, dy: 12.296,
  meshes: { mesh1: [.74, .71, .66], mesh2: [.60, .57, .52], mesh3: [.25, .23, .22], mesh9: [.80, .77, .71], mesh10: [.62, .59, .54] } };
function islaFallback() {
  const g = G(0, 0); bx(g, 1.95, 9.70, 3.35, 11.59, .03, .48, mFabric); bx(g, 2.32, 10.22, 3.08, 11.26, .48, .88, mLinen);
}
async function loadIsla() {
  try {
    const res = await fetch(ISLA.file); if (!res.ok) throw new Error(res.status);
    const txt = await res.text(), v = [], n = [], out = {}; let cur = null;
    for (const raw of txt.split('\n')) {
      const c0 = raw.charCodeAt(0), c1 = raw.charCodeAt(1);
      if (c0 === 118 && c1 === 32) { const p = raw.split(/\s+/); v.push(+p[1], +p[2], +p[3]); }
      else if (c0 === 118 && c1 === 110) { const p = raw.split(/\s+/); n.push(+p[1], +p[2], +p[3]); }
      else if ((c0 === 111 || c0 === 103) && c1 === 32) { cur = raw.trim().split(/\s+/)[1]; if (ISLA.meshes[cur] && !out[cur]) out[cur] = { p: [], n: [] }; }
      else if (c0 === 102 && c1 === 32 && out[cur]) {
        const t = raw.trim().split(/\s+/).slice(1).map(s => s.split('/').map(Number)), o = out[cur];
        for (let k = 1; k < t.length - 1; k++) for (const q of [t[0], t[k], t[k + 1]]) {
          const vi = (q[0] > 0 ? q[0] - 1 : v.length / 3 + q[0]) * 3;
          o.p.push(v[vi + 2] / 1000 + ISLA.dx, v[vi + 1] / 1000, ISLA.dy - v[vi] / 1000);
          if (q[2]) { const ni = (q[2] > 0 ? q[2] - 1 : n.length / 3 + q[2]) * 3; o.n.push(n[ni + 2], n[ni + 1], -n[ni]); }
        }
      }
    }
    let count = 0;
    for (const [name, o] of Object.entries(out)) {
      if (!o.p.length) continue;
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(o.p, 3));
      if (o.n.length === o.p.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(o.n, 3)); else geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, rgb(...ISLA.meshes[name], { roughness: 1, side: THREE.DoubleSide }));
      m.castShadow = true; m.receiveShadow = true; m.name = 'Isla_' + name; scene.add(m); count++;
    }
    if (!count) throw new Error('nessuna mesh');
    window.tour && (window.tour.sofa = 'obj:' + count);
  } catch (e) { console.warn('Divano Isla: OBJ non caricato, uso un volume semplificato', e); islaFallback(); window.tour && (window.tour.sofa = 'fallback'); }
}

// ---------- CUCINA A "C" (dalla macro) ----------
{ const g = G(0, 0);
  const CAB = rgb(.88, .86, .82, { roughness: .5 }), BODY = rgb(.78, .75, .70), PLINTH = rgb(.18, .18, .18), STEEL = rgb(.74, .76, .79, { roughness: .35, metalness: .3 });
  const DARK = rgb(.08, .08, .08, { roughness: .3 }), TOP = rgb(.40, .40, .43, { roughness: .35 }), HAND = rgb(.60, .60, .64, { roughness: .4, metalness: .3 });
  const Gp = .004, X0 = 2.66;
  const fr = (d, y0, y1, z0, z1, mat) => bx(g, X0 + d, y0 + Gp, X0 + d + .02, y1 - Gp, z0, z1, mat);
  const hbar = (d, y0, y1, z) => bx(g, X0 + d + .02, y0, X0 + d + .05, y1, z, z + .015, HAND);
  const vbar = (d, y, z0, z1) => bx(g, X0 + d + .02, y, X0 + d + .05, y + .015, z0, z1, HAND);
  const carcass = (y0, y1, d) => { bx(g, X0, y0, X0 + d, y1, .10, 2.30, BODY); bx(g, X0, y0, X0 + d - .05, y1, 0, .10, PLINTH); };
  // colonne parete sinistra: frigorifero, forno + microonde, dispensa, armadio
  carcass(13.00, 13.70, .65); fr(.65, 13.00, 13.70, .10, 1.90, STEEL); fr(.65, 13.00, 13.70, 1.92, 2.30, CAB); vbar(.65, 13.06, .95, 1.55); hbar(.65, 13.28, 13.42, 1.96);
  carcass(13.70, 14.30, .60); fr(.60, 13.70, 14.30, .10, .60, CAB); fr(.60, 13.70, 14.30, .62, 1.22, STEEL); bx(g, X0 + .62, 13.76, X0 + .625, 14.24, .70, 1.12, DARK);
  fr(.60, 13.70, 14.30, 1.24, 1.64, STEEL); bx(g, X0 + .62, 13.76, X0 + .625, 14.05, 1.30, 1.58, DARK); fr(.60, 13.70, 14.30, 1.66, 2.30, CAB);
  hbar(.60, 13.80, 14.20, .52); hbar(.60, 13.76, 14.24, 1.15); vbar(.60, 14.22, 1.70, 1.95);
  carcass(14.30, 14.90, .60); fr(.60, 14.30, 14.90, .10, .80, CAB); fr(.60, 14.30, 14.90, .82, 1.55, CAB); fr(.60, 14.30, 14.90, 1.57, 2.30, CAB);
  hbar(.60, 14.45, 14.75, .72); hbar(.60, 14.45, 14.75, 1.47); hbar(.60, 14.45, 14.75, 2.22);
  carcass(14.90, 15.60, .60); fr(.60, 14.90, 15.25, .10, 2.30, CAB); fr(.60, 15.25, 15.60, .10, 2.30, CAB); vbar(.60, 15.21, 1.00, 1.45); vbar(.60, 15.27, 1.00, 1.45);
  // base sul fondo (fronte a y 15.15; 15.00 nel tratto dello scalino)
  const PY0 = 15.15, yf = PY0 - .02;
  bx(g, 3.76, PY0, 6.84, 15.75, .10, .88, BODY); bx(g, 3.26, 15.00, 3.76, 15.60, .10, .88, BODY);
  bx(g, 3.76, PY0 + .05, 6.84, 15.75, 0, .10, PLINTH); bx(g, 3.26, 15.05, 3.76, 15.60, 0, .10, PLINTH);
  for (const [x0, x1, kind] of [[3.76, 4.36, 'doors2'], [4.36, 4.96, 'drawers3'], [4.96, 5.56, 'drawers2'], [5.56, 6.16, 'door1'], [6.16, 6.84, 'door1']]) {
    const xm = (x0 + x1) / 2;
    if (kind === 'doors2') { bx(g, x0 + Gp, yf, xm - Gp, PY0, .10, .88, CAB); bx(g, xm + Gp, yf, x1 - Gp, PY0, .10, .88, CAB); bx(g, xm - .03, yf - .03, xm - .015, yf, .55, .80, HAND); bx(g, xm + .015, yf - .03, xm + .03, yf, .55, .80, HAND); }
    else if (kind === 'door1') { bx(g, x0 + Gp, yf, x1 - Gp, PY0, .10, .88, CAB); bx(g, x1 - .07, yf - .03, x1 - .055, yf, .55, .80, HAND); }
    else { const n = kind === 'drawers3' ? 3 : 2; for (let i = 0; i < n; i++) { const za = .10 + i * .78 / n, zb = .10 + (i + 1) * .78 / n; bx(g, x0 + Gp, yf, x1 - Gp, PY0, za + Gp, zb - Gp, CAB); bx(g, xm - .12, yf - .03, xm + .12, yf, zb - .07, zb - .055, HAND); } }
  }
  bx(g, 3.26 + Gp, 14.98, 3.76 - Gp, 15.00, .10, .88, CAB); bx(g, 3.70, 14.95, 3.715, 14.98, .55, .80, HAND);
  // piano di lavoro, lavello, piano cottura
  bx(g, 3.26, 14.98, 3.76, 15.60, .88, .92, TOP); bx(g, 3.76, 15.11, 6.84, 15.75, .88, .92, TOP);
  bx(g, 3.835, 15.30, 4.285, 15.68, .915, .924, STEEL, false); bx(g, 3.855, 15.32, 4.265, 15.66, .922, .926, DARK, false);
  cyl(g, .015, .20, HAND, 4.06, .92, 15.71); bx(g, 4.045, 15.55, 4.075, 15.72, 1.10, 1.125, HAND);
  bx(g, 5.00, 15.20, 5.52, 15.66, .92, .925, DARK, false);
  for (const x of [5.13, 5.39]) for (const y of [15.33, 15.54]) cyl(g, .06, .008, HAND, x, .925, y);
  // pensili e cappa
  for (const [x0, x1, yfr, yb, nd] of [[3.76, 4.91, 15.40, 15.75, 2], [5.61, 6.84, 15.40, 15.75, 2], [3.26, 3.76, 15.25, 15.60, 1]]) {
    bx(g, x0, yfr, x1, yb, 1.45, 2.20, BODY); const w = (x1 - x0) / nd;
    for (let i = 0; i < nd; i++) { const a = x0 + i * w; bx(g, a + Gp, yfr - .02, a + w - Gp, yfr, 1.45, 2.20, CAB); bx(g, a + w / 2 - .10, yfr - .04, a + w / 2 + .10, yfr - .02, 1.50, 1.515, HAND); }
  }
  bx(g, 4.91, 15.28, 5.61, 15.75, 1.50, 1.60, STEEL); bx(g, 5.16, 15.55, 5.36, 15.75, 1.60, 2.70, STEEL);
  // penisola (piano a 92 cm, vuota sotto), sgabelli, sospensioni, ciotola
  bx(g, 6.20, 13.60, 6.84, 15.11, .88, .92, TOP);
  for (const x of [6.25, 6.74]) for (const y of [13.66, 15.04]) bx(g, x, y, x + .05, y + .05, 0, .88, STEEL);
  for (const y of [14.05, 14.75]) { cyl(g, .18, .04, rgb(.30, .30, .32), 7.12, .62, y); cyl(g, .02, .62, STEEL, 7.12, 0, y); cyl(g, .16, .012, STEEL, 7.12, 0, y); }
  for (const y of [13.95, 14.75]) { cyl(g, .005, .98, DARK, 6.52, 1.72, y); cyl(g, .15, .16, rgb(.85, .80, .55), 6.52, 1.56, y, .06); cyl(g, .13, .012, mGlow, 6.52, 1.555, y); }
  cyl(g, .14, .04, rgb(.85, .85, .80), 6.52, .92, 14.35);
  for (const [x, y] of [[6.47, 14.33], [6.57, 14.38]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(.04, 16, 12), rgb(.90, .50, .15)); s.position.set(x, .99, y); g.add(s); }
}

// ---------- zona notte, bagni, lavanderia (proposta di arredo, non definita nella macro) ----------
box(scene, .02, .7, .5, mBlack, 3.618, 1.1, 7.2); box(scene, .012, .6, .4, mLinen, 3.606, 1.15, 7.2, 0, false);
box(scene, .02, .7, .5, mBlack, 3.618, 1.1, 7.95); box(scene, .012, .6, .4, mTerracottaSoft, 3.606, 1.15, 7.95, 0, false);
// Letto 2 (14.60)
box(scene, .012, H, 3.2, mGreige, 7.55, 0, 1.6, 0, false);
bed(6.56, 1.35, -Math.PI / 2, 1.6, 2.0, mFabric, mFabricDark);
nightstand(7.34, .3); nightstand(7.34, 2.4);
wardrobe(5.5, 2.93, 0, 2.8, 2.5, .6);
box(scene, 2.2, .012, 1.4, mRug, 5.4, 0, 1.35);
wallSpot(7.48, 1.25, .3); wallSpot(7.48, 1.25, 2.4);
// Letto 3 (13.50)
box(scene, 3.8, H, .012, mAccentBlue, 5.645, 0, 8.632, 0, false);
bed(5.93, 7.60, Math.PI, 1.6, 2.0, mLinen, mFabric);
nightstand(4.88, 8.41); nightstand(6.98, 8.41);
wardrobe(4.03, 7.675, -Math.PI / 2, 1.85, 2.5, .6);
{ const g = G(4.3, 5.5, -2.4); box(g, .7, .36, .7, mFabricDark, 0, .08, 0); box(g, .7, .45, .14, mFabricDark, 0, .44, -.28);
  for (const s of [-.31, .31]) box(g, .08, .2, .7, mFabricDark, s, .44, 0); }
// Letto 1 (10.80): cameretta / studio
bed(.45, 2.0, 0, .9, 2.0, mAccentBlue, mOak);
table(1.5, .32, 1.2, .6); chair(1.5, .85, 0, mFabric);
{ const g = G(1.95, .2); cyl(g, .07, .02, mBlack, 0, .74, 0); cyl(g, .01, .35, mBlack, 0, .74, 0); cyl(g, .08, .1, mGlow, 0, 1.05, 0, .05); }
wardrobe(2.535, .62, Math.PI / 2, 1.0, 2.5, .55, 2);
{ const g = G(2.65, 1.8);
  for (const z of [-.6, 0, .6]) box(g, .32, 2.0, .025, mOak, 0, 0, z);
  for (const y of [.02, .5, .98, 1.46, 1.96]) box(g, .32, .025, 1.2, mOak, 0, y, 0);
  for (const [y, z, m] of [[.525, -.3, mSage], [1.005, .3, mTerracottaSoft], [1.485, -.25, mLinen], [1.005, -.35, mAccentBlue]]) box(g, .2, .24, .3, m, 0, y, z); }
box(scene, 1.5, .012, 1.1, mRug, 1.7, 0, 2.0);
// bagni
function vanity(g, x, z, ry) {
  const v = new THREE.Group(); v.position.set(x, 0, z); v.rotation.y = ry; g.add(v);
  box(v, 1.0, .4, .46, mOak, 0, .45, 0); box(v, 1.02, .03, .48, mWhite, 0, .85, 0); box(v, .5, .1, .32, mWhite, 0, .88, .02);
  cyl(v, .012, .2, mSteel, 0, .88, -.17);
  box(v, .96, .76, .01, mGlow, 0, 1.12, -.232, 0, false); box(v, .9, .7, .012, mMirror, 0, 1.15, -.226, 0, false);
}
function wc(g, x, z, ry, lid = true) {
  const v = new THREE.Group(); v.position.set(x, 0, z); v.rotation.y = ry; g.add(v);
  box(v, .36, .28, .5, mWhite, 0, .14, 0); if (lid) box(v, .36, .03, .44, mWhite, 0, .42, .02);
  if (lid) box(v, .22, .14, .012, mSteel, 0, 1.0, -.245, 0, false);
}
{ const g = G(0, 0);                                              // Bagno 6.15 (con finestra)
  box(g, 3.83, 2.2, .012, mBathWall, 5.645, 0, 3.386, 0, false); box(g, .012, H, 1.6, mBathWall, 7.554, 0, 4.18, 0, false); box(g, .9, H, .012, mBathWall, 7.11, 0, 4.974, 0, false);
  vanity(g, 4.78, 3.62, 0); wc(g, 5.68, 3.64, 0, false); wc(g, 6.23, 3.64, 0);
  box(g, .9, .04, 1.6, mWhite, 7.11, .004, 4.18); box(g, .012, 2.0, 1.05, mGlass, 6.66, .04, 3.91, 0, false);
  box(g, .03, 2.0, .03, mSteel, 6.66, .04, 4.44); cyl(g, .1, .02, mSteel, 7.18, 2.1, 3.75); }
{ const g = G(0, 0);                                              // Bagno 5.85 (cieco)
  box(g, .012, H, 2.95, mBathWallDark, .006, 0, 5.485, 0, false); box(g, 1.9, H, .012, mBathWallDark, .95, 0, 4.016, 0, false);
  box(g, 1.55, .56, .72, mWhite, .78, 0, 4.38); box(g, 1.4, .02, .56, mBathTile, .78, .55, 4.38, 0, false);
  vanity(g, .24, 6.45, Math.PI / 2); wc(g, .26, 5.3, Math.PI / 2); }
{ const g = G(0, 0);                                              // Lavanderia
  box(g, .012, 1.2, 1.42, mBathWall, .006, 0, 7.87, 0, false);
  for (const y of [0, .86]) { box(g, .6, .85, .6, mWhite, .3, y, 7.48); const d = cyl(g, .2, .02, mBlack, .61, y + .25, 7.48); d.rotation.z = Math.PI / 2; d.position.set(.605, y + .45, 7.48); }
  box(g, .6, .86, .78, mWhite, .3, 0, 8.18); box(g, .62, .04, .8, mQuartz, .31, .86, 8.18); box(g, .4, .01, .45, mSteel, .32, .9, 8.18); cyl(g, .014, .28, mSteel, .1, .9, 8.18);
  wardrobe(1.45, 8.405, 0, .85, 2.3, .35, 2); }
// loggia e terrazzo
function lounge(x, z, ry) { const g = G(x, z, ry); box(g, .75, .24, .75, mFrame, 0, outY + .04, 0); box(g, .7, .12, .7, mLinen, 0, outY + .28, 0); box(g, .75, .42, .14, mLinen, 0, outY + .28, .3); }
lounge(7.25, 9.75, 0); lounge(7.25, 11.75, Math.PI);
table(7.25, 10.75, .55, .55, .36, mFrame);
for (const z of [1.2, 7.9, 14.6]) { const g = G(8.83, z); box(g, .3, .45, 1.2, mPot, 0, outY, 0); box(g, .26, .45, 1.1, mLeaf, 0, outY + .45, 0); }
{ const g = G(5.8, 17.8); box(g, 2.2, .45, .3, mPot, 0, outY, 0); box(g, 2.1, .45, .26, mLeaf, 0, outY + .45, 0); }

// ---------- percorso guidato ----------
const ROOMS = {
  entry: ['Ingresso', 'Porta C dal pianerottolo · cappottiera sulla diagonale'],
  living: ['Soggiorno / pranzo', '26,60 m² con l\'ingresso · divano Isla, tavolo ovale, libreria K1+'],
  kitchen: ['Cucina', '15,35 m² · cucina a C con penisola, vetrata da 2,30 m sul soggiorno'],
  hall: ['Disimpegno', '7,85 m²'],
  laundry: ['Lavanderia', '3,50 m²'],
  bath1: ['Bagno', '5,85 m² · cieco'],
  bed3: ['Camera', '13,50 m² · portafinestra sul balcone'],
  bath2: ['Bagno 2', '6,15 m² · con finestra'],
  bed2: ['Camera matrimoniale', '14,60 m²'],
  bed1: ['Camera / studio', '10,80 m²'],
  plan: ['Vista in pianta', 'Variante 2 · soffitti 2,70 m'],
};
const RAW = [
  { p: [-.22, 14.99], l: [1.2, 1.5, 13.6], room: 'entry', hold: 2.8 },
  { p: [.455, 14.317], l: [2.0, 1.4, 12.8] },
  { p: [.8, 12.95], l: [1.6, 1.15, 14.26], hold: 1.8 },
  { p: [1.2, 12.65], l: [1.5, .9, 9.6], room: 'living', hold: 2.2 },
  { p: [2.2, 12.35], l: [4.7, .9, 10.8] },
  { p: [3.0, 12.3], l: [4.9, .9, 10.6], hold: 2 },
  { p: [3.9, 12.35], l: [4.3, 1.2, 14.2] },
  { p: [4.0, 12.95], l: [5.0, 1.1, 15.0], room: 'kitchen' },
  { p: [4.1, 13.6], l: [6.0, 1.0, 15.2], hold: 2 },
  { p: [4.6, 14.2], l: [2.7, 1.2, 14.4], hold: 1.5 },
  { p: [4.65, 14.2], l: [7.8, 1.1, 14.4], hold: 1.8 },
  { p: [4.1, 13.5], l: [4.0, 1.4, 12.0] },
  { p: [4.0, 12.95], l: [3.7, 1.4, 11.0], room: 'living' },
  { p: [3.8, 12.3], l: [3.6, 1.4, 10.0] },
  { p: [3.63, 11.5], l: [3.5, 1.4, 9.0] },
  { p: [3.63, 9.75], l: [.3, .9, 10.6], hold: 2 },
  { p: [3.2, 9.25], l: [2.9, 1.4, 7.5] },
  { p: [2.92, 8.70], l: [3.0, 1.4, 6.0], room: 'hall' },
  { p: [3.0, 7.64], l: [.3, 1.0, 7.75], room: 'laundry', hold: 1.5 },
  { p: [3.0, 6.55], l: [.3, 1.1, 6.5], room: 'bath1', hold: 1.5 },
  { p: [3.0, 6.22], l: [5.0, 1.3, 6.5], room: 'hall' },
  { p: [3.68, 6.22], l: [5.8, 1.1, 7.0], room: 'bed3' },
  { p: [4.45, 6.25], l: [6.3, .8, 7.7], hold: 2 },
  { p: [4.5, 6.2], l: [7.7, 1.2, 6.0], hold: 1.5 },
  { p: [3.68, 6.22], l: [3.0, 1.4, 5.0], room: 'hall' },
  { p: [3.0, 5.6], l: [3.0, 1.4, 4.3] },
  { p: [3.05, 4.5], l: [5.0, 1.3, 4.4] },
  { p: [3.68, 4.45], l: [6.0, 1.2, 4.2], room: 'bath2' },
  { p: [4.05, 4.45], l: [6.7, .9, 3.95], hold: 2 },
  { p: [3.68, 4.45], l: [3.0, 1.4, 4.0], room: 'hall' },
  { p: [3.1, 4.1], l: [3.3, 1.4, 2.8] },
  { p: [3.28, 3.75], l: [3.5, 1.3, 2.0] },
  { p: [3.30, 3.29], l: [5.0, 1.2, 1.6], room: 'bed2' },
  { p: [3.5, 2.6], l: [7.2, 1.0, 1.2], hold: 2.2 },
  { p: [4.3, 1.9], l: [4.4, 1.4, -.2], hold: 1.5 },
  { p: [3.5, 2.6], l: [3.2, 1.4, 3.6] },
  { p: [3.30, 3.29], l: [2.8, 1.4, 4.0], room: 'hall' },
  { p: [3.05, 3.8], l: [2.3, 1.4, 3.5] },
  { p: [2.79, 3.89], l: [2.0, 1.4, 3.1] },
  { p: [2.4725, 3.5725], l: [1.2, 1.2, 1.6], room: 'bed1' },
  { p: [1.8, 2.6], l: [1.3, 1.0, .3], hold: 2 },
  { p: [1.8, 2.65], l: [.45, .6, 2.0], hold: 1.5 },
  { p: [2.6, 5.6], y: 7, l: [3.5, 0, 7.4], room: 'plan' },
  { p: [4.2, 10.2], y: 18.5, l: [4.2, 0, 9.1], hold: 8 },
];
const SPEED = 1.0, TURN = 0.9;
let lastRoom = 'entry';
const wps = RAW.map(r => {
  const pos = new V3(r.p[0], r.y ?? 1.6, r.p[1]), d = new V3(...r.l).sub(pos);
  lastRoom = r.room || lastRoom;
  return { pos, yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)), room: lastRoom, hold: r.hold || 0 };
});
for (let i = 1; i < wps.length; i++) {
  while (wps[i].yaw - wps[i - 1].yaw > Math.PI) wps[i].yaw -= 2 * Math.PI;
  while (wps[i].yaw - wps[i - 1].yaw < -Math.PI) wps[i].yaw += 2 * Math.PI;
}
const segs = []; let total = 0;
wps.forEach((w, i) => {
  w.t = total;
  if (w.hold) { segs.push({ hold: true, i, t0: total, dur: w.hold }); total += w.hold; }
  if (i < wps.length - 1) {
    const n = wps[i + 1];
    const dur = Math.max(w.pos.distanceTo(n.pos) / (n.pos.y > 3 ? 2.6 : SPEED), Math.abs(n.yaw - w.yaw) / TURN, .7);
    segs.push({ i, t0: total, dur, easeIn: w.hold > 0, easeOut: n.hold > 0 }); total += dur;
  }
});
const herm = (p0, p1, p2, p3, f) => {
  const m1 = (p2 - p0) / 2, m2 = (p3 - p1) / 2, f2 = f * f, f3 = f2 * f;
  return (2 * f3 - 3 * f2 + 1) * p1 + (f3 - 2 * f2 + f) * m1 + (-2 * f3 + 3 * f2) * p2 + (f3 - f2) * m2;
};
const hermMono = (p0, p1, p2, p3, f) => {
  const d = p2 - p1, m = (a, b) => (a * b <= 0 ? 0 : Math.sign(a) * Math.min(Math.abs(a + b) / 2, 2 * Math.abs(a), 2 * Math.abs(b)));
  const m1 = m(p1 - p0, d), m2 = m(d, p3 - p2), f2 = f * f, f3 = f2 * f;
  return (2 * f3 - 3 * f2 + 1) * p1 + (f3 - 2 * f2 + f) * m1 + (-2 * f3 + 3 * f2) * p2 + (f3 - f2) * m2;
};
function stateAt(t, out) {
  t = Math.min(Math.max(t, 0), total - 1e-4);
  let s = segs[0]; for (const q of segs) { if (q.t0 <= t) s = q; else break; }
  const w = wps;
  if (s.hold) { out.pos.copy(w[s.i].pos); out.yaw = w[s.i].yaw; out.pitch = w[s.i].pitch; out.room = w[s.i].room; return out; }
  let f = (t - s.t0) / s.dur;
  const gin = x => x * x * (2 - x);
  if (s.easeIn && s.easeOut) f = f * f * (3 - 2 * f); else if (s.easeIn) f = gin(f); else if (s.easeOut) f = 1 - gin(1 - f);
  const i = s.i, a = w[Math.max(i - 1, 0)], b = w[i], c = w[i + 1], d = w[Math.min(i + 2, w.length - 1)];
  out.pos.set(herm(a.pos.x, b.pos.x, c.pos.x, d.pos.x, f), herm(a.pos.y, b.pos.y, c.pos.y, d.pos.y, f), herm(a.pos.z, b.pos.z, c.pos.z, d.pos.z, f));
  out.yaw = hermMono(a.yaw, b.yaw, c.yaw, d.yaw, f); out.pitch = hermMono(a.pitch, b.pitch, c.pitch, d.pitch, f);
  out.room = f < .5 ? b.room : c.room; return out;
}
if (new URLSearchParams(location.search).has('debug')) {
  const pts = [], st = { pos: new V3() }; for (let t = 0; t < total; t += .1) { stateAt(t, st); pts.push(st.pos.clone()); }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xff0044 })));
}

// ---------- interfaccia ----------
const $ = id => document.getElementById(id);
let time = 0, playing = true, yawOff = 0, pitchOff = 0;
const cur = { pos: new V3(), yaw: 0, pitch: 0, room: 'entry' };
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function setPlaying(p) { playing = p; $('play').textContent = p ? 'Pausa' : 'Riprendi'; $('hint').classList.toggle('show', !p); }
$('play').onclick = () => { if (!playing && time >= total - .05) time = 0; setPlaying(!playing); };
$('restart').onclick = () => { time = 0; setPlaying(true); };
$('seek').oninput = e => { time = e.target.value / 1000 * total; yawOff = pitchOff = 0; };
addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); $('play').click(); } });
const chipEls = {};
for (const key of Object.keys(ROOMS)) {
  const b = document.createElement('button'); b.textContent = ROOMS[key][0];
  b.onclick = () => { time = wps.find(w => w.room === key).t; yawOff = pitchOff = 0; };
  $('chips').appendChild(b); chipEls[key] = b;
}
let drag = null;
canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); if (playing) setPlaying(false); });
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  yawOff += (e.clientX - drag.x) * .004; pitchOff = Math.min(.9, Math.max(-.9, pitchOff + (e.clientY - drag.y) * .003));
  drag = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerup', () => { drag = null; });
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const sm = (a, b, x) => { const f = Math.min(1, Math.max(0, (x - a) / (b - a))); return f * f * (3 - 2 * f); };
function frame(dt) {
  if (playing) {
    time += dt; yawOff *= Math.pow(.02, dt); pitchOff *= Math.pow(.02, dt);
    if (time >= total) { time = total; setPlaying(false); }
  }
  stateAt(time, cur);
  camera.position.copy(cur.pos);
  camera.rotation.set(Math.max(-1.55, Math.min(1.55, cur.pitch + pitchOff)), cur.yaw + yawOff, 0);
  if (entryDoor) entryDoor.piv.rotation.y = entryDoor.sign * entryDoor.open * sm(.5, 2.6, time);
  ceiling.visible = camera.position.y < 2.62;
  $('room').textContent = ROOMS[cur.room][0]; $('sub').textContent = ROOMS[cur.room][1];
  for (const k in chipEls) chipEls[k].classList.toggle('on', k === cur.room);
  if (document.activeElement !== $('seek')) $('seek').value = time / total * 1000;
  $('time').textContent = `${fmt(time)} / ${fmt(total)}`;
  renderer.render(scene, camera);
}
let last = performance.now();
renderer.setAnimationLoop(now => { const dt = Math.min(.1, (now - last) / 1000); last = now; frame(dt); });

window.tour = { seek: t => { time = t; yawOff = pitchOff = 0; setPlaying(false); frame(0); }, play: () => setPlaying(true), total, wps, scene, THREE, stateAt, sofa: 'loading' };
loadIsla();
