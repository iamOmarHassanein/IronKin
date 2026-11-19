# Mix voice lines + room tone + drone + logo hit, and mux onto both teaser cuts.
# usage: python mix.py <vo_dir> <teaser_dir>
import subprocess, sys, os
import imageio_ffmpeg

vo, td = sys.argv[1], sys.argv[2]
FF = imageio_ffmpeg.get_ffmpeg_exe()
DUR = 22.33
CUES = [("omar-hi", 4.30), ("omar-line", 5.70), ("nour-hi", 10.10), ("nour-line", 11.30), ("ahmed-hi", 16.20), ("ahmed-line", 17.30)]
HIT = 19.20

inputs, f, labels = [], [], []
for i, (name, t) in enumerate(CUES):
    inputs += ["-i", os.path.join(vo, name + ".wav")]
    ms = int(t * 1000)
    # a touch of room: short early reflections, a little warmth
    f.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=mono,highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,aecho=0.8:0.35:38|71:0.22|0.12,volume=1.6,adelay={ms}|{ms},apad=whole_dur={DUR}[v{i}]")
    labels.append(f"[v{i}]")
n = len(CUES)
# room tone: quiet brown noise, low-passed
f.append(f"anoisesrc=d={DUR}:c=brown:a=0.5:r=48000,lowpass=f=320,volume=0.03,afade=t=in:d=1.5,afade=t=out:st={DUR - 1.2}:d=1.2[room]")
# drone: two low sines with a slow swell
f.append(f"sine=f=55:d={DUR}:r=48000,volume=0.04[s1];sine=f=82.4:d={DUR}:r=48000,volume=0.02[s2];[s1][s2]amix=inputs=2:normalize=0,tremolo=f=0.25:d=0.35,afade=t=in:d=3,afade=t=out:st={HIT - 0.2}:d=0.6[drone]")
# logo hit: a low thump plus a filtered noise burst, decaying
hm = int(HIT * 1000)
f.append(f"sine=f=46:d=2.6:r=48000,volume=0.9,afade=t=out:st=0.05:d=2.5:curve=exp[t1];anoisesrc=d=1.2:c=pink:a=0.6:r=48000,lowpass=f=900,afade=t=out:st=0:d=1.1:curve=exp,volume=0.35[t2];[t1][t2]amix=inputs=2:normalize=0,adelay={hm}|{hm},apad=whole_dur={DUR}[hit]")
f.append("".join(labels) + f"[room][drone][hit]amix=inputs={n + 3}:normalize=0,aformat=channel_layouts=stereo,volume=16dB,alimiter=limit=0.84:attack=3:release=60,atrim=0:{DUR}[mix]")
wav = os.path.join(td, "teaser-mix.wav")
subprocess.run([FF, "-v", "error", "-y", *inputs, "-filter_complex", ";".join(f), "-map", "[mix]", "-ar", "48000", wav], check=True)
for fmt in ("wide", "vertical"):
    src = os.path.join(td, f"ironkin-founders-teaser-{fmt}.mp4")
    dst = os.path.join(td, f"ironkin-founders-teaser-{fmt}-voice.mp4")
    subprocess.run([FF, "-v", "error", "-y", "-i", src, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", dst], check=True)
    print("wrote", dst)
