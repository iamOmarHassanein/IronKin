"""Build a 3-page tech pack per style as SVG pages for Figma (editable vectors and text).

Page 1 design, page 2 pattern pieces and assembly, page 3 specs.
Run from the repo root: python 02-product/tech-packs/tools/build_figma_svg.py [style_no ...]
Output: 02-product/tech-packs/figma/<style>/page-N.svg plus image-slots.json, which lists
the picture frames (named img-front / img-back) that take the garment PNGs as fills in Figma.

The pattern pieces are schematic outlines for communication and costing. They are not
graded production patterns; the factory's pattern maker drafts those from the spec.
"""
import ast
import datetime
import json
import os
import re
import sys
from xml.sax.saxutils import escape

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CUTOUTS = os.path.join(ROOT, "03-website", "source-boards", "cutouts")
LOGOS = os.path.join(ROOT, "01-brand", "identity", "logo", "svg")
OUT = os.path.join(HERE, "..", "figma")

src = open(os.path.join(HERE, "build_techpacks.py"), encoding="utf-8").read()
PRODUCTS = ast.literal_eval(re.search(r"^PRODUCTS = (\[.*?^\])", src, re.S | re.M).group(1))

S = 144                      # px per inch
W, H = 11.69 * S, 8.27 * S   # A4 landscape
M = 0.4 * S
BLACK, PANEL, CREAM, RED, GREY, LINE, WHITE = "#0B0B0B", "#F4F1EC", "#F1E5D3", "#A31E23", "#6B6660", "#CFCAC2", "#FFFFFF"
HEAD, BODY = "Barlow Condensed", "Barlow"
SWATCH = {"Black": [("Black", "#0B0B0B"), ("Cream", "#F1E5D3")], "Washed Rose": [("Washed Rose", "#C98F8F"), ("Oxblood", "#A31E23")]}

# ---------------------------------------------------------------------------------------------
# Pattern pieces per style. Each piece: code, name, cut, fabric, box (w, h), path (in box units),
# grain line (x1, y1, x2, y2), optional fold line, note.
# ---------------------------------------------------------------------------------------------
PIECES = {
    "IK-001-HD-BLK": {
        "pieces": [
            ("P1", "Front body", "Cut 1", "Shell", (100, 120), "M36,4 Q50,26 64,4 L96,12 Q93,32 100,48 L100,120 L0,120 L0,48 Q7,32 4,12 Z", (50, 40, 50, 105), None, "Chest logo and pocket go on before side seams"),
            ("P2", "Back body", "Cut 1", "Shell", (100, 120), "M36,4 Q50,11 64,4 L96,12 Q93,32 100,48 L100,120 L0,120 L0,48 Q7,32 4,12 Z", (50, 30, 50, 105), None, "Back applique goes on before assembly"),
            ("P3", "Sleeve", "Cut 2 (pair)", "Shell", (120, 84), "M0,24 Q60,-6 120,24 L98,84 L22,84 Z", (60, 22, 60, 72), None, "Dropped shoulder, shallow cap"),
            ("P4", "Hood side panel", "Cut 4 (2 outer, 2 lining)", "Shell", (74, 100), "M10,100 L3,62 Q-2,22 26,8 Q52,-4 68,16 L74,70 Q70,92 60,100 Z", (38, 28, 38, 86), None, "Double layer, no drawcord"),
            ("P5", "Hood centre strip", "Cut 2 (1 outer, 1 lining)", "Shell", (150, 22), "M0,3 L150,0 L150,22 L0,19 Z", (20, 11, 130, 11), None, "3-panel hood TBC"),
            ("P6", "Kangaroo pocket", "Cut 1", "Shell", (100, 58), "M24,0 L76,0 L100,34 L100,58 L0,58 L0,34 Z", (50, 12, 50, 48), None, "Cream overlock on the angled openings"),
            ("P7", "Cuff rib", "Cut 2", "Rib", (70, 44), "M0,0 L70,0 L70,44 L0,44 Z", (10, 33, 60, 33), (0, 22, 70, 22), "Folded double"),
            ("P8", "Hem rib", "Cut 1", "Rib", (160, 30), "M0,0 L160,0 L160,30 L0,30 Z", (20, 22, 140, 22), (0, 15, 160, 15), "Folded double"),
        ],
        "assembly": ["Embroider or apply the chest logo on P1 and the applique on P2 while the panels are flat.",
                     "Overlock the pocket openings in cream, then stitch P6 to P1.",
                     "Join shoulders, seam to the outside, cream overlock.",
                     "Set sleeves P3 flat into the armholes.",
                     "Close sleeve and side seams in one pass.",
                     "Make up outer and lining hoods (P4 + P5), bag out, attach to the neck.",
                     "Attach cuffs P7 and hem P8 with exposed cream overlock.",
                     "Add neck label, care label and hang tag."],
    },
}


