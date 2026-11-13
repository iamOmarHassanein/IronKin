"""Build a 2-page, hand-editable tech pack per style as a .pptx (opens in Google Slides,
PowerPoint or Keynote). Page 1 is the design sheet, page 2 is the spec sheet.

Run from the repo root: python 02-product/tech-packs/tools/build_slides.py
Output: 02-product/tech-packs/slides/. Product data is read from build_techpacks.py,
so both formats stay in step.
"""
import ast
import datetime
import os
import re

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CUTOUTS = os.path.join(ROOT, "03-website", "source-boards", "cutouts")
LOGOS = os.path.join(ROOT, "01-brand", "identity", "logo", "png")
OUT = os.path.join(HERE, "..", "slides")

# Product data: the PRODUCTS list literal in build_techpacks.py.
src = open(os.path.join(HERE, "build_techpacks.py"), encoding="utf-8").read()
PRODUCTS = ast.literal_eval(re.search(r"^PRODUCTS = (\[.*?^\])", src, re.S | re.M).group(1))

BLACK, PANEL, CREAM, RED = RGBColor(0x0B, 0x0B, 0x0B), RGBColor(0xF4, 0xF1, 0xEC), RGBColor(0xF1, 0xE5, 0xD3), RGBColor(0xA3, 0x1E, 0x23)
GREY, LINE, WHITE = RGBColor(0x6B, 0x66, 0x60), RGBColor(0xCF, 0xCA, 0xC2), RGBColor(0xFF, 0xFF, 0xFF)
HEAD, BODY = "Barlow Condensed", "Barlow"
W, H = 11.69, 8.27           # A4 landscape, inches
M = 0.4                      # page margin
SWATCH = {"Black": ("0B0B0B", [("Black", "0B0B0B"), ("Cream", "F1E5D3")]),
          "Washed Rose": ("C98F8F", [("Washed Rose", "C98F8F"), ("Oxblood", "A31E23")])}


def text(slide, x, y, w, h, s, size=9, bold=False, color=BLACK, font=BODY, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=0):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    r.text = s
    f = r.font
    f.size, f.bold, f.name = Pt(size), bold, font
    f.color.rgb = color
    if spacing:
        r._r.get_or_add_rPr().set("spc", str(spacing))
    return tb


def rect(slide, x, y, w, h, fill=None, line=None, shape=MSO_SHAPE.RECTANGLE):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    s.shadow.inherit = False
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line
        s.line.width = Pt(0.75)
    return s


def table(slide, x, y, w, rows, widths, row_h=0.26, size=8, head=True, label_col=False):
    """A plain, fully editable table. rows[0] is the header when head is True."""
    shape = slide.shapes.add_table(len(rows), len(rows[0]), Inches(x), Inches(y), Inches(w), Inches(row_h * len(rows)))
    t = shape.table
    # Drop the built-in banded style so cells only carry the fills set here.
    tbl_pr = t._tbl.tblPr
    for attr in ("bandRow", "firstRow"):
        tbl_pr.set(attr, "0")
    style = tbl_pr.find("{http://schemas.openxmlformats.org/drawingml/2006/main}tableStyleId")
    if style is not None:
        style.text = "{5940675A-B579-460E-94D1-54222C63F5DA}"   # "No Style, Table Grid"
    total = sum(widths)
    for i, cw in enumerate(widths):
        t.columns[i].width = Inches(w * cw / total)
    for r, row in enumerate(rows):
        t.rows[r].height = Inches(row_h)
        for c, val in enumerate(row):
            cell = t.cell(r, c)
            cell.margin_left = cell.margin_right = Inches(0.05)
            cell.margin_top = cell.margin_bottom = Inches(0.02)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            is_head = head and r == 0
            is_label = label_col and c == 0 and not is_head
            cell.fill.solid()
            cell.fill.fore_color.rgb = BLACK if is_head else (PANEL if is_label else WHITE)
            p = cell.text_frame.paragraphs[0]
            run = p.add_run()
            run.text = str(val)
            f = run.font
            f.size = Pt(size)
            f.name = HEAD if (is_head or is_label) else BODY
            f.bold = is_head or is_label
            f.color.rgb = CREAM if is_head else BLACK
            # An empty cell takes its height from the paragraph-end font (18 pt by default),
            # which makes blank rows taller than filled ones. Pin it to the cell's size.
            p._p.append(p._p.makeelement(qn("a:endParaRPr"), {"sz": str(int(size * 100))}))
    return shape


