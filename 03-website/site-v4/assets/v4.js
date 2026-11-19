// IRONKIN v4: video hero, scroll ticker, kit cards, discipline rows, numbers, bag.
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const still = /[?&]still\b/.test(location.search);
  const reduced = still || matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) document.documentElement.classList.add("still");

  // ---------------------------------------------------------------- catalog
  // price: null shows "Price at launch". Set a number (EGP) when prices are final.
  const KIT = [
    { id: "hoodie", name: "Signature Hoodie", colour: "Black / Cream", img: "hoodie-black", sizes: ["XS", "S", "M", "L", "XL", "XXL"], use: "Strength", price: null },
    { id: "pant", name: "Wide-Leg Pant", colour: "Black / Cream", img: "pants-black", sizes: ["XS", "S", "M", "L", "XL", "XXL"], use: "Strength", price: null },
    { id: "comp", name: "Compression Tee", colour: "Black / Cream", img: "compression-black", sizes: ["S", "M", "L", "XL", "XXL"], use: "Jiu-Jitsu", price: null },
    { id: "tee", name: "Fitted Tee", colour: "Washed Rose / Oxblood", img: "tee-rose", sizes: ["XS", "S", "M", "L", "XL"], use: "Padel", price: null },
    { id: "flare", name: "Flared Pant", colour: "Washed Rose / Oxblood", img: "flare-rose", sizes: ["XS", "S", "M", "L", "XL"], use: "Padel", price: null },
  ];
  const byId = Object.fromEntries(KIT.map((p) => [p.id, p]));
  const price = (p) => (p.price == null ? "Price at launch" : `EGP ${p.price.toLocaleString("en-EG")}`);

  // ---------------------------------------------------------------- 1. video hero
  // The film plays muted on a loop. Phones get a portrait cut. It pauses off screen and on request.
  const vid = $("#vid"), vbtn = $("#vplay"), pin = $(".hero-pin"), heroSec = $(".hero"), nav = $("#nav");
  vid.src = "media/hero-film.mp4"; // one 16:9 film; phones show its centre crop
  let userPaused = reduced;
  const setBtn = () => { const p = vid.paused; vbtn.setAttribute("aria-pressed", p); vbtn.setAttribute("aria-label", p ? "Play the film" : "Pause the film"); };
  const play = () => { if (!userPaused) vid.play().catch(() => {}); };
  vid.addEventListener("play", setBtn); vid.addEventListener("pause", setBtn);
  vbtn.addEventListener("click", () => { if (vid.paused) { userPaused = false; vid.play().catch(() => {}); } else { userPaused = true; vid.pause(); } });
  new IntersectionObserver(([e]) => (e.isIntersecting ? play() : vid.pause()), { threshold: 0.1 }).observe(heroSec);
  setBtn();

  // Scroll progress through the hero shrinks the film into a frame; the ticker runs with the scroll.
  const tick = $("#tick");
  const words = ["Train in it", "Strength", "Jiu-Jitsu", "Padel", "Collection 001", "IRONKIN"];
  tick.innerHTML = Array.from({ length: 4 }, () => words.map((w, i) => `<span${i % 2 ? ' class="o"' : ""}>${w}</span><span>✦</span>`).join("")).join("");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const h = heroSec.offsetHeight - innerHeight, y = scrollY;
    const p = Math.min(1, Math.max(0, (y - heroSec.offsetTop) / (h * 0.75)));
    pin.style.setProperty("--p", reduced ? Math.round(p) : p.toFixed(4));
    nav.classList.toggle("solid", y > heroSec.offsetTop + h);
    if (!reduced) tick.style.transform = `translate3d(${-((y * 0.35) % (tick.scrollWidth / 4))}px,0,0)`;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll); onScroll();

  // ---------------------------------------------------------------- bag
  const KEY = "ironkin-v4-bag";
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
    }).join("") : '<p class="bag-empty">Your bag is empty.</p>';
  }
  const drawer = $("#bag"); let lastFocus = null;
  $(".bag-btn").addEventListener("click", () => { lastFocus = document.activeElement; drawer.hidden = false; document.body.classList.add("locked"); $("[data-close].btn", drawer).focus(); });
  const closeBag = () => { drawer.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus(); };
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeBag();
    const rm = e.target.closest("[data-rm]"); if (rm) { const l = bag.read(); l.splice(+rm.dataset.rm, 1); bag.write(l); }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) closeBag(); });
  addEventListener("storage", (e) => { if (e.key === KEY) renderBag(); });
  renderBag();
  const toast = $("#toast"); let tt = 0;
  const say = (t) => { toast.textContent = t; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 3200); };

  // ---------------------------------------------------------------- 3. kit cards
  const cards = $("#cards");
  cards.innerHTML = KIT.map((p, i) => `
    <article class="card" id="k-${p.id}" aria-labelledby="t-${p.id}">
      <div class="card-top"><span>${String(i + 1).padStart(2, "0")}</span><span>${p.use}</span></div>
      <div class="stage">
        <div class="flip"><img src="media/p-${p.img}-front.webp" alt="${esc(p.name)}, front" loading="lazy" draggable="false"><img class="back" src="media/p-${p.img}-back.webp" alt="${esc(p.name)}, back" loading="lazy" draggable="false"></div>
        <button class="turn" type="button" aria-pressed="false">Turn ↻</button>
      </div>
      <h3 id="t-${p.id}">${esc(p.name)}</h3>
      <p class="meta"><span>${esc(p.colour)}</span><b>${price(p)}</b></p>
      <div class="sizes" role="radiogroup" aria-label="Size for ${esc(p.name)}">${p.sizes.map((s) => `<button class="sz" type="button" role="radio" aria-checked="false">${s}</button>`).join("")}</div>
      <p class="err" aria-live="polite"></p>
      <button class="btn btn-lemon add" type="button">Add to bag</button>
    </article>`).join("");
  $$(".card", cards).forEach((card, i) => {
    const p = KIT[i], err = $(".err", card); let size = null;
    $(".turn", card).addEventListener("click", (e) => { const on = card.classList.toggle("turned"); e.currentTarget.setAttribute("aria-pressed", on); });
    $(".sizes", card).addEventListener("click", (e) => { const b = e.target.closest(".sz"); if (!b) return; size = b.textContent; $$(".sz", card).forEach((x) => x.setAttribute("aria-checked", x === b)); err.textContent = ""; });
    $(".add", card).addEventListener("click", () => { if (!size) { err.textContent = "Choose a size first."; return; } bag.add(p.id, size); say(`Added · ${p.name} · ${size}`); });
    // A gentle tilt toward the pointer.
    if (!reduced) {
      card.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; const r = card.getBoundingClientRect(); card.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 8 + "deg"); card.style.setProperty("--rx", -((e.clientY - r.top) / r.height - 0.5) * 6 + "deg"); });
      card.addEventListener("pointerleave", () => { card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg"); });
    }
  });

  // ---------------------------------------------------------------- 4. discipline rows
  const cimg = $("#cimg"), cpic = $("img", cimg);
  let cx = 0, cy = 0, tx = 0, ty = 0, craf = 0;
  const follow = () => { cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16; cimg.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%) rotate(${(tx - cx) * 0.03}deg)`; craf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(follow) : 0; };
  $$(".row").forEach((row) => {
    const a = $("a", row);
    a.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; cpic.src = row.dataset.img; cpic.alt = ""; if (!cimg.classList.contains("on")) { cx = tx = e.clientX; cy = ty = e.clientY; } cimg.classList.add("on"); });
    a.addEventListener("pointerleave", () => cimg.classList.remove("on"));
    a.addEventListener("pointermove", (e) => { tx = e.clientX + 40; ty = e.clientY; if (!craf) craf = requestAnimationFrame(follow); });
    a.addEventListener("click", (e) => { e.preventDefault(); const c = $(`#k-${a.dataset.go}`); c.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); });
  });

  // ---------------------------------------------------------------- reveals and numbers
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; io.unobserve(e.target); const el = e.target;
    if (el.dataset.count != null) {
      const end = +el.dataset.count, pad = +(el.dataset.pad || 0), t0 = performance.now(), D = reduced ? 1 : 1200;
      const f = (t) => { const k = Math.min(1, (t - t0) / D), v = Math.round(end * (1 - Math.pow(1 - k, 3))); el.textContent = String(Math.max(v, k < 1 ? 0 : end)).padStart(pad, "0"); if (k < 1) requestAnimationFrame(f); };
      el.textContent = "0".padStart(pad, "0"); requestAnimationFrame(f);
    } else el.classList.add("in");
  }), { threshold: 0.2 });
  $$(".card").forEach((c, i) => { c.style.setProperty("--d", `${(i % 5) * 70}ms`); io.observe(c); });
  $$("[data-count], .story-img").forEach((el) => io.observe(el));
  window.__v4 = { onScroll };
})();
