"""Collection 01 boards: four item boards and a rail lineup, rendered with headless Chrome."""
import os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "c01")
os.makedirs(OUT, exist_ok=True)
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

BLACK, BONE, OX, STEEL = "#0B0B0A", "#EEE7DC", "#8A1019", "#6E6A63"
GARMENT_BLACK, SEAM_BLACK = "#161615", "#3c3a37"
HEATHER, SEAM_GREY = "#76736D", "#56534E"


def load(name):
    vb = re.search(r'viewBox="([^"]+)"', open(os.path.join(HERE, f"{name}.svg")).read()).group(1)
    w, h = map(float, vb.split()[2:])
    return vb, open(os.path.join(HERE, f"{name}.path")).read(), w, h


LOGO = {n: load(n) for n in ("symbol", "wordmark", "arched")}


def logo(name, width, color=BONE):
    vb, d, w, h = LOGO[name]
    return f'<svg viewBox="{vb}" width="{width:.0f}" height="{width*h/w:.0f}"><path fill="{color}" fill-rule="evenodd" d="{d}"/></svg>'


def place(name, cx, y, width, color=BONE):
    vb, d, w, h = LOGO[name]
    return (f'<g transform="translate({cx - width/2:.1f} {y:.1f}) scale({width/w:.4f})">'
            f'<path fill="{color}" fill-rule="evenodd" d="{d}"/></g>')


DEFS = """<svg width="0" height="0" style="position:absolute"><defs>
<filter id="heather" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6 0.25" numOctaves="2" seed="5" result="n"/>
<feColorMatrix in="n" type="saturate" values="0" result="g"/><feComponentTransfer in="g" result="t"><feFuncA type="table" tableValues="0 0.22"/></feComponentTransfer>
<feComposite in="t" in2="SourceGraphic" operator="in" result="tex"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="tex"/></feMerge></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/>
<feComponentTransfer><feFuncA type="table" tableValues="0 0.09"/></feComponentTransfer></filter>
</defs></svg>"""

CSS = f"""@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500;600&display=swap');
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:{BLACK};color:{BONE};font-family:'Barlow',Arial,sans-serif;overflow:hidden}}
.board{{position:relative;width:var(--w);height:var(--h);padding:56px 64px;background:{BLACK}}}
.grain{{position:absolute;inset:0;pointer-events:none}}
.head{{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #3a3835;padding-bottom:20px}}
.num{{font-family:'Barlow Condensed';font-weight:800;color:{OX};font-size:28px;margin-right:20px}}
.title{{font-family:'Barlow Condensed';font-weight:600;font-size:22px;letter-spacing:.38em}}
.cap{{font-family:'Barlow Condensed';font-size:15px;letter-spacing:.3em;color:#a7a198;text-transform:uppercase}}
.lab{{font-family:'Barlow Condensed';font-size:14px;letter-spacing:.24em;color:{STEEL};text-transform:uppercase}}
.h1{{font-family:'Barlow Condensed';font-weight:800;text-transform:uppercase;line-height:.92}}
table{{border-collapse:collapse;width:100%;font-family:'Barlow Condensed';font-size:17px;letter-spacing:.06em}}
td{{padding:7px 0;border-bottom:1px solid #2a2927;color:#d7d0c5}} td:last-child{{text-align:right;color:{BONE};font-weight:600}}
"""


def page(slug, num, title, body, w=1800, h=1100):
    head = (f'<div class="head"><div style="display:flex;align-items:baseline"><span class="num">{num}</span>'
            f'<span class="title">{title}</span></div>{logo("wordmark", 150, STEEL)}</div>')
    html = (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body style="--w:{w}px;--h:{h}px">'
            f'{DEFS}<div class="board">{head}{body}<svg class="grain" width="{w}" height="{h}"><rect width="100%" height="100%" filter="url(#grain)"/></svg>'
            f'</div></body></html>')
    path = os.path.join(OUT, f"{slug}.html")
    open(path, "w", encoding="utf-8").write(html)
    return path, w, h


# --- Flats, drawn in a 600 x 700 box -------------------------------------------------
TOP_BODY = ("M205 78 L128 104 L78 132 L36 470 L30 566 L104 570 L112 476 L136 262 "
            "L134 610 L132 668 L468 668 L466 610 L464 262 L488 476 L496 570 L570 566 L564 470 L522 132 L472 104 L395 78 Z")
