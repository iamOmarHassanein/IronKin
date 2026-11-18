// IRONKIN v5: layered rainy-rooftop hero (doors, word behind the athlete, live rain), collection, bag.
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const still = /[?&]still\b/.test(location.search);
  const reduced = still || matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) document.documentElement.classList.add("still");

  // ---------------------------------------------------------------- scene geometry
  // Measured on the scene image (fractions of its height): where the athlete's head starts.
  const HEAD = 0.246;
  // How much of the word's cap height the head should cover (the original design covers about 30%).
  const OVERLAP = 0.3;
  const hero = $(".hero"), stage = $("#stage"), headline = $("#headline"), word = $("#word"), kicker = $("#kicker"), nav = $("#nav");
  const spans = $$("span", word);
  const probe = document.createElement("i"); probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";

  function layout() {
    const vw = hero.clientWidth, vh = hero.clientHeight;
    // The stage is the scene's 16:9 box. It is tall enough that the head sits about 30% down the
    // screen (leaving sky for the word), wide enough to cover the screen, and pinned to the top.
    const sh = Math.max((vw * 9) / 16, (vh * 0.3) / HEAD, vh);
    const sw = (sh * 16) / 9;
    stage.style.width = sw + "px"; stage.style.height = sh + "px";
    stage.style.top = "0px"; stage.style.transform = "translateX(-50%)";
    const head = HEAD * sh;

    // Measure the word at 100px.
    word.style.setProperty("--fs", "100px");
    const em = word.scrollWidth ? spans.reduce((w, s) => w + s.getBoundingClientRect().width, 0) / 100 : 1.95;
    const navRect = nav.getBoundingClientRect(), heroTop = hero.getBoundingClientRect().top;
    const phone = vw <= 820;
    // On phones the main links sit at the bottom of the hero, so only the top row counts.
    const navBottom = (phone ? $(".mark", nav).getBoundingClientRect().bottom : navRect.bottom) - heroTop;
    const top = navBottom + vh * 0.035;
    const CAP = 0.727;
    const fsFit = (head - top) / (1 - OVERLAP) / CAP;         // cap from just below the nav down past the head top
    const fsW = (0.92 * vw) / em, fsS = (0.625 * sw) / em;
    const fs = Math.max(48, Math.min(fsFit, fsW, fsS, 360));
    const cap = CAP * fs, base = head + OVERLAP * cap;

    word.style.setProperty("--fs", fs + "px");
    word.appendChild(probe);
    const baseOff = probe.offsetTop + 0; probe.remove();
    word.style.setProperty("--wt", base - baseOff + "px");
    // The kicker rests on the cap line, starting where the lowercase letters start.
    const ks = Math.max(14, fs * 0.15);
    kicker.style.setProperty("--ks", ks + "px");
    kicker.style.setProperty("--kt", base - cap + fs * 0.015 + "px");
    const wr = word.getBoundingClientRect(), r1 = spans[1].getBoundingClientRect();
    kicker.style.left = r1.left - wr.left + fs * 0.02 + "px"; kicker.style.right = "auto"; kicker.style.textAlign = "left";
    headline.style.height = sh + "px";
    sizeRain();
  }

  // ---------------------------------------------------------------- rain
  const cv = $("#rain"), cx = cv.getContext("2d");
  let drops = [], rw = 0, rh = 0, rainOn = false, rainRaf = 0, lastT = 0;
  function sizeRain() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    rw = cv.width = Math.round(r.width * dpr); rh = cv.height = Math.round(r.height * dpr);
    const n = Math.round((rw * rh) / 9000);
    drops = Array.from({ length: n }, () => newDrop(true));
    if (reduced) drawRain(0);
  }
  function newDrop(any) {
    const z = Math.random(); // depth: 0 far, 1 near
    return { x: Math.random() * rw * 1.2 - rw * 0.1, y: any ? Math.random() * rh : -Math.random() * rh * 0.2, z,
      len: (8 + z * 26) * (rw / 1600 + 0.4), v: (900 + z * 1500) * (rh / 900), a: 0.05 + z * 0.22 };
  }
  function drawRain(dt) {
    cx.clearRect(0, 0, rw, rh);
    cx.lineCap = "round";
    const slant = 0.16;
    for (const d of drops) {
      d.y += d.v * dt; d.x += d.v * dt * slant;
      if (d.y - d.len > rh) Object.assign(d, newDrop(false));
      cx.strokeStyle = d.z > 0.7 ? `rgba(246,232,206,${d.a})` : `rgba(226,192,126,${d.a * 0.8})`;
      cx.lineWidth = 0.6 + d.z * 1.3;
      cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(d.x - d.len * slant, d.y - d.len); cx.stroke();
    }
  }
  function rainLoop(t) { const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t; drawRain(dt); rainRaf = rainOn ? requestAnimationFrame(rainLoop) : 0; }
  function setRain(on) { rainOn = on && !reduced; if (rainOn && !rainRaf) { lastT = performance.now(); rainRaf = requestAnimationFrame(rainLoop); } }
  new IntersectionObserver(([e]) => setRain(e.isIntersecting && started), { threshold: 0 }).observe(hero);

  // ---------------------------------------------------------------- intro
  let started = false;
  const E = { out: "cubic-bezier(.2,.65,.3,1)", soft: "cubic-bezier(.45,0,.55,1)", rise: "cubic-bezier(.2,.5,.2,1)" };
  function anim(el, frames, delay, dur, easing) { return el.animate(frames, { delay, duration: dur, easing, fill: "both" }); }
  function run() {
    if (started) return; started = true;
    const doors = $("#doors");
    if (reduced) { hero.classList.remove("intro"); doors.hidden = true; return; }
    const [L, R] = $$(".door", doors);
    anim(L, [{ transform: "translateX(0)" }, { transform: "translateX(-101%)" }], 250, 1150, "cubic-bezier(.1,.2,.8,1)");
    anim(R, [{ transform: "translateX(0)" }, { transform: "translateX(101%)" }], 250, 1250, "cubic-bezier(.4,.6,.9,1)");
    // The scene settles in from a slow, soft push.
    anim($("#back"), [{ transform: "scale(1.14)", filter: "blur(6px) brightness(.7)" }, { transform: "scale(1)", filter: "blur(0) brightness(1)" }], 200, 2600, "cubic-bezier(.3,0,.2,1)");
    anim($("#shade"), [{ opacity: 0 }, { opacity: 1 }], 1400, 900, E.soft);
    setTimeout(() => setRain(true), 700);
    anim(nav, [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], 1500, 400, "ease-out");
    anim(kicker, [{ opacity: 0, transform: "translate(0, .5em)" }, { opacity: 1, transform: "translate(0,0)" }], 1550, 700, E.out);
    spans.forEach((s, i) => anim(s, [{ opacity: 0, transform: "translateY(.14em)" }, { opacity: 1, transform: "none" }], 1500 + i * 70, 700, E.out));
    anim(headline, [{ transform: "translateY(5%)" }, { transform: "none" }], 1900, 1800, "cubic-bezier(.3,0,.4,1)");
    // The athlete rises into frame, overshoots a touch, and settles.
    anim($("#front"), [{ transform: "translateY(66%)", offset: 0 }, { transform: "translateY(-2.2%)", offset: 0.64, easing: E.soft }, { transform: "translateY(0)", offset: 1 }], 2300, 3300, E.rise);
    anim($(".cue"), [{ opacity: 0 }, { opacity: 1 }], 4200, 600, "ease-out");
    setTimeout(() => { hero.classList.remove("intro"); doors.hidden = true; }, 5700);
  }
  // Start once the two scene layers are in, or after 4 s regardless.
  const imgs = [$("#plate"), $("#man")];
  const ready = () => imgs.every((i) => i.complete && i.naturalWidth);
  const kick = () => { layout(); if (ready()) setTimeout(run, 120); };
  imgs.forEach((i) => i.addEventListener("load", kick));
  setTimeout(() => { layout(); run(); }, 4000);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(kick);
  addEventListener("resize", layout);
  layout();

  // A little depth when the pointer moves: far layers move least.
  if (!reduced) {
    const back = $("#back").firstElementChild, man = $("#man");
    let tx = 0, ty = 0, x = 0, y = 0, praf = 0;
    const step = () => { x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      back.style.transform = `translate3d(${x * -6}px,${y * -4}px,0)`; word.style.translate = `${x * -12}px ${y * -6}px`; man.style.transform = `translate3d(${x * -20}px,${y * -8}px,0)`;
      praf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(step) : 0; };
    hero.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; if (!praf) praf = requestAnimationFrame(step); });
  }

  // ---------------------------------------------------------------- collection and bag
  const KIT = [
    { id: "hoodie", name: "Signature Hoodie", colour: "Black / Cream", img: "hoodie-black", sizes: ["XS", "S", "M", "L", "XL", "XXL"], price: null },
    { id: "pant", name: "Wide-Leg Pant", colour: "Black / Cream", img: "pants-black", sizes: ["XS", "S", "M", "L", "XL", "XXL"], price: null },
    { id: "comp", name: "Compression Tee", colour: "Black / Cream", img: "compression-black", sizes: ["S", "M", "L", "XL", "XXL"], price: null },
    { id: "tee", name: "Fitted Tee", colour: "Washed Rose / Oxblood", img: "tee-rose", sizes: ["XS", "S", "M", "L", "XL"], price: null },
    { id: "flare", name: "Flared Pant", colour: "Washed Rose / Oxblood", img: "flare-rose", sizes: ["XS", "S", "M", "L", "XL"], price: null },
  ];
  const byId = Object.fromEntries(KIT.map((p) => [p.id, p]));
  const price = (p) => (p.price == null ? "Price at launch" : `EGP ${p.price.toLocaleString("en-EG")}`);
  const KEY = "ironkin-v5-bag";
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
  $(".bag-btn").addEventListener("click", () => { lastFocus = document.activeElement; drawer.hidden = false; document.body.classList.add("locked"); $("[data-close].ghost-btn", drawer).focus(); });
  const closeBag = () => { drawer.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus(); };
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) return closeBag(); const rm = e.target.closest("[data-rm]"); if (rm) { const l = bag.read(); l.splice(+rm.dataset.rm, 1); bag.write(l); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) closeBag(); });
  addEventListener("storage", (e) => { if (e.key === KEY) renderBag(); });
  renderBag();
  const toast = $("#toast"); let tt = 0;
  const say = (t) => { toast.textContent = t; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 3200); };

  $("#grid").innerHTML = KIT.map((p) => `
    <article class="tile" aria-labelledby="t-${p.id}">
      <div class="pic"><img class="front" src="media/p-${p.img}-front.webp" alt="${esc(p.name)}, front" loading="lazy"><img class="back" src="media/p-${p.img}-back.webp" alt="${esc(p.name)}, back" loading="lazy"><button class="turn" type="button" aria-pressed="false">Turn</button></div>
      <h3 id="t-${p.id}">${esc(p.name)}</h3>
      <p class="meta"><span>${esc(p.colour)}</span><b>${price(p)}</b></p>
      <div class="sizes" role="radiogroup" aria-label="Size for ${esc(p.name)}">${p.sizes.map((s) => `<button class="sz" type="button" role="radio" aria-checked="false">${s}</button>`).join("")}</div>
      <p class="err" aria-live="polite"></p>
      <button class="gold-btn add" type="button">Add to bag</button>
    </article>`).join("");
  $$(".tile").forEach((t, i) => {
    const p = KIT[i], err = $(".err", t); let size = null;
    t.style.setProperty("--d", i * 80 + "ms");
    $(".turn", t).addEventListener("click", (e) => { const on = t.classList.toggle("turned"); e.currentTarget.setAttribute("aria-pressed", on); });
    $(".sizes", t).addEventListener("click", (e) => { const b = e.target.closest(".sz"); if (!b) return; size = b.textContent; $$(".sz", t).forEach((x) => x.setAttribute("aria-checked", x === b)); err.textContent = ""; });
    $(".add", t).addEventListener("click", () => { if (!size) { err.textContent = "Choose a size first."; return; } bag.add(p.id, size); say(`Added: ${p.name}, ${size}`); });
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
  $$(".tile, .story figure").forEach((el) => io.observe(el));
  window.__v5 = { layout, run };
})();
