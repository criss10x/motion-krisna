"""Narasi Gemini TTS (Vertex) per take + transkrip timestamp per kata.
Salin ke projects/<topik>/voice/, atur VOICE, STYLE, VOCAB, lalu dari projects/<topik>/:
  /usr/bin/python3 -I voice/gen.py      -> take1 + take2 (.wav + .json)
  /usr/bin/python3 -I voice/gen.py 2    -> ulangi take2 saja"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "tools"))
import vertex

HERE = os.path.dirname(os.path.abspath(__file__))
TEXT = open(os.path.join(HERE, "script.txt"), encoding="utf-8").read().strip()
VOICE = "Sadachbia"  # pria (klasik); "Sulafat" = perempuan lembut (neon)
# istilah/nama yang sering salah dengar di transkrip, mis. ["Bukhari", "Ar-Rum"]; jaga tetap pendek (tiap entri membiaskan transkrip)
VOCAB = []
STYLE = ("Pria Indonesia, suara dalam dan tegas seperti pengkhotbah muda yang membela rakyat. "
         "Tempo sedang-cepat di awal, melambat dan khidmat saat membaca hadis dan doa Nabi, "
         "lalu menguat penuh harap di akhir. Jeda singkat di setiap tanda elipsis.")

bearer = vertex.token()
for take in sys.argv[1:] or ["1", "2"]:
    raw = os.path.join(HERE, f"take{take}.raw")
    vertex.speak(TEXT, raw, bearer, voice=VOICE, style=STYLE)
    wav = os.path.join(HERE, f"take{take}.wav")
    head = open(raw, "rb").read(4)
    if head == b"RIFF":
        os.replace(raw, wav)
    else:  # ponytail: Gemini TTS returns raw 24 kHz 16-bit mono PCM
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw, wav], check=True)
        os.remove(raw)
    text, words = vertex.transcribe(wav, bearer, vocabulary=VOCAB)
    json.dump({"text": text, "words": words}, open(os.path.join(HERE, f"take{take}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout.strip()
    print(f"take{take}: {dur}s, {len(words)} words\n{text}\n")
