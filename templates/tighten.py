"""Pendekkan jeda take terpilih lalu percepat. Menulis voice/narasi.wav + voice/narasi.json dengan timestamp kata
yang sudah final, jadi di cues.py pakai SPEED = 1.0. Pakai ini (bukan atempo saja) kalau take terlalu panjang:
memangkas jeda > CAP lebih alami daripada atempo tinggi.
Salin ke projects/<topik>/voice/, lalu dari projects/<topik>/:
  /usr/bin/python3 -I voice/tighten.py take1 1.15         # take, atempo
  /usr/bin/python3 -I voice/tighten.py take1 1.10 0.40    # + jeda maksimal (dtk, default 0.32)
Al-Fatihah: take 75,3 dtk -> 59,2 dtk (26 jeda dipangkas, atempo 1.15)."""
import json, os, re, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
take, speed = sys.argv[1], float(sys.argv[2])
CAP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.32  # jeda maksimal (dtk) sebelum atempo
src = os.path.join(HERE, f"{take}.wav")
with wave.open(src) as f:
    sr, ch, sw = f.getframerate(), f.getnchannels(), f.getsampwidth()
    pcm = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16)

log = subprocess.run(["ffmpeg", "-i", src, "-af", "silencedetect=n=-38dB:d=0.4", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
cuts = []  # (a, b) bagian yang dibuang, di tengah jeda
for a, b in zip(starts, ends):
    if b - a > CAP:
        mid, keep = (a + b) / 2, CAP / 2
        cuts.append((mid - (b - a) / 2 + keep, mid + (b - a) / 2 - keep))

def remap(t):
    """waktu take asli -> waktu setelah dipotong & dipercepat"""
    removed = sum(min(b, t) - a for a, b in cuts if t > a)
    return round((t - removed) / speed, 3)

keep, last = [], 0
fade = int(0.01 * sr)
for a, b in cuts:
    seg = pcm[int(last * sr):int(a * sr)].astype(np.float32)
    seg[-fade:] *= np.linspace(1, 0, fade)
    if keep:
        seg[:fade] *= np.linspace(0, 1, fade)
    keep.append(seg)
    last = b
tail = pcm[int(last * sr):].astype(np.float32)
tail[:fade] *= np.linspace(0, 1, fade)
keep.append(tail)
out = np.concatenate(keep).clip(-32768, 32767).astype(np.int16)
tmp = os.path.join(HERE, "tight.wav")
with wave.open(tmp, "wb") as f:
    f.setnchannels(ch); f.setsampwidth(sw); f.setframerate(sr); f.writeframes(out.tobytes())
dst = os.path.join(HERE, "narasi.wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", f"atempo={speed}", "-ar", "48000", dst], check=True)
os.remove(tmp)

data = json.load(open(os.path.join(HERE, f"{take}.json"), encoding="utf-8"))
for w in data["words"]:
    w["start"], w["end"] = remap(w["start"]), remap(w["end"])
data["remap"] = {"take": take, "speed": speed, "cap": CAP, "cuts": [[round(a, 3), round(b, 3)] for a, b in cuts]}
json.dump(data, open(os.path.join(HERE, "narasi.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
saved = sum(b - a for a, b in cuts)
print(f"{len(cuts)} jeda dipendekkan, hemat {saved:.2f}s; durasi akhir {len(out) / sr / speed:.2f}s")
