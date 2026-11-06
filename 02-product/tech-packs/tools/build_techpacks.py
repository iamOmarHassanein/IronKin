"""Build IRONKIN tech packs as fillable PDFs.

Every value is a form field, so the packs can be edited by hand in Adobe Acrobat (fill the fields,
replace images with Edit PDF) or opened in Adobe Illustrator as an editable layout.
Edit the product data below and rerun to regenerate: python 02-product/tech-packs/tools/build_techpacks.py
"""
import datetime
import os

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.abspath(os.path.join(HERE, ".."))
CUT = os.path.join(REPO, "03-website", "source-boards", "cutouts")
IMG = os.path.join(REPO, "03-website", "site", "assets", "img")
LOGO = os.path.join(REPO, "01-brand", "identity", "logo", "png")

for name, file in [("Display", "BarlowCondensed-ExtraBold.ttf"), ("Label", "BarlowCondensed-SemiBold.ttf"),
                   ("Body", "Barlow-Regular.ttf"), ("BodyBold", "Barlow-SemiBold.ttf")]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(HERE, "fonts", file)))

W, H = landscape(A4)
M = 28
INK, PAPER, PANEL, LINE, RED, MUTED = (HexColor(c) for c in ("#0B0B0B", "#FFFFFF", "#F3F1EE", "#C9C4BC", "#A31E23", "#6E6A63"))
FIELD_BG = HexColor("#FBFAF8")
TOTAL_PAGES = 7

# ---------------------------------------------------------------------------------------------
# Product data. "TBC" means to be confirmed with the factory or the owner.

COMMON_LABELS = {
    "Neck label": "Woven label, black, cream IRONKIN wordmark. Size TBC. Centre back neck, inside.",
    "Size label": "Woven size tab under neck label.",
    "Care label": "Left side seam, 10 cm above hem. Fibre content, care symbols and country of origin TBC.",
    "Hang tag": "Bone card, black split-anvil and wordmark, oxblood rule. Back: style name, fabric, size. Attached at left side seam.",
    "Packaging": "Individual recyclable polybag with size sticker. Mailer: black kraft box with bone print.",
    "Folding": "Fold to 30 x 35 cm, logo facing up, tissue between folds.",
}