def header(slide, page, p, n):
    rect(slide, 0, 0, W, 0.72, fill=BLACK)
    rect(slide, 0, 0.72, W, 0.04, fill=RED)
    slide.shapes.add_picture(os.path.join(LOGOS, "ironkin-wordmark-bone.png"), Inches(M), Inches(0.22), height=Inches(0.28))
    text(slide, 2.35, 0.2, 4, 0.34, f"TECH PACK  ·  {page}", 15, True, CREAM, HEAD, anchor=MSO_ANCHOR.MIDDLE, spacing=100)
    text(slide, W - M - 5, 0.2, 5, 0.34, f"{p['style_no']}  ·  {p['name'].upper()}", 11, False, CREAM, HEAD, PP_ALIGN.RIGHT, MSO_ANCHOR.MIDDLE, 100)
    text(slide, M, H - 0.36, 7, 0.2, "IRONKIN  ·  Confidential  ·  All measurements in cm  ·  TBC = to be confirmed", 7, color=GREY)
    text(slide, W - M - 2, H - 0.36, 2, 0.2, f"Page {n} of 2", 7, color=GREY, align=PP_ALIGN.RIGHT)


def section(slide, x, y, s):
    text(slide, x, y, 5, 0.22, s, 10, True, BLACK, HEAD, spacing=150)
    rect(slide, x, y + 0.22, 0.42, 0.025, fill=RED)


def garment(slide, x, y, w, h, img, label, callouts, start):
    """A framed garment picture with numbered callout dots. Dots and lines are separate shapes, so they can be dragged."""
    rect(slide, x, y, w, h, fill=WHITE, line=LINE)
    text(slide, x + 0.1, y + 0.07, 2, 0.2, label, 8, True, GREY, HEAD, spacing=200)
    path = os.path.join(CUTOUTS, img)
    iw, ih = Image.open(path).size
    pad_x, pad_top, pad_bot = 0.5, 0.45, 0.3
    scale = min((w - 2 * pad_x) / iw, (h - pad_top - pad_bot) / ih)
    gw, gh = iw * scale, ih * scale
    gx, gy = x + (w - gw) / 2, y + pad_top + (h - pad_top - pad_bot - gh) / 2
    slide.shapes.add_picture(path, Inches(gx), Inches(gy), Inches(gw), Inches(gh))
    d = 0.24
    for i, (fx, fy, _) in enumerate(callouts):
        tx, ty = gx + fx * gw, gy + fy * gh
        # Put the dot towards the nearer frame edge so it sits beside the garment, not on it.
        side = 1 if fx >= 0.5 else -1
        cx = min(max(tx + side * 0.42, x + 0.08 + d / 2), x + w - 0.08 - d / 2)
        cy = max(ty - 0.22, y + 0.4)
        ln = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(cx), Inches(cy), Inches(tx), Inches(ty))
        ln.line.color.rgb = RED
        ln.line.width = Pt(0.9)
        dot = rect(slide, tx - 0.03, ty - 0.03, 0.06, 0.06, fill=RED, shape=MSO_SHAPE.OVAL)
        c = rect(slide, cx - d / 2, cy - d / 2, d, d, fill=RED, shape=MSO_SHAPE.OVAL)
        tf = c.text_frame
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        para = tf.paragraphs[0]
        para.alignment = PP_ALIGN.CENTER
        run = para.add_run()
        run.text = str(start + i)
        run.font.size, run.font.bold, run.font.name = Pt(8), True, HEAD
        run.font.color.rgb = WHITE