class Page:
    def __init__(self):
        self.out = []
        self.slots = []

    def add(self, s):
        self.out.append(s)

    def rect(self, x, y, w, h, fill="none", stroke=None, sw=1, name=None, rx=0):
        st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
        nm = f' id="{name}"' if name else ""
        self.add(f'<rect{nm} x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}"{st}/>')

    def line(self, x1, y1, x2, y2, stroke=BLACK, sw=1, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def text(self, x, y, s, size=16, weight=400, fill=BLACK, family=BODY, anchor="start", spacing=0):
        sp = f' letter-spacing="{spacing}"' if spacing else ""
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{sp}>{escape(str(s))}</text>')

    def wrapped(self, x, y, s, max_w, size=14, lh=1.25, **kw):
        """Simple word wrap by estimated character width. Returns the number of lines."""
        per = max(4, int(max_w / (size * 0.5)))
        lines, cur = [], ""
        for word in str(s).split():
            if len(cur) + len(word) + 1 > per and cur:
                lines.append(cur)
                cur = word
            else:
                cur = (cur + " " + word).strip()
        lines.append(cur)
        for i, ln in enumerate(lines):
            self.text(x, y + i * size * lh, ln, size, **kw)
        return len(lines)

    def section(self, x, y, s):
        self.text(x, y + 18, s, 20, 700, BLACK, HEAD, spacing=3)
        self.rect(x, y + 28, 60, 3.5, RED)

    def table(self, x, y, w, rows, widths, row_h=38, size=15, head=True, label_rows=()):
        total = sum(widths)
        xs = [x]
        for cw in widths:
            xs.append(xs[-1] + w * cw / total)
        for r, row in enumerate(rows):
            ry = y + r * row_h
            is_head = head and r == 0
            is_label = r in label_rows
            self.rect(x, ry, w, row_h, BLACK if is_head else (PANEL if is_label else WHITE))
            for c, val in enumerate(row):
                if val == "" or val is None:
                    continue
                fam, wt = (HEAD, 700) if (is_head or is_label) else (BODY, 400)
                col = CREAM if is_head else (GREY if is_label else BLACK)
                fs = size - 2 if is_label else size
                cw = xs[c + 1] - xs[c] - 14
                per = max(4, int(cw / (fs * 0.5)))
                if len(str(val)) > per and row_h >= fs * 2.6:
                    self.wrapped(xs[c] + 7, ry + row_h / 2 - fs * 0.25, val, cw, fs, 1.2, weight=wt, fill=col, family=fam)
                else:
                    self.text(xs[c] + 7, ry + row_h / 2 + fs * 0.35, val, fs, wt, col, fam)
        # grid
        for r in range(len(rows) + 1):
            self.line(x, y + r * row_h, x + w, y + r * row_h, BLACK, 1)
        for xx in xs:
            self.line(xx, y, xx, y + row_h * len(rows), BLACK, 1)
        return y + row_h * len(rows)

    def header(self, title, p, n, total=3):
        self.rect(0, 0, W, H, WHITE)
        self.rect(0, 0, W, 0.72 * S, BLACK)
        self.rect(0, 0.72 * S, W, 0.04 * S, RED)
        logo = open(os.path.join(LOGOS, "ironkin-wordmark-bone.svg"), encoding="utf-8").read()
        vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', logo).group(1).split()]
        inner = re.search(r"<svg[^>]*>(.*)</svg>", logo, re.S).group(1)
        k = 0.28 * S / vb[3]
        self.add(f'<g id="wordmark" transform="translate({M:.1f},{0.22 * S:.1f}) scale({k:.4f})">{inner}</g>')
        self.text(2.35 * S, 0.47 * S, f"TECH PACK  ·  {title}", 30, 700, CREAM, HEAD, spacing=2.5)
        self.text(W - M, 0.45 * S, f"{p['style_no']}  ·  {p['name'].upper()}", 22, 500, CREAM, HEAD, "end", 2)
        self.text(M, H - 0.24 * S, "IRONKIN  ·  Confidential  ·  All measurements in cm  ·  TBC = to be confirmed", 13, 400, GREY)
        self.text(W - M, H - 0.24 * S, f"Page {n} of {total}", 13, 400, GREY, anchor="end")

    def svg(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.0f}" height="{H:.0f}" viewBox="0 0 {W:.0f} {H:.0f}">'
                + "".join(self.out) + "</svg>")


