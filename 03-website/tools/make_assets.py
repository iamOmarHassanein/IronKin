"""Cut website assets out of the supplied boards and mockup.

Run from the repo root: python 03-website/tools/make_assets.py
Outputs go to 03-website/site/assets/. Every output is replaceable: drop in a
real photo with the same filename and the site picks it up.
"""
import os
import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "source-boards")
IMG = os.path.join(ROOT, "site", "assets", "img")
BRAND = os.path.join(ROOT, "site", "assets", "brand")
os.makedirs(IMG, exist_ok=True)
os.makedirs(BRAND, exist_ok=True)

CARD = (1000, 1250)          # 4:5 product card
CHARCOAL = (24, 23, 22)       # #181716


def board(name):
    """Load a board, preferring the 2x upscaled copy from upscale_boards.py. Crop boxes stay in original pixels."""
    up = os.path.join(SRC, "upscaled", name.replace(".jpg", ".png"))
    im = Image.open(up if os.path.exists(up) else os.path.join(SRC, name)).convert("RGB")
    im.info["scale"] = 2 if os.path.exists(up) else 1
    return im


def cutout(im, box, tol=34):
    """Remove the cream board background around a garment by flood-filling from the edges."""
    s = im.info.get("scale", 1)
    x, y, w, h = (v * s for v in box)
    crop = np.asarray(im.crop((x - 12 * s, y - 12 * s, x + w + 12 * s, y + h + 12 * s))).astype(np.int16)
    bg = np.median(np.concatenate([crop[0], crop[-1], crop[:, 0], crop[:, -1]]), axis=0)
    near = (np.abs(crop - bg).sum(2) < tol).astype(np.uint8)
    flood = np.zeros((near.shape[0] + 2, near.shape[1] + 2), np.uint8)
    mask = near.copy()
    for sx, sy in [(0, 0), (near.shape[1] - 1, 0), (0, near.shape[0] - 1), (near.shape[1] - 1, near.shape[0] - 1)]:
        if near[sy, sx]:
            cv2.floodFill(mask, flood, (sx, sy), 2)
    alpha = (mask != 2).astype(np.uint8) * 255
    # Background pockets the flood fill could not reach, such as the gap between a cuff and the hem.
    # Only near the bottom, so cream logos and appliques higher up are kept.
    n, lab, st, cen = cv2.connectedComponentsWithStats(near)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 80 and cen[i][1] > near.shape[0] * 0.85:
            alpha[lab == i] = 0
    # Floor shadow: light, low-saturation pixels below the lowest garment pixel in each column.
    rgb = crop.astype(np.float32)
    gray = rgb.mean(2)
    sat = (rgb.max(2) - rgb.min(2)) / (rgb.max(2) + 1)
    garment = (gray < 60) | (sat > 0.16)
    rows = np.arange(garment.shape[0])[:, None]
    lowest = np.where(garment.any(0), (garment * rows).max(0), -1)[None, :]
    alpha[(rows > lowest + 2) & (sat < 0.16)] = 0
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats((alpha > 0).astype(np.uint8))
    if n > 2:
        alpha[lab != 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))] = 0
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.9)
    rgba = np.dstack([crop.astype(np.uint8), alpha])
    ys, xs = np.where(alpha > 20)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], "RGBA")


CUTOUTS = os.path.join(ROOT, "source-boards", "cutouts")
os.makedirs(CUTOUTS, exist_ok=True)


def card(garment, out, fill=0.82):
    """Place a cut-out garment on a charcoal 4:5 card with a soft spotlight and floor shadow.
    Also keeps the transparent cut-out for the tech packs."""
    garment.save(os.path.join(CUTOUTS, out.replace(".jpg", ".png")))
    W, H = CARD
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H * 0.42) / H) ** 2)
    light = np.clip(1.0 - d * 1.35, 0, 1)[..., None]
    base = np.array(CHARCOAL, np.float32) + light * np.array([22, 21, 20], np.float32)
    noise = np.random.default_rng(1).normal(0, 3.2, (H, W, 1))
    bg = Image.fromarray(np.clip(base + noise, 0, 255).astype(np.uint8))

    g = garment
    scale = min(W * fill / g.width, H * fill / g.height)
    g = g.resize((int(g.width * scale), int(g.height * scale)), Image.LANCZOS)
    gx, gy = (W - g.width) // 2, (H - g.height) // 2
    shadow = Image.new("L", (W, H), 0)
    sh = g.split()[3].point(lambda a: 120 if a > 30 else 0)
    shadow.paste(sh, (gx + 14, gy + 22))
    shadow = shadow.filter(ImageFilter.GaussianBlur(26))
    bg.paste(Image.new("RGB", (W, H), (4, 4, 4)), (0, 0), shadow)
    bg.paste(g, (gx, gy), g)
    bg.save(os.path.join(IMG, out), quality=88)


def tile(im, box, out, size=None):
    s = im.info.get("scale", 1)
    t = im.crop(tuple(v * s for v in box))
    if size:
        t = t.resize(size, Image.LANCZOS)
    t.save(os.path.join(IMG, out), quality=90)


