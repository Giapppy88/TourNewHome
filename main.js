// Unit C — 3D walkthrough. Plan coordinates in metres: x = east, z = south, y = up.
// Origin: inner face of the west wall (bathroom/living side), inner face of the north wall.
import * as THREE from './vendor/three.module.min.js';

const H = 2.70;                      // confirmed ceiling height
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

// ---------- textures ----------
function canvasTex(size, metres, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / metres, 1 / metres);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Existing parquet (from the site photo): narrow strips, mixed honey-to-red-brown tones.
const parquetTex = canvasTex(1024, 2.1, (g, S) => {
  const tones = ['#b8682e', '#a8552a', '#8e3f22', '#c98042', '#7c341f', '#d39550', '#9c4a26', '#b97538', '#a3602f'];
  const rows = 30, rh = S / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * 250;
    while (x < S) {
      const len = (0.35 + rnd() * 0.3) / 2.1 * S;
      g.fillStyle = tones[Math.floor(rnd() * tones.length)];
      for (const ox of [0, -S]) { g.fillRect(x + ox, r * rh, len, rh); }
      g.strokeStyle = 'rgba(40,15,5,.35)'; g.lineWidth = 1;
      for (const ox of [0, -S]) { g.strokeRect(x + ox + .5, r * rh + .5, len, rh); }
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

// ---------- materials ----------
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...o });
const mWall = M('#f3eee4', { roughness: .95 });
const mExt = M('#b9604d', { roughness: .95 });          // terracotta render, as in the photo
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

// ---------- primitives ----------
function box(parent, w, h, d, mat, x, y, z, ry = 0, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y + h / 2, z); m.rotation.y = ry;
  m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
}
function cyl(parent, r, h, mat, x, y, z, rTop = r) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, r, h, 24), mat);
  m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function G(x, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); return g; }
const R = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
function floor(pts, mat, y = 0) {
  const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m;
}