def build(p):
    prs = Presentation()
    prs.slide_width, prs.slide_height = Inches(W), Inches(H)
    blank = prs.slide_layouts[6]
    today = datetime.date.today().isoformat()
    sizes = p["sizes"]

    # ---------- Page 1: design ----------
    s = prs.slides.add_slide(blank)
    header(s, "DESIGN", p, 1)
    info = [["STYLE NO", "STYLE NAME", "COLLECTION", "COLOURWAY", "FIT", "MAIN FABRIC"],
            [p["style_no"], p["name"], "001 / The First Rep", p["colourway"], p["fit"], p["fabric"]],
            ["SIZE RANGE", "SAMPLE SIZE", "VERSION", "DATE", "FACTORY", "STATUS"],
            [f"{sizes[0]} to {sizes[-1]}", p["sample"], "V1 Proto", today, "TBC", "For sampling"]]
    t = table(s, M, 0.95, W - 2 * M, info, [1.2, 1.5, 1.4, 1.1, 1.9, 3.2], row_h=0.25, head=False).table
    for r in (0, 2):                                 # label rows
        for c in range(6):
            cell = t.cell(r, c)
            cell.fill.fore_color.rgb = PANEL
            f = cell.text_frame.paragraphs[0].runs[0].font
            f.name, f.bold, f.size = HEAD, True, Pt(7)
            f.color.rgb = GREY

    top, bot = 2.2, H - 0.55
    bw = 3.25
    garment(s, M, top, bw, bot - top, p["front"], "FRONT", p["callouts_front"], 1)
    garment(s, M + bw + 0.15, top, bw, bot - top, p["back"], "BACK", p["callouts_back"], 1 + len(p["callouts_front"]))

    rx = M + 2 * bw + 0.4
    rw = W - M - rx
    section(s, rx, top, "DESIGN NOTES")
    notes = [["#", "Detail"]] + [[i + 1, c[2]] for i, c in enumerate(p["callouts_front"] + p["callouts_back"])]
    while len(notes) < 9:
        notes.append(["", ""])
    table(s, rx, top + 0.34, rw, notes, [0.35, 4.2], row_h=0.25)

    ay = top + 0.34 + 0.25 * len(notes) + 0.22
    section(s, rx, ay, "LOGO AND ARTWORK")
    art = [["#", "Where", "Method", "Colour", "Size"]] + [[a[0], a[1], a[3], a[4], a[5]] for a in p["artwork"]]
    table(s, rx, ay + 0.34, rw, art, [0.3, 1.1, 1.6, 1.1, 0.9], row_h=0.36, size=7)

    cy = ay + 0.34 + 0.36 * len(art) + 0.22
    section(s, rx, cy, "COLOURS")
    for i, (name, hexv) in enumerate(SWATCH[p["colourway"]][1]):
        sx = rx + i * 1.5
        rect(s, sx, cy + 0.36, 0.34, 0.34, fill=RGBColor.from_string(hexv), line=LINE)
        text(s, sx + 0.42, cy + 0.36, 1.05, 0.34, f"{name}\nPantone TBC", 7, anchor=MSO_ANCHOR.MIDDLE)

    # ---------- Page 2: specs ----------
    s = prs.slides.add_slide(blank)
    header(s, "SPECS", p, 2)
    lw = 5.75
    section(s, M, 0.95, f"MEASUREMENTS  ·  cm, laid flat  ·  sample size {p['sample']}")
    pom = [["", "Point of measure", "Tol ±"] + sizes] + [[a, b, c] + [""] * len(sizes) for a, b, c in p["pom"]]
    table(s, M, 1.29, lw, pom, [0.32, 2.6, 0.5] + [0.5] * len(sizes), row_h=0.27)

    rx = M + lw + 0.3
    rw = W - M - rx
    section(s, rx, 0.95, "MATERIALS")
    bom = [["#", "Component", "Description", "Colour"]] + [[b[0], b[1], b[2], b[3]] for b in p["bom"]]
    table(s, rx, 1.29, rw, bom, [0.3, 1.25, 2.6, 1.0], row_h=0.27, size=7)

    cy = 1.29 + 0.27 * len(bom) + 0.24
    section(s, rx, cy, "CONSTRUCTION")
    con = [["Area", "Seam and stitch", "Thread", "Notes"]] + p["construction"]
    table(s, rx, cy + 0.34, rw, con, [1.1, 2.0, 0.6, 1.5], row_h=0.3, size=7)

    by = max(1.29 + 0.27 * len(pom), 0) + 0.26
    section(s, M, by, "SAMPLE COMMENTS")
    box = rect(s, M, by + 0.34, lw, H - 0.55 - by - 0.34, fill=WHITE, line=LINE)
    box.text_frame.text = ""
    ry = max(cy + 0.34 + 0.3 * len(con) + 0.24, by)
    section(s, rx, ry, "VERSIONS AND APPROVAL")
    rev = [["Version", "Date", "What changed", "Approved by"], ["V1 Proto", today, "First tech pack issued", ""], ["", "", "", ""]]
    table(s, rx, ry + 0.34, rw, rev, [0.9, 0.9, 2.2, 1.2], row_h=0.27, size=7)

    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{p['file']}_tech-pack.pptx")
    prs.save(path)
    return path


if __name__ == "__main__":
    for prod in PRODUCTS:
        print(os.path.relpath(build(prod), ROOT))
