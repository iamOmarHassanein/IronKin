// IRONKIN v3: rail, lifted detail, bag, scroll reveals.
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const still = /[?&]still\b/.test(location.search);
  const reduced = still || matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) document.documentElement.classList.add("still");

  // ---------------------------------------------------------------- catalog
  const PRODUCTS = {
    hoodie: { name: "Signature Hoodie", colour: "Black / Cream", sizes: ["XS", "S", "M", "L", "XL", "XXL"], price: null },
    pant: { name: "Wide-Leg Pant", colour: "Black / Cream", sizes: ["XS", "S", "M", "L", "XL", "XXL"], price: null },
    comp: { name: "Compression Tee", colour: "Black / Cream", sizes: ["S", "M", "L", "XL", "XXL"], price: null },
    tee: { name: "Fitted Tee", colour: "Washed Rose / Oxblood", sizes: ["XS", "S", "M", "L", "XL"], price: null },
    flare: { name: "Flared Pant", colour: "Washed Rose / Oxblood", sizes: ["XS", "S", "M", "L", "XL"], price: null },
  };
  const ITEMS = [
    ["hoodie", "front", "hoodie-black", "top"], ["hoodie", "back", "hoodie-black", "top"],
    ["pant", "front", "pants-black", "bottom"], ["pant", "back", "pants-black", "bottom"],
    ["comp", "front", "compression-black", "top"], ["comp", "back", "compression-black", "top"],
    ["tee", "front", "tee-rose", "top"], ["tee", "back", "tee-rose", "top"],
    ["flare", "front", "flare-rose", "bottom"], ["flare", "back", "flare-rose", "bottom"],
  ].map(([pid, side, file, hanger]) => ({ pid, side, hanger, img: `media/p-${file}-${side}`, ...PRODUCTS[pid] }));
  const N = ITEMS.length;
  const price = (p) => (p.price == null ? "Price at launch" : `EGP ${p.price.toLocaleString("en-EG")}`);
  const two = (n) => String(n).padStart(2, "0");

  // Wooden hangers with brass hooks: a shoulder hanger for tops, a clip bar for bottoms.
  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="k-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A4630"/><stop offset=".55" stop-color="#3B2216"/><stop offset="1" stop-color="#1E100A"/></linearGradient>
    <linearGradient id="k-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E4E2C"/><stop offset=".45" stop-color="#F0D9AE"/><stop offset="1" stop-color="#5A3D20"/></linearGradient></defs></svg>`;
  const HOOK = '<path d="M100 30 V17 a8 8 0 1 1 8 -8" fill="none" stroke="url(#k-brass)" stroke-width="3.2" stroke-linecap="round"/>';
  const HANG = {
    top: `<svg viewBox="0 0 200 60" aria-hidden="true">${HOOK}<path d="M100 26 C 78 30 34 44 10 52 Q4 55 9 58 L191 58 Q196 55 190 52 C 166 44 122 30 100 26 Z" fill="url(#k-wood)"/></svg>`,
    bottom: `<svg viewBox="0 0 200 60" aria-hidden="true">${HOOK}<rect x="6" y="28" width="188" height="10" rx="2" fill="url(#k-wood)"/><rect x="22" y="36" width="12" height="22" rx="1.5" fill="url(#k-brass)"/><rect x="166" y="36" width="12" height="22" rx="1.5" fill="url(#k-brass)"/></svg>`,
  };
  // The garment body sits under the hanger so it can trail behind it; the sheen layer is masked to the
  // garment's own shape and carries the light and the shadow the hanger casts on the shoulders.
  const wHTML = (it, big) => { const src = `${it.img}${big ? "" : "-sm"}.webp`;
    return `<div class="w ${it.hanger}">${HANG[it.hanger]}<div class="body"><img src="${src}" alt="" draggable="false"><i class="sheen" style="--m:url('${new URL(src, location.href).href}')"></i></div></div>`; };

  // ---------------------------------------------------------------- band
  const seq = ["IRONKIN", "•", "COLLECTION 001", "•", "STRENGTH", "•", "JIU-JITSU", "•", "PADEL", "•"];
  $(".band-track").innerHTML = Array.from({ length: 12 }, () => seq.map((s) => `<span>${s}</span>`).join("")).join("");

  // ---------------------------------------------------------------- nav
  const nav = $("#nav"), hero = $(".hero");
  const navTone = () => nav.classList.toggle("dark", scrollY > hero.offsetHeight - 70);
  addEventListener("scroll", navTone, { passive: true }); navTone();

  // ---------------------------------------------------------------- bag
  const KEY = "ironkin-v3-bag";
  const bag = {
    read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } },
    write(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} renderBag(); },
    add(pid, size) { const l = bag.read(), h = l.find((x) => x.pid === pid && x.size === size); if (h) h.qty = Math.min(10, h.qty + 1); else l.push({ pid, size, qty: 1 }); bag.write(l); },
  };
  function renderBag() {
    const l = bag.read();
    $(".bag-n").textContent = l.reduce((n, x) => n + x.qty, 0);
    $(".bag-lines").innerHTML = l.length ? l.map((x, i) => {
      const p = PRODUCTS[x.pid], it = ITEMS.find((t) => t.pid === x.pid);
      return `<div class="line"><img src="${it.img}-sm.webp" alt=""><div><h3>${esc(p.name)}</h3><p>${esc(p.colour)} · Size ${x.size} · Qty ${x.qty}</p><p>${price(p)}</p></div><button type="button" data-rm="${i}">Remove</button></div>`;
    }).join("") : '<p class="bag-empty">Your bag is empty.</p>';
  }
  const drawer = $("#bag");
  let lastFocus = null;
  $(".bag-btn").addEventListener("click", () => { lastFocus = document.activeElement; drawer.hidden = false; document.body.classList.add("locked"); $("[data-close].close-btn", drawer).focus(); });
  const closeBag = () => { drawer.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus(); };
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeBag();
    const rm = e.target.closest("[data-rm]"); if (rm) { const l = bag.read(); l.splice(+rm.dataset.rm, 1); bag.write(l); }
  });
  addEventListener("storage", (e) => { if (e.key === KEY) renderBag(); });
  renderBag();

  // ---------------------------------------------------------------- rail
  const sec = $("#rail"), stage = $("#stage"), rack = $("#rack"), bar = $(".bar", rack), cap = $("#cap");
  rack.insertAdjacentHTML("beforebegin", DEFS);
  rack.insertAdjacentHTML("beforeend", ITEMS.map((it, k) => `<div class="g" data-k="${k}" role="button" tabindex="-1" aria-label="${esc(it.name)}, ${it.side}">${wHTML(it)}</div>`).join(""));
  const G = $$(".g", rack);
  let hov = -1, open = -1, W = 0, gw = 0, slot = 0, gap = 0;

  function size() {
    W = stage.clientWidth;
    gw = Math.max(150, Math.min(W * 0.19, 290)); slot = gw * 0.36; gap = gw * 0.32;
    sec.style.setProperty("--gw", gw + "px"); sec.style.setProperty("--gh", gw * 1.1 + "px");
    const half = ((N - 1) * slot) / 2 + gap + gw / 2 + 20;
    bar.style.left = -half + "px"; bar.style.width = half * 2 + "px"; bar.style.right = "auto";
    layout();
  }
  const baseX = (k) => (k - (N - 1) / 2) * slot;

  // ---- physics. Each hanger has a spring for its place on the rail, a spring for its turn
  // (slightly under-damped, so it settles with a soft overshoot like a real hanger on a hook),
  // and a pendulum that swings when its hook accelerates: when it slides, when the whole rail
  // glides, or when the pointer brushes past. The cloth body trails the swing a little.
  const RAD = 180 / Math.PI, SIDE = -74;
  const SP = { x: [95, 0.86], a: [70, 0.62], r: [48, 0.95] }; // [stiffness, damping ratio]
  const GRAV = 5200, SWING_DAMP = 3.4, MAX_TH = 0.12, COUPLE = 0.26; // COUPLE: how much of the hook's push reaches the cloth
  const S = G.map((g) => ({ g, w: g.firstElementChild, body: g.querySelector(".body"), x: 0, vx: 0, tx: 0, a: SIDE, va: 0, ta: SIDE, th: 0, vth: 0 }));
  const R = { x: 0, v: 0, t: 0 };
  const B = { w: null, body: null, a: 0, va: 0, ta: 0, th: 0, vth: 0 }; // the lifted piece
  const sp = (o, p, v, t, [k, z], dt) => { o[v] += (-k * (o[p] - t) - 2 * z * Math.sqrt(k) * o[v]) * dt; o[p] += o[v] * dt; };
  const pend = (o, acc, L, dt) => {
    o.vth += (-(GRAV / L) * Math.sin(o.th) - SWING_DAMP * o.vth - (COUPLE * acc / L) * Math.cos(o.th)) * dt;
    o.th = Math.max(-MAX_TH, Math.min(MAX_TH, o.th + o.vth * dt));
  };
  function draw(o, x) {
    const lag = Math.max(-5, Math.min(5, -o.vth * 4.2 - o.va * 0.012)); // cloth trails the hanger
    const face = Math.cos(o.a / RAD); // 1 facing you, about .28 edge-on
    o.w.style.transform = `rotateZ(${o.th * RAD}deg) rotateY(${o.a}deg)`;
    o.body.style.transform = `skewX(${lag}deg)`;
    o.w.style.setProperty("--dk", ((1 - face) * 0.5).toFixed(3));
    o.w.style.setProperty("--lx", (58 + o.a * 0.55 - o.th * RAD * 2.2).toFixed(1) + "%");
    if (x != null) o.g.style.transform = `translate3d(${x}px,0,0)`;
  }
  function sim(dt) {
    const rv = R.v; sp(R, "x", "v", R.t, SP.r, dt); const rAcc = (R.v - rv) / dt;
    const L = gw * 0.7;
    for (const s of S) {
      const v0 = s.vx; sp(s, "x", "vx", s.tx, SP.x, dt); sp(s, "a", "va", s.ta, SP.a, dt);
      pend(s, (s.vx - v0) / dt + rAcc, L, dt);
    }
    if (B.w) { sp(B, "a", "va", B.ta, SP.a, dt); pend(B, 0, L * 1.6, dt); }
  }
  const restful = (o) => Math.abs(o.vth) < 0.004 && Math.abs(o.th) < 0.002 && Math.abs(o.va) < 0.05 && Math.abs(o.a - o.ta) < 0.05;
  let raf = 0, last = 0;
  function tick(t) {
    // The frame timestamp can be earlier than the time kick() recorded, so clamp to a small positive step.
    const dt = Math.min(0.05, Math.max(0.001, (t - last) / 1000 || 0.016)); last = Math.max(last, t);
    for (let n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n; n > 0; n--) sim(h);
    rack.style.transform = `translate3d(${R.x}px,0,0)`;
    let calm = Math.abs(R.v) < 0.05 && Math.abs(R.x - R.t) < 0.05;
    for (const s of S) { draw(s, s.x); calm = calm && restful(s) && Math.abs(s.vx) < 0.05 && Math.abs(s.x - s.tx) < 0.05; }
    if (B.w) { draw(B); calm = calm && restful(B); }
    raf = calm ? 0 : requestAnimationFrame(tick);
  }
  function kick() {
    if (reduced) { // no motion: jump to rest
      R.x = R.t; R.v = 0; rack.style.transform = `translate3d(${R.x}px,0,0)`;
      for (const s of S) { Object.assign(s, { x: s.tx, vx: 0, a: s.ta, va: 0, th: 0, vth: 0 }); draw(s, s.x); }
      if (B.w) { Object.assign(B, { a: 0, va: 0, th: 0, vth: 0 }); draw(B); }
      return;
    }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  // The pointer brushing past a piece nudges it, in the direction the pointer travels.
  let px = null, pt = 0;
  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || open >= 0) return;
    const now = e.timeStamp, vx = px == null ? 0 : (e.clientX - px) / Math.max(8, now - pt) * 1000; px = e.clientX; pt = now;
    const g = e.target.closest(".g"); if (!g || reduced) return;
    const s = S[+g.dataset.k]; s.vth = Math.max(-1.4, Math.min(1.4, s.vth - vx * 0.00042)); kick();
  });
  // A soft settle when the rail first comes into view.
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { S.forEach((s, k) => (s.vth = (k % 2 ? -1 : 1) * (0.18 + 0.05 * (k % 3)))); kick(); o.disconnect(); } }, { threshold: 0.35 }).observe(stage);

  function layout() {
    G.forEach((g, k) => {
      S[k].tx = baseX(k) + (hov >= 0 && k !== hov ? Math.sign(k - hov) * gap : 0);
      S[k].ta = k === hov ? 0 : SIDE; g.classList.toggle("face", k === hov);
    });
    // When the rail is wider than the screen, keep the faced piece in view.
    const span = (N - 1) * slot + 2 * gap + gw + 60, room = Math.max(0, (span - W) / 2);
    const off = hov >= 0 ? Math.max(-room, Math.min(room, -baseX(hov))) : 0;
    R.t = W / 2 + off;
    if (!R.init) { R.init = true; R.x = R.t; S.forEach((s) => (s.x = s.tx)); }
    kick();
    if (hov >= 0) {
      const it = ITEMS[hov];
      cap.style.left = W / 2 + off + baseX(hov) + "px";
      cap.querySelector("b").textContent = `${it.name} · ${it.side}`;
      cap.querySelector("span").textContent = price(it);
      cap.classList.add("on");
    } else cap.classList.remove("on");
  }
  let ptr = "mouse";
  stage.addEventListener("pointerdown", (e) => { ptr = e.pointerType; swipe = { x: e.clientX, y: e.clientY }; });
  G.forEach((g, k) => {
    g.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && open < 0) { hov = k; layout(); } });
    g.addEventListener("click", () => { if (swiped) return; if (ptr === "mouse" || hov === k) openG(k); else { hov = k; layout(); } });
  });
  stage.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && open < 0) { hov = -1; layout(); } });
  // Touch swipe along the rail turns the next or previous piece.
  let swipe = null, swiped = false;
  stage.addEventListener("pointerup", (e) => {
    swiped = false; if (!swipe || e.pointerType === "mouse") return;
    const dx = e.clientX - swipe.x; swipe = null;
    if (Math.abs(dx) > 40 && open < 0) { swiped = true; hov = Math.max(0, Math.min(N - 1, (hov < 0 ? Math.floor(N / 2) : hov) - Math.sign(dx))); layout(); setTimeout(() => (swiped = false), 0); }
  });
  stage.addEventListener("keydown", (e) => {
    if (open >= 0) return;
    if (e.key === "ArrowRight") { e.preventDefault(); hov = Math.min(N - 1, hov + 1); layout(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); hov = hov < 0 ? N - 1 : Math.max(0, hov - 1); layout(); }
    else if (e.key === "Enter" && hov >= 0) { e.preventDefault(); openG(hov); }
  });

  // ---------------------------------------------------------------- lifted detail
  const det = $("#det"), big = $("#big"), big2 = $("#big2"), sizesEl = $("#sizes"), msg = $("#msg");
  const EASE = "cubic-bezier(.2,.8,.2,1)";
  let chosen = null;
  function placeBig() {
    const top = stage.offsetTop - 30, room = sec.clientHeight - top - 260;
    const bw = Math.max(200, Math.min(470, W * (W < 700 ? 0.66 : 0.34), room / 1.1));
    sec.style.setProperty("--bw", bw + "px"); sec.style.setProperty("--by", top + "px");
  }
  function fill(k) {
    const it = ITEMS[k];
    $("#num").textContent = `${two(k + 1)} / ${two(N)}`;
    $("#pname").textContent = it.name;
    $("#pmeta").textContent = `${it.colour} · ${it.side === "back" ? "Back view" : "Front view"} · ${price(it)}`;
    chosen = null; msg.textContent = ""; msg.className = "msg";
    sizesEl.innerHTML = it.sizes.map((s) => `<button class="sz" type="button" role="radio" aria-checked="false" data-s="${s}">${s}</button>`).join("");
  }
  sizesEl.addEventListener("click", (e) => { const b = e.target.closest(".sz"); if (!b) return; chosen = b.dataset.s; $$(".sz", sizesEl).forEach((x) => x.setAttribute("aria-checked", x === b)); msg.textContent = ""; });
  $("#add").addEventListener("click", () => {
    const it = ITEMS[open];
    if (!chosen) { msg.className = "msg err"; msg.textContent = "Choose a size first."; return; }
    bag.add(it.pid, chosen); msg.className = "msg"; msg.textContent = `Added: ${it.name}, size ${chosen}.`;
  });
  // Where the rail piece's hook sits relative to the big piece's hook, as a transform.
  function fromRail(k) {
    const g = G[k].getBoundingClientRect(), b = big.getBoundingClientRect();
    return `translate(${g.left + g.width / 2 - (b.left + b.width / 2)}px, ${g.top + g.height * 0.04 - (b.top + b.height * 0.04)}px) scale(${g.width / b.width})`;
  }
  // The lifted piece keeps hanging: it sways as it arrives and turns a little toward the pointer.
  function bindBig(v) { B.w = big.querySelector(".w"); B.body = big.querySelector(".body"); Object.assign(B, { a: 0, va: 0, ta: 0, th: 0, vth: reduced ? 0 : v }); draw(B); kick(); }
  det.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || open < 0 || !B.w || reduced) return;
    const r = big.getBoundingClientRect(), f = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
    B.ta = f * 14; B.vth -= (e.movementX || 0) * 0.0012; kick();
  });
  det.addEventListener("pointerleave", () => { B.ta = 0; kick(); });
  function openG(k) {
    if (open >= 0) return;
    open = k; hov = k; layout(); placeBig();
    big.getAnimations().forEach((a) => a.cancel());
    big.innerHTML = wHTML(ITEMS[k], true); fill(k); bindBig(0.42);
    sec.classList.add("open"); det.setAttribute("aria-hidden", "false");
    big.animate([{ transform: fromRail(k), opacity: 1 }, { transform: "none", opacity: 1 }], { duration: reduced ? 1 : 750, easing: EASE, fill: "forwards" });
    G[k].style.visibility = "hidden";
    setTimeout(() => $(".sz", sizesEl)?.focus({ preventScroll: true }), reduced ? 0 : 500);
  }
  function step(d) {
    if (open < 0) return;
    const from = open; open = (open + d + N) % N;
    fill(open); G[from].style.visibility = ""; G[open].style.visibility = "hidden"; hov = open; layout();
    big2.innerHTML = wHTML(ITEMS[from], true);
    big2.animate([{ transform: "none", opacity: 1, filter: "blur(0)" }, { transform: `translateX(${-d * 120}px) scale(.94)`, opacity: 0, filter: "blur(6px)" }], { duration: reduced ? 1 : 600, easing: EASE });
    big.getAnimations().forEach((a) => a.cancel());
    big.innerHTML = wHTML(ITEMS[open], true); bindBig(d * 0.6);
    big.animate([{ transform: `translateX(${d * 120}px) scale(.94)`, opacity: 0, filter: "blur(6px)" }, { transform: "none", opacity: 1, filter: "blur(0)" }], { duration: reduced ? 1 : 600, easing: EASE, fill: "forwards" });
  }
  function closeG() {
    if (open < 0) return;
    const k = open;
    big.getAnimations().forEach((a) => a.cancel());
    big.style.opacity = "1";
    const back = fromRail(k); big.style.opacity = "";
    big.animate([{ transform: "none", opacity: 1 }, { transform: back, opacity: 1 }], { duration: reduced ? 1 : 650, easing: EASE, fill: "forwards" });
    sec.classList.remove("open"); det.setAttribute("aria-hidden", "true");
    setTimeout(() => { G[k].style.visibility = ""; big.getAnimations().forEach((a) => a.cancel()); open = -1; hov = -1; B.w = null; layout(); stage.focus({ preventScroll: true }); }, reduced ? 0 : 650);
  }
  $("#prev").addEventListener("click", () => step(-1));
  $("#next").addEventListener("click", () => step(1));
  $("#close").addEventListener("click", closeG);
  $(".det-hit").addEventListener("click", closeG);
  addEventListener("keydown", (e) => {
    if (!drawer.hidden && e.key === "Escape") return closeBag();
    if (open < 0) return;
    if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "Escape") closeG();
  });
  // Discipline tiles lift their piece off the rail.
  $$("[data-open]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault(); const k = +a.dataset.open;
    if (open >= 0) closeG();
    sec.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    setTimeout(() => { hov = k; layout(); setTimeout(() => openG(k), reduced ? 0 : 500); }, reduced ? 0 : 750);
  }));
  if ("ResizeObserver" in window) new ResizeObserver(() => { size(); if (open >= 0) placeBig(); }).observe(stage); else addEventListener("resize", size);
  size();
  window.__rail = { openG, step, closeG, setHov(k) { hov = k; layout(); }, S, B, R, run(ms) { for (let i = 0; i < ms / 4; i++) sim(0.004); tick(performance.now()); } };

  // ---------------------------------------------------------------- scroll reveals
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.18 });
  $$(".disc-head, .reveal-clip, .tiles").forEach((el) => (reduced ? el.classList.add("in") : io.observe(el)));

  // Story words light up as the section scrolls past; the wide photo drifts.
  const words = $("#words");
  words.innerHTML = words.textContent.split(/\s+/).map((w) => `<span class="wd">${esc(w)}</span>`).join(" ");
  const wds = $$(".wd", words), wideImg = $(".wide img");
  let lastLit = -1, lastPar = "";
  function onScroll() {
    const vh = innerHeight;
    const r = words.getBoundingClientRect();
    const p = reduced ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const lit = Math.round(p * wds.length);
    if (lit !== lastLit) { lastLit = lit; wds.forEach((w, i) => w.classList.toggle("lit", i < lit)); }
    if (!reduced) {
      const wr = wideImg.closest(".wide").getBoundingClientRect();
      const t = `translateY(${(-((wr.top + wr.height / 2 - vh / 2) / vh) * 7 - 7).toFixed(2)}%)`;
      if (t !== lastPar) { wideImg.style.transform = lastPar = t; }
    }
  }
  addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();
})();
