#!/usr/bin/env python3
"""Helpers for the English version of a Muslim Leveling video (skill `muslim-leveling-en`). Run from the repo root:

  /usr/bin/python3 -I tools/en_project.py status                     # series order + English state per episode
  /usr/bin/python3 -I tools/en_project.py init     projects/<topik>  # build projects/<topik>/en/ from the Indonesian project
  /usr/bin/python3 -I tools/en_project.py words    projects/<topik>  # en/voice/narasi.json as  index:word@start  (for OPENERS/FIX/K)
  /usr/bin/python3 -I tools/en_project.py remap    projects/<topik>  # en/film/timeline.json: Indonesian SFX moved to English timing
  /usr/bin/python3 -I tools/en_project.py loudnorm projects/<topik>  # two-pass -14 LUFS -> en/film-remotion/public/narasi.wav

The Indonesian project is never written to. `remap` needs the English Video.tsx to keep the same K key names as the
Indonesian one (only the values change) and en/film-remotion/public/cues.json to exist.
"""
import glob, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Bed for English versions: about 5 dB under the Indonesian default, ducked deeper, different tune (user, 2026-11-15).
EN_BED = {"bpm": 84, "pad": 0.19, "groove": 0.14, "arp": 0.1, "bright": 0.22, "duck": 0.6,
          "chords": [[110.0, 146.83, 174.61, 220.0], [116.54, 146.83, 174.61, 233.08], [110.0, 130.81, 174.61, 220.0], [98.0, 130.81, 164.81, 196.0]]}


