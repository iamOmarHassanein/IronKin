# Stand-in hero reel: slow camera moves over IRONKIN campaign stills, crossfaded.
# usage: python make_reel.py <media_dir> <out_dir>
import subprocess, sys  # needs: pip install pillow imageio-ffmpeg
from PIL import Image, ImageEnhance
import imageio_ffmpeg

src, out = sys.argv[1], sys.argv[2]
FPS, SHOT, FADE = 25, 3.2, 0.7

# (file, start box, end box) as fractions of the image: (cx, cy, zoom) where zoom 1 = largest crop that fits.
SHOTS = [
    ("c-strength", (0.5, 0.20, 1.18), (0.5, 0.42, 1.05)),   # tilt down face -> hoodie
    ("hero-athletes", (0.5, 0.5, 1.0), (0.52, 0.55, 1.14)),  # push in
    ("c-jiujitsu", (0.44, 0.20, 1.12), (0.54, 0.26, 1.04)),  # drift
    ("c-padel", (0.5, 0.30, 1.0), (0.5, 0.20, 1.12)),       # push in
]

def ease(t): return t * t * (3 - 2 * t)

def frame(img, a, b, t, W, H):
    t = ease(t)
    cx, cy, z = [a[i] + (b[i] - a[i]) * t for i in range(3)]
    iw, ih = img.size
    r = W / H
    cw, ch = (iw, iw / r) if iw / ih < r else (ih * r, ih)
    cw, ch = cw / z, ch / z
    x = min(max(cx * iw - cw / 2, 0), iw - cw); y = min(max(cy * ih - ch / 2, 0), ih - ch)
    return img.resize((W, H), Image.LANCZOS, box=(x, y, x + cw, y + ch))

def render(W, H, name):
    imgs = {f: ImageEnhance.Contrast(Image.open(f"{src}/{f}.webp").convert("RGB")).enhance(1.06) for f, *_ in SHOTS}
    n = int(SHOT * FPS); fade = int(FADE * FPS)
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{out}/{name}.mp4"]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    total = len(SHOTS) * (n - fade)
    for i in range(total):
        k, j = divmod(i, n - fade)
        f, a, b = SHOTS[k]
        im = frame(imgs[f], a, b, j / n, W, H)
        if j < fade:  # crossfade in from the previous shot (wraps for a seamless loop)
            pf, pa, pb = SHOTS[k - 1]
            prev = frame(imgs[pf], pa, pb, (n - fade + j) / n, W, H)
            im = Image.blend(prev, im, ease(j / fade))
        p.stdin.write(im.tobytes())
        if i == fade + 6: im.save(f"{out}/{name}-poster.webp", quality=82)
    p.stdin.close(); p.wait()

render(1600, 900, "hero-reel")
render(720, 1280, "hero-reel-m")
print("ok")
