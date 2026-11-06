# Store and landing pages

The IRONKIN storefront lives in [site/](site/): plain HTML, CSS and JavaScript, no build step.

## Run it locally

Double-click `03-website/start-site.bat`. It opens http://localhost:4173 and keeps the site running until you close its window.

Or from a terminal in the repo:

```bash
python -m http.server 4173 --bind 127.0.0.1 --directory 03-website/site
```

Then open http://localhost:4173.

## Pages

| Page | File | Notes |
|---|---|---|
| Home | `site/index.html` | Hero video slot, collection tiles, Shop the Collections, About preview, detail banner |
| Shop | `site/shop.html` | Filters: All, Winter (001), Compression (002), Pump Covers (003), Women. Links: `?collection=001`, `?filter=women` |
| Product | `site/product.html?id=<product id>` | Gallery, size, add to bag, Fit & details, Complete the Set |
| About Us | `site/about.html` | The IRONKIN Code panels as live text |

## Change content

Everything editable is in [site/assets/js/catalog.js](site/assets/js/catalog.js): the hero (collection, headline, button), collections, products, prices, sizes, footer links, preview mode and the checkout URL.

- **Hero video:** add `site/assets/video/hero-training-desktop.mp4` and `hero-training-mobile.mp4`. Until then the poster shows.
- **Images:** replace a file in `site/assets/img/` with the same name.
- **Prices:** set `price` on a product, for example `"EGP 1,450"`. Cards and product pages hide prices while they are `null`.
- **Collection 003:** when its products arrive, add them with `collection: "003"` and switch the hero as described in `catalog.js`.

## Status

- Preview store: the bag works in the visitor's browser, checkout is not connected. Set `checkoutUrl` or connect a store platform to sell.
- Product images are cut from the supplied product boards by `tools/make_assets.py`. Campaign images are cropped from the website mockup and are low resolution placeholders; the home hero image shows Collection 003 pump covers and should be replaced with the training film poster.
- Not yet supplied: prices, size runs, fabric composition, care, shipping, social links, Collection 003 products, the hero film.
