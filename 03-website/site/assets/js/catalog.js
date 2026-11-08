// IRONKIN site content. Edit this file to change the hero, collections, products and links.
// Images live in assets/img; replace a file with the same name to swap it.

window.IRONKIN = {
  // Preview mode: the bag works in this browser, checkout is not connected yet.
  previewMode: true,
  checkoutUrl: null,

  // Hero. Collection 003 has no supplied campaign or products yet, so the hero features 001.
  // To switch to 003: set collection "003", title ["IRON", "KIN"], href "shop.html?collection=003".
  hero: {
    collection: "001",
    label: "COLLECTION 001",
    title: ["THE FIRST", "REP"],
    cta: "SHOP THE DROP",
    href: "shop.html?collection=001",
    // Set enabled to true once the clips are in assets/video, so the page does not request missing files.
    video: {
      enabled: true,
      // Hammer striking hot metal on an anvil. Stock clip, see assets/video/CREDITS.md.
      desktop: "assets/video/hero-anvil.mp4",
      mobile: "assets/video/hero-anvil.mp4",
    },
    poster: {
      desktop: "assets/img/hero-poster.jpg",
      mobile: "assets/img/hero-poster-mobile.jpg",
      alt: "A hammer striking glowing hot metal on a worn iron anvil",
    },
  },

  // Only Collection 001 is live. Add 002 and 003 back here when their products are ready.
  collections: [
    { id: "001", name: "THE FIRST REP", label: "WINTER", image: "assets/img/collection-001.jpg",
      alt: "A man in the black Signature Hoodie and Wide-Leg Pants and a woman in washed rose standing in a gym under an IRONKIN banner",
      blurb: "Heavyweight cotton Milton, cream stitching and washed rose. The first IRONKIN drop." },
  ],

  // Leave price null until confirmed; cards and product pages hide it.
  // sizesConfirmed: false shows the placeholder size run with a note.
  products: [
    {
      id: "signature-hoodie-black",
      name: "Signature Hoodie",
      collection: "001",
      colour: "Black",
      swatch: "#0F0F0E",
      women: false,
      price: null,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      sizesConfirmed: false,
      summary: "Heavyweight smooth cotton Milton with cream exposed stitching, a raised split-anvil on the chest and an arched IRONKIN applique across the back.",
      details: [
        "Smooth cotton Milton outer face",
        "Brushed interior",
        "Exposed cream overlock stitching",
        "Raised cream split-anvil on the chest",
        "Arched cream IRONKIN varsity applique on the back",
      ],
      images: [
        { src: "assets/img/001-signature-hoodie-black-front.jpg?v=10", alt: "Black Signature Hoodie, front, with small cream anvil on the left chest" },
        { src: "assets/img/001-signature-hoodie-black-back.jpg?v=10", alt: "Black Signature Hoodie, back, with arched cream IRONKIN applique" },
        { src: "assets/img/001-signature-hoodie-black-detail-chest.jpg?v=10", alt: "Close-up of the raised cream split-anvil on the hoodie chest" },
        { src: "assets/img/001-signature-hoodie-black-detail-stitch.jpg?v=10", alt: "Close-up of the cream exposed overlock stitching" },
        { src: "assets/img/001-signature-hoodie-black-detail-fabric.jpg?v=10", alt: "Close-up of the smooth black cotton Milton surface" },
      ],
      completeTheSet: ["wide-leg-pants-black"],
    },
    {
      id: "wide-leg-pants-black",
      name: "Wide-Leg Pants",
      collection: "001",
      colour: "Black",
      swatch: "#0F0F0E",
      women: false,
      price: null,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      sizesConfirmed: false,
      summary: "Cotton Milton wide-leg pants with a clean elastic waistband, an internal drawcord, one cream stitch line down each outer seam and a rear anvil pocket.",
      details: [
        "Smooth cotton Milton face, brushed reverse inside",
        "Elastic waist with internal drawcord, clean exterior waistband",
        "Wide straight leg with open hems",
        "Cream overlock along each outer side seam",
        "Right rear pocket with raised embroidered split-anvil",
      ],
      images: [
        { src: "assets/img/001-wide-leg-pants-black-front.jpg?v=10", alt: "Black wide-leg pants, front, clean waistband and cream side seams" },
        { src: "assets/img/001-wide-leg-pants-black-back.jpg?v=10", alt: "Black wide-leg pants, back, with anvil patch pocket" },
        { src: "assets/img/001-wide-leg-pants-black-detail-pocket.jpg?v=10", alt: "Close-up of the right rear pocket with embroidered anvil" },
        { src: "assets/img/001-wide-leg-pants-black-detail-stitch.jpg?v=10", alt: "Close-up of the cream overlock on the outer side seam" },
        { src: "assets/img/001-wide-leg-pants-black-detail-fabric.jpg?v=10", alt: "Close-up of the smooth cotton Milton face" },
        { src: "assets/img/001-wide-leg-pants-black-detail-drawcord.jpg?v=10", alt: "Waistband folded outward to show the internal drawcord" },
      ],
      completeTheSet: ["signature-hoodie-black"],
    },
    {
      id: "womens-fitted-tee-washed-rose",
      name: "Women's Fitted Tee",
      collection: "001",
      colour: "Washed Rose",
      swatch: "#C98F8F",
      women: true,
      price: null,
      sizes: ["XS", "S", "M", "L", "XL"],
      sizesConfirmed: false,
      summary: "A fitted scoop-neck tee in washed rose with contour seams, an oxblood split-anvil on the chest and an arched IRONKIN across the back.",
      details: [
        "Fitted shape with contour seams",
        "Scoop neck with neckline binding",
        "Oxblood split-anvil on the chest",
        "Arched oxblood IRONKIN on the back",
      ],
      images: [
        { src: "assets/img/001-womens-tee-washed-rose-front.jpg?v=10", alt: "Washed rose fitted tee, front, with oxblood anvil on the chest" },
        { src: "assets/img/001-womens-tee-washed-rose-back.jpg?v=10", alt: "Washed rose fitted tee, back, with arched oxblood IRONKIN" },
        { src: "assets/img/001-womens-tee-washed-rose-detail-chest.jpg?v=10", alt: "Close-up of the oxblood split-anvil on washed rose knit" },
        { src: "assets/img/001-womens-tee-washed-rose-detail-neck.jpg?v=10", alt: "Close-up of the scoop neckline binding" },
        { src: "assets/img/001-womens-tee-washed-rose-detail-seam.jpg?v=10", alt: "Close-up of the contour seam" },
      ],
      completeTheSet: ["womens-flared-leggings-washed-rose"],
    },
    {
      id: "womens-flared-leggings-washed-rose",
      name: "Women's Flared Leggings",
      collection: "001",
      colour: "Washed Rose",
      swatch: "#C98F8F",
      women: true,
      price: null,
      sizes: ["XS", "S", "M", "L", "XL"],
      sizesConfirmed: false,
      summary: "Washed rose flared leggings with a broad waistband, a fitted thigh, oxblood piping down each outer leg and a small anvil on the front hip.",
      details: [
        "Broad waistband",
        "Fitted thigh opening to a flared hem",
        "Oxblood piping along each outer leg",
        "Small oxblood split-anvil on the left front hip",
      ],
      images: [
        { src: "assets/img/001-womens-flare-washed-rose-front.jpg?v=10", alt: "Washed rose flared leggings, front, with oxblood side piping" },
        { src: "assets/img/001-womens-flare-washed-rose-back.jpg?v=10", alt: "Washed rose flared leggings, back" },
        { src: "assets/img/001-womens-flare-washed-rose-detail-hip.jpg?v=10", alt: "Close-up of the oxblood anvil on the left hip" },
        { src: "assets/img/001-womens-flare-washed-rose-detail-piping.jpg?v=10", alt: "Close-up of the oxblood outer piping" },
        { src: "assets/img/001-womens-flare-washed-rose-detail-waist.jpg?v=10", alt: "Close-up of the broad waistband" },
        { src: "assets/img/001-womens-flare-washed-rose-detail-hem.jpg?v=10", alt: "Close-up of the flared hem" },
      ],
      completeTheSet: ["womens-fitted-tee-washed-rose"],
    },
    {
      id: "compression-ss-black",
      hidden: true,  // Collection 002 is not released yet.
      name: "Short-Sleeve Compression",
      collection: "002",
      colour: "Black",
      swatch: "#0F0F0E",
      women: false,
      price: null,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      sizesConfirmed: false,
      summary: "A fitted short-sleeve compression top with weathered graphite graphics, a centred split-anvil and a small IRONKIN mark at the hem.",
      details: [
        "Fitted short sleeves",
        "Weathered graphite graphics on the shoulders and sides",
        "Centred split-anvil on the chest",
        "Small IRONKIN mark at the front hem",
      ],
      images: [
        { src: "assets/img/002-compression-ss-black-front.jpg?v=10", alt: "Black short-sleeve compression top, front, with graphite graphics and centred anvil" },
        { src: "assets/img/002-compression-ss-black-back.jpg?v=10", alt: "Black short-sleeve compression top, back, with graphite graphics" },
        { src: "assets/img/002-compression-ss-black-detail-chest.jpg?v=10", alt: "Close-up of the weathered split-anvil on the chest" },
        { src: "assets/img/002-compression-ss-black-detail-graphic.jpg?v=10", alt: "Close-up of the weathered graphite graphic edge" },
        { src: "assets/img/002-compression-ss-black-detail-fabric.jpg?v=10", alt: "Close-up of the compression fabric surface" },
      ],
      completeTheSet: [],
    },
  ],

  // Footer links. null shows the link as "coming soon" until a URL is supplied.
  links: { contact: null, instagram: null, shipping: null, returns: null },
};