# 001 Signature hoodie, black
b = board("001-signature-hoodie-black-board.jpg")
card(cutout(b, (131, 42, 566, 588)), "001-signature-hoodie-black-front.jpg")
card(cutout(b, (831, 42, 573, 588)), "001-signature-hoodie-black-back.jpg")
tile(b, (836, 716, 1096, 943), "001-signature-hoodie-black-detail-chest.jpg")
tile(b, (571, 716, 816, 943), "001-signature-hoodie-black-detail-stitch.jpg")
tile(b, (22, 716, 294, 943), "001-signature-hoodie-black-detail-fabric.jpg")
tile(b, (1116, 716, 1516, 943), "001-signature-hoodie-black-detail-back.jpg")

# 001 Wide-leg pants, black
b = board("001-wide-leg-pants-black-board.jpg")
card(cutout(b, (400, 17, 362, 661)), "001-wide-leg-pants-black-front.jpg")
card(cutout(b, (762, 17, 362, 661)), "001-wide-leg-pants-black-back.jpg")
tile(b, (1135, 64, 1520, 326), "001-wide-leg-pants-black-detail-drawcord.jpg")
tile(b, (13, 744, 299, 961), "001-wide-leg-pants-black-detail-pocket.jpg")
tile(b, (1235, 744, 1523, 961), "001-wide-leg-pants-black-detail-stitch.jpg")
tile(b, (622, 744, 912, 961), "001-wide-leg-pants-black-detail-fabric.jpg")

# 001 Women's fitted tee, washed rose (black colourway not confirmed for sale)
b = board("001-womens-tee-board.jpg")
card(cutout(b, (50, 102, 351, 428)), "001-womens-tee-washed-rose-front.jpg", 0.74)
card(cutout(b, (415, 101, 342, 427)), "001-womens-tee-washed-rose-back.jpg", 0.74)
tile(b, (795, 619, 1127, 805), "001-womens-tee-washed-rose-detail-chest.jpg")
tile(b, (44, 621, 406, 805), "001-womens-tee-washed-rose-detail-neck.jpg")
tile(b, (439, 619, 762, 805), "001-womens-tee-washed-rose-detail-seam.jpg")

# 001 Women's flared leggings, washed rose
b = board("001-womens-flare-board.jpg")
card(cutout(b, (152, 84, 244, 568)), "001-womens-flare-washed-rose-front.jpg", 0.86)
card(cutout(b, (467, 84, 248, 569)), "001-womens-flare-washed-rose-back.jpg", 0.86)
tile(b, (784, 795, 1114, 975), "001-womens-flare-washed-rose-detail-hip.jpg")
tile(b, (461, 795, 755, 975), "001-womens-flare-washed-rose-detail-piping.jpg")
tile(b, (1143, 795, 1499, 975), "001-womens-flare-washed-rose-detail-hem.jpg")
tile(b, (36, 795, 432, 975), "001-womens-flare-washed-rose-detail-waist.jpg")

# 002 Short-sleeve compression, black
b = board("002-compression-ss-black-board.jpg")
card(cutout(b, (202, 75, 526, 601)), "002-compression-ss-black-front.jpg")
card(cutout(b, (807, 77, 533, 598)), "002-compression-ss-black-back.jpg")
tile(b, (409, 780, 755, 965), "002-compression-ss-black-detail-chest.jpg")
tile(b, (772, 780, 1124, 965), "002-compression-ss-black-detail-graphic.jpg")
tile(b, (35, 780, 392, 965), "002-compression-ss-black-detail-fabric.jpg")

# Campaign photos supplied by the owner.
Image.open(os.path.join(SRC, "001-campaign-standing.webp")).convert("RGB").save(os.path.join(IMG, "collection-001.jpg"), quality=90)
crew = Image.open(os.path.join(SRC, "001-campaign-crew.webp")).convert("RGB")
crew.save(os.path.join(IMG, "about-crew.jpg"), quality=90)
standing = Image.open(os.path.join(SRC, "001-campaign-standing.webp")).convert("RGB")
standing.crop((0, 150, 1122, 1230)).save(os.path.join(IMG, "about-closing.jpg"), quality=90)
# Full-screen home panel: same photo without its baked-in IRONKIN and 001 text.
standing.crop((0, 125, 1122, 1250)).save(os.path.join(IMG, "collection-001-panel.jpg"), quality=90)

# Construction banner: real macro of the raised split-anvil from the hoodie board.
b = board("001-signature-hoodie-black-board.jpg")
tile(b, (836, 716, 1096, 943), "detail-anvil-macro.jpg")

# IK mark from the Code posters, traced to vector.
c = board("brand-ironkin-code-board.jpg")
g = np.asarray(c.convert("L")).astype(np.float32)[383:464, 218:299]
big = cv2.resize(g, None, fx=10, fy=10, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), 6)
mask = (big > 150).astype(np.uint8) * 255
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((15, 15), np.uint8))
cs, _ = cv2.findContours(mask, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
paths = []
for cnt in cs:
    if cv2.contourArea(cnt) < 4000:
        continue
    a = cv2.approxPolyDP(cnt, 4, True).reshape(-1, 2) / 10
    paths.append("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in a) + "Z")
h, w = g.shape
open(os.path.join(BRAND, "ik-mark.svg"), "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><path fill="#F1E5D3" fill-rule="evenodd" d="{" ".join(paths)}"/></svg>')
print("assets written:", len(os.listdir(IMG)), "images, IK mark contours:", len(paths))
