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
    const links = [["index.html", "Home", "home"], ["line.html", "The Line", "line"], ["shop.html", "Shop", "shop"], ["about.html", "About Us", "about"]];
    const nav = links.map(([href, label, key]) =>
      `<a href="${href}"${(key === page || (key === "shop" && page === "product")) ? ' aria-current="page"' : ""}>${label}</a>`).join("");
    return `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="bar">
    <button class="menu-btn" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span><span></span></button>
    <a class="brand" href="index.html" aria-label="IRONKIN home">${WORDMARK}</a>
    <nav id="site-nav" class="site-nav" aria-label="Main">${nav}</nav>
    <button class="bag-btn" aria-label="Open bag, 0 items" aria-haspopup="dialog">${BAG_ICON}<span class="bag-count" hidden>0</span></button>
  </div>
</header>
${C.previewMode ? '<div class="preview-flag" role="note">Preview store · checkout not connected yet</div>' : ""}`;
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
    window.IK = { openBag, addToBag };
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

  // ---------- Motion ----------
  // Fade elements up as they scroll into view. Without IntersectionObserver, or with reduced
  // motion, nothing is hidden, so content never depends on the animation.
  const REVEAL = ".feature, .shop-block h2, .shop-block .filters, .card, .about-row > *, .craft-head, .craft-tile, .set h2, .shop-page h1, .code > *, .closing, .site-footer";
  let io = null;
  function reveal(root = document) {
    if (reducedMotion || !("IntersectionObserver" in window)) return;
    io = io || new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    root.querySelectorAll(`${REVEAL}, [data-reveal]`).forEach((el) => {
      if (el.classList.contains("rv")) return;
      // Stagger siblings in a grid row.
      if (el.classList.contains("card")) el.style.setProperty("--d", `${([...el.parentNode.children].indexOf(el) % 3) * 90}ms`);
      el.classList.add("rv");
      io.observe(el);
    });
  }

  // Close-ups for the details section: image, number, title, line, link.
  const CRAFT = [
    ["001-signature-hoodie-black-detail-back.jpg", "01", "Varsity back", "Arched cream IRONKIN applique, raised and stitched down.", "product.html?id=signature-hoodie-black"],
    ["001-signature-hoodie-black-detail-stitch.jpg", "02", "Exposed overlock", "Cream stitching traces every seam of the black Milton.", "product.html?id=signature-hoodie-black"],
    ["001-wide-leg-pants-black-detail-pocket.jpg", "03", "Anvil pocket", "A raised split-anvil on the right rear pocket.", "product.html?id=wide-leg-pants-black"],
    ["001-womens-flare-washed-rose-detail-piping.jpg", "04", "Oxblood piping", "One clean line down each leg of the washed rose flare.", "product.html?id=womens-flared-leggings-washed-rose"],
  ];

  // ---------- Home ----------
  function home() {
    const h = C.hero;
    const title = `${esc(h.title[0])} <span class="slash">/</span> ${esc(h.title[1])}`;
    $("#main").innerHTML = `
<section class="hero" aria-label="${esc(h.label)}">
  <picture class="hero-poster">
    <source media="(max-width: 700px)" srcset="${h.poster.mobile}">
    <img src="${h.poster.desktop}" alt="${esc(h.poster.alt)}" width="1800" height="673" fetchpriority="high">
  </picture>
  <video class="hero-video" muted loop playsinline preload="none" aria-hidden="true" hidden></video>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-copy">
    <p class="hero-label"><span class="rule"></span>${esc(h.label)}<span class="rule"></span></p>
    <h1 class="display italic">${title}</h1>
    <a class="btn btn-red" href="${h.href}">${esc(h.cta)}</a>
  </div>
  <button class="hero-toggle" hidden aria-label="Pause background video"><span class="i-pause" aria-hidden="true"></span></button>
</section>

<section class="collections" aria-label="Collections">
  ${C.collections.map((c) => `<article class="feature">
    <a class="feature-media" href="shop.html?collection=${c.id}"><img src="${c.image}" alt="${esc(c.alt)}" width="1122" height="1402" loading="lazy"></a>
    <div class="feature-copy">
      <p class="eyebrow"><span class="rule"></span> ${esc(c.label)}</p>
      <h2 class="display italic">${c.id} /<br>${esc(c.name)}</h2>
      <p>${esc(c.blurb || "")}</p>
      <p class="feature-count">${live.filter((p) => p.collection === c.id).length} pieces</p>
      <a class="btn btn-red" href="shop.html?collection=${c.id}">Shop ${c.id}</a>
    </div>
  </article>`).join("")}
</section>

<section class="shop-block" aria-labelledby="stc">
  <hr class="red-rule">
  <h2 id="stc" class="display italic center">Shop the collections</h2>
  ${filterBar("all")}
  <div class="grid" id="home-grid">${gridHTML("all")}</div>
</section>

<section class="about-preview" aria-labelledby="ap">
  <hr class="red-rule">
  <div class="about-row">
    <img src="assets/img/about-crew.jpg" alt="Five friends in IRONKIN hoodies, wide-leg pants and compression laughing together between sets in a warm-lit gym" width="1672" height="941" loading="lazy">
    <div>
      <p class="eyebrow">About us</p><span class="rule-short"></span>
      <h2 id="ap" class="display">Different lives.<br>Shared strength.</h2>
      <p>Built around training, shared effort and the people beside you.</p>
      <a class="btn btn-red" href="about.html">Our story</a>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${"<span>Strive</span><i></i><span>Forge</span><i></i><span>Belong</span><i></i>".repeat(4)}</div></div>

<section class="craft" aria-labelledby="craft-title">
  <div class="craft-head" data-reveal>
    <p class="eyebrow"><span class="rule"></span> The details</p>
    <h2 id="craft-title" class="display">Built into<br>every detail.</h2>
    <p>Small things you notice on the tenth wear, not the first. Every piece in 001 carries them.</p>
    <a class="text-link" href="shop.html?collection=001">Explore the pieces</a>
  </div>
  <div class="craft-grid">
    ${CRAFT.map(([img, n, title, line, href], i) => `<a class="craft-tile" href="${href}" data-reveal style="--d:${i * 90}ms">
      <span class="craft-img"><img src="assets/img/${img}" alt="" width="800" height="454" loading="lazy"></span>
      <span class="craft-cap"><span class="craft-n">${n}</span><span><strong>${title}</strong><span>${line}</span></span></span>
    </a>`).join("")}
  </div>
</section>`;

    const grid = $("#home-grid"), block = $(".shop-block");
    wireFilters(block, (key) => {
      block.querySelectorAll(".chip").forEach((b) => { const on = b.dataset.filter === key; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      grid.innerHTML = gridHTML(key);
      reveal(grid);
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
      reveal(grid);
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
  reveal();
  // Header turns solid once the page scrolls.
  const hdr = $(".site-header");
  const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
