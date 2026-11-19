# IRONKIN founders teaser: join the three clips, burn Arabic + English subtitles, add the end card.
# usage: python edit.py <workdir> <outdir> <cues.json>
import json, subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display
import imageio_ffmpeg

W, H, FPS = 1280, 720, 24
work, out, cues_path = sys.argv[1], sys.argv[2], sys.argv[3]
cues = json.load(open(cues_path, encoding="utf-8"))
FF = imageio_ffmpeg.get_ffmpeg_exe()
AR = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 40)
EN = ImageFont.truetype("C:/Windows/Fonts/ariali.ttf", 24)
NAME = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)

def ar(t):
    return get_display(arabic_reshaper.reshape(t))

def sub_png(path, arabic, english, w, h, scale=1.0):
    """Subtitle overlay like the HBO reference: white Arabic line, smaller English line under it, soft shadow."""
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    fa = AR.font_variant(size=int(40 * scale)); fe = EN.font_variant(size=int(24 * scale))
    ta = ar(arabic)
    aw = d.textlength(ta, font=fa); ew = d.textlength(english, font=fe)
    ya = h - int(118 * scale); ye = ya + int(54 * scale)
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    sd.text(((w - aw) / 2, ya + 2), ta, font=fa, fill=(0, 0, 0, 230)); sd.text(((w - ew) / 2, ye + 2), english, font=fe, fill=(0, 0, 0, 230))
    shadow = shadow.filter(ImageFilter.GaussianBlur(3))
    im = Image.alpha_composite(shadow, im); d = ImageDraw.Draw(im)
    d.text(((w - aw) / 2, ya), ta, font=fa, fill=(255, 255, 255, 255))
    d.text(((w - ew) / 2, ye), english, font=fe, fill=(232, 224, 210, 255))
    im.save(path)

def name_png(path, name, w, h, scale=1.0):
    """Lower-third name tag, top left, small caps."""
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = NAME.font_variant(size=int(18 * scale)); x, y = int(48 * scale), int(44 * scale)
    d.rectangle([x, y, x + int(3 * scale), y + int(40 * scale)], fill=(201, 163, 90, 255))
    d.text((x + int(14 * scale), y), name.upper(), font=f, fill=(255, 255, 255, 240))
    d.text((x + int(14 * scale), y + int(22 * scale)), "CO-FOUNDER", font=f.font_variant(size=int(13 * scale)), fill=(200, 190, 175, 220))
    im.save(path)

def end_card(path, w, h):
    logo = Image.open(cues["logo"]).convert("RGBA")
    im = Image.new("RGB", (w, h), logo.getpixel((4, 4))[:3]); d = ImageDraw.Draw(im)
    logo = logo.crop(logo.getbbox() if False else (180, 300, 900, 780))
    lw = int(w * (0.36 if w > h else 0.62)); logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    lx, ly = (w - lw) // 2, int(h * 0.40) - logo.height // 2
    im.paste(logo, (lx, ly), logo)
    fa = AR.font_variant(size=int(h * (0.05 if w > h else 0.03))); fe = NAME.font_variant(size=int(h * (0.028 if w > h else 0.016)))
    t1 = ar("قريباً"); t2 = "C O M I N G   S O O N"
    y = ly + logo.height + int(h * 0.07)
    d.text(((w - d.textlength(t1, font=fa)) / 2, y), t1, font=fa, fill=(226, 192, 126))
    d.text(((w - d.textlength(t2, font=fe)) / 2, y + int(fa.size * 1.5)), t2, font=fe, fill=(200, 190, 175))
    im.save(path)

def build(fmt):
    vertical = fmt == "vertical"
    w, h = (720, 1280) if vertical else (W, H)
    s = 1.35 if vertical else 1.0
    # crop for vertical: keep the chair and the founder (left third of the frame)
    crop = f"crop=ih*9/16:ih:{cues['vcrop_x']}*iw-ih*9/32:0,scale={w}:{h}" if vertical else f"scale={w}:{h}"
    inputs, filt, n = [], [], 0
    segs = []
    for i, c in enumerate(cues["clips"]):
        inputs += ["-i", os.path.join(work, c["file"])]
        ss = c.get("ss", 0)
        filt.append(f"[{n}:v]trim={ss}:{ss + c['dur']},setpts=PTS-STARTPTS,{crop},fps={FPS},format=rgba[c{i}]"); base = f"c{i}"; n += 1
        overlays = [(name_png, (c["name"],), c["name_in"], c["name_out"])] + [(sub_png, (q["ar"], q["en"]), q["t0"], q["t1"]) for q in c["subs"]]
        for j, (fn, args, t0, t1) in enumerate(overlays):
            p = os.path.join(work, f"ov-{fmt}-{i}-{j}.png"); fn(p, *args, w, h, s)
            inputs += ["-loop", "1", "-t", str(c["dur"]), "-i", p]
            filt.append(f"[{n}:v]format=rgba,fade=in:st={t0}:d=0.15:alpha=1,fade=out:st={t1}:d=0.2:alpha=1[o{i}{j}]")
            filt.append(f"[{base}][o{i}{j}]overlay=0:0:shortest=1[c{i}_{j}]"); base = f"c{i}_{j}"; n += 1
        # fade from/to black between founders
        filt.append(f"[{base}]fade=in:st=0:d=0.35,fade=out:st={c['dur'] - 0.35}:d=0.35,format=yuv420p[s{i}]"); segs.append(f"[s{i}]")
    card = os.path.join(work, f"endcard-{fmt}.png"); end_card(card, w, h)
    inputs += ["-loop", "1", "-t", "3.2", "-i", card]
    filt.append(f"[{n}:v]fps={FPS},fade=in:st=0.2:d=0.8,fade=out:st=2.7:d=0.5,format=yuv420p[s9]"); segs.append("[s9]")
    filt.append("".join(segs) + f"concat=n={len(segs)}:v=1:a=0[v]")
    dst = os.path.join(out, f"ironkin-founders-teaser-{fmt}.mp4")
    subprocess.run([FF, "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", dst], check=True)
    print("wrote", dst)

for fmt in ("wide", "vertical"):
    build(fmt)