SEAMS = ("M136 262 L150 118 M464 262 L450 118 "          # dropped shoulder seams
         "M134 618 L466 618 "                              # hem rib
         "M38 520 L108 524 M492 524 L562 520")             # cuff ribs
HOOD_FRONT = ("M196 104 C170 30 230 -6 300 -6 C370 -6 430 30 404 104 C380 92 352 86 300 86 C248 86 220 92 196 104 Z",
              "M232 100 C228 40 262 18 300 18 C338 18 372 40 368 100 C352 96 330 94 300 94 C270 94 248 96 232 100 Z")
HOOD_BACK = "M196 104 C176 18 236 -10 300 -10 C364 -10 424 18 404 104 C372 112 336 116 300 116 C264 116 228 112 196 104 Z"
POCKET = "M196 452 L404 452 L432 598 L168 598 Z M196 452 L176 540 M404 452 L424 540"
CREW_NECK_FRONT = "M205 78 C225 128 375 128 395 78"
CREW_NECK_FRONT_RIB = "M218 82 C238 116 362 116 382 82"
CREW_NECK_BACK = "M205 78 C235 96 365 96 395 78"
PANTS = ("M150 24 L450 24 L454 84 L496 742 L326 742 L300 284 L274 742 L104 742 L146 84 Z")
PANTS_SEAMS = ("M146 84 L454 84 "                         # waistband
               "M300 84 L300 284 "                         # center seam
               "M112 700 L272 700 M328 700 L490 700")      # hem stitch (open hem)
PANTS_POCKETS_FRONT = "M158 98 L198 236 M442 98 L402 236"
PANTS_POCKET_BACK = "M346 140 L430 140 L426 232 L350 232 Z"


def flat(kind, fill, seam, view, prints="", w=430, heather=False, wide=False):
    vx, vw = (-140, 880) if wide else (0, 600)
    f = ' filter="url(#heather)"' if heather else ""
    sw = 2.2
    if kind == "pants":
        body = f'<path d="{PANTS}" fill="{fill}" stroke="{seam}" stroke-width="{sw}"{f}/>'
        det = f'<path d="{PANTS_SEAMS}" fill="none" stroke="{seam}" stroke-width="{sw}"/>'
        det += f'<path d="M150 64 L450 64" fill="none" stroke="{seam}" stroke-width="1.4" stroke-dasharray="5 4"/>'
        if view == "front":
            det += f'<path d="{PANTS_POCKETS_FRONT}" fill="none" stroke="{seam}" stroke-width="{sw}"/>'
            det += (f'<path d="M288 84 C284 130 270 150 262 172 M312 84 C316 130 330 150 338 172" fill="none" stroke="{BONE}" stroke-width="3" stroke-linecap="round"/>'
                    f'<rect x="258" y="168" width="8" height="16" rx="2" fill="{BONE}"/><rect x="334" y="168" width="8" height="16" rx="2" fill="{BONE}"/>')
        else:
            det += f'<path d="{PANTS_POCKET_BACK}" fill="none" stroke="{seam}" stroke-width="{sw}"/>'
        height = 760
        return f'<svg viewBox="{vx} 0 {vw} {height}" width="{w}" height="{w*height/vw:.0f}">{body}{det}{prints}</svg>'
    parts = [f'<path d="{TOP_BODY}" fill="{fill}" stroke="{seam}" stroke-width="{sw}"{f}/>',
             f'<path d="{SEAMS}" fill="none" stroke="{seam}" stroke-width="{sw}"/>']
    if kind == "hoodie":
        if view == "front":
            parts.append(f'<path d="{HOOD_FRONT[0]}" fill="{fill}" stroke="{seam}" stroke-width="{sw}"{f}/>')
            parts.append(f'<path d="{HOOD_FRONT[1]}" fill="#0a0a09" stroke="{seam}" stroke-width="{sw}"/>')
            parts.append(f'<path d="{POCKET}" fill="none" stroke="{seam}" stroke-width="{sw}"/>')
            parts.append(f'<path d="M282 100 L276 230 M318 100 L324 230" stroke="{BONE}" stroke-width="3" stroke-linecap="round"/>'
                         f'<rect x="272" y="226" width="8" height="18" rx="2" fill="{BONE}"/><rect x="320" y="226" width="8" height="18" rx="2" fill="{BONE}"/>')
        else:
            parts.append(f'<path d="{HOOD_BACK}" fill="{fill}" stroke="{seam}" stroke-width="{sw}"{f}/>')
            parts.append(f'<path d="M300 -8 L300 114" stroke="{seam}" stroke-width="{sw}"/>')
    else:
        if view == "front":
            parts.append(f'<path d="{CREW_NECK_FRONT}" fill="#0a0a09" stroke="{seam}" stroke-width="{sw}"/>'
                         f'<path d="{CREW_NECK_FRONT_RIB}" fill="none" stroke="{seam}" stroke-width="1.6"/>')
        else:
            parts.append(f'<path d="{CREW_NECK_BACK}" fill="none" stroke="{seam}" stroke-width="{sw}"/>'
                         f'<path d="M218 82 C245 100 355 100 382 82" fill="none" stroke="{seam}" stroke-width="1.6"/>')
    return f'<svg viewBox="{vx} -14 {vw} 700" width="{w}" height="{w*700/vw:.0f}">{"".join(parts)}{prints}</svg>'


