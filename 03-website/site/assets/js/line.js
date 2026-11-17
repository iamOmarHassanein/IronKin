// The Line: Collection 001 as a queue. Walk it, line everyone up, call the one in front to the counter.
(function () {
  const C = window.IRONKIN;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // ?still settles every move at once (reduced motion, and for screenshots in tests).
  const still = /[?&]still\b/.test(location.search);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || still;
  if (still) document.documentElement.classList.add("ln-still");
  const coarse = window.matchMedia("(hover: none)").matches;
  const pad = (n) => String(n).padStart(2, "0");

  const live = C.products.filter((p) => !p.hidden && C.collections.some((c) => c.id === p.collection));
  const N = live.length;
  // Transparent cut-outs live next to the card images, as webp.
  const cut = (src) => "assets/img/line/" + src.split("/").pop().split("?")[0].replace(/\.jpg$/, ".webp");
  // Real-world garment length relative to a full-length trouser, so a hoodie stands shorter than pants.
  const heightOf = (id) => (/hoodie/.test(id) ? 0.8 : /tee/.test(id) ? 0.74 : 1);
  const kindOf = (id) => (/hoodie/.test(id) ? "Hoodie" : /pants/.test(id) ? "Pants" : /tee/.test(id) ? "Tee" : "Leggings");
  const TIMES = ["06:12", "06:31", "06:47", "07:05", "07:18", "07:32", "07:44", "07:58", "08:10"];
  const QUOTES = {
    "signature-hoodie-black": "First in line since before sunrise. Heavyweight, unbothered.",
    "wide-leg-pants-black": "Here for the wide leg. Not moving until the doors open.",
    "womens-fitted-tee-washed-rose": "Fitted, focused, already warmed up.",
    "womens-flared-leggings-washed-rose": "Flared out and ready for the first set.",
  };
  const sizeSel = {};
  const defaultSize = (p) => (p.sizes.includes("M") ? "M" : p.sizes[0]);
  const partner = (p) => live.find((q) => q.id === (p.completeTheSet || [])[0]);
  const priceText = (p) => (p.price ? esc(p.price) : "Price coming soon");

  const ln = $(".ln"), stage = $(".ln-stage"), crowd = $(".ln-crowd"), tickets = $(".ln-tickets"), panel = $(".ln-panel");
  const trackLine = $(".ln-track-line"), trackDash = $(".ln-track-dash"), loupe = $(".ln-loupe"), cursor = $(".ln-cursor");

  // ---------- Build the crowd ----------
  const items = live.map((p, i) => {
    const el = document.createElement("div");
    el.className = "ln-item";
    el.dataset.i = i;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${p.name}, position ${i + 1}`);
    el.innerHTML = `<span class="sh"></span><img src="${cut(p.images[0].src)}" alt="" draggable="false"><span class="view stub stub-sm">View</span>`;
    crowd.appendChild(el);
    const tk = document.createElement("button");
    tk.className = "stub stub-sm ln-ticket";
    tk.dataset.i = i;
    tk.textContent = pad(i + 1);
    tk.setAttribute("aria-label", `Select ${p.name}`);
    tickets.appendChild(tk);
    return { p, el, img: el.querySelector("img"), tk, x: 0, y: 0, s: 0.5, b: 8, o: 0, k: heightOf(p.id) };
  });

  // ---------- State ----------
  let mode = "line", p = 0, target = 0, cur = -1, sel = 0;
  let W = 1, H = 1, baseH = 1, boxW = 1, FX = 0, FY = 0, VX = 0, VY = 0;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let autoTimer = null, snapTimer = null;
  const ease = reduced ? 1 : 0.11;

  function measure() {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    const narrow = W < 640;
    baseH = H * (narrow ? 0.5 : 0.72);
    boxW = Math.min(W * (narrow ? 0.62 : 0.42), baseH * 0.95);
    FX = W * (narrow ? 0.68 : 0.6); FY = H * (narrow ? 0.8 : 0.94);
    VX = FX - W * (narrow ? 0.34 : 0.4); VY = FY - H * (narrow ? 0.26 : 0.32);
    items.forEach((it) => { it.el.style.setProperty("--w", boxW + "px"); it.el.style.setProperty("--h", baseH * it.k + "px"); });
    const ex = FX + (FX - VX) * 1.5, ey = FY + (FY - VY) * 1.5;
    trackLine.setAttribute("x1", VX - (FX - VX) * 0.15); trackLine.setAttribute("y1", VY - (FY - VY) * 0.15);
    trackLine.setAttribute("x2", ex); trackLine.setAttribute("y2", ey);
    const dy = lineupY() + 30;
    trackDash.setAttribute("x1", 0); trackDash.setAttribute("x2", W); trackDash.setAttribute("y1", dy); trackDash.setAttribute("y2", dy);
    items.forEach((it, i) => { it.tk.style.left = lineupX(i) + "px"; it.tk.style.top = dy + "px"; });
  }
  // Line-up spreads across the floor right of the copy column.
  const lineupX = (i) => (W < 640 ? W * (0.14 + 0.72 * (N > 1 ? i / (N - 1) : 0.5)) : W * (0.43 + 0.47 * (N > 1 ? i / (N - 1) : 0.5)));
  const lineupY = () => H * (W < 640 ? 0.74 : 0.8);

  // Where each item should be this frame.
  function targetOf(i) {
    if (mode === "lineup") {
      return { x: lineupX(i), y: lineupY() + Math.sin(i * 1.25) * H * 0.018, s: W < 640 ? 0.42 : 0.6, b: 0, o: 1, z: 50 };
    }
    if (mode === "counter") {
      if (i !== cur) return { x: i < cur ? W * 1.1 : VX, y: i < cur ? FY : VY, s: i < cur ? 1.4 : 0.3, b: 10, o: 0, z: 10 };
      return { x: W * (W < 900 ? 0.62 : 0.66), y: H * 0.985, s: (H * 0.9) / (baseH * items[i].k) > 1.35 ? 1.35 : (H * 0.9) / (baseH * items[i].k), b: 0, o: 1, z: 200 };
    }
    const d = i - p;
    if (d >= 0) {
      const k = Math.pow(0.72, d);
      return { x: FX - (FX - VX) * (1 - k), y: FY - (FY - VY) * (1 - k), s: k, b: Math.min(12, d * 3.4), o: Math.max(0, 1 - d * 0.13), z: 100 - Math.round(d * 10) };
    }
    const t = -d;
    return { x: FX + t * W * 0.5, y: FY + t * H * 0.04, s: 1 + t * 0.4, b: t * 9, o: Math.max(0, 1 - t * 1.5), z: 200 };
  }

  function frame() {
    p += (target - p) * (reduced ? 1 : 0.1);
    if (Math.abs(target - p) < 0.0005) p = target;
    mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
    for (let i = 0; i < N; i++) {
      const it = items[i], T = targetOf(i);
      it.x += (T.x - it.x) * ease; it.y += (T.y - it.y) * ease; it.s += (T.s - it.s) * ease; it.b += (T.b - it.b) * ease; it.o += (T.o - it.o) * ease;
      const par = reduced || mode === "counter" ? 0 : 1;
      const px = it.x + mx * 26 * it.s * par, py = it.y + my * 10 * it.s * par;
      const w = boxW, h = baseH * it.k;
      it.el.style.transform = `translate3d(${(px - w / 2).toFixed(1)}px, ${(py - h).toFixed(1)}px, 0) scale(${it.s.toFixed(4)})`;
      it.el.style.filter = it.b > 0.15 ? `blur(${it.b.toFixed(2)}px)` : "none";
      it.el.style.opacity = it.o.toFixed(3);
      it.el.style.zIndex = T.z;
      it.el.style.pointerEvents = it.o < 0.2 ? "none" : "auto";
    }
    const idx = mode === "lineup" ? sel : Math.round(Math.max(0, Math.min(N - 1, mode === "counter" ? cur : p)));
    if (idx !== cur || cur === -1) setCurrent(idx);
    requestAnimationFrame(frame);
  }

  // ---------- The one being served ----------
  const numBox = $(".ln-num"), nameEl = $(".ln-name");
  function setCurrent(i) {
    const prev = cur;
    cur = i;
    sel = i;
    const it = items[i], pr = it.p;
    rollNumber(pad(i + 1), prev < 0 ? 0 : i > prev ? 1 : -1);
    swapText(nameEl, pr.name);
    $(".ln-shop-no").textContent = `No. ${pad(i + 1)}`;
    $(".ln-hud-pos").textContent = `${pad(i + 1)} / ${pad(N)}`;
    $(".ln-hud-bar").style.setProperty("--p", (i + 1) / N);
    items.forEach((x, j) => { x.el.classList.toggle("sel", j === i); x.tk.classList.toggle("sel", j === i); });
    renderPanel(i);
    renderCounter(i);
  }
  function rollNumber(txt, dir) {
    const old = numBox.querySelector(".ln-num-cur");
    if (old && old.textContent === txt) return;
    const neu = document.createElement("span");
    neu.className = "ln-num-cur";
    neu.textContent = txt;
    if (!old || reduced || dir === 0) { numBox.innerHTML = ""; numBox.appendChild(neu); return; }
    old.classList.remove("ln-num-cur"); old.classList.add("out");
    numBox.appendChild(neu);
    const k = dir > 0 ? 1 : -1, opt = { duration: 650, easing: "cubic-bezier(.16,1,.3,1)" };
    old.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${-100 * k}%)`, opacity: 0 }], opt).onfinish = () => old.remove();
    neu.animate([{ transform: `translateY(${100 * k}%)` }, { transform: "translateY(0)" }], opt);
  }
  function swapText(el, txt) {
    if (el.textContent === txt) return;
    if (reduced) { el.textContent = txt; return; }
    el.animate([{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(6px)" }], { duration: 180, easing: "ease-in" }).onfinish = () => {
      el.textContent = txt;
      el.animate([{ opacity: 0, transform: "translateY(10px)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
    };
  }

  // ---------- Side panel ----------
  function sizeRow(pr) {
    sizeSel[pr.id] = sizeSel[pr.id] || defaultSize(pr);
    return `<div class="ln-sizes" role="group" aria-label="Size">${pr.sizes.map((s) =>
      `<button class="ln-size${s === sizeSel[pr.id] ? " on" : ""}" data-id="${pr.id}" data-size="${s}" aria-pressed="${s === sizeSel[pr.id]}">${s}</button>`).join("")}</div>`;
  }
  function renderPanel(i) {
    const pr = live[i], q = partner(pr), n = pad(i + 1);
    const back = pr.images[1];
    panel.innerHTML = `
      <article class="ln-card">
        <div class="ln-card-top"><span>${n} · 01/03</span><span>${kindOf(pr.id)}</span></div>
        <div class="ln-card-img"><img src="${cut(pr.images[0].src)}" alt="${esc(pr.images[0].alt)}"></div>
        ${sizeRow(pr)}
        <h3>${esc(pr.name)}</h3><p>${esc(pr.colour)}</p>
        <div class="ln-card-foot"><span class="ln-price">${priceText(pr)}</span><button class="stub ln-add" data-id="${pr.id}">Add</button></div>
      </article>
      ${back ? `<article class="ln-card">
        <div class="ln-card-top"><span>${n} · 02/03</span><span>Back</span></div>
        <div class="ln-card-img"><img src="${cut(back.src)}" alt="${esc(back.alt)}"></div>
        <span class="ln-card-note">Detail</span>
        <h3>${esc(pr.details[pr.details.length - 1])}</h3>
        <div class="ln-card-foot"><a class="ln-price" href="product.html?id=${pr.id}">Full details →</a></div>
      </article>` : ""}
      ${q ? `<article class="ln-card">
        <div class="ln-card-top"><span>${n} · 03/03</span><span>Complete the set</span></div>
        <div class="ln-card-img"><img src="${cut(q.images[0].src)}" alt="${esc(q.images[0].alt)}"></div>
        ${sizeRow(q)}
        <h3>${esc(q.name)}</h3><p>${esc(q.colour)}</p>
        <div class="ln-card-foot"><span class="ln-price">${priceText(q)}</span><button class="stub ln-add" data-id="${q.id}">Add</button></div>
      </article>` : ""}`;
  }
  panel.addEventListener("click", (e) => {
    const s = e.target.closest(".ln-size");
    if (s) {
      sizeSel[s.dataset.id] = s.dataset.size;
      panel.querySelectorAll(`.ln-size[data-id="${s.dataset.id}"]`).forEach((b) => { const on = b === s; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      return;
    }
    const a = e.target.closest(".ln-add");
    if (a) add([a.dataset.id], a);
  });
  function add(ids, btn) {
    ids.forEach((id) => window.IK && window.IK.addToBag(id, sizeSel[id] || defaultSize(live.find((x) => x.id === id))));
    if (!btn) return;
    const was = btn.textContent;
    btn.classList.add("added"); btn.textContent = "Added ✓";
    clearTimeout(btn._t); btn._t = setTimeout(() => { btn.classList.remove("added"); btn.textContent = was; }, 1400);
  }

  // ---------- Counter ----------
  function renderCounter(i) {
    const pr = live[i], q = partner(pr);
    $(".ln-quote").textContent = QUOTES[pr.id] || pr.summary;
    $(".ln-receipt").innerHTML = [
      ["In line since", TIMES[i]], ["Position", `${pad(i + 1)} of ${pad(N)}`], ["Colour", pr.colour],
      ["Pieces in set", q ? "02" : "01"], ["Set total", pr.price ? esc(pr.price) : "Coming soon"],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
    $(".ln-addset").textContent = q ? `Add full set · ${q ? 2 : 1} pieces` : "Add to bag";
  }
  $(".ln-addset").addEventListener("click", (e) => { const pr = live[cur], q = partner(pr); add(q ? [pr.id, q.id] : [pr.id], e.currentTarget); });
  $(".ln-prev").addEventListener("click", () => go(cur - 1, true));
  $(".ln-next").addEventListener("click", () => go(cur + 1, true));
  $(".ln-back").addEventListener("click", () => setMode("line"));
  $(".ln-shop").addEventListener("click", () => setMode("counter"));

  // ---------- Modes and movement ----------
  function setMode(m) {
    if (m === mode) return;
    stopAuto();
    if (m === "line") target = p = cur;
    // The counter always serves whoever is in front right now, even if no frame has run since the last move.
    if (m === "counter") { const front = mode === "lineup" ? sel : Math.max(0, Math.min(N - 1, Math.round(target))); target = p = front; if (front !== cur) setCurrent(front); }
    mode = m;
    ln.dataset.mode = m;
    document.querySelectorAll(".ln-switch .stub").forEach((b) => { const on = b.dataset.mode === m || (m === "counter" && b.dataset.mode === "line"); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    loupe.classList.remove("on");
    touched();
  }
  function go(i, wrap) {
    if (wrap) i = (i + N) % N;
    i = Math.max(0, Math.min(N - 1, i));
    if (mode === "counter") { target = p = i; if (i !== cur) setCurrent(i); return; }
    if (mode === "lineup") { sel = i; return; }
    target = i;
  }

  document.querySelectorAll(".ln-switch .stub").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  tickets.addEventListener("click", (e) => { const t = e.target.closest(".ln-ticket"); if (t) { sel = +t.dataset.i; setMode("line"); target = p = sel; } });

  // Wheel / trackpad: scroll walks the line; at either end the page scrolls normally.
  stage.addEventListener("wheel", (e) => {
    if (mode !== "line") return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const atEnd = (d > 0 && Math.round(target) >= N - 1) || (d < 0 && Math.round(target) <= 0);
    if (atEnd && Math.abs(target - Math.round(target)) < 0.05) return;
    e.preventDefault();
    stopAuto(); touched();
    target = Math.max(-0.3, Math.min(N - 0.7, target + d / 340));
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => { target = Math.max(0, Math.min(N - 1, Math.round(target))); }, 140);
  }, { passive: false });

  // Drag / swipe
  let drag = null;
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest("button, a, .ln-panel")) return;
    drag = { x: e.clientX, y: e.clientY, t: target, moved: false, id: e.pointerId };
  });
  window.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    tmx = ((e.clientX - r.left) / r.width - 0.5) * 2; tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    stage.style.setProperty("--gx", ((e.clientX - r.left) / r.width) * 100 + "%");
    stage.style.setProperty("--gy", ((e.clientY - r.top) / r.height) * 100 + "%");
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) { drag.moved = true; stage.classList.add("dragging"); stopAuto(); touched(); }
    if (drag.moved && mode === "line") target = Math.max(-0.3, Math.min(N - 0.7, drag.t - dx / (W * 0.22)));
  });
  window.addEventListener("pointerup", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const wasDrag = drag.moved;
    drag = null; stage.classList.remove("dragging");
    if (wasDrag) { target = Math.max(0, Math.min(N - 1, Math.round(target))); return; }
    const hit = e.target.closest && e.target.closest(".ln-item");
    if (!hit) return;
    const i = +hit.dataset.i;
    touched();
    if (mode === "lineup") { sel = i; setMode("line"); target = p = i; return; }
    if (mode === "line") { if (i === cur) setMode("counter"); else { stopAuto(); target = i; } }
  });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("input, textarea, .bag-panel")) return;
    if (!document.querySelector(".bag-panel")?.hidden) return;
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") { if (stage.contains(document.activeElement) || document.activeElement === document.body) { e.preventDefault(); stopAuto(); touched(); go(cur + 1, mode === "counter"); } }
    else if (k === "ArrowLeft" || k === "ArrowUp") { if (stage.contains(document.activeElement) || document.activeElement === document.body) { e.preventDefault(); stopAuto(); touched(); go(cur - 1, mode === "counter"); } }
    else if (k === "Enter" && document.activeElement === stage && mode === "line") setMode("counter");
    else if (k === "Escape" && mode !== "line") setMode("line");
  });

  // Autoplay
  const autoBtn = $(".ln-auto");
  function startAuto() {
    if (reduced) return;
    autoBtn.classList.add("on"); autoBtn.setAttribute("aria-label", "Pause the line");
    clearInterval(autoTimer);
    autoTimer = setInterval(() => { if (mode === "line") target = (Math.round(target) + 1) % N; }, 3400);
  }
  function stopAuto() { clearInterval(autoTimer); autoTimer = null; autoBtn.classList.remove("on"); autoBtn.setAttribute("aria-label", "Play the line"); }
  autoBtn.addEventListener("click", () => (autoTimer ? stopAuto() : startAuto()));
  function touched() { ln.classList.add("touched"); }

  // ---------- Loupe (counter only) ----------
  stage.addEventListener("pointermove", (e) => {
    if (mode !== "counter" || coarse) { loupe.classList.remove("on"); return; }
    const it = items[cur], img = it.img, r = img.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    if (!img.naturalWidth) return;
    // object-fit: contain, anchored bottom-centre: find the drawn picture inside the box.
    const a = img.naturalWidth / img.naturalHeight;
    let dw = r.width, dh = r.width / a;
    if (dh > r.height) { dh = r.height; dw = r.height * a; }
    const dx0 = r.left + (r.width - dw) / 2, dy0 = r.bottom - dh;
    const lx = e.clientX - dx0, ly = e.clientY - dy0;
    if (lx < 0 || ly < 0 || lx > dw || ly > dh) { loupe.classList.remove("on"); return; }
    const Z = 2, R = 95;
    loupe.style.left = e.clientX - sr.left + "px"; loupe.style.top = e.clientY - sr.top + "px";
    loupe.style.backgroundImage = `url("${img.src}")`;
    loupe.style.backgroundSize = `${dw * Z}px ${dh * Z}px`;
    loupe.style.backgroundPosition = `${-(lx * Z - R)}px ${-(ly * Z - R)}px`;
    loupe.classList.add("on");
  });
  stage.addEventListener("pointerleave", () => { loupe.classList.remove("on"); cursor.classList.remove("on"); });

  // ---------- Cursor ----------
  if (!coarse && !reduced) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    const label = cursor.querySelector("span");
    stage.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("on");
      const it = e.target.closest(".ln-item"), btn = e.target.closest("button, a");
      const big = !!it && !btn && mode !== "counter";
      cursor.classList.toggle("big", big);
      label.textContent = big ? (mode === "lineup" ? "View" : +it.dataset.i === cur ? "Shop" : "Call") : "";
      cursor.style.opacity = btn || mode === "counter" ? "0" : "";
    });
    (function loop() { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); })();
  }

  // ---------- Go ----------
  // The stage changes size after load (fonts, scrollbar), not only on window resize.
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(stage); else window.addEventListener("resize", measure);
  measure();
  items.forEach((it, i) => { const T = targetOf(i); Object.assign(it, { x: T.x + W * 0.25, y: T.y, s: T.s, b: 14, o: 0 }); });
  requestAnimationFrame(frame);
})();
