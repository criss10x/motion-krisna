"""Generate narration takes with Gemini TTS, then transcribe with word timestamps.
Run from pajak-zalim/: python -I voice/gen.py"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "gorengan", "tools"))
import vertex

HERE = os.path.dirname(os.path.abspath(__file__))
TEXT = open(os.path.join(HERE, "script.txt"), encoding="utf-8").read().strip()
STYLE = ("Pria Indonesia, suara dalam dan tegas seperti pengkhotbah muda yang membela rakyat. "
         "Tempo sedang-cepat di awal, melambat dan khidmat saat membaca hadis dan doa Nabi, "
         "lalu menguat penuh harap di akhir. Jeda singkat di setiap tanda elipsis.")

bearer = vertex.token()
for take in sys.argv[1:] or ["1", "2"]:
    raw = os.path.join(HERE, f"take{take}.raw")
    vertex.speak(TEXT, raw, bearer, voice="Sadachbia", style=STYLE)
    wav = os.path.join(HERE, f"take{take}.wav")
    head = open(raw, "rb").read(4)
    if head == b"RIFF":
        os.replace(raw, wav)
    else:  # ponytail: Gemini TTS returns raw 24 kHz 16-bit mono PCM
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw, wav], check=True)
        os.remove(raw)
    text, words = vertex.transcribe(wav, bearer, vocabulary=["ISPA", "karhutla", "Kemenkes", "Kalimantan Tengah"])
    json.dump({"text": text, "words": words}, open(os.path.join(HERE, f"take{take}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout.strip()
    print(f"take{take}: {dur}s, {len(words)} words\n{text}\n")
