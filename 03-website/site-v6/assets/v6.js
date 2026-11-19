// IRONKIN v6: "The Rite". Pinned chapters in red light, embers, collection, bag.
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const still = /[?&]still\b/.test(location.search);
  const reduced = still || matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) document.documentElement.classList.add("still");

  // ---------------------------------------------------------------- Cairo clock
  const clock = $("#clock");
  const tick = () => { try { clock.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit" }).format(new Date()); } catch { /* keep UTC label */ } };
  tick(); setInterval(tick, 20000);

  // ---------------------------------------------------------------- the rite
  const rite = $("#rite"), figs = $$(".fig"), chs = $$(".ch"), thumb = $("#thumb"), roman = $("#roman"), hdr = $("#hdr");
  const NUM = ["", "I", "II", "III"], N = chs.length;
  // Split each chapter's text into words so they can light up as you scroll.
  chs.forEach((ch) => {
    const t = $(".ch-t", ch);
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) f.append(p); else { const s = document.createElement("span"); s.className = "w"; s.textContent = p; f.append(s); } }); n.replaceWith(f); }
      else if (n.nodeType === 1) walk(n);
    });
    walk(t); ch.words = $$(".w", t);
  });
  let cur = -1;
  function setChapter(i) {
    if (i === cur) return; cur = i;
    figs.forEach((f, k) => f.classList.toggle("on", k === i));
    chs.forEach((c, k) => { c.classList.toggle("on", k === i); c.setAttribute("aria-hidden", k !== i); });
    thumb.style.left = (i / N) * 100 + "%";
    roman.classList.add("swap");
    setTimeout(() => { roman.textContent = NUM[i]; roman.classList.remove("swap"); }, reduced ? 0 : 250);
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    const span = rite.offsetHeight - innerHeight, y = scrollY - rite.offsetTop;
    const p = Math.min(0.9999, Math.max(0, y / span));
    const f = p * N, i = Math.floor(f), local = f - i;
    setChapter(i);
    // Words light up through the first two thirds of each chapter (all lit when reduced).
    const words = chs[i].words, lit = reduced ? words.length : Math.ceil(Math.min(1, local / 0.62 + 0.08) * words.length);
    words.forEach((w, k) => w.classList.toggle("lit", k < lit));
    // The figure drifts closer through its chapter.
    if (!reduced) figs[i].style.setProperty("--s", (i === 0 ? 1.28 : 1.04) + local * 0.08);
    hdr.classList.toggle("solid", scrollY > rite.offsetTop + span);
    $$(".cols a").forEach((a) => a.classList.remove("on"));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll); onScroll();
  // "Disciplines" jumps to the first rite.
  $$("[data-ch]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault(); const span = rite.offsetHeight - innerHeight;
    scrollTo({ top: rite.offsetTop + span * ((+a.dataset.ch + 0.3) / N), behavior: reduced ? "auto" : "smooth" });
  }));

  // ---------------------------------------------------------------- embers rising in the red light
  const cv = $("#embers"), cx = cv.getContext("2d");
  let W = 0, H = 0, sparks = [], eraf = 0, run = false, lt = 0;
  function sizeEmbers() {
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(r.width * d); H = cv.height = Math.round(r.height * d);
    sparks = Array.from({ length: Math.round(W / 26) }, () => spark(true));
  }
  function spark(any) {
    const z = Math.random();
    return { x: W * (0.3 + Math.random() * 0.7), y: any ? Math.random() * H : H + 10, z, r: (0.6 + z * 1.8) * (W / 1600 + 0.5), vy: 18 + z * 46, ph: Math.random() * 6.28, a: 0.25 + z * 0.6 };
  }
  function frame(t) {
    const dt = Math.min(0.05, (t - lt) / 1000 || 0.016); lt = t;
    cx.clearRect(0, 0, W, H);
    for (const s of sparks) {
      s.y -= s.vy * dt * (H / 900); s.ph += dt * 1.4; s.x += Math.sin(s.ph) * 0.4;
      if (s.y < -10) Object.assign(s, spark(false));
      const fade = Math.min(1, s.y / (H * 0.25)) * (0.6 + 0.4 * Math.sin(s.ph * 2.3));
      const g = cx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      g.addColorStop(0, `rgba(255,214,160,${s.a * fade})`); g.addColorStop(0.35, `rgba(220,110,60,${s.a * fade * 0.5})`); g.addColorStop(1, "rgba(184,67,46,0)");
      cx.fillStyle = g; cx.beginPath(); cx.arc(s.x, s.y, s.r * 4, 0, 6.283); cx.fill();
    }
    eraf = run ? requestAnimationFrame(frame) : 0;
  }
  sizeEmbers(); addEventListener("resize", sizeEmbers);
  if (!reduced) new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run && !eraf) { lt = performance.now(); eraf = requestAnimationFrame(frame); } }).observe(rite);

  // ---------------------------------------------------------------- collection and bag
  const KIT = [
    { id: "hoodie", name: "Signature Hoodie", colour: "Black / Cream", img: "hoodie-black", sizes: ["XS", "S", "M", "L", "XL", "XXL"], rite: "Strength", price: null },
    { id: "pant", name: "Wide-Leg Pant", colour: "Black / Cream", img: "pants-black", sizes: ["XS", "S", "M", "L", "XL", "XXL"], rite: "Strength", price: null },
    { id: "comp", name: "Compression Tee", colour: "Black / Cream", img: "compression-black", sizes: ["S", "M", "L", "XL", "XXL"], rite: "Jiu-Jitsu", price: null },
    { id: "tee", name: "Fitted Tee", colour: "Washed Rose / Oxblood", img: "tee-rose", sizes: ["XS", "S", "M", "L", "XL"], rite: "Padel", price: null },
    { id: "flare", name: "Flared Pant", colour: "Washed Rose / Oxblood", img: "flare-rose", sizes: ["XS", "S", "M", "L", "XL"], rite: "Padel", price: null },
  ];
  const byId = Object.fromEntries(KIT.map((p) => [p.id, p]));
  const price = (p) => (p.price == null ? "Price at launch" : `EGP ${p.price.toLocaleString("en-EG")}`);
  const KEY = "ironkin-v6-bag";
  const bag = {
    read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } },
    write(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} renderBag(); },
    add(id, size) { const l = bag.read(), h = l.find((x) => x.id === id && x.size === size); if (h) h.qty = Math.min(10, h.qty + 1); else l.push({ id, size, qty: 1 }); bag.write(l); },
  };
  function renderBag() {
    const l = bag.read().filter((x) => byId[x.id]);
    $(".bag-n").textContent = l.reduce((n, x) => n + x.qty, 0);
    $(".bag-lines").innerHTML = l.length ? l.map((x, i) => { const p = byId[x.id];
      return `<div class="line"><img src="media/p-${p.img}-front-sm.webp" alt=""><div><h3>${esc(p.name)}</h3><p>${esc(p.colour)} · Size ${x.size} · Qty ${x.qty}</p><p>${price(p)}</p></div><button type="button" data-rm="${i}">Remove</button></div>`;
    }).join("") : '<p class="empty">Your bag is empty.</p>';
  }
  const drawer = $("#bag"); let lastFocus = null;
  $(".bag-btn").addEventListener("click", () => { lastFocus = document.activeElement; drawer.hidden = false; document.body.classList.add("locked"); $(".close", drawer).focus(); });
  const closeBag = () => { drawer.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus(); };
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) return closeBag(); const rm = e.target.closest("[data-rm]"); if (rm) { const l = bag.read(); l.splice(+rm.dataset.rm, 1); bag.write(l); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) closeBag(); });
  addEventListener("storage", (e) => { if (e.key === KEY) renderBag(); });
  renderBag();
  const toast = $("#toast"); let tt = 0;
  const say = (t) => { toast.textContent = t; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 3200); };

  $("#grid").innerHTML = KIT.map((p, i) => `
    <article class="tile" aria-labelledby="t-${p.id}">
      <div class="tile-top"><span>(${String(i + 1).padStart(2, "0")})</span><span>${p.rite}</span></div>
      <div class="pic"><img class="front" src="media/p-${p.img}-front.webp" alt="${esc(p.name)}, front" loading="lazy"><img class="back" src="media/p-${p.img}-back.webp" alt="${esc(p.name)}, back" loading="lazy"><button class="turn" type="button" aria-pressed="false">Turn ↻</button></div>
      <h3 id="t-${p.id}">${esc(p.name)}</h3>
      <p class="meta"><span>${esc(p.colour)}</span><b>${price(p)}</b></p>
      <div class="sizes" role="radiogroup" aria-label="Size for ${esc(p.name)}">${p.sizes.map((s) => `<button class="sz" type="button" role="radio" aria-checked="false">${s}</button>`).join("")}</div>
      <p class="err" aria-live="polite"></p>
      <button class="add" type="button">Add to bag</button>
    </article>`).join("");
  $$(".tile").forEach((t, i) => {
    const p = KIT[i], err = $(".err", t); let size = null;
    $(".turn", t).addEventListener("click", (e) => { const on = t.classList.toggle("turned"); e.currentTarget.setAttribute("aria-pressed", on); });
    $(".sizes", t).addEventListener("click", (e) => { const b = e.target.closest(".sz"); if (!b) return; size = b.textContent; $$(".sz", t).forEach((x) => x.setAttribute("aria-checked", x === b)); err.textContent = ""; });
    $(".add", t).addEventListener("click", () => { if (!size) { err.textContent = "Choose a size first."; return; } bag.add(p.id, size); say(`Added · ${p.name} · ${size}`); });
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.25 });
  io.observe($(".kin"));
  window.__v6 = { onScroll };
})();