// ---------- walls with openings ----------
// Wall from A to B (centreline), thickness t. Openings: {c: distance of centre from A, w, head, sill, type}.
// Local +Z of a wall is to the right of the A->B direction as seen from above (x east, z south).
let entryDoor = null;
function wall(ax, az, bx, bz, t, ops = [], o = {}) {
  const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
  const g = new THREE.Group(); g.position.set(ax, 0, az); g.rotation.y = Math.atan2(-dz, dx); scene.add(g);
  const piece = (x0, x1, y0, y1) => {
    if (x1 - x0 < 1e-3 || y1 - y0 < 1e-3) return;
    if (o.ext) {                       // exterior wall: thin interior lining + terracotta outer layer
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
  } else {                              // window or French door (portafinestra)
    const b = .05, dpt = .07;
    box(g, b, h, dpt, mFrame, x0 + b / 2, sill, 0); box(g, b, h, dpt, mFrame, x1 - b / 2, sill, 0);
    box(g, w, b, dpt, mFrame, cx, head - b, 0); box(g, w, b, dpt, mFrame, cx, sill, 0);
    if (w > 1) box(g, b * 1.4, h, dpt, mFrame, cx, sill, 0);
    box(g, w - b, h - b, .012, mGlass, cx, sill + b / 2, 0, 0, false);
    if (sill > 0) box(g, w + .1, .03, t + .06, mQuartz, cx, sill - .03, 0);
  }
}
const door = (c, side, hinge, extra = {}) => ({ type: 'door', c, w: .8, head: 2.1, side, hinge, ...extra });
const win = (c, w, sill = 1.0) => ({ type: 'window', c, w, sill, head: 2.3 });
const french = (c, w) => ({ type: 'french', c, w, sill: 0, head: 2.3 });

// exterior walls
wall(-.55, -.175, 7.83, -.175, .35, [win(1.60, 1.30), win(4.72, 1.95)], { ext: -1 });           // north
wall(7.655, -.35, 7.655, 9.0, .35, [win(4.53, .70, 1.6), french(6.95, 1.30)], { ext: -1 });    // east (bedrooms, bath)
wall(6.10, 8.825, 7.83, 8.825, .35, [], { ext: 1 });                                             // bedroom / loggia
wall(5.95, 8.65, 5.95, 13.05, .30, [french(1.20, 1.45), french(3.00, 1.45)], { ext: -1 });     // living / loggia
wall(6.10, 12.875, 7.85, 12.875, .35, [french(.75, 1.30)], { ext: -1 });                         // kitchen / loggia
wall(7.675, 12.70, 7.675, 16.15, .35, [french(1.57, 1.30)], { ext: -1 });                        // kitchen east
wall(2.30, 15.975, 7.85, 15.975, .35, [], { ext: 1 });                                           // kitchen south
// party walls, core
wall(-.125, 3.84, -.125, 13.55, .25);
wall(-.425, -.35, -.425, 3.99, .25);
wall(.72, 14.26, 2.42, 15.96, .20);                                                              // kitchen / lift core
wall(-.07, 13.57, .68, 14.32, .20, [{ type: 'door', c: .53, w: .9, head: 2.1, side: -1, hinge: 'start', entry: true }]); // entry C
wall(-.93, 14.32, -.18, 13.57, .20, [{ type: 'door', c: .53, w: .9, head: 2.1, side: 1, hinge: 'start', entry: false, open: 0 }], { mat: mWall }); // neighbour B
wall(-.93, 14.25, -.93, 16.2, .20); wall(-.93, 16.1, 2.4, 16.1, .20);                            // landing enclosure
// interior partitions
wall(2.13, 12.875, 6.10, 12.875, .35);                                                           // living / kitchen
wall(.76, 14.246, 2.13, 12.876, .15, [door(.97, 1, 'start')]);                                   // kitchen door (diagonal)
wall(2.83, 0, 2.83, 2.80, .10);                                                                  // bed 1 / bed 2
wall(-.55, 3.915, 1.72, 3.915, .15);                                                             // bed 1 south
wall(1.73, 3.89, 2.83, 2.79, .15, [door(.778, -1, 'start', { open: 2.6 })]);                     // bed 1 door (diagonal)
wall(2.83, 2.55, 3.56, 3.28, .15, [door(.516, -1, 'start', { open: 2.3 })]);                     // bed 2 door (diagonal)
wall(3.50, 3.305, 7.48, 3.305, .15);                                                             // bed 2 / bath 2
wall(3.60, 3.25, 3.60, 8.65, .10, [door(1.20, -1, 'end'), door(2.50, -1, 'start')]);             // hall east: bath 2, bed 3
wall(3.65, 5.055, 7.48, 5.055, .15);                                                             // bath 2 / bed 3
wall(2.175, 4.44, 2.175, 8.65, .15, [door(1.91, 1, 'end'), door(3.16, 1, 'start')]);             // hall west: bath 1, laundry
wall(0, 7.025, 2.10, 7.025, .15);                                                                // bath 1 / laundry
wall(1.65, 3.94, 2.175, 4.44, .15);                                                              // bath 1 chamfer
wall(0, 8.725, 5.80, 8.725, .15, [door(3.05, -1, 'end')]);                                       // living north (hall door)

// ---------- floors, ceiling, outside ----------
floor(R(-.4, -.1, 7.6, 3.95), mParquet); floor(R(-.1, 3.9, 7.6, 8.8), mParquet);
floor(R(-.1, 8.7, 5.95, 12.9), mParquet);
floor([[-.1, 12.8], [2.25, 12.8], [.72, 14.3], [-.1, 13.5]], mParquet);
floor([[2.05, 12.95], [7.6, 12.95], [7.6, 15.9], [2.4, 15.9], [.78, 14.28]], mKitTile, .004);
floor([[0, 3.99], [1.62, 3.97], [2.12, 4.47], [2.12, 6.97], [0, 6.97]], mBathDark, .004);
floor(R(0, 7.08, 2.12, 8.67), mBathTile, .004);
floor(R(3.63, 3.36, 7.5, 5.0), mBathTile, .004);
floor(R(-.95, 13.4, 2.4, 16.1), mLanding, -.004);
// loggia, east balcony, south terrace (connected)
const outY = -.02;
floor(R(6.1, 9.0, 7.83, 12.7), mOutTile, outY); floor(R(7.83, -.35, 9.03, 16.15), mOutTile, outY); floor(R(2.5, 16.15, 9.03, 18.15), mOutTile, outY);
box(scene, 1.73, .25, 3.7, mWall, 6.965, outY - .255, 10.85); box(scene, 1.2, .25, 16.5, mWall, 8.43, outY - .255, 7.9); box(scene, 6.53, .25, 2.0, mWall, 5.765, outY - .255, 17.15);
function rail(ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
  const g = new THREE.Group(); g.position.set(ax, 0, az); g.rotation.y = Math.atan2(-dz, dx); scene.add(g);
  box(g, L, .04, .06, mFrame, L / 2, 1.0, 0); box(g, L, .04, .04, mFrame, L / 2, .06, 0);
  box(g, L, .9, .012, mGlass, L / 2, .1, 0, 0, false);
  const n = Math.max(1, Math.round(L / 1.3));
  for (let i = 0; i <= n; i++) box(g, .04, 1.0, .04, mFrame, i * L / n, 0, 0);
}
rail(9.0, -.33, 9.0, 18.12); rail(9.0, 18.12, 2.52, 18.12); rail(2.52, 18.12, 2.52, 16.17); rail(7.85, -.33, 9.0, -.33);

const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(9.9, 16.6), mCeil);
ceiling.rotation.x = Math.PI / 2; ceiling.position.set(2.9, H, 7.9); ceiling.castShadow = true; scene.add(ceiling);