# Print placements. The chest symbol sits on the wearer's left, which is the viewer's right on a front flat.
CHEST = place("symbol", 382, 168, 74)
BACK_HOODIE = place("arched", 300, 150, 250)
BACK_CREW = place("arched", 300, 130, 250)
PANTS_TAB = (f'<rect x="420" y="30" width="28" height="44" fill="{BLACK}" stroke="{BONE}" stroke-width="1.2"/>'
             + place("symbol", 434, 44, 20))


def callout(x1, y1, x2, y2, text):
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{OX}" stroke-width="1.5"/>'
            f'<circle cx="{x1}" cy="{y1}" r="4" fill="{OX}"/>'
            f'<text x="{x2 + (6 if x2 > x1 else -6)}" y="{y2 + 5}" fill="#cfc8bd" font-family="Barlow Condensed" font-size="22" letter-spacing="3" '
            f'text-anchor="{"start" if x2 > x1 else "end"}">{text}</text>')


def item_board(slug, num, name, colour_name, swatch, kind, front, back, specs, notes, heather=False):
    seam = SEAM_GREY if heather else SEAM_BLACK
    fr = flat(kind, swatch, seam, "front", front, 560, heather, True)
    bk = flat(kind, swatch, seam, "back", back, 560, heather, True)
    rows = "".join(f"<tr><td>{k}</td><td>{v}</td></tr>" for k, v in specs)
    note = "".join(f'<li style="margin:7px 0">{n}</li>' for n in notes)
    body = f'''
<div style="display:grid;grid-template-columns:1fr 1fr 470px;gap:30px;margin-top:30px;height:900px">
 <div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="position:relative">{fr}</div><div class="cap" style="margin-top:18px">Front</div></div>
 <div style="display:flex;flex-direction:column;align-items:center;justify-content:center">{bk}<div class="cap" style="margin-top:18px">Back</div></div>
 <div style="padding-top:26px">
  <div class="h1" style="font-size:64px">{name}</div>
  <div style="display:flex;align-items:center;gap:14px;margin:18px 0 26px"><div style="width:34px;height:34px;background:{swatch};border:1px solid #4a4743"></div>
   <div class="cap" style="color:{BONE}">{colour_name}</div></div>
  <table>{rows}</table>
  <ul style="list-style:none;margin-top:22px;font-size:16px;line-height:1.45;color:#a7a198">{note}</ul>
 </div>
</div>'''
    return page(slug, num, f"COLLECTION 01 · {name.upper()}", body)


