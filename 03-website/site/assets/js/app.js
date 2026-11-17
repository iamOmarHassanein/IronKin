// IRONKIN Collection 001: shared shell, cart and page modules.
(function () {
  "use strict";
  const D = window.IK_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // ?still settles every move at once (used for screenshots in tests); reduced motion does the same.
  const still = /[?&]still\b/.test(location.search);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || still;
  if (still) document.documentElement.classList.add("still");
  const page = document.body.dataset.page;
  const P = (id) => D.products.find((p) => p.id === id);
  const media = (n) => `media/${n}.webp`;
  const cutSet = (n) => `media/${n}-sm.webp 420w, media/${n}.webp 1100w`;
  const money = (v) => (v == null ? null : `${D.currency} ${Number(v).toLocaleString("en-EG")}`);
  const ARROW = '<svg class="arr" viewBox="0 0 24 14" aria-hidden="true"><path d="M1 7h21M16 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>';
  const CHEV_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const CHEV_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  // ================================================================ cart (kept in this browser)
  const KEY = "ironkin-cart";
  const cart = {
    read() { try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter((l) => P(l.id)); } catch { return []; } },
    write(lines) { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {} renderCart(); updateCount(true); },
    add(id, size, qty = 1) {
      const lines = cart.read(); const hit = lines.find((l) => l.id === id && l.size === size);
      if (hit) hit.qty = Math.min(10, hit.qty + qty); else lines.push({ id, size, qty });
      cart.write(lines);
    },
    count() { return cart.read().reduce((n, l) => n + l.qty, 0); },
    subtotal() { const lines = cart.read(); return lines.some((l) => P(l.id).price == null) ? null : lines.reduce((s, l) => s + P(l.id).price * l.qty, 0); },
  };
  window.addEventListener("storage", (e) => { if (e.key === KEY) { renderCart(); updateCount(); } });

  // ================================================================ shell
  function shell() {
    const nav = [["collection.html", "Collection 001", "collection"], ["campaign.html", "Campaign", "campaign"]];
    const here = (k) => k === page || (k === "collection" && (page === "product" || page === "home")) || (k === "campaign" && page === "look");
    document.body.insertAdjacentHTML("afterbegin", `
<a class="skip" href="#main">Skip to content</a>
<header class="hdr"><div class="hdr-in">
  <a class="logo" href="index.html" aria-label="IRONKIN home"><img class="sym" src="assets/brand/ironkin-symbol-bone.svg" alt="" width="58" height="31"><img class="wm" src="assets/brand/ironkin-wordmark-bone.svg" alt="IRONKIN" width="140" height="24"></a>
  <nav class="nav" id="nav" aria-label="Main">${nav.map(([h, l, k]) => `<a href="${h}"${here(k) ? ' aria-current="page"' : ""}>${l}</a>`).join("")}<a class="nav-extra" href="story.html"${page === "story" ? ' aria-current="page"' : ""}>Our Story</a></nav>
  <div class="hdr-end">
    <button class="cart-btn" type="button" aria-haspopup="dialog">Bag (<span class="cart-count">0</span>)<span class="sr cart-sr"></span></button>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span></button>
  </div>
</div></header>`);
    document.body.insertAdjacentHTML("beforeend", `
<footer class="ftr">
  <a href="collection.html">Collection 001</a><a href="campaign.html">Campaign</a><a href="story.html">Our Story</a>
  <a href="info.html#contact">Contact</a><a href="info.html#shipping">Shipping &amp; Returns</a><a href="info.html#privacy">Privacy</a>
  <small>© IRONKIN · Egyptian sportswear</small>
</footer>
<div class="drawer" id="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title" hidden>
  <div class="drawer-scrim" data-close></div>
  <aside class="drawer-sheet">
    <div class="drawer-head"><h2 class="head" id="cart-title">Your cart</h2><button class="x-btn" data-close aria-label="Close cart">${X}</button></div>
    <div class="drawer-body cart-lines"></div>
    <div class="drawer-foot cart-foot"></div>
  </aside>
</div>
<div class="toast" role="status" aria-live="polite"></div>`);
    const menu = $(".menu-btn"), navEl = $("#nav");
    menu.addEventListener("click", () => { const o = menu.getAttribute("aria-expanded") !== "true"; menu.setAttribute("aria-expanded", o); navEl.classList.toggle("open", o); });
    $(".cart-btn").addEventListener("click", () => openDrawer($("#cart")));
    const dr = $("#cart");
    dr.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) return closeDrawer(dr);
      const q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
      if (q || rm) {
        const lines = cart.read(), i = +(q || rm).dataset.i;
        if (rm) lines.splice(i, 1); else { lines[i].qty = Math.max(0, Math.min(10, lines[i].qty + +q.dataset.q)); if (!lines[i].qty) lines.splice(i, 1); }
        cart.write(lines);
      }
    });
    dr.addEventListener("change", (e) => {
      const s = e.target.closest("[data-size]"); if (!s) return;
      const lines = cart.read(), i = +s.dataset.i; lines[i].size = s.value;
      // Merge with an existing line of the same size.
      const dup = lines.findIndex((l, j) => j !== i && l.id === lines[i].id && l.size === s.value);
      if (dup > -1) { lines[dup].qty = Math.min(10, lines[dup].qty + lines[i].qty); lines.splice(i, 1); }
      cart.write(lines);
    });
    renderCart(); updateCount();
  }

  let lastFocus = null;
  function openDrawer(d) { lastFocus = document.activeElement; d.hidden = false; document.body.classList.add("locked"); const f = d.querySelector(".x-btn"); f && f.focus(); }
  function closeDrawer(d) { d.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus(); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".drawer:not([hidden])").forEach(closeDrawer); });

  function updateCount(bump) {
    const n = cart.count(), el = $(".cart-count");
    if (!el) return;
    el.textContent = n;
    $(".cart-sr").textContent = `, ${n} item${n === 1 ? "" : "s"}`;
    if (bump && !reduced) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  }
  function renderCart() {
    const box = $(".cart-lines"); if (!box) return;
    const lines = cart.read();
    box.innerHTML = lines.length ? lines.map((l, i) => {
      const p = P(l.id);
      const opts = p.sizes.map((s) => `<option${s === l.size ? " selected" : ""}${p.soldOut.includes(s) && s !== l.size ? " disabled" : ""}>${s}</option>`).join("");
      return `<div class="line-item">
        <a class="li-img" href="product.html?id=${p.id}"><img src="media/${p.cut}-sm.webp" alt="" loading="lazy"></a>
        <div><a class="li-name" href="product.html?id=${p.id}">${esc(p.name)}</a><p class="li-sub">Collection 001 · ${esc(p.colour)}</p>
          <label class="field-lbl" for="sz${i}">Size</label><select class="select" id="sz${i}" data-size data-i="${i}">${opts}</select>
          <span class="field-lbl">Quantity</span>
          <div class="qty"><button data-q="-1" data-i="${i}" aria-label="Decrease quantity">−</button><span aria-live="polite">${l.qty}</span><button data-q="1" data-i="${i}" aria-label="Increase quantity">+</button></div><br>
          <button class="rm" data-rm data-i="${i}">Remove</button>
          ${p.price != null ? `<p class="li-sub" style="margin-top:8px">${money(p.price * l.qty)}</p>` : ""}
        </div></div>`;
    }).join("") : '<p class="cart-empty">Your cart is empty. <a href="collection.html">Shop Collection 001</a>.</p>';
    const sub = cart.subtotal();
    $(".cart-foot").innerHTML = lines.length ? `<div class="sum-row"><span>Subtotal</span><span>${sub == null ? "—" : money(sub)}</span></div>
      ${sub == null ? '<p class="guide-note" style="margin:-6px 0 14px">Prices are set at launch.</p>' : ""}
      <a class="btn btn-block" href="checkout.html">Checkout</a>` : "";
  }
  function toast(msg) { const t = $(".toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400); }

  // ================================================================ size ruler
  function ruler(p, opts = {}) {
    return `<div class="ruler${opts.light ? " light" : ""}" role="radiogroup" aria-label="Size for ${esc(p.name)}" data-id="${p.id}">${p.sizes.map((s) => {
      const off = p.soldOut.includes(s);
      return `<button type="button" class="sz" role="radio" aria-checked="false" data-size="${s}"${off ? ` disabled aria-label="${s}, out of stock"` : ` aria-label="${s}"`}><span>${s}</span></button>`;
    }).join("")}</div>`;
  }
  // Selection, arrow-key movement within the group.
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".ruler .sz"); if (!b || b.disabled) return;
    const r = b.closest(".ruler");
    $$(".sz", r).forEach((x) => { x.setAttribute("aria-checked", x === b); x.tabIndex = x === b ? 0 : -1; });
    r.dataset.sel = b.dataset.size;
    r.dispatchEvent(new CustomEvent("size", { bubbles: true, detail: b.dataset.size }));
  });
  document.addEventListener("keydown", (e) => {
    const b = e.target.closest && e.target.closest(".ruler .sz"); if (!b || !/Arrow(Left|Right)/.test(e.key)) return;
    e.preventDefault();
    const all = $$(".sz:not(:disabled)", b.closest(".ruler")); const i = all.indexOf(b);
    const n = all[(i + (e.key === "ArrowRight" ? 1 : -1) + all.length) % all.length]; n.focus(); n.click();
  });

  // ================================================================ SHOP THE LOOK (look.html)
  function look() {
    const looks = D.looks, N = looks.length;
    const q = new URLSearchParams(location.search).get("look");
    const start = Math.max(0, looks.findIndex((l) => l.id === q));
    $("#main").innerHTML = `
<section class="home" aria-label="Shop the look">
  <div class="stage" tabindex="0" aria-roledescription="carousel" aria-label="Looks. Use the left and right arrow keys to change look.">
    <div class="floor" aria-hidden="true"></div>
    <div class="light-strip" aria-hidden="true"></div>
    <h1 class="head stage-title">Collection 001</h1>
    <div class="looks">${looks.map((l, i) => `
      <div class="look" data-i="${i}" role="group" aria-roledescription="slide" aria-label="${esc(l.name)}">
        <div class="fig"><span class="shadow"></span>
          ${l.bottom ? `<img class="bot" src="${media(l.bottom)}" srcset="${cutSet(l.bottom)}" sizes="30vw" alt="">` : ""}
          <img class="top" src="${media(l.top)}" srcset="${cutSet(l.top)}" sizes="30vw" alt="">
        </div>
      </div>`).join("")}</div>
    <button class="icon-btn round stage-arrow prev" aria-label="Previous look">${CHEV_L}</button>
    <button class="icon-btn round stage-arrow next" aria-label="Next look">${CHEV_R}</button>
    <div class="stage-bar">
      <div class="tabs" role="tablist" aria-label="Looks">${looks.map((l, i) => `<button class="tab" role="tab" id="tab-${l.id}" aria-controls="shop" aria-selected="false" data-i="${i}">${esc(l.name)}</button>`).join("")}</div>
      <button class="btn shop-look">Shop the look ${ARROW}</button>
    </div>
  </div>
  <aside class="panel" id="shop" role="tabpanel" aria-live="polite"></aside>
</section>`;

    const stage = $(".stage"), panel = $("#shop");
    const L = $$(".look", stage).map((el, i) => ({ el, fig: $(".fig", el), top: $(".top", el), bot: $(".bot", el), look: looks[i], w: 100, h: 100, x: 0, s: 0.7, b: 0, o: 1 }));
    let W = 1, H = 1, p = start, target = start, cur = -1;

    const wrap = (d) => { d = ((d % N) + N) % N; return d >= N / 2 ? d - N : d; };
    // y of the light strip at x (it is rotated -1.6deg around the stage centre).
    const TAN = Math.tan((1.6 * Math.PI) / 180);
    const lineY = (x) => H * 0.70 + 3 - (x - W / 2) * TAN;

    function layoutFigures() {
      const r = stage.getBoundingClientRect(); W = r.width; H = r.height;
      const FH = H * (W < 600 ? 0.5 : 0.56);
      L.forEach((it) => {
        const t = it.top, b = it.bot, l = it.look;
        if (!t.naturalWidth || (b && !b.naturalWidth)) return;
        const tA = t.naturalWidth / t.naturalHeight;
        let bw = 0, bh = 0, tw, th, tBottom;
        if (b) {
          const bA = b.naturalWidth / b.naturalHeight;
          bh = 1; bw = bA; tw = bw * l.topW; th = tw / tA;
          const overlap = 0.1, total = bh + th - overlap, k = FH / total;
          bh *= k; bw *= k; tw *= k; th *= k; tBottom = bh - overlap * k;
        } else {
          th = FH * 0.5; tw = th * tA; tBottom = FH * 0.46;
        }
        const boxW = Math.max(bw, tw);
        it.w = boxW; it.h = FH;
        it.el.style.width = boxW + "px"; it.el.style.height = FH + "px";
        if (b) Object.assign(b.style, { width: bw + "px", height: bh + "px", bottom: "0px" });
        Object.assign(t.style, { width: tw + "px", height: th + "px", bottom: tBottom + "px" });
      });
    }

    function frame() {
      p += (target - p) * (reduced ? 1 : 0.12);
      if (Math.abs(target - p) < 0.0005) p = target;
      L.forEach((it, i) => {
        const d = wrap(i - p), a = Math.min(1, Math.abs(d));
        const x = W / 2 + d * W * (W < 600 ? 0.42 : 0.31);
        const s = 1 - 0.32 * a;
        const op = Math.abs(d) > 1.15 ? Math.max(0, 1 - (Math.abs(d) - 1.15) * 3) : 1;
        const tf = `translate3d(${(x - it.w / 2).toFixed(1)}px, ${(lineY(x) - it.h).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
        const fl = a > 0.02 ? `brightness(${(1 - 0.4 * a).toFixed(2)}) blur(${(1.6 * a).toFixed(1)}px)` : "none";
        // Write only on change: idle frames cost nothing.
        if (tf !== it.tf) { it.el.style.transform = it.tf = tf; }
        if (fl !== it.fl) { it.el.style.filter = it.fl = fl; }
        const o = op.toFixed(2); if (o !== it.op) { it.el.style.opacity = it.op = o; }
        const z = 10 - Math.round(Math.abs(d) * 3); if (z !== it.z) { it.el.style.zIndex = it.z = z; }
      });
      const idx = ((Math.round(p) % N) + N) % N;
      if (idx !== cur) setLook(idx);
      requestAnimationFrame(frame);
    }

    function setLook(i) {
      cur = i;
      $$(".tab", stage).forEach((t, j) => { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1; });
      panel.setAttribute("aria-labelledby", "tab-" + looks[i].id);
      const l = looks[i];
      panel.innerHTML = `<h2>Shop the look</h2><p class="look-name">${esc(l.name)}</p>${l.products.map((id) => {
        const pr = P(id);
        return `<div class="pl-item" data-id="${id}">
          <a class="pl-img" href="product.html?id=${id}" tabindex="-1" aria-hidden="true"><img src="media/${pr.cut}-sm.webp" alt=""></a>
          <a class="pl-name" href="product.html?id=${id}">${esc(pr.name)}</a>
          <div class="pl-row">${ruler(pr, { light: true })}<button class="btn btn-sm pl-add" data-id="${id}">Add</button></div>
          <p class="pl-msg" aria-live="polite"></p>
        </div>`;
      }).join("")}<p class="pl-note">${l.products.map((id) => money(P(id).price)).every((v) => v) ? "" : "Prices are set at launch."}</p>`;
    }

    panel.addEventListener("click", (e) => {
      const a = e.target.closest(".pl-add"); if (!a) return;
      const item = a.closest(".pl-item"), r = $(".ruler", item), msg = $(".pl-msg", item), pr = P(a.dataset.id);
      if (!r.dataset.sel) { msg.className = "pl-msg err"; msg.textContent = "Choose a size first."; r.classList.remove("shake"); void r.offsetWidth; r.classList.add("shake"); $(".sz:not(:disabled)", r).focus(); return; }
      cart.add(pr.id, r.dataset.sel);
      msg.className = "pl-msg"; msg.textContent = `Added: ${pr.name}, size ${r.dataset.sel}.`;
      toast(`${pr.name} (${r.dataset.sel}) added to cart`);
    });

    const go = (i) => { target = p + wrap(i - p); };
    const step = (n) => { target = Math.round(target) + n; };
    $(".prev", stage).addEventListener("click", () => step(-1));
    $(".next", stage).addEventListener("click", () => step(1));
    $$(".tab", stage).forEach((t) => t.addEventListener("click", () => go(+t.dataset.i)));
    $(".tabs", stage).addEventListener("keydown", (e) => {
      if (!/Arrow(Left|Right)/.test(e.key)) return; e.preventDefault(); e.stopPropagation();
      const n = (cur + (e.key === "ArrowRight" ? 1 : -1) + N) % N; go(n); $$(".tab", stage)[n].focus();
    });
    stage.addEventListener("keydown", (e) => {
      if (e.target !== stage) return;
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
    $(".shop-look", stage).addEventListener("click", () => {
      if (innerWidth <= 1080) panel.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      const f = $(".sz:not(:disabled)", panel); f && f.focus({ preventScroll: innerWidth > 1080 });
    });

    // Horizontal trackpad scrolling only; vertical scrolling stays with the page.
    let snapT = null, acc = 0;
    stage.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      acc += e.deltaX;
      target = Math.round(p) + Math.max(-0.45, Math.min(0.45, acc / 600));
      clearTimeout(snapT);
      snapT = setTimeout(() => { target = Math.round(p) + (Math.abs(acc) > 60 ? Math.sign(acc) : 0); acc = 0; }, 120);
    }, { passive: false });

    // Mouse drag and touch swipe.
    let drag = null;
    stage.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button")) return;
      drag = { x: e.clientX, y: e.clientY, t: target, moved: false, id: e.pointerId, lastX: e.clientX, lastT: performance.now(), v: 0 };
    });
    stage.addEventListener("pointermove", (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved) { if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { drag.moved = true; stage.classList.add("dragging"); stage.setPointerCapture(e.pointerId); } else return; }
      const now = performance.now(); drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.lastT); drag.lastX = e.clientX; drag.lastT = now;
      target = drag.t - dx / (W * 0.31);
    });
    const end = (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const d = drag; drag = null; stage.classList.remove("dragging");
      if (d.moved) {
        const dx = e.clientX - d.x, flick = Math.abs(d.v) > 0.45 ? -Math.sign(d.v) : 0;
        const base = d.t + (Math.abs(dx) > W * 0.08 ? -Math.sign(dx) : 0);
        target = Math.round(Math.abs(dx) > W * 0.08 ? base : d.t + flick);
        return;
      }
      const hit = e.target.closest(".look");
      if (hit && +hit.dataset.i !== cur) go(+hit.dataset.i);
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", (e) => { if (drag && drag.id === e.pointerId) { drag = null; stage.classList.remove("dragging"); target = Math.round(target); } });

    const relayout = () => layoutFigures();
    $$("img", stage).forEach((im) => im.complete ? 0 : im.addEventListener("load", relayout));
    if ("ResizeObserver" in window) new ResizeObserver(relayout).observe(stage); else addEventListener("resize", relayout);
    layoutFigures();
    requestAnimationFrame(frame);
  }

  // ================================================================ COLLECTION RAIL (Home and Collection)
  const HOOK = (y) => `<path d="M100 ${y} V17 a8 8 0 1 1 8 -8" fill="none" stroke="url(#ik-brass)" stroke-width="3" stroke-linecap="round"/>`;
  const HANGER_TOP = `<svg class="hanger" viewBox="0 0 200 60" aria-hidden="true">${HOOK(30)}
    <path d="M100 26 C 78 30 34 44 10 52 Q4 55 9 58 L191 58 Q196 55 190 52 C 166 44 122 30 100 26 Z" fill="url(#ik-wood)"/>
    <path d="M14 53 C 40 45 80 33 100 29 C 120 33 160 45 186 53" fill="none" stroke="rgba(255,220,180,.18)" stroke-width="1.2"/></svg>`;
  const HANGER_BOTTOM = `<svg class="hanger" viewBox="0 0 200 60" aria-hidden="true">${HOOK(30)}
    <rect x="6" y="28" width="188" height="10" rx="2" fill="url(#ik-wood)"/>
    <rect x="22" y="36" width="12" height="24" rx="1.5" fill="url(#ik-brass)"/><rect x="166" y="36" width="12" height="24" rx="1.5" fill="url(#ik-brass)"/></svg>`;
  const SVG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="ik-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A3A26"/><stop offset=".5" stop-color="#3A2216"/><stop offset="1" stop-color="#1E100A"/></linearGradient>
    <linearGradient id="ik-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E4E2C"/><stop offset=".45" stop-color="#C9A06A"/><stop offset="1" stop-color="#5A3D20"/></linearGradient></defs></svg>`;

  function rail(heading) {
    return `${SVG_DEFS}
<section class="rail-sec" id="collection" aria-label="Collection 001">
  <div class="rail-top"><${heading} class="head">Collection 001</${heading}><p>Drag to browse</p></div>
  <div class="rail-wrap" tabindex="0" aria-label="Garment rail. Use the left and right arrow keys to browse.">
    <div class="rod" aria-hidden="true"><i class="cap l"></i><i class="cap r"></i></div>
    <div class="rail-track">${D.rail.map((it, i) => `
      <div class="hang" data-i="${i}" data-href="product.html?id=${it.link}">
        <div class="hang-pieces">${it.pieces.map((pc) => { const p = P(pc.id); return `
          <div class="piece ${p.hanger}" style="--h:${pc.h};--r:${pc.r}">
            <div class="swing">${p.hanger === "top" ? HANGER_TOP : HANGER_BOTTOM}
              <img src="${media(p.cut)}" srcset="${cutSet(p.cut)}" sizes="(max-width: 860px) 50vw, 26vw" alt="${esc(p.name)}, ${esc(p.colour)}" draggable="false"></div>
          </div>`; }).join("")}</div>
        <a class="hang-name" href="product.html?id=${it.link}">${esc(it.name)}</a>
      </div>`).join("")}</div>
  </div>
  <div class="rail-ctrl">
    <button class="rc-btn rail-prev" type="button" aria-label="Previous garment"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>
    <div class="rc-track" aria-hidden="true"><span class="rc-thumb"></span></div>
    <button class="rc-btn rail-next" type="button" aria-label="Next garment"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>
  </div>
</section>`;
  }

  function railInit() {
    const wrapEl = $(".rail-wrap"), track = $(".rail-track"), hangs = $$(".hang", track), thumb = $(".rc-thumb"), bar = $(".rc-track");
    const swing = $$(".swing", track).map((el) => ({ el, hang: +el.closest(".hang").dataset.i, a: 0, v: 0, r: "" }));
    let x = 0, tx = 0, prevX = 0, minX = 0, hover = -1, lastTf = "", lastN = -1, lastBar = "", lastEnds = "";
    const prevBtn = $(".rail-prev"), nextBtn = $(".rail-next");
    const lead = Math.max(0, D.rail.findIndex((r) => r.link === "signature-hoodie"));
    const clamp = (v) => Math.max(minX, Math.min(0, v));
    const measure = () => { minX = Math.min(0, wrapEl.clientWidth - track.scrollWidth); tx = clamp(tx); lastBar = ""; };
    const center = (i) => clamp(-hangs[i].offsetLeft + (wrapEl.clientWidth - hangs[i].offsetWidth) / 2);
    function nearest(at) { const c = -at + wrapEl.clientWidth / 2; let best = 0, bd = 1e9; hangs.forEach((h, i) => { const d = Math.abs(h.offsetLeft + h.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } }); return best; }
    // Step to the next garment that actually moves the rail; at the ends, stop.
    function stepBy(n) {
      let i = nearest(tx);
      for (;;) { i += n; if (i < 0 || i >= hangs.length) return; const t = center(i); if (Math.abs(t - tx) > 2) { tx = t; return; } }
    }
    $(".rail-prev").addEventListener("click", () => stepBy(-1));
    $(".rail-next").addEventListener("click", () => stepBy(1));
    wrapEl.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); stepBy(1); } if (e.key === "ArrowLeft") { e.preventDefault(); stepBy(-1); } });

    // Horizontal trackpad scrolling only; vertical scrolling stays with the page.
    wrapEl.addEventListener("wheel", (e) => { if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; e.preventDefault(); tx = clamp(tx - e.deltaX); }, { passive: false });
    let drag = null;
    wrapEl.addEventListener("pointerdown", (e) => { if (e.button !== 0 || e.target.closest("a, button")) return; drag = { x: e.clientX, y: e.clientY, t: tx, moved: false, id: e.pointerId }; });
    wrapEl.addEventListener("pointermove", (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) { if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) { drag.moved = true; wrapEl.classList.add("dragging"); wrapEl.setPointerCapture(e.pointerId); } else return; }
      const raw = drag.t + dx; tx = raw > 0 ? raw * 0.3 : raw < minX ? minX + (raw - minX) * 0.3 : raw;
    });
    wrapEl.addEventListener("pointerup", (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const d = drag; drag = null; wrapEl.classList.remove("dragging"); tx = clamp(tx);
      // A click (no drag) on a garment opens its product page.
      if (!d.moved) { const h = e.target.closest(".hang"); if (h) location.href = h.dataset.href; }
    });
    wrapEl.addEventListener("pointercancel", (e) => { if (drag && drag.id === e.pointerId) { drag = null; wrapEl.classList.remove("dragging"); tx = clamp(tx); } });
    // Pointing at a garment makes it the active one and gives it a small nudge.
    hangs.forEach((h, i) => {
      h.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse" || drag) return; hover = i; if (!reduced) swing.forEach((s) => { if (s.hang === i) s.v += 0.5; }); });
      h.addEventListener("pointerleave", () => { if (hover === i) hover = -1; });
      $(".hang-name", h).addEventListener("focus", () => { tx = center(i); });
    });

    (function loop() {
      x += (tx - x) * (reduced ? 1 : 0.14);
      if (Math.abs(tx - x) < 0.05) x = tx;
      const tf = `translate3d(${x.toFixed(1)}px,0,0)`;
      if (tf !== lastTf) { track.style.transform = lastTf = tf; }
      const vel = x - prevX; prevX = x;
      // Each piece sways around its hook: pushed by the rail's movement, pulled back by a spring.
      if (!reduced) swing.forEach((s, i) => {
        s.v += -vel * 0.045 * (1 + (i % 2) * 0.25) - s.a * 0.06; s.v *= 0.9; s.a += s.v;
        s.a = Math.max(-9, Math.min(9, s.a));
        if (Math.abs(s.a) < 0.01 && Math.abs(s.v) < 0.01) { s.a = s.v = 0; }
        const r = s.a ? `rotate(${s.a.toFixed(2)}deg)` : "";
        if (r !== s.r) { s.el.style.transform = s.r = r; }
      });
      // When the whole rail fits, the hoodie leads; otherwise the garment nearest the centre.
      const n = hover > -1 ? hover : minX ? nearest(x) : lead;
      if (n !== lastN) { lastN = n; hangs.forEach((h, i) => h.classList.toggle("active", i === n)); }
      // Progress bar: the thumb is the visible share of the rail, placed by scroll progress.
      const tw = bar.clientWidth, w = Math.max(40, tw * (minX ? wrapEl.clientWidth / track.scrollWidth : 1));
      const left = minX ? (x / minX) * (tw - w) : 0, b = `${w.toFixed(1)}|${left.toFixed(1)}`;
      if (b !== lastBar) { lastBar = b; thumb.style.width = w.toFixed(1) + "px"; thumb.style.transform = `translateX(${left.toFixed(1)}px)`; }
      const ends = `${tx >= -1}|${tx <= minX + 1}`;
      if (ends !== lastEnds) { lastEnds = ends; prevBtn.disabled = tx >= -1; nextBtn.disabled = tx <= minX + 1; }
      requestAnimationFrame(loop);
    })();
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(wrapEl); else addEventListener("resize", measure);
    addEventListener("load", measure);
    measure();
  }

  // ================================================================ HOME: opening image, then the rail
  function home() {
    $(".skip").insertAdjacentHTML("afterend", `
<section class="hero" aria-label="IRONKIN Collection 001">
  <picture>
    <source media="(max-width: 700px) and (orientation: portrait)" srcset="media/hero-athletes-m.webp">
    <img src="media/hero-athletes.webp" alt="Three IRONKIN athletes in Collection 001 on a burgundy floor crossed by an amber light line" fetchpriority="high">
  </picture>
  <a class="hero-cue" href="#collection"><span>Scroll</span><i aria-hidden="true"></i></a>
</section>`);
    $("#main").innerHTML = rail("h1");
    railInit();
  }

  function collection() {
    $("#main").innerHTML = rail("h1") + `
<section class="grid-sec" aria-labelledby="all">
  <h2 class="head" id="all">All pieces</h2>
  <div class="grid">${D.products.map((p) => `
    <a class="card" href="product.html?id=${p.id}"><div class="card-img"><img src="media/${p.cut}-sm.webp" alt="" loading="lazy"></div>
    <div class="card-body"><h3>${esc(p.name)}</h3><p>${esc(p.colour)}${p.price != null ? " · " + money(p.price) : ""}</p></div></a>`).join("")}</div>
</section>`;
    railInit();
  }

  // ================================================================ PRODUCT
  function product() {
    const p = P(new URLSearchParams(location.search).get("id")) || D.products[0];
    document.title = `${p.name} · IRONKIN`;
    $("#main").innerHTML = `
<section class="pdp">
  <div class="thumbs" role="list" aria-label="Photos">${p.gallery.map((g, i) => `<button class="thumb ${g.kind}" role="listitem" data-i="${i}" aria-label="${esc(g.label)}"${i === 0 ? ' aria-current="true"' : ""}><img src="${g.kind === "cut" ? `media/${g.src}-sm.webp` : media(g.src)}" alt="" loading="lazy"></button>`).join("")}</div>
  <div class="media" aria-live="polite"></div>
  <div class="buy">
    <h1 class="head">${esc(p.name).replace(" ", "<br>")}</h1>
    <p class="colour">${esc(p.colour)}</p>
    <p class="price">${p.price != null ? money(p.price) : "Price at launch"}</p>
    <div class="size-head"><span class="lbl" id="size-lbl">Size</span><button class="guide-link" type="button">Size guide</button></div>
    ${ruler(p)}
    <button class="btn btn-block btn-split add-btn" type="button"><span>Add to cart</span><span class="div" aria-hidden="true"></span>${ARROW}</button>
    <p class="buy-msg" aria-live="polite"></p>
    <div class="buy-details"><p>${esc(p.summary)}</p><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
  </div>
</section>
<div class="drawer" id="guide" role="dialog" aria-modal="true" aria-labelledby="guide-title" hidden>
  <div class="drawer-scrim" data-close></div>
  <aside class="drawer-sheet">
    <div class="drawer-head"><h2 class="head" id="guide-title">Size guide</h2><button class="x-btn" data-close aria-label="Close size guide">${X}</button></div>
    <div class="drawer-body">
      <p class="guide-note" style="margin-top:16px">${esc(p.name)} · garment measured flat, in centimetres.</p>
      <table class="guide-table"><thead><tr><th>Point of measure</th>${p.sizes.map((s) => `<th>${s}</th>`).join("")}</tr></thead>
      <tbody>${D.guides[p.guide].map((m) => `<tr><td>${esc(m)}</td>${p.sizes.map(() => "<td>—</td>").join("")}</tr>`).join("")}</tbody></table>
      <p class="guide-note">Final measurements are being confirmed with the factory and will be published here before launch.</p>
    </div>
  </aside>
</div>`;
    const mediaEl = $(".media");
    const show = (i) => {
      const g = p.gallery[i];
      mediaEl.innerHTML = g.kind === "cut"
        ? `<img src="${media(g.src)}" srcset="${cutSet(g.src)}" sizes="(max-width: 1080px) 90vw, 50vw" alt="${esc(g.alt)}">`
        : `<img class="photo" src="${media(g.src)}" alt="${esc(g.alt)}"><span class="cap">${esc(g.label)}</span>`;
      $$(".thumb").forEach((t, j) => t.setAttribute("aria-current", j === i));
    };
    $(".thumbs").addEventListener("click", (e) => { const t = e.target.closest(".thumb"); if (t) show(+t.dataset.i); });
    show(0);
    const guide = $("#guide");
    $(".guide-link").addEventListener("click", () => openDrawer(guide));
    guide.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeDrawer(guide); });
    const r = $(".buy .ruler"), msg = $(".buy-msg");
    r.setAttribute("aria-labelledby", "size-lbl");
    r.addEventListener("size", () => { msg.className = "buy-msg"; msg.textContent = ""; });
    $(".add-btn").addEventListener("click", () => {
      if (!r.dataset.sel) { msg.className = "buy-msg err"; msg.textContent = "Choose a size first."; r.classList.remove("shake"); void r.offsetWidth; r.classList.add("shake"); $(".sz:not(:disabled)", r).focus(); return; }
      cart.add(p.id, r.dataset.sel);
      msg.className = "buy-msg ok"; msg.innerHTML = `Added to cart: ${esc(p.name)}, size ${r.dataset.sel}. <button class="guide-link" style="font-size:16px" type="button" data-open-cart>View cart</button>`;
    });
    $(".buy").addEventListener("click", (e) => { if (e.target.closest("[data-open-cart]")) openDrawer($("#cart")); });
  }

  // ================================================================ CAMPAIGN / STORY / INFO
  function campaign() {
    $("#main").innerHTML = `<section class="camp"><h1 class="head">Collection 001 Campaign</h1>
      <div class="camp-grid">${D.looks.map((l) => `<a class="camp-panel" href="look.html?look=${l.id}#shop">
        <img src="${media(l.photo)}" alt="${esc(l.name)} look, Collection 001" loading="lazy">
        <div class="camp-cap"><h2 class="head">${esc(l.name)}</h2><span>Shop the look <span aria-hidden="true">›</span></span></div></a>`).join("")}</div></section>`;
  }
  function story() {
    $("#main").innerHTML = `<section class="story">
      <div class="story-copy"><h1 class="head">Who we are</h1>
        <p>IRONKIN is an Egyptian sportswear brand shaped by the people who train.</p>
        <p>Collection 001 brings strength training, jiu-jitsu and padel into one release.</p>
        <p><a class="text-link" href="collection.html">Explore Collection 001 <span aria-hidden="true">→</span></a></p></div>
      <div class="story-photo"><img src="media/c-story-flag.webp" alt="Three IRONKIN athletes holding the IRONKIN flag"></div></section>`;
  }
  function info() {
    $("#main").innerHTML = `<div class="info"><h1 class="head">Help</h1>
      <section id="contact"><h2 class="head">Contact</h2><p>Contact details will be published here at launch.</p></section>
      <section id="shipping"><h2 class="head">Shipping &amp; Returns</h2><p>Delivery areas, times, costs and the returns policy will be published here at launch.</p></section>
      <section id="privacy"><h2 class="head">Privacy</h2><p>This preview keeps your cart in this browser only. No personal data is sent anywhere. The full privacy policy will be published at launch.</p></section></div>`;
  }

  // ================================================================ CHECKOUT (demo)
  function checkout() {
    const lines = cart.read();
    if (!lines.length) { $("#main").innerHTML = `<div class="co-done"><h1 class="head">Checkout</h1><p>Your cart is empty.</p><a class="btn" href="collection.html">Shop Collection 001 ${ARROW}</a></div>`; return; }
    const sub = cart.subtotal();
    $("#main").innerHTML = `
<section class="co">
  <form class="co-form" novalidate>
    <h1 class="head">Checkout</h1>
    ${D.demoCheckout ? '<p class="demo-flag">Demo checkout: no order is sent and no payment is taken until the live store is connected.</p>' : ""}
    <h2 class="head">Contact</h2>
    <label class="sr" for="email">Email</label><input class="in" id="email" name="email" type="email" placeholder="Email" autocomplete="email" required>
    <h2 class="head">Delivery</h2>
    <label class="sr" for="name">Full name</label><input class="in" id="name" name="name" placeholder="Full name" autocomplete="name" required>
    <label class="sr" for="addr">Address</label><input class="in" id="addr" name="addr" placeholder="Address" autocomplete="street-address" required>
    <div class="two"><div><label class="sr" for="city">City</label><input class="in" id="city" name="city" placeholder="City" autocomplete="address-level2" required></div>
      <div><label class="sr" for="zip">Postal code</label><input class="in" id="zip" name="zip" placeholder="Postal code" autocomplete="postal-code"></div></div>
    <label class="sr" for="country">Country</label><select class="in" id="country" name="country" autocomplete="country-name">${D.countries.map((c) => `<option>${c}</option>`).join("")}</select>
    <h2 class="head">Payment</h2>
    <label class="pay${D.payments.card ? "" : " off"}"><input type="radio" name="pay" value="card"${D.payments.card ? "" : " disabled"}> Card <small>${D.payments.card ? "" : "Available when the store opens"}</small></label>
    <label class="pay"><input type="radio" name="pay" value="cod"${D.payments.cod ? " checked" : " disabled"}> Cash on delivery</label>
    <p class="err-msg pay-err" aria-live="polite"></p>
  </form>
  <aside class="co-sum">
    <h2 class="head">Order summary</h2>
    ${lines.map((l) => { const p = P(l.id); return `<div class="sum-item"><div class="img"><img src="media/${p.cut}-sm.webp" alt=""></div><div><h3>${esc(p.name)}</h3><p>Size: ${l.size} &nbsp; Qty: ${l.qty}</p></div><span>${p.price != null ? money(p.price * l.qty) : "—"}</span></div>`; }).join("")}
    <div class="totals"><div><span>Subtotal</span><span>${sub == null ? "—" : money(sub)}</span></div><div><span>Delivery</span><span>—</span></div><div class="total"><span>Total</span><span>${sub == null ? "—" : money(sub)}</span></div></div>
    <button class="btn btn-block place" type="button" style="min-height:64px;font-size:30px">Place order</button>
    <p class="guide-note" style="color:var(--powder-dim);margin-top:14px">${sub == null ? "Prices and delivery costs are set at launch." : ""}</p>
  </aside>
</section>`;
    const form = $(".co-form");
    const req = { email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email address.", name: (v) => v.trim().length > 1 || "Enter your full name.", addr: (v) => v.trim().length > 4 || "Enter your street address.", city: (v) => v.trim().length > 1 || "Enter your city." };
    function check(el) {
      const ok = req[el.name] ? req[el.name](el.value) : true;
      let m = el.nextElementSibling && el.nextElementSibling.classList.contains("err-msg") ? el.nextElementSibling : null;
      if (ok === true) { el.removeAttribute("aria-invalid"); if (m) m.remove(); return true; }
      el.setAttribute("aria-invalid", "true");
      if (!m) { m = document.createElement("p"); m.className = "err-msg"; m.id = el.id + "-err"; el.after(m); el.setAttribute("aria-describedby", m.id); }
      m.textContent = ok; return false;
    }
    form.addEventListener("blur", (e) => { if (e.target.name in req && e.target.value) check(e.target); }, true);
    $(".place").addEventListener("click", () => {
      const bad = Object.keys(req).map((n) => form.elements[n]).filter((el) => !check(el));
      const pay = form.querySelector("input[name=pay]:checked"), pe = $(".pay-err");
      pe.textContent = pay ? "" : "Choose a payment method.";
      if (bad.length) { bad[0].focus(); return; }
      if (!pay) return;
      // Stock check against the catalog.
      const out = cart.read().filter((l) => P(l.id).soldOut.includes(l.size));
      if (out.length) { pe.textContent = `${out.map((l) => `${P(l.id).name} in ${l.size}`).join(", ")} just sold out. Change the size in your cart.`; return; }
      const no = "IK-" + Date.now().toString(36).toUpperCase().slice(-6);
      cart.write([]);
      $("#main").innerHTML = `<div class="co-done"><h1 class="head">Order received</h1><p>Thank you. Your demo order number is <strong>${no}</strong>.</p>
        <p>This was a demo checkout: nothing was charged and no order was sent. When the live store is connected, you will get an email confirmation here.</p>
        <a class="btn" href="collection.html">Back to Collection 001 ${ARROW}</a></div>`;
      scrollTo(0, 0);
    });
  }

  // ================================================================ go
  shell();
  ({ home, look, collection, product, campaign, story, info, checkout })[page]?.();
  if (page === "look" && location.hash === "#shop") setTimeout(() => $("#shop")?.scrollIntoView(), 50);
})();