// surroundings (assumed: garden level with hedges, as suggested by the site photo)
const lawn = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), M('#7f9a5c', { roughness: 1 }));
lawn.rotation.x = -Math.PI / 2; lawn.position.set(4, -.3, 8); lawn.receiveShadow = true; scene.add(lawn);
const mHedge = M('#4f7040', { roughness: 1 });
box(scene, 1.0, 2.1, 30, mHedge, 11.2, -.3, 8); box(scene, 16, 2.1, 1.0, mHedge, 4, -.3, 20.3); box(scene, 16, 2.1, 1.0, mHedge, 4, -.3, -4.5);

// ---------- lighting ----------
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
lamp(4.5, 10.7, 9); lamp(1.5, 12.6, 6); lamp(1.2, 10.4, 7, 1.45, false);     // living (+ pendant)
lamp(4.0, 14.4, 8); lamp(6.2, 14.4, 7);                                       // kitchen
lamp(2.9, 7.3, 6); lamp(2.9, 4.7, 6);                                         // hall
lamp(1.2, 1.9, 8); lamp(4.8, 1.6, 9); lamp(5.4, 6.7, 8);                      // bedrooms
lamp(1.0, 5.5, 8); lamp(5.3, 4.2, 7); lamp(1.0, 7.9, 6);                      // baths, laundry
lamp(0, 15.0, 7);                                                             // landing

// ---------- furniture ----------
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
function plant(x, z, s = 1) {
  const g = G(x, z); cyl(g, .16 * s, .38 * s, mPot, 0, 0, 0, .2 * s);
  for (const [dx, dy, dz, r] of [[0, .75, 0, .3], [.14, .98, .05, .22], [-.12, 1.0, -.08, .2]]) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 1), mLeaf); m.position.set(dx * s, dy * s, dz * s); m.castShadow = true; g.add(m);
  }
}
function bed(x, z, ry, w, l = 2.0, cover = mLinen, headMat = mFabric) {   // head at local -z
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
function wardrobe(x, z, ry, w, h = 2.5, d = .6, n = Math.round(w / .55), mat = mWhite) {  // front at local -z
  const g = G(x, z, ry); box(g, w, h, d, mat, 0, 0, 0);
  for (let i = 1; i < n; i++) box(g, .006, h - .04, .004, mGreige, -w / 2 + i * w / n, .02, -d / 2 - .002, 0, false);
  return g;
}
function wallSpot(parent, x, y, z) { const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), mGlow); m.position.set(x, y, z); parent.add(m); }

