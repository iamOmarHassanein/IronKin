// IRONKIN flag: a cloth simulated in real time (Verlet + distance constraints), drawn with WebGL 1.
// Pinned by its two top corners; grab it anywhere and pull it around.
(function () {
  "use strict";
  const hero = document.querySelector(".hero"), cv = document.getElementById("cloth"), still = document.getElementById("clothStill");
  const reduced = /[?&]still\b/.test(location.search) || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fail = () => hero.classList.add("no-cloth");

  // ------------------------------------------------------------ settings
  const S = { size: 0.84, aspect: 0.8, spread: 0.97, pinRoll: 5, flutter: 0.32, damping: 0.3, stiffness: 0.6, crumple: 0.45,
    grabRadius: 0.12, carryRadius: 0.2, gravity: 2.6, tilt: -9, turn: -12, perspective: 0.45, maxSpeed: 12, steps: 8 };
  const COLS = 36, ROWS = 44, NP = COLS * ROWS;
  const CH = S.size, CW = S.size * S.aspect;
  const id = (c, r) => r * COLS + c;

  // ------------------------------------------------------------ flag texture (drawn, so it is always on brand)
  const TEX_W = 820, TEX_H = 1024;
  function drawFlag(sym, wm) {
    const c = document.createElement("canvas"); c.width = TEX_W; c.height = TEX_H;
    const g = c.getContext("2d");
    const grd = g.createLinearGradient(0, 0, 0, TEX_H); grd.addColorStop(0, "#5E1119"); grd.addColorStop(1, "#3A0A0F");
    g.fillStyle = grd; g.fillRect(0, 0, TEX_W, TEX_H);
    // woven texture
    g.globalAlpha = 0.07; g.fillStyle = "#000";
    for (let y = 0; y < TEX_H; y += 3) g.fillRect(0, y, TEX_W, 1);
    g.fillStyle = "#fff"; g.globalAlpha = 0.025;
    for (let x = 0; x < TEX_W; x += 3) g.fillRect(x, 0, 1, TEX_H);
    g.globalAlpha = 1;
    // cream borders
    g.strokeStyle = "#EEE7DC"; g.lineWidth = 4; g.strokeRect(38, 38, TEX_W - 76, TEX_H - 76);
    g.lineWidth = 1.5; g.strokeRect(54, 54, TEX_W - 108, TEX_H - 108);
    g.fillStyle = "#EEE7DC"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = '500 26px "Instrument Sans", Arial, sans-serif';
    spaced(g, "COLLECTION 001", TEX_W / 2, 128, 7);
    const sw = 470, sh = sw * (sym.naturalHeight / sym.naturalWidth || 0.54);
    g.drawImage(sym, (TEX_W - sw) / 2, 410 - sh / 2, sw, sh);
    const ww = 560, wh = ww * (wm.naturalHeight / wm.naturalWidth || 0.17);
    g.drawImage(wm, (TEX_W - ww) / 2, 680 - wh / 2, ww, wh);
    g.font = 'italic 400 46px "Instrument Serif", Georgia, serif';
    g.fillText("by those who train", TEX_W / 2, 790);
    g.font = '500 22px "Instrument Sans", Arial, sans-serif';
    spaced(g, "STRENGTH  ·  JIU-JITSU  ·  PADEL", TEX_W / 2, TEX_H - 120, 5);
    return c;
  }
  function spaced(g, text, x, y, sp) {
    const chars = [...text], widths = chars.map((ch) => g.measureText(ch).width), total = widths.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
    let cx = x - total / 2; g.textAlign = "left";
    chars.forEach((ch, i) => { g.fillText(ch, cx, y); cx += widths[i] + sp; });
    g.textAlign = "center";
  }
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  // ------------------------------------------------------------ WebGL
  const gl = cv.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "high-performance" });
  const VS = `attribute vec3 p; attribute vec3 n; attribute vec2 uv;
    uniform vec3 R0, R1, R2; uniform float CAM, zoom, cx, cy, ar;
    varying vec3 vn; varying vec3 vp; varying vec2 vuv;
    void main() {
      vec3 q = vec3(dot(R0, p), dot(R1, p), dot(R2, p));
      float s = CAM / max(CAM - q.z, 0.001); vec2 sc = q.xy * s * zoom;
      gl_Position = vec4(2.0 * (cx + sc.x / ar) - 1.0, 1.0 - 2.0 * (cy - sc.y), -q.z * 0.5, 1.0);
      vn = vec3(dot(R0, n), dot(R1, n), dot(R2, n)); vp = q; vuv = uv;
    }`;
  // Satin-cotton shading: soft key light, a gentle sheen that follows the folds, darker reverse side.
  const FS = `precision highp float;
    uniform sampler2D tex; uniform float ready, CAM;
    varying vec3 vn; varying vec3 vp; varying vec2 vuv;
    float box(vec3 d, vec3 c, vec2 h, float soft) {
      vec3 u = normalize(cross(c, vec3(0.0, 1.0, 0.0001))); vec3 v = cross(u, c);
      vec2 o = vec2(dot(d, u), dot(d, v)) / max(dot(d, c), 0.001);
      vec2 e = smoothstep(-0.5, 0.5, (h - abs(o)) / soft); return e.x * e.y * step(0.0, dot(d, c));
    }
    void main() {
      vec3 n = normalize(vn); bool back = n.z < 0.0; if (back) n = -n;
      vec3 V = normalize(vec3(0.0, 0.0, CAM) - vp); vec3 Rf = reflect(-V, n);
      vec3 KEY = normalize(vec3(-0.42, 0.45, 0.79));
      float nv = clamp(dot(n, V), 0.0, 1.0), nl = max(dot(n, KEY), 0.0);
      vec3 print = ready > 0.5 ? pow(texture2D(tex, vuv).rgb, vec3(2.2)) : vec3(0.09, 0.008, 0.012);
      float shade = 0.42 + 0.72 * nl + 0.08 * n.y;
      float key = pow(max(dot(Rf, KEY), 0.0), 18.0);
      float strip = box(Rf, normalize(vec3(0.08, 0.93, 0.36)), vec2(1.1, 0.08), 0.25);
      float lum = dot(print, vec3(0.2126, 0.7152, 0.0722));
      vec3 sheen = mix(vec3(1.0, 0.86, 0.8), vec3(1.0), smoothstep(0.3, 0.8, lum)) * (0.09 * key + 0.022 * strip + 0.018 * pow(1.0 - nv, 3.0));
      vec3 col = print * shade + sheen;
      if (back) col = mix(vec3(0.05, 0.004, 0.008) * (0.4 + 0.9 * nl) + sheen * 0.6, print * shade, 0.22);
      col = min(col, 0.8) + 0.2 * (1.0 - exp(-max(col - 0.8, 0.0) / 0.2));
      gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
    }`;
  function prog(vs, fs) {
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p;
  }
  let P;
  try { if (!gl) throw 0; P = prog(VS, FS); } catch (e) { fail(); fallbackStill(); return; }
  cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); fail(); fallbackStill(); });

  // ------------------------------------------------------------ cloth state
  const pos = new Float32Array(NP * 3), prev = new Float32Array(NP * 3), rest = new Float32Array(NP * 3), flat = new Float32Array(NP * 2);
  const inv = new Float32Array(NP).fill(1), nrm = new Float32Array(NP * 3), uvs = new Float32Array(NP * 2);
  const ridge = (x) => Math.sqrt(Math.sin(x) ** 2 + 0.03) - 0.64;
  const crease = (u, v) => S.crumple * 0.045 * CH * (ridge(2.7 * u + 2.9 * v + 0.7) + 0.8 * ridge(-2.6 * u + 3.3 * v + 2.1) + 0.5 * Math.sin(4.9 * u - 1.4 * v + 2.2)
    + 0.55 * ridge(1.1 * u + 6.4 * v + 1.3) + 0.4 * ridge(8.3 * u + 3.9 * v + 0.2) + 0.3 * ridge(-5.7 * u + 9.1 * v + 1.6));
  const roll = (S.pinRoll * Math.PI) / 180, half = 0.5 * CW * S.spread, top = 0.5 * CH;
  const PL = id(0, ROWS - 1), PR = id(COLS - 1, ROWS - 1);
  const pinPos = { [PL]: [-half * Math.cos(roll), top + half * Math.sin(roll), 0], [PR]: [half * Math.cos(roll), top - half * Math.sin(roll), 0] };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = id(c, r), u = c / (COLS - 1), v = r / (ROWS - 1);
    const fx = (u - 0.5) * CW, fy = (v - 0.5) * CH;
    flat[i * 2] = fx; flat[i * 2 + 1] = fy;
    rest[i * 3] = fx; rest[i * 3 + 1] = fy; rest[i * 3 + 2] = crease(u, v);
    uvs[i * 2] = u; uvs[i * 2 + 1] = 1 - v;
    // starting pose: bottom slightly narrower, already leaning with the pins
    const sx = fx * (S.spread + (1 - S.spread) * (1 - v) ** 2), ry = fy - top;
    pos[i * 3] = sx * Math.cos(roll) + ry * Math.sin(roll); pos[i * 3 + 1] = top - sx * Math.sin(roll) + ry * Math.cos(roll); pos[i * 3 + 2] = rest[i * 3 + 2];
  }
  [PL, PR].forEach((i) => { inv[i] = 0; pos.set(pinPos[i], i * 3); });
  prev.set(pos);
  // links
  const LA = [], LB = [], LR = [], LK = [];
  const bend = 0.02 + (0.6 - 0.02) * S.stiffness;
  const link = (a, b, k) => { LA.push(a); LB.push(b); LK.push(k); LR.push(Math.hypot(rest[a * 3] - rest[b * 3], rest[a * 3 + 1] - rest[b * 3 + 1], rest[a * 3 + 2] - rest[b * 3 + 2])); };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = id(c, r);
    if (c + 1 < COLS) link(i, id(c + 1, r), 1);
    if (r + 1 < ROWS) link(i, id(c, r + 1), 1);
    if (c + 1 < COLS && r + 1 < ROWS) { link(i, id(c + 1, r + 1), 0.5); link(id(c + 1, r), id(c, r + 1), 0.5); }
    if (c + 2 < COLS) link(i, id(c + 2, r), bend);
    if (r + 2 < ROWS) link(i, id(c, r + 2), bend);
    if (c + 5 < COLS) link(i, id(c + 5, r), bend * 0.5);
    if (r + 5 < ROWS) link(i, id(c, r + 5), bend * 0.5);
  }
  const NL = LA.length;
  // tethers: no point drifts further from a pin than 1.02x its flat distance
  const tL = new Float32Array(NP), tR = new Float32Array(NP);
  for (let i = 0; i < NP; i++) {
    tL[i] = 1.02 * Math.hypot(flat[i * 2] - flat[PL * 2], flat[i * 2 + 1] - flat[PL * 2 + 1]);
    tR[i] = 1.02 * Math.hypot(flat[i * 2] - flat[PR * 2], flat[i * 2 + 1] - flat[PR * 2 + 1]);
  }
  function tether(p, o, i) {
    for (const [pin, lim] of [[pinPos[PL], tL[i]], [pinPos[PR], tR[i]]]) {
      const dx = p[o] - pin[0], dy = p[o + 1] - pin[1], dz = p[o + 2] - pin[2], d = Math.hypot(dx, dy, dz);
      if (d > lim) { const k = lim / d; p[o] = pin[0] + dx * k; p[o + 1] = pin[1] + dy * k; p[o + 2] = pin[2] + dz * k; }
    }
  }

  // ------------------------------------------------------------ camera
  const t = (S.tilt * Math.PI) / 180, rr = (S.turn * Math.PI) / 180;
  const R0 = [Math.cos(rr), 0, Math.sin(rr)], R1 = [Math.sin(t) * Math.sin(rr), Math.cos(t), -Math.sin(t) * Math.cos(rr)], R2 = [-Math.cos(t) * Math.sin(rr), Math.sin(t), Math.cos(t) * Math.cos(rr)];
  const CAM = Math.exp(Math.log(18) * (1 - S.perspective) + Math.log(1.7) * S.perspective);
  const view = { cx: 0.4, cy: 0.5, zoom: 1, ar: 1, w: 1, h: 1 };
  function resize() {
    const r = hero.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    view.w = r.width; view.h = r.height; view.ar = r.width / r.height;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    if (r.width >= 1100 && view.ar >= 1.25) { view.cx = 0.36; view.cy = 0.545; view.zoom = Math.min(1, (0.56 * view.ar) / (CW * 1.12)); }
    else { const tall = view.ar < 0.75; view.cx = 0.5; view.cy = tall ? 0.36 : 0.4; view.zoom = Math.min(1, (0.86 * view.ar) / (CW * 1.12), (tall ? 0.56 : 0.6) / CH); }
    gl.viewport(0, 0, cv.width, cv.height);
    draw();
  }
  const project = (i) => {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    const qx = R0[0] * x + R0[1] * y + R0[2] * z, qy = R1[0] * x + R1[1] * y + R1[2] * z, qz = R2[0] * x + R2[1] * y + R2[2] * z;
    const s = CAM / Math.max(CAM - qz, 0.001); return [qx * s, qy * s, qz];
  };
  const unproject = (sx, sy, qz) => { const s = CAM / Math.max(CAM - qz, 0.001), qx = sx / s, qy = sy / s;
    return [R0[0] * qx + R1[0] * qy + R2[0] * qz, R0[1] * qx + R1[1] * qy + R2[1] * qz, R0[2] * qx + R1[2] * qy + R2[2] * qz]; };
  const toScreen = (e) => { const r = cv.getBoundingClientRect(); return [(((e.clientX - r.left) / r.width - view.cx) * view.ar) / view.zoom, (view.cy - (e.clientY - r.top) / r.height) / view.zoom]; };

  // ------------------------------------------------------------ simulation
  let T = 0, dampingNow = S.damping;
  const held = { i: -1, depth: 0, off: [0, 0, 0], ptr: [0, 0], w: null };
  function sub(h) {
    T += h;
    const damp = Math.exp(-(0.15 + 5.85 * dampingNow) * h);
    const gust = 0.6 + 0.4 * Math.sin(0.37 * T) * Math.sin(0.23 * T + 1);
    const wind = reduced ? 0 : S.flutter * 2.4 * gust * (S.gravity / 2.6);
    const vmax = S.maxSpeed * h, h2 = h * h;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = id(c, r); if (!inv[i]) continue;
      const o = i * 3, u = c / (COLS - 1), v = r / (ROWS - 1);
      const s1 = Math.sin(9.1 * u - 3.7 * v + 3.1 * T), s2 = Math.sin(6.3 * u + 7.9 * v - 2.3 * T + 1.3);
      const s3 = Math.sin(2.9 * u + 1.7 * T + 0.8 * Math.sin(0.5 * T)) * Math.cos(2.3 * v - 0.9 * T);
      const ax = wind * 0.25 * Math.sin(3.3 * v + 1.1 * T + u), ay = wind * 0.1 * s2 - S.gravity, az = wind * (0.45 * s1 + 0.35 * s2 + 0.3 * s3);
      let vx = (pos[o] - prev[o]) * damp + ax * h2, vy = (pos[o + 1] - prev[o + 1]) * damp + ay * h2, vz = (pos[o + 2] - prev[o + 2]) * damp + az * h2;
      const sp = Math.hypot(vx, vy, vz); if (sp > vmax) { const k = vmax / sp; vx *= k; vy *= k; vz *= k; }
      prev[o] = pos[o]; prev[o + 1] = pos[o + 1]; prev[o + 2] = pos[o + 2];
      pos[o] += vx; pos[o + 1] += vy; pos[o + 2] += vz;
    }
    if (held.i >= 0) carry();
    const fwd = (Math.round(T / h) & 1) === 0;
    for (let n = 0; n < NL; n++) {
      const l = fwd ? n : NL - 1 - n, a = LA[l], b = LB[l], wa = inv[a], wb = inv[b], ws = wa + wb; if (!ws) continue;
      const oa = a * 3, ob = b * 3, dx = pos[ob] - pos[oa], dy = pos[ob + 1] - pos[oa + 1], dz = pos[ob + 2] - pos[oa + 2];
      const d = Math.hypot(dx, dy, dz) || 1e-6, k = (LK[l] * (d - LR[l])) / (d * ws);
      pos[oa] += dx * k * wa; pos[oa + 1] += dy * k * wa; pos[oa + 2] += dz * k * wa;
      pos[ob] -= dx * k * wb; pos[ob + 1] -= dy * k * wb; pos[ob + 2] -= dz * k * wb;
    }
    for (let i = 0; i < NP; i++) if (inv[i]) tether(pos, i * 3, i);
  }
  const tgt = new Float32Array(3);
  function carry() {
    const q = unproject(held.ptr[0], held.ptr[1], held.depth);
    tgt[0] = q[0] + held.off[0]; tgt[1] = q[1] + held.off[1]; tgt[2] = q[2] + held.off[2];
    tether(tgt, 0, held.i);
    const g = held.i * 3, dx = tgt[0] - pos[g], dy = tgt[1] - pos[g + 1], dz = tgt[2] - pos[g + 2];
    for (let i = 0; i < NP; i++) {
      const w = held.w[i]; if (!w) continue;
      const o = i * 3; pos[o] += dx * w; pos[o + 1] += dy * w; pos[o + 2] += dz * w;
      if (w >= 0.98) { prev[o] = pos[o]; prev[o + 1] = pos[o + 1]; prev[o + 2] = pos[o + 2]; }
      else { prev[o] += dx * w; prev[o + 1] += dy * w; prev[o + 2] += dz * w; }
    }
  }
  function pick(e) {
    const [px, py] = toScreen(e), lim = S.grabRadius / view.zoom;
    let best = -1, bs = 1e9, bq = null;
    for (let i = 0; i < NP; i++) { const q = project(i), d = Math.hypot(q[0] - px, q[1] - py); if (d < lim) { const s = d - 0.08 * q[2]; if (s < bs) { bs = s; best = i; bq = q; } } }
    return best < 0 ? null : { i: best, q: bq, px, py };
  }

  // ------------------------------------------------------------ pointer
  cv.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const hit = pick(e); if (!hit) return;
    held.i = hit.i; held.depth = hit.q[2]; held.ptr = [hit.px, hit.py];
    const u0 = unproject(hit.px, hit.py, hit.q[2]); held.off = [pos[hit.i * 3] - u0[0], pos[hit.i * 3 + 1] - u0[1], pos[hit.i * 3 + 2] - u0[2]];
    held.w = new Float32Array(NP);
    const gx = flat[hit.i * 2], gy = flat[hit.i * 2 + 1], R = S.carryRadius * CH;
    for (let i = 0; i < NP; i++) { if (!inv[i]) continue; const d = Math.hypot(flat[i * 2] - gx, flat[i * 2 + 1] - gy) / R; held.w[i] = d < 1 ? (1 - d * d) ** 2 : 0; }
    held.w[hit.i] = 1;
    for (let i = 0; i < NP; i++) if (held.w[i] >= 0.98) inv[i] = 0;
    cv.setPointerCapture(e.pointerId); cv.classList.add("is-held"); wake();
  });
  cv.addEventListener("pointermove", (e) => {
    if (held.i >= 0) { held.ptr = toScreen(e); wake(); return; }
    if (e.pointerType === "mouse") cv.classList.toggle("is-over", !!pick(e));
  });
  const release = () => {
    if (held.i < 0) return;
    for (let i = 0; i < NP; i++) if (held.w[i] >= 0.98 && i !== PL && i !== PR) inv[i] = 1;
    held.i = -1; held.w = null; cv.classList.remove("is-held");
  };
  cv.addEventListener("pointerup", release); cv.addEventListener("pointercancel", release); cv.addEventListener("lostpointercapture", release);
  // Touch: only block page scrolling when the finger is actually on the flag.
  cv.addEventListener("touchstart", (e) => { if (pick(e.touches[0])) e.preventDefault(); }, { passive: false });
  cv.addEventListener("touchmove", (e) => { if (held.i >= 0) e.preventDefault(); }, { passive: false });

  // ------------------------------------------------------------ buffers and drawing
  const idx = [];
  for (let r = 0; r < ROWS - 1; r++) for (let c = 0; c < COLS - 1; c++) { const a = id(c, r), b = id(c + 1, r), d = id(c, r + 1), e = id(c + 1, r + 1); idx.push(a, b, d, b, e, d); }
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  const mkBuf = (data, usage) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage); return b; };
  const pb = mkBuf(pos, gl.DYNAMIC_DRAW), nb = mkBuf(nrm, gl.DYNAMIC_DRAW), ub = mkBuf(uvs, gl.STATIC_DRAW);
  const loc = (n) => gl.getAttribLocation(P, n), U = (n) => gl.getUniformLocation(P, n);
  const tex = gl.createTexture(); let ready = 0;
  function normals() {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const l = id(Math.max(0, c - 1), r), rt = id(Math.min(COLS - 1, c + 1), r), dn = id(c, Math.max(0, r - 1)), up = id(c, Math.min(ROWS - 1, r + 1));
      const ax = pos[rt * 3] - pos[l * 3], ay = pos[rt * 3 + 1] - pos[l * 3 + 1], az = pos[rt * 3 + 2] - pos[l * 3 + 2];
      const bx = pos[up * 3] - pos[dn * 3], by = pos[up * 3 + 1] - pos[dn * 3 + 1], bz = pos[up * 3 + 2] - pos[dn * 3 + 2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const L = Math.hypot(nx, ny, nz) || 1;
      const o = id(c, r) * 3; nrm[o] = nx / L; nrm[o + 1] = ny / L; nrm[o + 2] = nz / L;
    }
  }
  function draw() {
    normals();
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.useProgram(P);
    gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos); gl.enableVertexAttribArray(loc("p")); gl.vertexAttribPointer(loc("p"), 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, nb); gl.bufferSubData(gl.ARRAY_BUFFER, 0, nrm); gl.enableVertexAttribArray(loc("n")); gl.vertexAttribPointer(loc("n"), 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.enableVertexAttribArray(loc("uv")); gl.vertexAttribPointer(loc("uv"), 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(U("R0"), R0); gl.uniform3fv(U("R1"), R1); gl.uniform3fv(U("R2"), R2);
    gl.uniform1f(U("CAM"), CAM); gl.uniform1f(U("zoom"), view.zoom); gl.uniform1f(U("cx"), view.cx); gl.uniform1f(U("cy"), view.cy); gl.uniform1f(U("ar"), view.ar);
    gl.uniform1f(U("ready"), ready); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U("tex"), 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
  }

  // ------------------------------------------------------------ loop (only while the hero is on screen)
  let last = 0, running = false, onScreen = true, raf = 0;
  function frame(now) {
    raf = 0; if (!running) return;
    const dt = Math.min(Math.max(0.001, (now - last) / 1000 || 1 / 60), 1 / 30); last = Math.max(last, now);
    const h = dt / S.steps; for (let s = 0; s < S.steps; s++) sub(h);
    draw(); raf = requestAnimationFrame(frame);
  }
  function wake() { if (!running && onScreen && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
  function sleep() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; onScreen ? wake() : sleep(); }).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden ? sleep() : wake()));

  // Settle before the first frame, so the flag already hangs.
  dampingNow = 1; for (let s = 0; s < 360; s++) sub(1 / 240); dampingNow = S.damping;
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(hero); else addEventListener("resize", resize);
  resize();
  if (!reduced) wake();

  // Texture: draw the flag once the brand marks and fonts are in.
  Promise.all([loadImg("brand/ironkin-symbol-bone.svg"), loadImg("brand/ironkin-wordmark-bone.svg"), document.fonts ? document.fonts.ready : 0]).then(([sym, wm]) => {
    const c = drawFlag(sym, wm);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    ready = 1; draw();
    try { still.src = c.toDataURL("image/webp", 0.9); } catch (e) {}
  }).catch(() => { fail(); });

  function fallbackStill() {
    Promise.all([loadImg("brand/ironkin-symbol-bone.svg"), loadImg("brand/ironkin-wordmark-bone.svg")]).then(([s, w]) => { try { still.src = drawFlag(s, w).toDataURL(); } catch (e) {} });
  }
})();
