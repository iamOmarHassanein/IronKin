// Shared header, footer, bag and page rendering for the IRONKIN site.
(function () {
  const C = window.IRONKIN;
  const page = document.body.dataset.page;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const collection = (id) => C.collections.find((c) => c.id === id);
  // Live products: not hidden and in a released collection.
  const live = C.products.filter((p) => !p.hidden && C.collections.some((c) => c.id === p.collection));
  const product = (id) => live.find((p) => p.id === id);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WORDMARK = '<img class="wordmark" src="assets/brand/ironkin-wordmark-bone.svg" alt="IRONKIN" width="168" height="29">';
  const ANVIL = '<img class="anvil" src="assets/brand/ironkin-symbol-bone.svg" alt="" width="56" height="30">';
  const BAG_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 8h12l-1 13H7L6 8Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  // ---------- Bag (stored in this browser) ----------
  const BAG_KEY = "ironkin-bag";
  const readBag = () => { try { return JSON.parse(localStorage.getItem(BAG_KEY)) || []; } catch { return []; } };
  const writeBag = (items) => { try { localStorage.setItem(BAG_KEY, JSON.stringify(items)); } catch {} renderBag(); };
  function addToBag(id, size) {
    const items = readBag();
    const hit = items.find((i) => i.id === id && i.size === size);
    if (hit) hit.qty += 1; else items.push({ id, size, qty: 1 });
    writeBag(items);
  }

  // ---------- Header and footer ----------
  function header() {
    const links = [["index.html", "Home", "home"], ["shop.html", "Shop", "shop"], ["about.html", "About Us", "about"]];
    const nav = links.map(([href, label, key]) =>
      `<a href="${href}"${(key === page || (key === "shop" && page === "product")) ? ' aria-current="page"' : ""}>${label}</a>`).join("");
    return `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  ${C.previewMode ? '<div class="announce" role="note">Preview store · checkout not connected yet</div>' : ""}
  <div class="bar">
    <button class="menu-btn" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span><span></span></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">${nav}</nav>
    <a class="brand" href="index.html" aria-label="IRONKIN home">${WORDMARK}</a>
    <button class="bag-btn" aria-label="Open bag, 0 items" aria-haspopup="dialog">${BAG_ICON}<span class="bag-count" hidden>0</span></button>
  </div>
</header>`;
  }

  function footer() {
    const link = (key, label, ext) => C.links[key]
      ? `<a href="${esc(C.links[key])}"${ext ? ' target="_blank" rel="noopener"' : ""}>${label}${ext ? ' <span aria-hidden="true">↗</span>' : ""}</a>`
      : `<span class="soon" title="Link coming soon">${label}</span>`;
    return `
<footer class="site-footer">
  <div class="foot-brand">${ANVIL}<span class="foot-divider" aria-hidden="true"></span><div>${WORDMARK}<p class="motto">STRIVE. FORGE. BELONG.</p></div></div>
  <nav class="foot-links" aria-label="Footer">${link("contact", "Contact")}${link("instagram", "Instagram", true)}${link("shipping", "Shipping")}${link("returns", "Returns")}</nav>
</footer>
<div class="bag-panel" role="dialog" aria-modal="true" aria-labelledby="bag-title" hidden>
  <div class="bag-scrim" data-close></div>
  <aside class="bag-sheet">
    <div class="bag-head"><h2 id="bag-title">Your bag</h2><button class="icon-btn" data-close aria-label="Close bag">✕</button></div>
    <div class="bag-items"></div>
    <div class="bag-foot"></div>
  </aside>
</div>
<div class="toast" role="status" aria-live="polite"></div>`;
  }

  function renderBag() {
    const items = readBag().filter((i) => product(i.id));
    const count = items.reduce((n, i) => n + i.qty, 0);
    const badge = $(".bag-count"), btn = $(".bag-btn");
    if (badge) { badge.textContent = count; badge.hidden = count === 0; }
    if (btn) btn.setAttribute("aria-label", `Open bag, ${count} item${count === 1 ? "" : "s"}`);
    const list = $(".bag-items"), foot = $(".bag-foot");
    if (!list) return;
    list.innerHTML = items.length ? items.map((i, n) => {
      const p = product(i.id);
      return `<div class="bag-line"><img src="${p.images[0].src}" alt="" width="72" height="90">
        <div><a href="product.html?id=${p.id}">${esc(p.name)}</a><p>${esc(p.colour)} · Size ${esc(i.size)}</p>
        <div class="qty"><button data-q="${n}" data-d="-1" aria-label="Decrease quantity">−</button><span aria-label="Quantity">${i.qty}</span><button data-q="${n}" data-d="1" aria-label="Increase quantity">+</button>
        <button class="link-btn" data-rm="${n}">Remove</button></div></div></div>`;
    }).join("") : '<p class="bag-empty">Your bag is empty.</p>';
    const checkout = C.checkoutUrl
      ? `<a class="btn btn-red btn-block" href="${esc(C.checkoutUrl)}">Checkout</a>`
      : '<button class="btn btn-block" disabled>Checkout not connected</button><p class="bag-note">Preview store: prices and checkout are added when the store platform is set up.</p>';
    foot.innerHTML = items.length ? checkout : "";
  }

  function wireShell() {
    document.body.insertAdjacentHTML("afterbegin", header());
    if (page === "home") {
      document.body.classList.add("over-hero");
      const hdr = $(".site-header");
      const onScroll = () => hdr.classList.toggle("solid", window.scrollY > 40);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    document.body.insertAdjacentHTML("beforeend", footer());
    const menu = $(".menu-btn"), nav = $("#site-nav");
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", open);
      menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("open", open);
    });
    const panel = $(".bag-panel");
    let lastFocus = null;
    const openBag = () => { lastFocus = document.activeElement; renderBag(); panel.hidden = false; document.body.classList.add("locked"); $(".bag-sheet .icon-btn").focus(); };
    const closeBag = () => { panel.hidden = true; document.body.classList.remove("locked"); if (lastFocus) lastFocus.focus(); };
    $(".bag-btn").addEventListener("click", openBag);
    panel.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) return closeBag();
      const q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
      if (q || rm) {
        const items = readBag();
        if (q) { const it = items[+q.dataset.q]; it.qty += +q.dataset.d; if (it.qty < 1) items.splice(+q.dataset.q, 1); }
        if (rm) items.splice(+rm.dataset.rm, 1);
        writeBag(items);
      }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) closeBag(); });
    renderBag();
    window.IK = { openBag };
  }

  function toast(msg) {
    const t = $(".toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // ---------- Shared pieces ----------
  function productCard(p, lazy = true) {
    const c = collection(p.collection);
    const back = p.images[1];
    return `<article class="card">
      <a class="card-media" href="product.html?id=${p.id}" aria-label="${esc(p.name)}, ${esc(p.colour)}">
        <img src="${p.images[0].src}" alt="${esc(p.images[0].alt)}" width="1000" height="1250"${lazy ? ' loading="lazy"' : ""}>
        ${back ? `<img class="alt" src="${back.src}" alt="" width="1000" height="1250" loading="lazy" aria-hidden="true">` : ""}
      </a>
      <h3>${esc(p.name)}</h3>
      <p class="card-meta">${c.id} / ${esc(c.name)} · ${esc(p.colour)}</p>
      ${p.price ? `<p class="card-price">${esc(p.price)}</p>` : ""}
      <a class="btn btn-outline btn-sm" href="product.html?id=${p.id}">View item</a>
    </article>`;
  }

  const FILTERS = [["all", "All"], ...C.collections.map((c) => [c.id, c.label.charAt(0) + c.label.slice(1).toLowerCase()]), ["women", "Women"]];
  function filterBar(active) {
    return `<div class="filters" role="group" aria-label="Filter products">${FILTERS.map(([k, l]) =>
      `<button class="chip${k === active ? " on" : ""}" data-filter="${k}" aria-pressed="${k === active}">${l}</button>`).join("")}</div>`;
  }
  function filtered(key) {
    if (key === "women") return live.filter((p) => p.women);
    if (key === "all") return live;
    return live.filter((p) => p.collection === key);
  }
  function gridHTML(key) {
    const list = filtered(key);
    if (list.length) return list.map((p, i) => productCard(p, i >= 3)).join("");
    const c = collection(key);
    return `<div class="empty"><p class="eyebrow">${c ? `${c.id} / ${esc(c.name)}` : ""}</p><h3>${c && c.comingSoon ? "Dropping soon." : "Nothing here yet."}</h3>
      <p>The pieces for this collection are not in the store yet.</p><button class="btn btn-outline btn-sm" data-filter="all">See all products</button></div>`;
  }
  function wireFilters(root, onChange) {
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      onChange(b.dataset.filter);
    });
  }

  // ---------- Home ----------
  function home() {
    const h = C.hero;
    const c = C.collections[0];
    const panel = (img, alt, label, title, href, cta, pos = "center") => `
<section class="panel">
  <img src="${img}" alt="${esc(alt)}" loading="lazy" style="object-position:${pos}">
  <div class="panel-copy">
    ${title ? `<h2 class="display">${title}</h2>` : ""}
    <p class="bracket">[ ${esc(label)} ]</p>
    <a class="btn btn-ghost" href="${href}">${esc(cta)}</a>
  </div>
</section>`;
    $("#main").innerHTML = `
<section class="hero hero-full" aria-label="${esc(h.label)}">
  <picture class="hero-poster">
    <source media="(max-width: 700px)" srcset="${h.poster.mobile}">
    <img src="${h.poster.desktop}" alt="${esc(h.poster.alt)}" width="1920" height="1080" fetchpriority="high">
  </picture>
  <video class="hero-video" muted loop playsinline preload="none" aria-hidden="true" hidden></video>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-copy">
    <p class="bracket">[ ${esc(c.id)} / ${esc(c.name)} ]</p>
    <a class="btn btn-ghost" href="${h.href}">Shop now</a>
  </div>
  <a class="scroll-cue" href="#collection" aria-label="Scroll to the collection"><span></span></a>
  <button class="hero-toggle" hidden aria-label="Pause background video"><span class="i-pause" aria-hidden="true"></span></button>
</section>

<div id="collection">
${panel(c.panel || c.image, c.alt, `${c.id} / ${c.name}`, "", `shop.html?collection=${c.id}`, "Shop now", "center 20%")}
${panel("assets/img/about-crew.jpg", "Five friends in IRONKIN hoodies, wide-leg pants and compression laughing together between sets in a warm-lit gym",
        "Our story", "Different lives.<br>Shared strength.", "about.html", "Read more", "center 35%")}
</div>

<section class="shop-block" aria-labelledby="stc">
  <h2 id="stc" class="display italic center">Shop the collection</h2>
  ${filterBar("all")}
  <div class="grid grid-4" id="home-grid">${gridHTML("all")}</div>
</section>

<section class="detail-banner" aria-label="Built into every detail">
  <div class="detail-media"><img src="assets/img/detail-anvil-macro.jpg" alt="Macro of the raised cream split-anvil embroidery on black cotton Milton" width="520" height="454" loading="lazy"></div>
  <p class="detail-text">BUILT INTO EVERY DETAIL.</p>
</section>

<section class="join" aria-labelledby="join-title">
  <h2 id="join-title" class="display italic">Join the kin</h2>
  <p>New drops, restocks and training sessions first. No spam.</p>
  <form class="join-form" novalidate>
    <label class="sr-only" for="join-email">Email address</label>
    <input id="join-email" type="email" placeholder="Your email" autocomplete="email">
    <button class="btn btn-red" type="submit">Join</button>
  </form>
  <p class="note join-note" aria-live="polite"></p>
</section>`;

    const grid = $("#home-grid"), block = $(".shop-block");
    wireFilters(block, (key) => {
      block.querySelectorAll(".chip").forEach((b) => { const on = b.dataset.filter === key; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      grid.innerHTML = gridHTML(key);
    });
    // Sign-up is not connected to an email service yet; nothing is stored or sent.
    $(".join-form").addEventListener("submit", (e) => {
      e.preventDefault();
      $(".join-note").textContent = "Sign-up opens with the store launch. Nothing was saved.";
    });
    heroVideo();
  }

  function heroVideo() {
    const v = $(".hero-video"), btn = $(".hero-toggle"), poster = $(".hero-poster");
    if (reducedMotion || !C.hero.video.enabled) return;  // poster only
    const src = window.matchMedia("(max-width: 700px)").matches ? C.hero.video.mobile : C.hero.video.desktop;
    v.src = src;
    v.addEventListener("canplay", () => {
      v.hidden = false;
      v.play().then(() => { poster.classList.add("under"); btn.hidden = false; }).catch(() => { v.hidden = true; });
    }, { once: true });
    v.addEventListener("error", () => { v.hidden = true; });  // no clip yet: keep the poster
    v.load();
    btn.addEventListener("click", () => {
      if (v.paused) { v.play(); btn.setAttribute("aria-label", "Pause background video"); btn.firstElementChild.className = "i-pause"; }
      else { v.pause(); btn.setAttribute("aria-label", "Play background video"); btn.firstElementChild.className = "i-play"; }
    });
  }

  // ---------- Shop ----------
  function shop() {
    const params = new URLSearchParams(location.search);
    let key = params.get("collection") || params.get("filter") || "all";
    if (!FILTERS.some(([k]) => k === key)) key = "all";
    const heading = () => {
      const c = collection(key);
      return c ? `${c.id} / ${esc(c.name)}` : key === "women" ? "Women" : "Shop the collections";
    };
    $("#main").innerHTML = `
<section class="shop-page">
  <p class="eyebrow center">Shop</p>
  <h1 class="display italic center" id="shop-title">${heading()}</h1>
  ${filterBar(key)}
  <p class="result-count" aria-live="polite"></p>
  <div class="grid" id="shop-grid"></div>
</section>`;
    const grid = $("#shop-grid"), count = $(".result-count"), wrap = $(".shop-page");
    const render = () => {
      grid.innerHTML = gridHTML(key);
      const n = filtered(key).length;
      count.textContent = `${n} product${n === 1 ? "" : "s"}`;
      $("#shop-title").innerHTML = heading();
      wrap.querySelectorAll(".chip").forEach((b) => { const on = b.dataset.filter === key; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      document.title = `${heading().replace(/&amp;/g, "&")} · IRONKIN`;
    };
    wireFilters(wrap, (k) => {
      key = k;
      const url = new URL(location);
      url.search = k === "all" ? "" : (/^\d+$/.test(k) ? `?collection=${k}` : `?filter=${k}`);
      history.replaceState(null, "", url);
      render();
    });
    render();
  }

  // ---------- Product ----------
  function productPage() {
    const p = product(new URLSearchParams(location.search).get("id"));
    if (!p) {
      $("#main").innerHTML = '<section class="shop-page"><h1 class="display center">Product not found</h1><p class="center"><a class="btn btn-outline" href="shop.html">Back to shop</a></p></section>';
      return;
    }
    const c = collection(p.collection);
    document.title = `${p.name} · ${p.colour} · IRONKIN`;
    const set = (p.completeTheSet || []).map(product).filter(Boolean);
    $("#main").innerHTML = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="shop.html">Shop</a> / <a href="shop.html?collection=${c.id}">${c.id} / ${esc(c.name)}</a> / <span aria-current="page">${esc(p.name)}</span></nav>
<section class="pdp">
  <div class="gallery">
    <div class="gallery-main"><img id="gmain" src="${p.images[0].src}" alt="${esc(p.images[0].alt)}" width="1000" height="1250"></div>
    <div class="thumbs" role="list">${p.images.map((im, i) => `<button role="listitem" class="thumb${i ? "" : " on"}" data-i="${i}" aria-label="Show image ${i + 1}: ${esc(im.alt)}" aria-pressed="${!i}"><img src="${im.src}" alt=""></button>`).join("")}</div>
  </div>
  <div class="buy">
    <p class="eyebrow">${c.id} / ${esc(c.name)}</p>
    <h1 class="display">${esc(p.name)}</h1>
    ${p.price ? `<p class="price">${esc(p.price)}</p>` : '<p class="price muted">Price coming soon</p>'}
    <p class="colour"><span class="swatch" style="background:${p.swatch}"></span>${esc(p.colour)}</p>
    <fieldset class="sizes"><legend>Size</legend>
      <div class="size-row">${p.sizes.map((s) => `<label><input type="radio" name="size" value="${s}"><span>${s}</span></label>`).join("")}</div>
      ${p.sizesConfirmed ? "" : '<p class="note">Size range to be confirmed.</p>'}
    </fieldset>
    <button class="link-btn size-guide" type="button">Size guide</button>
    <button class="btn btn-red btn-block add" type="button">Add to bag</button>
    <p class="note add-note" aria-live="polite"></p>
    ${C.previewMode ? '<p class="note">Preview store: the bag works here, checkout is not connected yet.</p>' : ""}
    <p class="summary">${esc(p.summary)}</p>
    <details open><summary>Fit &amp; details</summary><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
      <p class="note">Fabric composition, care and shipping details to be confirmed.</p></details>
  </div>
</section>
${set.length ? `<section class="set"><hr class="red-rule"><h2 class="display italic center">Complete the set</h2><div class="grid grid-set">${set.map((s) => productCard(s)).join("")}</div></section>` : ""}
<dialog class="guide" aria-labelledby="sg"><h2 id="sg" class="display">Size guide</h2><p>Measurements will be added once the size run is confirmed with the factory.</p><button class="btn btn-outline btn-sm" value="close" formmethod="dialog">Close</button></dialog>`;

    const main = $("#gmain");
    $(".thumbs").addEventListener("click", (e) => {
      const b = e.target.closest(".thumb"); if (!b) return;
      const im = p.images[+b.dataset.i];
      main.src = im.src; main.alt = im.alt;
      main.classList.toggle("contain", im.src.includes("-detail-"));
      document.querySelectorAll(".thumb").forEach((t) => { t.classList.toggle("on", t === b); t.setAttribute("aria-pressed", t === b); });
    });
    const note = $(".add-note");
    $(".add").addEventListener("click", () => {
      const size = document.querySelector('input[name="size"]:checked');
      if (!size) { note.textContent = "Choose a size first."; $(".size-row input").focus(); return; }
      note.textContent = "";
      addToBag(p.id, size.value);
      toast(`${p.name}, size ${size.value}, added to bag`);
    });
    const dlg = $(".guide");
    $(".size-guide").addEventListener("click", () => dlg.showModal());
    dlg.querySelector("button").addEventListener("click", () => dlg.close());
  }

  // ---------- About ----------
  function about() {
    const panels = [
      ["01 / STRIVE", "Bring your effort.", ["Start where you are.", "Show up with what you have.", "Your effort belongs here."], "red"],
      ["02 / FORGE", "Strength takes shape.", ["Built through practice.", "Shaped by patience.", "Made stronger together."], "black"],
      ["03 / BELONG", "Make room for one more.", ["Spot the last rep.", "Teach the first movement.", "Let someone know they belong."], "red"],
    ];
    $("#main").innerHTML = `
<section class="about-hero">
  <img src="assets/img/about-crew.jpg" alt="Five friends in IRONKIN hoodies, wide-leg pants and compression laughing together between sets in a warm-lit gym" width="1672" height="941">
  <div class="about-hero-copy">
    <p class="eyebrow">About us</p>
    <h1 class="display">Different lives.<br>Shared strength.</h1>
    <p>IRONKIN is a community for lifters and athletes. Different backgrounds. A shared commitment to grow and help each other grow.</p>
  </div>
</section>
<section class="code" aria-labelledby="code-title">
  <div class="code-intro texture black">
    <p class="eyebrow red-text">The IRONKIN code</p>
    <h2 id="code-title" class="display grit">Strive.<br>Forge.<br>Belong.</h2>
    <img class="ik" src="assets/brand/ik-mark.svg" alt="IRONKIN IK mark" width="72" height="72">
  </div>
  ${panels.map(([n, h, lines, tone]) => `<article class="code-panel texture ${tone}">
    <p class="eyebrow">${n}</p><span class="rule-short light"></span>
    <h3 class="display grit">${h}</h3>
    <p>${lines.join("<br>")}</p>
    <img class="ik" src="assets/brand/ik-mark.svg" alt="" width="52" height="52">
  </article>`).join("")}
</section>
<section class="closing">
  <img src="assets/img/about-closing.jpg" alt="Two IRONKIN athletes standing in front of a loaded barbell rack under an IRONKIN banner" width="1122" height="1080" loading="lazy">
  <div class="closing-copy">
    <p class="display">Iron is what we train with.<br>Kin is who we become.</p>
    <a class="btn btn-red" href="shop.html">Shop the collections</a>
  </div>
</section>`;
  }

  wireShell();
  ({ home, shop, product: productPage, about })[page]?.();
})();