// Entrance + living / dining
{ const g = G(.17, 12.55); box(g, .3, .03, 1.1, mOak, 0, .82, 0); for (const sz of [-.5, .5]) box(g, .03, .82, .28, mBlack, 0, 0, sz);
  const mir = cyl(g, .36, .02, mMirror, -.15, 1.25, 0); mir.rotation.z = Math.PI / 2; mir.position.set(-.155, 1.55, 0); }
table(1.2, 10.4, .9, 1.7);
chair(.5, 10.0, -Math.PI / 2); chair(.5, 10.8, -Math.PI / 2); chair(1.9, 10.0, Math.PI / 2); chair(1.9, 10.8, Math.PI / 2);
chair(1.2, 9.3, Math.PI); chair(1.2, 11.5, 0);
{ const g = G(1.2, 10.4); box(g, .01, 1.05, .01, mBlack, 0, 1.65, 0); cyl(g, .26, .2, mBlack, 0, 1.45, 0, .1); cyl(g, .22, .02, mGlow, 0, 1.44, 0);
  cyl(g, .07, .22, mPot, 0, .74, 0); }
{ const g = G(4.4, 12.22);                                  // sofa with chaise, back to the south wall
  box(g, 2.2, .4, .85, mFabric, 0, .04, 0); box(g, 2.2, .42, .2, mFabric, 0, .44, .33);
  box(g, .18, .22, .85, mFabric, -1.01, .44, 0); box(g, .18, .22, .85, mFabric, 1.01, .44, 0);
  box(g, .9, .4, .9, mFabric, -.65, .04, -.85);
  for (const [cx, m] of [[-.55, mLinen], [.55, mFabricDark], [0, mTerracottaSoft]]) box(g, .42, .36, .12, m, cx, .46, .17, 0); }
box(scene, 2.7, .012, 1.9, mRug, 4.7, 0, 10.6);
table(4.85, 10.7, 1.0, .55, .38);
{ const g = G(4.7, 9.02); box(g, 1.9, .42, .4, mOak, 0, .08, 0); box(g, 1.3, .75, .04, mBlack, 0, 1.0, -.17); cyl(g, .08, .25, mPot, .75, .5, 0); }
box(scene, 3.55, H, .012, mGreige, 3.95, 0, 12.692, 0, false);       // accent wall behind the sofa
{ const g = G(5.63, 12.5); cyl(g, .14, .02, mBlack, 0, 0, 0); cyl(g, .012, 1.5, mBlack, 0, 0, 0); cyl(g, .17, .26, mGlow, 0, 1.45, 0, .12); }
plant(.35, 9.15, 1.15);

// Kitchen
{ const g = G(0, 0), zc = 15.5, fz = 15.2;
  box(g, 1.2, 2.2, .6, mSage, 3.05, 0, zc);                              // tall units (fridge, oven column)
  box(g, .56, .42, .01, mBlack, 3.35, 1.05, fz - .004);                  // oven front
  box(g, 3.8, .86, .6, mSage, 5.55, 0, zc); box(g, 3.84, .04, .63, mQuartz, 5.55, .86, zc - .012);
  box(g, 3.8, .55, .02, mQuartz, 5.55, .9, 15.79, 0, false);             // backsplash
  box(g, 1.3, .7, .35, mSage, 4.3, 1.45, 15.625); box(g, 1.85, .7, .35, mSage, 6.525, 1.45, 15.625);
  box(g, .65, .12, .45, mSteel, 5.275, 1.5, 15.575); box(g, .3, .55, .3, mSteel, 5.275, 1.6, 15.65);   // hood
  box(g, .58, .008, .5, mBlack, 5.275, .9, zc);                          // hob
  box(g, .5, .01, .4, mSteel, 6.6, .9, zc); cyl(g, .015, .3, mSteel, 6.6, .9, 15.72);                  // sink, tap
  for (const xx of [3.05, 4.25, 4.85, 5.6, 6.2, 6.85]) box(g, .006, .8, .004, mBlack, xx, .03, fz - .002, 0, false);
  for (const xx of [4.3, 6.2, 6.85]) box(g, .006, .66, .004, mBlack, xx, 1.47, 15.448, 0, false);
  const strip = box(g, 3.1, .01, .03, mGlow, 5.4, 1.44, 15.6, 0, false); strip.receiveShadow = false; }
