"""Generate narration takes with Gemini TTS, then transcribe with word timestamps.
Run from projects/al-ikhlas/: python -I voice/gen.py [take ...]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "tools"))
import vertex

HERE = os.path.dirname(os.path.abspath(__file__))
TEXT = open(os.path.join(HERE, "script.txt"), encoding="utf-8").read().strip()
STYLE = ("Perempuan Indonesia, suara hangat dan lembut seperti ustadzah muda yang bercerita, tapi tempo CEPAT dan mengalir "
         "seperti storyteller video pendek yang membuat penonton terpaku. Jeda singkat saja di elipsis. "
         "Bagian kisah dibacakan menegangkan dan penuh rasa penasaran; melambat sedikit dan khidmat hanya saat "
         "'Qul huwallaahu ahad' dan 'Allah mencintainya'; ajakan akhir hangat.")

bearer = vertex.token()
for take in sys.argv[1:] or ["1", "2"]:
    raw = os.path.join(HERE, f"take{take}.raw")
    vertex.speak(TEXT, raw, bearer, voice="Sulafat", style=STYLE)
    wav = os.path.join(HERE, f"take{take}.wav")
    if open(raw, "rb").read(4) == b"RIFF":
        os.replace(raw, wav)
    else:  # ponytail: Gemini TTS returns raw 24 kHz 16-bit mono PCM
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw, wav], check=True)
        os.remove(raw)
    text, words = vertex.transcribe(wav, bearer, vocabulary=["Al-Qur'an", "Rasulullah", "Qul huwallahu ahad", "Ar-Rahman", "Al-Ikhlas", "tauhid", "khatam"])
    json.dump({"text": text, "words": words}, open(os.path.join(HERE, f"take{take}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout.strip()
    print(f"take{take}: {dur}s, {len(words)} words\n{text}\n", flush=True)
