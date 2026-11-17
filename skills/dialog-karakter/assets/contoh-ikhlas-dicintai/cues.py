"""CUES final untuk Remotion. Salin ke projects/<topik>/voice/cues.py, isi OPENERS (kata pembuka tiap adegan) dan FIX.
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
# ikhlas-dicintai: 1 hook · 2 kisah · 3 lapor (PRAJURIT) · 4 'tanyakan' · 5 PRAJURIT bertanya · 6 IMAM menjawab · 7 'Allah mencintainya' · 8 4 sifat · 9 pelajaran · 10 CTA
# int = indeks kata langsung (dipakai bila kata pembuka muncul berulang)
OPENERS = [0, 20, 40, 53, 61, 67, 77, 88, 113, 140]
# opsional: batas adegan manual (dtk, setelah SPEED), [0.0, ..., akhir narasi + 0.6]; kosong = pakai OPENERS
BOUNDS = []
# salah dengar transkrip -> teks naskah, {indeks kata: teks}; mis. {162: 'surga."', 29: "Hamba-Ku"}
FIX = {4: 'hari?', 9: 'begitu,', 12: 'ﷺ', 13: '', 14: '', 15: 'bilang:', 21: 'ﷺ', 22: '', 23: '', 32: 'shalat,', 44: '"Ya', 52: 'Al-Ikhlas."', 54: 'bersabda:', 55: '"Tanyakan', 60: 'itu?"', 61: '"Kenapa', 66: 'Al-Ikhlas?"', 67: '"Karena', 72: 'Ar-Rahman.', 73: 'Dan', 76: 'membacanya."', 80: 'ﷺ', 81: '', 82: '', 83: 'bersabda:', 84: '"Beritahukan', 87: 'mencintainya."', 94: 'ayat:', 97: 'Esa.', 98: 'Tempat', 101: 'sesuatu.', 102: 'Tidak', 106: 'diperanakkan.', 107: 'Dan', 112: 'dengan-Nya.', 122: 'sifat-Nya.', 125: 'Al-Ikhlas', 126: '', 141: '"Aku', 143: 'Al-Ikhlas"', 144: '', 148: 'Simpan,'}
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