def garment(pg, x, y, w, h, img, label, callouts, start, slot):
    pg.rect(x, y, w, h, WHITE, LINE, 1.5)
    pg.text(x + 14, y + 26, label, 16, 700, GREY, HEAD, spacing=4)
    iw, ih = Image.open(os.path.join(CUTOUTS, img)).size
    pad_x, pad_top, pad_bot = 0.5 * S, 0.45 * S, 0.3 * S
    k = min((w - 2 * pad_x) / iw, (h - pad_top - pad_bot) / ih)
    gw, gh = iw * k, ih * k
    gx, gy = x + (w - gw) / 2, y + pad_top + (h - pad_top - pad_bot - gh) / 2
    pg.rect(gx, gy, gw, gh, "#EDEAE4", name=slot)        # picture frame, filled with the garment PNG in Figma
    pg.slots.append({"slot": slot, "image": img})
    d = 0.24 * S
    for i, (fx, fy, _) in enumerate(callouts):
        tx, ty = gx + fx * gw, gy + fy * gh
        side = 1 if fx >= 0.5 else -1
        cx = min(max(tx + side * 0.42 * S, x + 12 + d / 2), x + w - 12 - d / 2)
        cy = max(ty - 0.22 * S, y + 0.4 * S)
        pg.line(cx, cy, tx, ty, RED, 1.8)
        pg.add(f'<circle cx="{tx:.1f}" cy="{ty:.1f}" r="4.5" fill="{RED}"/>')
        pg.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{d / 2:.1f}" fill="{RED}"/>')
        pg.text(cx, cy + 5.5, start + i, 16, 700, WHITE, HEAD, "middle")


def page_design(p):
    pg = Page()
    pg.header("DESIGN", p, 1)
    today = datetime.date.today().isoformat()
    sizes = p["sizes"]
    info = [["STYLE NO", "STYLE NAME", "COLLECTION", "COLOURWAY", "FIT", "MAIN FABRIC"],
            [p["style_no"], p["name"], "001 / The First Rep", p["colourway"], p["fit"], p["fabric"]],
            ["SIZE RANGE", "SAMPLE SIZE", "VERSION", "DATE", "FACTORY", "STATUS"],
            [f"{sizes[0]} to {sizes[-1]}", p["sample"], "V1 Proto", today, "TBC", "For sampling"]]
    pg.table(M, 0.95 * S, W - 2 * M, info, [1.2, 1.5, 1.4, 1.1, 1.9, 3.2], 36, 15, head=False, label_rows=(0, 2))
    top, bot, bw = 2.2 * S, H - 0.55 * S, 3.25 * S
    garment(pg, M, top, bw, bot - top, p["front"], "FRONT", p["callouts_front"], 1, "img-front")
    garment(pg, M + bw + 0.15 * S, top, bw, bot - top, p["back"], "BACK", p["callouts_back"], 1 + len(p["callouts_front"]), "img-back")
    rx = M + 2 * bw + 0.4 * S
    rw = W - M - rx
    pg.section(rx, top, "DESIGN NOTES")
    notes = [["#", "Detail"]] + [[i + 1, c[2]] for i, c in enumerate(p["callouts_front"] + p["callouts_back"])]
    while len(notes) < 9:
        notes.append(["", ""])
    y = pg.table(rx, top + 0.34 * S, rw, notes, [0.35, 4.2], 36, 15)
    pg.section(rx, y + 0.22 * S, "LOGO AND ARTWORK")
    art = [["#", "Where", "Method", "Colour", "Size"]] + [[a[0], a[1], a[3], a[4], a[5]] for a in p["artwork"]]
    y = pg.table(rx, y + 0.56 * S, rw, art, [0.3, 1.1, 1.6, 1.1, 0.9], 50, 13)
    pg.section(rx, y + 0.22 * S, "COLOURS")
    for i, (name, hexv) in enumerate(SWATCH[p["colourway"]]):
        sx = rx + i * 1.5 * S
        pg.rect(sx, y + 0.58 * S, 0.34 * S, 0.34 * S, hexv, LINE, 1.5)
        pg.text(sx + 0.42 * S, y + 0.58 * S + 20, name, 14, 600)
        pg.text(sx + 0.42 * S, y + 0.58 * S + 38, "Pantone TBC", 13, 400, GREY)
    return pg