def sh(*cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def series_no(proj):
    p = os.path.join(proj, "naskah.md")
    if not os.path.exists(p):
        return None
    m = re.search(r'Bukan Karangan Manusia"?\*?\*?\s*·?\s*(\d+)|BUKAN KARANGAN MANUSIA · (\d+)|Bukan Karangan Manusia" (\d+)/', open(p, encoding="utf-8").read())
    return int(next(g for g in m.groups() if g)) if m else None


def status():
    rows = []
    for d in sorted(glob.glob(os.path.join(ROOT, "projects", "*", ""))):
        d = d.rstrip("/")
        n = series_no(d)
        src = "remotion" if os.path.isdir(os.path.join(d, "film-remotion", "src")) else ("mp4 saja" if glob.glob(os.path.join(d, "*.mp4")) else "kosong")
        en = os.path.join(d, "en")
        st = "-"
        if os.path.isdir(en):
            st = "draf"
            if os.path.exists(os.path.join(en, "voice", "narasi.wav")):
                st = "narasi"
            if glob.glob(os.path.join(en, "*_9x16_v*-hp.mp4")):
                st = "video"
            nk = os.path.join(en, "naskah-en.md")
            if os.path.exists(nk) and "## Jadwal Repliz" in open(nk, encoding="utf-8").read():
                st = "terjadwal"
        rows.append((n if n is not None else 999, os.path.basename(d), src, st))
    for n, name, src, st in sorted(rows):
        print(f"{'' if n == 999 else n:>3}  {name:<22} sumber: {src:<9} EN: {st}")


def init(proj):
    proj = os.path.abspath(proj)
    src = os.path.join(proj, "film-remotion")
    en = os.path.join(proj, "en")
    if not os.path.isdir(os.path.join(src, "src")):
        sys.exit(f"{proj}: tidak ada film-remotion/src. Proyek lama (mis. hanya preview.html + mp4) harus dibangun ulang dari templates/remotion dulu.")
    if os.path.exists(os.path.join(en, "film-remotion")):
        sys.exit(f"{en}/film-remotion sudah ada; tidak ditimpa.")
    nm = os.path.realpath(os.path.join(src, "node_modules"))
    if not os.path.isdir(nm):
        sys.exit(f"node_modules tidak ditemukan ({nm}); jalankan npm i di {src} dulu.")
    for sub in ("voice", "film", "shots"):
        os.makedirs(os.path.join(en, sub), exist_ok=True)
    r = sh("rsync", "-a", "--exclude", "/build", "--exclude", "node_modules", "--exclude", "public/narasi.wav", src + "/", os.path.join(en, "film-remotion") + "/")
    if r.returncode:
        sys.exit(r.stderr)
    os.symlink(nm, os.path.join(en, "film-remotion", "node_modules"))
    shutil.copy(os.path.join(ROOT, "templates", "gen-en.py"), os.path.join(en, "voice", "gen.py"))
    shutil.copy(os.path.join(ROOT, "templates", "tighten.py"), os.path.join(en, "voice", "tighten.py"))
    cues = os.path.join(proj, "voice", "cues.py")
    shutil.copy(cues if os.path.exists(cues) else os.path.join(ROOT, "templates", "cues.py"), os.path.join(en, "voice", "cues.py"))
    tl = os.path.join(proj, "film", "timeline.json")
    if os.path.exists(tl):
        shutil.copy(tl, os.path.join(en, "film", "timeline.id.json"))
    print(f"OK {en}\n  film-remotion/ (node_modules -> {nm})\n  voice/gen.py (en-US), voice/tighten.py, voice/cues.py (isi ulang OPENERS/FIX/EXTRA)\n"
          f"  film/timeline.id.json\nBerikutnya: tulis en/naskah-en.md + en/voice/script.txt, tunggu persetujuan user, baru TTS.")


def words(proj):
    w = json.load(open(os.path.join(proj, "en", "voice", "narasi.json"), encoding="utf-8"))["words"]
    print(" ".join(f"{i}:{x['word']}@{x['start']:.2f}" for i, x in enumerate(w)))


def kmap(path):
    src = open(path, encoding="utf-8").read()
    body = src[src.index("const K = {"):]
    body = body[:body.index("};")]
    return {k: float(v) for k, v in re.findall(r"(\w+): ([\d.]+)", body)}


def remap(proj):
    en = os.path.join(proj, "en")
    ko, kn = kmap(os.path.join(proj, "film-remotion", "src", "Video.tsx")), kmap(os.path.join(en, "film-remotion", "src", "Video.tsx"))
    oc = json.load(open(os.path.join(proj, "film-remotion", "public", "cues.json"), encoding="utf-8"))
    nc = json.load(open(os.path.join(en, "film-remotion", "public", "cues.json"), encoding="utf-8"))
    pairs = [(ko[k], kn[k]) for k in ko if k in kn] + [(a["start"], b["start"]) for a, b in zip(oc["scenes"], nc["scenes"])] + [(oc["duration"], nc["duration"])]
    mono = []
    for a, b in sorted(set(pairs)):  # keep a strictly increasing old->new map (drop keys whose order changed)
        if not mono or (a > mono[-1][0] and b > mono[-1][1]):
            mono.append((a, b))

    def m(t):
        if t <= mono[0][0]:
            return round(t * mono[0][1] / mono[0][0], 3) if mono[0][0] else t
        for (a0, b0), (a1, b1) in zip(mono, mono[1:]):
            if t <= a1:
                return round(b0 + (t - a0) * (b1 - b0) / (a1 - a0), 3)
        return round(t - mono[-1][0] + mono[-1][1], 3)

    T = json.load(open(os.path.join(en, "film", "timeline.id.json")))
    for x in T["sfx"]:
        x["t"] = m(x["t"])
        if "until" in x:
            x["until"] = m(x["until"])
    T["duration"] = nc["duration"]
    T["narration"] = {"file": "voice/narasi.wav", "at": 0}
    T["bed"] = dict(EN_BED, drops=[[round(a["s"] - 0.1, 2), round(a["e"] + 0.2, 2)] for a in nc.get("ayat", [])])
    json.dump(T, open(os.path.join(en, "film", "timeline.json"), "w"), indent=1)
    print(f"{len(mono)} titik jangkar, {len(T['sfx'])} SFX, durasi {T['duration']}, drop musik {T['bed']['drops']}\n"
          f"Berikutnya: tambah SFX penegas (lihat skill), lalu: /usr/bin/python3 -I tools/mix.py --project {en}")


def lufs(path):
    out = sh("ffmpeg", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-").stderr
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", out)
    p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", out)
    return (float(i[-1]) if i else None), (float(p[-1]) if p else None)


def loudnorm(proj):
    en = os.path.join(proj, "en")
    src, dst = os.path.join(en, "film", "audio.wav"), os.path.join(en, "film-remotion", "public", "narasi.wav")
    out = sh("ffmpeg", "-i", src, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json", "-f", "null", "-").stderr
    j = json.loads(out[out.rindex("{"):out.rindex("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    r = sh("ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ar", "48000", dst)
    if r.returncode:
        sys.exit(r.stderr)
    i, p = lufs(dst)
    music = os.path.join(en, "film", "music-only.wav")
    sh("ffmpeg", "-y", "-loglevel", "error", "-i", src, "-i", os.path.join(en, "film", "audio-nomusic.wav"),
       "-filter_complex", "[1]volume=-1[n];[0][n]amix=inputs=2:normalize=0", music)
    mi, _ = lufs(music)
    os.remove(music)
    print(f"{dst}: {i} LUFS, peak {p} dBFS · musik saja {mi} LUFS (target sekitar -24, yaitu ±10 dB di bawah total)")


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == "status":
        status()
    elif a[0] in ("init", "words", "remap", "loudnorm") and len(a) == 2:
        {"init": init, "words": words, "remap": remap, "loudnorm": loudnorm}[a[0]](a[1].rstrip("/"))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
