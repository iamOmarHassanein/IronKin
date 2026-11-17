# IRONKIN website (v2, Collection 001)

Static site in `site/`. No build step.

## Run it

Double-click `start-site.bat`, or from this folder:

```bash
python -m http.server 4173 --directory site
```

Then open http://localhost:4173.

## Pages

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | Three looks (Strength, Jiu-Jitsu, Padel) on the amber floor light. Horizontal trackpad scroll, drag, swipe, arrows, tabs or arrow keys move them. The Shop the look panel follows the active look. `?look=padel` opens a look. |
| Collection 001 | `collection.html` | Garments on a steel rail with swaying hangers, plus a product grid. |
| Product | `product.html?id=...` | Gallery (front, back, on-body, details), size ruler, size guide drawer, Add to cart. |
| Campaign | `campaign.html` | Three sport panels, each linking to its look on Home. |
| Our Story | `story.html` | Brand introduction with the flag photo. |
| Checkout | `checkout.html` | Demo checkout: validates, then shows an order confirmation. Nothing is sent or charged. |
| Help | `info.html` | Contact, Shipping & Returns, Privacy (placeholders until the brand supplies them). |

## Edit content

Everything lives in `site/assets/js/data.js`: products, prices (`null` = "Price at launch"), sizes, sold-out sizes, the three looks, payment options and countries.

## Images

`site/media/` is built by `tools/v2_assets.py` from `source-v2/` (the supplied product photos and mockups):

```bash
python 03-website/tools/v2_assets.py
```

- `p-*.webp`: transparent product cut-outs (and `-sm` versions for the panel and cart).
- `d-*.webp`: construction close-ups cropped from the product photos.
- `c-*.webp`: campaign and story photos, cropped from the brand mockups. Replace with the real shoot.
- The Fitted Tee still uses the older board render; send a new front and back photo to match the others.

## Not connected yet

- Checkout runs as a demo (`demoCheckout: true`). Card payment is off until the commerce platform is connected.
- Prices, garment measurements, contact, shipping and privacy details are placeholders.
