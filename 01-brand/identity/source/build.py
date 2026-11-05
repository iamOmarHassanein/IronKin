import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "html")
PNG = os.path.join(HERE, "png")
os.makedirs(OUT, exist_ok=True)
os.makedirs(PNG, exist_ok=True)
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

BLACK, BONE, OX, ASH, STEEL = "#0B0B0A", "#EEE7DC", "#8A1019", "#2A2A28", "#6E6A63"


def load(name):
    svg = open(os.path.join(HERE, f"{name}.svg")).read()
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
    d = open(os.path.join(HERE, f"{name}.path")).read()
    w, h = map(float, vb.split()[2:])
    return vb, d, w, h


LOGO = {n: load(n) for n in ("symbol", "wordmark", "arched")}


def logo(name, width, color=BONE, extra=""):
    vb, d, w, h = LOGO[name]
    height = width * h / w
    return (f'<svg viewBox="{vb}" width="{width:.0f}" height="{height:.0f}" {extra}>'
            f'<path fill="{color}" fill-rule="evenodd" d="{d}"/></svg>')


def lockup(width, color=BONE, tag=True, tagcolor=None):
    sym = logo("symbol", width * 0.78, color)
    word = logo("wordmark", width, color)
    t = (f'<div class="track" style="color:{tagcolor or color};font-size:{width*0.052:.0f}px;margin-top:{width*0.06:.0f}px">'
         f'FORGED TOGETHER.</div>') if tag else ""
    return (f'<div style="display:flex;flex-direction:column;align-items:center;gap:{width*0.07:.0f}px">'
            f'{sym}{word}</div>{t}')


DISTRESS = """<svg width="0" height="0" style="position:absolute"><defs>
<filter id="distress" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="4" seed="11" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -9 0 0 0 5.4" result="m"/>
<feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
<feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.10"/></feComponentTransfer></filter>
</defs></svg>"""

CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500;600&display=swap');
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:{BLACK};color:{BONE};font-family:'Barlow',Arial,sans-serif;overflow:hidden}}
.board{{position:relative;width:var(--w);height:var(--h);padding:64px 72px;background:{BLACK}}}
.grain{{position:absolute;inset:0;pointer-events:none}}
.track{{font-family:'Barlow Condensed',sans-serif;letter-spacing:.42em;font-weight:500;text-transform:uppercase}}
.head{{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #3a3835;padding-bottom:22px}}
.num{{font-family:'Barlow Condensed';font-weight:800;color:{OX};font-size:30px;letter-spacing:.06em;margin-right:22px}}
.title{{font-family:'Barlow Condensed';font-weight:600;font-size:22px;letter-spacing:.42em}}
.small{{font-family:'Barlow Condensed';font-size:15px;letter-spacing:.32em;color:{STEEL};text-transform:uppercase}}
.bar{{width:64px;height:4px;background:{OX}}}
.cap{{font-family:'Barlow Condensed';font-size:15px;letter-spacing:.3em;color:#a7a198;text-transform:uppercase;margin-top:16px}}
.stage{{height:810px;display:flex;align-items:center;justify-content:space-around}}
.h1{{font-family:'Barlow Condensed';font-weight:800;text-transform:uppercase;line-height:.9}}
"""


def head(num, title):
    return (f'<div class="head"><div style="display:flex;align-items:baseline"><span class="num">{num:02d}</span>'
            f'<span class="title">{title}</span></div>{logo("wordmark", 150, STEEL)}</div>')


def page(num, slug, title, body, w=1600, h=1000, header=True):
    html = (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head>'
            f'<body style="--w:{w}px;--h:{h}px">{DISTRESS}<div class="board">'
            f'{head(num, title) if header else ""}{body}'
            f'<svg class="grain" width="{w}" height="{h}"><rect width="100%" height="100%" filter="url(#grain)"/></svg>'
            f'</div></body></html>')
    path = os.path.join(OUT, f"{num:02d}-{slug}.html")
    open(path, "w", encoding="utf-8").write(html)
    return path, w, h


# Garment silhouettes, drawn on a 600 x 660 box.
TEE = ("M205 30 C240 62 360 62 395 30 L470 52 L590 140 L548 262 L478 236 L482 640 "
       "C400 652 200 652 118 640 L122 236 L52 262 L10 140 L130 52 Z")
TEE_BACK_NECK = "M205 30 C250 44 350 44 395 30"
TEE_FRONT_NECK = "M205 30 C240 92 360 92 395 30"
HOODIE = ("M175 92 C170 -6 430 -6 425 92 L482 92 L585 190 L590 560 L530 572 L516 300 L486 300 "
          "L488 640 C400 654 200 654 112 640 L114 300 L84 300 L70 572 L10 560 L15 190 L118 92 Z")
TANK = ("M200 20 L240 20 C250 120 350 120 360 20 L400 20 C405 120 430 170 470 200 L476 640 "
        "C400 652 200 652 124 640 L130 200 C170 170 195 120 200 20 Z")


def garment(path, fill, w, stroke="#00000033", inner=""):
    return (f'<svg viewBox="0 0 600 660" width="{w}" height="{w*660/600:.0f}">'
            f'<path d="{path}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>{inner}</svg>')


def place(name, x, y, width, color, filt=""):
    vb, d, w, h = LOGO[name]
    s = width / w
    f = f' filter="url(#{filt})"' if filt else ""
    return f'<g transform="translate({x - width/2:.1f} {y:.1f}) scale({s:.4f})"{f}><path fill="{color}" fill-rule="evenodd" d="{d}"/></g>'


pages = []

# 01 Logo suite
cells = [
    ("Primary lockup", BLACK, lockup(300, BONE, tagcolor=BONE)),
    ("Symbol", BLACK, logo("symbol", 300, BONE)),
    ("Wordmark", BLACK, logo("wordmark", 330, BONE)),
    ("Garment back", BLACK, logo("arched", 330, BONE)),
    ("On bone", BONE, lockup(250, BLACK, tagcolor=BLACK)),
    ("On oxblood", OX, lockup(250, BONE, tagcolor=BONE)),
    ("Oxblood mark", BLACK, logo("symbol", 230, OX)),
    ("Mono black", BONE, logo("symbol", 230, BLACK)),
]
grid = "".join(
    f'<div style="background:{bg};border:1px solid #2c2a27;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative">'
    f'{art}<div class="small" style="position:absolute;bottom:16px;left:20px;color:{"#7d776e" if bg==BLACK else ("#5a554e" if bg==BONE else "#e9c9c9")}">{label}</div></div>'
    for label, bg, art in cells)
pages.append(page(1, "logo-suite", "LOGO SUITE",
    f'<div style="display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:1fr 1fr;gap:18px;height:820px;margin-top:30px">{grid}</div>'))

# 02 Colour palette
sw = [("FORGE BLACK", BLACK, "#0B0B0A", "11 11 10", "0 0 9 96", "Base. Most of every layout.", "60%", BONE),
      ("BONE", BONE, "#EEE7DC", "238 231 220", "0 3 8 7", "Logo, type and garment colourways.", "25%", BLACK),
      ("OXBLOOD", OX, "#8A1019", "138 16 25", "0 88 82 46", "Accent only. Rules, numbers, one hit.", "10%", BONE),
      ("ASH", ASH, "#2A2A28", "42 42 40", "0 0 5 84", "Panels and secondary surfaces.", "5%", BONE)]
cols = "".join(
    f'<div style="display:flex;flex-direction:column"><div style="flex:1;background:{c};border:1px solid #33312e;padding:30px;display:flex;flex-direction:column;justify-content:space-between">'
    f'<div class="h1" style="font-size:44px;color:{tc}">{n}</div><div class="h1" style="font-size:88px;color:{tc};opacity:.9">{pct}</div></div>'
    f'<div style="padding:22px 4px 0;font-family:Barlow Condensed;letter-spacing:.18em;font-size:18px;line-height:1.75;color:#cfc8bd">'
    f'HEX {hx}<br>RGB {rgb}<br>CMYK {cmyk}</div><div style="color:#8f897f;font-size:16px;margin-top:10px">{use}</div></div>'
    for n, c, hx, rgb, cmyk, use, pct, tc in sw)
pages.append(page(2, "colour-palette", "COLOUR PALETTE",
    f'<div style="display:grid;grid-template-columns:1.6fr 1.3fr .9fr .7fr;gap:22px;height:820px;margin-top:30px">{cols}</div>'))

# 03 Typography
pages.append(page(3, "typography", "TYPOGRAPHY", f'''
<div style="display:grid;grid-template-columns:1fr 1fr;gap:70px;margin-top:46px">
 <div>
  <div class="small">Headlines · Barlow Condensed ExtraBold</div>
  <div class="h1" style="font-size:150px;margin-top:20px">Built<br>in the<br><span style="color:{OX}">dark.</span></div>
 </div>
 <div style="display:flex;flex-direction:column;gap:44px;padding-top:6px">
  <div><div class="small">Labels · Barlow Condensed Medium, tracked 400</div>
   <div class="track" style="font-size:30px;margin-top:16px">Forged together.</div><div class="bar" style="margin-top:18px"></div></div>
  <div><div class="small">Body · Barlow Regular</div>
   <p style="font-size:24px;line-height:1.5;color:#d7d0c5;margin-top:16px;max-width:620px">Heavyweight cotton, cut boxy and built to take a beating. Made for the ones who show up at 5am and bring their people with them.</p></div>
  <div><div class="small">Logo type</div>
   <div style="margin-top:20px">{logo("wordmark", 420, BONE)}</div>
   <div style="color:#8f897f;font-size:17px;margin-top:14px">The wordmark is drawn artwork. Never retype it in a font.</div></div>
  <div class="h1" style="font-size:40px;letter-spacing:.02em;color:#bdb6aa">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</div>
 </div>
</div>'''))

# 04 Logo rules
def rule_box(content, label, bad=False, bg=BLACK):
    mark = f'<div style="position:absolute;top:14px;right:16px;color:{OX if bad else "#7d776e"};font-family:Barlow Condensed;font-weight:800;font-size:22px">{"✕" if bad else "✓"}</div>'
    return (f'<div style="position:relative;background:{bg};border:1px solid #2c2a27;height:330px;display:flex;align-items:center;justify-content:center;overflow:hidden">'
            f'{mark}{content}<div class="small" style="position:absolute;bottom:12px;left:16px">{label}</div></div>')
clear = (f'<div style="position:relative;padding:46px;border:1px dashed {OX}">{logo("symbol", 260, BONE)}'
         f'<div style="position:absolute;inset:0;border:46px solid rgba(138,16,25,.13)"></div></div>')
dont = "".join([
    rule_box(logo("symbol", 150, BONE, 'style="transform:scaleX(1.45)"'), "Don't stretch", True),
    rule_box(logo("symbol", 190, "#3D8BFF"), "Don't recolour", True),
    rule_box(f'<svg viewBox="{LOGO["symbol"][0]}" width="200"><path fill="none" stroke="{BONE}" stroke-width="3" d="{LOGO["symbol"][1]}"/></svg>', "Don't outline", True),
    rule_box(logo("symbol", 190, BONE, 'style="transform:rotate(-14deg)"'), "Don't rotate", True),
    rule_box(logo("wordmark", 230, OX), "Oxblood on black: accents only", True),
    rule_box(logo("symbol", 160, BLACK), "Black on bone", False, BONE),
])
pages.append(page(4, "logo-rules", "LOGO RULES", f'''
<div style="display:grid;grid-template-columns:.9fr 1.5fr;gap:40px;margin-top:40px;align-items:center;height:790px">
 <div>
  <div style="display:flex;justify-content:center;padding:30px 0">{clear}</div>
  <div class="small" style="color:#bdb6aa;margin-top:10px">Clear space = height of the anvil foot</div>
  <div style="display:flex;gap:40px;align-items:flex-end;margin-top:44px">
   <div>{logo("symbol", 60, BONE)}<div class="cap">Min 12 mm</div></div>
   <div>{logo("wordmark", 120, BONE)}<div class="cap">Min 25 mm</div></div>
   <div>{logo("symbol", 26, BONE)}<div class="cap">Woven 8 mm</div></div>
  </div>
 </div>
 <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">{dont}</div>
</div>'''))

# 05 Tee
tee_front = garment(TEE, "#151514", 540, "#4a4743",
    f'<path d="{TEE_FRONT_NECK}" fill="none" stroke="#3a3835" stroke-width="3"/>' + place("symbol", 385, 150, 92, BONE))
tee_back = garment(TEE, "#151514", 540, "#4a4743",
    f'<path d="{TEE_BACK_NECK}" fill="none" stroke="#3a3835" stroke-width="3"/>' + place("arched", 300, 120, 330, BONE)
    + place("symbol", 300, 245, 190, BONE)
    + f'<text x="300" y="380" fill="{BONE}" font-family="Barlow Condensed" font-weight="500" font-size="19" letter-spacing="7" text-anchor="middle">FORGED TOGETHER.</text>')
tee_bone = garment(TEE, BONE, 300, "#bdb4a6",
    f'<path d="{TEE_FRONT_NECK}" fill="none" stroke="#bdb4a6" stroke-width="3"/>' + place("wordmark", 300, 160, 250, BLACK))
pages.append(page(5, "tee", "OVERSIZED TEE · 280 GSM", f'''
<div class="stage" style="align-items:flex-end;padding-bottom:40px">
 <div style="text-align:center">{tee_front}<div class="cap">Front · left chest symbol 90 mm</div></div>
 <div style="text-align:center">{tee_back}<div class="cap">Back · arched wordmark 300 mm</div></div>
 <div style="text-align:center;padding-bottom:6px">{tee_bone}<div class="cap">Bone colourway</div></div>
</div>'''))

# 06 Hoodie and stringer
hood_back = garment(HOODIE, ASH, 560, "#141413",
    f'<path d="M175 92 C220 170 380 170 425 92" fill="none" stroke="#141413" stroke-width="4"/>'
    + place("arched", 300, 210, 330, BONE, "distress") + place("symbol", 300, 340, 150, OX))
tank = garment(TANK, "#151514", 500, "#4a4743", place("symbol", 300, 250, 170, BONE, "distress")
    + place("wordmark", 300, 380, 200, BONE))
pages.append(page(6, "hoodie-stringer", "HOODIE & STRINGER", f'''
<div class="stage" style="align-items:flex-end;padding-bottom:30px">
 <div style="text-align:center">{hood_back}<div class="cap">Hoodie back · ash, distressed print, oxblood mark</div></div>
 <div style="text-align:center">{tank}<div class="cap">Stringer · distressed symbol</div></div>
</div>'''))

# 07 Trims
def card(inner, w, h, bg, extra=""):
    return f'<div style="width:{w}px;height:{h}px;background:{bg};display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;{extra}">{inner}</div>'
neck = card(f'{logo("symbol", 80, BONE)}<div style="margin-top:14px">{logo("wordmark", 130, BONE)}</div>', 260, 170, BLACK,
            "border:2px solid #2c2a27;background-image:repeating-linear-gradient(90deg,#0f0f0e 0 2px,#0b0b0a 2px 4px)")
tag_front = card(f'<div style="position:absolute;top:24px;width:18px;height:18px;border-radius:50%;background:{BLACK};box-shadow:inset 0 0 0 4px #c9c0b2"></div>'
                 f'{logo("symbol", 150, BLACK)}<div style="margin-top:22px">{logo("wordmark", 170, BLACK)}</div><div class="bar" style="margin-top:24px"></div>', 250, 420, BONE)
tag_back = card(f'<div class="track" style="font-size:15px;color:{BONE};text-align:center;line-height:2">FORGED<br>TOGETHER.</div>'
                f'<div class="bar" style="margin:22px 0"></div><div style="font-family:Barlow Condensed;letter-spacing:.2em;color:#bdb6aa;font-size:14px;text-align:center;line-height:1.9">OVERSIZED TEE<br>280 GSM COTTON<br>SIZE · L</div>', 250, 420, BLACK, "border:1px solid #33312e")
care = card(f'{logo("wordmark", 90, BLACK)}<div style="font-family:Barlow Condensed;color:#3c3832;font-size:13px;letter-spacing:.14em;text-align:center;margin-top:16px;line-height:1.8">100% COTTON<br>WASH COLD<br>INSIDE OUT<br>DO NOT TUMBLE DRY</div>', 150, 360, "#F6F2EA")
patch = (f'<svg viewBox="0 0 300 300" width="280"><circle cx="150" cy="150" r="146" fill="{OX}"/>'
         f'<circle cx="150" cy="150" r="132" fill="none" stroke="{BONE}" stroke-width="3" stroke-dasharray="6 5"/>'
         f'{place("symbol", 150, 92, 150, BONE)}{place("wordmark", 150, 190, 160, BONE)}</svg>')
pages.append(page(7, "trims", "LABELS & TRIMS", f'''
<div class="stage" style="justify-content:space-between;padding:0 10px">
 <div style="text-align:center">{neck}<div class="cap">Woven neck label</div></div>
 <div style="display:flex;gap:22px;text-align:center"><div>{tag_front}<div class="cap">Hang tag front</div></div><div>{tag_back}<div class="cap">Back</div></div></div>
 <div style="text-align:center">{care}<div class="cap">Care label</div></div>
 <div style="text-align:center">{patch}<div class="cap">Embroidered patch</div></div>
</div>'''))

# 08 Packaging
pattern = "".join(place("symbol", x, y, 46, "#2a2926") for y in range(10, 460, 70) for x in range(30, 760, 90))
mailer = (f'<svg viewBox="0 0 700 520" width="680">'
          f'<rect x="40" y="30" width="620" height="90" rx="6" fill="#1a1a18" stroke="#2c2a27"/>'
          f'<rect x="40" y="110" width="620" height="390" rx="6" fill="#121211" stroke="#2c2a27"/>'
          f'<rect x="40" y="110" width="620" height="10" fill="#0a0a09"/>'
          f'{place("symbol", 350, 190, 250, BONE)}'
          f'<text x="350" y="410" fill="{BONE}" font-family="Barlow Condensed" font-weight="500" font-size="20" letter-spacing="9" text-anchor="middle">FORGED TOGETHER.</text>'
          f'<rect x="318" y="432" width="64" height="4" fill="{OX}"/></svg>')
tissue = f'<svg viewBox="0 0 760 460" width="430" style="background:#0e0e0d">{pattern}</svg>'
sticker = (f'<svg viewBox="0 0 220 220" width="200"><circle cx="110" cy="110" r="104" fill="{BONE}"/>'
           f'{place("symbol", 110, 60, 120, BLACK)}<rect x="85" y="140" width="50" height="4" fill="{OX}"/></svg>')
thanks = card(f'{logo("symbol", 90, OX)}<div class="h1" style="font-size:44px;color:{BLACK};margin-top:20px;text-align:center">You\'re<br>one of us.</div>'
              f'<div class="track" style="font-size:12px;color:#55504a;margin-top:18px">Forged together.</div>', 280, 380, BONE)
pages.append(page(8, "packaging", "PACKAGING", f'''
<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:40px;margin-top:36px;align-items:center">
 <div style="text-align:center">{mailer}<div class="cap">Mailer box lid · black kraft, bone print</div></div>
 <div style="display:flex;flex-direction:column;gap:30px">
  <div>{tissue}<div class="cap">Tissue wrap · tonal symbol repeat</div></div>
  <div style="display:flex;gap:30px;align-items:center"><div>{sticker}<div class="cap">Seal sticker</div></div><div>{thanks}<div class="cap">Insert card</div></div></div>
 </div>
</div>'''))

# 09 Instagram
tiles = [
    (BLACK, logo("symbol", 100, BONE)), (OX, f'<div class="h1" style="font-size:30px;text-align:center">Drop 01<br>is coming.</div>'),
    (BONE, logo("wordmark", 110, BLACK)), (ASH, logo("arched", 110, BONE)),
    (BLACK, f'<div class="track" style="font-size:11px;text-align:center;line-height:2">Forged<br>together.</div><div class="bar" style="margin-top:14px"></div>'),
    (OX, logo("symbol", 96, BLACK)), (BONE, f'<div class="h1" style="font-size:30px;color:{BLACK};text-align:center">5AM<br>club.</div>'),
    (BLACK, f'<svg viewBox="{LOGO["symbol"][0]}" width="104" filter="url(#distress)"><path fill="{BONE}" fill-rule="evenodd" d="{LOGO["symbol"][1]}"/></svg>'),
    (ASH, f'<div class="h1" style="font-size:26px;text-align:center">Built<br>in the<br><span style="color:{OX}">dark.</span></div>')]
gridhtml = "".join(f'<div style="background:{bg};overflow:hidden;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center">{art}</div>' for bg, art in tiles)
highlights = "".join(f'<div style="text-align:center"><div style="width:64px;height:64px;border-radius:50%;border:2px solid #3a3835;display:flex;align-items:center;justify-content:center;background:{BLACK}">{logo("symbol", 34, c)}</div><div style="font-size:12px;margin-top:6px;color:#cfc8bd">{t}</div></div>'
                     for t, c in [("DROP 01", BONE), ("FITS", OX), ("CREW", BONE), ("FAQ", BONE)])
phone = f'''<div style="width:440px;height:880px;border-radius:52px;background:#000;padding:14px;box-shadow:0 0 0 2px #2a2a28">
<div style="width:100%;height:100%;border-radius:40px;background:#0d0d0c;overflow:hidden;font-family:Barlow">
 <div style="padding:22px 22px 0;font-weight:600;font-size:18px">ironkin</div>
 <div style="display:flex;align-items:center;gap:26px;padding:18px 22px">
  <div style="width:90px;height:90px;border-radius:50%;background:{BLACK};border:2px solid {OX};display:flex;align-items:center;justify-content:center">{logo("symbol", 56, BONE)}</div>
  <div style="display:flex;gap:22px;text-align:center;font-size:13px;color:#bdb6aa"><div><b style="font-size:17px;color:{BONE}">9</b><br>posts</div><div><b style="font-size:17px;color:{BONE}">0</b><br>followers</div><div><b style="font-size:17px;color:{BONE}">0</b><br>following</div></div>
 </div>
 <div style="padding:0 22px;font-size:14px;line-height:1.5"><b>IRONKIN</b><br>Gym wear forged for the ones who show up.<br>Forged together.<br><span style="color:#9fb6d6">Drop 01 · soon</span></div>
 <div style="display:flex;gap:16px;padding:16px 22px">{highlights}</div>
 <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:136px;gap:2px;margin-top:6px">{gridhtml}</div>
</div></div>'''
pages.append(page(9, "instagram", "INSTAGRAM", f'''
<div style="display:flex;gap:70px;margin-top:18px;align-items:flex-start">
 <div style="transform:scale(.93);transform-origin:top left;height:820px">{phone}</div>
 <div style="padding-top:60px;max-width:560px">
  <div class="h1" style="font-size:66px">One grid.<br>Three colours.</div><div class="bar" style="margin:26px 0"></div>
  <div style="font-size:21px;line-height:1.6;color:#cfc8bd">Black tiles carry the mark, oxblood tiles carry the news, bone tiles carry the product. Never two oxblood tiles side by side. The symbol is the avatar everywhere.</div>
  <div style="display:flex;gap:18px;margin-top:46px">
   <div style="width:200px;height:250px;background:{BLACK};border:1px solid #2c2a27;display:flex;align-items:center;justify-content:center">{logo("symbol", 140, BONE)}</div>
   <div style="width:200px;height:250px;background:{OX};display:flex;align-items:center;justify-content:center"><div class="h1" style="font-size:40px;text-align:center">Drop 01<br>is coming.</div></div>
   <div style="width:200px;height:250px;background:{BONE};display:flex;align-items:center;justify-content:center"><div class="h1" style="font-size:36px;color:{BLACK};text-align:center">Heavy<br>cotton.<br>Boxy cut.</div></div>
  </div>
  <div style="display:flex;gap:18px"><div class="cap" style="width:200px">Mark</div><div class="cap" style="width:200px">News</div><div class="cap" style="width:200px">Product</div></div>
 </div>
</div>'''))

# 10 Campaign poster, 4:5
poster_body = f'''
<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,#1d1b19 0%,{BLACK} 62%)"></div>
<div style="position:absolute;left:0;right:0;top:150px;display:flex;justify-content:center">{logo("symbol", 760, BONE, 'filter="url(#distress)"')}</div>
<div style="position:absolute;left:0;right:0;top:640px;text-align:center">
 <div class="h1" style="font-size:210px;letter-spacing:.01em">Forged</div>
 <div class="h1" style="font-size:210px;color:{OX};margin-top:-14px">together.</div>
</div>
<div style="position:absolute;left:0;right:0;bottom:90px;display:flex;flex-direction:column;align-items:center;gap:26px">
 {logo("wordmark", 330, BONE)}<div class="track" style="font-size:20px;color:#bdb6aa">Drop 01 · coming soon</div>
</div>'''
pages.append(page(10, "campaign-poster", "", poster_body, 1080, 1350, header=False))

# Render
for path, w, h in pages:
    out = os.path.join(PNG, os.path.basename(path).replace(".html", ".png"))
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={w},{h}",
                    "--virtual-time-budget=6000", f"--screenshot={out}", "file:///" + path.replace("\\", "/")],
                   check=True, capture_output=True)
    print(os.path.basename(out))
