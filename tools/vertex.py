"""Vertex AI helpers for narration: Gemini TTS and Gemini Transcribe with word timestamps.

Auth comes from `gcloud auth print-access-token` (the user is already logged in). Models change often:
read the current Google docs before a new film and update the names below if a newer model exists.
"""
import base64
import json
import os
import re
import subprocess
import urllib.error
import urllib.request

def _project():
    """$VERTEX_PROJECT, else the project gcloud is set to (`gcloud config set project ID`)."""
    found = os.environ.get("VERTEX_PROJECT")
    if not found:
        try:
            found = subprocess.run(["gcloud", "config", "get-value", "project"], capture_output=True, text=True).stdout.strip()
        except FileNotFoundError:
            found = ""
    if not found or found == "(unset)":
        raise SystemExit("No Google Cloud project: run `gcloud config set project YOUR_PROJECT_ID` or set VERTEX_PROJECT "
                         "(see the anatomy-film skill's references/setup.md).")
    return found


PROJECT = _project()
LOCATION = os.environ.get("VERTEX_LOCATION", "global")
BASE = f"https://aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/"
TTS_MODEL = os.environ.get("TTS_MODEL", "gemini-3.8-flash-tts")
TRANSCRIBE_MODEL = os.environ.get("TRANSCRIBE_MODEL", "gemini-3.5-transcribe-preview")


def token():
    return subprocess.run(["gcloud", "auth", "print-access-token"], capture_output=True, text=True, check=True).stdout.strip()


def call(model, body, bearer, timeout=300):
    request = urllib.request.Request(BASE + model + ":generateContent", data=json.dumps(body).encode(),
                                     headers={"Authorization": f"Bearer {bearer}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"{model}: HTTP {error.code} {error.read().decode()[:400]}")


def speak(text, out, bearer, voice="Sadachbia", style=""):
    """One TTS call. The style rides on the part as speechMetadata.style; the model reads the text verbatim."""
    part = {"text": text}
    if style:
        part["speechMetadata"] = {"style": style}
    body = {"contents": [{"role": "user", "parts": [part]}],
            "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    data = call(TTS_MODEL, body, bearer)
    inline = data["candidates"][0]["content"]["parts"][0]["inlineData"]
    with open(out, "wb") as handle:
        handle.write(base64.b64decode(inline["data"]))
    return out


def transcribe(path, bearer, vocabulary=(), language="id-ID"):
    """Word timestamps at 0.1 s resolution. Keep the vocabulary short: every entry biases recognition
    (adding "nempel" once turned "punya" into "nempel")."""
    config = {"wordTimestamp": True, "languageCodes": [language]}
    if vocabulary:
        config["customVocabulary"] = list(vocabulary)
    body = {"contents": [{"role": "user", "parts": [{"inlineData": {"mimeType": "audio/wav", "data": base64.b64encode(open(path, "rb").read()).decode()}}]}],
            "generationConfig": {"audioTranscriptionConfig": config}}
    part = call(TRANSCRIBE_MODEL, body, bearer)["candidates"][0]["content"]["parts"][0]
    result = part.get("audioTranscription", {"text": part.get("text", ""), "words": []})
    seconds = lambda value: float(str(value).rstrip("s") or 0)
    return result["text"], [{"word": w["word"], "start": seconds(w["startOffset"]), "end": seconds(w["endOffset"])} for w in result.get("words", [])]


DIGITS = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"]


def spell(n):
    """Indonesian number words, so "103" in a caption matches "seratus tiga" in a transcript."""
    if n < 10:
        return DIGITS[n]
    if n == 10:
        return "sepuluh"
    if n == 11:
        return "sebelas"
    if n < 20:
        return DIGITS[n - 10] + " belas"
    if n < 100:
        return DIGITS[n // 10] + " puluh" + ("" if n % 10 == 0 else " " + DIGITS[n % 10])
    if n < 200:
        return "seratus" + ("" if n == 100 else " " + spell(n - 100))
    if n < 1000:
        return DIGITS[n // 100] + " ratus" + ("" if n % 100 == 0 else " " + spell(n % 100))
    if n < 2000:
        return "seribu" + ("" if n == 1000 else " " + spell(n - 1000))
    if n < 1_000_000:
        return spell(n // 1000) + " ribu" + ("" if n % 1000 == 0 else " " + spell(n % 1000))
    return str(n)


def normalizer(aliases=None):
    """Tokens for matching spoken words to caption words: lower case, aliases (spoken spelling -> caption
    spelling, e.g. "mejikom" -> "magic com"), units, numbers as words, no punctuation."""
    pairs = sorted((aliases or {}).items(), key=lambda kv: -len(kv[0]))

    def norm(text):
        s = text.lower()
        for spoken, shown in pairs:
            s = s.replace(spoken.lower(), shown.lower())
        s = s.replace("°c", " derajat").replace("°", " derajat").replace("enggak", "nggak")
        # Indonesian writes thousands with a dot (1.250) and decimals with a comma (2,5).
        s = re.sub(r"(\d{1,3})\.(\d{3})(?!\d)", r"\1\2", s)
        s = re.sub(r"(\d+)[.,](\d+)", lambda m: f"{spell(int(m.group(1)))} koma {' '.join(DIGITS[int(d)] for d in m.group(2))}", s)
        s = re.sub(r"\d+", lambda m: f" {spell(int(m.group(0)))} ", s)
        return re.sub(r"[^a-z0-9 ]", " ", s).split()

    return norm


def load_script(project):
    path = os.path.join(project, "voice", "script.json")
    return json.load(open(path)), path