table(4.55, 13.42, 1.1, .7);
chair(3.75, 13.42, -Math.PI / 2, mFabric); chair(5.35, 13.42, Math.PI / 2, mFabric); chair(4.55, 14.0, 0, mFabric);
{ const g = G(4.55, 13.42); cyl(g, .09, .18, mPot, 0, .74, 0); }

// Hall
box(scene, .02, .7, .5, mBlack, 3.538, 1.1, 6.95); box(scene, .012, .6, .4, mLinen, 3.526, 1.15, 6.95, 0, false);
box(scene, .02, .7, .5, mBlack, 3.538, 1.1, 7.75); box(scene, .012, .6, .4, mTerracottaSoft, 3.526, 1.15, 7.75, 0, false);

// Bedroom 14.60 (main): bed head on the east wall, wardrobe on the south wall
box(scene, .012, H, 3.2, mGreige, 7.47, 0, 1.6, 0, false);
bed(6.48, 1.35, -Math.PI / 2, 1.6, 2.0, mFabric, mFabricDark);
nightstand(7.26, .3); nightstand(7.26, 2.4);
wardrobe(5.35, 2.93, 0, 2.8, 2.5, .6);
box(scene, 2.2, .012, 1.4, mRug, 5.3, 0, 1.35);
wallSpot(scene, 7.4, 1.25, .3); wallSpot(scene, 7.4, 1.25, 2.4);

// Bedroom 13.50: bed head on the south wall, wardrobe on the west wall, armchair by the French door
box(scene, 3.8, H, .012, mAccentBlue, 5.565, 0, 8.642, 0, false);
bed(5.85, 7.61, Math.PI, 1.6, 2.0, mLinen, mFabric);
nightstand(4.8, 8.42); nightstand(6.9, 8.42);
wardrobe(3.95, 7.5, -Math.PI / 2, 2.15, 2.5, .6);
{ const g = G(6.85, 5.62, .5); box(g, .7, .36, .7, mFabricDark, 0, .08, 0); box(g, .7, .45, .14, mFabricDark, 0, .44, -.28);
  for (const s of [-.31, .31]) box(g, .08, .2, .7, mFabricDark, s, .44, 0); }

// Bedroom 10.80: child's room / study
bed(.15, 2.0, 0, .9, 2.0, mAccentBlue, mOak);
table(1.05, .32, 1.2, .6); chair(1.05, .85, 0, mFabric);
{ const g = G(1.5, .2); cyl(g, .07, .02, mBlack, 0, .74, 0); cyl(g, .01, .35, mBlack, 0, .74, 0); cyl(g, .08, .1, mGlow, 0, 1.05, 0, .05); }
wardrobe(2.5, .62, Math.PI / 2, 1.0, 2.5, .55, 2);
{ const g = G(2.6, 1.8);                                                 // open shelving on the east wall
  for (const z of [-.6, 0, .6]) box(g, .32, 2.0, .025, mOak, 0, 0, z);
  for (const y of [.02, .5, .98, 1.46, 1.96]) box(g, .32, .025, 1.2, mOak, 0, y, 0);
  for (const [y, z, m] of [[.525, -.3, mSage], [1.005, .3, mTerracottaSoft], [1.485, -.25, mLinen], [1.005, -.35, mAccentBlue]]) box(g, .2, .24, .3, m, 0, y, z); }
