// IRONKIN Collection 001 catalog. Edit here: products, looks, sizes, stock and prices.
// price: null hides the price until it is set (shown as "Price at launch").
// soldOut: sizes listed here show as unavailable on the ruler.
window.IK_DATA = {
  currency: "EGP",
  // Until the live store is connected, checkout runs as a demo: no order is sent, no payment is taken.
  demoCheckout: true,
  payments: { card: false, cod: true },   // card opens with the commerce platform
  countries: ["Egypt", "Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Bahrain", "Oman", "Jordan"],

  products: [
    {
      id: "signature-hoodie", name: "Signature Hoodie", colour: "Black / Cream", category: "Tops", sport: "strength",
      price: null, sizes: ["XS", "S", "M", "L", "XL", "XXL"], soldOut: [], hanger: "top", guide: "top",
      cut: "p-hoodie-black-front", cutBack: "p-hoodie-black-back",
      summary: "Heavyweight black cotton Milton with exposed cream overlock on every seam, a raised split-anvil on the chest and arched IRONKIN lettering across the back.",
      details: ["Heavyweight cotton Milton, brushed inside", "Exposed cream overlock on shoulder, pocket, cuff and hem seams", "Raised cream split-anvil on the left chest", "Arched IRONKIN applique across the back", "Oversized fit, dropped shoulder"],
      gallery: [
        { src: "p-hoodie-black-front", kind: "cut", label: "Front", alt: "Signature Hoodie, front, with the cream split-anvil on the chest" },
        { src: "p-hoodie-black-back", kind: "cut", label: "Back", alt: "Signature Hoodie, back, with arched IRONKIN lettering" },
        { src: "c-strength", kind: "photo", label: "On body", alt: "Athlete in the Signature Hoodie and Wide-Leg Pant in the gym" },
        { src: "d-hoodie-anvil", kind: "photo", label: "Chest anvil", alt: "Close-up of the raised cream split-anvil" },
        { src: "d-hoodie-lettering", kind: "photo", label: "Back lettering", alt: "Close-up of the arched IRONKIN back lettering" },
        { src: "d-hoodie-stitch", kind: "photo", label: "Overlock", alt: "Close-up of the cream overlock on the pocket and hem" },
      ],
    },
    {
      id: "wide-leg-pant", name: "Wide-Leg Pant", colour: "Black / Cream", category: "Bottoms", sport: "strength",
      price: null, sizes: ["XS", "S", "M", "L", "XL", "XXL"], soldOut: [], hanger: "bottom", guide: "bottom",
      cut: "p-pants-black-front", cutBack: "p-pants-black-back",
      summary: "Wide straight-leg pant in black with a cream stripe down each side, IRONKIN on the front hip and a rear patch pocket with the split-anvil.",
      details: ["Heavyweight cotton Milton, brushed inside", "Elastic waist, clean exterior", "Cream side stripe on each leg", "IRONKIN wordmark on the front hip", "Rear patch pocket with embroidered split-anvil"],
      gallery: [
        { src: "p-pants-black-front", kind: "cut", label: "Front", alt: "Wide-Leg Pant, front, with cream side stripes and IRONKIN on the hip" },
        { src: "p-pants-black-back", kind: "cut", label: "Back", alt: "Wide-Leg Pant, back, with the anvil patch pocket" },
        { src: "c-strength", kind: "photo", label: "On body", alt: "Athlete in the Wide-Leg Pant and Signature Hoodie in the gym" },
        { src: "d-pants-pocket", kind: "photo", label: "Patch pocket", alt: "Close-up of the rear patch pocket and its anvil" },
        { src: "d-pants-wordmark", kind: "photo", label: "Hip wordmark", alt: "Close-up of the IRONKIN wordmark on the front hip" },
        { src: "d-pants-stripe", kind: "photo", label: "Side stripe", alt: "Close-up of the cream side stripe at the hem" },
      ],
    },
    {
      id: "compression-tee", name: "Compression Tee", colour: "Black / Cream", category: "Tops", sport: "jiujitsu",
      price: null, sizes: ["S", "M", "L", "XL", "XXL"], soldOut: [], hanger: "top", guide: "top",
      cut: "p-compression-black-front", cutBack: "p-compression-black-back",
      summary: "Second-skin black compression tee with raglan sleeves, cream overlock tracing the contour seams and a cream split-anvil on the chest.",
      details: ["Compression knit with stretch", "Raglan sleeves", "Cream overlock along the contour seams", "Cream split-anvil on the left chest", "Fitted, second-skin feel"],
      gallery: [
        { src: "p-compression-black-front", kind: "cut", label: "Front", alt: "Compression Tee, front, with the cream anvil on the chest" },
        { src: "p-compression-black-back", kind: "cut", label: "Back", alt: "Compression Tee, back, with cream contour seams" },
        { src: "c-jiujitsu", kind: "photo", label: "On body", alt: "Jiu-jitsu athlete in the Compression Tee on the mats" },
        { src: "d-compression-anvil", kind: "photo", label: "Chest anvil", alt: "Close-up of the cream split-anvil on the chest" },
        { src: "d-compression-seam", kind: "photo", label: "Overlock", alt: "Close-up of the cream overlock on the raglan seam" },
      ],
    },
    {
      id: "fitted-tee", name: "Fitted Tee", colour: "Washed Rose / Oxblood", category: "Tops", sport: "padel",
      price: null, sizes: ["XS", "S", "M", "L", "XL"], soldOut: [], hanger: "top", guide: "top",
      cut: "p-tee-rose-front", cutBack: "p-tee-rose-back",
      summary: "Fitted washed-rose tee with contour seams, an oxblood split-anvil on the chest and arched IRONKIN across the back.",
      details: ["Soft waffle knit", "Fitted shape with contour seams", "Oxblood split-anvil on the chest", "Arched oxblood IRONKIN on the back"],
      gallery: [
        { src: "p-tee-rose-front", kind: "cut", label: "Front", alt: "Fitted Tee in washed rose, front" },
        { src: "p-tee-rose-back", kind: "cut", label: "Back", alt: "Fitted Tee in washed rose, back, with arched IRONKIN" },
        { src: "c-padel", kind: "photo", label: "On body", alt: "Padel player in the Fitted Tee and Flared Pant on court" },
      ],
    },
    {
      id: "flared-pant", name: "Flared Pant", colour: "Washed Rose / Oxblood", category: "Bottoms", sport: "padel",
      price: null, sizes: ["XS", "S", "M", "L", "XL"], soldOut: [], hanger: "bottom", guide: "bottom",
      cut: "p-flare-rose-front", cutBack: "p-flare-rose-back",
      summary: "Washed-rose flared pant with a broad waistband, oxblood piping down each leg and a small split-anvil on the front hip.",
      details: ["Stretch knit", "Broad waistband", "Fitted thigh opening to a flare", "Oxblood piping down each outer leg", "Oxblood split-anvil on the left hip"],
      gallery: [
        { src: "p-flare-rose-front", kind: "cut", label: "Front", alt: "Flared Pant in washed rose, front, with oxblood piping" },
        { src: "p-flare-rose-back", kind: "cut", label: "Back", alt: "Flared Pant in washed rose, back" },
        { src: "c-padel", kind: "photo", label: "On body", alt: "Padel player in the Flared Pant and Fitted Tee on court" },
        { src: "d-flare-anvil", kind: "photo", label: "Hip anvil", alt: "Close-up of the oxblood anvil on the hip" },
        { src: "d-flare-piping", kind: "photo", label: "Piping", alt: "Close-up of the oxblood piping" },
      ],
    },
  ],

  // The Collection 001 rail on Home and the Collection page, left to right.
  // Each item hangs one or two pieces. h: garment height (1 = tallest), r: cut-out width / height.
  rail: [
    { name: "Wide-Leg Pant", link: "wide-leg-pant", pieces: [{ id: "wide-leg-pant", h: 0.98, r: 0.543 }] },
    { name: "Signature Hoodie", link: "signature-hoodie", pieces: [{ id: "signature-hoodie", h: 0.94, r: 0.953 }] },
    { name: "Compression Tee", link: "compression-tee", pieces: [{ id: "compression-tee", h: 0.72, r: 0.856 }] },
    { name: "Washed Rose Set", link: "fitted-tee", pieces: [{ id: "fitted-tee", h: 0.56, r: 0.815 }, { id: "flared-pant", h: 1, r: 0.442 }] },
  ],

  // The three looks on the Shop the look page. Each is dressed with the product cut-outs.
  looks: [
    { id: "strength", name: "Strength", products: ["signature-hoodie", "wide-leg-pant"], top: "p-hoodie-black-front", bottom: "p-pants-black-front", topW: 1.42, photo: "c-strength" },
    { id: "jiujitsu", name: "Jiu-Jitsu", products: ["compression-tee"], top: "p-compression-black-front", bottom: null, topW: 1, photo: "c-jiujitsu" },
    { id: "padel", name: "Padel", products: ["fitted-tee", "flared-pant"], top: "p-tee-rose-front", bottom: "p-flare-rose-front", topW: 1.22, photo: "c-padel" },
  ],

  // Size guide: points of measure. Centimetre values are being finalised with the factory.
  guides: {
    top: ["Body length from high shoulder", "Chest width, 2 cm below armhole", "Across shoulder", "Sleeve length", "Hem width"],
    bottom: ["Waist, relaxed (half)", "Hip width (half)", "Front rise", "Inseam", "Leg opening"],
  },
};