PRODUCTS = [
    {
        "file": "IK-001-HD-BLK_signature-hoodie",
        "style_no": "IK-001-HD-BLK", "name": "Signature Hoodie", "category": "Hoodie, oversized",
        "colourway": "Black", "fabric": "Cotton Milton, smooth face, brushed reverse. GSM TBC",
        "fit": "Oversized, dropped shoulder", "sizes": ["XS", "S", "M", "L", "XL", "XXL"], "sample": "M",
        "front": "001-signature-hoodie-black-front.png", "back": "001-signature-hoodie-black-back.png",
        "details": ["001-signature-hoodie-black-detail-chest.jpg", "001-signature-hoodie-black-detail-stitch.jpg",
                    "001-signature-hoodie-black-detail-fabric.jpg", "001-signature-hoodie-black-detail-back.jpg"],
        "callouts_front": [(0.64, 0.34, "Raised cream split-anvil, wearer's left chest"), (0.86, 0.29, "Exposed cream overlock on dropped shoulder seam"),
                           (0.50, 0.66, "Kangaroo pocket, cream overlock edge"), (0.50, 0.93, "Rib hem, cream overlock on hem seam"),
                           (0.10, 0.93, "Rib cuffs, cream overlock on cuff seam")],
        "callouts_back": [(0.50, 0.35, "Arched cream IRONKIN varsity applique"), (0.50, 0.08, "Double-layer hood, no drawcord")],
        "artwork": [["1", "Left chest", "Split-anvil symbol", "Raised embroidery / 3D applique TBC", "Cream, Pantone TBC", "9 x 5 cm TBC", "18 cm below HPS, 9 cm from CF TBC"],
                    ["2", "Centre back", "Arched IRONKIN wordmark", "Twill applique with satin stitch TBC", "Cream, Pantone TBC", "30 x 8 cm TBC", "10 cm below hood seam, centred TBC"],
                    ["3", "Seams", "Exposed overlock", "Contrast overlock stitch", "Cream thread", "-", "Shoulder, pocket, hem and cuff seams"]],
        "artwork_files": ["ironkin-symbol-bone.png", "ironkin-arched-bone.png"],
        "pom": [["A", "Body length from HPS", "1"], ["B", "Chest width, 2 cm below armhole", "1"], ["C", "Hem width, relaxed", "1"],
                ["D", "Hem rib height", "0.3"], ["E", "Across shoulder", "1"], ["F", "Sleeve length from shoulder seam", "1"],
                ["G", "Bicep width", "0.5"], ["H", "Cuff width, relaxed", "0.5"], ["I", "Cuff height", "0.3"],
                ["J", "Hood height", "1"], ["K", "Hood width", "0.5"], ["L", "Neck width, seam to seam", "0.5"],
                ["M", "Kangaroo pocket width", "0.5"], ["N", "Kangaroo pocket height", "0.5"]],
        "bom": [["1", "Shell", "Cotton Milton, smooth face, brushed reverse", "Black", "Body, sleeves, hood"],
                ["2", "Rib", "Cotton/elastane rib, 2x2 TBC", "Black", "Cuffs, hem"],
                ["3", "Main thread", "Polyester core-spun", "Black", "All seams"],
                ["4", "Overlock thread", "Polyester, contrast", "Cream", "Exposed seams"],
                ["5", "Chest logo", "Embroidery thread or raised applique", "Cream", "Left chest"],
                ["6", "Back applique", "Twill fabric + satin stitch", "Cream", "Centre back"],
                ["7", "Neck label", "Woven", "Black / cream", "Centre back neck"],
                ["8", "Care label", "Printed satin", "White", "Left side seam"],
                ["9", "Hang tag", "Card + string", "Bone / black", "Left side seam"]],
        "construction": [["Shoulder", "4-thread overlock, exposed", "Cream", "Dropped shoulder, seam outside"],
                         ["Side seams", "4-thread overlock", "Black", ""],
                         ["Pocket", "Coverstitch + exposed overlock edge", "Cream", "Kangaroo pocket"],
                         ["Hood", "Double layer, 3-panel TBC", "Black", "No eyelets, no drawcord"],
                         ["Hem and cuffs", "Rib attached with overlock, exposed", "Cream", ""]],
    },
    {
        "file": "IK-001-WP-BLK_wide-leg-pants",
        "style_no": "IK-001-WP-BLK", "name": "Wide-Leg Pants", "category": "Pants, wide straight leg",
        "colourway": "Black", "fabric": "Cotton Milton, smooth face, brushed reverse. GSM TBC",
        "fit": "Wide straight leg, open hem", "sizes": ["XS", "S", "M", "L", "XL", "XXL"], "sample": "M",
        "front": "001-wide-leg-pants-black-front.png", "back": "001-wide-leg-pants-black-back.png",
        "details": ["001-wide-leg-pants-black-detail-pocket.jpg", "001-wide-leg-pants-black-detail-stitch.jpg",
                    "001-wide-leg-pants-black-detail-drawcord.jpg", "001-wide-leg-pants-black-detail-fabric.jpg"],
        "callouts_front": [(0.50, 0.05, "Elastic waistband, clean exterior, internal drawcord"), (0.07, 0.55, "Cream overlock along outer side seam"),
                           (0.25, 0.97, "Open hem, no cuff")],
        "callouts_back": [(0.70, 0.12, "Right rear patch pocket, raised cream anvil")],
        "artwork": [["1", "Right rear pocket", "Split-anvil symbol", "Raised embroidery", "Cream, Pantone TBC", "6 x 3.5 cm TBC", "Centred on pocket TBC"],
                    ["2", "Outer side seams", "Exposed overlock line", "Contrast overlock stitch", "Cream thread", "-", "Waistband to hem, both legs"]],
        "artwork_files": ["ironkin-symbol-bone.png"],
        "pom": [["A", "Waist, relaxed (half)", "1"], ["B", "Waist, extended (half)", "1"], ["C", "Waistband height", "0.3"],
                ["D", "Front rise incl. waistband", "0.5"], ["E", "Back rise incl. waistband", "0.5"], ["F", "Hip width (half)", "1"],
                ["G", "Thigh width, 2.5 cm below crotch", "0.5"], ["H", "Knee width", "0.5"], ["I", "Leg opening", "0.5"],
                ["J", "Inseam", "1"], ["K", "Outseam incl. waistband", "1"], ["L", "Back pocket width x height", "0.3"],
                ["M", "Back pocket from waist seam", "0.3"]],
        "bom": [["1", "Shell", "Cotton Milton, smooth face, brushed reverse", "Black", "Legs, pocket"],
                ["2", "Waistband elastic", "Woven elastic, width TBC", "Black", "Waistband"],
                ["3", "Drawcord", "Flat cotton drawcord, internal", "Black", "Inside centre front"],
                ["4", "Eyelets", "Metal, internal", "Black", "Inside waistband"],
                ["5", "Main thread", "Polyester core-spun", "Black", "All seams"],
                ["6", "Overlock thread", "Polyester, contrast", "Cream", "Outer side seams"],
                ["7", "Pocket logo", "Embroidery thread", "Cream", "Right rear pocket"],
                ["8", "Labels", "Woven brand + printed care", "Black / white", "Inside back waistband"],
                ["9", "Hang tag", "Card + string", "Bone / black", "Waistband"]],
        "construction": [["Waistband", "Enclosed elastic, drawcord exits inside CF", "Black", "No holes or cord on exterior"],
                         ["Outer side seams", "Exposed overlock", "Cream", "Single straight line per leg"],
                         ["Inseam and rise", "4-thread overlock", "Black", ""],
                         ["Back pocket", "Patch pocket, double topstitch", "Black", "Embroider before attaching"],
                         ["Hem", "Open hem, single-needle turn-up", "Black", "Hem depth TBC"]],
    },
    {
        "file": "IK-001-WT-RSE_womens-fitted-tee",
        "style_no": "IK-001-WT-RSE", "name": "Women's Fitted Tee", "category": "Tee, women's fitted",
        "colourway": "Washed Rose", "fabric": "Waffle knit, composition and GSM TBC",
        "fit": "Fitted, contour seams", "sizes": ["XS", "S", "M", "L", "XL"], "sample": "S",
        "front": "001-womens-tee-washed-rose-front.png", "back": "001-womens-tee-washed-rose-back.png",
        "details": ["001-womens-tee-washed-rose-detail-chest.jpg", "001-womens-tee-washed-rose-detail-neck.jpg",
                    "001-womens-tee-washed-rose-detail-seam.jpg"],
        "callouts_front": [(0.67, 0.27, "Oxblood split-anvil, wearer's left chest"), (0.50, 0.06, "Scoop neck with self binding"),
                           (0.27, 0.62, "Front contour seams")],
        "callouts_back": [(0.50, 0.30, "Arched oxblood IRONKIN")],
        "artwork": [["1", "Left chest", "Split-anvil symbol", "Embroidery", "Oxblood, Pantone TBC", "5 x 3 cm TBC", "15 cm below HPS TBC"],
                    ["2", "Centre back", "Arched IRONKIN wordmark", "Embroidery or flock print TBC", "Oxblood, Pantone TBC", "22 x 6 cm TBC", "8 cm below neck seam TBC"]],
        "artwork_files": ["ironkin-symbol-oxblood.png", "ironkin-arched-oxblood.png"],
        "pom": [["A", "Body length from HPS", "1"], ["B", "Chest width, 2 cm below armhole", "0.5"], ["C", "Waist width", "0.5"],
                ["D", "Hem width", "0.5"], ["E", "Shoulder width", "0.5"], ["F", "Sleeve length", "0.5"],
                ["G", "Sleeve opening", "0.3"], ["H", "Armhole, straight", "0.5"], ["I", "Neck width, seam to seam", "0.3"],
                ["J", "Front neck drop", "0.3"], ["K", "Back neck drop", "0.3"], ["L", "Neck binding width", "0.2"]],
        "bom": [["1", "Shell", "Waffle knit, composition TBC", "Washed Rose", "Body, sleeves"],
                ["2", "Neck binding", "Self fabric", "Washed Rose", "Neckline"],
                ["3", "Main thread", "Polyester", "Washed Rose", "All seams"],
                ["4", "Chest logo", "Embroidery thread", "Oxblood", "Left chest"],
                ["5", "Back wordmark", "Embroidery thread or flock TBC", "Oxblood", "Centre back"],
                ["6", "Labels", "Woven brand + printed care", "Black / white", "Back neck, side seam"],
                ["7", "Hang tag", "Card + string", "Bone / black", "Left side seam"]],
        "construction": [["Neckline", "Self binding, coverstitch", "Rose", "Scoop neck"],
                         ["Contour seams", "Flatlock or overlock + topstitch TBC", "Rose", "Front and back shaping"],
                         ["Side and shoulder", "4-thread overlock", "Rose", ""],
                         ["Sleeve and hem", "Twin-needle coverstitch", "Rose", "Hem depth TBC"]],
    },
    {
        "file": "IK-001-WF-RSE_womens-flared-leggings",
        "style_no": "IK-001-WF-RSE", "name": "Women's Flared Leggings", "category": "Leggings, flared",
        "colourway": "Washed Rose", "fabric": "Waffle knit with stretch, composition and GSM TBC",
        "fit": "Fitted thigh, flared hem", "sizes": ["XS", "S", "M", "L", "XL"], "sample": "S",
        "front": "001-womens-flare-washed-rose-front.png", "back": "001-womens-flare-washed-rose-back.png",
        "details": ["001-womens-flare-washed-rose-detail-hip.jpg", "001-womens-flare-washed-rose-detail-piping.jpg",
                    "001-womens-flare-washed-rose-detail-waist.jpg", "001-womens-flare-washed-rose-detail-hem.jpg"],
        "callouts_front": [(0.50, 0.04, "Broad waistband"), (0.74, 0.08, "Oxblood split-anvil, left hip"),
                           (0.15, 0.55, "Oxblood piping, outer leg"), (0.28, 0.97, "Flared hem")],
        "callouts_back": [(0.50, 0.12, "Clean back, no seams across seat TBC")],
        "artwork": [["1", "Left front hip", "Split-anvil symbol", "Embroidery", "Oxblood, Pantone TBC", "4 x 2.5 cm TBC", "4 cm below waistband TBC"],
                    ["2", "Outer legs", "Piping", "Inserted piping in side seam", "Oxblood", "Width TBC", "Waistband to hem, both legs"]],
        "artwork_files": ["ironkin-symbol-oxblood.png"],
        "pom": [["A", "Waist, relaxed (half)", "0.5"], ["B", "Waistband height", "0.3"], ["C", "Front rise incl. waistband", "0.5"],
                ["D", "Back rise incl. waistband", "0.5"], ["E", "Hip width (half)", "0.5"], ["F", "Thigh width, 2.5 cm below crotch", "0.5"],
                ["G", "Knee width", "0.5"], ["H", "Leg opening (flare)", "0.5"], ["I", "Inseam", "1"],
                ["J", "Outseam incl. waistband", "1"], ["K", "Piping width", "0.1"]],
        "bom": [["1", "Shell", "Waffle knit with stretch, composition TBC", "Washed Rose", "Legs"],
                ["2", "Waistband", "Self fabric, double layer + elastic TBC", "Washed Rose", "Waist"],
                ["3", "Piping", "Bias piping", "Oxblood", "Outer side seams"],
                ["4", "Main thread", "Polyester", "Washed Rose", "All seams"],
                ["5", "Hip logo", "Embroidery thread", "Oxblood", "Left front hip"],
                ["6", "Labels", "Printed care + heat-transfer brand TBC", "Black / white", "Inside back waistband"],
                ["7", "Hang tag", "Card + string", "Bone / black", "Waistband"]],
        "construction": [["Waistband", "Broad double-layer band, flatlock TBC", "Rose", "No drawcord"],
                         ["Outer side seams", "Piping inserted, overlock + topstitch", "Rose", "Continuous, waistband to hem"],
                         ["Inseam and rise", "Flatlock TBC", "Rose", "Gusset TBC"],
                         ["Hem", "Twin-needle coverstitch", "Rose", "Flare width per spec"]],
    },
]

