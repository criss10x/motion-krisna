"""Narasi MULTI-SUARA (narator + karakter) untuk video berdialog, skill dialog-karakter.
Tiap segmen di-TTS terpisah dengan suaranya sendiri, sunyi di ujungnya dipangkas, lalu ditranskrip.
Salin ke projects/<topik>/voice/gen_multi.py, isi blok "ISI PER VIDEO", lalu dari projects/<topik>/:
  /usr/bin/python3 -I voice/gen_multi.py gen                 # 2 take tiap segmen -> voice/seg/<id>-<take>.wav/.json
  /usr/bin/python3 -I voice/gen_multi.py gen 3 n1            # ulang: take 3 untuk segmen n1 saja (angka = take, teks = id)
  /usr/bin/python3 -I voice/gen_multi.py cek                 # bandingkan transkrip tiap take dengan teks naskah
  /usr/bin/python3 -I voice/gen_multi.py build n1=2 p1=1 ... # gabung take pilihan -> voice/mix.wav + mix.json (kata diberi "spk")
  /usr/bin/python3 -I voice/gen_multi.py sampel              # potongan bagian dialog (tempo 1.08) -> shots/sampel-dialog.m4a
lalu: /usr/bin/python3 -I voice/tighten.py mix 1.08 0.7      # -> narasi.wav/json (kunci "spk"/"seg" ikut terbawa)
Contoh terisi: skills/dialog-karakter/assets/contoh-ikhlas-dicintai/gen_multi.py"""
import difflib, json, os, re, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SEG = os.path.join(HERE, "seg")
SR = 24000
TEMPO = 1.08  # hanya untuk sampel; tempo final diatur tighten.py

# ======================= ISI PER VIDEO =======================
VOCAB = ["shallallahu 'alaihi wasallam", "Ya Rasulullah"]  # + nama surat/istilah Arab yang muncul
TAIL = " Tempo lincah dan mengalir seperti video pendek. Baca SEMUA kalimat persis seperti tertulis, tanpa menambah atau mengurangi kata."
# pembicara -> (suara Gemini TTS, gaya). Rasulullah ﷺ TIDAK PERNAH jadi pembicara: sabdanya dibacakan NARATOR.
SPEAKERS = {
    "NARATOR": ("Sadachbia", "Pria Indonesia, suara hangat, akrab, dan berwibawa seperti kakak yang bercerita kisah sahabat Nabi, membuat pendengar terpaku." + TAIL),
    "TOKOH1": ("Puck", "Pria muda Indonesia, heran dan penasaran, bicara sopan dan hormat, nada bertanya yang hidup." + TAIL),
    "TOKOH2": ("Algenib", "Pria dewasa Indonesia, suara hangat, tulus, dan lembut, menjawab dengan penuh cinta." + TAIL),
}
# (id, pembicara, teks persis naskah, catatan gaya khusus segmen). Urutan = urutan di video.
# Segmen narator boleh panjang; kalimat karakter pendek (<= ±12 kata) supaya muat di balon 2–3 baris.
SEGMENTS = [
    ("n1", "NARATOR", "Hook ... kisah ... Sepulangnya, pasukan itu melapor.", "Pembuka santai seperti menyapa teman."),
    ("p1", "TOKOH1", "Ya Rasulullah, ...", "Melapor dengan hormat, sedikit heran."),
    ("n2", "NARATOR", "Beliau bersabda: \"...\"", "Tenang dan berwibawa."),
    ("i1", "TOKOH2", "Karena ...", "Jawaban sederhana dan tulus."),
    ("n3", "NARATOR", "... pelajaran ... Tulis \"...\" di kolom komentar. Simpan, dan bagikan.", "Puncak pelan dan haru; CTA ramah."),
]
GAP = {"p1": 0.35, "n2": 0.35, "i1": 0.45, "n3": 0.55}  # jeda sebelum segmen (dtk); pergantian pembicara 0,35–0,55
# ===================== AKHIR ISI PER VIDEO =====================


def trim(src, dst):
    af = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
          "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ar", str(SR), "-ac", "1", dst], check=True)


def norm(s):
    s = s.lower().replace("shallallahu 'alaihi wasallam", "saw").replace("sallallahu alaihi wasallam", "saw")
    s = re.sub(r"\b(al|ar|as|an|ash|asy)[\s-]+", r"\1", s).replace("-", "").replace("sh", "s").replace("'", "")  # ejaan: Al-Ikhlas/Al Ikhlas, shalat/salat
    return re.findall(r"[a-z0-9]+", s)


