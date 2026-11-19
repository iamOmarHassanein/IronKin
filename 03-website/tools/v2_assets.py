"""Build the v2 site's images from the supplied product photos and mockups.

Run from the repo root: python 03-website/tools/v2_assets.py
Inputs:  03-website/source-v2/   (product photos on white, the six mockups, the logo)
Outputs: 03-website/site/media/  (webp, transparent where noted)

The Home stage dresses its three looks with these product cut-outs. Campaign and story
photos are crops of the brand's mockups, to be replaced by the real shoot.
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "source-v2")
OUT = os.path.join(ROOT, "site", "media")
os.makedirs(OUT, exist_ok=True)


def save(im, name, q=88):
    im.save(os.path.join(OUT, name), "WEBP", quality=q, method=6)
    print(f"{name:40s} {im.size}")


# ---------------------------------------------------------------- products on white
def cut_white(path, tol=30):
    """Remove a pure white studio background by flood fill from the border.
    Cream thread and stripes (well below 255 in blue) are never reached."""
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    h, w = rgb.shape[:2]
    # Studio white plus its neutral grey floor shadow; black fabric (dark), rose (coloured) and cream thread (warm) never match.
    white = ((rgb.min(2) > 110) & ((rgb.max(2) - rgb.min(2)) < 12)).astype(np.uint8)
    mask = white.copy()
    ff = np.zeros((h + 2, w + 2), np.uint8)
    for x in range(0, w, 7):
        for y in (0, h - 1):
            if mask[y, x] == 1:
                cv2.floodFill(mask, ff, (x, y), 2)
    for y in range(0, h, 7):
        for x in (0, w - 1):
            if mask[y, x] == 1:
                cv2.floodFill(mask, ff, (x, y), 2)
    alpha = np.where(mask == 2, 0, 255).astype(np.uint8)
    # Soft, slightly eroded edge so no white fringe shows on dark backgrounds.
    alpha = cv2.erode(alpha, np.ones((2, 2), np.uint8))
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
    a = alpha.astype(np.float32)[..., None] / 255
    # Un-matte white from semi-transparent edge pixels.
    col = np.where(a > 0.05, (rgb - 255 * (1 - a)) / np.maximum(a, 0.05), 0)
    im = Image.fromarray(np.dstack([np.clip(col, 0, 255), alpha]).astype(np.uint8), "RGBA")
    return im.crop(im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox())


PRODUCTS = {
    "hoodie-black-front": "hoodie-black-front.webp", "hoodie-black-back": "hoodie-black-back.webp",
    "pants-black-front": "pants-black-front.webp", "pants-black-back": "pants-black-back.webp",
    "compression-black-front": "compression-black-front.webp", "compression-black-back": "compression-black-back.webp",
    "flare-rose-front": "flare-rose-front.webp", "flare-rose-back": "flare-rose-back.webp",
}


def products():
    for name, src in PRODUCTS.items():
        im = cut_white(os.path.join(SRC, src))
        save(im, f"p-{name}.webp", 90)
        # Small version for the shopping panel and cart.
        sm = im.copy(); sm.thumbnail((420, 520), Image.LANCZOS)
        save(sm, f"p-{name}-sm.webp", 88)
        # Photo on white, for the product page gallery.
        full = Image.open(os.path.join(SRC, src)).convert("RGB")
        save(full, f"g-{name}.webp", 88)
    # The fitted tee has no new photo; reuse the transparent board cut-outs.
    for side in ("front", "back"):
        im = Image.open(os.path.join(ROOT, "source-boards", "cutouts", f"001-womens-tee-washed-rose-{side}.png")).convert("RGBA")
        im = im.crop(im.getchannel("A").getbbox())
        save(im, f"p-tee-rose-{side}.webp", 90)
        sm = im.copy(); sm.thumbnail((420, 520), Image.LANCZOS)
        save(sm, f"p-tee-rose-{side}-sm.webp", 88)
        bg = Image.new("RGB", (1122, 1402), (255, 255, 255))
        fit = im.copy(); fit.thumbnail((900, 1150), Image.LANCZOS)
        bg.paste(fit, ((1122 - fit.width) // 2, (1402 - fit.height) // 2), fit)
        save(bg, f"g-tee-rose-{side}.webp", 88)


def details():
    """Construction close-ups cropped from the full-resolution product photos."""
    crops = {
        "d-hoodie-anvil": ("hoodie-black-front.webp", (610, 420, 900, 640)),
        "d-hoodie-stitch": ("hoodie-black-front.webp", (230, 780, 560, 1000)),
        "d-hoodie-lettering": ("hoodie-black-back.webp", (290, 380, 830, 650)),
        "d-pants-pocket": ("pants-black-back.webp", (600, 160, 830, 390)),
        "d-pants-wordmark": ("pants-black-front.webp", (620, 300, 860, 420)),
        "d-pants-stripe": ("pants-black-front.webp", (180, 700, 420, 940)),
        "d-compression-anvil": ("compression-black-front.webp", (640, 360, 860, 520)),
        "d-compression-seam": ("compression-black-front.webp", (180, 160, 520, 500)),
        "d-flare-anvil": ("flare-rose-front.webp", (610, 220, 800, 360)),
        "d-flare-piping": ("flare-rose-front.webp", (240, 500, 480, 740)),
    }
    for name, (src, box) in crops.items():
        im = Image.open(os.path.join(SRC, src)).convert("RGB").crop(box)
        im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
        save(im, name + ".webp", 86)


# ---------------------------------------------------------------- editorial photos
def editorial():
    camp = Image.open(os.path.join(SRC, "mock-campaign.webp")).convert("RGB")
    # Three panels; the bottom strip carries burned-in captions, so stop above it.
    for name, box in (("c-strength", (2, 210, 522, 850)), ("c-jiujitsu", (532, 210, 1056, 850)), ("c-padel", (1064, 210, 1586, 850))):
        im = camp.crop(box)
        save(im.resize((im.width * 2, im.height * 2), Image.LANCZOS), name + ".webp", 86)
    story = Image.open(os.path.join(SRC, "mock-story.webp")).convert("RGB").crop((642, 88, 1586, 926))
    save(story.resize((story.width * 2, story.height * 2), Image.LANCZOS), "c-story-flag.webp", 86)


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("all", "products"):
        products(); details()
    if what in ("all", "editorial"):
        editorial()
