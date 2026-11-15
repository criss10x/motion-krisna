"""English narration (Gemini TTS on Vertex) per take + en-US word timestamps. For the English version of a video.
Copied to projects/<topik>/en/voice/ by `tools/en_project.py init`. Set VOCAB and the per-video lines of STYLE, then from
projects/<topik>/en/:
  /usr/bin/python3 -I voice/gen.py      -> take1 + take2 (.wav + .json)
  /usr/bin/python3 -I voice/gen.py 2    -> redo take2 only
Always compare each take's transcript with script.txt: a take can add words ("seventh second century") or skip a line."""
import json, os, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "tools"))
import vertex

HERE = os.path.dirname(os.path.abspath(__file__))
TEXT = open(os.path.join(HERE, "script.txt"), encoding="utf-8").read().strip()
VOICE = "Sadachbia"
# Names the transcriber may mishear. Keep it short: every entry biases recognition.
VOCAB = ["Qur'an"]
STYLE = ("Native English-speaking male narrator, deep, warm and authoritative, like a BBC-style documentary storyteller, for a short vertical video. "
         "Neutral international accent, natural and conversational, never robotic. "
         # --- per video: how to read the hook, the verse translations, the reveal, the refrain ---
         "The opening hook calm and intriguing; the answer to it confident, with a slight smile. "
         "Verse translations read reverently, slower and steady. "
         "Pronounce Qur'an as 'kur-AHN', Surah as 'SOO-rah', barakah as 'BA-ra-kah'. "
         "'He couldn't read or write… so who taught him?' slow, with a pause before 'so', reflective. The closing call to save friendly. "
         "Natural flowing pace, not rushed; short pauses between sentences. Read EVERY sentence, skip nothing.")

bearer = vertex.token()
for take in sys.argv[1:] or ["1", "2"]:
    raw = os.path.join(HERE, f"take{take}.raw")
    vertex.speak(TEXT, raw, bearer, voice=VOICE, style=STYLE)
    wav = os.path.join(HERE, f"take{take}.wav")
    if open(raw, "rb").read(4) == b"RIFF":
        os.replace(raw, wav)
    else:  # Gemini TTS returns raw 24 kHz 16-bit mono PCM
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw, wav], check=True)
        os.remove(raw)
    text, words = vertex.transcribe(wav, bearer, vocabulary=VOCAB, language="en-US")
    json.dump({"text": text, "words": words}, open(os.path.join(HERE, f"take{take}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout.strip()
    print(f"take{take}: {dur}s, {len(words)} words\n{text}\n")