def diff(text, heard):
    """kata naskah yang hilang/berubah di transkrip (transkrip sendiri bisa salah dengar, jadi dengarkan dulu sebelum membuang take)"""
    a, b = norm(text), norm(heard)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    out = [f"{' '.join(a[i1:i2]) or '∅'} → {' '.join(b[j1:j2]) or '∅'}" for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
    return sm.ratio(), out


def gen(takes, only):
    sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "tools"))
    import vertex
    os.makedirs(SEG, exist_ok=True)
    bearer = vertex.token()
    for sid, spk, text, extra in SEGMENTS:
        if only and sid not in only:
            continue
        voice, style = SPEAKERS[spk]
        for take in takes:
            raw = os.path.join(SEG, f"{sid}-{take}.raw")
            vertex.speak(text, raw, bearer, voice=voice, style=extra + " " + style)
            pre = os.path.join(SEG, f"{sid}-{take}.pre.wav")
            if open(raw, "rb").read(4) == b"RIFF":
                os.replace(raw, pre)
            else:
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw, pre], check=True)
                os.remove(raw)
            wav = os.path.join(SEG, f"{sid}-{take}.wav")
            trim(pre, wav); os.remove(pre)
            t, words = vertex.transcribe(wav, bearer, vocabulary=VOCAB)
            json.dump({"text": t, "words": words}, open(wav[:-4] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            with wave.open(wav) as f:
                dur = f.getnframes() / f.getframerate()
            r, d = diff(text, t)
            print(f"{sid}-{take} [{spk}/{voice}] {dur:.2f}s cocok {r:.0%}: {t}" + (f"\n   beda: {'; '.join(d)}" if d else ""), flush=True)


def cek():
    for sid, spk, text, _ in SEGMENTS:
        for fn in sorted(os.listdir(SEG)):
            m = re.fullmatch(rf"{re.escape(sid)}-(\w+)\.json", fn)
            if not m:
                continue
            d = json.load(open(os.path.join(SEG, fn), encoding="utf-8"))
            with wave.open(os.path.join(SEG, fn[:-5] + ".wav")) as f:
                dur = f.getnframes() / f.getframerate()
            r, out = diff(text, d["text"])
            print(f"{sid}-{m.group(1)} [{spk}] {dur:.2f}s cocok {r:.0%}" + (f"  beda: {'; '.join(out)}" if out else ""))


def build(choice):
    pcm, words, segs, t = [], [], [], 0.0
    for sid, spk, _, _ in SEGMENTS:
        take = choice.get(sid, "1")
        gap = GAP.get(sid, 0.0)
        if gap:
            pcm.append(np.zeros(int(gap * SR), np.int16)); t += gap
        with wave.open(os.path.join(SEG, f"{sid}-{take}.wav")) as f:
            a = np.frombuffer(f.readframes(f.getnframes()), np.int16)
        d = json.load(open(os.path.join(SEG, f"{sid}-{take}.json"), encoding="utf-8"))
        for w in d["words"]:
            words.append({"word": w["word"], "start": round(t + w["start"], 3), "end": round(t + w["end"], 3), "spk": spk, "seg": sid})
        segs.append({"id": sid, "spk": spk, "take": take, "start": round(t, 3), "end": round(t + len(a) / SR, 3)})
        pcm.append(a); t += len(a) / SR
    with wave.open(os.path.join(HERE, "mix.wav"), "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(np.concatenate(pcm).tobytes())
    # catatan: "segments" memakai waktu SEBELUM tighten; setelah tighten pakai kunci "spk" per kata (cues.json "speech")
    json.dump({"text": " ".join(w["word"] for w in words), "words": words, "segments": segs},
              open(os.path.join(HERE, "mix.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"mix.wav {t:.2f}s, {len(words)} kata")
    for s in segs:
        print(s)


def sampel():
    """bagian dialog saja (2 dtk sebelum karakter pertama s/d 2 dtk sesudah karakter terakhir), dipercepat TEMPO"""
    segs = json.load(open(os.path.join(HERE, "mix.json"), encoding="utf-8"))["segments"]
    ch = [s for s in segs if s["spk"] != "NARATOR"]
    a, b = max(0.0, ch[0]["start"] - 2.0), ch[-1]["end"] + 2.0
    dst = os.path.join(HERE, "..", "shots", "sampel-dialog.m4a")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{a:.2f}", "-to", f"{b:.2f}", "-i", os.path.join(HERE, "mix.wav"),
                    "-af", f"atempo={TEMPO},loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "128k", dst], check=True)
    print(f"{os.path.normpath(dst)}: {a:.1f}–{b:.1f}s mix (±{(b - a) / TEMPO:.0f}s setelah tempo)")


if __name__ == "__main__":
    mode, rest = (sys.argv[1], sys.argv[2:]) if len(sys.argv) > 1 else ("help", [])
    if mode == "gen":
        takes = [x for x in rest if x.isdigit()] or ["1", "2"]
        gen(takes, {x for x in rest if not x.isdigit()})
    elif mode == "cek":
        cek()
    elif mode == "build":
        build(dict(a.split("=") for a in rest))
    elif mode == "sampel":
        sampel()
    else:
        print(__doc__)