box(scene, 1.5, .012, 1.1, mRug, 1.45, 0, 2.0);

// Bathroom 6.15 (window): shower at the window end, vanity, bidet and WC on the north wall
function vanity(g, x, z, ry) {
  const v = new THREE.Group(); v.position.set(x, 0, z); v.rotation.y = ry; g.add(v);  // back at local -z
  box(v, 1.0, .4, .46, mOak, 0, .45, 0); box(v, 1.02, .03, .48, mWhite, 0, .85, 0); box(v, .5, .1, .32, mWhite, 0, .88, .02);
  cyl(v, .012, .2, mSteel, 0, .88, -.17);
  box(v, .96, .76, .01, mGlow, 0, 1.12, -.232, 0, false); box(v, .9, .7, .012, mMirror, 0, 1.15, -.226, 0, false);
}
function wc(g, x, z, ry, lid = true) {
  const v = new THREE.Group(); v.position.set(x, 0, z); v.rotation.y = ry; g.add(v);
  box(v, .36, .28, .5, mWhite, 0, .14, 0); if (lid) box(v, .36, .03, .44, mWhite, 0, .42, .02);
  if (lid) box(v, .22, .14, .012, mSteel, 0, 1.0, -.245, 0, false);
}
{ const g = G(0, 0);
  box(g, 3.83, 2.2, .012, mBathWall, 5.565, 0, 3.386, 0, false); box(g, .012, H, 1.6, mBathWall, 7.474, 0, 4.18, 0, false); box(g, .9, H, .012, mBathWall, 7.03, 0, 4.974, 0, false);
  vanity(g, 4.7, 3.62, 0); wc(g, 5.6, 3.64, 0, false); wc(g, 6.15, 3.64, 0);
  box(g, .9, .04, 1.6, mWhite, 7.03, .004, 4.18); box(g, .012, 2.0, 1.05, mGlass, 6.58, .04, 3.91, 0, false);
  box(g, .03, 2.0, .03, mSteel, 6.58, .04, 4.44); cyl(g, .1, .02, mSteel, 7.1, 2.1, 3.75); }
// Bathroom 5.85 (internal): bathtub on the north wall, vanity facing the door
{ const g = G(0, 0);
  box(g, .012, H, 2.96, mBathWallDark, .006, 0, 5.47, 0, false); box(g, .012, 1.2, 1.5, mBathWall, .006, 0, 7.86, 0, false); box(g, 1.6, H, .012, mBathWallDark, .8, 0, 3.996, 0, false);
  box(g, 1.55, .56, .72, mWhite, .78, 0, 4.36); box(g, 1.4, .02, .56, mBathTile, .78, .55, 4.36, 0, false);
  vanity(g, .24, 6.35, Math.PI / 2); wc(g, .26, 5.3, Math.PI / 2); }
// Laundry
{ const g = G(0, 0);
  for (const y of [0, .86]) { box(g, .6, .85, .6, mWhite, .3, y, 7.42); const d = cyl(g, .2, .02, mBlack, .61, y + .25, 7.42); d.rotation.z = Math.PI / 2; d.position.set(.605, y + .45, 7.42); }
  box(g, .6, .86, .9, mWhite, .3, 0, 8.17); box(g, .62, .04, .92, mQuartz, .31, .86, 8.17); box(g, .4, .01, .45, mSteel, .32, .9, 8.17); cyl(g, .014, .28, mSteel, .1, .9, 8.17);
  wardrobe(1.62, 8.47, Math.PI, .85, 2.3, .35, 2); }