pages = []
FIT = "Oversized, loose. Dropped shoulder"
pages.append(item_board("01-hoodie-black", "01", "Oversized hoodie", "Forge black", GARMENT_BLACK, "hoodie",
    CHEST + callout(400, 190, 560, 130, "SYMBOL 90 MM"),
    BACK_HOODIE + callout(420, 175, 520, 110, "WORDMARK 300 MM"),
    [("Fit", FIT), ("Fabric", "420 GSM brushed fleece"), ("Hood", "Double layer, no eyelets"), ("Pocket", "Kangaroo"),
     ("Chest print", "Bone symbol, wearer's left"), ("Back print", "Bone arched wordmark"), ("Print method", "Screen print, puff optional"),
     ("Size L · chest width", "68 cm"), ("Size L · length (HPS)", "74 cm"), ("Size L · sleeve", "58 cm")],
    ["Chest symbol 180 mm below high point of shoulder, 90 mm from centre front.",
     "Back wordmark 100 mm below the hood seam, centred.",
     "All measurements are proposals to confirm with the factory."]))
pages.append(item_board("02-sweatshirt-black", "02", "Oversized sweatshirt", "Forge black", GARMENT_BLACK, "crew",
    CHEST + callout(400, 190, 560, 130, "SYMBOL 90 MM"),
    BACK_CREW + callout(420, 155, 520, 90, "WORDMARK 300 MM"),
    [("Fit", FIT), ("Fabric", "400 GSM brushed fleece"), ("Neck", "Rib crew, 3 cm"), ("Cuffs and hem", "Heavy 2x2 rib"),
     ("Chest print", "Bone symbol, wearer's left"), ("Back print", "Bone arched wordmark"), ("Print method", "Screen print"),
     ("Size L · chest width", "66 cm"), ("Size L · length (HPS)", "70 cm"), ("Size L · sleeve", "57 cm")],
    ["Same print placement as the hoodie so the set matches.",
     "Back wordmark 80 mm below the collar seam, centred.",
     "All measurements are proposals to confirm with the factory."]))
PANTS_SPECS = [("Fit", "Oversized, wide straight leg"), ("Fabric", "420 GSM brushed fleece"), ("Waist", "Elastic, external drawcord"),
               ("Pockets", "2 side seam, 1 back patch"), ("Hem", "Open, stitched, no cuff"), ("Branding", "Woven symbol tab, left waistband"),
               ("Size L · waist (relaxed)", "39 cm"), ("Size L · hip", "60 cm"), ("Size L · inseam", "78 cm"), ("Size L · leg opening", "27 cm")]
PANTS_NOTES = ["Brief asked for no print on pants; the small woven tab is a proposal and can be removed.",
               "Open hem stacks over sneakers for the loose look.",
               "All measurements are proposals to confirm with the factory."]
pages.append(item_board("03-pants-black", "03", "Oversized pants", "Forge black", GARMENT_BLACK, "pants",
    PANTS_TAB + callout(440, 74, 540, 150, "WOVEN TAB"), "", PANTS_SPECS, PANTS_NOTES))
pages.append(item_board("04-pants-grey", "04", "Oversized pants", "Ash heather grey", HEATHER, "pants",
    PANTS_TAB + callout(440, 74, 540, 150, "WOVEN TAB"), "", PANTS_SPECS, PANTS_NOTES, heather=True))

# --- Rail lineup ---------------------------------------------------------------------
def hanger(cx, top, width=230):
    return (f'<path d="M{cx} {top} m0 0 c0 -16 16 -16 16 -30 c0 -12 -10 -18 -18 -18 c-10 0 -16 6 -16 14" fill="none" stroke="#bdb6aa" stroke-width="4" stroke-linecap="round"/>'
            f'<path d="M{cx - width/2} {top + 40} L{cx} {top} L{cx + width/2} {top + 40}" fill="none" stroke="#8a6a46" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>')


def clip_hanger(cx, top, width=200):
    return (f'<path d="M{cx} {top} c0 -16 16 -16 16 -30 c0 -12 -10 -18 -18 -18 c-10 0 -16 6 -16 14" fill="none" stroke="#bdb6aa" stroke-width="4" stroke-linecap="round"/>'
            f'<rect x="{cx - width/2}" y="{top}" width="{width}" height="10" rx="3" fill="#8a6a46"/>'
            f'<rect x="{cx - width/2 + 6}" y="{top + 8}" width="14" height="24" fill="#bdb6aa"/><rect x="{cx + width/2 - 20}" y="{top + 8}" width="14" height="24" fill="#bdb6aa"/>')


