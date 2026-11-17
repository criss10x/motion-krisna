"""CUES final untuk Remotion, versi DIALOG (skill dialog-karakter). Sama dengan templates/cues.py, ditambah:
- OPENERS boleh berisi int = indeks kata langsung (kata pembuka yang muncul berulang, mis. "Rasulullah");
- kata dari mix.json yang punya kunci "spk" ditulis dengan "k" (pembicara), plus array "speech" = run pembicara {spk, s, e}.
Cari indeks kata: /usr/bin/python3 -I -c "import json;[print(i,w.get('spk',''),w['word']) for i,w in enumerate(json.load(open('voice/narasi.json'))['words'])]"
Salin ke projects/<topik>/voice/cues.py, isi OPENERS (kata pembuka tiap adegan) dan FIX.
narasi.json = transkrip take terpilih; narasi.wav = take itu dipercepat SPEED.
Pakai tighten.py? Timestamp narasi.json sudah final -> SPEED = 1.0.
Batas adegan = tengah jeda sebelum kata pembuka adegan. Adegan yang dibuka bacaan Arab (tidak ada di transkrip)?
Isi BOUNDS manual dari silencedetect, OPENERS diabaikan:
  ffmpeg -i voice/narasi.wav -af silencedetect=n=-38dB:d=0.18 -f null - 2>&1 | grep silence_
Run dari projects/<topik>/: /usr/bin/python3 -I voice/cues.py  ->  film-remotion/public/cues.json"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
SPEED = 1.0
END_CARD = 3.0
# kata pembuka tiap adegan (urut), dicocokkan berurutan di transkrip
# int = indeks kata langsung (dipakai bila kata pembuka muncul berulang)
OPENERS = ["Kamu", 20, 40, "Beliau"]  # teks dicocokkan berurutan; int bila kata pembuka sudah muncul lebih awal (mis. "Rasulullah" juga ada di hook). ikhlas-dicintai: [0, 20, 40, 53, 61, 67, 77, 88, 113, 140]
# opsional: batas adegan manual (dtk, setelah SPEED), [0.0, ..., akhir narasi + 0.6]; kosong = pakai OPENERS
BOUNDS = []
# salah dengar transkrip -> teks naskah, {indeks kata: teks}; mis. {162: 'surga."', 29: "Hamba-Ku"}
FIX = {}  # mis. {12: 'ﷺ', 13: '', 14: ''} untuk "shallallahu 'alaihi wasallam" (3 kata transkrip -> 1 simbol)
# opsional: data tambahan untuk Video.tsx, mis. {"ayat": [{"s": 13.46, "e": 16.10, "ar": "...", "lat": "...", "no": 2}]}
# (bacaan Arab tidak ditranskrip; ambil s/e dari silencedetect)
EXTRA = {}

words = json.load(open(os.path.join(HERE, "narasi.json"), encoding="utf-8"))["words"]
for w in words:
    w["start"], w["end"] = round(w["start"] / SPEED, 3), round(w["end"] / SPEED, 3)
for i, txt in FIX.items():
    words[i]["word"] = txt

def clean(s):
    return s.strip(",.?!:\"'…").lower()

if BOUNDS:
    bounds = list(BOUNDS)
else:
    idx, i = [], 0
    for op in OPENERS:
        if isinstance(op, int):
            idx.append(op); i = op + 1
            continue
        parts = [clean(p) for p in op.split()]
        while [clean(w["word"]) for w in words[i:i + len(parts)]] != parts:
            i += 1
            assert i < len(words), f"pembuka tidak ketemu: {op}"
        idx.append(i)
        i += 1
    narr_end = words[-1]["end"]
    bounds = [0.0] + [round((words[k - 1]["end"] + words[k]["start"]) / 2, 3) for k in idx[1:]] + [round(narr_end + 0.6, 3)]
scenes = [{"id": n + 1, "start": bounds[n], "end": bounds[n + 1]} for n in range(len(bounds) - 1)]
scenes.append({"id": len(scenes) + 1, "start": bounds[-1], "end": round(bounds[-1] + END_CARD, 3)})
out = {"w": 1080, "h": 1920, "fps": 30, "duration": scenes[-1]["end"], "estimated": False, "scenes": scenes, **EXTRA,
       "words": [{"w": w["word"], "s": w["start"], "e": w["end"], **({"k": w["spk"]} if "spk" in w else {})} for w in words]}
if any("spk" in w for w in words):
    runs = []
    for w in words:
        if runs and runs[-1]["spk"] == w["spk"]:
            runs[-1]["e"] = w["end"]
        else:
            runs.append({"spk": w["spk"], "s": w["start"], "e": w["end"]})
    out["speech"] = runs
dst = os.path.join(HERE, "..", "film-remotion", "public", "cues.json")
os.makedirs(os.path.dirname(dst), exist_ok=True)
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for s in scenes:
    print(s)
