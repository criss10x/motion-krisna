"""Narasi multi-suara (narator + karakter) untuk video berdialog.
Tiap segmen di-TTS terpisah dengan suaranya sendiri, dipangkas sunyi di ujung, lalu ditranskrip.
  /usr/bin/python3 -I voice/gen_multi.py gen [take...]     -> voice/seg/<id>-<take>.wav/.json (default take 1 2)
  /usr/bin/python3 -I voice/gen_multi.py build id=take ... -> voice/mix.wav + mix.json (kata diberi "spk")
lalu: /usr/bin/python3 -I voice/tighten.py mix 1.08 0.7  -> narasi.wav/json (kunci "spk" ikut terbawa)"""
import json, os, subprocess, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "tools"))
import vertex

HERE = os.path.dirname(os.path.abspath(__file__))
SEG = os.path.join(HERE, "seg")
VOCAB = ["Al-Ikhlas", "Ar-Rahman", "Ya Rasulullah", "shallallahu 'alaihi wasallam"]
TAIL = " Tempo lincah dan mengalir seperti video pendek. Baca SEMUA kalimat persis seperti tertulis, tanpa menambah atau mengurangi kata."
SPEAKERS = {
    "NARATOR": ("Sadachbia", "Pria Indonesia, suara hangat, akrab, dan berwibawa seperti kakak yang bercerita kisah sahabat Nabi, membuat pendengar terpaku." + TAIL),
    "PRAJURIT": ("Puck", "Pria muda Indonesia, seorang prajurit yang heran dan penasaran, bicara sopan dan hormat, nada bertanya yang hidup." + TAIL),
    "IMAM": ("Algenib", "Pria dewasa Indonesia, suara hangat, tulus, dan lembut, menjawab dengan penuh cinta dan sedikit tersenyum, seperti orang yang sangat menyayangi sesuatu." + TAIL),
}
# (id, pembicara, teks, catatan gaya tambahan)
SEGMENTS = [
    ("n1", "NARATOR", "Kamu spam Al-Ikhlas tiap hari? Ada sahabat yang juga begitu, dan Rasulullah shallallahu 'alaihi wasallam bilang: Allah mencintainya. Dengerin alasannya. "
                      "Rasulullah shallallahu 'alaihi wasallam mengutus seorang sahabat memimpin pasukan. Setiap menjadi imam shalat, ia selalu menutup bacaannya dengan surat Al-Ikhlas. "
                      "Sepulangnya, pasukan itu melapor.",
     "Pembuka 'Kamu spam Al-Ikhlas tiap hari?' santai dan akrab seperti menyapa teman; 'Allah mencintainya.' pelan dan menyentuh; 'Dengerin alasannya.' mengajak."),
    ("p1", "PRAJURIT", "Ya Rasulullah, imam kami selalu menutup bacaannya dengan Al-Ikhlas.", "Melapor dengan hormat, sedikit heran."),
    ("n2", "NARATOR", "Beliau bersabda: \"Tanyakan kepadanya, kenapa ia melakukan itu?\"", "Tenang dan berwibawa."),
    ("p2", "PRAJURIT", "Kenapa kamu selalu menutup dengan Al-Ikhlas?", "Bertanya kepada temannya dengan penasaran dan akrab."),
    ("i1", "IMAM", "Karena surat ini menyebut sifat Ar-Rahman. Dan aku suka membacanya.", "Jawaban sederhana dan tulus; 'Dan aku suka membacanya.' lembut penuh cinta."),
    ("n3", "NARATOR", "Mendengar itu, Rasulullah shallallahu 'alaihi wasallam bersabda: \"Beritahukan kepadanya, Allah mencintainya.\" "
                      "Sifat apa yang ia cintai? Empat ayat: Allah Maha Esa. Tempat meminta segala sesuatu. Tidak beranak dan tidak diperanakkan. Dan tidak ada yang setara dengan-Nya. "
                      "Sahabat itu dicintai Allah karena mencintai surat yang menyebut sifat-Nya. Maka bacalah Al-Ikhlas bukan sekadar hafalan, tapi dengan cinta kepada Allah yang kamu sebut di dalamnya. "
                      "Tulis \"Aku cinta Al-Ikhlas\" di kolom komentar. Simpan, dan bagikan.",
     "'Allah mencintainya.' pelan, haru, menjadi puncak. Empat sifat dibaca khidmat dan mantap. Pelajaran lembut seperti menasihati. 'Simpan, dan bagikan.' ramah."),
]
GAP = {"p1": 0.35, "n2": 0.35, "p2": 0.35, "i1": 0.45, "n3": 0.55}  # jeda sebelum segmen (dtk)
SR = 24000

def trim(src, dst):
    af = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ar", str(SR), "-ac", "1", dst], check=True)

def gen(takes):
    os.makedirs(SEG, exist_ok=True)
    bearer = vertex.token()
    for sid, spk, text, extra in SEGMENTS:
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
            print(f"{sid}-{take} [{spk}/{voice}] {dur:.2f}s: {t}", flush=True)

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
    json.dump({"text": " ".join(w["word"] for w in words), "words": words, "segments": segs},
              open(os.path.join(HERE, "mix.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"mix.wav {t:.2f}s, {len(words)} kata"); [print(s) for s in segs]

if __name__ == "__main__":
    mode, rest = sys.argv[1], sys.argv[2:]
    if mode == "gen":
        gen(rest or ["1", "2"])
    else:
        build(dict(a.split("=") for a in rest))
