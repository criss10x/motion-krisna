import json, subprocess, wave
from faster_whisper import WhisperModel
GAP, LEAD, END = 0.35, 0.1, 3.0
KW = [["kurus","kecuali"],["dua|12","turun"],["masuk","kepakai","turun"],["kenyang","tiga"],
      ["camilan","puding","buah"],["puasa","mirip","buka","kalap|kalah"],["setengah","nasinya"],
      ["direndam","satu","air","dokter|dr"],["plus","worth|work"],["safiya","lima|500","seratus|100","halal|halau","keranjang"]]
m = WhisperModel("base", device="cpu", compute_type="int8")
scenes, t, files = [], LEAD, []
for i in range(1, 11):
    f = f"audio/t{i:02d}.wav"
    with wave.open(f) as w: d = w.getnframes() / w.getframerate()
    segs, _ = m.transcribe(f, language="id", word_timestamps=True)
    words = [(x.word.strip().lower().strip(".,!?:"), round(t + x.start, 2)) for s in segs for x in s.words]
    kws = []
    for k in KW[i-1]:
        hit = next((wt for w, wt in words if any(a in w for a in k.split("|")) and wt not in [x["t"] for x in kws]), None)
        kws.append({"word": k.split("|")[0], "t": hit, "est": hit is None})
    print(i, " ".join(w for w, _ in words))
    end = t + d + (GAP if i < 10 else 0)
    scenes.append({"id": i, "start": round(t if i > 1 else 0, 2), "end": round(end, 2), "voice": round(t, 2), "keywords": kws})
    files.append((f, t)); t = end
scenes.append({"id": 11, "start": round(t, 2), "end": round(t + END, 2), "keywords": []})
cues = {"w": 1080, "h": 1920, "fps": 30, "duration": round(t + END, 2), "estimated": False, "music": False, "sfx": "halus", "scenes": scenes}
json.dump(cues, open("cues.json", "w"), indent=1)
# narasi: tiap klip diletakkan di detik mulainya
inp = sum([["-i", f] for f, _ in files], [])
flt = "".join(f"[{k}]adelay={int(s*1000)}:all=1[a{k}];" for k, (_, s) in enumerate(files))
flt += "".join(f"[a{k}]" for k in range(len(files))) + f"amix=inputs={len(files)}:normalize=0,apad=whole_dur={t+END}[o]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inp, "-filter_complex", flt, "-map", "[o]", "narasi.wav"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "narasi.wav", "-b:a", "192k", "narasi.mp3"], check=True)
print("duration", cues["duration"])