# ---------------------------------------------------------------------------------------------
# Drawing helpers


class Pack:
    def __init__(self, c, product, blank=False, total=TOTAL_PAGES):
        self.c, self.p, self.blank, self.n, self.total = c, product, blank, 0, total

    def v(self, value):
        return "" if self.blank else value

    # Form field: every value in a pack is editable.
    def field(self, name, value, x, y, w, h, size=8, multiline=False, align=0):
        self.n += 1
        self.c.acroForm.textfield(
            name=f"{name}_{self.n}", value=self.v(value), x=x, y=y, width=w, height=h,
            fontName="Helvetica", fontSize=size, borderWidth=0.4, borderColor=LINE, fillColor=FIELD_BG,
            textColor=INK, forceBorder=True, fieldFlags="multiline" if multiline else "",
            tooltip=name.replace("_", " "))

    def header(self, title, page):
        c, p = self.c, self.p
        c.setFillColor(INK); c.rect(0, H - 46, W, 46, stroke=0, fill=1)
        c.drawImage(ImageReader(os.path.join(LOGO, "ironkin-wordmark-bone.png")), M, H - 31, width=96, height=16.5, mask="auto")
        c.setFillColor(RED); c.rect(M + 108, H - 32, 1, 18, stroke=0, fill=1)
        c.setFillColor(white); c.setFont("Label", 13); c.drawString(M + 120, H - 28, title.upper())
        c.setFont("Body", 8); c.setFillColor(HexColor("#B9B0A2"))
        right = "TECH PACK" if self.blank else f"{p['style_no']}  ·  {p['name'].upper()}"
        c.drawRightString(W - M, H - 27, right)
        c.setFillColor(RED); c.rect(0, H - 48, W, 2, stroke=0, fill=1)
        # Footer
        c.setStrokeColor(LINE); c.setLineWidth(0.5); c.line(M, 30, W - M, 30)
        c.setFillColor(MUTED); c.setFont("Body", 7)
        c.drawString(M, 18, "IRONKIN  ·  Confidential  ·  All measurements in cm  ·  TBC = to be confirmed")
        c.drawRightString(W - M, 18, f"Page {page} of {self.total}")

    def label(self, text, x, y, size=7.5, color=MUTED):
        self.c.setFont("Label", size); self.c.setFillColor(color); self.c.drawString(x, y, text.upper())

    def table(self, name, x, top, widths, headers, rows, row_h=17, size=7.5, n_rows=None, multiline=False):
        c = self.c
        c.setFillColor(INK); c.rect(x, top - 15, sum(widths), 15, stroke=0, fill=1)
        c.setFont("Label", 7.5); c.setFillColor(white)
        cx = x
        for wdt, hd in zip(widths, headers):
            c.drawString(cx + 4, top - 10.5, hd.upper()); cx += wdt
        y = top - 15
        rows = list(rows) + [[""] * len(widths)] * max(0, (n_rows or len(rows)) - len(rows))
        for r, row in enumerate(rows):
            y -= row_h
            cx = x
            for col, (wdt, val) in enumerate(zip(widths, row)):
                self.field(f"{name}_r{r + 1}_c{col + 1}", val, cx, y, wdt, row_h, size, multiline)
                cx += wdt
        return y

    def image_box(self, path, x, y, w, h, bg=PANEL, caption=None, placeholder="Place image"):
        c = self.c
        c.setFillColor(bg); c.setStrokeColor(LINE); c.setLineWidth(0.5); c.rect(x, y, w, h, stroke=1, fill=1)
        if path and not self.blank and os.path.exists(path):
            img = ImageReader(path)
            iw, ih = img.getSize()
            s = min((w - 16) / iw, (h - 16) / ih)
            dw, dh = iw * s, ih * s
            c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")
            box = (x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
        else:
            c.setFillColor(MUTED); c.setFont("Label", 9); c.drawCentredString(x + w / 2, y + h / 2, placeholder.upper())
            box = None
        if caption:
            self.label(caption, x, y - 10)
        return box

    def callout(self, num, px, py, lx=None, ly=None):
        c = self.c
        if lx is not None:
            c.setStrokeColor(RED); c.setLineWidth(0.7); c.line(px, py, lx, ly)
            px, py = lx, ly
        c.setFillColor(RED); c.circle(px, py, 6.5, stroke=0, fill=1)
        c.setFillColor(white); c.setFont("BodyBold", 7.5); c.drawCentredString(px, py - 2.6, str(num))


# ---------------------------------------------------------------------------------------------
# Pages


def cover(pk):
    c, p = pk.c, pk.p
    pk.header("Cover", 1)
    c.setFont("Display", 40); c.setFillColor(INK)
    c.drawString(M, H - 100, (p["name"] if not pk.blank else "Style name").upper())
    c.setFillColor(RED); c.rect(M, H - 112, 40, 2.5, stroke=0, fill=1)
    today = datetime.date.today().isoformat()
    rows = [("Style number", p["style_no"]), ("Style name", p["name"]), ("Collection", "001 / The First Rep"),
            ("Season", "Winter, year TBC"), ("Category", p["category"]), ("Colourway", p["colourway"]),
            ("Fit", p["fit"]), ("Size range", f'{p["sizes"][0]} to {p["sizes"][-1]}'), ("Sample size", p["sample"]),
            ("Main fabric", p["fabric"]), ("Version", "V1 · Proto"), ("Date issued", today),
            ("Designer", "IRONKIN"), ("Factory", "TBC"), ("Status", "Draft for proto sample")]
    y = H - 135
    for key, val in rows:
        pk.label(key, M, y + 5)
        pk.field(key.lower().replace(" ", "_"), val, M + 92, y, 250, 17, 8.5)
        y -= 21
    gx, gw = M + 370, (W - M - (M + 370) - 12) / 2
    pk.image_box(os.path.join(CUT, p["front"]), gx, 52, gw, H - 120, caption="Front", placeholder="Front flat")
    pk.image_box(os.path.join(CUT, p["back"]), gx + gw + 12, 52, gw, H - 120, caption="Back", placeholder="Back flat")
    c.showPage()


def flats(pk):
    c, p = pk.c, pk.p
    pk.header("Flats and design details", 2)
    bw = 255
    notes = p["callouts_front"] + p["callouts_back"]
    for i, (key, side) in enumerate([("front", "callouts_front"), ("back", "callouts_back")]):
        x = M + i * (bw + 12)
        box = pk.image_box(os.path.join(CUT, p[key]), x, 52, bw, H - 120, bg=PAPER, caption=key, placeholder=f"{key} flat")
        if box and not pk.blank:
            bx, by, bwid, bh = box
            start = 1 if side == "callouts_front" else len(p["callouts_front"]) + 1
            for k, (nx, ny, _) in enumerate(p[side]):
                tx, ty = bx + nx * bwid, by + (1 - ny) * bh
                dx = 24 if nx >= 0.5 else -24
                lx = min(max(tx + dx, x + 10), x + bw - 10)
                ly = min(ty + 16, by + bh + 4)
                c.setFillColor(RED); c.circle(tx, ty, 1.8, stroke=0, fill=1)
                pk.callout(start + k, tx, ty, lx, ly)
    x0 = M + 2 * (bw + 12) + 6
    pk.label("Design notes", x0, H - 78, 9, INK)
    y = H - 100
    for k in range(9):
        text = notes[k][2] if k < len(notes) else ""
        pk.callout(k + 1, x0 + 7, y + 8)
        pk.field(f"note_{k + 1}", text, x0 + 20, y, W - M - x0 - 20, 17, 8)
        y -= 23
    pk.label("General comments", x0, y - 2)
    pk.field("comments", "Flats are taken from the design boards and are not to scale. Confirm all placements, colours and measurements on the proto sample.",
             x0, 62, W - M - x0, y - 72, 8, multiline=True)
    c.showPage()


def artwork(pk):
    c, p = pk.c, pk.p
    pk.header("Artwork and placement", 3)
    pk.label("Artwork list", M, H - 72, 9, INK)
    widths = [22, 92, 118, 150, 104, 82, W - 2 * M - 568]
    bottom = pk.table("art", M, H - 80, widths, ["#", "Placement", "Artwork", "Method", "Colour", "Size W x H", "Position"],
                      p["artwork"], row_h=24, n_rows=6, multiline=True)
    top = bottom - 22
    box = top - 72 - 10
    pk.label("Artwork files (01-brand/identity/logo)", M, top, 9, INK)
    files = p["artwork_files"] + [None] * (3 - len(p["artwork_files"]))
    for i, f in enumerate(files[:3]):
        bg = INK if (f and "bone" in f) else PANEL
        size = min(128, box)
        pk.image_box(os.path.join(LOGO, f) if f else None, M + i * 140, top - 12 - size, 128, size, bg=bg,
                     caption=(f or "Artwork").replace(".png", ""), placeholder="Artwork")
    pk.label("Detail reference", M + 440, top, 9, INK)
    pk.image_box(os.path.join(IMG, p["details"][0]), M + 440, 62, W - 2 * M - 440, top - 72, caption="Close-up from product board",
                 placeholder="Close-up")
    c.showPage()


def measurements(pk):
    c, p = pk.c, pk.p
    pk.header("Measurement specification", 4)
    sizes = p["sizes"]
    pk.label(f'Sample size: {p["sample"] if not pk.blank else "___"}   ·   Tolerance in cm, plus or minus', M, H - 70, 8)
    size_w = 46
    fixed = [26, 0, 40]
    fixed[1] = W - 2 * M - 26 - 40 - size_w * len(sizes) - 150
    widths = fixed + [size_w] * len(sizes) + [150]
    rows = [[code, pom, tol] + [""] * len(sizes) + [""] for code, pom, tol in p["pom"]]
    pk.table("pom", M, H - 78, widths, ["Code", "Point of measure", "Tol +/-"] + sizes + ["How to measure"],
             rows, row_h=19, n_rows=max(22, len(rows)))
    pk.label("Size values to be completed with the factory's graded spec. Measure flat, garment relaxed.", M, 40, 7)
    c.showPage()


def bom(pk):
    c, p = pk.c, pk.p
    pk.header("Bill of materials", 5)
    widths = [22, 92, 196, 92, 128, 70, W - 2 * M - 600]
    rows = [[n, comp, desc, "TBC", col, place, ""] for n, comp, desc, col, place in p["bom"]]
    rows = [[r[0], r[1], r[2], r[3], r[5], r[4], r[6]] for r in rows]
    pk.table("bom", M, H - 70, widths, ["#", "Component", "Description", "Supplier", "Placement", "Colour", "Consumption / comments"],
             rows, row_h=21, n_rows=max(16, len(rows)), multiline=True)
    c.showPage()


def construction(pk):
    c, p = pk.c, pk.p
    pk.header("Construction", 6)
    widths = [96, 196, 70, 40, W - 2 * M - 402]
    rows = [[a, s, t, "", n] for a, s, t, n in p["construction"]]
    bottom = pk.table("con", M, H - 70, widths, ["Area", "Seam / stitch", "Thread", "SPI", "Notes"],
                      rows, row_h=20, n_rows=9, multiline=True)
    pk.label("Construction details", M, bottom - 16, 9, INK)
    details = p["details"]
    n = 4
    gap = 10
    tw = (W - 2 * M - gap * (n - 1)) / n
    th = bottom - 30 - 62
    for i in range(n):
        f = details[i] if i < len(details) else None
        pk.image_box(os.path.join(IMG, f) if f else None, M + i * (tw + gap), 62, tw, th,
                     caption=(f or "Detail").split("-detail-")[-1].replace(".jpg", "") if f else "Detail", placeholder="Detail photo")
    c.showPage()


def labels(pk):
    c, p = pk.c, pk.p
    pk.header("Labels, packaging and approvals", 7)
    pk.label("Labels and packaging", M, H - 72, 9, INK)
    y = H - 112
    for key, val in COMMON_LABELS.items():
        pk.label(key, M, y + 22)
        pk.field(key.lower().replace(" ", "_"), val, M, y - 8, 330, 28, 7.5, multiline=True)
        y -= 50
    x0 = M + 350
    pk.label("Sample approvals", x0, H - 72, 9, INK)
    widths = [54, 50, 148, 96, 46, W - M - x0 - 394]
    pk.table("log", x0, H - 80, widths, ["Date", "Round", "Comments", "Action", "Status", "By"],
             [["", "Proto", "", "", "Open", ""]], row_h=26, n_rows=13, multiline=True)
    c.showPage()


def build(product, blank=False):
    name = "IK-TECH-PACK_blank-template" if blank else product["file"]
    path = os.path.join(OUT, f"{name}.pdf")
    c = canvas.Canvas(path, pagesize=(W, H))
    c.setTitle("IRONKIN tech pack" + ("" if blank else f" · {product['style_no']} {product['name']}"))
    c.setAuthor("IRONKIN")
    pk = Pack(c, product, blank)
    for page in (cover, flats, artwork, measurements, bom, construction, labels):
        page(pk)
    c.save()
    _need_appearances(path)
    return path, pk.n


def _need_appearances(path):
    """Ask Acrobat to redraw fields on open, so multi-line text wraps."""
    from pypdf import PdfReader, PdfWriter
    writer = PdfWriter(clone_from=PdfReader(path))
    writer.set_need_appearances_writer(True)
    with open(path, "wb") as fh:
        writer.write(fh)


# ---------------------------------------------------------------------------------------------
# Basic 2-page pack: page 1 is the design, page 2 is how to make it.


def flats_with_callouts(pk, x, y, w, h):
    """Front and back flats side by side with numbered callouts. Returns the notes in callout order."""
    c, p = pk.c, pk.p
    gap = 10
    bw = (w - gap) / 2
    for i, (key, side) in enumerate([("front", "callouts_front"), ("back", "callouts_back")]):
        bx0 = x + i * (bw + gap)
        box = pk.image_box(os.path.join(CUT, p[key]), bx0, y, bw, h, bg=PAPER, caption=key, placeholder=f"{key} flat")
        if box and not pk.blank:
            bx, by, bwid, bh = box
            start = 1 if side == "callouts_front" else len(p["callouts_front"]) + 1
            for k, (nx, ny, _) in enumerate(p[side]):
                tx, ty = bx + nx * bwid, by + (1 - ny) * bh
                dx = 22 if nx >= 0.5 else -22
                lx = min(max(tx + dx, bx0 + 10), bx0 + bw - 10)
                ly = min(ty + 15, by + bh + 4)
                c.setFillColor(RED); c.circle(tx, ty, 1.8, stroke=0, fill=1)
                pk.callout(start + k, tx, ty, lx, ly)
    return [n for _, _, n in p["callouts_front"] + p["callouts_back"]]


def basic_design(pk):
    c, p = pk.c, pk.p
    pk.header("Tech pack · design", 1)
    today = datetime.date.today().isoformat()
    info = [("Style number", p["style_no"]), ("Style name", p["name"]), ("Collection", "001 / The First Rep"),
            ("Colourway", p["colourway"]), ("Fit", p["fit"]),
            ("Main fabric", p["fabric"]), ("Size range", f'{p["sizes"][0]} to {p["sizes"][-1]}'),
            ("Sample size", p["sample"]), ("Version / date", f"V1 Proto · {today}"), ("Factory", "TBC")]
    cw = (W - 2 * M - 4 * 8) / 5
    for i, (key, val) in enumerate(info):
        x = M + (i % 5) * (cw + 8)
        y = H - 82 - (i // 5) * 36
        pk.label(key, x, y + 19)
        pk.field(key.lower().replace(" ", "_").replace("/", ""), val, x, y, cw, 16, 8)
    top = H - 132
    fw = 400
    notes = flats_with_callouts(pk, M, 50, fw, top - 50)
    x0 = M + fw + 18
    rw = W - M - x0
    pk.label("Design notes", x0, top - 4, 9, INK)
    y = top - 26
    for k in range(7):
        pk.callout(k + 1, x0 + 7, y + 8)
        pk.field(f"note_{k + 1}", notes[k] if k < len(notes) else "", x0 + 20, y, rw - 20, 16, 7.5)
        y -= 21
    pk.label("Logo and artwork placement", x0, y - 4, 9, INK)
    widths = [16, 58, 88, 60, 52, rw - 274]
    rows = [[a[0], a[1], a[3], a[4], a[5], a[6]] for a in p["artwork"]]
    pk.table("art", x0, y - 12, widths, ["#", "Where", "Method", "Colour", "Size", "Position"],
             rows, row_h=30, n_rows=4, size=7, multiline=True)
    c.showPage()


def basic_make(pk):
    c, p = pk.c, pk.p
    pk.header("Tech pack · measurements and make", 2)
    sizes = p["sizes"]
    lw = 470
    size_w = 34
    widths = [22, lw - 22 - 34 - size_w * len(sizes), 34] + [size_w] * len(sizes)
    pk.label(f'Measurements in cm · sample size {p["sample"] if not pk.blank else "___"} · measure flat', M, H - 70, 8)
    rows = [[code, pom, tol] + [""] * len(sizes) for code, pom, tol in p["pom"]]
    pk.table("pom", M, H - 78, widths, ["", "Point of measure", "Tol ±"] + sizes, rows, row_h=17, size=7.5,
             n_rows=max(24, len(rows)))
    x0 = M + lw + 18
    rw = W - M - x0
    pk.label("Materials", x0, H - 70, 9, INK)
    bwid = [96, rw - 96 - 70, 70]
    bottom = pk.table("bom", x0, H - 78, bwid, ["Component", "Description", "Colour"],
                      [[b[1], b[2], b[3]] for b in p["bom"]], row_h=16, size=7, n_rows=max(9, len(p["bom"])))
    con = "\n".join(f"{a}: {s}" + (f" ({n})" if n else "") for a, s, _, n in p["construction"])
    y = bottom - 16
    pk.label("Construction", x0, y, 9, INK)
    pk.field("construction", con, x0, y - 86, rw, 80, 7, multiline=True)
    y -= 102
    lab = "Neck: woven IRONKIN label. Care: left side seam, content and symbols TBC. Hang tag: bone card. Pack: single polybag, fold 30 x 35 cm."
    pk.label("Labels and packaging", x0, y, 9, INK)
    pk.field("labels", lab, x0, y - 42, rw, 36, 7, multiline=True)
    y -= 58
    pk.label("Sample comments", x0, y, 9, INK)
    pk.field("comments", "", x0, 74, rw, y - 80, 7.5, multiline=True)
    half = (rw - 8) / 2
    pk.label("Approved by", x0, 64)
    pk.label("Date", x0 + half + 8, 64)
    pk.field("approved_by", "", x0, 44, half, 16)
    pk.field("approved_date", "", x0 + half + 8, 44, half, 16)
    c.showPage()


def build_basic(product, blank=False):
    folder = os.path.join(OUT, "basic")
    os.makedirs(folder, exist_ok=True)
    name = "IK-TECH-PACK_basic-blank" if blank else product["file"] + "_basic"
    path = os.path.join(folder, f"{name}.pdf")
    c = canvas.Canvas(path, pagesize=(W, H))
    c.setTitle("IRONKIN basic tech pack" + ("" if blank else f" · {product['style_no']} {product['name']}"))
    c.setAuthor("IRONKIN")
    pk = Pack(c, product, blank, total=2)
    basic_design(pk)
    basic_make(pk)
    c.save()
    _need_appearances(path)
    return path, pk.n


if __name__ == "__main__":
    for prod in PRODUCTS:
        path, n = build(prod)
        print(os.path.basename(path), f"{n} fields")
    path, n = build(PRODUCTS[0], blank=True)
    print(os.path.basename(path), f"{n} fields")
    for prod in PRODUCTS:
        path, n = build_basic(prod)
        print("basic/" + os.path.basename(path), f"{n} fields")
    path, n = build_basic(PRODUCTS[0], blank=True)
    print("basic/" + os.path.basename(path), f"{n} fields")