def hung(svg_flat, cx, top, w):
    return f'<foreignObject x="{cx - w/2}" y="{top}" width="{w}" height="{w*1.3}"><div xmlns="http://www.w3.org/1999/xhtml">{svg_flat}</div></foreignObject>'


rail_y = 140
items = [
    (300, "hoodie", GARMENT_BLACK, SEAM_BLACK, CHEST, False, "Hoodie · black"),
    (690, "crew", GARMENT_BLACK, SEAM_BLACK, CHEST, False, "Sweatshirt · black"),
    (1060, "pants", GARMENT_BLACK, SEAM_BLACK, PANTS_TAB, False, "Pants · black"),
    (1400, "pants", HEATHER, SEAM_GREY, PANTS_TAB, True, "Pants · ash heather"),
]
rail = [f'<rect x="80" y="{rail_y - 10}" width="1520" height="12" rx="6" fill="#4a4743"/>',
        f'<rect x="96" y="{rail_y}" width="10" height="800" fill="#3a3835"/><rect x="1574" y="{rail_y}" width="10" height="800" fill="#3a3835"/>']
labels = []
for cx, kind, fill, seam, pr, heat, label in items:
    if kind == "pants":
        rail.append(clip_hanger(cx, rail_y + 50))
        rail.append(hung(flat(kind, fill, seam, "front", pr, 300, heat), cx, rail_y + 62, 300))
    else:
        rail.append(hanger(cx, rail_y + 50))
        rail.append(hung(flat(kind, fill, seam, "front", pr, 360, heat), cx, rail_y + 72, 360))
    labels.append(f'<text x="{cx}" y="{rail_y + 640}" fill="#a7a198" font-family="Barlow Condensed" font-size="17" letter-spacing="5" text-anchor="middle">{label.upper()}</text>')
lineup = f'''
<div style="position:relative;margin-top:24px">
 <svg viewBox="0 0 1680 860" width="1680" height="860">
  <defs><radialGradient id="spot" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#262523"/><stop offset="1" stop-color="{BLACK}"/></radialGradient></defs>
  <rect width="1680" height="860" fill="url(#spot)"/>{"".join(rail)}{"".join(labels)}
  <g transform="translate(840 820)"><text fill="{BONE}" font-family="Barlow Condensed" font-weight="600" font-size="20" letter-spacing="9" text-anchor="middle">FORGED TOGETHER.</text></g>
 </svg>
</div>'''
pages.append(page("05-collection-rail", "05", "COLLECTION 01 · ON THE RAIL", lineup))

# --- Studio set ---------------------------------------------------------------------
flag = (f'<svg viewBox="0 0 400 600" width="300"><path d="M0 0 H400 V560 L200 600 L0 560 Z" fill="{BLACK}" stroke="#3a3835" stroke-width="2"/>'
        f'<rect x="0" y="0" width="400" height="14" fill="{OX}"/>{place("symbol", 200, 120, 270, BONE)}{place("wordmark", 200, 330, 300, BONE)}'
        f'<text x="200" y="440" fill="{BONE}" font-family="Barlow Condensed" font-weight="500" font-size="20" letter-spacing="9" text-anchor="middle">FORGED TOGETHER.</text>'
        f'<rect x="168" y="466" width="64" height="4" fill="{OX}"/></svg>')
poster = lambda bg, fg, txt: (f'<div style="width:150px;height:200px;background:{bg};border:1px solid #3a3835;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">'
                              f'{logo("symbol", 100, fg)}<div class="h1" style="font-size:22px;color:{fg};text-align:center">{txt}</div></div>')
granite = ('background:#2b2a28;background-image:radial-gradient(circle at 20% 30%,#3a3936 0 2px,transparent 3px),radial-gradient(circle at 70% 60%,#1d1c1b 0 3px,transparent 4px),'
           'linear-gradient(115deg,#34332f 0%,#222120 40%,#2e2d2a 70%,#1b1a19 100%);background-size:23px 23px,31px 31px,100% 100%')
