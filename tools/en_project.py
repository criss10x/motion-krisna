#!/usr/bin/env python3
"""Helpers for the English version of a Muslim Leveling video (skill `muslim-leveling-en`). Run from the repo root:

  /usr/bin/python3 -I tools/en_project.py status                     # series order + English state per episode
  /usr/bin/python3 -I tools/en_project.py init     projects/<topik>  # build projects/<topik>/en/ from the Indonesian project
  /usr/bin/python3 -I tools/en_project.py words    projects/<topik>  # en/voice/narasi.json as  index:word@start  (for OPENERS/FIX/K)
  /usr/bin/python3 -I tools/en_project.py remap    projects/<topik>  # en/film/timeline.json: Indonesian SFX moved to English timing
  /usr/bin/python3 -I tools/en_project.py loudnorm projects/<topik>  # two-pass -14 LUFS -> en/film-remotion/public/narasi.wav
  /usr/bin/python3 -I tools/en_project.py tsx      projects/<topik>  # en Video.tsx/Root.tsx from the Indonesian one + en/edits.py (N, K, NEXT, EDITS)
  /usr/bin/python3 -I tools/en_project.py autosfx  projects/<topik>  # after remap: whoosh per Title, thunk per card/pill, riser+impact per verse

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


ID_WORDS = r"\b(yang|dengan|tidak|tak|kita|kamu|dari|ini|itu|untuk|adalah|tahun|abad|dan|atau|lalu|sudah|belum|bukan|siapa|semua|Nabi|ayat|surat|ulama|keselarasan|raja|nama|penjelasan|dikutip|ibunya|putrinya|ayah|ibu|wahai|jumlah|teks|kali|foto|segar|pahit|sifatnya|terjaga|tetap|kini|dulu|Aristoteles|Empedokles|Yunani|Mesir|Romawi|Persia|bukti|unta|air|berat|tubuh|Ibnu|Katsir|QS|jari|kulit|darah|hewan|manusia|lain|bulat|lonjong|sebelum|menurut|kata|orang|tanah|langit|laut|gunung|bumi|awan|hujan|angin|lalat|semut|lebah|benang|rumah|susu|kotoran|ciptaan|juga|hanya|lebih|dua|tiga|satu|ribu|juta|menit|jam|hari|bulan|matahari|cahaya|perempuan|laki|ibu|anak|kitab|tulis|baca|pelajaran|simpan|berikutnya|ke-\d+)\b"


def tsx(proj):
    """Build en/film-remotion/src/Video.tsx from the Indonesian Video.tsx + en/edits.py (N, K, NEXT, EDITS). Re-runnable."""
    en = os.path.join(proj, "en")
    cfg = {}
    exec(open(os.path.join(en, "edits.py"), encoding="utf-8").read(), cfg)
    N, K, EDITS, NEXT = cfg["N"], cfg["K"], cfg.get("EDITS", []), cfg.get("NEXT", cfg["N"] + 1)
    s = open(os.path.join(proj, "film-remotion", "src", "Video.tsx"), encoding="utf-8").read()
    miss = []

    def R(a, b, cnt=1, need=True):
        nonlocal s
        c = s.count(a)
        if c != cnt and (need or c):
            miss.append(f"{c}x (mau {cnt}): {a[:90]}")
            return
        s = s.replace(a, b)

    def RX(pat, rep, flags=0):
        nonlocal s
        s = re.sub(pat, rep, s, flags=flags)

    s = (f"// VERSI EN (Series: Could a Human Write This? · {N}), dibuat `tools/en_project.py tsx` dari Video.tsx Indonesia + en/edits.py.\n"
         "// Beda: narasi & teks Inggris, latar dibalik (Bg) + zoom 105%, animasi latar 103%, transisi zoom-out, grading soft-light.\n") + s
    RX(r"SERI: BUKAN KARANGAN MANUSIA · \d+(?:/\d+)?", f"SERIES: COULD A HUMAN WRITE THIS? · {N}")
    a = s.index("\nconst K = {")
    b = s.index("};", a)
    body = ",\n  ".join(", ".join(f"{k}: {v}" for k, v in list(K.items())[i:i + 8]) for i in range(0, len(K), 8))
    s = s[:a] + ('\n// Versi EN: Bg = latar dibalik kiri-kanan + zoom 105%; animasi latar 103%\nconst BT = 1.03;\n'
                 'const Bg: React.FC<{ children: React.ReactNode }> = ({ children }) => (\n'
                 '  <AbsoluteFill style={{ transform: "scaleX(-1) scale(1.05)" }}>{children}</AbsoluteFill>\n);\n'
                 f"const K = {{\n  {body},\n") + s[b:]
    # langit/bintang/awan latar: tiap baris berdiri sendiri dibungkus Bg, animasinya 103%
    RX(r"(?m)^(\s*)<(Sky|Stars|Clouds) ([^\n<>]*?)/>[ \t]*$",
       lambda m: f"{m.group(1)}<Bg><{m.group(2)} {m.group(3).replace('t={t}', 't={t * BT}')}/></Bg>")
    # teks tetap seri
    for a_, b_ in [("Ia tak bisa membaca", "He couldn't read"), ("dan menulis…", "or write…"), ("lalu siapa yang", "so who"),
                   ("mengajarinya?", "taught him?"), ("Download sekarang", "Follow for more"), ('"*SIMPAN*"', '"SAVE *THIS"'),
                   ('"*SIMPAN"', '"SAVE *THIS"'), ("QS. Al-'Ankabut: 48", "Al-'Ankabut 29:48"), ("QS. An-Najm: 3–4", "An-Najm 53:3–4")]:
        s = s.replace(a_, b_)
    RX(r'text="TAK PERNAH \| \*MEMBACA \*& \*MENULIS" y=\{(\d+)\} size=\{\d+\}', r'text="NEVER READ, | *NEVER *WROTE" y={\1} size={76}')
    RX(r'id="(?:Engkau|Dan engkau)[^"]*"', 'id="And you did not recite before it any scripture, nor did you inscribe one with your right hand."')
    RX(r'id="[^"]*wahyu[^"]*"', 'id="It is not but a revelation revealed."')
    RX(r"BERIKUTNYA · \d+", f"NEXT · EPISODE {NEXT}")
    m = re.search(r"export const (\w+): React.FC", s)
    name = m.group(1)
    s = s.replace(f"export const {name}: React.FC", f"export const {name}EN: React.FC")
    R("scale: String(interpolate(lt, [0, s.end - s.start], [1, 1.04], clamp)),", "scale: String(interpolate(lt, [0, s.end - s.start], [1.05, 1.005], clamp)),")
    RX(r"rotate: `\$\{\(i % 2 \? -0\.5 : 0\.5\)", "rotate: `${(i % 2 ? 0.45 : -0.45)")
    R("      <Leaks t={t} />\n", '      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,150,80,0.10), rgba(90,40,140,0.08))", '
      'mixBlendMode: "soft-light", pointerEvents: "none" }} />\n      <Leaks t={t} />\n')
    for e in EDITS:
        R(e[0], e[1], e[2] if len(e) > 2 else 1)
    dst = os.path.join(en, "film-remotion", "src")
    open(os.path.join(dst, "Video.tsx"), "w", encoding="utf-8").write(s)
    root = open(os.path.join(proj, "film-remotion", "src", "Root.tsx"), encoding="utf-8").read()
    open(os.path.join(dst, "Root.tsx"), "w", encoding="utf-8").write(re.sub(rf"\b{name}\b", name + "EN", root))
    print(f"komposisi {name}EN · {s.count('<Bg>')} lapisan Bg")
    for x in miss:
        print("TIDAK KENA", x)
    for i, line in enumerate(s.split("\n"), 1):
        if line.strip().startswith("//") or "import" in line:
            continue
        frags = [a or b for a, b in re.findall(r'>([^<>{}]+)<|"([^"]{3,})"', line)]
        bare = line.strip()
        if bare and not bare.startswith(("<", "{", "}", ")", "//")) and "=" not in bare and "(" not in bare and not re.search(r"\w+: [\d.]+", bare):
            frags.append(re.sub(r"<[^>]*>", " ", bare))
        for t in frags:
            t = t.replace("_", " ")
            if re.search(ID_WORDS, t, re.I):
                print(f"SISA? {i}: {t.strip()[:100]}")


def autosfx(proj):
    """Add accent SFX to en/film/timeline.json from the EN Video.tsx: whoosh on every Title onset, thunk on cards/pills,
    riser -> impact + clink at each verse start. Skips spots that already have a similar SFX (run after remap)."""
    en = os.path.join(proj, "en")
    src = open(os.path.join(en, "film-remotion", "src", "Video.tsx"), encoding="utf-8").read()
    K = kmap(os.path.join(en, "film-remotion", "src", "Video.tsx"))
    cues = json.load(open(os.path.join(en, "film-remotion", "public", "cues.json"), encoding="utf-8"))
    S, ay = cues["scenes"], cues.get("ayat", [])

    def ev(expr):
        e = re.sub(r"K\.(\w+)", lambda m: str(K[m.group(1)]), expr)
        e = re.sub(r"S\[(\d+)\]\.(start|end)", lambda m: str(S[int(m.group(1))][m.group(2)]), e)
        e = re.sub(r"\bA(\d)\.(s|e)\b", lambda m: str(ay[int(m.group(1)) - 1][m.group(2)]) if len(ay) >= int(m.group(1)) else "x", e)
        e = e.replace("END", str(S[-1]["start"]))
        try:
            return round(float(eval(e, {"__builtins__": {}})), 3)
        except Exception:
            return None

    p = os.path.join(en, "film", "timeline.json")
    T = json.load(open(p))
    have = T["sfx"]

    def near(t, kinds, d):
        return any(abs(x["t"] - t) < d and x["kind"] in kinds for x in have)

    add = []
    for expr in re.findall(r"<Title t=\{t\} at=\{([^}]+)\}", src):
        t = ev(expr)
        if t is not None and t > 0.5 and not near(t, ("whoosh",), 0.35):
            add.append(dict(t=max(0, t), kind="whoosh", gain=0.06, dur=0.5))
    for comp, g in (("DateCard", 0.06), ("AyahCard", 0.06), ("Pill", 0.04)):
        for expr in re.findall(rf"<{comp} t=\{{t\}} at=\{{([^}}]+)\}}", src):
            t = ev(expr)
            if t is not None and t > 0.5 and not near(t, ("thunk", "klik", "pop"), 0.3):
                add.append(dict(t=t + 0.15, kind="thunk", gain=g))
    for a in ay:
        if not near(a["s"], ("riser",), 1.0):
            add.append(dict(t=round(a["s"] - 1.1, 3), kind="riser", gain=0.04, until=round(a["s"] - 0.05, 3)))
        add += [dict(t=a["s"], kind="impact", gain=0.06), dict(t=a["s"] + 0.01, kind="clink", gain=0.04, pitch=1.6)]
    for x in add:  # no duplicates among the new ones either
        if not any(abs(y["t"] - x["t"]) < 0.2 and y["kind"] == x["kind"] for y in have):
            have.append(x)
    have.sort(key=lambda x: x["t"])
    json.dump(T, open(p, "w"), indent=1)
    print(f"{len(have)} SFX (ditambah otomatis). Tambahkan manual: riser->impact di kata hook, riser sebelum refrein, SFX tema.")


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
    elif a[0] in ("init", "words", "remap", "loudnorm", "tsx", "autosfx") and len(a) == 2:
        {"init": init, "words": words, "remap": remap, "loudnorm": loudnorm, "tsx": tsx, "autosfx": autosfx}[a[0]](a[1].rstrip("/"))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
