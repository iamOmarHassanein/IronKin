"""Upscale the supplied product boards 2x with the EDSR super-resolution model.

Needs opencv-contrib-python and the EDSR_x2.pb model from
https://github.com/Saafke/EDSR_Tensorflow (models/EDSR_x2.pb).

Usage: python upscale_boards.py <path to EDSR_x2.pb> [board file names...]
Writes to 03-website/source-boards/upscaled/. make_assets.py uses these when present.
"""
import os, sys, time
import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "source-boards")
OUT = os.path.join(SRC, "upscaled")
TILE, PAD = 384, 16


def upscale(sr, img):
    """Run the model tile by tile with overlap, so large boards fit in memory without seams."""
    h, w = img.shape[:2]
    out = np.zeros((h * 2, w * 2, 3), np.uint8)
    for y in range(0, h, TILE):
        for x in range(0, w, TILE):
            y0, x0 = max(0, y - PAD), max(0, x - PAD)
            y1, x1 = min(h, y + TILE + PAD), min(w, x + TILE + PAD)
            up = sr.upsample(img[y0:y1, x0:x1])
            ty, tx = (y - y0) * 2, (x - x0) * 2
            th, tw = (min(h, y + TILE) - y) * 2, (min(w, x + TILE) - x) * 2
            out[y * 2:y * 2 + th, x * 2:x * 2 + tw] = up[ty:ty + th, tx:tx + tw]
    return out


# Areas the site uses, in original board pixels (x0, y0, x1, y1). The rest of each board gets a plain resize.
REGIONS = {
    "001-signature-hoodie-black-board.jpg": [(125, 35, 1410, 650), (15, 710, 1520, 950)],
    "001-wide-leg-pants-black-board.jpg": [(395, 10, 1130, 685), (1130, 55, 1528, 332), (5, 738, 1530, 968)],
    "001-womens-tee-board.jpg": [(45, 95, 762, 536), (38, 612, 1135, 812)],
    "001-womens-flare-board.jpg": [(148, 80, 720, 656), (30, 788, 1505, 982)],
}


def upscale_regions(sr, img, regions):
    out = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
    for x0, y0, x1, y1 in regions:
        out[y0 * 2:y1 * 2, x0 * 2:x1 * 2] = upscale(sr, img[y0:y1, x0:x1])
    return out


def main():
    model = sys.argv[1]
    names = sys.argv[2:] or list(REGIONS)
    os.makedirs(OUT, exist_ok=True)
    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(model)
    sr.setModel("edsr", 2)
    for name in names:
        t = time.time()
        img = cv2.imread(os.path.join(SRC, name))
        up = upscale_regions(sr, img, REGIONS[name]) if name in REGIONS else upscale(sr, img)
        cv2.imwrite(os.path.join(OUT, name.replace(".jpg", ".png")), up)
        print(f"{name} {img.shape[1]}x{img.shape[0]} -> 2x in {time.time() - t:.0f}s", flush=True)


if __name__ == "__main__":
    main()