shots = [("1", "Rail", "All four pieces on a black steel rail, flag behind"),
         ("2", "Hero front", "Two models, full look, chest symbols visible"),
         ("3", "Hero back", "Same pair turned away, IRONKIN back prints"),
         ("4", "Detail", "Close-up of chest symbol and drawcord"),
         ("5", "UGC mirror", "Phone selfie in the studio mirror, posters behind"),
         ("6", "Seated", "Model on a plyo box, grey pants stacking at the hem"),
         ("7", "Crew", "Three people, arms crossed, flag centred"),
         ("8", "Flat lay", "Collection laid out on the granite floor")]
shot_rows = "".join(f'<tr><td style="width:40px;color:{OX};font-weight:800">{n}</td><td style="text-align:left;color:{BONE}">{a}</td><td style="text-align:left;color:#a7a198;font-weight:400">{b}</td></tr>' for n, a, b in shots)
set_body = f'''
<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:44px;margin-top:30px">
 <div>
  <div style="position:relative;height:560px;border:1px solid #3a3835;overflow:hidden;background:#222"><svg style="position:absolute;inset:0" width="100%" height="100%"><filter id="stone"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.026" numOctaves="6" seed="8"/><feColorMatrix values="0.2 0.2 0.2 0 -0.12  0.2 0.2 0.19 0 -0.12  0.19 0.19 0.19 0 -0.12  0 0 0 0 1"/></filter><filter id="speck"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2"/><feColorMatrix values="0 0 0 0 0.75 0 0 0 0 0.73 0 0 0 0 0.7 -6 0 0 0 3.1"/></filter><rect width="100%" height="100%" filter="url(#stone)"/><rect width="100%" height="100%" filter="url(#speck)" opacity=".18"/><rect width="100%" height="100%" fill="url(#vig)"/><defs><radialGradient id="vig" cx="50%" cy="22%" r="75%"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient></defs></svg>
   <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 18%,rgba(255,240,220,.16),transparent 60%),linear-gradient(transparent 70%,rgba(0,0,0,.55))"></div>
   <div style="position:absolute;left:50%;top:40px;transform:translateX(-50%) scale(.72);transform-origin:top center">{flag}</div>
   <div style="position:absolute;left:46px;top:110px;transform:scale(.8);transform-origin:top left">{poster(BONE, BLACK, "Forged<br>together.")}</div>
   <div style="position:absolute;right:46px;top:110px;transform:scale(.8);transform-origin:top right">{poster(OX, BONE, "Drop 01")}</div>
   <div style="position:absolute;left:0;right:0;bottom:0;height:120px;background:linear-gradient(#1c1b1a,#0e0e0d)"></div>
  </div>
  <div class="cap" style="margin-top:16px">Set concept · raw granite walls, single warm top light, deep shadow</div>
  <div style="display:flex;gap:30px;margin-top:30px;align-items:flex-end">
   <div>{flag}<div class="cap" style="margin-top:10px">Wall flag · 1 x 1.5 m</div></div>
   <div style="display:flex;gap:14px">{poster(BONE, BLACK, "Forged<br>together.")}{poster(OX, BONE, "Drop 01")}{poster(BLACK, BONE, "Built in<br>the dark.")}</div>
  </div>
 </div>
 <div style="padding-top:6px">
  <div class="h1" style="font-size:58px">The forge.</div>
  <p style="font-size:19px;line-height:1.55;color:#cfc8bd;margin:16px 0 26px">A cave-like studio with rough granite and grey stone walls, lit from above like a bunker. The IRONKIN flag hangs in the centre, posters either side. Models wear the full collection: black hoodie or sweatshirt with black or grey pants.</p>
  <div class="lab" style="margin-bottom:8px">Shot list</div>
  <table>{shot_rows}</table>
  <div style="margin-top:22px;font-size:16px;line-height:1.5;color:#a7a198">Lighting: hard warm key from above, cool grey fill, no colour gels. Grade: crushed blacks, bone highlights, one oxblood accent per frame.</div>
 </div>
</div>'''
pages.append(page("06-studio-set", "06", "COLLECTION 01 · STUDIO SET", set_body, h=1340))

for path, w, h in pages:
    out = path.replace(".html", ".png")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={w},{h}",
                    "--virtual-time-budget=6000", f"--screenshot={out}", "file:///" + path.replace("\\", "/")],
                   check=True, capture_output=True)
    print(os.path.basename(out))