def page_pieces(p):
    pg = Page()
    pg.header("PIECES", p, 2)
    spec = PIECES[p["style_no"]]
    pieces = spec["pieces"]
    lw = 7.35 * S
    pg.section(M, 0.95 * S, f"PATTERN PIECES  ·  {len(pieces)} pieces  ·  schematic, not to scale")
    cols = 4
    gap = 0.12 * S
    cw = (lw - gap * (cols - 1)) / cols
    rows_n = -(-len(pieces) // cols)
    top = 1.32 * S
    ch = (H - 0.55 * S - top - gap * (rows_n - 1)) / rows_n
    for i, (code, name, cut, fabric, (bw, bh), path, grain, fold, note) in enumerate(pieces):
        x = M + (i % cols) * (cw + gap)
        y = top + (i // cols) * (ch + gap)
        pg.rect(x, y, cw, ch, WHITE, LINE, 1.5)
        # code badge
        pg.rect(x + 12, y + 12, 44, 28, BLACK)
        pg.text(x + 34, y + 32, code, 17, 700, CREAM, HEAD, "middle")
        pg.text(x + 66, y + 33, name.upper(), 18, 700, BLACK, HEAD, spacing=1.5)
        # drawing area
        ax, ay, aw, ah = x + 22, y + 56, cw - 44, ch - 56 - 96
        k = min(aw / bw, ah / bh)
        ox, oy = ax + (aw - bw * k) / 2, ay + (ah - bh * k) / 2
        pg.add(f'<g id="piece-{code}" transform="translate({ox:.1f},{oy:.1f}) scale({k:.3f})">'
               f'<path d="{path}" fill="{PANEL}" stroke="{BLACK}" stroke-width="{1.8 / k:.2f}" stroke-linejoin="round"/></g>')
        gx1, gy1, gx2, gy2 = (ox + grain[0] * k, oy + grain[1] * k, ox + grain[2] * k, oy + grain[3] * k)
        pg.line(gx1, gy1, gx2, gy2, GREY, 1.3)
        # arrow heads on the grain line
        for (hx, hy, dx, dy) in ((gx1, gy1, gx2 - gx1, gy2 - gy1), (gx2, gy2, gx1 - gx2, gy1 - gy2)):
            ln = (dx * dx + dy * dy) ** 0.5
            ux, uy = dx / ln, dy / ln
            pg.add(f'<path d="M{hx:.1f},{hy:.1f} L{hx + ux * 9 - uy * 4:.1f},{hy + uy * 9 + ux * 4:.1f} L{hx + ux * 9 + uy * 4:.1f},{hy + uy * 9 - ux * 4:.1f} Z" fill="{GREY}"/>')
        if fold:
            pg.line(ox + fold[0] * k, oy + fold[1] * k, ox + fold[2] * k, oy + fold[3] * k, RED, 1.3, "6 4")
            pg.text(ox + fold[2] * k - 4, oy + fold[1] * k - 5, "FOLD", 11, 700, RED, HEAD, "end", 1.5)
        # labels
        by = y + ch - 84
        pg.line(x + 12, by, x + cw - 12, by, LINE, 1)
        pg.text(x + 14, by + 22, cut, 14, 600)
        pg.text(x + cw - 14, by + 22, fabric.upper(), 13, 700, RED, HEAD, "end", 1.5)
        pg.wrapped(x + 14, by + 44, note, cw - 28, 12.5, 1.25, fill=GREY)

    rx = M + lw + 0.25 * S
    rw = W - M - rx
    pg.section(rx, 0.95 * S, "CUT LIST")
    cut = [["", "Piece", "Cut", "Fabric"]] + [[c[0], c[1], c[2].replace("Cut ", "").split(" ")[0], c[3]] for c in pieces]
    y = pg.table(rx, 1.32 * S, rw, cut, [0.4, 1.9, 0.5, 0.7], 30, 13.5)
    pg.section(rx, y + 0.2 * S, "ASSEMBLY ORDER")
    yy = y + 0.2 * S + 58
    for i, step in enumerate(spec["assembly"]):
        pg.add(f'<circle cx="{rx + 11:.1f}" cy="{yy - 4:.1f}" r="11" fill="{BLACK}"/>')
        pg.text(rx + 11, yy + 1, i + 1, 13, 700, CREAM, HEAD, "middle")
        n = pg.wrapped(rx + 32, yy, step, rw - 34, 12.5, 1.25)
        yy += n * 12.5 * 1.25 + 11
    return pg


def page_specs(p):
    pg = Page()
    pg.header("SPECS", p, 3)
    today = datetime.date.today().isoformat()
    sizes = p["sizes"]
    lw = 5.75 * S
    pg.section(M, 0.95 * S, f"MEASUREMENTS  ·  cm, laid flat  ·  sample size {p['sample']}")
    pom = [["", "Point of measure", "Tol ±"] + sizes] + [[a, b, c] + [""] * len(sizes) for a, b, c in p["pom"]]
    y = pg.table(M, 1.29 * S, lw, pom, [0.32, 2.6, 0.5] + [0.5] * len(sizes), 38, 15)
    pg.section(M, y + 0.24 * S, "SAMPLE COMMENTS")
    pg.rect(M, y + 0.58 * S, lw, H - 0.55 * S - y - 0.58 * S, WHITE, LINE, 1.5)
    rx = M + lw + 0.3 * S
    rw = W - M - rx
    pg.section(rx, 0.95 * S, "MATERIALS")
    bom = [["#", "Component", "Description", "Colour"]] + [[b[0], b[1], b[2], b[3]] for b in p["bom"]]
    y = pg.table(rx, 1.29 * S, rw, bom, [0.3, 1.25, 2.6, 1.0], 38, 13)
    pg.section(rx, y + 0.24 * S, "CONSTRUCTION")
    con = [["Area", "Seam and stitch", "Thread", "Notes"]] + p["construction"]
    y = pg.table(rx, y + 0.58 * S, rw, con, [1.1, 2.0, 0.6, 1.5], 42, 13)
    pg.section(rx, y + 0.24 * S, "VERSIONS AND APPROVAL")
    rev = [["Version", "Date", "What changed", "Approved by"], ["V1 Proto", today, "First tech pack issued", ""], ["", "", "", ""]]
    pg.table(rx, y + 0.58 * S, rw, rev, [0.9, 0.9, 2.2, 1.2], 38, 13)
    return pg


def build(p):
    d = os.path.join(OUT, p["file"])
    os.makedirs(d, exist_ok=True)
    slots = []
    for n, pg in enumerate((page_design(p), page_pieces(p), page_specs(p)), 1):
        open(os.path.join(d, f"page-{n}.svg"), "w", encoding="utf-8").write(pg.svg())
        slots += pg.slots
    json.dump(slots, open(os.path.join(d, "image-slots.json"), "w"), indent=1)
    return d


if __name__ == "__main__":
    want = sys.argv[1:]
    for prod in PRODUCTS:
        if prod["style_no"] in PIECES and (not want or prod["style_no"] in want):
            print(os.path.relpath(build(prod), ROOT))
