# Subtitle per kata dari naskah (tts_gemini.py LINES) + timing klip audio (cues.json "voice", audio/tNN.wav).
# Hasil: const SUBS = [...] disuntik ke preview.html di baris yang diawali "const SUBS =".
import ast, json, re, wave

# ejaan TTS -> ejaan layar (frasa, huruf kecil tanpa tanda baca)
DISPLAY = {"hape": "HP", "be-pe-o-em": "BPOM", "dua ribu dua puluh lima": "2025", "tiga puluh": "30",
           "empat minggu": "4 minggu", "lima ratus": "500", "seratus persen": "100%", "tujuh belas": "17",
           "satu sendok": "1 sendok", "enam jam": "6 jam", "dua belas": "12"}
MAX_W, MAX_C = 5, 28  # kata & huruf per potongan
norm = lambda x: re.sub(r"[^\w-]", "", x).lower()

src = open("tts_gemini.py", encoding="utf-8").read()
lines = ast.literal_eval(re.search(r"LINES = (\[.*?\])\n", src, re.S).group(1))
cues = json.load(open("cues.json"))
subs = []
for i, (line, sc) in enumerate(zip(lines, cues["scenes"]), 1):
    with wave.open(f"audio/t{i:02d}.wav") as w:
        dur = w.getnframes() / w.getframerate()
    t0 = sc["voice"]
    toks, words, weights, k = line.split(), [], [], 0
    while k < len(toks):  # gabungkan frasa angka; bobot tetap dari bentuk ucapannya
        for n in (5, 4, 3, 2, 1):
            if " ".join(norm(x) for x in toks[k:k + n]) in DISPLAY:
                words.append(DISPLAY[" ".join(norm(x) for x in toks[k:k + n])] + re.sub(r"[\w-]", "", toks[k + n - 1]))
                weights.append(sum(len(x) + 2 for x in toks[k:k + n])); k += n
                break
        else:
            words.append(toks[k]); weights.append(len(toks[k]) + 2); k += 1
    # ponytail: waktu kata dibagi proporsional panjang ucapan dalam klip (±0,2 dtk); pakai cap waktu ASR bila perlu presisi
    total, acc, timed = sum(weights), 0, []
    for x, wgt in zip(words, weights):
        timed.append({"w": x, "t": round(t0 + dur * acc / total, 2)})
        acc += wgt
    chunk = []
    for j, item in enumerate(timed):
        chunk.append(item)
        text = " ".join(c["w"] for c in chunk)
        if item["w"][-1] in ".,:?!" or len(chunk) >= MAX_W or len(text) >= MAX_C - 6 or j == len(timed) - 1:
            subs.append({"t0": chunk[0]["t"], "words": chunk})
            chunk = []
    subs[-1]["t1"] = round(t0 + dur + 0.15, 2)
for a, b in zip(subs, subs[1:]):
    a.setdefault("t1", b["t0"])
html = open("preview.html", encoding="utf-8").read()
new = "const SUBS = " + json.dumps(subs, ensure_ascii=False, separators=(",", ":")) + ";"
html, n = re.subn(r"^const SUBS = .*$", lambda m: new, html, count=1, flags=re.M)
assert n == 1, "baris 'const SUBS = ...;' tidak ada di preview.html"
open("preview.html", "w", encoding="utf-8").write(html)
print(len(subs), "potongan;", max(len(" ".join(x["w"] for x in s["words"])) for s in subs), "huruf maks")