// Loggia and terrace
function lounge(x, z, ry) { const g = G(x, z, ry); box(g, .75, .24, .75, mFrame, 0, outY + .04, 0); box(g, .7, .12, .7, mLinen, 0, outY + .28, 0); box(g, .75, .42, .14, mLinen, 0, outY + .28, .3); }
lounge(7.25, 9.85, 0.0); lounge(7.25, 11.75, Math.PI);
table(7.25, 10.8, .55, .55, .36, mFrame);
for (const z of [1.2, 7.9, 14.6]) { const g = G(8.8, z); box(g, .3, .45, 1.2, mPot, 0, outY, 0); box(g, .26, .45, 1.1, mLeaf, 0, outY + .45, 0); }
{ const g = G(5.8, 17.85); box(g, 2.2, .45, .3, mPot, 0, outY, 0); box(g, 2.1, .45, .26, mLeaf, 0, outY + .45, 0); }

// ---------- walkthrough ----------
const ROOMS = {
  entry: ['Entrance', 'Unit C — front door from the landing'],
  living: ['Living / dining', '26.60 m² · two French doors onto the loggia'],
  kitchen: ['Kitchen', '15.35 m² · French doors to balcony and loggia'],
  hall: ['Hall', '7.85 m²'],
  laundry: ['Laundry', '3.50 m²'],
  bath1: ['Bathroom', '5.85 m² · internal'],
  bed3: ['Bedroom', '13.50 m² · French door onto the balcony'],
  bath2: ['Bathroom', '6.15 m² · with window'],
  bed2: ['Main bedroom', '14.60 m²'],
  bed1: ['Bedroom / study', '10.80 m²'],
  plan: ['Plan view', 'About 104 m² internal · ceilings 2.70 m'],
};
const RAW = [
  { p: [-.35, 14.60], l: [.9, 1.5, 13.35], room: 'entry', hold: 2.8 },
  { p: [.305, 13.945], l: [2.6, 1.4, 11.6] },
  { p: [1.55, 12.4], l: [5.8, 1.2, 10.6], room: 'living', hold: 2 },
  { p: [2.15, 11.9], l: [5.8, 1.2, 10.6] },
  { p: [2.75, 10.9], l: [6.5, 1.2, 10.4] },
  { p: [3.0, 10.1], l: [7.5, 1.2, 10.5], hold: 2 },
  { p: [3.25, 9.95], l: [.9, .9, 10.5], hold: 1.5 },
  { p: [2.3, 11.9], l: [1.2, 1.3, 13.4] },
  { p: [1.06, 13.18], l: [1.9, 1.4, 14.0] },
  { p: [1.445, 13.565], l: [3.2, 1.3, 14.6], room: 'kitchen' },
  { p: [1.95, 14.07], l: [4.5, 1.2, 14.9] },
  { p: [3.0, 14.45], l: [6.4, 1.0, 15.0], hold: 1.8 },
  { p: [5.0, 14.6], l: [7.7, 1.2, 14.3], hold: 1.2 },
  { p: [5.05, 14.6], l: [6.85, 1.2, 12.6], hold: 1.5 },
  { p: [3.4, 14.55], l: [1.9, 1.4, 14.05] },
  { p: [1.95, 14.07], l: [1.0, 1.4, 13.1] },
  { p: [1.445, 13.565], l: [1.2, 1.4, 12.2], room: 'living' },
  { p: [1.7, 12.5], l: [2.8, 1.4, 10.2] },
  { p: [2.6, 11.0], l: [3.05, 1.4, 8.5] },
  { p: [3.05, 9.5], l: [2.95, 1.4, 6.0] },
  { p: [3.05, 8.725], l: [2.9, 1.4, 5.5], room: 'hall' },
  { p: [2.95, 7.6], l: [.3, 1.0, 7.7], room: 'laundry', hold: 1.5 },
  { p: [2.9, 6.35], l: [.3, 1.1, 6.35], room: 'bath1', hold: 1.5 },
  { p: [2.95, 5.75], l: [5.0, 1.3, 6.2], room: 'hall' },
  { p: [3.6, 5.75], l: [5.8, 1.1, 6.9], room: 'bed3' },
  { p: [4.35, 5.7], l: [6.3, .8, 7.6], hold: 2 },
  { p: [4.4, 5.72], l: [7.6, 1.2, 6.6], hold: 1.5 },
  { p: [3.6, 5.75], l: [2.9, 1.4, 4.8], room: 'hall' },
  { p: [2.95, 5.3], l: [3.0, 1.4, 4.3] },
  { p: [3.0, 4.5], l: [5.0, 1.3, 4.4] },
  { p: [3.6, 4.45], l: [6.0, 1.2, 4.2], room: 'bath2' },
  { p: [3.95, 4.45], l: [6.6, .9, 3.95], hold: 2 },
  { p: [3.6, 4.45], l: [2.9, 1.4, 4.0], room: 'hall' },
  { p: [3.0, 4.2], l: [3.2, 1.4, 2.9] },
  { p: [2.85, 3.26], l: [3.6, 1.3, 2.5] },
  { p: [3.195, 2.915], l: [5.0, 1.2, 1.5], room: 'bed2' },
  { p: [3.7, 2.35], l: [7.2, 1.0, 1.2], hold: 2.2 },
  { p: [4.3, 1.9], l: [4.4, 1.4, -.2], hold: 1.5 },
  { p: [3.75, 2.3], l: [3.0, 1.4, 3.1] },
  { p: [3.195, 2.915], l: [2.6, 1.4, 3.6], room: 'hall' },
  { p: [2.85, 3.3], l: [2.3, 1.4, 3.6] },
  { p: [2.6, 3.62], l: [2.0, 1.4, 3.05] },
  { p: [2.28, 3.34], l: [1.0, 1.2, 1.5], room: 'bed1' },
  { p: [1.6, 2.5], l: [.9, 1.0, .3], hold: 2 },
  { p: [1.6, 2.55], l: [.15, .6, 2.0], hold: 1.5 },
  { p: [2.4, 5.5], y: 7, l: [3.4, 0, 7.3], room: 'plan' },
  { p: [4.2, 10.2], y: 18.5, l: [4.2, 0, 9.1], hold: 8 },
];
const SPEED = 1.0, TURN = 0.9;
let lastRoom = 'entry';
const wps = RAW.map(r => {
  const pos = new V3(r.p[0], r.y ?? 1.6, r.p[1]), d = new V3(...r.l).sub(pos);
  lastRoom = r.room || lastRoom;
  return { pos, yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)), room: lastRoom, hold: r.hold || 0 };
});
for (let i = 1; i < wps.length; i++) {       // unwrap yaw so turns take the short way round
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
const hermMono = (p0, p1, p2, p3, f) => {    // no overshoot for angles
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

if (new URLSearchParams(location.search).has('debug')) {   // show the camera path
  const pts = [], st = { pos: new V3() }; for (let t = 0; t < total; t += .1) { stateAt(t, st); pts.push(st.pos.clone()); }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xff0044 })));
}

// ---------- UI ----------
const $ = id => document.getElementById(id);
let time = 0, playing = true, yawOff = 0, pitchOff = 0;
const cur = { pos: new V3(), yaw: 0, pitch: 0, room: 'entry' };
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function setPlaying(p) { playing = p; $('play').textContent = p ? 'Pause' : 'Play'; $('hint').classList.toggle('show', !p); }
$('play').onclick = () => { if (!playing && time >= total - .05) time = 0; setPlaying(!playing); };
$('restart').onclick = () => { time = 0; setPlaying(true); };
$('seek').oninput = e => { time = e.target.value / 1000 * total; yawOff = pitchOff = 0; };
addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); $('play').click(); } });
const chipEls = {};
for (const key of Object.keys(ROOMS)) {
  const b = document.createElement('button'); b.textContent = ROOMS[key][0] + (key === 'bath2' ? ' 2' : key === 'bed3' ? ' 2' : '');
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

function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
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

// small hook for checking specific moments of the tour
window.tour = { seek: t => { time = t; yawOff = pitchOff = 0; setPlaying(false); frame(0); }, play: () => setPlaying(true), total, wps, scene, THREE, stateAt };
