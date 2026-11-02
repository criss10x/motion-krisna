"""CUES final untuk Remotion. Salin ke projects/<topik>/voice/cues.py, isi OPENERS (kata pembuka tiap adegan) dan FIX.
narasi.json = transkrip take terpilih (timestamp 1.0x); narasi.wav = take itu dipercepat SPEED.
Batas adegan = tengah jeda sebelum kata pembuka adegan.
Run dari projects/<topik>/: python -I voice/cues.py  ->  film-remotion/public/cues.json"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
SPEED = 1.12
END_CARD = 3.0
# kata pembuka tiap adegan (urut), dicocokkan berurutan di transkrip
OPENERS = ["Kamu", "Suatu", "Jawaban", "Di", "Kenapa", "Dan tauhid", "Tapi hati-hati", "Lalu apa", "Malam"]  # contoh al-ikhlas
# salah dengar transkrip -> teks naskah, {indeks kata: teks}; mis. {162: 'surga."'}
FIX = {}

words = json.load(open(os.path.join(HERE, "narasi.json"), encoding="utf-8"))["words"]
for w in words:
    w["start"], w["end"] = round(w["start"] / SPEED, 3), round(w["end"] / SPEED, 3)
for i, txt in FIX.items():
    words[i]["word"] = txt

def clean(s):
    return s.strip(",.?!:\"'").lower()

idx, i = [], 0
for op in OPENERS:
    parts = [clean(p) for p in op.split()]
    while [clean(w["word"]) for w in words[i:i + len(parts)]] != parts:
        i += 1
        assert i < len(words), f"pembuka tidak ketemu: {op}"
    idx.append(i)
    i += 1

narr_end = words[-1]["end"]
bounds = [0.0] + [round((words[k - 1]["end"] + words[k]["start"]) / 2, 3) for k in idx[1:]] + [round(narr_end + 0.6, 3)]
scenes = [{"id": n + 1, "start": bounds[n], "end": bounds[n + 1]} for n in range(len(OPENERS))]
scenes.append({"id": len(OPENERS) + 1, "start": bounds[-1], "end": round(bounds[-1] + END_CARD, 3)})
out = {"w": 1080, "h": 1920, "fps": 30, "duration": scenes[-1]["end"], "estimated": False, "scenes": scenes,
       "words": [{"w": w["word"], "s": w["start"], "e": w["end"]} for w in words]}
dst = os.path.join(HERE, "..", "film-remotion", "public", "cues.json")
os.makedirs(os.path.dirname(dst), exist_ok=True)
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for s in scenes:
    print(s)
